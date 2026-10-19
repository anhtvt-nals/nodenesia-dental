import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { AdminDoctorsService } from './admin-doctors.service.js';

const doctorSchema = z.object({ slug: z.string().trim().regex(/^[a-z0-9-]+$/).max(80), name: z.string().trim().min(1).max(120), title: z.string().trim().max(120).nullable().optional(), specialty: z.string().trim().max(160).nullable().optional(), bio: z.string().trim().max(5000).nullable().optional(), photoUrl: z.string().url().nullable().optional(), isActive: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10_000).optional(), serviceIds: z.array(z.string().uuid()).max(100) });
const hoursSchema = z.array(z.object({ weekday: z.number().int().min(0).max(6), start: z.string(), end: z.string() })).max(28);
const timeOffSchema = z.object({ doctorId: z.string().uuid().nullable().optional(), startsAt: z.string().datetime(), endsAt: z.string().datetime(), reason: z.string().trim().max(500).optional() });
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });

@Controller('api/v1/admin')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class AdminDoctorsController {
  constructor(@Inject(AdminDoctorsService) private readonly doctors: AdminDoctorsService) {}

  @Get('doctors') list() { return this.doctors.list(); }
  @Post('doctors') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.create(doctorSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('doctors/:id') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.update(id, doctorSchema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Put('doctors/:id/working-hours') replaceHours(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.replaceWorkingHours(id, hoursSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Post('time-offs') addTimeOff(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.addTimeOff(timeOffSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Get('time-offs') listTimeOffs() { return this.doctors.listTimeOffs(); }
  @Delete('time-offs/:id') removeTimeOff(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.doctors.removeTimeOff(id, actor(request)); }
}
