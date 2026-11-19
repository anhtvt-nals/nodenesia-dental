import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { paginateArray } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { PromotionsService } from './promotions.service.js';

const schema = z.object({ title: z.string().trim().min(1).max(200), description: z.string().trim().min(1).max(5000), serviceId: z.string().uuid().nullable().optional(), startsAt: z.string().datetime(), endsAt: z.string().datetime(), isPublished: z.boolean().optional() });
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });
@Controller('api/v1')
export class PromotionsController {
  constructor(@Inject(PromotionsService) private readonly promotions: PromotionsService) {}
  @Get('public/promotions') listPublic() { return this.promotions.listPublic(); }
  @Get('admin/promotions') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin(@Query('page') page?: string, @Query('pageSize') pageSize?: string) { return paginateArray(this.promotions.listAdmin(), { page, pageSize }); }
  @Post('admin/promotions') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.promotions.create(schema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/promotions/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.promotions.update(id, schema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
