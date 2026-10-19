import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ArticleInput, CategoryInput } from './articles.service.js';

@Injectable()
export class ArticlesRepository {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}
  listPublic() { return this.prisma.article.findMany({ where: { publishedAt: { lte: new Date() } }, orderBy: { publishedAt: 'desc' }, include: { category: true } }); }
  findPublicBySlug(slug: string) { return this.prisma.article.findFirst({ where: { slug, publishedAt: { lte: new Date() } }, include: { category: true } }); }
  listAdmin() { return this.prisma.article.findMany({ orderBy: { publishedAt: 'desc' }, include: { category: true } }); }
  findById(id: string) { return this.prisma.article.findUnique({ where: { id } }); }
  create(input: ArticleInput) { return this.prisma.article.create({ data: { ...input, publishedAt: input.publishedAt ? new Date(input.publishedAt) : null }, include: { category: true } }); }
  update(id: string, input: Partial<ArticleInput>) { return this.prisma.article.update({ where: { id }, data: { ...input, ...(input.publishedAt !== undefined ? { publishedAt: input.publishedAt ? new Date(input.publishedAt) : null } : {}) }, include: { category: true } }); }
  listCategories() { return this.prisma.articleCategory.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] }); }
  createCategory(input: CategoryInput) { return this.prisma.articleCategory.create({ data: input }); }
}
