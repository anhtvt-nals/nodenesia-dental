import { describe, expect, it, vi } from 'vitest';
import { bookingEvent, loadCalendarEvents } from './calendar-events';
import { listBookings, type Booking } from '../../api/admin-api';
vi.mock('../../api/admin-api', () => ({ listBookings: vi.fn() }));
const booking: Booking = { code: 'DNT-NEW', status: 'confirmed', startsAt: '2026-11-03T02:00:00.000Z', endsAt: '2026-11-03T02:45:00.000Z', patient: { name: 'Patient', phone: '+6281234567890' }, doctor: 'Doctor', service: 'Scaling' };
describe('calendar appointments', () => {
  it('loads the displayed week with exact inclusive start and exclusive end instants', async () => {
    vi.mocked(listBookings).mockResolvedValue([booking]);
    const events = await loadCalendarEvents('token', new Date('2026-11-02T00:00:00+07:00'), new Date('2026-11-09T00:00:00+07:00'));
    expect(listBookings).toHaveBeenCalledWith('token', { from: '2026-11-01T17:00:00.000Z', to: '2026-11-08T17:00:00.000Z' });
    expect(events).toHaveLength(1);
    expect(events[0].id).toBe('DNT-NEW');
  });
  it('preserves the actual appointment duration and UTC instant', () => {
    expect(bookingEvent(booking)).toMatchObject({ start: booking.startsAt, end: booking.endsAt, allDay: false, classNames: ['calendar-event--confirmed'], extendedProps: { booking } });
  });
  it('shows newly submitted pending appointments as well as confirmed appointments', () => {
    expect(bookingEvent({ ...booking, status: 'pending' }).classNames).toEqual(['calendar-event--pending']);
  });
  it('propagates loading failures rather than returning an empty calendar', async () => {
    vi.mocked(listBookings).mockRejectedValueOnce(new Error('Offline'));
    await expect(loadCalendarEvents('token', new Date(), new Date())).rejects.toThrow('Offline');
  });
});
