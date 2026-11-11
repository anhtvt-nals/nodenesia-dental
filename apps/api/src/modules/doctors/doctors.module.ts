import { DoctorAvatarService } from './doctor-avatar.service.js';
import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { DoctorsController } from './doctors.controller.js';
import { DoctorsRepository } from './doctors.repository.js';
import { DoctorsService } from './doctors.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { AdminDoctorsController } from './admin-doctors.controller.js';
import { AdminDoctorsService } from './admin-doctors.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [DoctorsController, AdminDoctorsController], providers: [DoctorAvatarService, DoctorsRepository, AdminDoctorsService, { provide: DoctorsService, useFactory: (repository: DoctorsRepository) => new DoctorsService(repository), inject: [DoctorsRepository] }] })
export class DoctorsModule {}
