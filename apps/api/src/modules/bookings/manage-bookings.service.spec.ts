import * as argon2 from 'argon2';
import { describe, expect, it, vi } from 'vitest';
import { ManageBookingsService } from './manage-bookings.service.js';

describe('ManageBookingsService', () => {
  it('only reschedules an active booking into an available clinic-local slot', async () => {
    const token = 'a-very-long-management-token';
    const booking = {
      id: 'booking-id', code: 'BOOK-001', manageTokenHash: await argon2.hash(token), status: 'confirmed',
      startsAt: new Date('2099-11-04T02:00:00.000Z'), serviceId: 'service-id', doctorId: 'doctor-id', service: { durationMinutes: 45 },
    };
    const tx = { booking: { update: vi.fn() }, notificationLog: { create: vi.fn() } };
    const prisma = {
      booking: { findUnique: vi.fn().mockResolvedValue(booking) },
      clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ timezone: 'Asia/Jakarta', cancelCutoffHours: 2 }) },
      $transaction: vi.fn(async (work) => work(tx)),
    };
    const availability = { find: vi.fn().mockResolvedValue([{ start: '10:00' }]) };
    const service = new ManageBookingsService(prisma as never, availability as never);

    await expect(service.reschedule(booking.code, token, '2099-11-04T02:00:00.000Z')).resolves.toMatchObject({ startsAt: '2099-11-04T02:00:00.000Z' });
    expect(availability.find).not.toHaveBeenCalled();

    await service.reschedule(booking.code, token, '2099-11-04T03:00:00.000Z');
    expect(availability.find).toHaveBeenCalledWith('service-id', '2099-11-04', 'doctor-id');
    expect(tx.booking.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ endsAt: new Date('2099-11-04T03:45:00.000Z') }) }));
    expect(tx.notificationLog.create).toHaveBeenCalled();
  });
});
