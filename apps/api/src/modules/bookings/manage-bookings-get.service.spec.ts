import * as argon2 from 'argon2';
import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ManageBookingsService } from './manage-bookings.service.js';

describe('ManageBookingsService.get', () => {
  it('does not return a booking when its management token is invalid', async () => {
    const prisma = { booking: { findUnique: async () => ({ code: 'DNT-1', manageTokenHash: await argon2.hash('correct-management-token'), startsAt: new Date(), endsAt: new Date(), status: 'confirmed', doctor: { name: 'drg. Ayu' }, service: { name: 'Scaling' } }) } };
    const service = new ManageBookingsService(prisma as never, {} as never);
    await expect(service.get('DNT-1', 'wrong-management-token')).rejects.toBeInstanceOf(ForbiddenException);
  });
});
