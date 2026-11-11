import { startSessionRefresh } from './api/session-refresh';
import { subscribeSession } from './api/auth-session';
import { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Spin } from 'antd';
import { login, logout, refresh, type Session } from './api/admin-api';
import { AdminDashboard } from './features/dashboard/AdminDashboard';
import { tr, useAdminTranslation } from './i18n';

const sessionKey = 'clinic-session';

export function App() {
  const { t } = useAdminTranslation();
  const [session, setSession] = useState<Session>();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = subscribeSession((next, reason) => {
      setSession(next);
      if (next) { sessionStorage.setItem(sessionKey, JSON.stringify(next)); setMessage(''); }
      else {
        const hadSession = Boolean(sessionStorage.getItem(sessionKey));
        sessionStorage.removeItem(sessionKey);
        setMessage(reason === 'expired' && hadSession ? tr('Sesi Anda telah berakhir. Silakan masuk kembali.', 'Your session has expired. Please sign in again.') : '');
      }
    });
    void refresh().catch(() => { if (active) sessionStorage.removeItem(sessionKey); }).finally(() => { if (active) setIsSessionReady(true); });
    return () => { active = false; unsubscribe(); };
  }, []);

  useEffect(() => {
    if (session) return startSessionRefresh(session.accessToken);
  }, [session?.accessToken]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const username = String(form.get('username')).trim();
    const password = String(form.get('password'));
    if (!username) { setMessage(t('requiredUsername')); return; }
    if (!password) { setMessage(t('requiredPassword')); return; }
    setMessage('');
    setIsSubmitting(true);
    try { await login(username, password); } catch { setMessage(t('invalidCredentials')); } finally { setIsSubmitting(false); }
  }

  async function signOut() {
    try { if (session) await logout(); } finally { sessionStorage.removeItem(sessionKey); setSession(undefined); }
  }

  if (!isSessionReady) return <main className="session-loading" aria-busy="true"><Spin size="large" /><span>{t('loading')}</span></main>;
  if (session) return <AdminDashboard accessToken={session.accessToken} role={session.user.role} userName={session.user.name} onSignOut={() => void signOut()} />;

  return <main className="login-page">
    <aside className="login-intro" aria-label={t('appTitle')}><h1>{t('appTitle')}</h1><p>{t('loginIntro')}</p></aside>
    <div className="login-content">
      <Form className="login-form" noValidate onSubmitCapture={submit} aria-describedby={message ? 'login-error' : undefined} layout="vertical" requiredMark={false}>
        <div><h2>{t('login')}</h2><p>{t('loginHelp')}</p></div>
        <Form.Item label={t('username')}><Input id="username" name="username" size="large" autoComplete="username" aria-invalid={Boolean(message)} aria-describedby={message ? 'login-error' : undefined} /></Form.Item>
        <Form.Item label={t('password')}><Input.Password id="password" name="password" size="large" visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }} autoComplete="current-password" aria-invalid={Boolean(message)} aria-describedby={message ? 'login-error' : undefined} /></Form.Item>
        {message && <Alert id="login-error" className="form-error" type="error" showIcon role="alert" message={message} />}
        <Button className="primary-button" type="primary" size="large" loading={isSubmitting} htmlType="submit">{t('login')}</Button>
      </Form>
    </div>
  </main>;
}
