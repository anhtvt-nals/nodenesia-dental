import type { AvailableSlot, AvailabilityInput } from './slot.types.js';

const minutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

export function getAvailableSlots(input: AvailabilityInput): AvailableSlot[] {
  return input.intervals.flatMap((interval) => {
    const start = minutes(interval.start);
    const end = minutes(interval.end);
    const slots: AvailableSlot[] = [];

    for (let cursor = start; cursor + input.durationMinutes <= end; cursor += input.stepMinutes) {
      const slotEnd = cursor + input.durationMinutes;
      const overlapsBusyTime = input.busy.some(
        (busy) => cursor < minutes(busy.end) && minutes(busy.start) < slotEnd,
      );
      if (!overlapsBusyTime) slots.push({ start: clock(cursor), end: clock(slotEnd) });
    }

    return slots;
  });
}
