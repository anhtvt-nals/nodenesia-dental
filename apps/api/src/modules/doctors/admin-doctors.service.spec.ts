import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AdminDoctorsService } from './admin-doctors.service.js';

describe('AdminDoctorsService', () => {
  it('rejects overlapping shifts before replacing a doctor schedule', async () => {
    const repository = { findById: vi.fn().mockResolvedValue({ id: 'doctor-id' }), replaceWorkingHours: vi.fn() };
    const service = new AdminDoctorsService(repository as never, { record: vi.fn() } as never);

    await expect(service.replaceWorkingHours('doctor-id', [{ weekday: 1, start: '09:00', end: '12:00' }, { weekday: 1, start: '11:30', end: '14:00' }], { userId: 'user-id' })).rejects.toBeInstanceOf(BadRequestException);
    expect(repository.replaceWorkingHours).not.toHaveBeenCalled();
  });

  it('deletes an existing time off and records the audit event', async () => {
    const timeOff = { id: 'time-off-id', startsAt: new Date(), endsAt: new Date() };
    const repository = { findTimeOff: vi.fn().mockResolvedValue(timeOff), deleteTimeOff: vi.fn() };
    const audit = { record: vi.fn() };
    const service = new AdminDoctorsService(repository as never, audit as never);

    await service.removeTimeOff('time-off-id', { userId: 'user-id' });

    expect(repository.deleteTimeOff).toHaveBeenCalledWith('time-off-id');
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({ action: 'delete', entity: 'time_off', entityId: 'time-off-id' }));
  });
});
