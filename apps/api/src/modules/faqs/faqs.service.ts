import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { FaqsRepository } from './faqs.repository.js';

export type FaqInput = { question: string; answer: string; serviceId?: string | null; isPublished?: boolean; sortOrder?: number };
type Actor = { userId: string; ip?: string };

@Injectable()
export class FaqsService {
  constructor(@Inject(FaqsRepository) private readonly repository: FaqsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  listPublic() { return this.repository.listPublic(); }
  listAdmin() { return this.repository.listAdmin(); }
  async create(input: FaqInput, actor: Actor) { const faq = await this.repository.create(input); await this.audit.record({ ...actor, action: 'create', entity: 'faq', entityId: faq.id, diff: input }); return faq; }
  async update(id: string, input: Partial<FaqInput>, actor: Actor) { const before = await this.repository.findById(id); if (!before) throw new NotFoundException('FAQ not found'); const faq = await this.repository.update(id, input); await this.audit.record({ ...actor, action: 'update', entity: 'faq', entityId: id, diff: { before, after: input } }); return faq; }
}
