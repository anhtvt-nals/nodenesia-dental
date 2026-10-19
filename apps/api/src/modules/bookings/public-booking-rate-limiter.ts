import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class PublicBookingRateLimiter {
  private readonly attempts = new Map<string, number[]>();

  check(keys: string[], now = Date.now()) {
    const windowStart = now - 10 * 60_000;
    const recentByKey = keys.map((key) => [key, (this.attempts.get(key) ?? []).filter((attempt) => attempt >= windowStart)] as const);
    if (recentByKey.some(([, recent]) => recent.length >= 5)) throw new HttpException('Too many booking attempts', HttpStatus.TOO_MANY_REQUESTS);
    recentByKey.forEach(([key, recent]) => this.attempts.set(key, [...recent, now]));
  }
}
