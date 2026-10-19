import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { FaqInput } from './faqs.service.js';

@Injectable()
export class FaqsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  listPublic() { return this.prisma.faq.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }] }); }
  listAdmin() { return this.prisma.faq.findMany({ orderBy: [{ sortOrder: 'asc' }, { question: 'asc' }] }); }
  findById(id: string) { return this.prisma.faq.findUnique({ where: { id } }); }
  create(input: FaqInput) { return this.prisma.faq.create({ data: input }); }
  update(id: string, input: Partial<FaqInput>) { return this.prisma.faq.update({ where: { id }, data: input }); }
}
