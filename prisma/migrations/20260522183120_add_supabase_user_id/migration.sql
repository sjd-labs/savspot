-- Adds the linkage from our User to Supabase's auth.users.id.
-- Used by the Phase 5 lazy migration to Supabase Auth.
ALTER TABLE "users" ADD COLUMN "supabase_user_id" UUID;

-- Backfill candidate: leave NULL for now. Login flow will populate
-- on first successful password auth.

CREATE UNIQUE INDEX "users_supabase_user_id_key" ON "users"("supabase_user_id");
