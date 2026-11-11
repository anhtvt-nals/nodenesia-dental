import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { AdminBookingsRepository } from './admin-bookings.repository.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';

@Injectable()
export class AdminBookingsService {
  constructor(@Inject(AdminBookingsRepository) private readonly repository: AdminBookingsRepository, @Inject(AuditLogService) private readonly audit: AuditLogService) {}

  async list(filter: { from?: Date; to?: Date; doctorId?: string; status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show' } = {}) {
    const bookings = await this.repository.list(filter);
    return bookings.map((booking) => ({
      code: booking.code,
      status: booking.status,
      startsAt: booking.startsAt.toISOString(),
      endsAt: booking.endsAt.toISOString(),
      patient: { name: booking.patient.name, phone: booking.patient.phoneE164 },
      doctor: booking.doctor.name,
      service: booking.service.name,
    }));
  }

  async cancel(code: string, reason: string | undefined, actor: { userId: string; ip?: string }) {
    const result = await this.repository.cancel(code, reason);
    if (result.count === 0) throw new ConflictException('Booking cannot be cancelled');
    await this.audit.record({ ...actor, action: 'cancel', entity: 'booking', entityId: code, diff: { reason } });
    return { code, status: 'cancelled' as const };
  }

  async changeStatus(code: string, status: 'confirmed' | 'completed' | 'no_show', actor: { userId: string; ip?: string }) {
    const allowedFrom: Array<'pending' | 'confirmed'> = status === 'confirmed' ? ['pending'] : ['pending', 'confirmed'];
    const result = await this.repository.changeStatus(code, status, allowedFrom);
    if (result.count === 0) throw new ConflictException('Invalid booking status transition');
    if (status === 'completed') await this.repository.queueReviewRequest(code);
    await this.audit.record({ ...actor, action: 'update_status', entity: 'booking', entityId: code, diff: { status } });
    return { code, status };
  }
}
