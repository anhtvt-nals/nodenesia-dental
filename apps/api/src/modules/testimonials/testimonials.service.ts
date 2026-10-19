import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { TestimonialsRepository } from './testimonials.repository.js';

export type TestimonialInput = { name: string; text: string; rating: number; source: string; isPublished?: boolean; sortOrder?: number };
@Injectable()
export class TestimonialsService {
  constructor(@Inject(TestimonialsRepository) private readonly repository: TestimonialsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  listPublic() { return this.repository.listPublic(); }
  listAdmin() { return this.repository.listAdmin(); }
  async create(input: TestimonialInput, actor: { userId: string; ip?: string }) { const testimonial = await this.repository.create(input); await this.audit.record({ ...actor, action: 'create', entity: 'testimonial', entityId: testimonial.id, diff: input }); return testimonial; }
  async update(id: string, input: Partial<TestimonialInput>, actor: { userId: string; ip?: string }) { const before = await this.repository.findById(id); if (!before) throw new NotFoundException('Testimonial not found'); const testimonial = await this.repository.update(id, input); await this.audit.record({ ...actor, action: 'update', entity: 'testimonial', entityId: id, diff: { before, after: input } }); return testimonial; }
}
