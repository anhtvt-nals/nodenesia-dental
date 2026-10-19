import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import PgBoss from 'pg-boss';
import { PrismaService } from '../../prisma/prisma.service.js';
import { NotificationService } from './notification.service.js';

const queueName = 'clinic-notifications';

@Injectable()
export class NotificationWorker implements OnModuleInit, OnModuleDestroy {
  private readonly boss = new PgBoss(process.env.DATABASE_URL ?? 'postgresql://clinic:clinic@localhost:5432/clinic?schema=public');
  private readonly enabled = Boolean(process.env.FONNTE_TOKEN);
  private timer?: NodeJS.Timeout;

  constructor(@Inject(PrismaService) private readonly prisma: PrismaService, @Inject(NotificationService) private readonly notifications: NotificationService) {}

  async onModuleInit() {
    if (!this.enabled) return;
    await this.boss.start();
    await this.boss.work<{ logId: string }>(queueName, async ([job]) => this.notifications.sendQueued(job.data.logId));
    await this.enqueueQueued();
    this.timer = setInterval(() => void this.enqueueQueued(), 10_000);
  }

  async onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.enabled) await this.boss.stop();
  }

  private async enqueueQueued() {
    const logs = await this.prisma.notificationLog.findMany({ where: { status: 'queued', scheduledAt: { lte: new Date() } }, select: { id: true }, take: 100 });
    await Promise.all(logs.map((log) => this.boss.send(queueName, { logId: log.id }, { singletonKey: log.id, retryLimit: 3, retryDelay: 60 })));
  }
}
