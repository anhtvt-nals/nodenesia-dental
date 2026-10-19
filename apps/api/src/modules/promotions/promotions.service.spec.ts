import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PromotionsService } from './promotions.service.js';
describe('PromotionsService', () => {
  it('rejects a promotion whose publish window is inverted', async () => {
    const service = new PromotionsService({ create: async () => ({}) } as never, {} as never);
    await expect(service.create({ title: 'Sale', description: 'Test', startsAt: '2026-11-02T00:00:00.000Z', endsAt: '2026-11-01T00:00:00.000Z' }, { userId: 'owner-id' })).rejects.toBeInstanceOf(BadRequestException);
  });
});
