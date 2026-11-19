import { describe, expect, it, vi } from 'vitest';
import { bookingEvent, loadCalendarEvents, timeOffEvent } from './calendar-events';
import { listBookings, listTimeOffs, type Booking, type TimeOff } from '../../api/admin-api';
vi.mock('../../api/admin-api', () => ({ listBookings: vi.fn(), listTimeOffs: vi.fn().mockResolvedValue({ items: [], total: 0, page: 1, pageSize: 500 }) }));
const booking: Booking = { code: 'DNT-NEW', status: 'confirmed', startsAt: '2026-11-03T02:00:00.000Z', endsAt: '2026-11-03T02:45:00.000Z', patient: { name: 'Patient', phone: '+6281234567890' }, doctor: 'Doctor', service: 'Scaling' };
const timeOff: TimeOff = { id: 'to-1', doctorId: 'doc-1', startsAt: '2026-11-03T00:00:00.000Z', endsAt: '2026-11-03T23:59:59.000Z', reason: 'Cuti tahunan', doctor: { name: 'drg. Budi' } };

describe('calendar appointments', () => {
  it('loads the displayed week with exact inclusive start and exclusive end instants and includes doctor time offs', async () => {
    vi.mocked(listBookings).mockResolvedValue({ items: [booking], total: 1, page: 1, pageSize: 500 });
    vi.mocked(listTimeOffs).mockResolvedValue({ items: [timeOff], total: 1, page: 1, pageSize: 500 });
    const events = await loadCalendarEvents('token', new Date('2026-11-02T00:00:00+07:00'), new Date('2026-11-09T00:00:00+07:00'));
    expect(listBookings).toHaveBeenCalledWith('token', { from: '2026-11-01T17:00:00.000Z', to: '2026-11-08T17:00:00.000Z', pageSize: 500 });
    expect(listTimeOffs).toHaveBeenCalledWith('token', { pageSize: 500 });
    expect(events).toHaveLength(2);
    expect(events[0].id).toBe('DNT-NEW');
    expect(events[1].id).toBe('timeoff-to-1');
  });
  it('preserves the actual appointment duration and UTC instant', () => {
    expect(bookingEvent(booking)).toMatchObject({ start: booking.startsAt, end: booking.endsAt, allDay: false, classNames: ['calendar-event--confirmed'], extendedProps: { type: 'booking', booking } });
  });
  it('formats doctor time off event correctly with reason and doctor name', () => {
    expect(timeOffEvent(timeOff)).toMatchObject({
      id: 'timeoff-to-1',
      title: '🏖️ [Libur] drg. Budi: Cuti tahunan',
      start: timeOff.startsAt,
      end: timeOff.endsAt,
      allDay: false,
      classNames: ['calendar-event--time-off'],
      extendedProps: { type: 'time_off', timeOff },
    });
  });
  it('shows newly submitted pending appointments as well as confirmed appointments', () => {
    expect(bookingEvent({ ...booking, status: 'pending' }).classNames).toEqual(['calendar-event--pending']);
  });
  it('propagates loading failures rather than returning an empty calendar', async () => {
    vi.mocked(listBookings).mockRejectedValueOnce(new Error('Offline'));
    await expect(loadCalendarEvents('token', new Date(), new Date())).rejects.toThrow('Offline');
  });
});
