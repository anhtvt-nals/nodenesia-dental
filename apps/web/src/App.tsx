import React, { useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider, useI18n } from './i18n';
import { ClinicSettingsProvider, useClinicSettingsState } from './lib/clinic-settings';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { SchedulePage } from './pages/SchedulePage';
import { GalleryPage } from './pages/GalleryPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { ManageBookingPage } from './pages/ManageBookingPage';
import { NotFoundPage } from './pages/NotFoundPage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center max-w-lg mx-auto">
          <div className="badge badge-primary mb-4">
            <span>Pemberitahuan Sistem</span>
          </div>
          <h2 className="font-heading text-3xl text-text mb-3">
            Halaman Sedang Diperbarui
          </h2>
          <p className="text-sm font-body text-text-muted mb-6 leading-relaxed">
            Terjadi pembaruan modul aplikasi atau kendala koneksi sesaat. Silakan muat ulang halaman.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="btn-primary text-sm"
            >
              Muat Ulang Halaman
            </button>
            <a
              href="/"
              className="btn-secondary text-sm"
            >
              Kembali ke Beranda
            </a>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

const LoadingFallback: React.FC = () => (
  <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
    <div className="font-heading font-semibold text-sm text-primary animate-pulse">
      Memuat Halaman...
    </div>
  </div>
);

