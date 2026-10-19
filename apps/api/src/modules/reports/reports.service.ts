import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

export type DateRange = { from: Date; to: Date };
const csvCell = (value: string | number) => `"${String(value).replaceAll('"', '""')}"`;

@Injectable()
export class ReportsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async summary(range: DateRange) {
    const bookings = await this.prisma.booking.findMany({ where: { startsAt: { gte: range.from, lt: range.to } }, include: { service: true } });
    const byService = this.count(bookings, (booking) => booking.service.name);
    const bySource = this.count(bookings, (booking) => booking.source);
    const noShows = bookings.filter((booking) => booking.status === 'no_show').length;
    return { total: bookings.length, noShows, noShowRate: bookings.length ? noShows / bookings.length : 0, byService, bySource };
  }

  async bookingsCsv(range: DateRange) {
    const bookings = await this.prisma.booking.findMany({ where: { startsAt: { gte: range.from, lt: range.to } }, orderBy: { startsAt: 'asc' }, include: { patient: true, doctor: true, service: true } });
    return [
      ['code', 'starts_at', 'status', 'source', 'patient_name', 'patient_phone', 'doctor', 'service'].map(csvCell).join(','),
      ...bookings.map((booking) => [booking.code, booking.startsAt.toISOString(), booking.status, booking.source, booking.patient.name, booking.patient.phoneE164, booking.doctor.name, booking.service.name].map(csvCell).join(',')),
    ].join('\n');
  }

  private count<T>(items: T[], key: (item: T) => string) { return Object.fromEntries(items.reduce((counts, item) => counts.set(key(item), (counts.get(key(item)) ?? 0) + 1), new Map<string, number>())); }
}
