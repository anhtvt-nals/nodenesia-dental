import { describe, expect, it } from 'vitest';
import { BookingsService } from './bookings.service.js';

describe('BookingsService', () => {
  it('creates a confirmed booking with a public code', async () => {
    const service = new BookingsService({ create: async (input) => ({ ...input, code: 'DNT-001', status: 'confirmed', manageToken: 'opaque-token' }) });
    await expect(service.create({ patientId: 'patient', doctorId: 'doctor', serviceId: 'service', startsAt: '2026-11-02T02:00:00.000Z', endsAt: '2026-11-02T02:45:00.000Z' })).resolves.toMatchObject({ code: 'DNT-001', status: 'confirmed' });
  });
});
