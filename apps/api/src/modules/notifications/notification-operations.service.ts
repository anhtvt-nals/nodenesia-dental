import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';

@Injectable()
export class NotificationOperationsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  list() {
    return this.prisma.notificationLog.findMany({ orderBy: { scheduledAt: 'desc' }, take: 200, include: { booking: { include: { patient: true } } } });
  }

  async resend(id: string, actor: { userId: string; ip?: string }) {
    const original = await this.prisma.notificationLog.findUnique({ where: { id } });
    if (!original) throw new NotFoundException('Notification not found');
    const notification = await this.prisma.notificationLog.create({ data: { bookingId: original.bookingId, type: original.type, channel: original.channel, provider: 'pending', scheduledAt: new Date() } });
    await this.audit.record({ ...actor, action: 'resend', entity: 'notification', entityId: notification.id, diff: { originalNotificationId: id } });
    return notification;
  }
}
