import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { TestimonialsController } from './testimonials.controller.js';
import { TestimonialsRepository } from './testimonials.repository.js';
import { TestimonialsService } from './testimonials.service.js';

@Module({ imports: [AuthModule, AuditLogsModule], controllers: [TestimonialsController], providers: [TestimonialsRepository, TestimonialsService] })
export class TestimonialsModule {}
