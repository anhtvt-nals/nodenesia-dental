import { BadRequestException, Body, Controller, Get, Inject, Patch, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminSettingsService } from './admin-settings.service.js';

const updateSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  waNumber: z.string().trim().min(1).max(30).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  slotStepMinutes: z.number().int().min(5).max(60).optional(),
  bookingLeadMinutes: z.number().int().min(0).max(10080).optional(),
  bookingHorizonDays: z.number().int().min(1).max(365).optional(),
  cancelCutoffHours: z.number().int().min(0).max(720).optional(),
  chairsCount: z.number().int().min(1).max(50).optional(),
  reminderTemplates: z.record(z.enum(['confirmation', 'reminder_h1', 'reminder_2h', 'review_request']), z.string().trim().min(1).max(2000)).optional(),
});

@Controller('api/v1/admin/settings')
@UseGuards(AccessTokenGuard)
@Roles('owner')
export class AdminSettingsController {
  constructor(@Inject(AdminSettingsService) private readonly settings: AdminSettingsService) {}

  @Get()
  get() {
    return this.settings.get();
  }

  @Patch()
  update(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try {
      return this.settings.update(updateSettingsSchema.parse(body), { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
