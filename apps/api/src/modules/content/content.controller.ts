import { BadRequestException, Body, Controller, Get, Inject, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { ContentService } from './content.service.js';

const params = z.object({ key: z.string().trim().regex(/^[a-z0-9_-]+$/).max(100) });
const locale = z.string().trim().regex(/^[a-z]{2}(-[A-Z]{2})?$/).max(10);
const bodySchema = z.object({ locale, content: z.record(z.string(), z.unknown()) });
@Controller('api/v1')
export class ContentController {
  constructor(@Inject(ContentService) private readonly content: ContentService) {}
  @Get('public/content/:key') get(@Param() rawParams: unknown, @Query('locale') rawLocale?: string) { try { return this.content.get(params.parse(rawParams).key, locale.parse(rawLocale ?? 'id')); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Get('admin/content') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') list() { return this.content.list(); }
  @Put('admin/content/:key') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') save(@Param() rawParams: unknown, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { const input = bodySchema.parse(body); return this.content.save(params.parse(rawParams).key, input.locale, input.content, { userId: request.user.sub, ip: request.ip }); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
