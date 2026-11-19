import { startSessionRefresh } from './api/session-refresh';
import { subscribeSession } from './api/auth-session';
import { FormEvent, useEffect, useState } from 'react';
import { Alert, Button, Form, Input, Spin } from 'antd';
import { CalendarOutlined, LockOutlined, MailOutlined, SafetyCertificateOutlined, WhatsAppOutlined } from '@ant-design/icons';
import { login, logout, refresh, type Session } from './api/admin-api';
import { AdminDashboard } from './features/dashboard/AdminDashboard';
import { AdminBrandLogo } from './components/AdminBrandLogo';
import { tr, useAdminTranslation } from './i18n';

const sessionKey = 'clinic-session';
const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
const demoEmail = import.meta.env.VITE_DEMO_EMAIL || 'owner@clinic.local';
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || 'ClinicDemo2026!';

export function App() {
  const { t } = useAdminTranslation();
  const [session, setSession] = useState<Session>();
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSessionReady, setIsSessionReady] = useState(false);
  const [usernameValue, setUsernameValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');

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

  return (
    <main className="login-page">
      <aside className="login-intro" aria-label={t('appTitle')}>
        <img
          className="login-intro__bg"
          src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1400&q=85"
          alt=""
          aria-hidden="true"
        />
        <div className="login-intro__scrim" aria-hidden="true" />
        <div className="login-intro__inner">
          <div className="login-intro__brand">
            <AdminBrandLogo label="Senyum Sehat" />
            <span className="login-intro__badge">{tr('Portal Staf & Dokter', 'Staff & Doctor Portal')}</span>
          </div>

          <div className="login-intro__copy">
            <span className="login-intro__eyebrow">KLINIK GIGI SENYUM SEHAT</span>
            <h1>{t('appTitle')}</h1>
            <p>
              {tr(
                'Kelola jadwal praktik dokter, antrean kursi perawatan, dan konfirmasi WhatsApp pasien dalam satu ruang kerja terpadu.',
                'Manage doctor schedules, dental chair queues, and patient WhatsApp confirmations in one unified workspace.',
              )}
            </p>
          </div>

          <div className="login-intro__highlights">
            <div className="login-highlight">
              <CalendarOutlined />
              <span>{tr('Jadwal Real-time · WIB', 'Real-time Schedule · WIB')}</span>
            </div>
            <div className="login-highlight">
              <WhatsAppOutlined />
              <span>{tr('Konfirmasi WhatsApp', 'WhatsApp Confirmation')}</span>
            </div>
            <div className="login-highlight">
              <SafetyCertificateOutlined />
              <span>{tr('Akses Terenkripsi', 'Encrypted Access')}</span>
            </div>
          </div>
        </div>
      </aside>

      <div className="login-content">
        <Form
          className="login-form"
          noValidate
          onSubmitCapture={submit}
          aria-describedby={message ? 'login-error' : undefined}
          layout="vertical"
          requiredMark={false}
        >
          <div className="login-form__header">
            <span className="login-form__eyebrow">{tr('Masuk Admin', 'Admin Sign In')}</span>
            <h2>{t('login')}</h2>
            <p>{t('loginHelp')}</p>
          </div>

          {isDemoMode && (
            <Alert
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
              message={tr('Mode Demo (Reset setiap 30 menit)', 'Demo Mode (Resets every 30 min)')}
              description={
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  <span>
                    Email: <code>{demoEmail}</code> · {tr('Sandi', 'Password')}: <code>{demoPassword}</code>
                  </span>
                  <div>
                    <Button
                      size="small"
                      type="link"
                      style={{ paddingInline: 0 }}
                      onClick={() => {
                        setUsernameValue(demoEmail);
                        setPasswordValue(demoPassword);
                      }}
                    >
                      {tr('Isi akun demo otomatis', 'Fill demo credentials')}
                    </Button>
                  </div>
                </div>
              }
            />
          )}

          <Form.Item label={t('username')} htmlFor="username">
            <Input
              id="username"
              name="username"
              size="large"
              value={usernameValue}
              onChange={(e) => setUsernameValue(e.target.value)}
              prefix={<MailOutlined className="login-input-icon" />}
              placeholder="owner@clinic.local"
              autoComplete="username"
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'login-error' : undefined}
            />
          </Form.Item>

          <Form.Item label={t('password')} htmlFor="password">
            <Input.Password
              id="password"
              name="password"
              size="large"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
              prefix={<LockOutlined className="login-input-icon" />}
              placeholder="••••••••••••"
              visibilityToggle={{ visible: showPassword, onVisibleChange: setShowPassword }}
              autoComplete="current-password"
              aria-invalid={Boolean(message)}
              aria-describedby={message ? 'login-error' : undefined}
            />
          </Form.Item>

          {message && (
            <Alert id="login-error" className="form-error" type="error" showIcon role="alert" message={message} />
          )}

          <Button className="primary-button login-submit-btn" type="primary" size="large" loading={isSubmitting} htmlType="submit">
            {isSubmitting ? tr('Memverifikasi…', 'Signing in…') : t('login')}
          </Button>

          <p className="login-form__footer">
            {tr(
              'Akses khusus staf dan dokter resmi Klinik Gigi Senyum Sehat.',
              'Restricted to authorized Klinik Gigi Senyum Sehat staff and doctors.',
            )}
          </p>
        </Form>
      </div>
    </main>
  );
}
