import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
vi.mock('../i18n', () => ({ tr: (_id: string, en: string) => en }));
const jwt = (expires: number) => `header.${btoa(JSON.stringify({ exp: expires }))}.signature`;
const session = (accessToken: string) => ({ accessToken, user: { name: 'Owner', role: 'owner' } });
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
const auth = (token: string): RequestInit => ({ headers: { authorization: `Bearer ${token}` } });
let api: typeof import('./auth-session.js');
let request: ReturnType<typeof vi.fn<typeof fetch>>;
beforeEach(async () => {
  vi.resetModules();
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-11-01T00:00:00Z'));
  request = vi.fn<typeof fetch>();
  vi.stubGlobal('fetch', request);
  api = await import('./auth-session.js');
});
afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('admin session renewal', () => {
  it('refreshes once before concurrent requests with an expired token', async () => {
    const old = jwt(Date.now() / 1000 - 1);
    const fresh = jwt(Date.now() / 1000 + 900);
    request.mockImplementation(async (url) => url === '/api/v1/auth/refresh' ? json(session(fresh)) : json({ ok: true }));
    const listener = vi.fn(); api.subscribeSession(listener);
    const responses = await Promise.all([api.authenticatedFetch('/a', auth(old)), api.authenticatedFetch('/b', auth(old))]);
    expect(responses.every((response) => response.ok)).toBe(true);
    expect(request.mock.calls.filter(([url]) => url === '/api/v1/auth/refresh')).toHaveLength(1);
    for (const [, init] of request.mock.calls.filter(([url]) => url !== '/api/v1/auth/refresh')) expect(new Headers(init?.headers).get('authorization')).toBe(`Bearer ${fresh}`);
    expect(listener).toHaveBeenCalledWith(session(fresh), 'updated');
  });

  it('refreshes after a 401 and retries with the same mutation body only once', async () => {
    const old = jwt(Date.now() / 1000 + 900), fresh = jwt(Date.now() / 1000 + 1800);
    request.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(session(fresh))).mockResolvedValueOnce(json({ saved: true }));
    const body = new FormData(); body.append('file', new Blob(['avatar']), 'avatar.png');
    const result = await api.authenticatedFetch('/api/v1/admin/doctors/avatar-upload', { ...auth(old), method: 'POST', body });
    expect(result.ok).toBe(true);
    expect(request).toHaveBeenCalledTimes(3);
    expect(request.mock.calls[2][1]?.body).toBe(body);
    expect(request.mock.calls[2][1]?.method).toBe('POST');
    expect(new Headers(request.mock.calls[2][1]?.headers).get('authorization')).toBe(`Bearer ${fresh}`);
  });

  it('uses the newest token for stale props and for late concurrent 401 responses', async () => {
    const old = jwt(Date.now() / 1000 + 900), fresh = jwt(Date.now() / 1000 + 1800);
    let resolveLate!: (response: Response) => void;
    request.mockImplementation(async (url) => {
      if (url === '/late') return new Promise<Response>((resolve) => { resolveLate = resolve; });
      if (url === '/api/v1/auth/refresh') return json(session(fresh));
      return json({});
    });
    const late = api.authenticatedFetch('/late', auth(old));
    await api.refreshSession();
    request.mockImplementation(async () => json({}));
    resolveLate(json({}, 401));
    expect((await late).ok).toBe(true);
    await api.authenticatedFetch('/next', auth(old));
    expect(request.mock.calls.filter(([url]) => url === '/api/v1/auth/refresh')).toHaveLength(1);
    expect(new Headers(request.mock.calls.at(-1)?.[1]?.headers).get('authorization')).toBe(`Bearer ${fresh}`);
  });

  it('shares a refresh when several valid-looking tokens receive 401 together', async () => {
    const old = jwt(Date.now() / 1000 + 900), fresh = jwt(Date.now() / 1000 + 1800);
    request.mockImplementation(async (url, init) => {
      if (url === '/api/v1/auth/refresh') return json(session(fresh));
      return new Headers(init?.headers).get('authorization') === `Bearer ${old}` ? json({}, 401) : json({});
    });
    const results = await Promise.all([api.authenticatedFetch('/a', auth(old)), api.authenticatedFetch('/b', auth(old)), api.authenticatedFetch('/c', auth(old))]);
    expect(results.every((result) => result.ok)).toBe(true);
    expect(request.mock.calls.filter(([url]) => url === '/api/v1/auth/refresh')).toHaveLength(1);
  });

  it('preserves a live session if refresh returns a server error', async () => {
    const token = jwt(Date.now() / 1000 + 900);
    request.mockResolvedValueOnce(json(session(token)));
    await api.refreshSession();
    const listener = vi.fn(); api.subscribeSession(listener);
    request.mockResolvedValueOnce(json({}, 503));
    await expect(api.refreshSession()).rejects.toThrow('Unable to refresh');
    expect(listener).not.toHaveBeenCalled();
    request.mockResolvedValueOnce(json({}));
    expect((await api.authenticatedFetch('/a', auth(token))).ok).toBe(true);
  });

  it('does not refresh on forbidden or server errors', async () => {
    const token = jwt(Date.now() / 1000 + 900);
    request.mockResolvedValueOnce(json({}, 403)).mockResolvedValueOnce(json({}, 500));
    expect((await api.authenticatedFetch('/a', auth(token))).status).toBe(403);
    expect((await api.authenticatedFetch('/b', auth(token))).status).toBe(500);
    expect(request).toHaveBeenCalledTimes(2);
  });

  it('clears the session once if the refresh cookie is invalid and blocks stale requests', async () => {
    const listener = vi.fn(); api.subscribeSession(listener);
    request.mockResolvedValue(json({}, 401));
    const token = jwt(Date.now() / 1000 - 1);
    const results = await Promise.allSettled([api.authenticatedFetch('/a', auth(token)), api.authenticatedFetch('/b', auth(token))]);
    expect(results.every((result) => result.status === 'rejected')).toBe(true);
    expect(request).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(undefined, 'expired');
    await expect(api.authenticatedFetch('/c', auth(token))).rejects.toThrow('session has expired');
    expect(request).toHaveBeenCalledTimes(1);
  });

  it('keeps the session on network errors and permits a later refresh', async () => {
    const fresh = jwt(Date.now() / 1000 + 900);
    const listener = vi.fn(); api.subscribeSession(listener);
    request.mockRejectedValueOnce(new TypeError('Network offline')).mockResolvedValueOnce(json(session(fresh)));
    await expect(api.refreshSession()).rejects.toThrow('Network offline');
    expect(listener).not.toHaveBeenCalled();
    await expect(api.refreshSession()).resolves.toEqual(session(fresh));
  });

  it('stops after one retry when the refreshed token also receives a 401', async () => {
    const old = jwt(Date.now() / 1000 + 900), fresh = jwt(Date.now() / 1000 + 1800);
    request.mockResolvedValueOnce(json({}, 401)).mockResolvedValueOnce(json(session(fresh))).mockResolvedValueOnce(json({}, 401));
    await expect(api.authenticatedFetch('/a', auth(old))).rejects.toThrow('session has expired');
    expect(request).toHaveBeenCalledTimes(3);
  });

  it('does not restore a session if logout occurs during refresh', async () => {
    let finish!: (response: Response) => void;
    request.mockImplementation(async (url) => url === '/api/v1/auth/refresh' ? new Promise<Response>((resolve) => { finish = resolve; }) : json({ ok: true }));
    const listener = vi.fn(); api.subscribeSession(listener);
    const refreshing = api.refreshSession();
    const outcome = refreshing.catch((error) => error);
    const loggingOut = api.logoutSession();
    finish(json(session(jwt(Date.now() / 1000 + 900))));
    await loggingOut;
    expect(await outcome).toBeInstanceOf(Error);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(undefined, 'logout');
    expect(request.mock.calls.at(-1)?.[0]).toBe('/api/v1/auth/logout');
  });

  it('handles JWT expiration without trusting malformed payloads', () => {
    expect(api.tokenNeedsRefresh(jwt(Date.now() / 1000 + 59))).toBe(true);
    expect(api.tokenNeedsRefresh(jwt(Date.now() / 1000 + 61))).toBe(false);
    expect(api.tokenExpiresAt('malformed')).toBeUndefined();
    expect(api.tokenExpiresAt(`x.${btoa('{"exp":"123"}')}.x`)).toBeUndefined();
  });
});
