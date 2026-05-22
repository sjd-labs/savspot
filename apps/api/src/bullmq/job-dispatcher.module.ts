import { Global, Module } from '@nestjs/common';
import { JobDispatcher } from './job-dispatcher.service';

/**
 * Globally available JobDispatcher. Lives in its own module (not in
 * InngestModule) to avoid a circular DI graph: InngestModule imports
 * many feature modules so their handlers can be DI'd into Inngest
 * functions; those feature modules also need JobDispatcher to enqueue
 * Inngest events. Keeping the dispatcher in its own one-provider module
 * (which imports nothing) breaks the cycle.
 */
@Global()
@Module({
  providers: [JobDispatcher],
  exports: [JobDispatcher],
})
export class JobDispatcherModule {}
