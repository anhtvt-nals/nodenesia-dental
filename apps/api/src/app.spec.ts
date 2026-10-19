import { describe, expect, it } from 'vitest';
import { createApi } from './main.js';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

describe('API bootstrap', () => {
  it('serves the versioned health endpoint', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/health' });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    expect(response.headers['x-content-type-options']).toBe('nosniff');
    expect(response.headers['x-frame-options']).toBe('DENY');
  });

  it('serves public settings', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/settings' });
    await app.close();

    expect(response.statusCode).toBe(200);
  });

  it('protects admin settings from anonymous requests', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/settings' });
    await app.close();

    expect(response.statusCode).toBe(401);
  });

  it('keeps the rotated refresh token in an HttpOnly cookie', async () => {
    const prisma = new PrismaClient();
    const email = `auth-${Date.now()}@example.test`;
    await prisma.user.create({ data: { email, name: 'Auth test', role: 'owner', passwordHash: await argon2.hash('a-safe-test-password') } });
    const app = await createApi();
    const login = await app.inject({ method: 'POST', url: '/api/v1/auth/login', payload: { email, password: 'a-safe-test-password' } });
    const cookie = String(login.headers['set-cookie']);
    const refresh = await app.inject({ method: 'POST', url: '/api/v1/auth/refresh', headers: { cookie: cookie.split(';')[0] } });
    await app.close();
    await prisma.user.delete({ where: { email } });
    await prisma.$disconnect();

    expect(login.statusCode).toBe(201);
    expect(login.json()).not.toHaveProperty('refreshToken');
    expect(cookie).toContain('HttpOnly');
    expect(refresh.statusCode).toBe(201);
    expect(refresh.json()).not.toHaveProperty('refreshToken');
  });

  it('protects admin bookings from anonymous requests', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/bookings' });
    await app.close();

    expect(response.statusCode).toBe(401);
  });

  it('protects admin catalogue from anonymous requests', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/services' });
    await app.close();

    expect(response.statusCode).toBe(401);
  });

  it('protects doctor schedule administration from anonymous requests', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/doctors' });
    await app.close();

    expect(response.statusCode).toBe(401);
  });

  it('forbids staff from owner-only user administration', async () => {
    const app = await createApi();
    const token = await new JwtService({ secret: process.env.JWT_SECRET ?? 'local-development-secret-change-me' }).signAsync({ role: 'staff' }, { subject: 'staff-id' });
    const response = await app.inject({ method: 'GET', url: '/api/v1/admin/users', headers: { authorization: `Bearer ${token}` } });
    await app.close();

    expect(response.statusCode).toBe(403);
  });

  it('forbids staff from changing clinic settings', async () => {
    const app = await createApi();
    const token = await new JwtService({ secret: process.env.JWT_SECRET ?? 'local-development-secret-change-me' }).signAsync({ role: 'staff' }, { subject: 'staff-id' });
    const response = await app.inject({ method: 'PATCH', url: '/api/v1/admin/settings', headers: { authorization: `Bearer ${token}` }, payload: { name: 'Unauthorized change' } });
    await app.close();

    expect(response.statusCode).toBe(403);
  });

  it('serves active public services', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/services' });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toContainEqual(expect.objectContaining({ slug: 'scaling', durationMinutes: 45 }));
  });

  it('serves active public doctors', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/doctors' });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toContainEqual(expect.objectContaining({ slug: 'drg-ayu' }));
  });

  it('serves public FAQs', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/faqs' });
    await app.close();

    expect(response.statusCode).toBe(200);
  });

  it('returns slots for a service and date', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/slots?serviceId=scaling&date=2026-11-02' });
    await app.close();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toContainEqual(expect.objectContaining({ start: '09:00', end: '09:45' }));
  });

  it('does not return slots outside the configured booking horizon', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/slots?serviceId=scaling&date=2027-02-01' });
    await app.close();

    expect(response.json()).toEqual([]);
  });

  it('rejects an invalid slot query', async () => {
    const app = await createApi();
    const response = await app.inject({
      method: 'GET',
      url: '/api/v1/public/slots?serviceId=scaling&date=not-a-date',
    });
    await app.close();

    expect(response.statusCode).toBe(400);
  });

  it('removes slots during a clinic-wide time off', async () => {
    const prisma = new PrismaClient();
    const timeOff = await prisma.timeOff.create({ data: { startsAt: new Date('2026-11-02T02:00:00.000Z'), endsAt: new Date('2026-11-02T03:00:00.000Z'), reason: 'Test' } });
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/slots?serviceId=scaling&date=2026-11-02' });
    await app.close();
    await prisma.timeOff.delete({ where: { id: timeOff.id } });
    await prisma.$disconnect();

    expect(response.json().map((slot: { start: string }) => slot.start)).not.toContain('09:00');
  });

  it('removes slots covered by a confirmed booking', async () => {
    const prisma = new PrismaClient();
    const [doctor, service, patient] = await Promise.all([prisma.doctor.findUniqueOrThrow({ where: { slug: 'drg-ayu' } }), prisma.service.findUniqueOrThrow({ where: { slug: 'scaling' } }), prisma.patient.create({ data: { name: 'Slot Test', phoneE164: `+628777${Date.now()}` } })]);
    const booking = await prisma.booking.create({ data: { code: `SLOT-${Date.now()}`, patientId: patient.id, doctorId: doctor.id, serviceId: service.id, startsAt: new Date('2026-11-02T02:00:00.000Z'), endsAt: new Date('2026-11-02T02:45:00.000Z'), source: 'web' } });
    const app = await createApi();
    const response = await app.inject({ method: 'GET', url: '/api/v1/public/slots?serviceId=scaling&date=2026-11-02&doctorId=' + doctor.id });
    await app.close();
    await prisma.booking.delete({ where: { id: booking.id } });
    await prisma.patient.delete({ where: { id: patient.id } });
    await prisma.$disconnect();

    expect(response.json().map((slot: { start: string }) => slot.start)).not.toContain('09:00');
  });

  it('creates a public booking for an available slot', async () => {
    const prisma = new PrismaClient();
    const doctor = await prisma.doctor.findUniqueOrThrow({ where: { slug: 'drg-ayu' } });
    const phone = `+62866${String(Date.now()).slice(-8)}`;
    const app = await createApi();
    const response = await app.inject({ method: 'POST', url: '/api/v1/public/bookings', payload: { name: 'Booking Test', phone, serviceId: 'scaling', doctorId: doctor.id, startsAt: '2026-11-04T02:00:00.000Z' } });
    await app.close();
    const body = response.json() as { code: string };
    const logs = await prisma.notificationLog.findMany({ where: { booking: { code: body.code } }, select: { type: true } });
    await prisma.booking.deleteMany({ where: { code: body.code } });
    await prisma.patient.deleteMany({ where: { phoneE164: phone } });
    await prisma.$disconnect();

    expect(response.statusCode).toBe(201);
    expect(body.code).toMatch(/^DNT-/);
    expect(logs.map((log) => log.type)).toEqual(expect.arrayContaining(['confirmation', 'reminder_h1', 'reminder_2h']));
  });

  it('rejects an invalid public booking with 400', async () => {
    const app = await createApi();
    const response = await app.inject({ method: 'POST', url: '/api/v1/public/bookings', payload: { name: 'Invalid', phone: 'not-a-phone' } });
    await app.close();

    expect(response.statusCode).toBe(400);
  });
});
