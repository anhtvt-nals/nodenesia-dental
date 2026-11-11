import type { EventInput } from '@fullcalendar/core';
import { listBookings, type Booking } from '../../api/admin-api';

export const eventClass: Record<string, string> = { pending: 'pending', confirmed: 'confirmed', completed: 'completed', cancelled: 'cancelled', no_show: 'no-show' };

export async function loadCalendarEvents(accessToken: string, start: Date, end: Date): Promise<EventInput[]> {
  const bookings = await listBookings(accessToken, { from: start.toISOString(), to: end.toISOString() });
  return bookings.map(bookingEvent);
}

export function bookingEvent(booking: Booking): EventInput {
  return {
    id: booking.code, title: booking.patient.name,
    start: booking.startsAt, end: booking.endsAt, allDay: false,
    classNames: [`calendar-event--${eventClass[booking.status] ?? 'pending'}`],
    extendedProps: { booking },
  };
}
