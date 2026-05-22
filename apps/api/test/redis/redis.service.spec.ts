import { describe, it, expect, beforeEach, vi } from 'vitest';
import { RedisService } from '@/redis/redis.service';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Minimal Prisma double — enough surface to cover the call paths used
 * by RedisService. The shape mirrors `prisma.cacheEntry.*` plus
 * `$queryRaw` for the atomic incr() path.
 */
function makePrisma() {
  return {
    cacheEntry: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
      deleteMany: vi.fn(),
      updateMany: vi.fn(),
      count: vi.fn(),
    },
    $queryRaw: vi.fn(),
  };
}

describe('RedisService (Postgres-backed)', () => {
  let service: RedisService;
  let prisma: ReturnType<typeof makePrisma>;

  beforeEach(() => {
    prisma = makePrisma();
    service = new RedisService(prisma as never);
  });

  describe('get', () => {
    it('returns the value when the key exists and has not expired', async () => {
      prisma.cacheEntry.findUnique.mockResolvedValue({
        value: 'cached-value',
        expiresAt: null,
      });

      const result = await service.get('some-key');

      expect(result).toBe('cached-value');
      expect(prisma.cacheEntry.findUnique).toHaveBeenCalledWith({
        where: { key: 'some-key' },
        select: { value: true, expiresAt: true },
      });
    });

    it('returns null when the key does not exist', async () => {
      prisma.cacheEntry.findUnique.mockResolvedValue(null);

      const result = await service.get('missing-key');

      expect(result).toBeNull();
    });

    it('returns null when the key has expired', async () => {
      const past = new Date(Date.now() - 1000);
      prisma.cacheEntry.findUnique.mockResolvedValue({
        value: 'old-value',
        expiresAt: past,
      });

      const result = await service.get('expired-key');

      expect(result).toBeNull();
    });
  });

  describe('set', () => {
    it('upserts a row with no expiry', async () => {
      prisma.cacheEntry.upsert.mockResolvedValue({});

      const result = await service.set('my-key', 'my-value');

      expect(result).toBe('OK');
      expect(prisma.cacheEntry.upsert).toHaveBeenCalledWith({
        where: { key: 'my-key' },
        create: { key: 'my-key', value: 'my-value', expiresAt: null },
        update: { value: 'my-value', expiresAt: null },
      });
    });
  });

  describe('setex', () => {
    it('upserts with an expiresAt computed from the TTL', async () => {
      prisma.cacheEntry.upsert.mockResolvedValue({});
      const before = Date.now();

      const result = await service.setex('my-key', 60, 'my-value');
      const after = Date.now();

      expect(result).toBe('OK');
      const callArgs = prisma.cacheEntry.upsert.mock.calls[0]![0] as {
        create: { expiresAt: Date };
      };
      expect(callArgs.create.expiresAt.getTime()).toBeGreaterThanOrEqual(before + 60_000);
      expect(callArgs.create.expiresAt.getTime()).toBeLessThanOrEqual(after + 60_000);
    });
  });

  describe('del', () => {
    it('deletes one or more keys', async () => {
      prisma.cacheEntry.deleteMany.mockResolvedValue({ count: 2 });

      const result = await service.del('k1', 'k2');

      expect(result).toBe(2);
      expect(prisma.cacheEntry.deleteMany).toHaveBeenCalledWith({
        where: { key: { in: ['k1', 'k2'] } },
      });
    });

    it('short-circuits and returns 0 when called with no keys', async () => {
      const result = await service.del();
      expect(result).toBe(0);
      expect(prisma.cacheEntry.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('exists', () => {
    it('counts non-expired matching rows', async () => {
      prisma.cacheEntry.count.mockResolvedValue(1);

      const result = await service.exists('k1', 'k2');

      expect(result).toBe(1);
      expect(prisma.cacheEntry.count).toHaveBeenCalledWith({
        where: {
          key: { in: ['k1', 'k2'] },
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: expect.any(Date) } },
          ],
        },
      });
    });
  });

  describe('expire', () => {
    it('updates expiresAt on the matching row', async () => {
      prisma.cacheEntry.updateMany.mockResolvedValue({ count: 1 });

      const result = await service.expire('my-key', 120);

      expect(result).toBe(1);
      expect(prisma.cacheEntry.updateMany).toHaveBeenCalled();
    });
  });

  describe('incr', () => {
    it('returns the new counter value from the UPSERT result', async () => {
      prisma.$queryRaw.mockResolvedValue([{ value: '3' }]);

      const result = await service.incr('counter');

      expect(result).toBe(3);
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('delByPattern', () => {
    it('translates `*` glob to SQL `%` and deletes matching rows', async () => {
      prisma.cacheEntry.deleteMany.mockResolvedValue({ count: 5 });

      const result = await service.delByPattern('availability:rules:tenant-1:*');

      expect(result).toBe(5);
      const where = prisma.cacheEntry.deleteMany.mock.calls[0]![0]!.where as {
        key: { contains: string };
      };
      expect(where.key.contains).toBe('availability:rules:tenant-1:%');
    });
  });

  describe('ping', () => {
    it('runs a no-op query and returns PONG', async () => {
      prisma.$queryRaw.mockResolvedValue([{ ok: 1 }]);

      const result = await service.ping();

      expect(result).toBe('PONG');
      expect(prisma.$queryRaw).toHaveBeenCalled();
    });
  });

  describe('sweep', () => {
    it('deletes all rows whose expiresAt has passed', async () => {
      prisma.cacheEntry.deleteMany.mockResolvedValue({ count: 17 });

      const result = await service.sweep();

      expect(result).toBe(17);
      expect(prisma.cacheEntry.deleteMany).toHaveBeenCalledWith({
        where: { expiresAt: { lte: expect.any(Date) } },
      });
    });
  });
});
