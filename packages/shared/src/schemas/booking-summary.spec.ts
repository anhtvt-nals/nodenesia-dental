import { describe, expect, it } from 'vitest';
import { bookingSummarySchema } from './booking-summary.js';

describe('bookingSummarySchema', () => {
  it('requires the values needed by a confirmation screen', () => {
    expect(bookingSummarySchema.parse({
      code: 'DNT-2026A', status: 'confirmed', startsAt: '2026-11-01T02:00:00.000Z',
      endsAt: '2026-11-01T02:45:00.000Z', doctorName: 'drg. Ayu', serviceName: 'Scaling',
    }).code).toBe('DNT-2026A');
  });
});
