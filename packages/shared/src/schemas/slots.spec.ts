import { describe, expect, it } from 'vitest';
import { slotQuerySchema } from './slots.js';

describe('slotQuerySchema', () => {
  it('accepts a service and ISO calendar date without a doctor', () => {
    expect(slotQuerySchema.parse({ serviceId: 'scaling', date: '2026-11-01' }))
      .toEqual({ serviceId: 'scaling', date: '2026-11-01' });
  });
});
