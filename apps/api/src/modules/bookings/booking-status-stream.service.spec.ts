import { firstValueFrom } from 'rxjs';
import { describe, expect, it } from 'vitest';
import { BookingStatusStreamService } from './booking-status-stream.service.js';

describe('BookingStatusStreamService', () => {
  it('emits a status event only to the matching booking stream', async () => {
    const service = new BookingStatusStreamService();
    const event = firstValueFrom(service.stream('DNT-001'));

    service.publish('DNT-002', 'confirmed');
    service.publish('DNT-001', 'confirmed');

    await expect(event).resolves.toEqual({
      type: 'status',
      data: { code: 'DNT-001', status: 'confirmed' },
    });
  });
});
