import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CommunicationsUsageService } from '@/communications/communications-usage.service';

function makePrisma() {
  return {
    tenant: { findUniqueOrThrow: vi.fn() },
    communication: { count: vi.fn() },
  };
}

describe('CommunicationsUsageService.getSmsUsage', () => {
  let prisma: ReturnType<typeof makePrisma>;
  let service: CommunicationsUsageService;

  beforeEach(() => {
    prisma = makePrisma();
    service = new CommunicationsUsageService(prisma as never);
    // Freeze "now" to mid-May 2026 so period bounds are deterministic.
    vi.setSystemTime(new Date(Date.UTC(2026, 4, 15, 12, 0, 0)));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns quota, used, and remaining for the TEAM tier', async () => {
    prisma.tenant.findUniqueOrThrow.mockResolvedValue({ subscriptionTier: 'TEAM' });
    prisma.communication.count.mockResolvedValue(47);

    const result = await service.getSmsUsage('tenant-1');

    expect(result.tier).toBe('TEAM');
    expect(result.quota).toBe(500);
    expect(result.used).toBe(47);
    expect(result.remaining).toBe(453);
    expect(result.period.start).toBe('2026-05-01T00:00:00.000Z');
    expect(result.period.end).toBe('2026-06-01T00:00:00.000Z');
  });

  it('only counts SMS communications past the QUEUED status within the period', async () => {
    prisma.tenant.findUniqueOrThrow.mockResolvedValue({ subscriptionTier: 'STARTER' });
    prisma.communication.count.mockResolvedValue(3);

    await service.getSmsUsage('tenant-1');

    expect(prisma.communication.count).toHaveBeenCalledWith({
      where: {
        tenantId: 'tenant-1',
        channel: 'SMS',
        createdAt: {
          gte: new Date('2026-05-01T00:00:00.000Z'),
          lt: new Date('2026-06-01T00:00:00.000Z'),
        },
        status: { in: ['SENDING', 'SENT', 'DELIVERED', 'OPENED', 'BOUNCED', 'FAILED'] },
      },
    });
  });

  it('clamps remaining at 0 when usage exceeds quota', async () => {
    prisma.tenant.findUniqueOrThrow.mockResolvedValue({ subscriptionTier: 'STARTER' });
    prisma.communication.count.mockResolvedValue(150); // STARTER quota is 100

    const result = await service.getSmsUsage('tenant-1');

    expect(result.quota).toBe(100);
    expect(result.used).toBe(150);
    expect(result.remaining).toBe(0);
  });
});