function ClinicMark() {
  return (
    <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 32 32" fill="none">
      <path d="M16 4.5c-6.3 0-10.75 4.28-10.75 10.1 0 3.1 1.3 5.2 3.02 7.98 1.07 1.73 1.88 4.92 3.45 4.92 1.8 0 1.34-5.13 4.28-5.13s2.48 5.13 4.28 5.13c1.57 0 2.38-3.19 3.45-4.92 1.72-2.78 3.02-4.88 3.02-7.98C26.75 8.78 22.3 4.5 16 4.5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M16 10v7M12.5 13.5h7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MaintenancePage() {
  const { lang } = useI18n();
  const { settings } = useClinicSettingsState();
  const isEnglish = lang === 'en';
  const phoneHref = `tel:${settings.phone.replace(/[^+\d]/g, '')}`;

  return (
    <main className="maintenance-page relative isolate flex min-h-[100svh] overflow-hidden bg-bg px-5 py-5 text-text sm:px-8 sm:py-8 lg:items-center lg:py-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_8%,var(--color-accent-light),transparent_27%),radial-gradient(circle_at_94%_90%,var(--color-bg-alt),transparent_30%)]" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full border border-accent/20 sm:-left-16 sm:h-96 sm:w-96" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-16 bottom-8 h-48 w-48 rounded-full border border-primary/10 sm:h-72 sm:w-72" />

      <div className="maintenance-reveal relative mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between gap-4 pb-8 sm:pb-12">
          <div className="flex min-w-0 items-center gap-3 text-primary">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-surface shadow-[var(--shadow-card)]">
              <ClinicMark />
            </span>
            <span className="truncate text-sm font-bold tracking-[0.01em] sm:text-base">{settings.name}</span>
          </div>
          <span className="hidden rounded-full border border-border bg-surface-alt px-3 py-1.5 text-xs font-semibold text-text-muted sm:inline-flex">
            {isEnglish ? 'Patient care first' : 'Kenyamanan pasien utama'}
          </span>
        </header>

        <section className="overflow-hidden rounded-[2rem] border border-border/90 bg-surface shadow-[var(--shadow-floating)] lg:grid lg:grid-cols-[0.84fr_1.16fr]">
          <aside className="relative overflow-hidden bg-primary px-7 py-9 text-white sm:px-10 sm:py-12 lg:flex lg:min-h-[35rem] lg:flex-col lg:justify-between lg:px-12">
            <div aria-hidden="true" className="absolute -right-28 -top-24 h-72 w-72 rounded-full border border-white/15" />
            <div aria-hidden="true" className="absolute -bottom-20 left-12 h-56 w-56 rounded-full border border-white/10" />
            <div className="relative">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-bold uppercase tracking-[0.12em]">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {isEnglish ? 'Service update' : 'Pembaruan layanan'}
              </span>
              <h1 className="mt-8 max-w-sm font-heading text-4xl leading-[1.06] tracking-[-0.035em] text-white sm:text-5xl">
                {isEnglish ? 'A calmer, better visit is on its way.' : 'Pengalaman kunjungan yang lebih baik segera hadir.'}
              </h1>
            </div>
            <p className="relative mt-8 max-w-sm text-sm leading-7 text-white/72 lg:mt-0 lg:text-base">
              {isEnglish
                ? 'We are making a few thoughtful improvements to the clinic website.'
                : 'Kami sedang melakukan beberapa penyempurnaan untuk website klinik.'}
            </p>
          </aside>

          <div className="px-7 py-9 sm:px-10 sm:py-12 lg:flex lg:min-h-[35rem] lg:flex-col lg:justify-center lg:px-14">
            <div role="status" aria-live="polite" className="inline-flex w-fit items-center gap-2 rounded-full border border-accent/35 bg-accent-light px-3.5 py-2 text-xs font-bold uppercase tracking-[0.1em] text-accent-text">
              <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
              {isEnglish ? 'Temporarily unavailable' : 'Sementara tidak tersedia'}
            </div>
            <h2 className="mt-6 max-w-xl font-heading text-4xl leading-[1.08] text-text sm:text-5xl">
              {isEnglish ? 'We’ll be right back.' : 'Kami akan segera kembali.'}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-text-muted sm:text-lg sm:leading-8">
              {isEnglish
                ? 'Online booking is paused while we complete this update. Please reload in a little while, or contact the clinic directly if you need assistance today.'
                : 'Pemesanan online sedang dijeda selama pembaruan berlangsung. Silakan muat ulang beberapa saat lagi, atau hubungi klinik langsung bila Anda membutuhkan bantuan hari ini.'}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a className="btn-primary min-w-[12.5rem]" href={`https://wa.me/${settings.whatsappNumber}`}>
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M20 11.5a8 8 0 0 1-11.8 7L4 20l1.55-4.03A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
                  <path d="M9.2 8.35c.22-.5.4-.52.68-.52h.3c.2 0 .38.02.5.34l.64 1.54c.1.25.04.43-.04.55l-.33.4c-.11.12-.2.22-.08.43.11.2.5.83 1.1 1.34.74.65 1.37.85 1.57.94.2.1.32.08.45-.05l.56-.65c.14-.17.3-.14.5-.07l1.55.73c.24.1.4.15.46.24.06.1.06.58-.13 1.1-.18.5-1.05.96-1.45 1.01-.37.05-.84.08-1.35-.09a12.1 12.1 0 0 1-1.22-.45 9.7 9.7 0 0 1-3.72-3.3 4.2 4.2 0 0 1-.87-2.23c0-.66.34-.98.47-1.12Z" fill="currentColor" />
                </svg>
                {isEnglish ? 'Contact via WhatsApp' : 'Hubungi via WhatsApp'}
              </a>
              <a className="maintenance-secondary-link inline-flex min-h-12 items-center justify-center gap-2 rounded-btn border border-border bg-surface px-6 text-sm font-semibold text-primary transition-[background-color,border-color,transform] duration-150 [transition-timing-function:var(--ease-out)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:scale-[0.98] sm:text-[0.9375rem]" href={phoneHref}>
                <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                  <path d="M6.6 3.8 9.1 3c.56-.18 1.15.12 1.34.68l1.01 3.04c.16.48-.03 1-.46 1.26L9.53 8.86a12.3 12.3 0 0 0 5.6 5.6l.88-1.46c.26-.43.78-.62 1.26-.46l3.04 1.01c.56.19.86.78.68 1.34l-.8 2.5a1.7 1.7 0 0 1-1.62 1.19C10.7 18.58 4.42 12.3 4.42 4.42A1.7 1.7 0 0 1 5.6 2.8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {settings.phone}
              </a>
            </div>

            <div className="mt-9 border-t border-border pt-5 text-sm leading-6 text-text-subtle">
              {isEnglish ? 'Thank you for your patience.' : 'Terima kasih atas kesabaran Anda.'}
            </div>
          </div>
        </section>
        <p className="px-1 pt-6 text-center text-xs text-text-subtle sm:text-sm">
          © {new Date().getFullYear()} {settings.name}
        </p>
      </div>
    </main>
  );
}

function AppRoutes() {
  return (
    <Layout>
      <ScrollToTop />
      <ErrorBoundary>
        <Routes>
          {/* Indonesian Routes (Default, No Prefix) */}
          <Route path="/" element={<HomePage />} />
          <Route path="/layanan" element={<ServicesPage />} />
          <Route path="/layanan/:slug" element={<ServiceDetailPage />} />
          <Route path="/dokter" element={<DoctorsPage />} />
          <Route path="/dokter/:slug" element={<DoctorDetailPage />} />
          <Route path="/jadwal" element={<SchedulePage />} />
          <Route path="/hasil-kami" element={<GalleryPage />} />
          <Route path="/fasilitas" element={<FacilitiesPage />} />
          <Route path="/artikel" element={<ArticlesPage />} />
          <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
          <Route path="/testimoni" element={<TestimonialsPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/sukses/:code" element={<BookingSuccessPage />} />
          <Route path="/booking/kelola/:code" element={<ManageBookingPage />} />
          <Route path="/booking/kelola" element={<ManageBookingPage />} />

          {/* English Mirrored Routes (/en/...) */}
          <Route path="/en" element={<HomePage />} />
          <Route path="/en/layanan" element={<ServicesPage />} />
          <Route path="/en/services" element={<ServicesPage />} />
          <Route path="/en/layanan/:slug" element={<ServiceDetailPage />} />
          <Route path="/en/services/:slug" element={<ServiceDetailPage />} />
          <Route path="/en/dokter" element={<DoctorsPage />} />
          <Route path="/en/doctors" element={<DoctorsPage />} />
          <Route path="/en/dokter/:slug" element={<DoctorDetailPage />} />
          <Route path="/en/doctors/:slug" element={<DoctorDetailPage />} />
          <Route path="/en/jadwal" element={<SchedulePage />} />
          <Route path="/en/schedule" element={<SchedulePage />} />
          <Route path="/en/hasil-kami" element={<GalleryPage />} />
          <Route path="/en/results" element={<GalleryPage />} />
          <Route path="/en/fasilitas" element={<FacilitiesPage />} />
          <Route path="/en/facilities" element={<FacilitiesPage />} />
          <Route path="/en/artikel" element={<ArticlesPage />} />
          <Route path="/en/articles" element={<ArticlesPage />} />
          <Route path="/en/artikel/:slug" element={<ArticleDetailPage />} />
          <Route path="/en/articles/:slug" element={<ArticleDetailPage />} />
          <Route path="/en/testimoni" element={<TestimonialsPage />} />
          <Route path="/en/testimonials" element={<TestimonialsPage />} />
          <Route path="/en/kontak" element={<ContactPage />} />
          <Route path="/en/contact" element={<ContactPage />} />
          <Route path="/en/booking" element={<BookingPage />} />
          <Route path="/en/booking/sukses/:code" element={<BookingSuccessPage />} />
          <Route path="/en/booking/success/:code" element={<BookingSuccessPage />} />
          <Route path="/en/booking/kelola/:code" element={<ManageBookingPage />} />
          <Route path="/en/booking/kelola" element={<ManageBookingPage />} />
          <Route path="/en/booking/manage/:code" element={<ManageBookingPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

function PublicApp() {
  const { settings, isReady } = useClinicSettingsState();

  if (!isReady) return <LoadingFallback />;
  if (settings.maintenanceMode) return <MaintenancePage />;

  return <AppRoutes />;
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <I18nProvider>
          <ClinicSettingsProvider>
            <PublicApp />
          </ClinicSettingsProvider>
        </I18nProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
