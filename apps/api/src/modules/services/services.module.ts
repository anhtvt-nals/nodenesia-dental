import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { ServicesController } from './services.controller.js';
import { ServicesRepository } from './services.repository.js';
import { ServicesService } from './services.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { AdminServicesController } from './admin-services.controller.js';
import { AdminServicesService } from './admin-services.service.js';
@Module({ imports: [AuthModule, AuditLogsModule], controllers: [ServicesController, AdminServicesController], providers: [ServicesRepository, AdminServicesService, { provide: ServicesService, useFactory: (repository: ServicesRepository) => new ServicesService(repository), inject: [ServicesRepository] }] })
export class ServicesModule {}
