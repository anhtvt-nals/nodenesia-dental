import { describe, expect, it, vi } from 'vitest';
import { ReportsService } from './reports.service.js';

describe('ReportsService', () => {
  it('escapes patient fields in a date-filtered CSV export', async () => {
    const prisma = { booking: { findMany: vi.fn().mockResolvedValue([{ code: 'DNT-1', startsAt: new Date('2026-11-01T10:00:00.000Z'), status: 'confirmed', source: 'web', patient: { name: 'A, "Patient"', phoneE164: '+6281' }, doctor: { name: 'drg. Ayu' }, service: { name: 'Scaling' } }]) } };
    const service = new ReportsService(prisma as never);
    const csv = await service.bookingsCsv({ from: new Date('2026-11-01T00:00:00.000Z'), to: new Date('2026-11-02T00:00:00.000Z') });
    expect(csv).toContain('"A, ""Patient"""');
    expect(prisma.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { startsAt: { gte: expect.any(Date), lt: expect.any(Date) } } }));
  });
});
