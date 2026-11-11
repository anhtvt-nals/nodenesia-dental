import { refreshSession, tokenExpiresAt, tokenNeedsRefresh } from './auth-session';

/** Browser timers can pause in sleeping tabs, so focus/visibility also check expiry. */
export function startSessionRefresh(token: string, refresh: () => Promise<unknown> = refreshSession) {
  let active = true;
  let renewing = false;
  let timer: ReturnType<typeof setTimeout>;
  const expiresAt = tokenExpiresAt(token);
  const renew = async () => {
    if (!active || renewing || !tokenNeedsRefresh(token)) return;
    renewing = true;
    clearTimeout(timer);
    try { await refresh(); }
    catch { if (active) timer = setTimeout(() => void renew(), 30_000); }
    finally { renewing = false; }
  };
  if (expiresAt !== undefined) timer = setTimeout(() => void renew(), Math.max(0, expiresAt - Date.now() - 60_000));
  const onFocus = () => { void renew(); };
  const onVisibility = () => { if (document.visibilityState === 'visible') void renew(); };
  window.addEventListener('focus', onFocus);
  document.addEventListener('visibilitychange', onVisibility);
  return () => {
    active = false;
    clearTimeout(timer);
    window.removeEventListener('focus', onFocus);
    document.removeEventListener('visibilitychange', onVisibility);
  };
}
