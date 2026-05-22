import type { RedisService } from '@/redis/redis.service';
import { inngest } from '../../inngest.client';

/**
 * Hourly Inngest cron: deletes expired rows from the `cache_entries`
 * table. The KV-store reads already filter out expired rows, so this
 * sweep is purely about reclaiming space — not correctness.
 *
 * Replaces the Redis TTL eviction that we lost when we moved off
 * ioredis in favor of the Postgres-backed RedisService.
 */
export const createCacheSweepFunction = (kv: RedisService) =>
  inngest.createFunction(
    {
      id: 'cache-sweep',
      name: 'Sweep expired cache entries',
    },
    { cron: '0 * * * *' },
    async () => {
      const deleted = await kv.sweep();
      return { ok: true, deleted };
    },
  );
