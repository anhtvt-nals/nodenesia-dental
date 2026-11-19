import type { AvailableSlot, AvailabilityInput } from './slot.types.js';

const minutes = (time: string) => {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
};

const clock = (value: number) =>
  `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;

export function getAvailableSlots(input: AvailabilityInput): AvailableSlot[] {
  const turnover = input.turnoverMinutes ?? 0;
  const chairsCount = input.chairsCount ?? Infinity;
  const chairOccupancy = (input.chairOccupancy ?? []).map((item) => ({
    start: minutes(item.start),
    end: minutes(item.end),
  }));

  return input.intervals.flatMap((interval) => {
    const start = minutes(interval.start);
    const end = minutes(interval.end);
    const slots: AvailableSlot[] = [];

    for (let cursor = start; cursor + input.durationMinutes <= end; cursor += input.stepMinutes) {
      const slotEnd = cursor + input.durationMinutes;
      const slotBlockEnd = slotEnd + turnover;

      const overlapsBlocked = (input.blocked ?? []).some(
        (block) => cursor < minutes(block.end) && minutes(block.start) < slotEnd,
      );
      if (overlapsBlocked) continue;

      // Doctor availability: doctor cannot overlap existing busy bookings or timeoffs
      const overlapsBusyTime = input.busy.some(
        (busy) => cursor < minutes(busy.end) && minutes(busy.start) < slotBlockEnd,
      );
      if (overlapsBusyTime) continue;

      // Chair capacity: at no time during [cursor, slotBlockEnd) can active chairs reach capacity
      if (chairsCount < Infinity && chairOccupancy.length > 0) {
        let chairFull = false;
        const checkStep = Math.max(1, Math.min(input.stepMinutes, 15));
        for (let t = cursor; t < slotBlockEnd; t += checkStep) {
          const activeChairs = chairOccupancy.filter((c) => c.start <= t && t < c.end).length;
          if (activeChairs >= chairsCount) {
            chairFull = true;
            break;
          }
        }
        if (chairFull) continue;
      }

      slots.push({ start: clock(cursor), end: clock(slotEnd) });
    }

    return slots;
  });
}
