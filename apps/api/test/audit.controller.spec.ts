import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuditController } from '@/audit/audit.controller';
import type { AuditService } from '@/audit/audit.service';

function makeService() {
  return {
    query: vi.fn(),
  };
}

describe('AuditController.list', () => {
  let controller: AuditController;
  let service: ReturnType<typeof makeService>;

  beforeEach(() => {
    service = makeService();
    controller = new AuditController(service as unknown as AuditService);
  });

  it('forwards tenantId, filters, and pagination defaults to the service', async () => {
    service.query.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

    await controller.list('tenant-1', {});

    expect(service.query).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      entityType: undefined,
      actorId: undefined,
      action: undefined,
      from: undefined,
      to: undefined,
      page: 1,
      limit: 20,
    });
  });

  it('parses ISO date filters into Date objects', async () => {
    service.query.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

    await controller.list('tenant-1', {
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-05-31T23:59:59.000Z',
    });

    const call = service.query.mock.calls[0]![0];
    expect(call.from).toBeInstanceOf(Date);
    expect(call.to).toBeInstanceOf(Date);
    expect((call.from as Date).toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect((call.to as Date).toISOString()).toBe('2026-05-31T23:59:59.000Z');
  });

  it('passes through actorId, entityType, and action filters', async () => {
    service.query.mockResolvedValue({ data: [], meta: { total: 0, page: 1, limit: 20, totalPages: 0 } });

    await controller.list('tenant-1', {
      actorId: 'user-99',
      entityType: 'Booking',
      action: 'DELETE' as never,
      page: 3,
      limit: 50,
    });

    expect(service.query).toHaveBeenCalledWith({
      tenantId: 'tenant-1',
      entityType: 'Booking',
      actorId: 'user-99',
      action: 'DELETE',
      from: undefined,
      to: undefined,
      page: 3,
      limit: 50,
    });
  });
});
