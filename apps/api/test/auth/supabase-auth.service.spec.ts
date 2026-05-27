import { describe, it, expect, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';
import { SupabaseAuthService } from '@/auth/services/supabase-auth.service';

// We stub @supabase/supabase-js and jose at module level so the service
// constructs without needing real network access. Each test wires its
// own behavior via the mocks.

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      admin: {
        listUsers: vi.fn(),
        createUser: vi.fn(),
        generateLink: vi.fn(),
      },
      verifyOtp: vi.fn(),
      refreshSession: vi.fn(),
    },
  })),
}));

// Config stub for a fully-wired Supabase service (URL + service-role key).
const enabledGet = (key: string, def?: unknown) => {
  if (key === 'SUPABASE_URL') return 'https://proj.supabase.co';
  if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-sr-key';
  return def ?? '';
};

/**
 * Construct an enabled service and return both it and the mocked admin
 * client instance it captured (so a test can program generateLink /
 * verifyOtp / refreshSession behavior). The createClient mock returns a
 * fresh client per construction, so we grab the most recent result.
 */
async function makeEnabledService(
  get: (key: string, def?: unknown) => unknown = enabledGet,
) {
  const { createClient } = await import('@supabase/supabase-js');
  const service = new SupabaseAuthService({ get } as never);
  const admin = vi.mocked(createClient).mock.results.at(-1)!.value as {
    auth: {
      admin: { generateLink: ReturnType<typeof vi.fn> };
      verifyOtp: ReturnType<typeof vi.fn>;
      refreshSession: ReturnType<typeof vi.fn>;
    };
  };
  return { service, admin };
}

vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'fake-jwks'),
  jwtVerify: vi.fn(),
}));

