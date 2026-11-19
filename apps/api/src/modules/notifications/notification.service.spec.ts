import { describe, expect, it, vi } from 'vitest';
import { NotificationService } from './notification.service.js';

describe('NotificationService', () => {
  it('records the provider receipt after sending a queued notification', async () => {
    const prisma = {
      notificationLog: {
        findUniqueOrThrow: vi.fn().mockResolvedValue({ id: 'log-id', type: 'confirmation', booking: { code: 'BOOK-001', startsAt: new Date('2026-10-20T09:00:00Z'), patient: { name: 'Rina', phoneE164: '+628123456789' }, service: { name: 'Scaling' }, doctor: { name: 'drg. Ayu' } } }),
        update: vi.fn(),
      },
    };
    const provider = { send: vi.fn().mockResolvedValue({ id: 'fonnte-123' }) };
    const service = new NotificationService(prisma as never, provider);

    await service.sendQueued('log-id');

    expect(provider.send).toHaveBeenCalledWith(expect.objectContaining({ to: '+628123456789', text: expect.stringContaining('Rina') }));
    expect(prisma.notificationLog.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ status: 'sent', providerMsgId: 'fonnte-123' }) }));
  });
});
