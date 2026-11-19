import { BadRequestException, Body, Controller, Get, Inject, Patch, Req, UseGuards } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminSettingsService } from './admin-settings.service.js';

const blockedTimeSchema = z.object({
  id: z.string().trim().min(1).max(120).optional(),
  label: z.string().trim().min(1).max(120),
  weekdays: z.array(z.number().int().min(0).max(6)).max(7),
  start: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  end: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});

const updateSettingsSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  waNumber: z.string().trim().min(1).max(30).optional(),
  address: z.string().trim().min(1).max(500).optional(),
  tagline: z.string().trim().max(240).nullable().optional(),
  taglineEn: z.string().trim().max(240).nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  instagramHandle: z.string().trim().max(120).nullable().optional(),
  googleMapsUrl: z.string().trim().url().max(1000).nullable().optional(),
  timezone: z.string().trim().min(1).max(80).optional(),
  adminLocale: z.enum(['id', 'en']).optional(),
  slotStepMinutes: z.number().int().min(5).max(60).optional(),
  bookingLeadMinutes: z.number().int().min(0).max(10080).optional(),
  bookingHorizonDays: z.number().int().min(1).max(365).optional(),
  cancelCutoffHours: z.number().int().min(0).max(720).optional(),
  chairsCount: z.number().int().min(1).max(50).optional(),
  blockedTimes: z.array(blockedTimeSchema).max(50).optional(),
  autoReleaseHours: z.number().int().min(1).max(168).optional(),
  paymentMethods: z.array(z.string().trim().min(1).max(120)).max(30).optional(),
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
      const input = updateSettingsSchema.parse(body);
      return this.settings.update({
        ...input,
        ...(input.blockedTimes ? { blockedTimes: input.blockedTimes.map((blockedTime) => ({ ...blockedTime, id: blockedTime.id ?? randomUUID() })) } : {}),
      }, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
