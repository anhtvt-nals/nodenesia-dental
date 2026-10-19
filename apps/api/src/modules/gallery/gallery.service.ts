import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { GalleryRepository } from './gallery.repository.js';

export type GalleryInput = { type: 'before_after' | 'photo'; beforeUrl?: string | null; afterUrl?: string | null; caption?: string | null; serviceId?: string | null; consentConfirmed?: boolean; isPublished?: boolean; sortOrder?: number };
@Injectable()
export class GalleryService {
  constructor(@Inject(GalleryRepository) private readonly repository: GalleryRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  listPublic() { return this.repository.listPublic(); }
  listAdmin() { return this.repository.listAdmin(); }
  async create(input: GalleryInput, actor: { userId: string; ip?: string }) { this.assertPublishable(input); const item = await this.repository.create(input); await this.audit.record({ ...actor, action: 'create', entity: 'gallery_item', entityId: item.id, diff: input }); return item; }
  async update(id: string, input: Partial<GalleryInput>, actor: { userId: string; ip?: string }) { const before = await this.repository.findById(id); if (!before) throw new NotFoundException('Gallery item not found'); this.assertPublishable({ ...before, ...input }); const item = await this.repository.update(id, input); await this.audit.record({ ...actor, action: 'update', entity: 'gallery_item', entityId: id, diff: { before, after: input } }); return item; }
  private assertPublishable(input: GalleryInput) { if (input.isPublished && (!input.consentConfirmed || (input.type === 'before_after' && (!input.beforeUrl || !input.afterUrl)) || (input.type === 'photo' && !input.afterUrl))) throw new BadRequestException('Published gallery items require consent and images'); }
}
