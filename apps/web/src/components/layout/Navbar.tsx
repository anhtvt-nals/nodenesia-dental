import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
import { BrandLogo } from '../common/BrandLogo';

export const Navbar: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: t.nav.services, path: '/layanan' },
    { label: t.nav.doctors, path: '/dokter' },
    { label: t.nav.schedule, path: '/jadwal' },
    { label: t.nav.prices, path: '/harga' },
    { label: t.nav.patient, path: '/pasien' },
    { label: t.nav.manageBooking, path: '/booking/kelola' },
  ];

  const secondaryLinks = [
    { label: t.nav.results, path: '/hasil-kami' },
    { label: t.nav.facilities, path: '/fasilitas' },
    { label: t.nav.articles, path: '/artikel' },
    { label: t.nav.contact, path: '/kontak' },
  ];

  const isActive = (path: string) => {
    const full = localePath(path);
    return location.pathname === full || location.pathname.startsWith(`${full}/`);
  };

  const emergencyWaLink = buildWhatsAppLink(
    settings.whatsappNumber || '6281289001234',
    lang === 'en'
      ? `Hello ${settings.name || 'Klinik Gigi Senyum Sehat'}, I need emergency dental assistance.`
      : `Halo ${settings.name || 'Klinik Gigi Senyum Sehat'}, saya memerlukan bantuan darurat sakit gigi.`
  );

  return (
    <header className="navbar-medical sticky top-0 z-50" role="navigation" aria-label="Navigasi Utama">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-18 py-3">
          {/* Zone 1: Brand icon + title + subtitle */}
          <Link
            to={localePath('/')}
            className="flex items-center shrink-0 cursor-pointer"
            aria-label={`${t.brandName} — ${t.tagline}`}
          >
            <BrandLogo title={t.brandName} className="h-10 w-auto font-heading" />
          </Link>

          {/* Zone 2: Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-5" aria-label="Menu Utama">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={localePath(item.path)}
                className={`text-xs xl:text-sm font-medium whitespace-nowrap rounded-lg px-1.5 xl:px-2 py-1.5 transition-colors cursor-pointer ${isActive(item.path)
                    ? 'text-primary font-semibold bg-primary/8'
                    : 'text-text-muted hover:text-primary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: LanguageSwitcher + Emergency Link + Primary CTA */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <LanguageSwitcher />

            <div className="hidden xl:block">
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-emergency text-sm py-2.5 px-4 min-h-[42px]"
                aria-label={lang === 'en' ? 'Emergency dental WhatsApp hotline' : 'Hotline darurat sakit gigi via WhatsApp'}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{lang === 'en' ? 'Emergency' : 'Darurat'}</span>
              </a>
            </div>

            <div className="hidden sm:block">
              <Link
                to={localePath('/booking')}
                className="btn-primary text-sm py-2.5 px-5 min-h-[42px] whitespace-nowrap"
              >
                {t.nav.bookNow}
              </Link>
            </div>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[44px] min-w-[44px] text-text bg-bg-alt hover:bg-border/60 border border-border rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden bg-bg-card border-b border-border px-4 py-5 space-y-4 shadow-lg"
        >
          <div className="grid grid-cols-2 gap-2.5 text-sm">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={localePath(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 min-h-[48px] flex items-center justify-center text-center rounded-xl border font-semibold transition-colors cursor-pointer ${isActive(item.path)
                    ? 'bg-primary text-white border-primary'
                    : 'bg-bg-alt text-text border-border hover:border-primary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-xs font-medium text-text-muted mb-2.5">
              {lang === 'en' ? 'More pages' : 'Halaman lainnya'}
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.path}
                  to={localePath(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 min-h-[44px] flex items-center justify-center text-center rounded-[10px] bg-bg-alt text-text font-medium hover:text-primary border border-border transition-colors cursor-pointer"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={emergencyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-emergency w-full text-sm"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{lang === 'en' ? 'Emergency Hotline' : 'Darurat Sakit Gigi'}</span>
            </a>
            <Link
              to={localePath('/booking')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary w-full text-sm"
            >
              <span>{t.nav.bookNow}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
