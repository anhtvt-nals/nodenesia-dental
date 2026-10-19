import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { GalleryController } from './gallery.controller.js';
import { GalleryRepository } from './gallery.repository.js';
import { GalleryService } from './gallery.service.js';

@Module({ imports: [AuthModule, AuditLogsModule], controllers: [GalleryController], providers: [GalleryRepository, GalleryService] })
export class GalleryModule {}
