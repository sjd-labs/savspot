import { describe, it, expect } from 'vitest';
import { DirectoryService } from '@/directory/directory.service';
import { BUSINESS_CATEGORY_OPTIONS } from '@savspot/shared';

describe('DirectoryService.getCategoryOptions', () => {
  it('returns one entry per BusinessCategory enum value with a non-empty label and description', () => {
    const service = new DirectoryService({} as never);
    const options = service.getCategoryOptions();

    expect(options.length).toBe(6); // VENUE, SALON, STUDIO, FITNESS, PROFESSIONAL, OTHER
    for (const option of options) {
      expect(option.value).toMatch(/^(VENUE|SALON|STUDIO|FITNESS|PROFESSIONAL|OTHER)$/);
      expect(option.label.length).toBeGreaterThan(0);
      expect(option.description.length).toBeGreaterThan(0);
    }
  });

  it('returns the canonical shared constant unchanged', () => {
    const service = new DirectoryService({} as never);
    expect(service.getCategoryOptions()).toBe(BUSINESS_CATEGORY_OPTIONS);
  });

  it('exposes every BusinessCategory enum member exactly once (no drift between schema and copy)', () => {
    const service = new DirectoryService({} as never);
    const seen = new Set(service.getCategoryOptions().map((o) => o.value));
    expect(seen).toEqual(new Set(['VENUE', 'SALON', 'STUDIO', 'FITNESS', 'PROFESSIONAL', 'OTHER']));
  });
});
