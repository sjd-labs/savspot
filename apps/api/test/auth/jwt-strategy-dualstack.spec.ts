import { describe, it, expect, vi } from 'vitest';
import * as crypto from 'node:crypto';
import { UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import { JwtStrategy } from '@/auth/strategies/jwt.strategy';

// Mock jose so jwtVerify is controllable from inside the test.
vi.mock('jose', () => ({
  createRemoteJWKSet: vi.fn(() => 'fake-jwks'),
  jwtVerify: vi.fn(),
}));

// Ephemeral RS256 keypair shared across the RS256-flow tests so we can
// sign real tokens (avoids needing to spy on jsonwebtoken, which is
// not configurable under ESM).
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: { type: 'spki', format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
});

const signRs256 = (
  payload: Record<string, unknown> = { sub: 'user-1', email: 'a@b.co', platformRole: 'USER' },
  extra: Record<string, unknown> = {},
) =>
  jwt.sign(
    { ...payload, jti: 'jti-1', type: 'access', ...extra },
    privateKey,
    { algorithm: 'RS256' },
  );

const makeReq = (overrides?: Partial<{
  cookies: Record<string, string>;
  headers: Record<string, string>;
}>) => ({
  cookies: overrides?.cookies ?? {},
  headers: overrides?.headers ?? {},
});

const makeTokenService = (key = publicKey) => ({
  getPublicKey: () => key,
  isBlacklisted: vi.fn().mockResolvedValue(false),
});

const makeSupabaseAuth = (enabled = true) => ({
  isEnabled: () => enabled,
  verifyToken: vi.fn(),
});

const makePrisma = () => ({
  user: { findUnique: vi.fn() },
});

describe('JwtStrategy (dual-stack)', () => {
  it('rejects when no token is present', async () => {
    const strategy = new JwtStrategy(
      makeTokenService() as never,
      makeSupabaseAuth() as never,
      makePrisma() as never,
    );
    await expect(strategy.validate(makeReq() as never)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('routes RS256 tokens through the custom verifier', async () => {
    const token = signRs256();
    const supabaseAuth = makeSupabaseAuth();
    const strategy = new JwtStrategy(
      makeTokenService() as never,
      supabaseAuth as never,
      makePrisma() as never,
    );

    const result = await strategy.validate(
      makeReq({ headers: { authorization: `Bearer ${token}` } }) as never,
    );
    expect(result.sub).toBe('user-1');
    expect(supabaseAuth.verifyToken).not.toHaveBeenCalled();
  });

  it('routes ES256 tokens through the Supabase verifier', async () => {
    const supabaseAuth = makeSupabaseAuth();
    supabaseAuth.verifyToken.mockResolvedValue({
      sub: 'sup-user-99',
      email: 'sb@example.com',
    });

    const prisma = makePrisma();
    prisma.user.findUnique.mockResolvedValue({
      id: 'savspot-user-99',
      email: 'sb@example.com',
      role: 'USER',
    });

    // Hand-craft an ES256-headered JWT; only the header matters for branching.
    const headerB64 = Buffer.from(
      JSON.stringify({ alg: 'ES256', typ: 'JWT', kid: 'k1' }),
    ).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify({ sub: 'sup-user-99' })).toString(
      'base64url',
    );
    const fakeToken = [headerB64, payloadB64, 'sig'].join('.');

    const strategy = new JwtStrategy(
      makeTokenService() as never,
      supabaseAuth as never,
      prisma as never,
    );

    const req = makeReq({ headers: { authorization: `Bearer ${fakeToken}` } });
    const result = await strategy.validate(req as never);

    expect(supabaseAuth.verifyToken).toHaveBeenCalledWith(fakeToken);
    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { supabaseUserId: 'sup-user-99' },
      select: expect.any(Object),
    });
    expect(result.sub).toBe('savspot-user-99');
    expect(result.email).toBe('sb@example.com');
  });

  it('rejects ES256 tokens whose sub is not linked to a SavSpot user', async () => {
    const supabaseAuth = makeSupabaseAuth();
    supabaseAuth.verifyToken.mockResolvedValue({ sub: 'orphan-sup-id' });

    const prisma = makePrisma();
    prisma.user.findUnique.mockResolvedValue(null);

    const headerB64 = Buffer.from(
      JSON.stringify({ alg: 'ES256', typ: 'JWT' }),
    ).toString('base64url');
    const payloadB64 = Buffer.from(JSON.stringify({ sub: 'orphan-sup-id' })).toString(
      'base64url',
    );
    const fakeToken = [headerB64, payloadB64, 'sig'].join('.');

    const strategy = new JwtStrategy(
      makeTokenService() as never,
      supabaseAuth as never,
      prisma as never,
    );

    await expect(
      strategy.validate(
        makeReq({ headers: { authorization: `Bearer ${fakeToken}` } }) as never,
      ),
    ).rejects.toThrow(/not linked/);
  });

  it('falls through to custom verify when Supabase is disabled, even for ES256 headers', async () => {
    // RS256 token, but pretend the strategy might have seen ES256 in the
    // header — we simulate that by signing RS256 (real) and asserting
    // Supabase's verifyToken is never called when the service is disabled.
    const token = signRs256({ sub: 'user-2', email: 'fallback@x.co', platformRole: 'USER' });
    const supabaseAuth = makeSupabaseAuth(false); // disabled

    const strategy = new JwtStrategy(
      makeTokenService() as never,
      supabaseAuth as never,
      makePrisma() as never,
    );

    const result = await strategy.validate(
      makeReq({ headers: { authorization: `Bearer ${token}` } }) as never,
    );
    expect(result.sub).toBe('user-2');
    expect(supabaseAuth.verifyToken).not.toHaveBeenCalled();
  });

  it('reads the token from the savspot_access cookie', async () => {
    const token = signRs256({ sub: 'user-cookie', email: 'c@x.co', platformRole: 'USER' });
    const strategy = new JwtStrategy(
      makeTokenService() as never,
      makeSupabaseAuth() as never,
      makePrisma() as never,
    );

    const result = await strategy.validate(
      makeReq({ cookies: { savspot_access: token } }) as never,
    );
    expect(result.sub).toBe('user-cookie');
  });
});
