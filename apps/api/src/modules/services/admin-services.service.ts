import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { ServicesRepository } from './services.repository.js';

export type ServiceInput = {
  slug: string; name: string; shortDesc: string; description: string; zone: 'front' | 'molar' | 'gum' | 'arch';
  category: 'prevention' | 'aesthetic' | 'orthodontic' | 'restorative' | 'surgery' | 'pediatric'; durationMinutes: number;
  priceFrom: string; priceTo?: string | null; priceNote?: string | null; isActive?: boolean; sortOrder?: number;
};

@Injectable()
export class AdminServicesService {
  constructor(@Inject(ServicesRepository) private readonly repository: ServicesRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  list() { return this.repository.listAdmin(); }

  async create(input: ServiceInput, actor: { userId: string; ip?: string }) {
    const service = await this.repository.create(input);
    await this.audit.record({ ...actor, action: 'create', entity: 'service', entityId: service.id, diff: input });
    return service;
  }

  async update(id: string, input: Partial<ServiceInput>, actor: { userId: string; ip?: string }) {
    const existing = await this.repository.findById(id);
    if (!existing) throw new NotFoundException('Service not found');
    const service = await this.repository.update(id, input);
    await this.audit.record({ ...actor, action: 'update', entity: 'service', entityId: id, diff: { before: existing, after: input } });
    return service;
  }
}
