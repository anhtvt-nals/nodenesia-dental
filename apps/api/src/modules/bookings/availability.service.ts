import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { getAvailableSlots } from './slot-engine.js';

@Injectable()
export class AvailabilityService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async find(serviceId: string, date: string, doctorId?: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceId);
    const service = await this.prisma.service.findFirst({ where: { OR: [{ slug: serviceId }, ...(isUuid ? [{ id: serviceId }] : [])], isActive: true } });
    if (!service) throw new BadRequestException('Unknown service');
    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();
    const doctor = await this.prisma.doctor.findFirst({ where: { ...(doctorId ? { id: doctorId } : {}), isActive: true, services: { some: { serviceId: service.id } } }, include: { workingHours: { where: { weekday: day } } }, orderBy: { sortOrder: 'asc' } });
    if (!doctor) return [];
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    const requestedDay = new Date(`${date}T00:00:00.000Z`);
    const horizonEndsAt = new Date(Date.now() + settings.bookingHorizonDays * 24 * 60 * 60_000);
    if (requestedDay > horizonEndsAt) return [];
    const offsetPart = new Intl.DateTimeFormat('en-US', { timeZone: settings.timezone, timeZoneName: 'longOffset' }).formatToParts(new Date(`${date}T12:00:00.000Z`)).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    const [, sign, hours, minutes] = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offsetPart) ?? [];
    const offsetMinutes = (sign === '-' ? -1 : 1) * ((Number(hours) * 60) + Number(minutes));
    const dayStart = new Date(new Date(`${date}T00:00:00.000Z`).getTime() - offsetMinutes * 60_000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);
    const [bookings, timeOffs] = await Promise.all([
      this.prisma.booking.findMany({ where: { doctorId: doctor.id, status: { in: ['pending', 'confirmed'] }, startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } } }),
      this.prisma.timeOff.findMany({ where: { OR: [{ doctorId: doctor.id }, { doctorId: null }], startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } } }),
    ]);
    const clock = (value: Date) => value.toLocaleTimeString('en-GB', { timeZone: settings.timezone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    const busy = [...bookings, ...timeOffs].map((item) => ({ start: clock(item.startsAt), end: clock(item.endsAt) }));
    const bookableAfter = new Date(Date.now() + settings.bookingLeadMinutes * 60_000);
    return getAvailableSlots({ date, stepMinutes: settings.slotStepMinutes, durationMinutes: service.durationMinutes, intervals: doctor.workingHours.map((hour) => ({ start: hour.startTime.toISOString().slice(11, 16), end: hour.endTime.toISOString().slice(11, 16) })), busy }).filter((slot) => {
      const [hours, minutes] = slot.start.split(':').map(Number);
      return new Date(dayStart.getTime() + (hours * 60 + minutes) * 60_000) >= bookableAfter;
    }).map((slot) => ({ ...slot, doctorId: doctor.id }));
  }
}
