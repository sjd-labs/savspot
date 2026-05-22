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
      },
    },
  })),
}));

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
});
