import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import type { CreatePublicBookingInput } from '@clinic/shared';
import { PrismaService } from '../../prisma/prisma.service.js';
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
    const { date, clock } = this.getLocalDateAndClock(startsAt, settings.timezone);

    // "Any doctor" requests omit doctorId; reuse the first doctor the availability engine assigns.
    const doctorId = input.doctorId ?? (await this.availability.find(service.id, date))[0]?.doctorId;
    if (!doctorId) throw new BadRequestException('No doctor is available for the selected slot');

    const slots = await this.availability.find(service.id, date, doctorId);
    if (!slots.some((slot) => slot.start === clock)) {
      throw new BadRequestException('Selected slot is unavailable');
    }

    const patient = await this.patients.upsert(input.name, input.phone);
    const endsAt = new Date(startsAt.getTime() + service.durationMinutes * 60_000);
    return this.bookings.create({
      patientId: patient.id,
      doctorId,
      serviceId: service.id,
      startsAt: startsAt.toISOString(),
      endsAt: endsAt.toISOString(),
      complaint: input.complaint ?? null,
    });
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
