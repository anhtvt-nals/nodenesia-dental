import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { PatientsRepository } from './patients.repository.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { PatientsAdminController } from './patients-admin.controller.js';
import { PatientsAdminService } from './patients-admin.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [PatientsAdminController], providers: [PatientsRepository, PatientsAdminService], exports: [PatientsRepository] })
export class PatientsModule {}
