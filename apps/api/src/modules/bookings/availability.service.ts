import { BadRequestException, Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { BlockedTime } from '@clinic/shared';
import { getAvailableSlots } from './slot-engine.js';

@Injectable()
export class AvailabilityService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async find(serviceId: string, date: string, doctorId?: string) {
    const settings = await this.prisma.clinicSettings.findUniqueOrThrow({ where: { id: 'default' } });
    if (settings.maintenanceMode) {
      throw new ServiceUnavailableException('Online booking is temporarily unavailable while the clinic website is under maintenance.');
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(serviceId);
    const service = await this.prisma.service.findFirst({
      where: { OR: [{ slug: serviceId }, ...(isUuid ? [{ id: serviceId }] : [])], isActive: true },
    });
    if (!service) throw new BadRequestException('Unknown service');

    const day = new Date(`${date}T00:00:00.000Z`).getUTCDay();

    const requestedDay = new Date(`${date}T00:00:00.000Z`);
    const horizonEndsAt = new Date(Date.now() + settings.bookingHorizonDays * 24 * 60 * 60_000);
    if (requestedDay > horizonEndsAt) return [];

    const offsetPart = new Intl.DateTimeFormat('en-US', {
      timeZone: settings.timezone,
      timeZoneName: 'longOffset',
    }).formatToParts(new Date(`${date}T12:00:00.000Z`)).find((part) => part.type === 'timeZoneName')?.value ?? 'GMT+00:00';
    const [, sign, hours, minutes] = /^GMT([+-])(\d{2}):(\d{2})$/.exec(offsetPart) ?? [];
    const offsetMinutes = (sign === '-' ? -1 : 1) * (Number(hours) * 60 + Number(minutes));
    const dayStart = new Date(new Date(`${date}T00:00:00.000Z`).getTime() - offsetMinutes * 60_000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60_000);

    const turnover = service.turnoverBufferMinutes ?? settings.turnoverBufferMinutes ?? 15;
    const chairsCount = settings.chairsCount ?? 3;
    const autoReleaseHours = (settings as any).autoReleaseHours ?? 2;
    const pendingExpiredCutoff = new Date(Date.now() - autoReleaseHours * 60 * 60_000);

    // Retrieve clinic-wide active bookings for chair occupancy calculation
    const clinicBookings = await this.prisma.booking.findMany({
      where: {
        OR: [
          { status: { in: ['confirmed', 'arrived', 'in_chair'] } },
          { status: 'pending', createdAt: { gte: pendingExpiredCutoff } },
        ],
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
    });

    const clock = (value: Date) =>
      value.toLocaleTimeString('en-GB', {
        timeZone: settings.timezone,
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
      });

    const chairOccupancy = clinicBookings.map((b) => {
      const turnoverEnd = b.turnoverEndsAt ?? new Date(b.endsAt.getTime() + turnover * 60_000);
      return {
        start: clock(b.startsAt),
        end: clock(turnoverEnd),
      };
    });

    const doctors = await this.prisma.doctor.findMany({
      where: {
        ...(doctorId && doctorId !== 'any' ? { id: doctorId } : {}),
        isActive: true,
        services: { some: { serviceId: service.id } },
      },
      include: {
        workingHours: { where: { weekday: day } },
        bookings: {
          where: {
            OR: [
              { status: { in: ['confirmed', 'arrived', 'in_chair'] } },
              { status: 'pending', createdAt: { gte: pendingExpiredCutoff } },
            ],
            startsAt: { lt: dayEnd },
            endsAt: { gt: dayStart },
          },
        },
        timeOffs: {
          where: {
            startsAt: { lt: dayEnd },
            endsAt: { gt: dayStart },
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    if (doctors.length === 0) return [];

    const globalTimeOffs = await this.prisma.timeOff.findMany({
      where: {
        doctorId: null,
        startsAt: { lt: dayEnd },
        endsAt: { gt: dayStart },
      },
    });

    const blockedWindows = (Array.isArray(settings.blockedTimes) ? (settings.blockedTimes as unknown as BlockedTime[]) : [])
      .filter((b) => b && Array.isArray(b.weekdays) && b.weekdays.includes(day))
      .map((b) => ({ start: b.start, end: b.end }));

    const bookableAfter = new Date(Date.now() + settings.bookingLeadMinutes * 60_000);
    const allSlots: Array<{ start: string; end: string; doctorId: string }> = [];

    for (const doc of doctors) {
      if (doc.workingHours.length === 0) continue;

      const busyItems = [
        ...doc.bookings.map((b) => {
          const turnoverEnd = b.turnoverEndsAt ?? new Date(b.endsAt.getTime() + turnover * 60_000);
          return { start: clock(b.startsAt), end: clock(turnoverEnd) };
        }),
        ...doc.timeOffs.map((to) => ({ start: clock(to.startsAt), end: clock(to.endsAt) })),
        ...globalTimeOffs.map((to) => ({ start: clock(to.startsAt), end: clock(to.endsAt) })),
      ];

      const docSlots = getAvailableSlots({
        date,
        stepMinutes: 30,
        durationMinutes: service.durationMinutes,
        turnoverMinutes: turnover,
        chairsCount,
        chairOccupancy,
        intervals: doc.workingHours.map((hour) => ({
          start: hour.startTime.toISOString().slice(11, 16),
          end: hour.endTime.toISOString().slice(11, 16),
        })),
        busy: busyItems,
        blocked: blockedWindows,
      })
        .filter((slot) => {
          const [h, m] = slot.start.split(':').map(Number);
          return new Date(dayStart.getTime() + (h * 60 + m) * 60_000) >= bookableAfter;
        })
        .map((slot) => ({ ...slot, doctorId: doc.id }));

      allSlots.push(...docSlots);
    }

    if (doctorId && doctorId !== 'any') {
      return allSlots;
    }

    // Load balancing when "any doctor" is chosen
    const doctorBookingCounts = new Map<string, number>();
    for (const doc of doctors) {
      doctorBookingCounts.set(doc.id, doc.bookings.length);
    }

    const slotMap = new Map<string, { start: string; end: string; doctorId: string }>();
    for (const slot of allSlots) {
      const existing = slotMap.get(slot.start);
      if (!existing) {
        slotMap.set(slot.start, slot);
      } else {
        const existingCount = doctorBookingCounts.get(existing.doctorId) ?? 0;
        const currentCount = doctorBookingCounts.get(slot.doctorId) ?? 0;
        if (currentCount < existingCount) {
          slotMap.set(slot.start, slot);
        }
      }
    }

    return Array.from(slotMap.values()).sort((a, b) => a.start.localeCompare(b.start));
  }
}
