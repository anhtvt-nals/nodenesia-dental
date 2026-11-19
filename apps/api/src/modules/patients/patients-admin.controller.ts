import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { parsePagination } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { PatientsAdminService } from './patients-admin.service.js';

@Controller('api/v1/admin/patients')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class PatientsAdminController {
  constructor(@Inject(PatientsAdminService) private readonly patients: PatientsAdminService) {}
  @Get() list(@Query('q') rawQuery?: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    try {
      const q = rawQuery ? z.string().trim().min(1).max(120).parse(rawQuery) : undefined;
      const pagination = parsePagination({ page, pageSize });
      return this.patients.listPaginated(q, pagination.page, pagination.pageSize, pagination.skip);
    } catch (error) {
      if (error instanceof ZodError) throw new BadRequestException(error.flatten());
      throw error;
    }
  }
  @Patch(':id/notes') updateNotes(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.patients.updateNotes(id, z.object({ notes: z.string().trim().max(2000).nullable() }).parse(body).notes, { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
