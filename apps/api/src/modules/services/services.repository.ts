import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ServiceInput } from './admin-services.service.js';
import type { PublicService, ServicesReader } from './services.service.js';
@Injectable()
export class ServicesRepository implements ServicesReader {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  async listPublic(): Promise<PublicService[]> {
    const services = await this.prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { faqs: { where: { isPublished: true }, orderBy: { sortOrder: 'asc' } } },
    });
    return services.map((service) => ({
      id: service.id,
      slug: service.slug,
      name: service.name,
      nameEn: service.nameEn,
      shortDesc: service.shortDesc,
      shortDescEn: service.shortDescEn,
      description: service.description,
      descriptionEn: service.descriptionEn,
      zone: service.zone,
      category: service.category,
      durationMinutes: service.durationMinutes,
      priceFrom: service.priceFrom.toString(),
      priceTo: service.priceTo?.toString() ?? null,
      priceNote: service.priceNote,
      priceNoteEn: service.priceNoteEn,
      faqs: service.faqs.map((faq) => ({ question: faq.question, questionEn: faq.questionEn, answer: faq.answer, answerEn: faq.answerEn })),
    }));
  }

  listAdmin() { return this.prisma.service.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }

  findById(id: string) { return this.prisma.service.findUnique({ where: { id } }); }

  create(input: ServiceInput) { return this.prisma.service.create({ data: input }); }

  update(id: string, input: Partial<ServiceInput>) { return this.prisma.service.update({ where: { id }, data: input }); }
}
