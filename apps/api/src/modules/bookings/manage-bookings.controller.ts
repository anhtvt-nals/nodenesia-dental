import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Query, Sse } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { ManageBookingsService } from './manage-bookings.service.js';
import { BookingStatusStreamService } from './booking-status-stream.service.js';

@Controller('api/v1/public/bookings')
export class ManageBookingsController {
  constructor(
    @Inject(ManageBookingsService) private readonly bookings: ManageBookingsService,
    @Inject(BookingStatusStreamService) private readonly statusStream: BookingStatusStreamService,
  ) {}

  @Patch(':code/cancel')
  cancel(@Param('code') code: string, @Body() body: unknown) {
    try {
      const schema = z.object({
        token: z.string().min(20).optional(),
        phone: z.string().min(6).optional(),
      }).refine((data) => Boolean(data.token || data.phone), {
        message: 'Either token or phone is required',
      });
      const input = schema.parse(body);
      return this.bookings.cancel(code, input.token, input.phone);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Patch(':code/confirm')
  confirm(@Param('code') code: string, @Body() body: unknown) {
    try {
      const schema = z.object({
        token: z.string().min(20).optional(),
        phone: z.string().min(6).optional(),
      }).refine((data) => Boolean(data.token || data.phone), {
        message: 'Either token or phone is required',
      });
      const input = schema.parse(body);
      return this.bookings.confirm(code, input.token, input.phone);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Patch(':code/reschedule')
  reschedule(@Param('code') code: string, @Body() body: unknown) {
    try {
      const schema = z.object({
        token: z.string().min(20).optional(),
        phone: z.string().min(6).optional(),
        startsAt: z.string().datetime(),
      }).refine((data) => Boolean(data.token || data.phone), {
        message: 'Either token or phone is required',
      });
      const input = schema.parse(body);
      return this.bookings.reschedule(code, input.token, input.startsAt, input.phone);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Sse(':code/status/stream')
  async streamStatus(@Param('code') code: string, @Query('token') token?: string) {
    try {
      const parsedToken = z.string().min(20).parse(token);
      await this.bookings.authorizeStatusStream(code, parsedToken);
      return this.statusStream.stream(code);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }

  @Get(':code')
  get(@Param('code') code: string, @Query('token') token?: string, @Query('phone') phone?: string) {
    try {
      const parsedToken = token ? z.string().min(20).parse(token) : undefined;
      const parsedPhone = phone ? z.string().min(6).parse(phone) : undefined;
      return this.bookings.get(code, parsedToken, parsedPhone);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}

