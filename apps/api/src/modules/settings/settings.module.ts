import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller.js';
import { SettingsRepository } from './settings.repository.js';
import { SettingsService } from './settings.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminSettingsController } from './admin-settings.controller.js';
import { AdminSettingsService } from './admin-settings.service.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [SettingsController, AdminSettingsController],
  providers: [
    SettingsRepository,
    { provide: SettingsService, useFactory: (repository: SettingsRepository) => new SettingsService(repository), inject: [SettingsRepository] },
    { provide: AdminSettingsService, useFactory: (repository: SettingsRepository, audit: AuditLogService) => new AdminSettingsService(repository, audit), inject: [SettingsRepository, AuditLogService] },
  ],
})
export class SettingsModule {}
