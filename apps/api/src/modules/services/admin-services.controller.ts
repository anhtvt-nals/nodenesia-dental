import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminServicesService } from './admin-services.service.js';

const serviceSchema = z.object({
  slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(80), name: z.string().trim().min(1).max(120), shortDesc: z.string().trim().min(1).max(300), description: z.string().trim().min(1).max(10_000),
  zone: z.enum(['front', 'molar', 'gum', 'arch']), category: z.enum(['prevention', 'aesthetic', 'orthodontic', 'restorative', 'surgery', 'pediatric']), durationMinutes: z.number().int().min(15).max(480),
  priceFrom: z.string().regex(/^\d+(\.\d{1,2})?$/), priceTo: z.string().regex(/^\d+(\.\d{1,2})?$/).nullable().optional(), priceNote: z.string().trim().max(200).nullable().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10_000).optional(),
});
const updateServiceSchema = serviceSchema.partial().refine((input) => Object.keys(input).length > 0, 'At least one field is required');

@Controller('api/v1/admin/services')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AdminServicesController {
  constructor(@Inject(AdminServicesService) private readonly services: AdminServicesService) {}

  @Get()
  list() { return this.services.list(); }

  @Post()
  create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try { return this.services.create(serviceSchema.parse(body), { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) {
    try { return this.services.update(id, updateServiceSchema.parse(body), { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; }
  }
}
