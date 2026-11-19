import * as argon2 from 'argon2';
import { ForbiddenException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { ManageBookingsService } from './manage-bookings.service.js';

describe('ManageBookingsService.get', () => {
  it('does not return a booking when its management token is invalid', async () => {
    const prisma = { booking: { findUnique: async () => ({ code: 'DNT-1', manageTokenHash: await argon2.hash('correct-management-token'), startsAt: new Date(), endsAt: new Date(), status: 'confirmed', doctor: { name: 'drg. Ayu' }, service: { name: 'Scaling' }, patient: { name: 'Budi', phoneE164: '+6281234567890' } }) } };
    const service = new ManageBookingsService(prisma as never, {} as never);
    await expect(service.get('DNT-1', 'wrong-management-token')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('returns a public booking summary with masked phone when no token is provided', async () => {
    const prisma = { booking: { findUnique: async () => ({ code: 'DNT-1', manageTokenHash: await argon2.hash('correct-management-token'), startsAt: new Date(), endsAt: new Date(), status: 'confirmed', doctor: { name: 'drg. Ayu' }, service: { name: 'Scaling' }, patient: { name: 'Budi', phoneE164: '+6281234567890' } }) } };
    const service = new ManageBookingsService(prisma as never, {} as never);
    const result = await service.get('DNT-1');
    expect(result.code).toBe('DNT-1');
    expect(result.canManage).toBe(false);
    expect(result.patient.phone).toContain('****');
  });
});
