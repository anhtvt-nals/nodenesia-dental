import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { PromotionsRepository } from './promotions.repository.js';

export type PromotionInput = { title: string; description: string; serviceId?: string | null; startsAt: string; endsAt: string; isPublished?: boolean };
@Injectable()
export class PromotionsService {
  constructor(@Inject(PromotionsRepository) private readonly repository: PromotionsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  listPublic() { return this.repository.listPublic(); }
  listAdmin() { return this.repository.listAdmin(); }
  async create(input: PromotionInput, actor: { userId: string; ip?: string }) { this.validate(input); const promotion = await this.repository.create(input); await this.audit.record({ ...actor, action: 'create', entity: 'promotion', entityId: promotion.id, diff: input }); return promotion; }
  async update(id: string, input: Partial<PromotionInput>, actor: { userId: string; ip?: string }) { const before = await this.repository.findById(id); if (!before) throw new NotFoundException('Promotion not found'); this.validate({ ...before, ...input, startsAt: input.startsAt ?? before.startsAt.toISOString(), endsAt: input.endsAt ?? before.endsAt.toISOString() }); const promotion = await this.repository.update(id, input); await this.audit.record({ ...actor, action: 'update', entity: 'promotion', entityId: id, diff: { before, after: input } }); return promotion; }
  private validate(input: { startsAt: string; endsAt: string }) { if (new Date(input.endsAt) <= new Date(input.startsAt)) throw new BadRequestException('Promotion must end after it starts'); }
}
