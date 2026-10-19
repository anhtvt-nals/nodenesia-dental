import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PublicBookingService } from './public-booking.service.js';

describe('PublicBookingService', () => {
  it('does not create a patient when the selected slot is unavailable', async () => {
    const patients = { upsert: vi.fn() };
    const availability = { find: vi.fn().mockResolvedValue([]) };
    const bookings = { create: vi.fn() };
    const prisma = {
      service: { findFirst: vi.fn().mockResolvedValue({ id: 'service-id', durationMinutes: 45 }) },
      clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ timezone: 'Asia/Jakarta' }) },
    };
    const service = new PublicBookingService(prisma as never, patients as never, availability as never, bookings as never);

    await expect(
      service.create({
        name: 'Booking Test',
        phone: '+628123456789',
        serviceId: 'scaling',
        doctorId: 'doctor-id',
        startsAt: '2026-11-04T02:00:00.000Z',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(patients.upsert).not.toHaveBeenCalled();
    expect(bookings.create).not.toHaveBeenCalled();
  });
});
