import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminBookingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(filter: { from?: Date; to?: Date; doctorId?: string; status?: 'pending' | 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'cancelled' | 'no_show' } = {}) {
    return this.prisma.booking.findMany({
      where: {
        ...(filter.doctorId ? { doctorId: filter.doctorId } : {}),
        ...(filter.status ? { status: filter.status } : {}),
        ...(filter.to ? { startsAt: { lt: filter.to } } : {}),
        ...(filter.from ? { endsAt: { gt: filter.from } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      ...(filter.from && filter.to ? {} : { take: 100 }),
      include: {
        patient: {
          include: {
            bookings: { select: { status: true } },
          },
        },
        doctor: true,
        service: true,
        followUps: true,
      },
    });
  }

  async listPaginated(filter: {
    from?: Date;
    to?: Date;
    doctorId?: string;
    status?: 'pending' | 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
    q?: string;
    skip: number;
    take: number;
  }) {
    const q = filter.q?.trim();
    const where = {
      ...(filter.doctorId ? { doctorId: filter.doctorId } : {}),
      ...(filter.status ? { status: filter.status } : {}),
      ...(filter.to ? { startsAt: { lt: filter.to } } : {}),
      ...(filter.from ? { endsAt: { gt: filter.from } } : {}),
      ...(q
        ? {
            OR: [
              { code: { contains: q, mode: 'insensitive' as const } },
              { patient: { name: { contains: q, mode: 'insensitive' as const } } },
              { patient: { phoneE164: { contains: q, mode: 'insensitive' as const } } },
            ],
          }
        : {}),
    };
    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: filter.skip,
        take: filter.take,
        include: {
          patient: {
            include: {
              bookings: { select: { status: true } },
            },
          },
          doctor: true,
          service: true,
          followUps: true,
        },
      }),
      this.prisma.booking.count({ where }),
    ]);
    return { items, total };
  }

  cancel(code: string, reason?: string) {
    return this.prisma.booking.updateMany({
      where: { code, status: { in: ['pending', 'confirmed', 'arrived'] } },
      data: { status: 'cancelled', cancelledReason: reason },
    });
  }

  changeStatus(
    code: string,
    status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show',
    from: Array<'pending' | 'confirmed' | 'arrived' | 'in_chair'>,
    chairIndex?: number,
  ) {
    return this.prisma.booking.updateMany({
      where: { code, status: { in: from } },
      data: { status, ...(chairIndex !== undefined ? { chairIndex } : {}) },
    });
  }

  async extend(code: string, additionalMinutes: number) {
    const booking = await this.prisma.booking.findUnique({ where: { code } });
    if (!booking) throw new NotFoundException('Booking not found');
    const newEndsAt = new Date(booking.endsAt.getTime() + additionalMinutes * 60_000);
    const newTurnoverEndsAt = booking.turnoverEndsAt
      ? new Date(booking.turnoverEndsAt.getTime() + additionalMinutes * 60_000)
      : null;

    return this.prisma.booking.update({
      where: { code },
      data: {
        endsAt: newEndsAt,
        turnoverEndsAt: newTurnoverEndsAt,
      },
    });
  }

  updateNotes(code: string, notes: string) {
    return this.prisma.booking.update({
      where: { code },
      data: { notes },
    });
  }

  async attachPatientPhone(code: string, phoneE164: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { code },
      include: { patient: true },
    });
    if (!booking) return;

    const existingPatient = await this.prisma.patient.findUnique({ where: { phoneE164 } });
    if (existingPatient && existingPatient.id !== booking.patientId) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { patientId: existingPatient.id },
      });
      return;
    }

    if (booking.patient.phoneE164 !== phoneE164) {
      await this.prisma.patient.update({
        where: { id: booking.patientId },
        data: { phoneE164 },
      });
    }
  }

  async queueConfirmationAndReminders(code: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { code },
      include: { patient: true, notifications: { select: { type: true } } },
    });
    if (!booking || !booking.patient?.phoneE164?.startsWith('+')) return;

    const existingTypes = new Set(booking.notifications.map((n) => n.type));
    const now = new Date();
    const logs: Array<{ bookingId: string; type: 'confirmation' | 'reminder_h1' | 'reminder_2h'; channel: 'whatsapp'; provider: string; scheduledAt: Date }> = [];

    if (!existingTypes.has('confirmation')) {
      logs.push({ bookingId: booking.id, type: 'confirmation', channel: 'whatsapp', provider: 'pending', scheduledAt: now });
    }
    const h1 = new Date(booking.startsAt.getTime() - 24 * 60 * 60_000);
    if (!existingTypes.has('reminder_h1') && h1 > now) {
      logs.push({ bookingId: booking.id, type: 'reminder_h1', channel: 'whatsapp', provider: 'pending', scheduledAt: h1 });
    }
    const h2 = new Date(booking.startsAt.getTime() - 2 * 60 * 60_000);
    if (!existingTypes.has('reminder_2h') && h2 > now) {
      logs.push({ bookingId: booking.id, type: 'reminder_2h', channel: 'whatsapp', provider: 'pending', scheduledAt: h2 });
    }

    if (logs.length > 0) {
      await this.prisma.notificationLog.createMany({ data: logs });
    }
  }

  async queueReviewRequest(code: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, select: { id: true, endsAt: true } });
    if (!booking) return;
    return this.prisma.notificationLog.create({
      data: {
        bookingId: booking.id,
        type: 'review_request',
        channel: 'whatsapp',
        provider: 'pending',
        scheduledAt: new Date(booking.endsAt.getTime() + 24 * 60 * 60_000),
      },
    });
  }
}
