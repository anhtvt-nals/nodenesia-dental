import { describe, expect, it, vi } from 'vitest';
import { PatientsAdminService } from './patients-admin.service.js';

describe('PatientsAdminService', () => {
  it('audits a patient note update', async () => {
    const patients = { findById: vi.fn().mockResolvedValue({ id: 'patient-id', notes: null }), updateNotes: vi.fn().mockResolvedValue({ id: 'patient-id', notes: 'Call first' }) };
    const audit = { record: vi.fn() };
    const service = new PatientsAdminService(patients as never, audit as never);
    await service.updateNotes('patient-id', 'Call first', { userId: 'staff-id' });
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ entity: 'patient', action: 'update_notes' }));
  });

  it('passes a patient search query to the repository', async () => {
    const patients = { list: vi.fn().mockResolvedValue([]) };
    const service = new PatientsAdminService(patients as never, {} as never);
    await service.list('Rina');
    expect(patients.list).toHaveBeenCalledWith('Rina');
  });
});
