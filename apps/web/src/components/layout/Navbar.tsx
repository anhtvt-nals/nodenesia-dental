import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { LanguageSwitcher } from '../common/LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t, localePath } = useI18n();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 4-5 concise navigation links
  const navLinks = [
    { label: t.nav.services, path: '/layanan' },
    { label: t.nav.doctors, path: '/dokter' },
    { label: t.nav.schedule, path: '/jadwal' },
    { label: t.nav.prices, path: '/harga' },
    { label: t.nav.patient, path: '/pasien' },
  ];

  // Secondary nav links for drawer / more
  const secondaryLinks = [
    { label: t.nav.results, path: '/hasil-kami' },
    { label: t.nav.facilities, path: '/fasilitas' },
    { label: t.nav.articles, path: '/artikel' },
    { label: t.nav.contact, path: '/kontak' },
    { label: t.nav.manageBooking, path: '/booking/kelola/BK-8821' },
  ];

  const isActive = (path: string) => {
    const full = localePath(path);
    return location.pathname === full || location.pathname.startsWith(`${full}/`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F4F1EA]/95 backdrop-blur-sm hairline-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 sm:gap-6 lg:gap-8 h-16 sm:h-18">
          {/* Zone 1: Brand title wordmark, responsive font size & overflow handling */}
          <Link
            to={localePath('/')}
            className="font-serif text-xl sm:text-2xl md:text-3xl text-[#14201C] tracking-tight truncate max-w-[190px] xs:max-w-[280px] sm:max-w-none shrink-0 hover:text-[#1F3D36] transition-colors"
          >
            {t.brandName}
          </Link>

          {/* Zone 2: 4-5 concise single-line text links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-sans text-[#14201C]/80" aria-label="Navigasi Utama">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={localePath(item.path)}
                className={`whitespace-nowrap shrink-0 transition-colors py-1 ${
                  isActive(item.path)
                    ? 'text-[#1F3D36] font-semibold border-b border-[#1F3D36]'
                    : 'hover:text-[#14201C]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: LanguageSwitcher + Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            <Link
              to={localePath('/booking')}
              className="hidden sm:inline-flex items-center justify-center px-4 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors whitespace-nowrap shrink-0 shadow-xs"
            >
              {t.nav.bookNow}
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden px-2.5 py-1.5 min-h-[38px] text-[#14201C] hover:bg-[#E9E4D8] hairline-border flex items-center gap-1.5 active:bg-[#DDD7C9]"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={isMobileMenuOpen}
            >
              <span className="font-mono text-xs font-medium">{isMobileMenuOpen ? '✕ TUTUP' : '☰ MENU'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#F4F1EA] hairline-b px-4 py-5 space-y-4 animate-in slide-in-from-top-2 duration-150 shadow-md">
          <div className="grid grid-cols-2 gap-2.5 text-sm font-sans">
            {navLinks.map((item) => (
              <Link
                key={item.path}
                to={localePath(item.path)}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`p-3 min-h-[46px] flex items-center justify-center text-center hairline-border font-medium transition-colors ${
                  isActive(item.path)
                    ? 'bg-[#1F3D36] text-[#F4F1EA]'
                    : 'bg-[#E9E4D8]/60 text-[#14201C] active:bg-[#DDD7C9]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="pt-3 hairline-t">
            <div className="text-xs font-mono uppercase text-[#14201C]/50 mb-2">Menu Lainnya</div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
              {secondaryLinks.map((item) => (
                <Link
                  key={item.path}
                  to={localePath(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-2.5 py-2 min-h-[38px] flex items-center justify-center text-center bg-[#E9E4D8]/60 text-[#14201C] hover:bg-[#DDD7C9] active:bg-[#DDD7C9]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Link
              to={localePath('/booking')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full min-h-[46px] flex items-center justify-center text-center py-3 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider font-semibold shadow-xs"
            >
              {t.nav.bookNow} →
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
