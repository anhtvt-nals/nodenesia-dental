import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { paginateArray } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { FaqsService } from './faqs.service.js';

const faqSchema = z.object({ question: z.string().trim().min(1).max(500), answer: z.string().trim().min(1).max(10_000), serviceId: z.string().uuid().nullable().optional(), isPublished: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10_000).optional() });
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });

@Controller('api/v1')
export class FaqsController {
  constructor(@Inject(FaqsService) private readonly faqs: FaqsService) {}
  @Get('public/faqs') listPublic() { return this.faqs.listPublic(); }
  @Get('admin/faqs') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin(@Query('page') page?: string, @Query('pageSize') pageSize?: string) { return paginateArray(this.faqs.listAdmin(), { page, pageSize }); }
  @Post('admin/faqs') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.faqs.create(faqSchema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/faqs/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.faqs.update(id, faqSchema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
