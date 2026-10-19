import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { ContentController } from './content.controller.js';
import { ContentRepository } from './content.repository.js';
import { ContentService } from './content.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [ContentController], providers: [ContentRepository, ContentService] })
export class ContentModule {}
