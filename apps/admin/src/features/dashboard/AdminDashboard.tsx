import { useEffect, useRef, useState } from 'react';
import { Alert, App as AntdApp, Button, Card, Col, Drawer, Layout, Menu, Progress, Row, Skeleton, Spin, Statistic, Tooltip, Typography } from 'antd';
import {
  CalendarOutlined,
  CommentOutlined,
  CloseOutlined,
  DashboardOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuOutlined,
  MedicineBoxOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  ScheduleOutlined,
  SettingOutlined,
  SolutionOutlined,
  TagOutlined,
  TeamOutlined,
  ToolOutlined,
  UserSwitchOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { cancelBooking, getSettings, listArticleCategories, listArticles, listAuditLogs, listBookings, listDoctors, listFaqs, listGallery, listInAppNotifications, listNotifications, listPatients, listPromotions, listServices, listTestimonials, listTimeOffs, listUsers, markAllInAppNotificationsRead, markInAppNotificationRead, subscribeInAppNotifications, updateBookingStatus, type AdminFaq, type AdminNotification, type AdminUser, type Article, type ArticleCategory, type AuditLog, type Booking, type ClinicDoctor, type ClinicService, type GalleryItem, type NotificationLog, type Patient, type Promotion, type ServerPagination, type Settings, type Testimonial, type TimeOff } from '../../api/admin-api';
import { BookingsList } from '../bookings/BookingsList';
import { BookingFilters, type BookingClientFilter } from '../bookings/BookingFilters';
import { ManualBookingForm } from '../bookings/ManualBookingForm';
import { DoctorsPanel } from '../doctors/DoctorsPanel';
import { TimeOffForm } from '../doctors/TimeOffForm';
import { FaqManager } from '../faqs/FaqManager';
import { OperationsPanel } from '../operations/OperationsPanel';
import { ServiceCatalogue } from '../services/ServiceCatalogue';
import { SettingsEditor } from '../settings/SettingsEditor';
import { PromotionManager } from '../promotions/PromotionManager';
import { TestimonialManager } from '../testimonials/TestimonialManager';
import { ArticleManager } from '../articles/ArticleManager';
import { GalleryManager } from '../gallery/GalleryManager';
import { PatientList } from '../patients/PatientList';
import { CalendarPanel } from '../calendar/CalendarPanel';
import { UserManager } from '../users/UserManager';
import { AdminBrandLogo } from '../../components/AdminBrandLogo';
import { NotificationBell } from '../../components/NotificationBell';
import { AdminPageHeader, AdminStatusBadge } from '../../components/ui';
import { currentLocale, formatDate, formatLateDuration, formatTimeOnly, setAdminLocale, tr, useAdminTranslation } from '../../i18n';

type ContentSubPage = 'articles' | 'promotions' | 'testimonials' | 'faqs' | 'gallery';
type Page = 'dashboard' | 'calendar' | 'bookings' | 'patients' | 'doctors' | 'time-offs' | 'services' | 'content' | ContentSubPage | 'operations' | 'users' | 'settings';
const contentSubPages: ContentSubPage[] = ['articles', 'promotions', 'testimonials', 'faqs', 'gallery'];
const pages: Page[] = ['dashboard', 'calendar', 'bookings', 'patients', 'doctors', 'time-offs', 'services', 'content', ...contentSubPages, 'operations', 'users', 'settings'];

function pageFromPathname(pathname: string): Page {
  const segment = pathname.replace(/\/+$/, '').split('/').filter(Boolean).at(-1);
  if (segment === 'content') return 'articles';
  return pages.includes(segment as Page) ? (segment as Page) : 'dashboard';
}

function pathForPage(page: Page) {
  const base = window.location.pathname.startsWith('/admin') ? '/admin' : '';
  if (contentSubPages.includes(page as ContentSubPage)) {
    return `${base}/content/${page}`;
  }
  return page === 'dashboard' ? `${base || '/'}` : `${base}/${page}`;
}

function DashboardSkeleton() {
  return <section className="dashboard-skeleton" aria-busy="true" aria-label={tr('Memuat ringkasan', 'Loading overview')}><Row gutter={[16, 16]}>{Array.from({ length: 4 }, (_, index) => <Col key={index} xs={24} sm={12} xl={6}><Card><Skeleton active title={{ width: '55%' }} paragraph={{ rows: 1, width: '35%' }} /></Card></Col>)}</Row><Row gutter={[16, 16]} className="dashboard-analytics"><Col xs={24} lg={16}><Card><Skeleton active paragraph={{ rows: 9 }} /></Card></Col><Col xs={24} lg={8}><Card><Skeleton active avatar paragraph={{ rows: 5 }} /></Card></Col></Row><Card><Skeleton active title paragraph={{ rows: 7 }} /></Card></section>;
}

export function AdminDashboard({ accessToken, role, userName, onSignOut }: { accessToken: string; role: string; userName: string; onSignOut: () => void }) {
  const { t } = useAdminTranslation();
  const { message: toast, notification: notifyToast } = AntdApp.useApp();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
  const [inAppNotifications, setInAppNotifications] = useState<AdminNotification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [settings, setSettings] = useState<Settings>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsQuery, setPatientsQuery] = useState('');
  const [bookingFilter, setBookingFilter] = useState<{ doctorId?: string; status?: string }>({});
  const [bookingClientFilter, setBookingClientFilter] = useState<BookingClientFilter>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const PAGE_SIZE = 20;
  const [paginationMap, setPaginationMap] = useState<Record<string, { page: number; total: number }>>({});
  const getPage = (key: string) => paginationMap[key]?.page ?? 1;
  const setListPage = (key: string, nextPage: number) =>
    setPaginationMap((prev) => ({ ...prev, [key]: { page: nextPage, total: prev[key]?.total ?? 0 } }));
  const setListTotal = (key: string, total: number) =>
    setPaginationMap((prev) => ({ ...prev, [key]: { page: prev[key]?.page ?? 1, total } }));
  const paginationFor = (key: string): ServerPagination => ({
    current: getPage(key),
    pageSize: PAGE_SIZE,
    total: paginationMap[key]?.total ?? 0,
    onChange: (nextPage) => setListPage(key, nextPage),
  });
  const [message, setMessage] = useState<string>(t('loading'));
  const [page, setPage] = useState<Page>(() => pageFromPathname(window.location.pathname));
  const pageRef = useRef<Page>(page);
  pageRef.current = page;
  const [isShellReady, setIsShellReady] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => window.localStorage.getItem('admin-sidebar-collapsed') === 'true');

  // Settings establish the app language and shell. Feature data is intentionally
  // loaded only when its corresponding route is opened.
  useEffect(() => {
    const accessToken = tokenRef.current;
    let active = true;
    setIsShellReady(false);
    setMessage(t('loading'));
    void getSettings(accessToken).then((nextSettings) => {
      if (!active) return;
      setSettings(nextSettings);
      setMessage('');
      setIsShellReady(true);
    }).catch((error: Error) => {
      if (active) setMessage(error.message);
    });
    return () => { active = false; };
  }, []);

  const activePageKey = page === 'content' ? 'articles' : page;
  const currentListPage = getPage(activePageKey);
  const notificationsPage = getPage('notifications');
  const auditLogsPage = getPage('audit-logs');

  const currentBookingQuery = () => ({
    ...bookingFilter,
    ...(bookingClientFilter.search?.trim() ? { q: bookingClientFilter.search.trim() } : {}),
    ...(bookingClientFilter.dateFrom ? { from: new Date(`${bookingClientFilter.dateFrom}T00:00:00`).toISOString() } : {}),
    ...(bookingClientFilter.dateTo ? { to: new Date(`${bookingClientFilter.dateTo}T23:59:59.999`).toISOString() } : {}),
    page: getPage('bookings'),
    pageSize: PAGE_SIZE,
  });

  useEffect(() => {
    if (!isShellReady) return;
    const accessToken = tokenRef.current;
    let active = true;
    setIsPageLoading(true);
    setMessage('');
    const assign = (callback: () => void) => { if (active) callback(); };

    const loadCurrentPage = async () => {
      switch (page) {
        case 'dashboard': {
          const [nextBookings, nextDoctors, nextServices] = await Promise.all([
            listBookings(accessToken, { page: 1, pageSize: 100 }),
            listDoctors(accessToken, { page: 1, pageSize: 200 }),
            listServices(accessToken, { page: 1, pageSize: 200 }),
          ]);
          assign(() => { setBookings(nextBookings.items); setDoctors(nextDoctors.items); setServices(nextServices.items); });
          break;
        }
        case 'bookings': {
          const [nextBookings, nextDoctors, nextServices] = await Promise.all([
            listBookings(accessToken, currentBookingQuery()),
            listDoctors(accessToken, { page: 1, pageSize: 200 }),
            listServices(accessToken, { page: 1, pageSize: 200 }),
          ]);
          assign(() => {
            setBookings(nextBookings.items);
            setListTotal('bookings', nextBookings.total);
            setDoctors(nextDoctors.items);
            setServices(nextServices.items);
          });
          break;
        }
        case 'calendar': break; // Calendar loads its own visible date range.
        case 'patients': {
          const nextPatients = await listPatients(accessToken, patientsQuery, { page: currentListPage, pageSize: PAGE_SIZE });
          assign(() => { setPatients(nextPatients.items); setListTotal('patients', nextPatients.total); });
          break;
        }
        case 'doctors': {
          const [nextDoctors, nextServices] = await Promise.all([
            listDoctors(accessToken, { page: currentListPage, pageSize: PAGE_SIZE }),
            listServices(accessToken, { page: 1, pageSize: 200 }),
          ]);
          assign(() => { setDoctors(nextDoctors.items); setListTotal('doctors', nextDoctors.total); setServices(nextServices.items); });
          break;
        }
        case 'time-offs': {
          const [nextDoctors, nextTimeOffs] = await Promise.all([
            listDoctors(accessToken, { page: 1, pageSize: 200 }),
            listTimeOffs(accessToken, { page: currentListPage, pageSize: PAGE_SIZE }),
          ]);
          assign(() => { setDoctors(nextDoctors.items); setTimeOffs(nextTimeOffs.items); setListTotal('time-offs', nextTimeOffs.total); });
          break;
        }
        case 'services': {
          const nextServices = await listServices(accessToken, { page: currentListPage, pageSize: PAGE_SIZE });
          assign(() => { setServices(nextServices.items); setListTotal('services', nextServices.total); });
          break;
        }
        case 'articles':
        case 'content': {
          const [nextArticles, nextArticleCategories] = await Promise.all([
            listArticles(accessToken, { page: currentListPage, pageSize: PAGE_SIZE }),
            listArticleCategories(accessToken, { page: 1, pageSize: 200 }),
          ]);
          assign(() => { setArticles(nextArticles.items); setListTotal('articles', nextArticles.total); setArticleCategories(nextArticleCategories.items); });
          break;
        }
        case 'promotions': {
          const nextPromotions = await listPromotions(accessToken, { page: currentListPage, pageSize: PAGE_SIZE });
          assign(() => { setPromotions(nextPromotions.items); setListTotal('promotions', nextPromotions.total); });
          break;
        }
        case 'testimonials': {
          const nextTestimonials = await listTestimonials(accessToken, { page: currentListPage, pageSize: PAGE_SIZE });
          assign(() => { setTestimonials(nextTestimonials.items); setListTotal('testimonials', nextTestimonials.total); });
          break;
        }
        case 'faqs': {
          const nextFaqs = await listFaqs(accessToken, { page: currentListPage, pageSize: PAGE_SIZE });
          assign(() => { setFaqs(nextFaqs.items); setListTotal('faqs', nextFaqs.total); });
          break;
        }
        case 'gallery': {
          const [nextGallery, nextServices] = await Promise.all([
            listGallery(accessToken, { page: currentListPage, pageSize: PAGE_SIZE }),
            listServices(accessToken, { page: 1, pageSize: 200 }),
          ]);
          assign(() => { setGallery(nextGallery.items); setListTotal('gallery', nextGallery.total); setServices(nextServices.items); });
          break;
        }
        case 'operations': {
          const [nextNotificationLogs, nextAuditLogs] = await Promise.all([
            listNotifications(accessToken, { page: notificationsPage, pageSize: PAGE_SIZE }),
            listAuditLogs(accessToken, { page: auditLogsPage, pageSize: PAGE_SIZE }),
          ]);
          assign(() => {
            setNotificationLogs(nextNotificationLogs.items);
            setListTotal('notifications', nextNotificationLogs.total);
            setAuditLogs(nextAuditLogs.items);
            setListTotal('audit-logs', nextAuditLogs.total);
          });
          break;
        }
        case 'users': {
          if (role === 'owner') {
            const nextUsers = await listUsers(accessToken, { page: currentListPage, pageSize: PAGE_SIZE });
            assign(() => { setUsers(nextUsers.items); setListTotal('users', nextUsers.total); });
          }
          break;
        }
        case 'settings':
          break;
      }
    };
    void loadCurrentPage().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setIsPageLoading(false); });
    return () => { active = false; };
  }, [auditLogsPage, bookingClientFilter, bookingFilter, currentListPage, isShellReady, notificationsPage, page, patientsQuery, role]);
  useEffect(() => {
    if (!isShellReady) return;
    const token = tokenRef.current;
    let active = true;
    void listInAppNotifications(token, { page: 1, pageSize: 20 })
      .then((res) => {
        if (!active) return;
        setInAppNotifications(res.items);
        setUnreadNotifications(res.unreadCount);
      })
      .catch(() => undefined);

    const unsubscribe = subscribeInAppNotifications(token, (incoming) => {
      if (!active) return;
      setInAppNotifications((prev) => [incoming, ...prev.filter((n) => n.id !== incoming.id)].slice(0, 30));
      setUnreadNotifications((prev) => prev + 1);
      notifyToast.info({
        message: incoming.title,
        description: incoming.body,
        placement: 'topRight',
      });
      if (pageRef.current === 'bookings' || pageRef.current === 'dashboard') {
        void reloadBookings();
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [isShellReady]);
  useEffect(() => { const handlePopState = () => setPage(pageFromPathname(window.location.pathname)); window.addEventListener('popstate', handlePopState); return () => window.removeEventListener('popstate', handlePopState); }, []);
  async function reloadBookings(filter = currentBookingQuery()) { try { setIsPageLoading(true); const res = await listBookings(accessToken, filter); setBookings(res.items); setListTotal('bookings', res.total); } catch (error) { setMessage((error as Error).message); } finally { setIsPageLoading(false); } }
  async function cancel(code: string) {
    try {
      await cancelBooking(accessToken, code);
      toast.success(tr(`Janji temu ${code} dibatalkan`, `Appointment ${code} cancelled`));
      await reloadBookings();
    } catch (error) {
      const msg = (error as Error).message;
      setMessage(msg);
      toast.error(msg);
    }
  }
  async function changeStatus(code: string, status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show', options?: { chairIndex?: number; phone?: string }) {
    const previous = bookings;
    // Optimistic UI update
    setBookings((curr) => curr.map((b) => (b.code === code ? { ...b, status, ...(options?.chairIndex ? { chairIndex: options.chairIndex } : {}) } : b)));
    try {
      await updateBookingStatus(accessToken, code, status, options);
      toast.success(tr(`Status ${code} diperbarui`, `Status for ${code} updated`));
      await reloadBookings();
    } catch (error) {
      setBookings(previous);
      const msg = (error as Error).message;
      setMessage(msg);
      toast.error(msg);
    }
  }
  async function reloadDoctors() { try { const res = await listDoctors(accessToken, { page: getPage('doctors'), pageSize: PAGE_SIZE }); setDoctors(res.items); setListTotal('doctors', res.total); } catch (error) { setMessage((error as Error).message); } }
  async function reloadNotifications() { try { const res = await listNotifications(accessToken, { page: getPage('notifications'), pageSize: PAGE_SIZE }); setNotificationLogs(res.items); setListTotal('notifications', res.total); } catch (error) { setMessage((error as Error).message); } }
  function setCollapsed(next: boolean) { window.localStorage.setItem('admin-sidebar-collapsed', String(next)); setSidebarCollapsed(next); }

  useEffect(() => { if (settings) setAdminLocale(settings.adminLocale); }, [settings]);
  const navigation: Array<{ id: Page; label: string; group: string }> = [
    { id: 'dashboard', label: t('dashboard'), group: t('daily') },
    { id: 'calendar', label: tr('Kalender', 'Calendar'), group: t('daily') },
    { id: 'bookings', label: t('appointments'), group: t('daily') },
    { id: 'patients', label: t('patients'), group: t('daily') },
    { id: 'doctors', label: t('doctors'), group: t('manage') },
    { id: 'time-offs', label: tr('Jadwal libur', 'Time off'), group: t('manage') },
    { id: 'services', label: t('services'), group: t('manage') },
    { id: 'articles', label: tr('Artikel & Berita', 'Articles & News'), group: t('content') },
    { id: 'promotions', label: tr('Promosi', 'Promotions'), group: t('content') },
    { id: 'testimonials', label: tr('Testimoni Pasien', 'Patient Testimonials'), group: t('content') },
    { id: 'faqs', label: tr('Tanya Jawab (FAQ)', 'FAQ'), group: t('content') },
    { id: 'gallery', label: tr('Galeri Klinik', 'Gallery'), group: t('content') },
    { id: 'operations', label: t('operations'), group: t('system') },
    ...(role === 'owner' ? [{ id: 'users' as Page, label: tr('Akun Staf & Admin', 'Staff Accounts'), group: t('system') }] : []),
    { id: 'settings', label: t('settings'), group: t('system') },
  ];
  const title = navigation.find((item) => item.id === page)?.label ?? t('dashboard');
  const todayKey = new Date().toDateString();
  const todayBookings = bookings.filter((booking) => new Date(booking.startsAt).toDateString() === todayKey);
  const pending = todayBookings.filter((booking) => booking.status === 'pending').length;
  const noShows = todayBookings.filter((booking) => booking.status === 'no_show').length;
  const confirmed = todayBookings.filter((booking) => booking.status === 'confirmed').length;
  const completed = todayBookings.filter((booking) => booking.status === 'completed').length;
  const attentionBookings = todayBookings.filter((b) => {
    const isOverdue = b.status === 'confirmed' && Date.now() > new Date(b.startsAt).getTime() + 15 * 60_000;
    return b.status === 'pending' || isOverdue;
  });
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    const count = bookings.filter((booking) => new Date(booking.startsAt).toDateString() === date.toDateString()).length;
    return { label: new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }).format(date), count };
  });
  const chartMax = Math.max(...weekDays.map((day) => day.count), 1);
  const selectPage = (next: Page) => {
    if (next !== page) window.history.pushState({ page: next }, '', pathForPage(next));
    setPage(next);
    setIsNavOpen(false);
  };
  const content = !isShellReady || !settings ? <DashboardSkeleton /> : <>
    {page === 'dashboard' && <section className="dashboard-overview" aria-labelledby="overview-heading">
      <AdminPageHeader
        title={tr('Ringkasan Operasional', 'Operations Overview')}
        description={formatDate(new Date())}
        showTimezone
        actions={<Button type="primary" onClick={() => selectPage('bookings')}>{tr('Lihat Semua Janji Temu', 'View All Appointments')}</Button>}
      />
      {attentionBookings.length > 0 && <Card
        className="admin-attention-card"
        title={<span className="admin-attention-card__title"><WarningOutlined /> {tr('Perlu Ditangani Hari Ini', 'Needs Attention Today')} ({attentionBookings.length})</span>}
        extra={<Button type="link" size="small" onClick={() => selectPage('bookings')}>{tr('Buka Antrean', 'Open Queue')}</Button>}
      >
        <div className="admin-attention-list">
          {attentionBookings.slice(0, 5).map((item) => {
            const lateMinutes = item.status === 'confirmed' ? Math.floor((Date.now() - new Date(item.startsAt).getTime()) / 60_000) : 0;
            return (
              <div className="admin-attention-item" key={item.code}>
                <div className="admin-attention-item__info">
                  <strong>{item.patient.name}</strong>
                  <span>{formatTimeOnly(item.startsAt)} · {item.doctor}</span>
                  {lateMinutes > 15 && <AdminStatusBadge status="confirmed" overdueLabel={formatLateDuration(lateMinutes)} />}
                  {item.status === 'pending' && <AdminStatusBadge status="pending" />}
                </div>
                <div className="admin-attention-item__actions">
                  {item.status === 'pending' && <Button className="admin-attention-item__button" type="primary" onClick={() => void changeStatus(item.code, 'confirmed')}>{tr('Konfirmasi', 'Confirm')}</Button>}
                  <Button className="admin-attention-item__button" onClick={() => selectPage('bookings')}>{tr('Detail', 'Details')}</Button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>}
      <Row gutter={[16, 16]} className="dashboard-stats">
        <Col xs={24} sm={12} xl={6}><Card><Statistic title={tr('Janji temu hari ini', "Today's appointments")} value={todayBookings.length} prefix={<CalendarOutlined />} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title={t('pending')} value={pending} valueStyle={{ color: 'var(--semantic-warning-text)' }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title={t('confirmed')} value={confirmed} valueStyle={{ color: 'var(--brand-700)' }} /></Card></Col>
        <Col xs={24} sm={12} xl={6}><Card><Statistic title={t('noShow')} value={noShows} valueStyle={{ color: 'var(--semantic-danger-text)' }} /></Card></Col>
      </Row>
      <Row gutter={[16, 16]} className="dashboard-analytics">
        <Col xs={24} lg={16}><Card title={tr('Tren janji temu 7 hari terakhir', 'Appointment trend for the last 7 days')}><div className="appointment-chart" role="img" aria-label={tr('Grafik jumlah janji temu tujuh hari terakhir', 'Appointment count chart for the last 7 days')}>{weekDays.map((day) => <div className="chart-column" key={day.label}><span className="chart-value">{day.count}</span><div className="chart-track"><div className="chart-bar" style={{ height: `${Math.max((day.count / chartMax) * 100, day.count ? 8 : 0)}%` }} /></div><span className="chart-label">{day.label}</span></div>)}</div></Card></Col>
        <Col xs={24} lg={8}><Card title={tr('Status hari ini', "Today's status")}><div className="status-analytics"><div><Progress type="circle" percent={todayBookings.length ? Math.round((completed / todayBookings.length) * 100) : 0} strokeColor="var(--brand-700)" trailColor="var(--neutral-200)" format={(percent) => `${percent ?? 0}%`} /><Typography.Text type="secondary">{t('completed')}</Typography.Text></div><div className="status-summary"><Button type="link" onClick={() => selectPage('bookings')}>{pending} {t('pending').toLowerCase()}</Button><Button type="link" onClick={() => selectPage('bookings')}>{confirmed} {t('confirmed').toLowerCase()}</Button><Button type="link" onClick={() => selectPage('bookings')}>{noShows} {t('noShow').toLowerCase()}</Button></div></div></Card></Col>
      </Row>
      <BookingsList title={t('appointmentToday')} bookings={todayBookings} onCancel={cancel} onStatus={changeStatus} accessToken={accessToken} onReload={() => void reloadBookings()} doctors={doctors} services={services} />
    </section>}
    {page === 'calendar' && <CalendarPanel accessToken={accessToken} />}
    {page === 'bookings' && <BookingsList bookings={bookings} onCancel={cancel} onStatus={changeStatus} accessToken={accessToken} onReload={() => void reloadBookings()} doctors={doctors} services={services} pagination={paginationFor('bookings')} filterToolbar={<BookingFilters doctors={doctors} onChange={(next) => { setBookingFilter(next); setListPage('bookings', 1); }} onClientChange={(next) => { setBookingClientFilter(next); setListPage('bookings', 1); }} />} action={<ManualBookingForm accessToken={accessToken} doctors={doctors} services={services} onCreated={() => void reloadBookings()} onError={setMessage} />} />}
    {page === 'patients' && <PatientList accessToken={accessToken} patients={patients} onChanged={setPatients} onError={setMessage} pagination={paginationFor('patients')} onSearchQuery={(q) => { setPatientsQuery(q); setListPage('patients', 1); }} />}
    {page === 'doctors' && <DoctorsPanel accessToken={accessToken} doctors={doctors} services={services} onReload={() => void reloadDoctors()} onChanged={setDoctors} onError={setMessage} pagination={paginationFor('doctors')} />}
    {page === 'time-offs' && <TimeOffForm accessToken={accessToken} doctors={doctors} timeOffs={timeOffs} onChanged={setTimeOffs} onSaved={() => undefined} onError={setMessage} pagination={paginationFor('time-offs')} />}
    {page === 'services' && <ServiceCatalogue accessToken={accessToken} services={services} onChanged={setServices} onError={setMessage} pagination={paginationFor('services')} />}
    {(page === 'articles' || page === 'content') && <ArticleManager accessToken={accessToken} articles={articles} categories={articleCategories} onArticlesChanged={setArticles} onCategoriesChanged={setArticleCategories} onError={setMessage} pagination={paginationFor('articles')} />}
    {page === 'promotions' && <PromotionManager accessToken={accessToken} promotions={promotions} onChanged={setPromotions} onError={setMessage} pagination={paginationFor('promotions')} />}
    {page === 'testimonials' && <TestimonialManager accessToken={accessToken} testimonials={testimonials} onChanged={setTestimonials} onError={setMessage} pagination={paginationFor('testimonials')} />}
    {page === 'faqs' && <FaqManager accessToken={accessToken} faqs={faqs} onChanged={setFaqs} onError={setMessage} pagination={paginationFor('faqs')} />}
    {page === 'gallery' && <GalleryManager accessToken={accessToken} items={gallery} services={services} onChanged={setGallery} onError={setMessage} pagination={paginationFor('gallery')} />}
    {page === 'operations' && <OperationsPanel accessToken={accessToken} logs={notificationLogs} auditLogs={auditLogs} onResent={() => void reloadNotifications()} onError={setMessage} notificationsPagination={paginationFor('notifications')} auditPagination={paginationFor('audit-logs')} />}
    {page === 'users' && (role === 'owner'
      ? <UserManager accessToken={accessToken} users={users} onChanged={setUsers} onError={setMessage} pagination={paginationFor('users')} />
      : <Alert type="warning" showIcon message={tr('Akses terbatas', 'Restricted access')} description={tr('Halaman Akun Staf & Admin hanya dapat diakses oleh Pemilik Klinik.', 'Staff Accounts can only be accessed by Clinic Owners.')} />)}
    {page === 'settings' && <SettingsEditor settings={settings} accessToken={accessToken} onSaved={setSettings} />}
  </>;

  const item = (key: Page, icon: React.ReactNode, label: string) => ({ key, icon, label, tooltip: { title: label, placement: 'right' as const } });
  const contentSubItems = [
    item('articles', <FileTextOutlined />, tr('Artikel & Berita', 'Articles & News')),
    item('promotions', <TagOutlined />, tr('Promosi', 'Promotions')),
    item('testimonials', <CommentOutlined />, tr('Testimoni Pasien', 'Testimonials')),
    item('faqs', <QuestionCircleOutlined />, tr('Tanya Jawab (FAQ)', 'FAQ')),
    item('gallery', <PictureOutlined />, tr('Galeri Klinik', 'Gallery')),
  ];
  const menuItems: MenuProps['items'] = [
    { type: 'group', label: t('daily'), children: [item('dashboard', <DashboardOutlined />, t('dashboard')), item('calendar', <CalendarOutlined />, tr('Kalender', 'Calendar')), item('bookings', <ScheduleOutlined />, t('appointments')), item('patients', <TeamOutlined />, t('patients'))] },
    {
      type: 'group',
      label: t('manage'),
      children: [
        item('doctors', <MedicineBoxOutlined />, t('doctors')),
        item('time-offs', <CalendarOutlined />, tr('Jadwal libur', 'Time off')),
        item('services', <SolutionOutlined />, t('services')),
      ],
    },
    {
      type: 'group',
      label: t('content'),
      children: contentSubItems,
    },
    {
      type: 'group',
      label: t('system'),
      children: [
        item('operations', <ToolOutlined />, t('operations')),
        ...(role === 'owner' ? [item('users', <UserSwitchOutlined />, tr('Akun Staf & Admin', 'Staff Accounts'))] : []),
        item('settings', <SettingOutlined />, t('settings')),
      ],
    },
  ];
  const roleLabel = role === 'owner'
    ? tr('Pemilik Klinik', 'Owner')
    : role === 'doctor'
      ? tr('Dokter', 'Doctor')
      : tr('Staf Admin', 'Staff');

  const userInitials = (userName || 'Admin')
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'A';

  const navigationContent = (
    <Menu
      mode="inline"
      selectedKeys={[page === 'content' ? 'articles' : page]}
      items={menuItems}
      onClick={({ key }) => selectPage(key as Page)}
    />
  );

  const userProfileCard = (
    <div className="sidebar-user__card">
      <Tooltip title={sidebarCollapsed ? `${userName} • ${roleLabel}` : undefined} placement="right">
        <div className="sidebar-user__avatar" aria-hidden="true">
          <span>{userInitials}</span>
          <span className="sidebar-user__status-dot" />
        </div>
      </Tooltip>
      <div className="sidebar-user__meta">
        <span className="sidebar-user__name" title={userName}>{userName}</span>
        <span className="sidebar-user__role">{roleLabel}</span>
      </div>
      <Tooltip title={t('logout')} placement={sidebarCollapsed ? 'right' : 'top'}>
        <Button
          className="sidebar-user__logout"
          type="text"
          danger
          icon={<LogoutOutlined />}
          onClick={onSignOut}
          aria-label={t('logout')}
        />
      </Tooltip>
    </div>
  );

  const handleMarkNotificationRead = async (item: AdminNotification) => {
    if (!item.isRead) {
      setInAppNotifications((prev) => prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)));
      setUnreadNotifications((prev) => Math.max(0, prev - 1));
      void markInAppNotificationRead(accessToken, item.id).catch(() => undefined);
    }
    if (item.entityType === 'booking') {
      selectPage('bookings');
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    setInAppNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadNotifications(0);
    void markAllInAppNotificationsRead(accessToken).catch(() => undefined);
  };

  return <Layout className={`admin-shell${sidebarCollapsed ? ' admin-shell--collapsed' : ''}`}>
    <Button
      className={`nav-toggle${isNavOpen ? ' is-open' : ''}`}
      type="default"
      onClick={() => setIsNavOpen((open) => !open)}
      aria-label={isNavOpen ? tr('Tutup menu', 'Close menu') : t('menu')}
      aria-expanded={isNavOpen}
      aria-controls="admin-mobile-menu"
    >
      <MenuOutlined className="nav-toggle__menu-icon" />
      <CloseOutlined className="nav-toggle__close-icon" />
    </Button>
    <Layout.Sider className="admin-sidebar" width={240} breakpoint="lg" collapsedWidth={72} collapsed={sidebarCollapsed} onCollapse={setCollapsed}>
      <div className="admin-brand-row">
        <AdminBrandLogo label={t('appTitle')} />
        <Button className="sidebar-collapse" type="text" icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />} aria-label={sidebarCollapsed ? tr('Buka sidebar', 'Expand sidebar') : tr('Tutup sidebar', 'Collapse sidebar')} onClick={() => setCollapsed(!sidebarCollapsed)} />
      </div>
      <div className="admin-sidebar-nav">
        {navigationContent}
      </div>
      <div className="sidebar-user">
        {userProfileCard}
      </div>
    </Layout.Sider>
    <Drawer className="admin-mobile-nav" placement="left" open={isNavOpen} onClose={() => setIsNavOpen(false)} closable={false} title={null} rootStyle={{ top: 58 }} aria-label={t('menu')}>
      <div id="admin-mobile-menu" className="admin-mobile-nav__body">
        <div className="admin-mobile-nav__menu">
          {navigationContent}
        </div>
        <div className="sidebar-user sidebar-user--mobile">
          {userProfileCard}
        </div>
      </div>
    </Drawer>
    <Layout className="admin-main"><Layout.Header className="admin-topbar"><div className="admin-topbar__inner"><h1>{title}</h1><div className="admin-topbar__right"><NotificationBell items={inAppNotifications} unreadCount={unreadNotifications} onMarkRead={(item) => void handleMarkNotificationRead(item)} onMarkAllRead={() => void handleMarkAllNotificationsRead()} /><div id="admin-header-actions" className="admin-header-actions" /></div></div></Layout.Header><Layout.Content className="admin-content">{import.meta.env.VITE_DEMO_MODE === 'true' && <Alert type="info" showIcon banner closable style={{ marginBottom: 16 }} message={tr('Mode Demo: Data simulasi di-reset otomatis setiap 30 menit. Unggahan gambar menggunakan gambar contoh.', 'Demo Mode: Sample data resets automatically every 30 minutes. Image uploads use a default demo image.')} />}{message && message !== t('loading') && <Alert className="global-message" type="error" showIcon role="alert" message={message} />}<div className="admin-page-region" aria-busy={isPageLoading}>{content}{isPageLoading && isShellReady && <div className="admin-page-loading" role="status" aria-label={tr('Memuat halaman', 'Loading page')}><Spin size="large" /></div>}</div><p className="screen-reader-message" aria-live="polite">{message}</p></Layout.Content></Layout>
  </Layout>;
}
