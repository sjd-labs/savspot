import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IcalFeedService {
  private readonly logger = new Logger(IcalFeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async generateFeed(tenantSlug: string, token: string): Promise<string> {
    if (!token) {
      throw new UnauthorizedException('Missing ical_feed_token');
    }

    const tenant = await this.prisma.tenant.findUnique({
      where: { slug: tenantSlug },
      select: { id: true, name: true, timezone: true },
    });

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    const connection = await this.prisma.calendarConnection.findUnique({
      where: { icalFeedToken: token },
      select: { id: true, tenantId: true, userId: true },
    });

    if (!connection || connection.tenantId !== tenant.id) {
      throw new UnauthorizedException('Invalid feed token');
    }

    // Limit to recent + future bookings to avoid unbounded query
    const LOOKBACK_DAYS = 90;
    const lookbackDate = new Date();
    lookbackDate.setDate(lookbackDate.getDate() - LOOKBACK_DAYS);

    const bookings = await this.prisma.booking.findMany({
      where: {
        tenantId: tenant.id,
        status: 'CONFIRMED',
        startTime: { gte: lookbackDate },
      },
      include: {
        service: { select: { name: true } },
        client: { select: { name: true, email: true } },
      },
      orderBy: { startTime: 'asc' },
    });

    // Stable suffix for iCal UIDs. This was historically hardcoded as
    // `@savspot.com` (a typo — should have been `.co`). Changing the UID
    // makes already-synced calendars treat every event as new, so we keep
    // the historical typo as the default to avoid mass duplication on
    // existing feeds. Set ICAL_UID_DOMAIN (e.g. via `branding.icalUidDomain`
    // → fed by config) when standing up a new deployment to use the correct
    // domain from day one.
    const icalUidDomain = this.configService.get<string>(
      'branding.icalUidDomain',
      'savspot.com',
    );
    const now = this.formatDate(new Date());
    const lines: string[] = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      `PRODID:-//SavSpot//${tenant.name}//EN`,
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeIcal(tenant.name)} Bookings`,
      `X-WR-TIMEZONE:${tenant.timezone}`,
    ];

    for (const booking of bookings) {
      const summary = `${booking.service.name} - ${booking.client.name}`;
      const description = booking.notes
        ? `Client: ${booking.client.name}\\nEmail: ${booking.client.email ?? 'N/A'}\\nNotes: ${booking.notes}`
        : `Client: ${booking.client.name}\\nEmail: ${booking.client.email ?? 'N/A'}`;

      lines.push(
        'BEGIN:VEVENT',
        `UID:${booking.id}@${icalUidDomain}`,
        `DTSTAMP:${now}`,
        `DTSTART:${this.formatDate(booking.startTime)}`,
        `DTEND:${this.formatDate(booking.endTime)}`,
        `SUMMARY:${this.escapeIcal(summary)}`,
        `DESCRIPTION:${this.escapeIcal(description)}`,
        `STATUS:CONFIRMED`,
        'END:VEVENT',
      );
    }

    lines.push('END:VCALENDAR');

    this.logger.debug(
      `Generated iCal feed for tenant ${tenantSlug} with ${bookings.length} events`,
    );

    return lines.join('\r\n');
  }

  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }

  private escapeIcal(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }
}
