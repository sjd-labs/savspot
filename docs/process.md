# How SavSpot was built

This document is the part of the project most projects don't have: a
candid look at the AI-collaboration patterns that produced the codebase,
the experiments that failed, the judgment moments where the operator
overrode the model, and the heuristics that survived.

It is not a sales pitch for AI engineering. Several patterns here were
killed after measurement. The point is that the loop is observable and
the failure modes are concrete.

---

## TL;DR

- **100% of the code in this repository was produced by Claude.**
  The operator (Stephen, working as SJD Labs, LLC) directed product
  scope, architectural decisions, legal positioning, and operating
  posture. Claude wrote the TypeScript, the SQL, the test files, the
  Vercel pipeline scripts, the privacy policy and terms of service,
  and this document.
- The work spans roughly two evaluation axes:
  1. **What did Claude produce well under scoped direction?** Most of
     the platform: multi-tenant RLS, Stripe Connect destination
     charges, dual-stack JWT auth, deploy pipeline workarounds, ADRs,
     CCPA-compliant legal pages.
  2. **Where did Claude need to be overridden by judgment?** Venue
     selection, an experimental local-model bridge, the decision to
     close managed signups, the HIPAA exclusion scope.
- The deliberate decision was made to ship to production-grade legal
  and operational quality, then convert to open-source-only mode
  rather than pursue this as a hosted business.

---

## The collaboration patterns that worked

### 1. One PR per change, every change

Every behavior change &mdash; including documentation-only ones &mdash;
went through a feature branch, a PR, CI verification, and squash-merge
with a Conventional Commits message. There are no commits on `main`
that bypassed CI.

This sounds like overhead. It was the single most important pattern,
for one reason: **it forced the model to scope changes tightly.** When
each PR has a single subject line that must accurately describe what
landed, the model can't quietly include "while I was here, I also
refactored X."

### 2. ADRs for non-trivial architectural decisions

The [`docs/adr/`](adr/) directory has 9 architecture decision records
following the Michael Nygard template. Each one documents:

- The forcing context that made the decision necessary
- The decision itself
- The consequences (positive and negative)

Examples:
- [ADR-0001](adr/0001-shared-db-rls-multitenancy.md) &mdash; shared DB
  with RLS for multi-tenancy (vs database-per-tenant or
  schema-per-tenant)
- [ADR-0008](adr/0008-prisma-raw-queries-for-slot-locking.md) &mdash;
  the discovery that Prisma Client Extensions with `$allOperations`
  break `SELECT ... FOR UPDATE` lock semantics under nested
  transactions, and the raw-SQL workaround
- [ADR-0009](adr/0009-supabase-auth-migration-plan.md) &mdash; the
  dual-stack JWT migration plan and its retirement coverage metric

The ADR pattern matters because it surfaces **why** decisions were made
to a future reader (human or model). Without it, six months later,
nobody remembers why the booking slot reservation uses raw SQL instead
of the Prisma query builder, and someone "modernizes" it back into a
race condition.

### 3. Env-flag kill switches for behavioral changes

Where a behavior change is reversible or might need to be flipped per
deployment, the change is gated behind an env var rather than being
hard-coded. Examples:

- `MANAGED_HOSTING_CLOSED` &mdash; closes signups on the hosted
  instance while preserving the full register code path for
  self-hosters
- `SAVSPOT_LICENSE_KEY` &mdash; presence-only gate for EE module
  access via `@RequiresLicense()`
- `SUPABASE_AUTH_DUAL_ISSUE` (planned, per ADR-0009) &mdash; toggle
  Supabase ES256 token issuance alongside the existing custom RS256

The pattern is "ship the feature dark, flip the flag, watch, flip
back if needed." It made it safe to land potentially destabilizing
changes onto `main` without coordinating a release.

### 4. Tests as a behavior contract, not a coverage metric

The repo has 2,200+ API tests and 238 web tests. The test suite is not
designed for coverage percentage. It is designed so that the model
cannot regress an observable behavior without breaking a test.

When a test failure showed up in CI (e.g., the Playwright
strict-mode-violation on the long-form privacy policy headings), the
fix was to make the locator more specific &mdash; not to weaken the
assertion. The test stayed in place as a behavioral contract.

### 5. Read existing code before changing it

The single most repeated direction in this project was: read the
existing patterns in the area before writing new code. This applied to
both human-style debugging and model-style code generation.

The effect: when a new feature was added, it followed the existing
NestJS module conventions (controller + service + DTO + module file),
the existing test patterns (vitest with mocked Prisma), and the
existing error-handling style. The codebase reads as if one person
wrote it, because the existing patterns were always treated as the
ground truth.

### 6. Trust but verify

Agent summaries describe intent, not what actually happened. After
delegating a multi-step change to a subagent, the operator (or Claude
itself, in main session) re-read the diff before claiming completion.

