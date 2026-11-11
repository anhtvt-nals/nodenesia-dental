import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startSessionRefresh } from './session-refresh';
vi.mock('../i18n', () => ({ tr: (_id: string, en: string) => en }));
let clean: (() => void) | undefined;
const jwt = (expires: number) => `x.${btoa(JSON.stringify({ exp: expires }))}.x`;
beforeEach(() => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-11-01T00:00:00Z'));
  vi.stubGlobal('window', new EventTarget());
  vi.stubGlobal('document', Object.assign(new EventTarget(), { visibilityState: 'visible' }));
});
afterEach(() => { clean?.(); clean = undefined; vi.useRealTimers(); vi.unstubAllGlobals(); });
describe('proactive session renewal', () => {
  it('refreshes sixty seconds before expiration', async () => {
    const renew = vi.fn().mockResolvedValue(undefined);
    clean = startSessionRefresh(jwt(Date.now() / 1000 + 900), renew);
    await vi.advanceTimersByTimeAsync(839_000); expect(renew).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1000); expect(renew).toHaveBeenCalledTimes(1);
  });
  it.each(['focus', 'visibilitychange'])('checks expiry after a sleeping tab wakes via %s', async (event) => {
    const renew = vi.fn().mockResolvedValue(undefined);
    clean = startSessionRefresh(jwt(Date.now() / 1000 + 900), renew);
    vi.setSystemTime(Date.now() + 1_000_000);
    (event === 'focus' ? window : document).dispatchEvent(new Event(event));
    await Promise.resolve(); expect(renew).toHaveBeenCalledTimes(1);
  });
  it('retries transient refresh failures after thirty seconds', async () => {
    const renew = vi.fn().mockRejectedValueOnce(new TypeError('Offline')).mockResolvedValue(undefined);
    clean = startSessionRefresh(jwt(Date.now() / 1000 + 900), renew);
    await vi.advanceTimersByTimeAsync(840_000); expect(renew).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(30_000); expect(renew).toHaveBeenCalledTimes(2);
  });
  it('cancels timers and focus listeners on logout or token replacement', async () => {
    const renew = vi.fn().mockResolvedValue(undefined);
    clean = startSessionRefresh(jwt(Date.now() / 1000 + 900), renew);
    clean();
    await vi.advanceTimersByTimeAsync(1_000_000);
    window.dispatchEvent(new Event('focus'));
    expect(renew).not.toHaveBeenCalled();
  });
});
