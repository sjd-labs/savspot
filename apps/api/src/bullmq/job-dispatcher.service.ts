import { Injectable, Logger } from '@nestjs/common';
import { inngest } from '../inngest/inngest.client';

/**
 * Inngest job options (subset of the old BullMQ JobsOptions surface that the
 * dispatcher knows how to translate). Producer code keeps passing BullMQ-style
 * opts so call sites can stay stable; we use the `delay` field to schedule the
 * Inngest event in the future. Other fields (attempts, backoff, removeOn*) are
 * accepted-and-ignored — Inngest controls retries on the function definition.
 */
export interface DispatchOptions {
  /** Milliseconds to delay before dispatching (translates to Inngest `ts`). */
  delay?: number;
  /** Number of retry attempts (accepted for back-compat; controlled on function). */
  attempts?: number;
  /** Backoff config (accepted for back-compat; controlled on function). */
  backoff?: { type?: string; delay?: number };
  /** removeOnComplete (accepted for back-compat; no Inngest equivalent). */
  removeOnComplete?: unknown;
  /** removeOnFail (accepted for back-compat; no Inngest equivalent). */
  removeOnFail?: unknown;
  /** Job ID for BullMQ dedup (accepted for back-compat; ignored on Inngest). */
  jobId?: string;
}

/**
 * Single dispatch entry point for all background work.
 *
 * Producer code calls `dispatcher.dispatch(queueName, jobName, data, opts?)`
 * which translates to an Inngest event with name `${queueName}/${jobName}`.
 * The (queue, job) naming convention is preserved as the legacy contract;
 * post Phase-4 cleanup B there is no BullMQ backend left to swap to.
 */
@Injectable()
export class JobDispatcher {
  private readonly logger = new Logger(JobDispatcher.name);

  /**
   * The Inngest client is imported as a module-level singleton rather than
   * injected, so the dispatcher can live in its own module without creating
   * a circular dependency between InngestModule and the many feature modules
   * that need the dispatcher.
   */
  private readonly inngestClient = inngest;

  async dispatch<TPayload extends object>(
    queueName: string,
    jobName: string,
    data: TPayload,
    options?: DispatchOptions,
  ): Promise<void> {
    const event = this.toEvent(queueName, jobName, data, options);
    await this.inngestClient.send(event as never);
  }

  /**
   * Bulk variant for enqueueing many jobs onto the same queue at once.
   * One Inngest round-trip instead of N. Used by digest fanout, etc.
   */
  async dispatchBulk<TPayload extends object>(
    queueName: string,
    jobs: Array<{ name: string; data: TPayload; opts?: DispatchOptions }>,
  ): Promise<void> {
    const events = jobs.map((j) => this.toEvent(queueName, j.name, j.data, j.opts));
    await this.inngestClient.send(events as never);
    this.logger.debug(
      `Dispatched ${events.length} event(s) to Inngest for queue "${queueName}"`,
    );
  }

  /**
   * Map (queue, jobName, data, options) → Inngest event payload.
   *
   * Event name convention: `${queue}/${jobName}` so each former BullMQ pair
   * produces a stable, predictable Inngest event name. The payload is the
   * data verbatim; processors that previously read `job.data` now read
   * `event.data` inside their Inngest function — same shape.
   */
  private toEvent(
    queueName: string,
    jobName: string,
    data: unknown,
    options?: DispatchOptions,
  ): { name: string; data: unknown; ts?: number } {
    const event: { name: string; data: unknown; ts?: number } = {
      name: `${queueName}/${jobName}`,
      data,
    };
    if (options?.delay && Number.isFinite(options.delay)) {
      event.ts = Date.now() + Number(options.delay);
    }
    return event;
  }
}
