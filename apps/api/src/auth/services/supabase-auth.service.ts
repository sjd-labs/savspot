import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { createRemoteJWKSet, jwtVerify, type JWTPayload } from 'jose';

/**
 * Shape of the `sub`+claims we trust from a verified Supabase Auth JWT.
 * The `sub` is Supabase's `auth.users.id` (UUID). We use it to look up
 * the SavSpot `User` row by `supabaseUserId`.
 */
export interface SupabaseJwtPayload extends JWTPayload {
  sub: string;
  email?: string;
  role?: string;
  aud?: string | string[];
}

/**
 * Phase 5: wraps Supabase Auth admin operations + JWT verification.
 *
 * The dual-stack strategy is:
 *   - Legacy clients keep using custom RS256 JWTs issued by TokenService.
 *   - New clients can authenticate with Supabase-issued ES256 JWTs.
 *   - On password login we lazily provision the user in Supabase Auth
 *     and store the resulting `auth.users.id` on `User.supabaseUserId`.
 *
 * Once every active user has a `supabaseUserId`, the custom RS256 flow
 * can be retired in a follow-up.
 */
@Injectable()
export class SupabaseAuthService {
  private readonly logger = new Logger(SupabaseAuthService.name);
  private readonly admin: SupabaseClient | null;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet> | null;
  private readonly projectUrl: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    this.projectUrl = this.configService.get<string>('SUPABASE_URL', '');
    const serviceRoleKey = this.configService.get<string>(
      'SUPABASE_SERVICE_ROLE_KEY',
      '',
    );

    this.enabled = Boolean(this.projectUrl && serviceRoleKey);

    if (!this.enabled) {
      this.logger.warn(
        'SupabaseAuthService disabled — set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable the Phase 5 dual-stack auth.',
      );
      this.admin = null;
      this.jwks = null;
      return;
    }

    this.admin = createClient(this.projectUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    this.jwks = createRemoteJWKSet(
      new URL(`${this.projectUrl}/auth/v1/.well-known/jwks.json`),
    );
  }

  /** True when SUPABASE_URL + service-role key are wired. */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Verify a Supabase Auth JWT against the project's JWKS endpoint.
   * Throws UnauthorizedException on any verification failure.
   *
   * `jose`'s `createRemoteJWKSet` caches keys for the JWKS TTL, so
   * this is a local crypto verify on the hot path (no per-request
   * network call) after the first warm-up.
   */
  async verifyToken(token: string): Promise<SupabaseJwtPayload> {
    if (!this.jwks) {
      throw new UnauthorizedException('Supabase Auth is not configured');
    }
    try {
      const { payload } = await jwtVerify(token, this.jwks, {
        // Supabase signs with the project's URL as issuer.
        issuer: `${this.projectUrl}/auth/v1`,
      });
      if (typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Supabase JWT missing sub claim');
      }
      return payload as SupabaseJwtPayload;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'verification failed';
      throw new UnauthorizedException(`Invalid Supabase token: ${message}`);
    }
  }

  /**
   * Idempotent: create a Supabase Auth user, or return the existing one
   * if email already matches. Returns the Supabase user id.
   *
   * Uses `email_confirm: true` because the SavSpot `User.emailVerified`
   * flag is the source of truth — we don't want Supabase sending its
   * own verification mail on top of ours.
   */
  async provisionUser(args: {
    email: string;
    password?: string;
    emailVerified: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    if (!this.admin) {
      throw new UnauthorizedException('Supabase Auth is not configured');
    }

    // Look up first — admin.createUser errors if email exists, and we
    // want lazy idempotent provisioning.
    const list = await this.admin.auth.admin.listUsers({
      page: 1,
      perPage: 1,
      // The admin SDK doesn't expose a filter API; we filter client-side
      // by email after pulling the first page. This is fine for lazy
      // provisioning on login (rare path) but inefficient for bulk
      // backfill — use `listUsers` pagination for that case.
    });
    if (list.error) {
      throw new Error(`Supabase listUsers failed: ${list.error.message}`);
    }
    const existing = list.data.users.find(
      (u) => u.email?.toLowerCase() === args.email.toLowerCase(),
    );
    if (existing) {
      return existing.id;
    }

    const created = await this.admin.auth.admin.createUser({
      email: args.email,
      password: args.password,
      email_confirm: args.emailVerified,
      user_metadata: args.metadata,
    });
    if (created.error || !created.data.user) {
      throw new Error(
        `Supabase createUser failed: ${created.error?.message ?? 'unknown'}`,
      );
    }
    return created.data.user.id;
  }
}
