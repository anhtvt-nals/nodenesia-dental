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
        birthDate: '1995-05-15',
        whatsappConsent: true,
        dataProcessingConsent: true,
      }),
    ).toMatchObject({
      name: 'Ayu Putri',
      phone: '+628123456789',
      serviceId: 'service-scaling',
    });
  });

  it('accepts a streamlined 1-step booking payload without phone or birthDate', () => {
    expect(
      createPublicBookingSchema.parse({
        name: 'Budi Santoso',
        serviceId: 'konsultasi-umum',
        doctorId: 'doc-1',
        startsAt: '2026-11-01T02:00:00.000Z',
        complaint: 'Gigi geraham nyeri saat mengunyah',
      }),
    ).toMatchObject({
      name: 'Budi Santoso',
      serviceId: 'konsultasi-umum',
      doctorId: 'doc-1',
      complaint: 'Gigi geraham nyeri saat mengunyah',
      whatsappConsent: true,
      dataProcessingConsent: true,
    });
  });

  it('accepts a streamlined 1-step booking payload with phone and without birthDate', () => {
    expect(
      createPublicBookingSchema.parse({
        name: 'Budi Santoso',
        phone: '+6281234567890',
        serviceId: 'konsultasi-umum',
        doctorId: 'doc-1',
        startsAt: '2026-11-01T02:00:00.000Z',
        complaint: 'Gigi geraham nyeri saat mengunyah',
      }),
    ).toMatchObject({
      name: 'Budi Santoso',
      phone: '+6281234567890',
      serviceId: 'konsultasi-umum',
      doctorId: 'doc-1',
      complaint: 'Gigi geraham nyeri saat mengunyah',
      whatsappConsent: true,
      dataProcessingConsent: true,
    });
  });

  it('strips sensitive medical, record, and insurance data from public booking payloads', () => {
    const booking = createPublicBookingSchema.parse({
      name: 'Budi Santoso',
      phone: '+6281234567890',
      serviceId: 'konsultasi-umum',
      startsAt: '2026-11-01T02:00:00.000Z',
      medicalFlags: { hypertension: true },
      medicalOther: 'Catatan medis privat',
      medicalRecordNo: 'RM-12345',
      insuranceName: 'Asuransi Contoh',
      insuranceNumber: 'POLIS-12345',
    });

    expect(booking).not.toHaveProperty('medicalFlags');
    expect(booking).not.toHaveProperty('medicalOther');
    expect(booking).not.toHaveProperty('medicalRecordNo');
    expect(booking).not.toHaveProperty('insuranceName');
    expect(booking).not.toHaveProperty('insuranceNumber');
  });

  it('rejects a populated honeypot field', () => {
    expect(() =>
      createPublicBookingSchema.parse({
        name: 'Ayu Putri',
        phone: '+628123456789',
        serviceId: 'service-scaling',
        startsAt: '2026-11-01T02:00:00.000Z',
        birthDate: '1995-05-15',
        whatsappConsent: true,
        dataProcessingConsent: true,
        website: 'https://spam.example',
      }),
    ).toThrow();
  });
});
