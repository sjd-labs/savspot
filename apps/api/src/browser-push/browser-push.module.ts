import { Module } from '@nestjs/common';
import { BrowserPushController } from './browser-push.controller';
import { BrowserPushService } from './browser-push.service';
import { BrowserPushHandler } from './browser-push.processor';
import { BrowserPushEventListener } from './browser-push-event.listener';

/**
 * Manages browser push (Web Push) subscriptions and delivery.
 * Uses web-push library with VAPID keys for secure push messaging.
 * Operates in no-op mode when VAPID keys are not configured.
 * BrowserPushHandler is exported for the Inngest function in
 * apps/api/src/inngest/functions/communications/.
 */
@Module({
  controllers: [BrowserPushController],
  providers: [BrowserPushService, BrowserPushHandler, BrowserPushEventListener],
  exports: [BrowserPushService, BrowserPushHandler],
})
export class BrowserPushModule {}
