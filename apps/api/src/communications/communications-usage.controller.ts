import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { CommunicationsUsageService } from './communications-usage.service';

@ApiTags('Communications')
@ApiBearerAuth()
@UseGuards(TenantRolesGuard)
@Controller('tenants/:tenantId/communications/usage')
export class CommunicationsUsageController {
  constructor(private readonly usageService: CommunicationsUsageService) {}

  @Get('sms')
  @TenantRoles('OWNER', 'ADMIN')
  @ApiOperation({
    summary: "Get the tenant's SMS usage and remaining quota for the current calendar month",
  })
  @ApiParam({ name: 'tenantId', type: 'string' })
  @ApiResponse({
    status: 200,
    description: 'SMS usage breakdown for the current period',
    schema: {
      example: {
        tier: 'TEAM',
        period: { start: '2026-05-01T00:00:00.000Z', end: '2026-06-01T00:00:00.000Z' },
        quota: 500,
        used: 47,
        remaining: 453,
      },
    },
  })
  async getSmsUsage(@Param('tenantId') tenantId: string) {
    return this.usageService.getSmsUsage(tenantId);
  }
}
