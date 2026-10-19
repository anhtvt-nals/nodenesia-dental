import { forwardRef, Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuditLogService } from './audit-log.service.js';
import { AuditLogsController } from './audit-logs.controller.js';
import { AuthModule } from '../auth/auth.module.js';

@Module({ imports: [forwardRef(() => AuthModule)], controllers: [AuditLogsController], providers: [AuditLogService], exports: [AuditLogService] })
export class AuditLogsModule {}