This caught real bugs:
- A claimed "merged PR" that was still pending CI
- A "deployed to prod" status that was actually a preview deployment
- A claim that "vercel build" had succeeded when actually a phantom
  function had hung the build to timeout

### 7. Operating-posture decisions are operator decisions, not model decisions

Several decisions were explicitly made by the operator and given to
Claude as direction, not the other way around:

- **Close managed signups.** The model would have happily kept
  building toward growth-readiness if asked. The operator made the
  call to scope down.
- **HIPAA exclusion clause.** The model produced legal pages without
  a HIPAA disclaimer initially. The operator identified the risk
  (fitness/wellness categories attract licensed practitioners who
  enter PHI) and directed the explicit exclusion.
- **Venue selection.** The model defaulted arbitration to Los Angeles
  County. The operator corrected it to San Diego County (home venue
  of SJD Labs).
- **Pattern B vs Pattern A for Supabase Auth migration.** The model
  could have built either. The operator chose Pattern B
  (server-mediated, password stays with us) over Pattern A
  (browser-direct `signInWithPassword`) because it avoided syncing
  password hashes into Supabase.
- **Skip counsel review on legal pages.** The operator chose to ship
  templated CCPA/CPRA + California-Civil-Code-§1668 carve-outs
  without paying for counsel review, accepting the risk explicitly.

These are not coding decisions. They are judgment decisions, and the
loop only works when the operator owns them.

---

## Experiments that didn't work

### The `lq` local-model bridge (built 2026-04, killed 2026-05-07)

The hypothesis: route large code-generation edits to a local Ollama
qwen3-coder model on the developer's hardware, keeping cloud tokens
reserved for judgment work.

After 14 days of telemetry, the audit showed **0% coverage** on the
big code-bearing Edits the bridge was meant to handle. Two failure
modes:

1. Deciding "should I `lq` this?" on every large write was cognitive
   overhead that exceeded any token savings.
2. Most large code drops in real product work involved novel UI,
   business logic, or hooks where the design wasn't decided when
   typing started &mdash; meaning the work was reasoning, not typing,
   and reasoning belongs on the better model.

The rule that survived: **write all code directly on Opus. Invoke
local models ad-hoc only if a measured win appears.** Don't reinstate
as a routing rule without telemetry justifying it.

The `lq` binary still exists at `~/.local/bin/lq` as a dormant
one-shot wrapper, but no workflow component depends on it.

This is in the operator's user-level `CLAUDE.md` as a permanent rule,
along with the audit's date so future variants of the same experiment
can be recognized and rejected faster.

### The Vercel NestJS framework preset's phantom function

Vercel's `framework: "nestjs"` preset auto-discovers `src/main.ts` and
spins up its own function alongside the explicitly-declared
`api/index.js`. The phantom function is never invoked
(`vercel.json` rewrites route all traffic to `/api/index`) but it is
still built &mdash; and its TypeScript compile walks the entire `src/`
import graph.

After `pnpm deploy --prod` strips devDependencies, the phantom's
compile fails on missing `@types/cookie-parser` and
`@scalar/nestjs-api-reference`.

First attempt: set `framework: null` in `vercel.json`. Broke a
different way: Vercel falls back to the static-site path and demands
an output directory named `public`.

Second attempt: temporarily move `src/` out of the way before
`vercel build`, restore after. Broke because the preset requires
`src/main.ts` to import `@nestjs/core` at minimum.

**Final working pattern:** stub `src/main.ts` with a 4-line file that
imports `@nestjs/core` and nothing else, run `vercel build`, then
restore the original via a `trap` on EXIT. The phantom shrinks from
8.7 MB to 24 KB, the build no longer needs devDep types, and a
developer who runs the script locally never loses their entrypoint.

(See `apps/api/scripts/vercel-build.sh` for the implementation.)

### Inlining workspace packages for Vercel NFT compatibility

Vercel's node-file-trace silently tags workspace packages with an
`.ignored_` prefix so they never ship. The workaround was to inline
`@savspot/shared` and `@savspot/ee` into `apps/api/src/shared/` and
`apps/api/src/ee/` respectively.

