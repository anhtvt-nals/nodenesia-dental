import { Module } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { AvailabilityService } from './availability.service.js';
import { BookingsRepository } from './bookings.repository.js';
import { BookingsService } from './bookings.service.js';
import { SlotsController } from './slots.controller.js';
import { PublicBookingsController } from './public-bookings.controller.js';
import { PublicBookingService } from './public-booking.service.js';
import { PatientsModule } from '../patients/patients.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { AdminBookingsController } from './admin-bookings.controller.js';
import { AdminBookingsRepository } from './admin-bookings.repository.js';
import { AdminBookingsService } from './admin-bookings.service.js';
import { PublicBookingRateLimiter } from './public-booking-rate-limiter.js';
import { ManageBookingsController } from './manage-bookings.controller.js';
import { ManageBookingsService } from './manage-bookings.service.js';
import { AuditLogsModule } from '../audit-logs/audit-logs.module.js';
import { ManualBookingService } from './manual-booking.service.js';

@Module({
  imports: [PatientsModule, AuthModule, AuditLogsModule],
  controllers: [SlotsController, PublicBookingsController, AdminBookingsController, ManageBookingsController],
  providers: [
    AvailabilityService,
    BookingsRepository,
    AdminBookingsRepository,
    AdminBookingsService,
    PublicBookingService,
    PublicBookingRateLimiter,
    ManageBookingsService,
    ManualBookingService,
    {
      provide: BookingsService,
      useFactory: (repository: BookingsRepository) => new BookingsService(repository),
      inject: [BookingsRepository],
    },
  ],
})
export class BookingsModule {}
