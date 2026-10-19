import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminBookingsService } from './admin-bookings.service.js';
import { ManualBookingService } from './manual-booking.service.js';

@Controller('api/v1/admin/bookings')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AdminBookingsController {
  constructor(@Inject(AdminBookingsService) private readonly bookings: AdminBookingsService, @Inject(ManualBookingService) private readonly manualBookings: ManualBookingService) {}

  @Get()
  list(@Query() query: unknown) {
    try {
      const input = z.object({ from: z.string().datetime().optional(), to: z.string().datetime().optional(), doctorId: z.string().uuid().optional(), status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'no_show']).optional() }).refine(({ from, to }) => !from || !to || from < to, 'Invalid date range').parse(query);
      return this.bookings.list({ ...input, from: input.from ? new Date(input.from) : undefined, to: input.to ? new Date(input.to) : undefined });
    } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }

  @Post()
  create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try { const input = z.object({ name: z.string().trim().min(1).max(120), phone: z.string().regex(/^\+[1-9]\d{7,14}$/), doctorId: z.string().uuid(), serviceId: z.string().uuid(), startsAt: z.string().datetime() }).parse(body); return this.manualBookings.create(input, { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }

  @Patch(':code/cancel')
  cancel(@Param('code') code: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try {
      const reason = z.object({ reason: z.string().trim().max(500).optional() }).parse(body).reason;
      return this.bookings.cancel(code, reason, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Patch(':code/status')
  changeStatus(@Param('code') code: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try {
      const status = z.object({ status: z.enum(['confirmed', 'completed', 'no_show']) }).parse(body).status;
      return this.bookings.changeStatus(code, status, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
