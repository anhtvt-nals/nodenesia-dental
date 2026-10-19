import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { PatientsAdminService } from './patients-admin.service.js';

@Controller('api/v1/admin/patients')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class PatientsAdminController {
  constructor(@Inject(PatientsAdminService) private readonly patients: PatientsAdminService) {}
  @Get() list(@Query('q') rawQuery?: string) { try { return this.patients.list(rawQuery ? z.string().trim().min(1).max(120).parse(rawQuery) : undefined); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch(':id/notes') updateNotes(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.patients.updateNotes(id, z.object({ notes: z.string().trim().max(2000).nullable() }).parse(body).notes, { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
