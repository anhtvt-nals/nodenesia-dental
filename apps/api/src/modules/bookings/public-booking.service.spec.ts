import { BadRequestException, ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { PublicBookingService } from './public-booking.service.js';

describe('PublicBookingService', () => {
  it('rejects public bookings while maintenance mode is enabled', async () => {
    const patients = { upsert: vi.fn() };
    const availability = { find: vi.fn() };
    const bookings = { create: vi.fn() };
    const prisma = {
      service: { findFirst: vi.fn() },
      clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ maintenanceMode: true }) },
    };
    const service = new PublicBookingService(prisma as never, patients as never, availability as never, bookings as never);

    await expect(service.create({
      name: 'Booking Test', phone: '+628123456789', serviceId: 'scaling', startsAt: '2026-11-04T02:00:00.000Z',
      bookingFor: 'self', patientType: 'new', payer: 'umum', whatsappConsent: true, dataProcessingConsent: true,
    })).rejects.toBeInstanceOf(ServiceUnavailableException);

    expect(prisma.service.findFirst).not.toHaveBeenCalled();
    expect(patients.upsert).not.toHaveBeenCalled();
  });

  it('does not create a patient when the selected slot is unavailable', async () => {
    const patients = { upsert: vi.fn() };
    const availability = { find: vi.fn().mockResolvedValue([]) };
    const bookings = { create: vi.fn() };
    const prisma = {
      service: { findFirst: vi.fn().mockResolvedValue({ id: 'service-id', durationMinutes: 45 }) },
      clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ timezone: 'Asia/Jakarta', maintenanceMode: false }) },
      booking: { count: vi.fn().mockResolvedValue(0) },
    };
    const service = new PublicBookingService(prisma as never, patients as never, availability as never, bookings as never);

    await expect(
      service.create({
        name: 'Booking Test',
        phone: '+628123456789',
        serviceId: 'scaling',
        doctorId: 'doctor-id',
        startsAt: '2026-11-04T02:00:00.000Z',
        bookingFor: 'self',
        patientType: 'new',
        birthDate: '1995-05-15',
        payer: 'umum',
        whatsappConsent: true,
        dataProcessingConsent: true,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(patients.upsert).not.toHaveBeenCalled();
    expect(bookings.create).not.toHaveBeenCalled();
  });
});
