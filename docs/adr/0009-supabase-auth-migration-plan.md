# ADR-0009: Frontend Supabase Token Issuance and RS256 Retirement

## Status

Accepted, then partially superseded. Steps 1–3 shipped as the **2026-05-27 cookie-swap revision below** (which supersedes the Bearer-token web plan). **Step 4 (RS256 retirement) is CLOSED as won't-do (2026-05-27):** the product moved to self-host / open-source-only with managed signups closed (`MANAGED_HOSTING_CLOSED`), so the ≥95%-coverage-for-14-days retirement gate is permanently unreachable. RS256 was never retired and **stays as the permanent auth path** — dual-stack (RS256 + optional Supabase ES256 behind the default-off `SUPABASE_AUTH_DUAL_ISSUE` flag) is the final end state. The coverage instrumentation and Step 4 below are retained for historical context only.

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

## Revision — 2026-05-27: server-side cookie swap (supersedes Steps 1 & 3)

When implementation started, the original plan's premise turned out to be
wrong about the web client. The plan below (Steps 1 & 3) assumes the browser
**holds the token and sends `Authorization: Bearer`**. In reality `apps/web`
is **cookie-based**: `login()` never reads tokens from the response body —
the API sets httpOnly `savspot_access` / `savspot_refresh` cookies, and the
dual-stack `JwtStrategy.extractToken` already reads the `savspot_access`
cookie first (and ES256-routes it). Following the literal plan would have
moved tokens out of httpOnly cookies into JS-readable storage — an
XSS-exposure regression on the auth path.

So Steps 1 & 3 were **replaced** with a **server-side cookie swap** that keeps
the browser exactly as it is:

- **No web-client changes.** The browser stays cookie-based; `@supabase/supabase-js`
  is **not** added to `apps/web` (original Step 1 is dropped as unnecessary).
- **Login mint (Step 2, kept).** On successful password login, when
  `SupabaseAuthService.isDualIssueEnabled()` (i.e. `SUPABASE_AUTH_DUAL_ISSUE=true`
  + Supabase configured) and the user is linked, `AuthService.login` mints a
  Supabase ES256 session via the Pattern B flow (`generateLink` → `verifyOtp`,
  see `createSession`). The custom RS256 pair is still generated as a fallback.
- **Cookie swap (replaces Step 3).** `AuthController.applyAuthCookies` writes
  the Supabase access/refresh tokens into the existing httpOnly
  `savspot_access` / `savspot_refresh` cookies (access-cookie maxAge follows
  the Supabase `expires_in`) **instead of** the RS256 pair when a session was
  minted. Subsequent requests carry the ES256 cookie → `JwtStrategy` routes to
  the Supabase validator automatically.
- **Refresh branch.** `AuthService.refreshTokens` detects a Supabase (opaque)
  refresh token — the RS256 `verifyToken` throws on it — and exchanges it via
  `SupabaseAuthService.refreshSession`, returning a `supabaseSession` the
  controller writes back to the cookies.
- **Tenant-claim parity.** `JwtStrategy.validateSupabase` now embeds the
  single-membership `tenantId`/`tenantRole` (mirroring the RS256 login path),
  so tenant-scoped routes that fall back to the JWT `tenantId` (rather than a
  `:tenantId` route param) keep working under an ES256 session.

Rollback is unchanged in spirit: set `SUPABASE_AUTH_DUAL_ISSUE=false` and new
logins/refreshes go back to RS256-only; in-flight Supabase sessions fail their
next refresh and re-login on RS256.

**Known limitations of the cookie swap (flag-off-by-default; revisit before
relying on it in a real multi-tenant prod):**

- **Logout does not revoke the Supabase session server-side.** `logout`
  clears the cookies (so the browser is logged out) and, for an ES256
  session, skips the RS256 blacklist (the payload has no `jti`/`exp` — see
  the `logout` guard). The Supabase opaque refresh token is not revoked at
  Supabase, so it stays valid until it expires. Acceptable because the
  refresh cookie is httpOnly + scoped to `/api/auth/refresh` and the access
  token is short-lived; a future hardening can call the Supabase admin
  sign-out on logout. The RS256 path still blacklists its refresh `jti`.
- **Refresh-cookie maxAge is fixed at 7 days**, independent of the Supabase
  project's refresh-token TTL. If Supabase's window is shorter, the browser
  may hold a `savspot_refresh` cookie that Supabase rejects, producing an
  early 401-then-relogin (functionally safe, just surprising). Tune the
  Supabase refresh TTL to ≥7 days, or derive the cookie maxAge from config.
- **Dual-issue mint only succeeds reliably for backfilled/linked users.**
  `SupabaseAuthService.provisionUser` looks users up with
  `listUsers({ perPage: 1 })` + client-side email filter, so it can't find a
  pre-existing Supabase user that isn't the first row; for those it attempts
  `createUser`, hits a duplicate-email error, and the mint falls back to
  RS256. In the backfilled steady state (`pnpm admin:backfill-supabase-users`
  persists `supabaseUserId`, so `linkToSupabase` short-circuits before
  `provisionUser`) this path isn't hit. Fix `provisionUser` to paginate or
  use a server-side email filter before depending on first-login provisioning.
- **MFA-enabled users are excluded** — the MFA challenge/recovery endpoints
  return tokens in the body without setting cookies, so they never enter the
  cookie swap. Out of scope here; note for the Step 4 coverage accounting.

**Coverage metric note:** the `jwt_validated` PostHog event (below) was **never
wired**, and won't be — it was only a prerequisite for the Step 4 retirement
decision, which is now closed as won't-do (see Status). Managed signups are
closed (`MANAGED_HOSTING_CLOSED`), so coverage can't be accrued and RS256 stays.

The original Bearer-token plan is preserved below for the historical record.

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

**Step 4 — RS256 retirement.** ~~Stop generating RS256 tokens in `AuthService` once **coverage ≥ 95% for ≥ 14 consecutive days** (see "Coverage metric").~~ **Closed as won't-do (2026-05-27)** — see Status. The retirement gate is unreachable with managed signups closed, so RS256 generation stays in `AuthService` permanently. (Originally: public-API consumers using long-lived custom JWTs are migrated via the API-key strategy `api-key.controller.ts`, so retirement would only have affected the web/mobile session flow.)

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
