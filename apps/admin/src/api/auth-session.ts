import { tr } from '../i18n';

export type Session = { accessToken: string; user: { name: string; role: string } };
type SessionChange = 'updated' | 'expired' | 'logout';
type Listener = (session: Session | undefined, reason: SessionChange) => void;
let currentSession: Session | undefined;
let generation = 0;
let invalidated = false;
let refreshInFlight: Promise<Session> | undefined;
const listeners = new Set<Listener>();

export function subscribeSession(listener: Listener) {
  listeners.add(listener);
  return () => { listeners.delete(listener); };
}

function publish(session: Session | undefined, reason: SessionChange) {
  currentSession = session;
  invalidated = reason !== 'updated';
  for (const listener of listeners) listener(session, reason);
}

function expireSession() {
  generation++;
  publish(undefined, 'expired');
}

export function tokenExpiresAt(token: string): number | undefined {
  try {
    const segment = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(segment.padEnd(Math.ceil(segment.length / 4) * 4, '='))) as { exp?: unknown };
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : undefined;
  } catch { return undefined; }
}

export function tokenNeedsRefresh(token: string, now = Date.now()) {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt !== undefined && expiresAt - now <= 60_000;
}

const expiredError = () => new Error(tr('Sesi Anda telah berakhir. Silakan masuk kembali.', 'Your session has expired. Please sign in again.'));

export async function loginSession(email: string, password: string): Promise<Session> {
  // Finish any cookie rotation before a new login replaces that cookie.
  if (refreshInFlight) await refreshInFlight.catch(() => undefined);
  const started = ++generation;
  const response = await fetch('/api/v1/auth/login', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error(tr('Nama pengguna atau kata sandi salah', 'Incorrect username or password'));
  const session = await response.json() as Session;
  if (started !== generation) throw expiredError();
  publish(session, 'updated');
  return session;
}

export function refreshSession(): Promise<Session> {
  if (refreshInFlight) return refreshInFlight;
  const started = generation;
  const pending = (async () => {
    const response = await fetch('/api/v1/auth/refresh', { method: 'POST', credentials: 'same-origin' });
    if (started !== generation) throw expiredError();
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        expireSession();
        throw expiredError();
      }
      throw new Error(tr('Tidak dapat memperbarui sesi. Silakan coba lagi.', 'Unable to refresh your session. Please try again.'));
    }
    const session = await response.json() as Session;
    if (started !== generation) throw expiredError();
    publish(session, 'updated');
    return session;
  })();
  refreshInFlight = pending;
  // Both handlers resolve so cleanup never creates an unhandled rejection.
  void pending.then(() => { if (refreshInFlight === pending) refreshInFlight = undefined; }, () => { if (refreshInFlight === pending) refreshInFlight = undefined; });
  return pending;
}

export async function logoutSession() {
  const pending = refreshInFlight;
  generation++;
  publish(undefined, 'logout');
  // Revoke the latest rotated cookie; an in-flight refresh cannot restore the UI.
  if (pending) await pending.catch(() => undefined);
  await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'same-origin' });
}

/** JSON and FormData bodies used by the admin are replayable after guard-level 401s. */
export async function authenticatedFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (!headers.has('authorization')) return fetch(url, init);
  if (invalidated) throw expiredError();
  const started = generation;
  let token = currentSession?.accessToken || headers.get('authorization')!.replace(/^Bearer\s+/i, '');
  if (tokenNeedsRefresh(token)) token = (await refreshSession()).accessToken;
  if (started !== generation) throw expiredError();
  const send = (accessToken: string) => {
    const nextHeaders = new Headers(headers);
    nextHeaders.set('authorization', `Bearer ${accessToken}`);
    return fetch(url, { ...init, headers: nextHeaders });
  };
  const response = await send(token);
  if (response.status !== 401) return response;
  if (started !== generation) throw expiredError();
  // A late 401 may arrive after another request already refreshed the token.
  token = currentSession?.accessToken && currentSession.accessToken !== token
    ? currentSession.accessToken : (await refreshSession()).accessToken;
  if (started !== generation) throw expiredError();
  const retry = await send(token);
  if (retry.status === 401) {
    if (currentSession?.accessToken === token) expireSession();
    throw expiredError();
  }
  return retry;
}
