import { ServiceUnavailableException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';
import { AvailabilityService } from './availability.service.js';

describe('AvailabilityService', () => {
  it('does not expose slots while maintenance mode is enabled', async () => {
    const prisma = {
      clinicSettings: { findUniqueOrThrow: vi.fn().mockResolvedValue({ maintenanceMode: true }) },
      service: { findFirst: vi.fn() },
    };
    const service = new AvailabilityService(prisma as never);

    await expect(service.find('scaling', '2026-11-20')).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(prisma.service.findFirst).not.toHaveBeenCalled();
  });
});
