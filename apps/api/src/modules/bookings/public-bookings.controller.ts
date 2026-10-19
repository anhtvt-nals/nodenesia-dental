import { BadRequestException, Body, Controller, Inject, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { createPublicBookingSchema } from '@clinic/shared';
import { ZodError } from 'zod';
import { PublicBookingService } from './public-booking.service.js';
import { PublicBookingRateLimiter } from './public-booking-rate-limiter.js';

@Controller('api/v1/public/bookings')
export class PublicBookingsController {
  constructor(@Inject(PublicBookingService) private readonly publicBookings: PublicBookingService, @Inject(PublicBookingRateLimiter) private readonly limiter: PublicBookingRateLimiter) {}

  @Post()
  async create(@Body() body: unknown, @Req() request: FastifyRequest) {
    try {
      const input = createPublicBookingSchema.parse(body);
      this.limiter.check([`ip:${request.ip}`, `phone:${input.phone}`]);
      return await this.publicBookings.create(input);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
