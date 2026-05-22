import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TIER_FEATURES } from '../subscriptions/entitlements';

type Tier = keyof typeof TIER_FEATURES;

@Injectable()
export class CommunicationsUsageService {
  constructor(private readonly prisma: PrismaService) {}

  async getSmsUsage(tenantId: string) {
    const tenant = await this.prisma.tenant.findUniqueOrThrow({
      where: { id: tenantId },
      select: { subscriptionTier: true },
    });
    const tier = tenant.subscriptionTier as Tier;
    const quota = TIER_FEATURES[tier].smsAllocation;

    const now = new Date();
    const periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
    const periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));

    // Anything past QUEUED counts toward usage — Twilio bills for FAILED
    // and BOUNCED just as it bills for DELIVERED, so they consume quota.
    const used = await this.prisma.communication.count({
      where: {
        tenantId,
        channel: 'SMS',
        createdAt: { gte: periodStart, lt: periodEnd },
        status: { in: ['SENDING', 'SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED'] },
      },
    });

    const remaining = Number.isFinite(quota) ? Math.max(0, quota - used) : Infinity;

    return {
      tier,
      period: { start: periodStart.toISOString(), end: periodEnd.toISOString() },
      quota: Number.isFinite(quota) ? quota : null,
      used,
      remaining: Number.isFinite(remaining) ? remaining : null,
    };
  }
}
