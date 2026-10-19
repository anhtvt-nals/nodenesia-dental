import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { GalleryInput } from './gallery.service.js';

@Injectable()
export class GalleryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  listPublic() { return this.prisma.galleryItem.findMany({ where: { isPublished: true, consentConfirmed: true }, orderBy: { sortOrder: 'asc' } }); }
  listAdmin() { return this.prisma.galleryItem.findMany({ orderBy: { sortOrder: 'asc' } }); }
  findById(id: string) { return this.prisma.galleryItem.findUnique({ where: { id } }); }
  create(input: GalleryInput) { return this.prisma.galleryItem.create({ data: input }); }
  update(id: string, input: Partial<GalleryInput>) { return this.prisma.galleryItem.update({ where: { id }, data: input }); }
}
