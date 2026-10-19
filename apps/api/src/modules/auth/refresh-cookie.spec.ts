import { describe, expect, it } from 'vitest';
import { readRefreshCookie, refreshCookie } from './refresh-cookie.js';

describe('refresh cookies', () => {
  it('keeps the refresh token HttpOnly and reads only its cookie', () => {
    expect(refreshCookie('id.secret')).toContain('HttpOnly');
    expect(readRefreshCookie('other=x; clinic_refresh=id.secret')).toBe('id.secret');
  });
});
