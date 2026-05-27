import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';
import { TokenService, JwtPayload } from '../services/token.service';
import { SupabaseAuthService } from '../services/supabase-auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import * as jwt from 'jsonwebtoken';

/**
 * Dual-stack JWT validator for the Phase 5 Supabase Auth migration.
 *
 * Accepts:
 *   1. Custom RS256 JWTs issued by TokenService (legacy path —
 *      cookie `savspot_access` or Bearer header).
 *   2. Supabase Auth ES256 JWTs verified against the project's
 *      JWKS endpoint, looked up to a SavSpot user by
 *      `User.supabaseUserId`.
 *
 * We pick which validator to run by peeking at the JWT header's
 * `alg`: RS256 → custom flow; ES256 → Supabase flow.
 *
 * The strategy is named `jwt` so it slots into the existing
 * `@UseGuards(AuthGuard('jwt'))` callers without changes. We use
 * `passport-custom` instead of `passport-jwt` so we can branch
 * the verification logic ourselves.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(
    private readonly tokenService: TokenService,
    private readonly supabaseAuth: SupabaseAuthService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async validate(req: Request): Promise<JwtPayload & { jti?: string }> {
    const token = this.extractToken(req);
    if (!token) {
      throw new UnauthorizedException('No bearer token provided');
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded || typeof decoded !== 'object') {
      throw new UnauthorizedException('Malformed token');
    }

    const alg = decoded.header?.alg;

    // ES256 → Supabase Auth path
    if (alg === 'ES256' && this.supabaseAuth.isEnabled()) {
      return this.validateSupabase(token);
    }

    // Default to the existing custom RS256 path.
    return this.validateCustom(token);
  }

  // ---------------------------------------------------------------------
  // Token extraction (cookie or Authorization: Bearer header)
  // ---------------------------------------------------------------------
  private extractToken(req: Request): string | null {
    const cookieToken = (req?.cookies as Record<string, string> | undefined)?.[
      'savspot_access'
    ];
    if (cookieToken) return cookieToken;

    const header = req.headers?.authorization;
    if (header && header.toLowerCase().startsWith('bearer ')) {
      return header.slice(7);
    }
    return null;
  }

  // ---------------------------------------------------------------------
  // Custom RS256 (legacy)
  // ---------------------------------------------------------------------
  private async validateCustom(
    token: string,
  ): Promise<JwtPayload & { jti: string }> {
    let payload: (JwtPayload & { jti: string; type?: string }) | null;
    try {
      payload = jwt.verify(token, this.tokenService.getPublicKey(), {
        algorithms: ['RS256'],
      }) as JwtPayload & { jti: string; type?: string };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'verification failed';
      throw new UnauthorizedException(`Invalid token: ${message}`);
    }

    if (payload.type === 'refresh') {
      throw new UnauthorizedException(
        'Refresh tokens cannot be used for authentication',
      );
    }
    const blacklisted = await this.tokenService.isBlacklisted(payload.jti);
    if (blacklisted) {
      throw new UnauthorizedException('Token has been revoked');
    }
    return payload;
  }

  // ---------------------------------------------------------------------
  // Supabase ES256 (Phase 5)
  // ---------------------------------------------------------------------
  private async validateSupabase(token: string): Promise<JwtPayload> {
    const claims = await this.supabaseAuth.verifyToken(token);

    const user = await this.prisma.user.findUnique({
      where: { supabaseUserId: claims.sub },
      select: {
        id: true,
        email: true,
        role: true,
        memberships: { select: { tenantId: true, role: true } },
      },
    });

    if (!user) {
      // The Supabase user exists but isn't linked to a SavSpot row yet.
      // This shouldn't happen on the happy path (login provisions the
      // link), but it can happen if someone signs up directly through
      // Supabase Auth without going through our /auth/register endpoint.
      throw new UnauthorizedException(
        'Supabase user is not linked to a SavSpot account',
      );
    }

    // Mirror the RS256 login path: when the user has exactly one tenant
    // membership, embed it so tenant-scoped routes that fall back to the
    // JWT `tenantId` (rather than a `:tenantId` route param) keep working.
    const membership =
      user.memberships.length === 1 ? user.memberships[0] : undefined;

    return {
      sub: user.id,
      email: user.email,
      platformRole: user.role,
      tenantId: membership?.tenantId,
      tenantRole: membership?.role,
    };
  }
}
