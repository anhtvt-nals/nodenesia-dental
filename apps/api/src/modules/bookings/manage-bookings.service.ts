import { ConflictException, ForbiddenException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdminNotificationsService } from '../notifications/admin-notifications.service.js';
import { AvailabilityService } from './availability.service.js';
import { BookingStatusStreamService } from './booking-status-stream.service.js';

function maskPhone(phone: string): string {
  if (!phone || phone.length < 8) return phone;
  const start = phone.slice(0, Math.min(6, Math.floor(phone.length / 2) - 1));
  const end = phone.slice(-4);
  return `${start}****${end}`;
}

@Injectable()
export class ManageBookingsService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(AvailabilityService) private readonly availability: AvailabilityService,
    @Optional() @Inject(AdminNotificationsService) private readonly adminNotifications?: AdminNotificationsService,
    @Optional() @Inject(BookingStatusStreamService) private readonly statusStream?: BookingStatusStreamService,
  ) {}

  async cancel(code: string, token?: string, phone?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, include: { patient: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    let authorized = false;
    if (token && booking.manageTokenHash) {
      authorized = await argon2.verify(booking.manageTokenHash, token);
    } else if (phone && booking.patient?.phoneE164) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanPatient = booking.patient.phoneE164.replace(/[^0-9]/g, '');
      authorized = cleanPatient.endsWith(cleanPhone.slice(-8));
    }
    if (!authorized) throw new ForbiddenException('Invalid management token or phone verification');
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    if (booking.startsAt <= new Date(Date.now() + settings.cancelCutoffHours * 60 * 60_000)) throw new ConflictException('Cancellation cutoff has passed');
    const result = await this.prisma.booking.updateMany({ where: { id: booking.id, status: { in: ['pending', 'confirmed'] } }, data: { status: 'cancelled' } });
    if (result.count === 0) throw new ConflictException('Booking cannot be cancelled');
    this.statusStream?.publish(code, 'cancelled');
    await this.prisma.notificationLog.create({ data: { bookingId: booking.id, type: 'cancel', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date() } });
    void this.adminNotifications
      ?.createAndBroadcast({
        type: 'booking_cancelled',
        title: `Pasien membatalkan janji (${code})`,
        body: `${booking.patient?.name ?? 'Pasien'} membatalkan janji temu melalui tautan kelola.`,
        entityType: 'booking',
        entityId: code,
      })
      .catch(() => undefined);
    return { code, status: 'cancelled' as const };
  }

  async confirm(code: string, token?: string, phone?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, include: { patient: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    let authorized = false;
    if (token && booking.manageTokenHash) {
      authorized = await argon2.verify(booking.manageTokenHash, token);
    } else if (phone && booking.patient?.phoneE164) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanPatient = booking.patient.phoneE164.replace(/[^0-9]/g, '');
      authorized = cleanPatient.endsWith(cleanPhone.slice(-8));
    }
    if (!authorized) throw new ForbiddenException('Invalid management token or phone verification');
    if (booking.status === 'pending') {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'confirmed' },
      });
      this.statusStream?.publish(code, 'confirmed');
      return { code, status: 'confirmed' as const };
    }
    return { code, status: booking.status };
  }

  async get(code: string, token?: string, phone?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, include: { doctor: true, service: true, patient: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    let isAuthorized = false;
    if (token) {
      if (!booking.manageTokenHash || !(await argon2.verify(booking.manageTokenHash, token))) {
        throw new ForbiddenException('Invalid management token');
      }
      isAuthorized = true;
    } else if (phone && booking.patient?.phoneE164) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanPatient = booking.patient.phoneE164.replace(/[^0-9]/g, '');
      if (cleanPatient.endsWith(cleanPhone.slice(-8))) {
        isAuthorized = true;
      }
    }

    return {
      code: booking.code,
      status: booking.status,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      doctor: booking.doctor?.name ?? '',
      doctorId: booking.doctorId,
      service: booking.service?.name ?? '',
      serviceId: booking.serviceId,
      patient: {
        name: booking.patient?.name ?? '',
        phone:
          booking.patient?.phoneE164?.startsWith('+')
            ? (isAuthorized ? booking.patient.phoneE164 : maskPhone(booking.patient.phoneE164))
            : '',
      },
      complaint: booking.complaint,
      canManage: isAuthorized,
    };
  }

  async authorizeStatusStream(code: string, token: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, select: { manageTokenHash: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    if (!booking.manageTokenHash || !(await argon2.verify(booking.manageTokenHash, token))) {
      throw new ForbiddenException('Invalid management token');
    }
  }

  async reschedule(code: string, token: string | undefined, startsAtInput: string, phone?: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, include: { service: true, patient: true } });
    if (!booking) throw new NotFoundException('Booking not found');
    let authorized = false;
    if (token && booking.manageTokenHash) {
      authorized = await argon2.verify(booking.manageTokenHash, token);
    } else if (phone && booking.patient?.phoneE164) {
      const cleanPhone = phone.replace(/[^0-9]/g, '');
      const cleanPatient = booking.patient.phoneE164.replace(/[^0-9]/g, '');
      authorized = cleanPatient.endsWith(cleanPhone.slice(-8));
    }
    if (!authorized) throw new ForbiddenException('Invalid management token or phone verification');
    if (!['pending', 'confirmed'].includes(booking.status)) throw new ConflictException('Booking cannot be rescheduled');
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    if (booking.startsAt <= new Date(Date.now() + settings.cancelCutoffHours * 60 * 60_000)) throw new ConflictException('Reschedule cutoff has passed');
    const startsAt = new Date(startsAtInput);
    if (startsAt.getTime() === booking.startsAt.getTime()) return { code, status: booking.status, startsAt: booking.startsAt.toISOString() };
    const dateParts = new Intl.DateTimeFormat('en', { timeZone: settings.timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(startsAt);
    const part = (type: Intl.DateTimeFormatPartTypes) => dateParts.find((item) => item.type === type)?.value;
    const date = `${part('year')}-${part('month')}-${part('day')}`;
    const clock = new Intl.DateTimeFormat('en-GB', { timeZone: settings.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(startsAt);
    const slots = await this.availability.find(booking.serviceId, date, booking.doctorId);
    if (!slots.some((slot) => slot.start === clock)) throw new ConflictException('Selected slot is unavailable');
    const endsAt = new Date(startsAt.getTime() + booking.service.durationMinutes * 60_000);
    try {
      await this.prisma.$transaction(async (tx) => {
        await tx.booking.update({ where: { id: booking.id }, data: { startsAt, endsAt } });
        await tx.notificationLog.create({ data: { bookingId: booking.id, type: 'reschedule', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date() } });
      });
    } catch (error) {
      if (error instanceof Error && error.message.includes('bookings_no_overlap')) throw new ConflictException('Selected slot is unavailable');
      throw error;
    }
    return { code, status: booking.status, startsAt: startsAt.toISOString() };
  }
}
