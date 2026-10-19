import { describe, expect, it } from 'vitest';
import { bookingStatuses, serviceZones, userRoles } from './booking.js';

describe('shared booking enums', () => {
  it('exposes the persisted role, status, and tooth-zone values', () => {
    expect(userRoles).toEqual(['owner', 'staff']);
    expect(bookingStatuses).toContain('confirmed');
    expect(serviceZones).toEqual(['front', 'molar', 'gum', 'arch']);
  });
});
