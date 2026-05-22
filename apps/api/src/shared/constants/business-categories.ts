import type { BusinessCategory } from '../enums/tenant.enums.js';

export interface BusinessCategoryOption {
  value: BusinessCategory;
  label: string;
  description: string;
}

/**
 * Authoritative client-facing copy for each `BusinessCategory` enum value.
 * Consumed by:
 *   - GET /api/directory/category-options (the public discovery endpoint)
 *   - The web client's category-picker components on /book/[slug] and the
 *     dashboard branding form (previously duplicated as local
 *     `CATEGORY_LABELS` consts)
 *
 * Adding a new enum value? Bump it here AND in
 * `packages/shared/src/enums/tenant.enums.ts` AND in
 * `prisma/schema.prisma#enum BusinessCategory` so the three stay aligned.
 */
export const BUSINESS_CATEGORY_OPTIONS: readonly BusinessCategoryOption[] = [
  {
    value: 'VENUE',
    label: 'Venue / Event Space',
    description:
      'Wedding, party, conference, and event spaces with hourly or per-event bookings.',
  },
  {
    value: 'SALON',
    label: 'Salon / Barbershop',
    description:
      'Hair, nails, lashes, brows, barbering — appointment-based personal-care services.',
  },
  {
    value: 'STUDIO',
    label: 'Studio',
    description:
      'Photography, recording, dance, art, and yoga studios that rent by the session.',
  },
  {
    value: 'FITNESS',
    label: 'Fitness / Wellness',
    description:
      'Personal training, massage, spa, physical therapy, and wellness practitioners.',
  },
  {
    value: 'PROFESSIONAL',
    label: 'Professional Services',
    description:
      'Consultants, coaches, tutors, legal, accounting, and other knowledge-based providers.',
  },
  {
    value: 'OTHER',
    label: 'Other',
    description:
      "Doesn't fit the categories above? Pick this and add a custom Display Label in your branding settings.",
  },
];

/**
 * Convenience lookup table — `value → label`. Identical content to
 * BUSINESS_CATEGORY_OPTIONS, exported separately because most callers just
 * need the label for an enum value they already have on hand.
 */
export const BUSINESS_CATEGORY_LABELS: Readonly<Record<BusinessCategory, string>> =
  Object.fromEntries(BUSINESS_CATEGORY_OPTIONS.map((o) => [o.value, o.label])) as Readonly<
    Record<BusinessCategory, string>
  >;
