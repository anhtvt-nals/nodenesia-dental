import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { NotificationProvider } from './notification.provider.js';
import { renderNotification } from './notification-template.js';

export const notificationProviderToken = Symbol('notificationProvider');

@Injectable()
export class NotificationService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(notificationProviderToken) private readonly provider: NotificationProvider) {}

  async sendQueued(logId: string) {
    const log = await this.prisma.notificationLog.findUniqueOrThrow({ where: { id: logId }, include: { booking: { include: { patient: true, service: true, doctor: true } } } });
    if (!log.booking.patient.phoneE164.startsWith('+')) {
      await this.prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'failed', error: 'No valid WhatsApp number on patient record' } });
      return;
    }
    try {
      const startsAt = log.booking.startsAt;
      const text = renderNotification(log.type, { name: log.booking.patient.name, service: log.booking.service.name, doctor: log.booking.doctor.name, date: startsAt.toLocaleDateString('id-ID'), time: startsAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }), code: log.booking.code, link: `${process.env.PUBLIC_WEB_URL ?? ''}/booking/kelola/${log.booking.code}` });
      const receipt = await this.provider.send({ to: log.booking.patient.phoneE164, text });
      await this.prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'sent', provider: 'fonnte', providerMsgId: receipt.id, sentAt: new Date(), attempts: { increment: 1 } } });
    } catch (error) {
      await this.prisma.notificationLog.update({ where: { id: log.id }, data: { status: 'failed', error: error instanceof Error ? error.message : 'Unknown provider error', attempts: { increment: 1 } } });
      throw error;
    }
  }
}
