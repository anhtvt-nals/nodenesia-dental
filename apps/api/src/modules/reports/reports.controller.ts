import { BadRequestException, Controller, Get, Header, Inject, Query, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ReportsService } from './reports.service.js';

const rangeSchema = z.object({ from: z.string().date(), to: z.string().date() }).refine(({ from, to }) => from < to, 'Invalid date range');
const parseRange = (query: unknown) => { try { const input = rangeSchema.parse(query); return { from: new Date(`${input.from}T00:00:00.000Z`), to: new Date(`${input.to}T00:00:00.000Z`) }; } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } };

@Controller('api/v1/admin')
@UseGuards(AccessTokenGuard)
@Roles('owner', 'staff')
export class ReportsController {
  constructor(@Inject(ReportsService) private readonly reports: ReportsService) {}
  @Get('reports/bookings') summary(@Query() query: unknown) { return this.reports.summary(parseRange(query)); }
  @Get('export/bookings.csv') @Header('content-type', 'text/csv; charset=utf-8') @Header('content-disposition', 'attachment; filename="bookings.csv"') csv(@Query() query: unknown) { return this.reports.bookingsCsv(parseRange(query)); }
}
