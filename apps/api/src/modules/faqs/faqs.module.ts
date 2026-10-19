import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import { FaqsController } from './faqs.controller.js';
import { FaqsRepository } from './faqs.repository.js';
import { FaqsService } from './faqs.service.js';

@Module({ imports: [AuthModule, AuditLogsModule], controllers: [FaqsController], providers: [FaqsRepository, FaqsService] })
export class FaqsModule {}
