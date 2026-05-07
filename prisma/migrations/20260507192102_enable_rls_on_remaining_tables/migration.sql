-- Enable Row-Level Security on every public-schema table that didn't have it.
--
-- The Supabase Advisor flags these as `rls_disabled_in_public` and (for tables
-- with PII / credentials) `sensitive_columns_exposed`: with RLS off, the
-- anon/authenticated PostgREST keys can read/write the data directly via the
-- Supabase REST endpoint.
--
-- Convention (carried over from 20260303041239 and 20260305210000):
--   * ENABLE ROW LEVEL SECURITY (without FORCE) — Prisma connects as the
--     table owner, which bypasses RLS automatically. anon/authenticated roles
--     respect RLS and, with no permissive policy, are denied by default.
--   * Tenant isolation continues to be enforced at the app layer by the
--     Prisma Client Extension (withTenantExtension), which injects tenantId
--     into every WHERE clause. The RLS toggle here is a defense-in-depth
--     safety net for non-owner connections (anon/authenticated keys).
--
-- Tables grouped by why they lack a direct tenant_id column:
--   - Root tables (tenants, users)
--   - Child tables of tenant-scoped parents (e.g., invoice_line_items)
--   - User-scoped tables (e.g., notification_preferences)
--   - Platform / system tables (e.g., payment_webhook_logs, platform_metrics)

-- ============================================================
-- Root tables
-- ============================================================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Child tables of tenant-scoped parents
-- ============================================================
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_amendments ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_option_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_workflow_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_staff ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- User-scoped tables (no tenant_id; auth handled at app layer)
-- ============================================================
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_digests ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_push_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_payouts ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Platform / system tables (admin-only via service_role)
-- ============================================================
ALTER TABLE payment_webhook_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_dead_letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE category_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE security_breaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE breach_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE affected_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_models ENABLE ROW LEVEL SECURITY;
