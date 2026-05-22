#!/usr/bin/env tsx
// =============================================================================
// SavSpot Platform Admin — Backfill Supabase Auth users
//
// Phase 5 (PR #72) introduced lazy provisioning: a SavSpot user's matching
// `auth.users` row in Supabase is created on their *next* password login.
// Until that happens, `User.supabaseUserId` stays NULL and the dual-stack
// JWT validator can only authenticate them through the legacy RS256 flow.
//
// This script bulk-backfills the link for every existing SavSpot user that
// doesn't have a `supabaseUserId` yet, so we can converge coverage without
// waiting for each user to log in again. Once coverage is high enough we
// can retire the custom RS256 issuance path.
//
// Usage:
//   pnpm admin:backfill-supabase-users [options]
//
// Options:
//   --dry-run         Walk through users and report what would change, but
//                     do not call Supabase Auth or write to the DB.
//   --limit <N>       Process at most N users (default: all).
//   --verbose         Print one line per user instead of just progress
//                     totals.
//
// Required env:
//   DATABASE_URL                       Postgres connection
//   SUPABASE_URL                       Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY          Service-role key (DO NOT log this)
// =============================================================================

import { createClient, type SupabaseClient, type User as SbUser } from '@supabase/supabase-js';
import {
  getPrisma,
  parseArgs,
  hasHelp,
  exitWithError,
  type ParsedArgs,
} from './_shared.js';

const USAGE = `
SavSpot Admin — Backfill Supabase Auth users

Usage:
  pnpm admin:backfill-supabase-users [options]

Options:
  --dry-run       Show what would change without writing to Supabase or the DB
  --limit <N>     Process at most N users (default: all without supabaseUserId)
  --verbose       Print one line per user
  --help          Show this help

Required env:
  DATABASE_URL
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
`;

// ---------------------------------------------------------------------------
// Pull every Supabase Auth user into an email → id map. listUsers() pages,
// so we walk pages until empty. This is cheap (single account) and makes
// the per-user provisionUser path O(1) lookups instead of one API call
// per user.
// ---------------------------------------------------------------------------
async function loadSupabaseUserMap(admin: SupabaseClient): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const perPage = 1000;
  let page = 1;
  while (true) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage });
    if (error) {
      throw new Error(`listUsers page ${page} failed: ${error.message}`);
    }
    const users = data.users as SbUser[];
    for (const u of users) {
      if (u.email) map.set(u.email.toLowerCase(), u.id);
    }
    if (users.length < perPage) break;
    page += 1;
  }
  return map;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(parsed: ParsedArgs): Promise<void> {
  if (hasHelp(parsed)) {
    console.log(USAGE);
    return;
  }

  const dryRun = parsed.booleans.has('dry-run');
  const verbose = parsed.booleans.has('verbose') || parsed.booleans.has('v');
  const limit = parsed.flags['limit'] ? parseInt(parsed.flags['limit'], 10) : undefined;

  const supabaseUrl = process.env['SUPABASE_URL'];
  const serviceRoleKey = process.env['SUPABASE_SERVICE_ROLE_KEY'];
  if (!supabaseUrl || !serviceRoleKey) {
    exitWithError(
      'SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must both be set in the environment.',
    );
  }

  const prisma = getPrisma();
  const admin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  console.log('→ Loading Supabase Auth user list (paged 1000 at a time)...');
  const sbMap = await loadSupabaseUserMap(admin);
  console.log(`  Found ${sbMap.size} Supabase Auth users.`);

  console.log('→ Querying SavSpot users without supabaseUserId...');
  const users = await prisma.user.findMany({
    where: { supabaseUserId: null },
    select: { id: true, email: true, name: true, emailVerified: true },
    ...(limit ? { take: limit } : {}),
  });
  console.log(`  Found ${users.length} candidates.`);

  let linked = 0;
  let created = 0;
  let failed = 0;
  let i = 0;
  for (const user of users) {
    i += 1;
    const email = user.email.toLowerCase();
    try {
      let supabaseUserId = sbMap.get(email);

      if (!supabaseUserId) {
        if (dryRun) {
          if (verbose) console.log(`  [${i}/${users.length}] would create ${email}`);
          created += 1;
          continue;
        }
        const { data, error } = await admin.auth.admin.createUser({
          email: user.email,
          email_confirm: user.emailVerified,
          user_metadata: { savspotUserId: user.id, name: user.name },
        });
        if (error || !data.user) {
          throw new Error(error?.message ?? 'createUser returned no user');
        }
        supabaseUserId = data.user.id;
        created += 1;
        if (verbose) console.log(`  [${i}/${users.length}] created ${email}`);
      } else {
        linked += 1;
        if (verbose) console.log(`  [${i}/${users.length}] linked existing ${email}`);
      }

      if (!dryRun) {
        await prisma.user.update({
          where: { id: user.id },
          data: { supabaseUserId },
        });
      }
    } catch (err) {
      failed += 1;
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  [${i}/${users.length}] FAILED for ${email}: ${msg}`);
    }

    if (!verbose && i % 50 === 0) {
      console.log(`  Progress: ${i}/${users.length} (linked=${linked}, created=${created}, failed=${failed})`);
    }
  }

  console.log('');
  console.log(`✓ Done. linked=${linked}  created=${created}  failed=${failed}  total=${users.length}`);
  if (dryRun) console.log('  (dry-run — no changes were written)');
}

main(parseArgs()).catch((err: unknown) => {
  console.error(err instanceof Error ? err.stack ?? err.message : err);
  process.exit(1);
});
