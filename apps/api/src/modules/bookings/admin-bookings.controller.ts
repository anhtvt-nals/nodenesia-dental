import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { indonesianPhoneE164 } from '@clinic/shared';
import { z, ZodError } from 'zod';
import { parsePagination } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminBookingsService } from './admin-bookings.service.js';
import { ManualBookingService } from './manual-booking.service.js';

@Controller('api/v1/admin/bookings')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AdminBookingsController {
  constructor(
    @Inject(AdminBookingsService) private readonly bookings: AdminBookingsService,
    @Inject(ManualBookingService) private readonly manualBookings: ManualBookingService,
  ) {}

  @Get()
  list(@Query() query: unknown) {
    try {
      const input = z
        .object({
          from: z.string().datetime().optional(),
          to: z.string().datetime().optional(),
          doctorId: z.string().uuid().optional(),
          status: z.enum(['pending', 'confirmed', 'arrived', 'in_chair', 'completed', 'cancelled', 'no_show']).optional(),
          q: z.string().trim().max(120).optional(),
          page: z.coerce.number().int().min(1).optional(),
          pageSize: z.coerce.number().int().min(1).max(500).optional(),
        })
        .refine(({ from, to }) => !from || !to || from < to, 'Invalid date range')
        .parse(query);
      const pagination = parsePagination({ page: input.page, pageSize: input.pageSize });
      return this.bookings.listPaginated({
        doctorId: input.doctorId,
        status: input.status,
        q: input.q || undefined,
        from: input.from ? new Date(input.from) : undefined,
        to: input.to ? new Date(input.to) : undefined,
        ...pagination,
      });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Post()
  create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try {
      const input = z
        .object({
          name: z.string().trim().min(1).max(120),
          phone: z.string().regex(/^\+[1-9]\d{7,14}$/),
          doctorId: z.string().uuid(),
          serviceId: z.string().uuid(),
          startsAt: z.string().datetime(),
          chairIndex: z.number().int().min(1).max(20).optional(),
          parentBookingId: z.string().uuid().optional(),
          complaint: z.string().trim().max(500).optional(),
          isWalkIn: z.boolean().optional(),
        })
        .parse(body);
      return this.manualBookings.create(input, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
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
  changeStatus(
    @Param('code') code: string,
    @Body() body: unknown,
    @Req() request: { user: { sub: string }; ip?: string },
  ) {
    try {
      const parsed = z
        .object({
          status: z.enum(['confirmed', 'arrived', 'in_chair', 'completed', 'no_show']),
          chairIndex: z.number().int().min(1).max(20).optional(),
          phone: z.preprocess(
            (v) => (typeof v === 'string' && v.trim() === '' ? undefined : v),
            indonesianPhoneE164.optional(),
          ),
        })
        .parse(body);
      return this.bookings.changeStatus(
        code,
        parsed.status,
        { chairIndex: parsed.chairIndex, phone: parsed.phone },
        { userId: request.user.sub, ip: request.ip },
      );
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Patch(':code/extend')
  extend(
    @Param('code') code: string,
    @Body() body: unknown,
    @Req() request: { user: { sub: string }; ip?: string },
  ) {
    try {
      const parsed = z
        .object({
          additionalMinutes: z.number().int().min(5).max(180),
        })
        .parse(body);
      return this.bookings.extend(code, parsed.additionalMinutes, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Patch(':code/clinical-notes')
  updateClinicalNotes(
    @Param('code') code: string,
    @Body() body: unknown,
    @Req() request: { user: { sub: string }; ip?: string },
  ) {
    try {
      const parsed = z
        .object({
          notes: z.string().trim().max(2000),
        })
        .parse(body);
      return this.bookings.updateNotes(code, parsed.notes, { userId: request.user.sub, ip: request.ip });
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
