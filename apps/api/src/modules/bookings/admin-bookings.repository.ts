import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';

@Injectable()
export class AdminBookingsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  list(filter: { from?: Date; to?: Date; doctorId?: string; status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' } = {}) {
    return this.prisma.booking.findMany({
      where: { ...(filter.doctorId ? { doctorId: filter.doctorId } : {}), ...(filter.status ? { status: filter.status } : {}), ...(filter.from || filter.to ? { startsAt: { ...(filter.from ? { gte: filter.from } : {}), ...(filter.to ? { lt: filter.to } : {}) } } : {}) },
      orderBy: { startsAt: 'asc' },
      take: 100,
      include: { patient: true, doctor: true, service: true },
    });
  }

  cancel(code: string, reason?: string) {
    return this.prisma.booking.updateMany({
      where: { code, status: { in: ['pending', 'confirmed'] } },
      data: { status: 'cancelled', cancelledReason: reason },
    });
  }

  changeStatus(code: string, status: 'confirmed' | 'completed' | 'no_show', from: Array<'pending' | 'confirmed'>) {
    return this.prisma.booking.updateMany({ where: { code, status: { in: from } }, data: { status } });
  }

  async queueReviewRequest(code: string) {
    const booking = await this.prisma.booking.findUnique({ where: { code }, select: { id: true, endsAt: true } });
    if (!booking) return;
    return this.prisma.notificationLog.create({ data: { bookingId: booking.id, type: 'review_request', channel: 'whatsapp', provider: 'pending', scheduledAt: new Date(booking.endsAt.getTime() + 24 * 60 * 60_000) } });
  }
}
