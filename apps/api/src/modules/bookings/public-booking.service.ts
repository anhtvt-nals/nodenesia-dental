import { BadRequestException, ConflictException, Inject, Injectable, Optional } from '@nestjs/common';
import type { CreatePublicBookingInput } from '@clinic/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AdminNotificationsService } from '../notifications/admin-notifications.service.js';
import { PatientsRepository } from '../patients/patients.repository.js';
import { AvailabilityService } from './availability.service.js';
import { BookingsService } from './bookings.service.js';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Injectable()
export class PublicBookingService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(PatientsRepository) private readonly patients: PatientsRepository,
    @Inject(AvailabilityService) private readonly availability: AvailabilityService,
    @Inject(BookingsService) private readonly bookings: BookingsService,
    @Optional() @Inject(AdminNotificationsService) private readonly adminNotifications?: AdminNotificationsService,
  ) {}

  async create(input: CreatePublicBookingInput) {
    const service = await this.prisma.service.findFirst({
      where: {
        OR: [
          { slug: input.serviceId },
          ...(uuidPattern.test(input.serviceId) ? [{ id: input.serviceId }] : []),
        ],
        isActive: true,
      },
    });
    if (!service) throw new BadRequestException('Unknown service');

    const startsAt = new Date(input.startsAt);
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });

    // Anti-fake booking: max 3 pending bookings per WhatsApp number per 24 hours
    if (input.phone) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60_000);
      const recentPendingCount = await this.prisma.booking.count({
        where: {
          patient: { phoneE164: input.phone },
          status: 'pending',
          createdAt: { gte: oneDayAgo },
        },
      });
      if (recentPendingCount >= 3) {
        throw new BadRequestException('Batas pemesanan tercapai. Maksimal 3 janji temu berstatus menunggu konfirmasi per nomor WhatsApp dalam 24 jam.');
      }
    }

    const { date, clock } = this.getLocalDateAndClock(startsAt, settings.timezone);

    // Find slots matching the requested date and doctor (or all doctors if any)
    const slots = await this.availability.find(service.id, date, input.doctorId);
    const matchedSlot = slots.find((slot) => slot.start === clock);
    if (!matchedSlot) {
      throw new BadRequestException('Selected slot is unavailable');
    }
    const doctorId = input.doctorId ?? matchedSlot.doctorId;

    // Check duplicate same-slot booking
    const duplicateSlot = await this.prisma.booking.findFirst({
      where: {
        startsAt,
        status: { in: ['pending', 'confirmed', 'arrived', 'in_chair'] },
        OR: [
          { doctorId },
          ...(input.phone ? [{ patient: { phoneE164: input.phone } }] : []),
        ],
      },
    });
    if (duplicateSlot) {
      throw new ConflictException('Slot waktu ini sudah dipesan atau Anda telah memiliki janji temu di jam yang sama.');
    }

    const turnover = service.turnoverBufferMinutes ?? settings.turnoverBufferMinutes ?? 15;
    const patient = await this.patients.upsert(input.name, input.phone);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    const turnoverEndsAt = new Date(endsAt.getTime() + turnover * 60_000);

    const booking = await this.bookings.create({
      patientId: patient.id,
      doctorId,
      serviceId: service.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      turnoverEndsAt: turnoverEndsAt.toISOString(),
      complaint: input.complaint ?? null,
      parentBookingId: (input as { parentBookingId?: string }).parentBookingId ?? null,
      bookingFor: input.bookingFor ?? 'self',
      bookerName: input.booker?.name ?? null,
      bookerPhone: input.booker?.phone ?? null,
      patientAge: input.patientAge ?? null,
      patientType: input.patientType ?? 'new',
      birthDate: input.birthDate ? new Date(input.birthDate) : null,
      payer: input.payer ?? 'umum',
      skipNotifications: !input.phone,
    });

    void this.adminNotifications
      ?.createAndBroadcast({
        type: 'booking_created',
        title: `Janji temu baru (${booking.code})`,
        body: `${input.name} · ${service.name} (${clock} WIB)`,
        entityType: 'booking',
        entityId: booking.code,
      })
      .catch(() => undefined);

    return booking;
  }

  private getLocalDateAndClock(startsAt: Date, timezone: string) {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(startsAt);
    const value = (type: string) => parts.find((part) => part.type === type)?.value;

    return {
      date: `${value('year')}-${value('month')}-${value('day')}`,
      clock: `${value('hour')}:${value('minute')}`,
    };
  }
}
