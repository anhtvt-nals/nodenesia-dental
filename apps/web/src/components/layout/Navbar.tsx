import React, { useState, useEffect } from 'react';
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: t.nav.services, path: '/layanan' },
    { label: t.nav.doctors, path: '/dokter' },
    { label: t.nav.schedule, path: '/jadwal' },
    { label: t.nav.results, path: '/hasil-kami' },
    { label: t.nav.manageBooking, path: '/booking/kelola' },
  ];

  const secondaryLinks = [
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
    <header
      className={`sticky top-0 z-50 transition-[padding,background-color,border-color] duration-300 ease-out border-b ${
        isScrolled
          ? 'py-2 sm:py-2.5 px-3 sm:px-6 lg:px-8 bg-transparent border-transparent'
          : 'py-3.5 px-4 sm:px-6 lg:px-8 bg-bg/85 backdrop-blur-md border-border'
      }`}
      role="navigation"
      aria-label="Navigasi Utama"
    >
      {/* Morphing Inner Container: unfolds at top, morphs smoothly to floating pill when scrolled */}
      <div
        className={`max-w-7xl mx-auto transition-[padding,background-color,border-color,box-shadow,border-radius] duration-300 ease-out border ${
          isScrolled
            ? 'rounded-2xl bg-surface/95 backdrop-blur-xl border-border shadow-soft px-4 sm:px-6'
            : 'rounded-none bg-transparent border-transparent shadow-none px-0'
        }`}
      >
        <div className="flex items-center justify-between gap-3 sm:gap-6 h-16">
          {/* Brand Logo & Name */}
          <Link
            to={localePath('/')}
            className="flex items-center shrink-0 cursor-pointer group"
            aria-label={`${t.brandName} — ${t.tagline}`}
          >
            <BrandLogo title={t.brandName} className="h-9 w-auto font-heading transition-transform group-hover:scale-[1.02]" />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2" aria-label="Menu Utama">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={localePath(item.path)}
                  className={`text-xs xl:text-sm rounded-xl px-3.5 py-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                    active
                      ? 'text-white bg-primary shadow-soft font-bold ring-1 ring-primary/20'
                      : 'text-text-muted hover:text-secondary hover:bg-bg-alt/80 font-medium'
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block animate-pulse" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Action Tools: Language, WhatsApp Emergency, CTA */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            <LanguageSwitcher />

            <div className="hidden xl:block">
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-emergency text-xs xl:text-sm py-2 px-3.5 min-h-[40px] rounded-xl hover:border-accent hover:text-accent-text"
                aria-label={lang === 'en' ? 'Emergency dental WhatsApp hotline' : 'Hotline darurat sakit gigi via WhatsApp'}
              >
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>{lang === 'en' ? 'Emergency Line' : 'Darurat 24 Jam'}</span>
              </a>
            </div>

            <div className="hidden sm:block">
              <Link
                to={localePath('/booking')}
                className="btn-primary text-xs sm:text-sm py-2.5 px-5 min-h-[42px] rounded-xl shadow-xs"
              >
                <span>{t.nav.bookNow}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            {/* Mobile menu toggle button */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2.5 min-h-[42px] min-w-[42px] text-text bg-bg-alt/80 hover:bg-border/60 border border-border rounded-xl flex items-center justify-center cursor-pointer transition-colors"
              aria-label={isMobileMenuOpen ? 'Tutup navigasi' : 'Buka navigasi'}
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden max-w-7xl mx-auto mt-2 bg-surface rounded-2xl border border-border p-4 space-y-4 shadow-floating"
        >
          <div className="grid grid-cols-2 gap-2 text-sm">
            {navLinks.map((item) => {
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={localePath(item.path)}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`p-3 min-h-[48px] flex items-center justify-center gap-2 text-center rounded-xl border transition-all cursor-pointer ${
                    active
                      ? 'bg-primary text-white border-primary shadow-soft font-bold'
                      : 'bg-bg-alt/70 text-text border-border hover:border-primary/40 font-medium'
                  }`}
                >
                  {active && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="pt-3 border-t border-border">
            <div className="text-xs font-semibold text-text-muted mb-2">
              {lang === 'en' ? 'Clinic & Information' : 'Informasi Klinik'}
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              {secondaryLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={localePath(item.path)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-2.5 py-2.5 min-h-[42px] flex items-center justify-center gap-1.5 text-center rounded-xl border transition-colors cursor-pointer ${
                      active
                        ? 'bg-primary text-white border-primary font-bold shadow-xs'
                        : 'bg-bg-alt text-text font-medium hover:text-primary border-border'
                    }`}
                  >
                    {active && <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <a
              href={emergencyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-emergency w-full text-sm rounded-xl"
            >
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>{lang === 'en' ? 'Emergency WhatsApp' : 'Darurat Sakit Gigi'}</span>
            </a>
            <Link
              to={localePath('/booking')}
              onClick={() => setIsMobileMenuOpen(false)}
              className="btn-primary w-full text-sm rounded-xl"
            >
              <span>{t.nav.bookNow}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
