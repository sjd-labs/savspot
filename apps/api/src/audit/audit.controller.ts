import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RequiresLicense } from '@savspot/ee';
import { TenantRoles } from '../common/decorators/tenant-roles.decorator';
import { TenantRolesGuard } from '../common/guards/tenant-roles.guard';
import { AuditService } from './audit.service';
import { ListAuditLogsDto } from './dto/list-audit-logs.dto';

@ApiTags('Audit')
@ApiBearerAuth()
@RequiresLicense()
@UseGuards(TenantRolesGuard)
@Controller('tenants/:tenantId/audit-logs')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Get()
  @TenantRoles('OWNER', 'ADMIN')
  @ApiOperation({
    summary: 'List audit log entries for the tenant (Enterprise)',
    description:
      'Returns paginated audit log rows scoped to the tenant. Supports filtering by actor, entity type, action, and timestamp range.',
  })
  @ApiParam({ name: 'tenantId', type: 'string', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Paginated audit log entries' })
  @ApiResponse({ status: 403, description: 'License key missing or wrong tenant role' })
  async list(@Param('tenantId') tenantId: string, @Query() query: ListAuditLogsDto) {
    return this.auditService.query({
      tenantId,
      entityType: query.entityType,
      actorId: query.actorId,
      action: query.action,
      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
      page: query.page ?? 1,
      limit: query.limit ?? 20,
    });
  }
}
