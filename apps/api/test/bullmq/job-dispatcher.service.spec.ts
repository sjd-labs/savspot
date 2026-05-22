import { describe, it, expect, vi, beforeEach } from 'vitest';
import { JobDispatcher } from '@/bullmq/job-dispatcher.service';
import { QUEUE_PAYMENTS, QUEUE_GDPR } from '@/bullmq/queue.constants';

function makeInngest() {
  return {
    send: vi.fn().mockResolvedValue({ ids: ['evt-1'] }),
  };
}

describe('JobDispatcher', () => {
  let inngest: ReturnType<typeof makeInngest>;
  let dispatcher: JobDispatcher;

  beforeEach(() => {
    inngest = makeInngest();
    dispatcher = new JobDispatcher(inngest as never);
  });

  describe('dispatch', () => {
    it('sends an Inngest event with `${queue}/${job}` name and verbatim data', async () => {
      await dispatcher.dispatch(QUEUE_PAYMENTS, 'processRefund', {
        paymentId: 'p-1',
      });

      expect(inngest.send).toHaveBeenCalledTimes(1);
      expect(inngest.send).toHaveBeenCalledWith({
        name: 'payments/processRefund',
        data: { paymentId: 'p-1' },
      });
    });

    it('translates BullMQ-style delay to an absolute Inngest ts', async () => {
      const before = Date.now();
      await dispatcher.dispatch(
        QUEUE_GDPR,
        'cleanupRetention',
        { tenantId: 't-1' },
        { delay: 60_000, attempts: 5 },
      );
      const after = Date.now();

      expect(inngest.send).toHaveBeenCalledTimes(1);
      const event = inngest.send.mock.calls[0]![0] as { name: string; data: unknown; ts: number };
      expect(event.name).toBe('gdpr/cleanupRetention');
      expect(event.data).toEqual({ tenantId: 't-1' });
      expect(event.ts).toBeGreaterThanOrEqual(before + 60_000);
      expect(event.ts).toBeLessThanOrEqual(after + 60_000);
    });

    it('ignores BullMQ-only options (attempts, backoff, removeOn*, jobId)', async () => {
      await dispatcher.dispatch(
        QUEUE_PAYMENTS,
        'retryFailedPayments',
        { batch: 1 },
        {
          attempts: 3,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: { count: 10 },
          removeOnFail: { count: 50 },
          jobId: 'dedup-key-1',
        },
      );

      const event = inngest.send.mock.calls[0]![0] as { name: string; data: unknown; ts?: number };
      expect(event.name).toBe('payments/retryFailedPayments');
      expect(event.data).toEqual({ batch: 1 });
      expect(event.ts).toBeUndefined();
    });
  });

  describe('dispatchBulk', () => {
    it('sends an array of events in a single Inngest call', async () => {
      await dispatcher.dispatchBulk(QUEUE_GDPR, [
        { name: 'cleanupRetention', data: { tenantId: 't-1' } },
        { name: 'cleanupRetention', data: { tenantId: 't-2' } },
        { name: 'cleanupRetention', data: { tenantId: 't-3' } },
      ]);

      expect(inngest.send).toHaveBeenCalledTimes(1);
      const events = inngest.send.mock.calls[0]![0] as Array<{ name: string; data: unknown }>;
      expect(events).toHaveLength(3);
      expect(events.map((e) => e.data)).toEqual([
        { tenantId: 't-1' },
        { tenantId: 't-2' },
        { tenantId: 't-3' },
      ]);
      for (const event of events) {
        expect(event.name).toBe('gdpr/cleanupRetention');
      }
    });
  });
});
