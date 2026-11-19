import type { EventInput } from '@fullcalendar/core';
import { listBookings, listTimeOffs, type Booking, type TimeOff } from '../../api/admin-api';

export const eventClass: Record<string, string> = {
  pending: 'pending',
  confirmed: 'confirmed',
  arrived: 'arrived',
  in_chair: 'in-chair',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no-show',
};

export async function loadCalendarEvents(accessToken: string, start: Date, end: Date): Promise<EventInput[]> {
  const [bookingsRes, timeOffsRes] = await Promise.all([
    listBookings(accessToken, { from: start.toISOString(), to: end.toISOString(), pageSize: 500 }),
    listTimeOffs(accessToken, { pageSize: 500 }),
  ]);

  const relevantTimeOffs = timeOffsRes.items.filter((to) => {
    const toStart = new Date(to.startsAt);
    const toEnd = new Date(to.endsAt);
    return toStart < end && toEnd > start;
  });

  return [
    ...bookingsRes.items.map(bookingEvent),
    ...relevantTimeOffs.map(timeOffEvent),
  ];
}

export function bookingEvent(booking: Booking): EventInput {
  const chairPrefix = booking.chairIndex ? `[K${booking.chairIndex}] ` : '';
  return {
    id: booking.code,
    title: `${chairPrefix}${booking.patient.name} (${booking.service})`,
    start: booking.startsAt,
    end: booking.endsAt,
    allDay: false,
    classNames: [`calendar-event--${eventClass[booking.status] ?? 'pending'}`],
    extendedProps: { type: 'booking', booking },
  };
}

export function timeOffEvent(timeOff: TimeOff): EventInput {
  const doctorName = timeOff.doctor?.name ?? 'Seluruh klinik';
  const reasonText = timeOff.reason ? `: ${timeOff.reason}` : '';
  return {
    id: `timeoff-${timeOff.id}`,
    title: `🏖️ [Libur] ${doctorName}${reasonText}`,
    start: timeOff.startsAt,
    end: timeOff.endsAt,
    allDay: false,
    classNames: ['calendar-event--time-off'],
    extendedProps: { type: 'time_off', timeOff },
  };
}
