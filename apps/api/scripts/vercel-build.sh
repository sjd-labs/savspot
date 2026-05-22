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

echo "→ Running vercel build (--prod) ..."
cd "$API_DIR"
rm -rf .vercel/output
vercel build --prod ${VERCEL_TOKEN:+--token="$VERCEL_TOKEN"}

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
