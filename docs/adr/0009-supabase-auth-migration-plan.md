# ADR-0009: Frontend Supabase Token Issuance and RS256 Retirement

## Status

Accepted (planning) — implementation deferred to follow-up PRs as described under "Decision".

## Context

Phase 5 (PR #72) introduced a **dual-stack JWT validator** on the API:

- Legacy clients keep using **custom RS256** JWTs issued by `apps/api/src/auth/services/token.service.ts`.
- New clients can authenticate with **Supabase-issued ES256** JWTs, verified locally via the project's JWKS (`/auth/v1/.well-known/jwks.json`).
- On password login, `AuthService.linkToSupabase` lazily provisions the user in Supabase Auth and stamps `User.supabaseUserId`. PR #81 added `pnpm admin:backfill-supabase-users` to converge dormant users without waiting for them to log in again.

The API side is ready. What is still missing:

1. **The web client is still pure RS256.** `apps/web/src/components/auth/login-form.tsx` calls `/api/auth/login`, the API verifies the password against `User.passwordHash`, and the response carries a custom RS256 access + refresh token pair.
2. **Supabase Auth users do not have a password set.** `SupabaseAuthService.provisionUser` creates the Supabase row with `email_confirm: true` but never passes `password`. That means `supabase.auth.signInWithPassword(...)` from the browser would fail today — there is nothing to verify against.
3. **There is no coverage metric.** "Retire RS256 once Supabase coverage is high" is not actionable without a number.

This ADR records the agreed migration shape so that subsequent PRs can land each step in isolation without rebuilding the plan from scratch.

## Decision

### Auth-issuance pattern: Pattern B (server-mediated)

We will **not** adopt Pattern A (browser calls `supabase.auth.signInWithPassword` directly). It would require either syncing every user's password into Supabase or asking users to re-set their password — both options have significant UX and security implications we are not prepared to take on right now.

Instead, the web client continues to call `/api/auth/login` as today; on a successful password match, the API generates **both** a custom RS256 token (for back-compat with clients that haven't migrated) **and** a Supabase ES256 access + refresh token pair (via `supabase.auth.admin.generateLink({ type: 'magiclink' })` plus a session exchange), returning both in the response. The web client stores the Supabase tokens and uses them for subsequent API calls; the dual-stack validator on the API accepts them on the ES256 branch.

This keeps password verification on our side, never moves the password hash to Supabase, and gives us a clean cutover surface (eventually stop returning the custom RS256 token).

### Migration order

The migration lands as **four** small PRs, each independently shippable and reversible:

**Step 1 — Foundations in `apps/web` (no behavior change).** Add `@supabase/supabase-js` dep, the `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` env vars (anon key is safe to expose; service role key is not), and a singleton client at `apps/web/src/lib/supabase-client.ts`. Nothing reads from it yet.

**Step 2 — API issues Supabase tokens alongside RS256 on login.** Extend `AuthService.login` and `AuthService.refreshTokens` so the response also includes a `supabaseSession` field when `SupabaseAuthService.isEnabled()` and the user has a `supabaseUserId`. Web ignores the new field for now. This is the riskiest step — feature-flag it under `process.env.SUPABASE_AUTH_DUAL_ISSUE === 'true'` so we can disable instantly if it misbehaves in production.

**Step 3 — Web prefers Supabase tokens.** In `apps/web/src/providers/auth-provider.tsx` (or wherever the auth context lives), read `supabaseSession` from the login response and use that token for the `Authorization: Bearer` header. Fall back to the RS256 token if `supabaseSession` is absent. The auth-provider's token-refresh path uses `supabase.auth.refreshSession()` when on the Supabase track.

**Step 4 — RS256 retirement.** Stop generating RS256 tokens in `AuthService` once **coverage ≥ 95% for ≥ 14 consecutive days** (see "Coverage metric"). Public-API consumers using long-lived custom JWTs are migrated via API-key strategy already (`api-key.controller.ts`), so retirement only affects the web/mobile session flow.

### Coverage metric

A request counts as **Supabase-track** if its incoming JWT has `alg: ES256`. The dual-stack `JwtStrategy` already decodes the alg before validating; we add a single PostHog event there:

```ts
// apps/api/src/auth/strategies/jwt.strategy.ts — inside validate()
this.posthog.capture('jwt_validated', {
  distinctId: payload.sub,
  properties: { alg, supabase_track: alg === 'ES256' },
});
```

Coverage = `count(supabase_track=true) / count(*)` over a 7-day rolling window, queried via the existing PostHog dashboard. Threshold for retirement: **≥ 95% for ≥ 14 consecutive days**, with no alerts firing on `jwt_validated.alg=RS256` from a user who has a non-null `supabaseUserId` (that would indicate the web migration regressed for some users).

### Rollback

Steps 1 and 4 have no rollback needs (no behavior change / one-way move). Steps 2 and 3 are guarded:

- Step 2 — unset `SUPABASE_AUTH_DUAL_ISSUE` on Vercel; web sees no `supabaseSession` and stays on the RS256 path.
- Step 3 — the web client falls back to RS256 if `supabaseSession` is missing, so unsetting the env from step 2 also reverts step 3 in practice.

## Consequences

**Positive:**

- Users keep entering their existing SavSpot passwords — no migration prompt, no re-set-your-password flow.
- The web client moves to Supabase tokens behind a feature flag, so we can validate at low traffic before flipping the default.
- Coverage is measured continuously, not estimated. The retirement decision is data-driven.
- Each step is small and reversible. We never have a single "big bang" PR that we cannot back out of.

**Negative:**

- We continue dual-issuing tokens during steps 2–3, which costs an extra Supabase admin API round-trip on every login. Acceptable for a finite migration window; revisit if it becomes a hot-path bottleneck.
- `supabase.auth.admin.generateLink` + session exchange is more code than `signInWithPassword` would have been. Pattern B is the more conservative choice; the tradeoff is intentional.
- The retirement step (4) requires deleting code from `TokenService`. We must ensure no internal service still issues RS256 (the public-API key flow uses a separate path and is unaffected).

## References

- PR #72 — Phase 5 dual-stack JWT validator + lazy Supabase Auth link
- PR #81 — `pnpm admin:backfill-supabase-users` (this PR's prerequisite for high coverage)
- `apps/api/src/auth/services/supabase-auth.service.ts` — `provisionUser`, `verifyToken`
- `apps/api/src/auth/strategies/jwt.strategy.ts` — dual-stack validator (where coverage event is added)
- `apps/web/src/components/auth/login-form.tsx` — where the web flow originates
- `apps/web/src/providers/auth-provider.tsx` — where the web client stores + refreshes tokens
