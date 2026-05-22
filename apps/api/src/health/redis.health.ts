import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorService,
  type HealthIndicatorResult,
} from '@nestjs/terminus';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RedisHealthIndicator {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
    private readonly redisService: RedisService,
  ) {}

  async isHealthy<Key extends string = string>(
    key: Key,
  ): Promise<HealthIndicatorResult<Key>> {
    const indicator = this.healthIndicatorService.check(key);

    try {
      const result = await this.redisService.ping();
      if (result !== 'PONG') {
        return indicator.down('Cache ping did not return PONG');
      }
      return indicator.up();
    } catch (error) {
      return indicator.down(
        error instanceof Error ? error.message : 'Cache ping failed',
      );
    }
  }
}
