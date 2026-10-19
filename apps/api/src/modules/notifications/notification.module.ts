import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { notificationProviderToken, NotificationService } from './notification.service.js';
import { NotificationWorker } from './notification.worker.js';
import { FonnteProvider } from './fonnte.provider.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { NotificationOperationsController } from './notification-operations.controller.js';
import { NotificationOperationsService } from './notification-operations.service.js';

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [NotificationOperationsController],
  providers: [
    NotificationService,
    NotificationWorker,
    NotificationOperationsService,
    { provide: notificationProviderToken, useFactory: () => process.env.FONNTE_TOKEN ? new FonnteProvider(process.env.FONNTE_TOKEN) : { send: async () => { throw new Error('Notification provider is not configured'); } } },
  ],
  exports: [NotificationService],
})
export class NotificationModule {}
