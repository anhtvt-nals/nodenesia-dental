import { Controller, Get, Inject, Module } from '@nestjs/common';
import { SettingsModule } from './modules/settings/settings.module.js';
import { ServicesModule } from './modules/services/services.module.js';
import { DoctorsModule } from './modules/doctors/doctors.module.js';
import { BookingsModule } from './modules/bookings/bookings.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { NotificationModule } from './modules/notifications/notification.module.js';
import { AuditLogsModule } from './modules/audit-logs/audit-logs.module.js';
import { ReportsModule } from './modules/reports/reports.module.js';
import { FaqsModule } from './modules/faqs/faqs.module.js';
import { TestimonialsModule } from './modules/testimonials/testimonials.module.js';
import { GalleryModule } from './modules/gallery/gallery.module.js';
import { PromotionsModule } from './modules/promotions/promotions.module.js';
import { ContentModule } from './modules/content/content.module.js';
import { ArticlesModule } from './modules/articles/articles.module.js';
import { PrismaService } from './prisma/prisma.service.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Controller('api/v1')
class HealthController {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  @Get('health')
  async health() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok' };
  }
}

@Module({ imports: [PrismaModule, AuditLogsModule, ReportsModule, FaqsModule, TestimonialsModule, GalleryModule, PromotionsModule, ContentModule, ArticlesModule, SettingsModule, ServicesModule, DoctorsModule, BookingsModule, AuthModule, NotificationModule], controllers: [HealthController] })
export class AppModule {}
