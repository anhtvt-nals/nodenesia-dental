import { Inject } from '@nestjs/common';
import { AuditLogService } from '../audit-logs/audit-log.service.js';

export type AdminClinicSettings = {
  name: string;
  phone: string;
  waNumber: string;
  address: string;
  timezone: string;
  adminLocale: string;
  slotStepMinutes: number;
  bookingLeadMinutes: number;
  bookingHorizonDays: number;
  cancelCutoffHours: number;
  chairsCount: number;
};

export interface AdminSettingsRepository {
  getAdmin(): Promise<AdminClinicSettings>;
  update(input: Partial<AdminClinicSettings>): Promise<AdminClinicSettings>;
}

export class AdminSettingsService {
  constructor(private readonly repository: AdminSettingsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  get(): Promise<AdminClinicSettings> {
    return this.repository.getAdmin();
  }

  async update(input: Partial<AdminClinicSettings>, actor: { userId: string; ip?: string }): Promise<AdminClinicSettings> {
    const before = await this.repository.getAdmin();
    const settings = await this.repository.update(input);
    await this.audit.record({ ...actor, action: 'update', entity: 'clinic_settings', entityId: 'default', diff: { before, after: input } });
    return settings;
  }
}