describe('SupabaseAuthService', () => {
  describe('isEnabled', () => {
    it('returns false when SUPABASE_URL or service-role key is missing', () => {
      const service = new SupabaseAuthService({
        get: (_key: string, def?: unknown) => def ?? '',
      } as never);
      expect(service.isEnabled()).toBe(false);
    });

    it('returns true when both env vars are set', () => {
      const service = new SupabaseAuthService({
        get: (key: string) => {
          if (key === 'SUPABASE_URL') return 'https://proj.supabase.co';
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-sr-key';
          return '';
        },
      } as never);
      expect(service.isEnabled()).toBe(true);
    });
  });

  describe('verifyToken', () => {
    it('throws when service is disabled', async () => {
      const service = new SupabaseAuthService({
        get: (_key: string, def?: unknown) => def ?? '',
      } as never);
      await expect(service.verifyToken('any')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns the payload when jose.jwtVerify succeeds', async () => {
      const { jwtVerify } = await import('jose');
      vi.mocked(jwtVerify).mockResolvedValueOnce({
        payload: {
          sub: 'sup-user-1',
          email: 'a@b.co',
        },
        protectedHeader: { alg: 'ES256' },
      } as never);

      const service = new SupabaseAuthService({
        get: (key: string) => {
          if (key === 'SUPABASE_URL') return 'https://proj.supabase.co';
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-sr-key';
          return '';
        },
      } as never);

      const result = await service.verifyToken('fake-token');
      expect(result.sub).toBe('sup-user-1');
      expect(result.email).toBe('a@b.co');
    });

    it('throws UnauthorizedException when jose.jwtVerify rejects', async () => {
      const { jwtVerify } = await import('jose');
      vi.mocked(jwtVerify).mockRejectedValueOnce(new Error('bad sig'));

      const service = new SupabaseAuthService({
        get: (key: string) => {
          if (key === 'SUPABASE_URL') return 'https://proj.supabase.co';
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-sr-key';
          return '';
        },
      } as never);

      await expect(service.verifyToken('bad-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('rejects payloads missing a sub claim', async () => {
      const { jwtVerify } = await import('jose');
      vi.mocked(jwtVerify).mockResolvedValueOnce({
        payload: { email: 'no-sub@x.co' },
        protectedHeader: { alg: 'ES256' },
      } as never);

      const service = new SupabaseAuthService({
        get: (key: string) => {
          if (key === 'SUPABASE_URL') return 'https://proj.supabase.co';
          if (key === 'SUPABASE_SERVICE_ROLE_KEY') return 'fake-sr-key';
          return '';
        },
      } as never);

      await expect(service.verifyToken('no-sub-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('isDualIssueEnabled', () => {
    it('returns false when Supabase Auth is disabled', () => {
      const service = new SupabaseAuthService({
        get: (_key: string, def?: unknown) => def ?? '',
      } as never);
      expect(service.isDualIssueEnabled()).toBe(false);
    });

    it('returns false when enabled but the flag is not set', () => {
      const service = new SupabaseAuthService({ get: enabledGet } as never);
      expect(service.isDualIssueEnabled()).toBe(false);
    });

    it('returns true when enabled and SUPABASE_AUTH_DUAL_ISSUE=true', () => {
      const service = new SupabaseAuthService({
        get: (key: string, def?: unknown) => {
          if (key === 'SUPABASE_AUTH_DUAL_ISSUE') return 'true';
          return enabledGet(key, def);
        },
      } as never);
      expect(service.isDualIssueEnabled()).toBe(true);
    });
  });

  describe('createSession', () => {
    it('returns null when Supabase Auth is disabled', async () => {
      const service = new SupabaseAuthService({
        get: (_key: string, def?: unknown) => def ?? '',
      } as never);
      expect(await service.createSession('a@b.co')).toBeNull();
    });

    it('mints a session via generateLink + verifyOtp', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.admin.generateLink.mockResolvedValue({
        data: { properties: { hashed_token: 'hash-1' } },
        error: null,
      });
      admin.auth.verifyOtp.mockResolvedValue({
        data: {
          session: {
            access_token: 'a-tok',
            refresh_token: 'r-tok',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const session = await service.createSession('a@b.co');

      expect(admin.auth.admin.generateLink).toHaveBeenCalledWith({
        type: 'magiclink',
        email: 'a@b.co',
      });
      expect(admin.auth.verifyOtp).toHaveBeenCalledWith({
        type: 'magiclink',
        token_hash: 'hash-1',
      });
      expect(session).toEqual({
        accessToken: 'a-tok',
        refreshToken: 'r-tok',
        expiresIn: 3600,
      });
    });

    it('returns null when generateLink errors (and skips verifyOtp)', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.admin.generateLink.mockResolvedValue({
        data: { properties: null },
        error: { message: 'boom' },
      });

      expect(await service.createSession('a@b.co')).toBeNull();
      expect(admin.auth.verifyOtp).not.toHaveBeenCalled();
    });

    it('returns null when verifyOtp yields no session', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.admin.generateLink.mockResolvedValue({
        data: { properties: { hashed_token: 'h' } },
        error: null,
      });
      admin.auth.verifyOtp.mockResolvedValue({
        data: { session: null },
        error: null,
      });

      expect(await service.createSession('a@b.co')).toBeNull();
    });

    it('returns null (never throws) when the SDK throws', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.admin.generateLink.mockRejectedValue(new Error('network'));

      await expect(service.createSession('a@b.co')).resolves.toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('returns null when Supabase Auth is disabled', async () => {
      const service = new SupabaseAuthService({
        get: (_key: string, def?: unknown) => def ?? '',
      } as never);
      expect(await service.refreshSession('r')).toBeNull();
    });

    it('returns a normalized session on success', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.refreshSession.mockResolvedValue({
        data: {
          session: {
            access_token: 'a2',
            refresh_token: 'r2',
            expires_in: 3600,
          },
        },
        error: null,
      });

      const session = await service.refreshSession('old-refresh');

      expect(admin.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: 'old-refresh',
      });
      expect(session).toEqual({
        accessToken: 'a2',
        refreshToken: 'r2',
        expiresIn: 3600,
      });
    });

    it('returns null when the refresh errors', async () => {
      const { service, admin } = await makeEnabledService();
      admin.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'nope' },
      });

      expect(await service.refreshSession('bad')).toBeNull();
    });
  });
});
