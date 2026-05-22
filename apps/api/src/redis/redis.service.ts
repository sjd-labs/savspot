import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * Postgres-backed key-value store.
 *
 * Originally a thin wrapper over ioredis, now a Prisma-backed table
 * (`cache_entries`) with the same surface area. Kept as `RedisService`
 * for back-compat with the existing call sites; rename in a follow-up
 * if/when the redis/ folder churns again.
 *
 * Why Postgres: leaving Fly meant losing the Fly Redis instance.
 * Rather than re-provisioning Upstash and paying per command, we use
 * the existing Supabase Postgres for the small KV workload (currency
 * cache, auth tokens, rate-limit counters, dedup keys, circuit-breaker
 * state). Latency is comparable for one-round-trip operations.
 *
 * TTL: `expiresAt` emulates Redis TTL. Readers ignore expired rows; a
 * sweep cron deletes them periodically. This is correct-by-construction
 * — an expired row that hasn't been swept yet is invisible to `get` and
 * `exists`, which matches Redis behavior.
 */
@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly prisma: PrismaService) {}

  async get(key: string): Promise<string | null> {
    const row = await this.prisma.cacheEntry.findUnique({
      where: { key },
      select: { value: true, expiresAt: true },
    });
    if (!row) return null;
    if (row.expiresAt && row.expiresAt <= new Date()) return null;
    return row.value;
  }

  async set(key: string, value: string): Promise<'OK'> {
    await this.prisma.cacheEntry.upsert({
      where: { key },
      create: { key, value, expiresAt: null },
      update: { value, expiresAt: null },
    });
    return 'OK';
  }

  async setex(key: string, seconds: number, value: string): Promise<'OK'> {
    const expiresAt = new Date(Date.now() + seconds * 1000);
    await this.prisma.cacheEntry.upsert({
      where: { key },
      create: { key, value, expiresAt },
      update: { value, expiresAt },
    });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    const { count } = await this.prisma.cacheEntry.deleteMany({
      where: { key: { in: keys } },
    });
    return count;
  }

  async exists(...keys: string[]): Promise<number> {
    if (keys.length === 0) return 0;
    return this.prisma.cacheEntry.count({
      where: {
        key: { in: keys },
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
    });
  }

  async expire(key: string, seconds: number): Promise<number> {
    const expiresAt = new Date(Date.now() + seconds * 1000);
    const { count } = await this.prisma.cacheEntry.updateMany({
      where: { key },
      data: { expiresAt },
    });
    return count;
  }

  /**
   * Atomic increment of a counter. Inserts with value=1 if missing,
   * otherwise increments the existing value. Used by CircuitBreaker
   * for failure counts. Preserves the row's existing expiresAt.
   */
  async incr(key: string): Promise<number> {
    const result = await this.prisma.$queryRaw<Array<{ value: string }>>`
      INSERT INTO cache_entries (key, value, expires_at, updated_at)
      VALUES (${key}, '1', NULL, NOW())
      ON CONFLICT (key) DO UPDATE
        SET value = (cache_entries.value::bigint + 1)::text,
            updated_at = NOW()
      RETURNING value
    `;
    return Number(result[0]?.value ?? 0);
  }

  /**
   * Delete every key matching a `*`-glob pattern. Used by
   * AvailabilityRulesService to invalidate cache families.
   * The `*` wildcard maps to SQL `%`.
   */
  async delByPattern(pattern: string): Promise<number> {
    const sqlPattern = pattern.replace(/%/g, '\\%').replace(/\*/g, '%');
    const { count } = await this.prisma.cacheEntry.deleteMany({
      where: { key: { contains: sqlPattern } },
    });
    return count;
  }

  /**
   * Liveness probe for the cache backend. Used by the health check.
   * Since the backend is Postgres, a successful no-op SELECT proves
   * the connection is alive.
   */
  async ping(): Promise<'PONG'> {
    await this.prisma.$queryRaw`SELECT 1`;
    return 'PONG';
  }

  /**
   * Delete all expired entries. Safe to call periodically; rows that
   * are expired but not yet swept are already invisible to `get` /
   * `exists`. An Inngest cron calls this hourly.
   */
  async sweep(): Promise<number> {
    const { count } = await this.prisma.cacheEntry.deleteMany({
      where: { expiresAt: { lte: new Date() } },
    });
    return count;
  }
}
