import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { GalleryInput } from './gallery.service.js';

@Injectable()
export class GalleryRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async listPublic() {
    const items = await this.prisma.galleryItem.findMany({
      where: { isPublished: true, consentConfirmed: true },
      include: {
        service: {
          select: {
            slug: true,
            name: true,
            nameEn: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return items.map((item) => ({
      id: item.id,
      type: item.type,
      serviceSlug: item.service?.slug ?? '',
      serviceName: item.service?.name ?? '',
      serviceNameEn: item.service?.nameEn ?? '',
      beforeUrl: item.beforeUrl,
      afterUrl: item.afterUrl,
      beforeLabel: item.beforeLabel ?? '',
      afterLabel: item.afterLabel ?? '',
      caption: item.caption ?? '',
      captionEn: item.captionEn ?? '',
      treatmentDuration: item.treatmentDuration ?? '',
      consentConfirmed: item.consentConfirmed,
      sortOrder: item.sortOrder,
    }));
  }

  listAdmin() {
    return this.prisma.galleryItem.findMany({
      include: {
        service: {
          select: {
            id: true,
            name: true,
            nameEn: true,
            slug: true,
          },
        },
      },
      orderBy: { sortOrder: 'asc' },
    });
  }

  findById(id: string) { return this.prisma.galleryItem.findUnique({ where: { id } }); }
  create(input: GalleryInput) { return this.prisma.galleryItem.create({ data: input }); }
  update(id: string, input: Partial<GalleryInput>) { return this.prisma.galleryItem.update({ where: { id }, data: input }); }
  delete(id: string) { return this.prisma.galleryItem.delete({ where: { id } }); }
}
