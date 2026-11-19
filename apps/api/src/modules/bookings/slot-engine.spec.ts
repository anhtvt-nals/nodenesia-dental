import { describe, expect, it } from 'vitest';
import { getAvailableSlots } from './slot-engine.js';

describe('getAvailableSlots', () => {
  it('does not offer a service that crosses a lunch gap', () => {
    const slots = getAvailableSlots({ date: '2026-11-02', stepMinutes: 15, durationMinutes: 90, intervals: [{ start: '09:00', end: '12:00' }, { start: '13:00', end: '20:00' }], busy: [] });
    expect(slots.map((slot) => slot.start)).not.toContain('11:00');
    expect(slots.map((slot) => slot.start)).toContain('09:00');
  });

  it('removes every slot that overlaps an existing booking', () => {
    const slots = getAvailableSlots({ date: '2026-11-02', stepMinutes: 15, durationMinutes: 45, intervals: [{ start: '09:00', end: '12:00' }], busy: [{ start: '10:00', end: '10:45' }] });
    expect(slots.map((slot) => slot.start)).not.toContain('09:30');
    expect(slots.map((slot) => slot.start)).not.toContain('10:00');
    expect(slots.map((slot) => slot.start)).toContain('10:45');
  });

  it('respects turnover buffer time for sterilization between patients', () => {
    // 30 min procedure + 15 min turnover buffer. If busy from 10:00 to 10:30,
    // a slot starting at 10:30 needs buffer and cannot overlap, or 10:00-10:45 is blocked
    const slots = getAvailableSlots({
      date: '2026-11-02',
      stepMinutes: 15,
      durationMinutes: 30,
      turnoverMinutes: 15,
      intervals: [{ start: '09:00', end: '12:00' }],
      busy: [{ start: '10:00', end: '10:30' }],
    });
    // Slot starting at 09:30 has duration 30 + 15 buffer = busy until 10:15, overlapping 10:00 busy start
    expect(slots.map((slot) => slot.start)).not.toContain('09:30');
    // Slot starting at 09:15 ends at 09:45 + 15 buffer = 10:00, does not overlap 10:00
    expect(slots.map((slot) => slot.start)).toContain('09:15');
    // Slot at 10:30 can start once previous booking at 10:30 ends
    expect(slots.map((slot) => slot.start)).toContain('10:30');
  });

  it('rejects slots when all dental chairs are occupied even if doctor is free', () => {
    // Clinic has 2 chairs. 2 existing bookings occupy both chairs from 10:00 to 11:00
    const slots = getAvailableSlots({
      date: '2026-11-02',
      stepMinutes: 15,
      durationMinutes: 30,
      turnoverMinutes: 0,
      chairsCount: 2,
      chairOccupancy: [
        { start: '10:00', end: '11:00' }, // Chair 1 occupied
        { start: '10:00', end: '11:00' }, // Chair 2 occupied
      ],
      intervals: [{ start: '09:00', end: '12:00' }],
      busy: [], // Doctor is completely free
    });

    // 09:00 - 09:30 is free (0 chairs occupied)
    expect(slots.map((slot) => slot.start)).toContain('09:00');
    // 09:30 - 10:00 is free (0 chairs occupied)
    expect(slots.map((slot) => slot.start)).toContain('09:30');
    // 10:00 - 10:30 is blocked because chairs = 2/2 full
    expect(slots.map((slot) => slot.start)).not.toContain('10:00');
    expect(slots.map((slot) => slot.start)).not.toContain('10:15');
    expect(slots.map((slot) => slot.start)).not.toContain('10:30');
    // 11:00 onwards is free
    expect(slots.map((slot) => slot.start)).toContain('11:00');
  });

  it('never offers a slot that overlaps a blocked window', () => {
    const slots = getAvailableSlots({
      date: '2026-11-06',
      stepMinutes: 60,
      durationMinutes: 45,
      intervals: [{ start: '09:00', end: '15:00' }],
      busy: [],
      blocked: [{ start: '11:30', end: '13:00' }],
    }).map((slot) => slot.start);
    expect(slots).toContain('09:00');
    expect(slots).toContain('10:00');
    expect(slots).not.toContain('11:00');
    expect(slots).not.toContain('12:00');
    expect(slots).toContain('13:00');
  });

  it('allows a slot that ends exactly when a blocked window starts', () => {
    const slots = getAvailableSlots({
      date: '2026-11-02',
      stepMinutes: 30,
      durationMinutes: 30,
      intervals: [{ start: '11:00', end: '14:00' }],
      busy: [],
      blocked: [{ start: '12:00', end: '12:30' }],
    }).map((slot) => slot.start);
    expect(slots).toContain('11:30');
    expect(slots).not.toContain('12:00');
    expect(slots).toContain('12:30');
  });
});
