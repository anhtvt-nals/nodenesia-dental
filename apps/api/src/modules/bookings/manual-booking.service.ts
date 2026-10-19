import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { PatientsRepository } from '../patients/patients.repository.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AvailabilityService } from './availability.service.js';
import { BookingsRepository } from './bookings.repository.js';

export type ManualBookingInput = { name: string; phone: string; doctorId: string; serviceId: string; startsAt: string };

@Injectable()
export class ManualBookingService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(PatientsRepository) private readonly patients: PatientsRepository, @Inject(AvailabilityService) private readonly availability: AvailabilityService, @Inject(BookingsRepository) private readonly bookings: BookingsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  async create(input: ManualBookingInput, actor: { userId: string; ip?: string }) {
    const service = await this.prisma.service.findFirst({ where: { id: input.serviceId, isActive: true } });
    if (!service) throw new BadRequestException('Unknown service');
    const startsAt = new Date(input.startsAt);
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    const parts = new Intl.DateTimeFormat('en', { timeZone: settings.timezone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(startsAt);
    const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
    const slots = await this.availability.find(service.id, `${value('year')}-${value('month')}-${value('day')}`, input.doctorId);
    if (!slots.some((slot) => slot.start === `${value('hour')}:${value('minute')}`)) throw new BadRequestException('Selected slot is unavailable');
    const patient = await this.patients.upsert(input.name, input.phone);
    const booking = await this.bookings.createAdmin({ patientId: patient.id, doctorId: input.doctorId, serviceId: service.id, startsAt: startsAt.toISOString(), endsAt: new Date(startsAt.getTime() + service.durationMinutes * 60_000).toISOString() });
    await this.audit.record({ ...actor, action: 'create', entity: 'booking', entityId: booking.code, diff: { ...input, source: 'admin' } });
    return booking;
  }
}
