import { Module } from '@nestjs/common';
import { SmsService } from './sms.service';
import { SmsHandler } from './sms.processor';
import { SmsEventListener } from './sms-event.listener';
import { MorningSummaryHandler } from './morning-summary.processor';
import { WeeklyDigestHandler } from './weekly-digest.processor';
import { smsProviderFactory } from './providers';

/**
 * SMS module for provider-facing notifications.
 * Provides SMS delivery via configurable provider (Twilio/Plivo) +
 * morning summary + weekly digest handlers. Each handler is invoked
 * by an Inngest function defined in apps/api/src/inngest/functions/.
 */
@Module({
  providers: [
    smsProviderFactory,
    SmsService,
    SmsHandler,
    SmsEventListener,
    MorningSummaryHandler,
    WeeklyDigestHandler,
  ],
  exports: [SmsService, SmsHandler, MorningSummaryHandler, WeeklyDigestHandler],
})
export class SmsModule {}
