import React, { useEffect, Component, ReactNode, ErrorInfo } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { I18nProvider } from './i18n';
import { ClinicSettingsProvider } from './lib/clinic-settings';
import { Layout } from './components/layout/Layout';

import { HomePage } from './pages/HomePage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { SchedulePage } from './pages/SchedulePage';
import { PricesPage } from './pages/PricesPage';
import { GalleryPage } from './pages/GalleryPage';
import { FacilitiesPage } from './pages/FacilitiesPage';
import { PatientGuidePage } from './pages/PatientGuidePage';
import { ArticlesPage } from './pages/ArticlesPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';
import { TestimonialsPage } from './pages/TestimonialsPage';
import { ContactPage } from './pages/ContactPage';
import { BookingPage } from './pages/BookingPage';
import { BookingSuccessPage } from './pages/BookingSuccessPage';
import { ManageBookingPage } from './pages/ManageBookingPage';
import { LegalPage } from './pages/LegalPage';
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
          <Route path="/harga" element={<PricesPage />} />
          <Route path="/hasil-kami" element={<GalleryPage />} />
          <Route path="/fasilitas" element={<FacilitiesPage />} />
          <Route path="/pasien" element={<PatientGuidePage />} />
          <Route path="/artikel" element={<ArticlesPage />} />
          <Route path="/artikel/:slug" element={<ArticleDetailPage />} />
          <Route path="/testimoni" element={<TestimonialsPage />} />
          <Route path="/kontak" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/sukses/:code" element={<BookingSuccessPage />} />
          <Route path="/booking/kelola/:code" element={<ManageBookingPage />} />
          <Route path="/booking/kelola" element={<ManageBookingPage />} />
          <Route path="/privacy" element={<LegalPage />} />
          <Route path="/terms" element={<LegalPage />} />

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
          <Route path="/en/harga" element={<PricesPage />} />
          <Route path="/en/prices" element={<PricesPage />} />
          <Route path="/en/hasil-kami" element={<GalleryPage />} />
          <Route path="/en/results" element={<GalleryPage />} />
          <Route path="/en/fasilitas" element={<FacilitiesPage />} />
          <Route path="/en/facilities" element={<FacilitiesPage />} />
          <Route path="/en/pasien" element={<PatientGuidePage />} />
          <Route path="/en/patient" element={<PatientGuidePage />} />
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
          <Route path="/en/privacy" element={<LegalPage />} />
          <Route path="/en/terms" element={<LegalPage />} />

          {/* Catch-all 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </ErrorBoundary>
    </Layout>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <I18nProvider>
          <ClinicSettingsProvider>
            <AppRoutes />
          </ClinicSettingsProvider>
        </I18nProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}
