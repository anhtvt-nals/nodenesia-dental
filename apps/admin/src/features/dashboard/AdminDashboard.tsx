import { ContentWorkspace } from '../content/ContentWorkspace';
import { useEffect, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Drawer, Layout, Menu, Progress, Row, Skeleton, Spin, Statistic, Tooltip, Typography } from 'antd';
import { CalendarOutlined, DashboardOutlined, FileTextOutlined, LogoutOutlined, MedicineBoxOutlined, MenuFoldOutlined, MenuUnfoldOutlined, ScheduleOutlined, SettingOutlined, SolutionOutlined, TeamOutlined, ToolOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { cancelBooking, getSettings, listArticleCategories, listArticles, listAuditLogs, listBookings, listContentBlocks, listDoctors, listFaqs, listGallery, listNotifications, listPatients, listPromotions, listServices, listTestimonials, listTimeOffs, listUsers, updateBookingStatus, type AdminFaq, type AdminUser, type Article, type ArticleCategory, type AuditLog, type Booking, type ClinicDoctor, type ClinicService, type ContentBlock, type GalleryItem, type NotificationLog, type Patient, type Promotion, type Settings, type Testimonial, type TimeOff } from '../../api/admin-api';
import { BookingsList } from '../bookings/BookingsList';
import { BookingFilters } from '../bookings/BookingFilters';
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
import { ContentBlockEditor } from '../content/ContentBlockEditor';
import { PatientList } from '../patients/PatientList';
import { CalendarPanel } from '../calendar/CalendarPanel';
import { UserManager } from '../users/UserManager';
import { AdminBrandLogo } from '../../components/AdminBrandLogo';
import { currentLocale, formatDate, setAdminLocale, tr, useAdminTranslation } from '../../i18n';

type Page = 'dashboard' | 'calendar' | 'bookings' | 'patients' | 'doctors' | 'time-offs' | 'services' | 'content' | 'operations' | 'settings';
const pages: Page[] = ['dashboard', 'calendar', 'bookings', 'patients', 'doctors', 'time-offs', 'services', 'content', 'operations', 'settings'];

function pageFromPathname(pathname: string): Page {
  const segment = pathname.replace(/\/+$/, '').split('/').filter(Boolean).at(-1);
  return pages.includes(segment as Page) ? segment as Page : 'dashboard';
}

function pathForPage(page: Page) {
  const base = window.location.pathname.startsWith('/admin') ? '/admin' : '';
  return page === 'dashboard' ? `${base || '/'}` : `${base}/${page}`;
}

function DashboardSkeleton() {
  return <section className="dashboard-skeleton" aria-busy="true" aria-label={tr('Memuat ringkasan', 'Loading overview')}><Row gutter={[16, 16]}>{Array.from({ length: 4 }, (_, index) => <Col key={index} xs={24} sm={12} xl={6}><Card><Skeleton active title={{ width: '55%' }} paragraph={{ rows: 1, width: '35%' }} /></Card></Col>)}</Row><Row gutter={[16, 16]} className="dashboard-analytics"><Col xs={24} lg={16}><Card><Skeleton active paragraph={{ rows: 9 }} /></Card></Col><Col xs={24} lg={8}><Card><Skeleton active avatar paragraph={{ rows: 5 }} /></Card></Col></Row><Card><Skeleton active title paragraph={{ rows: 7 }} /></Card></section>;
}

export function AdminDashboard({ accessToken, role, userName, onSignOut }: { accessToken: string; role: string; userName: string; onSignOut: () => void }) {
  const { t } = useAdminTranslation();
  const tokenRef = useRef(accessToken);
  tokenRef.current = accessToken;
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
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bookingFilter, setBookingFilter] = useState<{ doctorId?: string; status?: string }>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState<string>(t('loading'));
  const [page, setPage] = useState<Page>(() => pageFromPathname(window.location.pathname));
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
          const nextBookings = await listBookings(accessToken);
          assign(() => setBookings(nextBookings));
          break;
        }
        case 'bookings': {
          const [nextBookings, nextDoctors, nextServices] = await Promise.all([listBookings(accessToken, bookingFilter), listDoctors(accessToken), listServices(accessToken)]);
          assign(() => { setBookings(nextBookings); setDoctors(nextDoctors); setServices(nextServices); });
          break;
        }
        case 'calendar': break; // Calendar loads its own visible date range.
        case 'patients': {
          const nextPatients = await listPatients(accessToken);
          assign(() => setPatients(nextPatients));
          break;
        }
        case 'doctors': {
          const [nextDoctors, nextServices] = await Promise.all([listDoctors(accessToken), listServices(accessToken)]);
          assign(() => { setDoctors(nextDoctors); setServices(nextServices); });
          break;
        }
        case 'time-offs': {
          const [nextDoctors, nextTimeOffs] = await Promise.all([listDoctors(accessToken), listTimeOffs(accessToken)]);
          assign(() => { setDoctors(nextDoctors); setTimeOffs(nextTimeOffs); });
          break;
        }
        case 'services': {
          const nextServices = await listServices(accessToken);
          assign(() => setServices(nextServices));
          break;
        }
        case 'content': {
          const [nextFaqs, nextPromotions, nextTestimonials, nextGallery, nextArticles, nextArticleCategories, nextContentBlocks] = await Promise.all([listFaqs(accessToken), listPromotions(accessToken), listTestimonials(accessToken), listGallery(accessToken), listArticles(accessToken), listArticleCategories(accessToken), listContentBlocks(accessToken)]);
          assign(() => { setFaqs(nextFaqs); setPromotions(nextPromotions); setTestimonials(nextTestimonials); setGallery(nextGallery); setArticles(nextArticles); setArticleCategories(nextArticleCategories); setContentBlocks(nextContentBlocks); });
          break;
        }
        case 'operations': {
          const [nextNotificationLogs, nextAuditLogs] = await Promise.all([listNotifications(accessToken), listAuditLogs(accessToken)]);
          assign(() => { setNotificationLogs(nextNotificationLogs); setAuditLogs(nextAuditLogs); });
          break;
        }
        case 'settings': {
          if (role === 'owner') {
            const nextUsers = await listUsers(accessToken);
            assign(() => setUsers(nextUsers));
          }
          break;
        }
      }
    };
    void loadCurrentPage().catch((error: Error) => { if (active) setMessage(error.message); }).finally(() => { if (active) setIsPageLoading(false); });
    return () => { active = false; };
  }, [bookingFilter, isShellReady, page, role]);
  useEffect(() => { const handlePopState = () => setPage(pageFromPathname(window.location.pathname)); window.addEventListener('popstate', handlePopState); return () => window.removeEventListener('popstate', handlePopState); }, []);
  async function reloadBookings(filter = bookingFilter) { try { setIsPageLoading(true); setBookings(await listBookings(accessToken, filter)); } catch (error) { setMessage((error as Error).message); } finally { setIsPageLoading(false); } }
  async function cancel(code: string) { try { await cancelBooking(accessToken, code); await reloadBookings(); } catch (error) { setMessage((error as Error).message); } }
  async function changeStatus(code: string, status: 'confirmed' | 'completed' | 'no_show') { try { await updateBookingStatus(accessToken, code, status); await reloadBookings(); } catch (error) { setMessage((error as Error).message); } }
  async function reloadDoctors() { try { setDoctors(await listDoctors(accessToken)); } catch (error) { setMessage((error as Error).message); } }
  async function reloadNotifications() { try { setNotificationLogs(await listNotifications(accessToken)); } catch (error) { setMessage((error as Error).message); } }
  function setCollapsed(next: boolean) { window.localStorage.setItem('admin-sidebar-collapsed', String(next)); setSidebarCollapsed(next); }

  useEffect(() => { if (settings) setAdminLocale(settings.adminLocale); }, [settings]);
  const navigation: Array<{ id: Page; label: string }> = [
    { id: 'dashboard', label: t('dashboard') }, { id: 'calendar', label: tr('Kalender', 'Calendar') }, { id: 'bookings', label: t('appointments') }, { id: 'patients', label: t('patients') }, { id: 'doctors', label: t('doctors') },
    { id: 'services', label: t('services') }, { id: 'content', label: t('content') }, { id: 'operations', label: t('operations') }, { id: 'settings', label: t('settings') },
  ];
  const title = navigation.find((item) => item.id === page)?.label ?? t('dashboard');
  const todayKey = new Date().toDateString();
  const todayBookings = bookings.filter((booking) => new Date(booking.startsAt).toDateString() === todayKey);
  const pending = todayBookings.filter((booking) => booking.status === 'pending').length;
  const noShows = todayBookings.filter((booking) => booking.status === 'no_show').length;
  const confirmed = todayBookings.filter((booking) => booking.status === 'confirmed').length;
  const completed = todayBookings.filter((booking) => booking.status === 'completed').length;
  const weekDays = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(); date.setDate(date.getDate() - 6 + index);
    const count = bookings.filter((booking) => new Date(booking.startsAt).toDateString() === date.toDateString()).length;
    return { label: new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { weekday: 'short' }).format(date), count };
  });
  const chartMax = Math.max(...weekDays.map((day) => day.count), 1);
  const selectPage = (next: Page) => { if (next !== page) window.history.pushState({ page: next }, '', pathForPage(next)); setPage(next); setIsNavOpen(false); };
  const content = !isShellReady || !settings ? <DashboardSkeleton /> : <>
    {page === 'dashboard' && <section className="dashboard-overview" aria-labelledby="overview-heading"><p className="today-date">{formatDate(new Date())}</p><Typography.Title level={2} id="overview-heading">{tr('Ringkasan operasional', 'Operations overview')}</Typography.Title><Row gutter={[16, 16]} className="dashboard-stats"><Col xs={24} sm={12} xl={6}><Card><Statistic title={tr('Janji temu hari ini', "Today's appointments")} value={todayBookings.length} prefix={<CalendarOutlined />} /></Card></Col><Col xs={24} sm={12} xl={6}><Card><Statistic title={t('pending')} value={pending} valueStyle={{ color: '#9A6B1B' }} /></Card></Col><Col xs={24} sm={12} xl={6}><Card><Statistic title={t('confirmed')} value={confirmed} valueStyle={{ color: '#12392F' }} /></Card></Col><Col xs={24} sm={12} xl={6}><Card><Statistic title={t('noShow')} value={noShows} valueStyle={{ color: '#9B3A35' }} /></Card></Col></Row><Row gutter={[16, 16]} className="dashboard-analytics"><Col xs={24} lg={16}><Card title={tr('Tren janji temu 7 hari terakhir', 'Appointment trend for the last 7 days')}><div className="appointment-chart" role="img" aria-label={tr('Grafik jumlah janji temu tujuh hari terakhir', 'Appointment count chart for the last 7 days')}>{weekDays.map((day) => <div className="chart-column" key={day.label}><span className="chart-value">{day.count}</span><div className="chart-track"><div className="chart-bar" style={{ height: `${Math.max((day.count / chartMax) * 100, day.count ? 8 : 0)}%` }} /></div><span className="chart-label">{day.label}</span></div>)}</div></Card></Col><Col xs={24} lg={8}><Card title={tr('Status hari ini', "Today's status")}><div className="status-analytics"><div><Progress type="circle" percent={todayBookings.length ? Math.round((completed / todayBookings.length) * 100) : 0} strokeColor="#12392F" trailColor="#DDEAE3" format={(percent) => `${percent ?? 0}%`} /><Typography.Text type="secondary">{t('completed')}</Typography.Text></div><div className="status-summary"><Button type="link" onClick={() => selectPage('bookings')}>{pending} {t('pending').toLowerCase()}</Button><Button type="link" onClick={() => selectPage('bookings')}>{confirmed} {t('confirmed').toLowerCase()}</Button><Button type="link" onClick={() => selectPage('bookings')}>{noShows} {t('noShow').toLowerCase()}</Button></div></div></Card></Col></Row><BookingsList title={t('appointmentToday')} bookings={todayBookings} onCancel={cancel} onStatus={changeStatus} /></section>}
    {page === 'calendar' && <CalendarPanel accessToken={accessToken} />}
    {page === 'bookings' && <><BookingFilters doctors={doctors} onChange={setBookingFilter} /><BookingsList bookings={bookings} onCancel={cancel} onStatus={changeStatus} action={<ManualBookingForm accessToken={accessToken} doctors={doctors} services={services} onCreated={() => void reloadBookings()} onError={setMessage} />} /></>}
    {page === 'patients' && <PatientList accessToken={accessToken} patients={patients} onChanged={setPatients} onError={setMessage} />}
    {page === 'doctors' && <DoctorsPanel accessToken={accessToken} doctors={doctors} services={services} onReload={() => void reloadDoctors()} onChanged={setDoctors} onError={setMessage} />}
    {page === 'time-offs' && <TimeOffForm accessToken={accessToken} doctors={doctors} timeOffs={timeOffs} onChanged={setTimeOffs} onSaved={() => undefined} onError={setMessage} />}
    {page === 'services' && <ServiceCatalogue accessToken={accessToken} services={services} onChanged={setServices} onError={setMessage} />}
    {page === 'content' && <ContentWorkspace items={[
      { key: 'faqs', label: tr('FAQ', 'FAQ'), count: faqs.length, children: <FaqManager accessToken={accessToken} faqs={faqs} onChanged={setFaqs} onError={setMessage} /> },
      { key: 'promotions', label: tr('Promosi', 'Promotions'), count: promotions.length, children: <PromotionManager accessToken={accessToken} promotions={promotions} onChanged={setPromotions} onError={setMessage} /> },
      { key: 'testimonials', label: tr('Ulasan', 'Testimonials'), count: testimonials.length, children: <TestimonialManager accessToken={accessToken} testimonials={testimonials} onChanged={setTestimonials} onError={setMessage} /> },
      { key: 'gallery', label: tr('Galeri', 'Gallery'), count: gallery.length, children: <GalleryManager accessToken={accessToken} items={gallery} onChanged={setGallery} onError={setMessage} /> },
      { key: 'articles', label: tr('Artikel', 'Articles'), count: articles.length, children: <ArticleManager accessToken={accessToken} articles={articles} categories={articleCategories} onArticlesChanged={setArticles} onCategoriesChanged={setArticleCategories} onError={setMessage} /> },
      { key: 'blocks', label: tr('Blok konten', 'Content blocks'), count: contentBlocks.length, children: <ContentBlockEditor accessToken={accessToken} blocks={contentBlocks} onChanged={setContentBlocks} onError={setMessage} /> }
    ]} />}
    {page === 'operations' && <OperationsPanel accessToken={accessToken} logs={notificationLogs} auditLogs={auditLogs} onResent={() => void reloadNotifications()} onError={setMessage} />}
    {page === 'settings' && <><SettingsEditor settings={settings} accessToken={accessToken} onSaved={setSettings} />{role === 'owner' && <UserManager accessToken={accessToken} users={users} onChanged={setUsers} onError={setMessage} />}</>}
  </>;

  const item = (key: Page, icon: React.ReactNode, label: string) => ({ key, icon, label, tooltip: { title: label, placement: 'right' as const } });
  const menuItems: MenuProps['items'] = [
    { type: 'group', label: t('daily'), children: [item('dashboard', <DashboardOutlined />, t('dashboard')), item('calendar', <CalendarOutlined />, tr('Kalender', 'Calendar')), item('bookings', <ScheduleOutlined />, t('appointments')), item('patients', <TeamOutlined />, t('patients'))] },
    { type: 'group', label: t('manage'), children: [item('doctors', <MedicineBoxOutlined />, t('doctors')), item('time-offs', <CalendarOutlined />, tr('Jadwal libur', 'Time off')), item('services', <SolutionOutlined />, t('services')), item('content', <FileTextOutlined />, t('content'))] },
    { type: 'group', label: t('system'), children: [item('operations', <ToolOutlined />, t('operations')), item('settings', <SettingOutlined />, t('settings'))] },
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

  const navigationContent = <Menu mode="inline" selectedKeys={[page]} items={menuItems} onClick={({ key }) => selectPage(key as Page)} />;

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

  return <Layout className={`admin-shell${sidebarCollapsed ? ' admin-shell--collapsed' : ''}`}>
    <Button className="nav-toggle" type="default" onClick={() => setIsNavOpen(true)}>{t('menu')}</Button>
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
    <Drawer className="admin-mobile-nav" placement="left" open={isNavOpen} onClose={() => setIsNavOpen(false)} title={t('appTitle')}>
      <div className="admin-mobile-nav__body">
        <div className="admin-mobile-nav__menu">
          {navigationContent}
        </div>
        <div className="sidebar-user sidebar-user--mobile">
          {userProfileCard}
        </div>
      </div>
    </Drawer>
    <Layout className="admin-main"><Layout.Header className="admin-topbar"><div className="admin-topbar__inner"><h1>{title}</h1><div id="admin-header-actions" className="admin-header-actions" /></div></Layout.Header><Layout.Content className="admin-content">{message && message !== t('loading') && <Alert className="global-message" type="error" showIcon role="alert" message={message} />}<div className="admin-page-region" aria-busy={isPageLoading}>{content}{isPageLoading && isShellReady && <div className="admin-page-loading" role="status" aria-label={tr('Memuat halaman', 'Loading page')}><Spin size="large" /></div>}</div><p className="screen-reader-message" aria-live="polite">{message}</p></Layout.Content></Layout>
  </Layout>;
}
