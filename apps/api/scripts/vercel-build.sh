#!/usr/bin/env bash
# Orchestrates the Vercel build for the savspot-api project.
#
# Vercel's 8 GB build container OOMs on our monorepo's pnpm install, and
# Vercel's NFT (node-file-trace) refuses to bundle workspace packages
# (it tags them `.ignored_*` instead of shipping them). We work around
# both by:
#   1. Building dist/ locally (or on a 16 GB GitHub runner).
#   2. Using `pnpm deploy` to produce a *flat, prod-only* node_modules
#      bundle in /tmp/api-prod-deploy — no symlinks for NFT to choke on,
#      no devDeps wasting space.
#   3. Replacing apps/api/node_modules with that flat tree so `vercel
#      build` (which runs from apps/api) sees a normal Node project.
#   4. Manually copying the rhel-openssl Prisma query-engine binary
#      into the function bundle because NFT silently skips .so.node
#      files even when `includeFiles` is set.
#   5. `vercel deploy --prebuilt` ships the assembled .vercel/output
#      without re-running install/build.
#
# Usage:
#   ./scripts/vercel-build.sh           # build only (.vercel/output ready)
#   ./scripts/vercel-build.sh --deploy  # build + ship to prod
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
API_DIR="$REPO_ROOT/apps/api"
DEPLOY_DIR="${VERCEL_BUILD_DEPLOY_DIR:-/tmp/api-prod-deploy}"

cd "$REPO_ROOT"

echo "→ Installing workspace deps (frozen lockfile)..."
pnpm install --frozen-lockfile

# Prisma client is gitignored, so on a clean CI checkout `src/generated/prisma`
# doesn't exist yet — `nest build` then fails to resolve `@/generated/prisma`
# (1200+ TS2307 errors). Generate first.
echo "→ Generating Prisma client..."
pnpm db:generate

echo "→ Building @savspot/api (turbo)..."
pnpm --filter @savspot/api... build

echo "→ Creating prod-only flat node_modules at $DEPLOY_DIR ..."
rm -rf "$DEPLOY_DIR"
pnpm --filter=@savspot/api deploy --legacy --prod --config.node-linker=hoisted "$DEPLOY_DIR"

echo "→ Copying Prisma generated client into deploy bundle..."
cp -r "$API_DIR/src/generated" "$DEPLOY_DIR/src/"

echo "→ Swapping apps/api/node_modules with the dereferenced flat tree..."
rm -rf "$API_DIR/node_modules"
cp -rL "$DEPLOY_DIR/node_modules" "$API_DIR/node_modules"

# Stub src/main.ts so Vercel's NestJS framework preset compiles a *tiny*
# phantom function instead of the real one. Background:
#
#  - Vercel's `framework: "nestjs"` preset auto-discovers src/main.ts and
#    spins up its own function from it (in addition to our explicit
#    `api/index.js`). The phantom is never invoked — vercel.json rewrites
#    send all traffic to /api/index — but it is still built.
#  - The phantom's TypeScript compile traverses the import graph from
#    src/main.ts → src/configure-app.ts → … and chokes after
#    `pnpm deploy --prod` strips devDep type packages
#    (@types/cookie-parser, @scalar/nestjs-api-reference).
#  - The preset insists the entrypoint must import `@nestjs/core`, so we
#    can't just leave src/main.ts empty.
#
# Replacing src/main.ts with a minimal stub that imports `@nestjs/core`
# (a prod dep, so it survives `pnpm deploy --prod`) gives the preset
# exactly what it needs and stops the graph traversal — phantom shrinks
# from ~8.7 MB to ~24 KB and the build no longer needs devDep types.
#
# We back up the original first; a trap restores it on any exit so a dev
# running this script locally never loses their entrypoint.
echo "→ Stubbing src/main.ts so Vercel's NestJS preset doesn't drag in devDep types..."
MAIN_BACKUP="$(mktemp -d)/main.ts"
cp "$API_DIR/src/main.ts" "$MAIN_BACKUP"
cat > "$API_DIR/src/main.ts" <<'STUB'
// Stub installed by scripts/vercel-build.sh. The real main.ts is restored
// immediately after `vercel build` completes. See the comment in the build
// script for the full rationale.
import { NestFactory } from '@nestjs/core';
void NestFactory;
export {};
STUB

restore_main() {
  if [ -f "$MAIN_BACKUP" ]; then
    cp "$MAIN_BACKUP" "$API_DIR/src/main.ts"
  fi
}
trap restore_main EXIT INT TERM

echo "→ Running vercel build (--prod) ..."
cd "$API_DIR"
rm -rf .vercel/output
vercel build --prod ${VERCEL_TOKEN:+--token="$VERCEL_TOKEN"}

restore_main
trap - EXIT INT TERM

# NFT silently drops the rhel-openssl-3.0.x.so.node Prisma query-engine
# binary even though `includeFiles` lists dist/**. Copy it back in.
ENGINE_BIN="libquery_engine-rhel-openssl-3.0.x.so.node"
ENGINE_SRC="$API_DIR/src/generated/prisma/$ENGINE_BIN"
if [ -f "$ENGINE_SRC" ]; then
  echo "→ Injecting Prisma rhel query-engine binary..."
  cp "$ENGINE_SRC" ".vercel/output/functions/api/index.func/dist/generated/prisma/"
fi

if [ "${1:-}" = "--deploy" ]; then
  echo "→ Deploying prebuilt output to Vercel production..."
  vercel deploy --prebuilt --prod --yes --archive=tgz ${VERCEL_TOKEN:+--token="$VERCEL_TOKEN"}
fi

echo "✓ Done."
