import { Inject, Injectable } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { ContentRepository } from './content.repository.js';

@Injectable()
export class ContentService {
  constructor(@Inject(ContentRepository) private readonly repository: ContentRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  get(key: string, locale: string) { return this.repository.get(key, locale); }
  list() { return this.repository.list(); }
  async save(key: string, locale: string, content: object, actor: { userId: string; ip?: string }) { const before = await this.repository.get(key, locale); const block = await this.repository.upsert(key, locale, content); await this.audit.record({ ...actor, action: before ? 'update' : 'create', entity: 'content_block', entityId: `${key}:${locale}`, diff: { before: before?.content ?? null, after: content } }); return block; }
}
