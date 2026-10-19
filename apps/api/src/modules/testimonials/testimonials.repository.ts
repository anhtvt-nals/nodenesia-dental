import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { TestimonialInput } from './testimonials.service.js';

@Injectable()
export class TestimonialsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  listPublic() { return this.prisma.testimonial.findMany({ where: { isPublished: true }, orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  listAdmin() { return this.prisma.testimonial.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  findById(id: string) { return this.prisma.testimonial.findUnique({ where: { id } }); }
  create(input: TestimonialInput) { return this.prisma.testimonial.create({ data: input }); }
  update(id: string, input: Partial<TestimonialInput>) { return this.prisma.testimonial.update({ where: { id }, data: input }); }
}
