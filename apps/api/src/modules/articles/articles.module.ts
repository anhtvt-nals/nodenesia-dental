import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { ArticlesController } from './articles.controller.js';
import { ArticlesRepository } from './articles.repository.js';
import { ArticlesService } from './articles.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [ArticlesController], providers: [ArticlesRepository, ArticlesService] })
export class ArticlesModule {}
