import { describe, expect, it, vi } from 'vitest';
import { AdminServicesService } from './admin-services.service.js';

describe('AdminServicesService', () => {
  it('writes an audit row when staff changes a service', async () => {
    const repository = { findById: vi.fn().mockResolvedValue({ id: 'service-id', name: 'Old name' }), update: vi.fn().mockResolvedValue({ id: 'service-id', name: 'New name' }) };
    const audit = { record: vi.fn().mockResolvedValue(undefined) };
    const service = new AdminServicesService(repository as never, audit as never);

    await service.update('service-id', { name: 'New name' }, { userId: 'user-id', ip: '127.0.0.1' });

    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'update', entity: 'service', entityId: 'service-id', userId: 'user-id' }));
  });
});
