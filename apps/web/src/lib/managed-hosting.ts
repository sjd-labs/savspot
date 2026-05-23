/**
 * Single flag that controls whether this SavSpot instance is accepting new
 * managed-hosting signups, or whether it's in "open-source maintainer /
 * portfolio" mode where new accounts are pointed to the self-host route.
 *
 * Set NEXT_PUBLIC_MANAGED_HOSTING_CLOSED=true to turn off signups + swap all
 * marketing CTAs to self-host links. Leave unset (or 'false') to behave as
 * a normal open-signup SaaS.
 *
 * Mirrors the API-side MANAGED_HOSTING_CLOSED guard on POST /api/auth/register.
 */
export const MANAGED_HOSTING_CLOSED =
  process.env['NEXT_PUBLIC_MANAGED_HOSTING_CLOSED'] === 'true';

export const SELF_HOST_GITHUB_URL = 'https://github.com/sjd-labs/savspot';
