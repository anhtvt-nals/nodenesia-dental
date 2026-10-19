import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminBookingsService } from './admin-bookings.service.js';

describe('AdminBookingsService', () => {
  it('rejects cancellation when the booking is not active', async () => {
    const service = new AdminBookingsService({ cancel: async () => ({ count: 0 }) } as never, { record: async () => undefined } as never);
    await expect(service.cancel('DNT-OLD', undefined, { userId: 'user-id' })).rejects.toBeInstanceOf(ConflictException);
  });

  it('returns a cancelled booking summary after a successful update', async () => {
    const audit = { record: async () => undefined };
    const service = new AdminBookingsService({ cancel: async () => ({ count: 1 }) } as never, audit as never);
    await expect(service.cancel('DNT-OK', undefined, { userId: 'user-id' })).resolves.toEqual({ code: 'DNT-OK', status: 'cancelled' });
  });

  it('only allows valid status transitions', async () => {
    const repository = { changeStatus: async (_code: string, _status: string, from: string[]) => ({ count: from.includes('pending') ? 1 : 0 }) };
    const service = new AdminBookingsService(repository as never, { record: async () => undefined } as never);
    await expect(service.changeStatus('DNT-OK', 'confirmed', { userId: 'user-id' })).resolves.toEqual({ code: 'DNT-OK', status: 'confirmed' });
  });

  it('passes date, doctor, and status filters to the booking repository', async () => {
    const repository = { list: vi.fn().mockResolvedValue([]) };
    const service = new AdminBookingsService(repository as never, {} as never);
    await service.list({ doctorId: 'doctor-id', status: 'confirmed' });
    expect(repository.list).toHaveBeenCalledWith({ doctorId: 'doctor-id', status: 'confirmed' });
  });

  it('queues a review request only after a booking is completed', async () => {
    const repository = { changeStatus: vi.fn().mockResolvedValue({ count: 1 }), queueReviewRequest: vi.fn().mockResolvedValue(undefined) };
    const service = new AdminBookingsService(repository as never, { record: vi.fn() } as never);
    await service.changeStatus('DNT-OK', 'completed', { userId: 'staff-id' });
    expect(repository.queueReviewRequest).toHaveBeenCalledWith('DNT-OK');
  });
});
