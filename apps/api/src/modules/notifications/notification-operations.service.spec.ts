import { describe, expect, it, vi } from 'vitest';
import { NotificationOperationsService } from './notification-operations.service.js';

describe('NotificationOperationsService', () => {
  it('creates a fresh queued log when staff resends a notification', async () => {
    const prisma = { notificationLog: { findUnique: vi.fn().mockResolvedValue({ id: 'old-log', bookingId: 'booking-id', type: 'confirmation', channel: 'whatsapp' }), create: vi.fn().mockResolvedValue({ id: 'new-log' }) } };
    const audit = { record: vi.fn() };
    const service = new NotificationOperationsService(prisma as never, audit as never);
    await expect(service.resend('old-log', { userId: 'staff-id' })).resolves.toEqual({ id: 'new-log' });
    expect(prisma.notificationLog.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ bookingId: 'booking-id', provider: 'pending' }) }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'resend', entity: 'notification' }));
  });
});
