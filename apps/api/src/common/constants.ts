/**
 * Default walk-in email domain. Run-time callers should prefer reading
 * `branding.walkInEmailDomain` from ConfigService so per-deployment
 * overrides via the `WALK_IN_EMAIL_DOMAIN` env var take effect.
 */
export const DEFAULT_WALK_IN_EMAIL_DOMAIN = 'savspot.co';

export function getWalkInEmail(
  tenantId: string,
  domain: string = DEFAULT_WALK_IN_EMAIL_DOMAIN,
): string {
  return `walkin+${tenantId}@${domain}`;
}
