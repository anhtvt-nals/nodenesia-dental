import { describe, expect, it, vi } from 'vitest';
import { AdminBookingsRepository } from './admin-bookings.repository.js';

describe('admin calendar booking queries', () => {
  it('loads all bookings overlapping the requested period without the global 100-row cap', async () => {
    const bookings = Array.from({ length: 101 }, (_, id) => ({ id }));
    const findMany = vi.fn().mockResolvedValue(bookings);
    const repository = new AdminBookingsRepository({ booking: { findMany } } as never);
    const from = new Date('2026-11-01T17:00:00Z'), to = new Date('2026-11-08T17:00:00Z');
    const result = await repository.list({ from, to });
    const query = findMany.mock.calls[0][0];
    expect(query.where).toEqual({ startsAt: { lt: to }, endsAt: { gt: from } });
    expect(query).not.toHaveProperty('take');
    expect(result).toHaveLength(101);
  });
  it('keeps the default cap for the unbounded booking list', async () => {
    const findMany = vi.fn().mockResolvedValue([]);
    await new AdminBookingsRepository({ booking: { findMany } } as never).list();
    expect(findMany.mock.calls[0][0].take).toBe(100);
  });
});
