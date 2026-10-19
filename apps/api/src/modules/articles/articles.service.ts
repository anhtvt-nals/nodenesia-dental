import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { ArticlesRepository } from './articles.repository.js';

export type CategoryInput = { name: string; slug: string; sortOrder?: number };
export type ArticleInput = { slug: string; title: string; excerpt: string; body: string; categoryId?: string | null; coverUrl?: string | null; seoTitle?: string | null; seoDesc?: string | null; publishedAt?: string | null };
@Injectable()
export class ArticlesService {
  constructor(@Inject(ArticlesRepository) private readonly repository: ArticlesRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  listPublic() { return this.repository.listPublic(); }
  async getPublicBySlug(slug: string) { const article = await this.repository.findPublicBySlug(slug); if (!article) throw new NotFoundException('Article not found'); return article; }
  listAdmin() { return this.repository.listAdmin(); }
  listCategories() { return this.repository.listCategories(); }
  async createCategory(input: CategoryInput, actor: { userId: string; ip?: string }) { const category = await this.repository.createCategory(input); await this.audit.record({ ...actor, action: 'create', entity: 'article_category', entityId: category.id, diff: input }); return category; }
  async create(input: ArticleInput, actor: { userId: string; ip?: string }) { this.validatePublishAt(input.publishedAt); const article = await this.repository.create(input); await this.audit.record({ ...actor, action: 'create', entity: 'article', entityId: article.id, diff: input }); return article; }
  async update(id: string, input: Partial<ArticleInput>, actor: { userId: string; ip?: string }) { const before = await this.repository.findById(id); if (!before) throw new NotFoundException('Article not found'); this.validatePublishAt(input.publishedAt); const article = await this.repository.update(id, input); await this.audit.record({ ...actor, action: 'update', entity: 'article', entityId: id, diff: { before, after: input } }); return article; }
  private validatePublishAt(value: string | null | undefined) { if (value && Number.isNaN(new Date(value).getTime())) throw new BadRequestException('Invalid publish time'); }
}
