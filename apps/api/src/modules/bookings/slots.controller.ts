import { BadRequestException, Controller, Get, Inject, Query } from '@nestjs/common';
import { slotQuerySchema } from '@clinic/shared';
import { ZodError } from 'zod';
import { AvailabilityService } from './availability.service.js';

@Controller('api/v1/public/slots')
export class SlotsController {
  constructor(@Inject(AvailabilityService) private readonly availability: AvailabilityService) {}

  @Get()
  find(
    @Query('serviceId') serviceId: string,
    @Query('date') date: string,
    @Query('doctorId') doctorId?: string,
  ) {
    try {
      const query = slotQuerySchema.parse({ serviceId, date, doctorId });
      return this.availability.find(query.serviceId, query.date, query.doctorId);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
}
