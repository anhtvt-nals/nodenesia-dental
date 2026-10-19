import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { PromotionsController } from './promotions.controller.js';
import { PromotionsRepository } from './promotions.repository.js';
import { PromotionsService } from './promotions.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [PromotionsController], providers: [PromotionsRepository, PromotionsService] })
export class PromotionsModule {}
