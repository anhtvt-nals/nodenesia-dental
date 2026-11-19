import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { PatientsRepository } from './patients.repository.js';

@Injectable()
export class PatientsAdminService {
  constructor(@Inject(PatientsRepository) private readonly patients: PatientsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}
  list(query?: string) { return this.patients.list(query); }
  async listPaginated(query: string | undefined, page: number, pageSize: number, skip: number) {
    const { items, total } = await this.patients.listPaginated(query, skip, pageSize);
    return { items, total, page, pageSize };
  }
  async updateNotes(id: string, notes: string | null, actor: { userId: string; ip?: string }) { const before = await this.patients.findById(id); if (!before) throw new NotFoundException('Patient not found'); const patient = await this.patients.updateNotes(id, notes); await this.audit.record({ ...actor, action: 'update_notes', entity: 'patient', entityId: id, diff: { before: before.notes, after: notes } }); return patient; }
}
