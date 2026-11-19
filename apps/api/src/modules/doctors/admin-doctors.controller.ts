import type { FastifyRequest } from 'fastify';
import { DoctorAvatarService } from './doctor-avatar.service.js';
import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Put, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { paginateArray } from '../../common/pagination.js';
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
  constructor(@Inject(AdminDoctorsService) private readonly doctors: AdminDoctorsService, @Inject(DoctorAvatarService) private readonly avatars: DoctorAvatarService) {}

  @Post('doctors/avatar-upload')
  async avatarUpload(@Req() request: FastifyRequest) {
    try {
      const file = await request.file();
      if (!file) throw new BadRequestException('Choose an avatar image.');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) throw new BadRequestException('Use a JPG, PNG or WebP image.');
      const body = await file.toBuffer();
      if (file.file.truncated) throw new BadRequestException('Image must be at most 5 MB.');
      return await this.avatars.upload(file.mimetype, body);
    } catch (error) {
      if ((error as { code?: string }).code?.startsWith('FST_')) throw new BadRequestException('Upload one image up to 5 MB.');
      throw error;
    }
  }

  @Get('doctors') list(@Query('page') page?: string, @Query('pageSize') pageSize?: string) { return paginateArray(this.doctors.list(), { page, pageSize }); }
  @Post('doctors') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.create(doctorSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('doctors/:id') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.update(id, doctorSchema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Delete('doctors/:id') remove(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.doctors.remove(id, actor(request)); }
  @Put('doctors/:id/working-hours') replaceHours(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.replaceWorkingHours(id, hoursSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Post('time-offs') addTimeOff(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.doctors.addTimeOff(timeOffSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Get('time-offs') listTimeOffs(@Query('page') page?: string, @Query('pageSize') pageSize?: string) { return paginateArray(this.doctors.listTimeOffs(), { page, pageSize }); }
  @Delete('time-offs/:id') removeTimeOff(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.doctors.removeTimeOff(id, actor(request)); }
}
