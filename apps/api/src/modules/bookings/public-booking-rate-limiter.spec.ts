import { HttpException, HttpStatus } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { PublicBookingRateLimiter } from './public-booking-rate-limiter.js';

describe('PublicBookingRateLimiter', () => {
  it('blocks the sixth booking attempt in ten minutes', () => {
    expect.assertions(2);
    const limiter = new PublicBookingRateLimiter();
    for (let index = 0; index < 5; index += 1) limiter.check(['ip:127.0.0.1', 'phone:+628123'], index);
    try { limiter.check(['ip:127.0.0.2', 'phone:+628123'], 1_000); } catch (error) { expect(error).toBeInstanceOf(HttpException); expect((error as HttpException).getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS); }
  });
});
