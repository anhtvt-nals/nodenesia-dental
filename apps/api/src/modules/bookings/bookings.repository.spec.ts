import { describe, expect, it, vi } from 'vitest';
import { BookingsRepository } from './bookings.repository.js';

describe('BookingsRepository', () => {
  it('does not queue reminders whose scheduled time has already passed', async () => {
    const notificationLog = { create: vi.fn(), createMany: vi.fn() };
    const startsAt = new Date(Date.now() + 90 * 60_000);
    const prisma = { $transaction: vi.fn(async (work) => work({ booking: { create: vi.fn().mockResolvedValue({ id: 'booking-id', code: 'DNT-TEST', startsAt }) }, notificationLog })) };
    const repository = new BookingsRepository(prisma as never);

    await repository.create({ patientId: 'patient-id', doctorId: 'doctor-id', serviceId: 'service-id', startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + 45 * 60_000).toISOString() });

    expect(notificationLog.create).toHaveBeenCalledTimes(1);
    expect(notificationLog.createMany).not.toHaveBeenCalled();
  });
});
