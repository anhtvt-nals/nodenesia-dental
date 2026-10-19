import { BadRequestException, Body, Controller, Get, Inject, Param, Patch, Post, Req, UseGuards } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { GalleryService } from './gallery.service.js';

const schema = z.object({ type: z.enum(['before_after', 'photo']), beforeUrl: z.string().url().nullable().optional(), afterUrl: z.string().url().nullable().optional(), caption: z.string().trim().max(500).nullable().optional(), serviceId: z.string().uuid().nullable().optional(), consentConfirmed: z.boolean().optional(), isPublished: z.boolean().optional(), sortOrder: z.number().int().min(0).max(10_000).optional() });
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });

@Controller('api/v1')
export class GalleryController {
  constructor(@Inject(GalleryService) private readonly gallery: GalleryService) {}
  @Get('public/gallery') listPublic() { return this.gallery.listPublic(); }
  @Get('admin/gallery') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin() { return this.gallery.listAdmin(); }
  @Post('admin/gallery') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.gallery.create(schema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/gallery/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.gallery.update(id, schema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
}
