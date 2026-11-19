import { ConflictException, Inject, Injectable, Optional } from '@nestjs/common';
import { AdminBookingsRepository } from './admin-bookings.repository.js';
import { AuditLogService } from '../audit-logs/audit-log.service.js';
import { BookingStatusStreamService } from './booking-status-stream.service.js';

@Injectable()
export class AdminBookingsService {
  constructor(
    @Inject(AdminBookingsRepository) private readonly repository: AdminBookingsRepository,
    @Inject(AuditLogService) private readonly audit: AuditLogService,
    @Optional() @Inject(BookingStatusStreamService) private readonly statusStream?: BookingStatusStreamService,
  ) {}

  private mapBookings(bookings: Awaited<ReturnType<AdminBookingsRepository['list']>>) {
    return bookings.map((booking) => {
      const patientBookings = (booking.patient as { bookings?: Array<{ status: string }> }).bookings;
      const noShowCount = patientBookings
        ? patientBookings.filter((b) => b.status === 'no_show').length
        : 0;

      return {
        code: booking.code,
        status: booking.status,
        ...(booking.createdAt ? { createdAt: booking.createdAt.toISOString() } : {}),
        startsAt: booking.startsAt.toISOString(),
        endsAt: booking.endsAt.toISOString(),
        ...(booking.turnoverEndsAt ? { turnoverEndsAt: booking.turnoverEndsAt.toISOString() } : {}),
        ...(booking.chairIndex != null ? { chairIndex: booking.chairIndex } : {}),
        ...(booking.parentBookingId != null ? { parentBookingId: booking.parentBookingId } : {}),
        ...(booking.complaint ? { complaint: booking.complaint } : {}),
        ...(booking.notes ? { notes: booking.notes } : {}),
        ...(booking.bookingFor ? { bookingFor: booking.bookingFor } : {}),
        ...(booking.bookerName ? { bookerName: booking.bookerName } : {}),
        ...(booking.bookerPhone ? { bookerPhone: booking.bookerPhone } : {}),
        ...(booking.patientAge != null ? { patientAge: booking.patientAge } : {}),
        ...(booking.patientType ? { patientType: booking.patientType } : {}),
        ...(booking.birthDate ? { patientBirthDate: booking.birthDate.toISOString().slice(0, 10) } : {}),
        ...(booking.payer ? { payer: booking.payer } : {}),
        patient: {
          name: booking.patient.name,
          phone: booking.patient.phoneE164,
          noShowCount,
        },
        doctor: booking.doctor.name,
        service: booking.service.name,
        ...(booking.doctorId ? { doctorId: booking.doctorId } : {}),
        ...(booking.serviceId ? { serviceId: booking.serviceId } : {}),
        ...(booking.service && 'durationMinutes' in booking.service ? { serviceDuration: booking.service.durationMinutes } : {}),
        ...(booking.service && 'requiresConsultation' in booking.service ? { requiresConsultation: booking.service.requiresConsultation } : {}),
      };
    });
  }

  async list(
    filter: {
      from?: Date;
      to?: Date;
      doctorId?: string;
      status?: 'pending' | 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
    } = {},
  ) {
    const bookings = await this.repository.list(filter);
    return this.mapBookings(bookings);
  }

  async listPaginated(filter: {
    from?: Date;
    to?: Date;
    doctorId?: string;
    status?: 'pending' | 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'cancelled' | 'no_show';
    q?: string;
    page: number;
    pageSize: number;
    skip: number;
  }) {
    const { items, total } = await this.repository.listPaginated({
      from: filter.from,
      to: filter.to,
      doctorId: filter.doctorId,
      status: filter.status,
      q: filter.q,
      skip: filter.skip,
      take: filter.pageSize,
    });
    return {
      items: this.mapBookings(items),
      total,
      page: filter.page,
      pageSize: filter.pageSize,
    };
  }

  async cancel(code: string, reason: string | undefined, actor: { userId: string; ip?: string }) {
    const result = await this.repository.cancel(code, reason);
    if (result.count === 0) throw new ConflictException('Booking cannot be cancelled');
    this.statusStream?.publish(code, 'cancelled');
    await this.audit.record({ ...actor, action: 'cancel', entity: 'booking', entityId: code, diff: { reason } });
    return { code, status: 'cancelled' as const };
  }

  async changeStatus(
    code: string,
    status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show',
    optionsOrActor: { chairIndex?: number; phone?: string } | { userId: string; ip?: string } = {},
    maybeActor: { userId: string; ip?: string } = { userId: 'system' },
  ) {
    const isActor = 'userId' in optionsOrActor;
    const actor = isActor ? (optionsOrActor as { userId: string; ip?: string }) : maybeActor;
    const chairIndex = isActor ? undefined : (optionsOrActor as { chairIndex?: number }).chairIndex;
    const phone = isActor ? undefined : (optionsOrActor as { phone?: string }).phone;

    const allowedFrom: Array<'pending' | 'confirmed' | 'arrived' | 'in_chair'> =
      status === 'confirmed'
        ? ['pending']
        : status === 'arrived'
        ? ['pending', 'confirmed']
        : status === 'in_chair'
        ? ['pending', 'confirmed', 'arrived']
        : ['pending', 'confirmed', 'arrived', 'in_chair'];

    const result = await this.repository.changeStatus(code, status, allowedFrom, chairIndex);
    if (result.count === 0) throw new ConflictException('Invalid booking status transition');
    this.statusStream?.publish(code, status);
    if (status === 'confirmed') {
      if (phone) {
        await this.repository.attachPatientPhone(code, phone);
      }
      await this.repository.queueConfirmationAndReminders(code);
    }
    if (status === 'completed') await this.repository.queueReviewRequest(code);
    await this.audit.record({
      ...actor,
      action: 'update_status',
      entity: 'booking',
      entityId: code,
      diff: { status, chairIndex, ...(phone ? { phone } : {}) },
    });
    return { code, status, chairIndex };
  }

  async extend(code: string, additionalMinutes: number, actor: { userId: string; ip?: string }) {
    const updated = await this.repository.extend(code, additionalMinutes);
    await this.audit.record({
      ...actor,
      action: 'extend_time',
      entity: 'booking',
      entityId: code,
      diff: { additionalMinutes, newEndsAt: updated.endsAt },
    });
    return {
      code,
      endsAt: updated.endsAt.toISOString(),
      turnoverEndsAt: updated.turnoverEndsAt?.toISOString() ?? null,
    };
  }

  async updateNotes(code: string, notes: string, actor: { userId: string; ip?: string }) {
    const updated = await this.repository.updateNotes(code, notes);
    await this.audit.record({
      ...actor,
      action: 'update_clinical_notes',
      entity: 'booking',
      entityId: code,
      diff: { notes },
    });
    return { code, notes: updated.notes };
  }
}
