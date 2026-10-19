import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { afterAll, describe, expect, it } from 'vitest';

const prisma = new PrismaClient();
const prefix = `test-${randomUUID()}`;

afterAll(async () => {
  await prisma.booking.deleteMany({ where: { code: { startsWith: prefix } } });
  await prisma.patient.deleteMany({ where: { phoneE164: { startsWith: '+628999' } } });
  await prisma.doctor.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.service.deleteMany({ where: { slug: { startsWith: prefix } } });
  await prisma.$disconnect();
});

describe('booking overlap constraint', () => {
  it('rejects overlapping active bookings but permits a slot after cancellation', async () => {
    const [doctor, service, patient] = await Promise.all([
      prisma.doctor.create({ data: { name: 'Test Doctor', slug: prefix } }),
      prisma.service.create({ data: { slug: prefix, name: 'Scaling', shortDesc: 'Test', description: 'Test', zone: 'gum', category: 'prevention', durationMinutes: 45, priceFrom: 1 } }),
      prisma.patient.create({ data: { name: 'Test Patient', phoneE164: `+628999${Date.now()}` } }),
    ]);
    const startsAt = new Date('2026-11-01T02:00:00.000Z');
    const endsAt = new Date('2026-11-01T02:45:00.000Z');
    const booking = await prisma.booking.create({ data: { code: `${prefix}-1`, patientId: patient.id, doctorId: doctor.id, serviceId: service.id, startsAt, endsAt, source: 'web' } });

    await expect(prisma.booking.create({ data: { code: `${prefix}-2`, patientId: patient.id, doctorId: doctor.id, serviceId: service.id, startsAt, endsAt, source: 'web' } })).rejects.toThrow('bookings_no_overlap');

    await prisma.booking.update({ where: { id: booking.id }, data: { status: 'cancelled' } });
    await expect(prisma.booking.create({ data: { code: `${prefix}-3`, patientId: patient.id, doctorId: doctor.id, serviceId: service.id, startsAt, endsAt, source: 'web' } })).resolves.toMatchObject({ status: 'confirmed' });
  });

  it('allows exactly one of two concurrent same-slot inserts', async () => {
    const doctor = await prisma.doctor.create({ data: { name: 'Race Doctor', slug: `${prefix}-race` } });
    const service = await prisma.service.create({ data: { slug: `${prefix}-race`, name: 'Race', shortDesc: 'Test', description: 'Test', zone: 'gum', category: 'prevention', durationMinutes: 45, priceFrom: 1 } });
    const patient = await prisma.patient.create({ data: { name: 'Race Patient', phoneE164: `+628999${Date.now()}` } });
    const create = (code: string) => prisma.booking.create({ data: { code, patientId: patient.id, doctorId: doctor.id, serviceId: service.id, startsAt: new Date('2026-11-03T02:00:00.000Z'), endsAt: new Date('2026-11-03T02:45:00.000Z'), source: 'web' } });
    const results = await Promise.allSettled([create(`${prefix}-race-1`), create(`${prefix}-race-2`)]);

    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1);
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1);
  });
});
