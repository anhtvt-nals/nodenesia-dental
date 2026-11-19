import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { GalleryController } from './gallery.controller.js';
import { GalleryRepository } from './gallery.repository.js';
import { GalleryService } from './gallery.service.js';
import { GalleryImageService } from './gallery-image.service.js';

@Module({
  imports: [AuthModule, AuditLogsModule],
  controllers: [GalleryController],
  providers: [GalleryRepository, GalleryService, GalleryImageService],
})
export class GalleryModule {}
