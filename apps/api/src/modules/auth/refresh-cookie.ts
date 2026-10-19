const name = 'clinic_refresh';

export function readRefreshCookie(header?: string) {
  const value = header?.split(';').map((item) => item.trim()).find((item) => item.startsWith(`${name}=`))?.slice(name.length + 1);
  return value ? decodeURIComponent(value) : undefined;
}

export function refreshCookie(value: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=${encodeURIComponent(value)}; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=2592000${secure}`;
}

export function clearRefreshCookie() {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `${name}=; HttpOnly; SameSite=Lax; Path=/api/v1/auth; Max-Age=0${secure}`;
}
