import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { ManualBookingService } from './manual-booking.service.js';

describe('ManualBookingService', () => {
  it('does not create a patient when staff selects an unavailable slot', async () => {
    const patients = { upsert: vi.fn() };
    const service = new ManualBookingService({ service: { findFirst: vi.fn().mockResolvedValue({ id: 'service-id', durationMinutes: 45 }) }, clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ timezone: 'Asia/Jakarta' }) } } as never, patients as never, { find: vi.fn().mockResolvedValue([]) } as never, {} as never, {} as never);
    await expect(service.create({ name: 'Test', phone: '+628123456789', doctorId: 'doctor-id', serviceId: 'service-id', startsAt: '2099-11-04T02:00:00.000Z' }, { userId: 'staff-id' })).rejects.toBeInstanceOf(BadRequestException);
    expect(patients.upsert).not.toHaveBeenCalled();
  });
});
