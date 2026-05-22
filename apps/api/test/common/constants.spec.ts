import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WALK_IN_EMAIL_DOMAIN,
  getWalkInEmail,
} from '@/common/constants';

describe('DEFAULT_WALK_IN_EMAIL_DOMAIN', () => {
  it('equals savspot.co', () => {
    expect(DEFAULT_WALK_IN_EMAIL_DOMAIN).toBe('savspot.co');
  });
});

describe('getWalkInEmail', () => {
  it('returns correct email format for a standard tenant ID', () => {
    expect(getWalkInEmail('tenant-123')).toBe('walkin+tenant-123@savspot.co');
  });

  it('returns correct email format for a UUID tenant ID', () => {
    const uuid = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
    expect(getWalkInEmail(uuid)).toBe(`walkin+${uuid}@savspot.co`);
  });

  it('handles empty string tenant ID', () => {
    expect(getWalkInEmail('')).toBe('walkin+@savspot.co');
  });

  it('handles tenant ID with special characters', () => {
    expect(getWalkInEmail('tenant+special')).toBe(
      'walkin+tenant+special@savspot.co',
    );
  });

  it('uses the default domain when none is passed', () => {
    expect(getWalkInEmail('any-tenant')).toMatch(/@savspot\.co$/);
  });

  it('honors an explicit domain override', () => {
    expect(getWalkInEmail('tenant-1', 'example.com')).toBe(
      'walkin+tenant-1@example.com',
    );
  });
});
