import { describe, expect, it } from 'vitest';
import { createPublicBookingSchema } from './booking.js';

describe('createPublicBookingSchema', () => {
  it('accepts the minimum public booking payload', () => {
    expect(
      createPublicBookingSchema.parse({
        name: 'Ayu Putri',
        phone: '+628123456789',
        serviceId: 'service-scaling',
        startsAt: '2026-11-01T02:00:00.000Z',
      }),
    ).toMatchObject({
      name: 'Ayu Putri',
      phone: '+628123456789',
      serviceId: 'service-scaling',
    });
  });

  it('rejects a populated honeypot field', () => {
    expect(() =>
      createPublicBookingSchema.parse({
        name: 'Ayu Putri',
        phone: '+628123456789',
        serviceId: 'service-scaling',
        startsAt: '2026-11-01T02:00:00.000Z',
        website: 'https://spam.example',
      }),
    ).toThrow();
  });
});
