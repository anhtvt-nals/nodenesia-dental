import { FormEvent, useEffect, useState } from 'react';
import { login, logout, refresh, type Session } from './api/admin-api';
import { AdminDashboard } from './features/dashboard/AdminDashboard';

const sessionKey = 'clinic-session';

export function App() {
  const [session, setSession] = useState<Session>();
  const [message, setMessage] = useState('');

  function saveSession(next: Session) { setSession(next); sessionStorage.setItem(sessionKey, JSON.stringify(next)); }

  useEffect(() => {
    refresh().then(saveSession).catch(() => sessionStorage.removeItem(sessionKey));
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    try { saveSession(await login(String(form.get('email')), String(form.get('password')))); } catch (error) { setMessage((error as Error).message); }
  }

  async function signOut() {
    try { if (session) await logout(); } finally { sessionStorage.removeItem(sessionKey); setSession(undefined); }
  }

  return <main><h1>Clinic Admin</h1>{session ? <><button type="button" onClick={() => void signOut()}>Đăng xuất</button><AdminDashboard accessToken={session.accessToken} role={session.user.role} /></> : <form onSubmit={submit}><label>Email<input name="email" type="email" required /></label><label>Mật khẩu<input name="password" type="password" minLength={8} required /></label><button>Đăng nhập</button></form>}<p aria-live="polite">{message}</p></main>;
}
