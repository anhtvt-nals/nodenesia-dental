import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Query } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { ManageBookingsService } from './manage-bookings.service.js';

@Controller('api/v1/public/bookings')
export class ManageBookingsController {
  constructor(@Inject(ManageBookingsService) private readonly bookings: ManageBookingsService) {}

  @Patch(':code/cancel')
  cancel(@Param('code') code: string, @Body() body: unknown) {
    try { return this.bookings.cancel(code, z.object({ token: z.string().min(20) }).parse(body).token); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }

  @Patch(':code/reschedule')
  reschedule(@Param('code') code: string, @Body() body: unknown) {
    try { const input = z.object({ token: z.string().min(20), startsAt: z.string().datetime() }).parse(body); return this.bookings.reschedule(code, input.token, input.startsAt); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }

  @Get(':code')
  get(@Param('code') code: string, @Query('token') token?: string) {
    try { return this.bookings.get(code, z.string().min(20).parse(token)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }
}