This works but is fragile. When a new shared constant was added in
[PR #84](https://github.com/sjd-labs/savspot/pull/84), the file had
to be mirrored manually into both locations. There is no enforcement
that the two copies stay in sync.

A better long-term solution exists (proper `pnpm deploy` workspace
handling without inline copies), but it wasn't worth the rebuild
budget given the inline pattern is reliable. The cost is paid at
each new shared-constants addition. **Documented as a known tax
rather than hidden as a one-time fix.**

---

## Decisions about what NOT to build

These were as important as the things that were built. Each one is a
piece of work that *would* have been valuable but was deliberately
scoped out:

| Item | Why not |
|---|---|
| **HIPAA compliance + BAA** | Multi-quarter scope. Disclaimed in ToS instead. |
| **Real-money Stripe end-to-end walk-through** | Requires real payment instrument; documented as the one remaining advertising-readiness item the operator must do personally. |
| **Cyber/E&O insurance** | Recommended in the readiness checklist but not bought; relevant only if the project pursued real users. |
| **Sales-tax registration** | Same. |
| **Status page, on-call rotation, incident runbook** | Operationally appropriate for a hosted business; out of scope for portfolio mode. |
| **DPA template** | Privacy policy references "available on request" but no template is in the repo yet. Flagged. |
| **Backup restore drill** | Privacy policy promises 30-day rolling backups; restore has never actually been tested. Honest gap. |
| **Trademark search on "SavSpot"** | Flagged but not done. |
| **Mobile app store submission** | The `apps/mobile/` Expo project exists but is not in CI and has not been published. |

**The honest version of "shipping" is shipping both what you built and
what you decided not to build.** Most projects hide the gaps. This one
documents them.

---

## Failure modes of the AI-collaboration loop

For symmetry, the patterns where Claude needed to be overridden by the
operator. These are the actually-useful artifacts for someone
evaluating AI-collaborative engineering.

### 1. Defaulting to "consult counsel" disclaimers

First draft of the legal pages opened with a prominent "TEMPLATE
&mdash; consult counsel" banner. The operator was honest about being
unwilling to pay for counsel review and asked for the most protective
California-specific framing achievable. Claude initially over-hedged.
The operator overrode and the final pages reflect specific
California-Civil-Code-§1668 carve-outs and §17602 auto-renewal
disclosures &mdash; substantive protection rather than disclaimers
about not being substantive.

### 2. Arbitrary defaults that aren't actually defensible

The first ToS draft seated arbitration in Los Angeles County. There
was no reason for this &mdash; LA is large and famous but it isn't the
operator's home venue. San Diego County is. The operator corrected.

The lesson: when the model picks a "default," it's often picking the
most generic-sounding option rather than the right one for the actual
context. Defaults need to be checked.

### 3. Claiming success without verifying

Earlier in the project, deploys were sometimes claimed as "shipped to
prod" when they had only been deployed to a preview environment. The
operator caught this by inspecting `vercel inspect` output rather than
trusting the CLI's "Deployment complete" message.

The pattern that fixed it: **claim production status only after
inspecting the production URL itself.** `vercel inspect <prod-url>`
returns the deployment ID and timestamp that actually serves traffic
&mdash; the difference between "I deployed" and "traffic sees the
new deploy" is real.

### 4. Premature scope expansion

Multiple times the model proposed implementing additional features
"while we're in the area." The operator pushed back consistently: one
PR per change, no surrounding cleanup, no preemptive abstractions.
This kept reviewability high and made it possible to revert any single
change without entangling it with adjacent work.

### 5. Hallucinating capability

Less-frequent but did happen: the model occasionally referenced
features that hadn't been built (e.g., a DPA template), or implied
that scheduled work had completed when it hadn't. The operator's habit
of asking for live URL checks and prod-state verification caught these
before they reached external surfaces.

---

## Heuristics that survived the project

These are the rules of thumb that emerged from doing the work, in the
operator's own framing:

- **Write all code directly on the best model available.** Don't
  build elaborate routing systems for code generation; the cognitive
  cost exceeds the token savings on real product work.
- **Use ADRs for the decisions you'd otherwise re-litigate.** If a
  decision is non-obvious and you'd want a future contributor to
  understand the forcing context, write an ADR.
- **Ship behavior changes behind kill-switches.** Reversible decisions
  cost less to make.
- **The end-to-end verification is the deploy URL.** Until you've
  checked the live URL, the change is not shipped.
- **What you decided not to build is part of what you shipped.**
  Honest scoping is more valuable than completeness theater.
- **Test failures are signal, not noise.** When a long-form rewrite
  caused a Playwright strict-mode-violation, the test was right and
  the locator was wrong &mdash; the test stayed, the locator got
  fixed.
- **Operating-posture decisions are operator decisions.** The model
  can build either path; choosing which one is judgment work.

---

## What this project doesn't demonstrate

For honesty: things this project explicitly does not provide evidence
of.

- **Scale.** No real traffic, no real concurrent users, no real cost
  pressure to optimize for.
- **Multi-engineer collaboration.** One operator + one model, not a
  team coordinating across PRs.
- **Long-term maintenance.** The project is fresh; the codebase
  hasn't been operated for years.
- **Reliability under failure.** No chaos engineering, no production
  incident response, no real on-call.

These are real limits. They're listed here because a hiring evaluator
who clicks through this document deserves to know what the artifact
does and doesn't show, without having to discover the limits
themselves.

---

## Contact

The operator: Stephen John Deslate &mdash; SJD Labs, LLC,
San Diego, California.

Questions about this document or the patterns it describes are welcome
at [legal@savspot.co](mailto:legal@savspot.co) (legal/process) or via
GitHub issues on this repo.
