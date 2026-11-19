import { BadRequestException, Body, Controller, Delete, Get, Inject, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { z, ZodError } from 'zod';
import { paginateArray } from '../../common/pagination.js';
import { AccessTokenGuard } from '../auth/guards/access-token.guard.js';
import { Roles } from '../auth/roles.decorator.js';
import { GalleryService } from './gallery.service.js';
import { GalleryImageService } from './gallery-image.service.js';

const schema = z.object({
  type: z.enum(['before_after', 'photo']),
  beforeUrl: z.string().url().nullable().optional(),
  afterUrl: z.string().url().nullable().optional(),
  beforeLabel: z.string().trim().max(100).nullable().optional(),
  afterLabel: z.string().trim().max(100).nullable().optional(),
  caption: z.string().trim().max(500).nullable().optional(),
  captionEn: z.string().trim().max(500).nullable().optional(),
  treatmentDuration: z.string().trim().max(100).nullable().optional(),
  serviceId: z.string().uuid().nullable().optional(),
  consentConfirmed: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  sortOrder: z.number().int().min(0).max(10_000).optional(),
});
const actor = (request: { user: { sub: string }; ip?: string }) => ({ userId: request.user.sub, ip: request.ip });

@Controller('api/v1')
export class GalleryController {
  constructor(
    @Inject(GalleryService) private readonly gallery: GalleryService,
    @Inject(GalleryImageService) private readonly galleryImage: GalleryImageService
  ) {}

  @Get('public/gallery') listPublic() { return this.gallery.listPublic(); }
  @Get('admin/gallery') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') listAdmin(@Query('page') page?: string, @Query('pageSize') pageSize?: string) { return paginateArray(this.gallery.listAdmin(), { page, pageSize }); }

  @Post('admin/gallery/upload')
  @UseGuards(AccessTokenGuard)
  @Roles('owner', 'staff')
  async uploadImage(@Req() request: FastifyRequest) {
    try {
      const file = await request.file();
      if (!file) throw new BadRequestException('Choose an image file.');
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
        throw new BadRequestException('Use a JPG, PNG or WebP image.');
      }
      const body = await file.toBuffer();
      if (file.file.truncated) throw new BadRequestException('Image must be at most 10 MB.');
      return await this.galleryImage.upload(file.mimetype, body);
    } catch (error) {
      if ((error as { code?: string }).code?.startsWith('FST_')) {
        throw new BadRequestException('Upload one image up to 10 MB.');
      }
      throw error;
    }
  }

  @Post('admin/gallery') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') create(@Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.gallery.create(schema.parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Patch('admin/gallery/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') update(@Param('id') id: string, @Body() body: unknown, @Req() request: { user: { sub: string }; ip?: string }) { try { return this.gallery.update(id, schema.partial().refine((input) => Object.keys(input).length > 0).parse(body), actor(request)); } catch (error) { if (error instanceof ZodError) throw new BadRequestException(error.flatten()); throw error; } }
  @Delete('admin/gallery/:id') @UseGuards(AccessTokenGuard) @Roles('owner', 'staff') delete(@Param('id') id: string, @Req() request: { user: { sub: string }; ip?: string }) { return this.gallery.delete(id, actor(request)); }
}
