-- CreateTable
-- Postgres-backed key-value store that replaces Redis for cache,
-- rate-limit counters, circuit-breaker state, dedup keys, etc.
-- `expires_at` emulates Redis TTL — readers ignore expired rows;
-- a periodic Inngest sweep deletes them (see CacheSweepFunction).
CREATE TABLE "cache_entries" (
    "key" VARCHAR(512) NOT NULL,
    "value" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "cache_entries_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE INDEX "cache_entries_expires_at_idx" ON "cache_entries"("expires_at");

-- Enable RLS (defense-in-depth — the table is not tenant-scoped, but the
-- anon/authenticated Supabase roles should not read the cache. Prisma
-- connects as the owner role and bypasses RLS.)
ALTER TABLE "cache_entries" ENABLE ROW LEVEL SECURITY;
