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
});
