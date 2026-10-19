import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { PromotionInput } from './promotions.service.js';

@Injectable()
export class PromotionsRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  listPublic() { const now = new Date(); return this.prisma.promotion.findMany({ where: { isPublished: true, startsAt: { lte: now }, endsAt: { gt: now } }, orderBy: { startsAt: 'asc' } }); }
  listAdmin() { return this.prisma.promotion.findMany({ orderBy: { startsAt: 'desc' } }); }
  findById(id: string) { return this.prisma.promotion.findUnique({ where: { id } }); }
  create(input: PromotionInput) { return this.prisma.promotion.create({ data: { ...input, startsAt: new Date(input.startsAt), endsAt: new Date(input.endsAt) } }); }
  update(id: string, input: Partial<PromotionInput>) { return this.prisma.promotion.update({ where: { id }, data: { ...input, ...(input.startsAt ? { startsAt: new Date(input.startsAt) } : {}), ...(input.endsAt ? { endsAt: new Date(input.endsAt) } : {}) } }); }
}
