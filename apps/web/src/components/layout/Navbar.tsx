import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const isBookingFlow = location.pathname.includes('/booking');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [drawerTop, setDrawerTop] = useState(88);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    const updateTop = () => {
      if (headerRef.current) {
        setDrawerTop(Math.max(0, Math.round(headerRef.current.getBoundingClientRect().bottom)));
      }
    };

    if (isMobileMenuOpen) {
      document.documentElement.style.overflow = 'hidden';
      updateTop();
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setIsMobileMenuOpen(false);
      };
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('resize', updateTop);
      window.addEventListener('scroll', updateTop, { passive: true });
      return () => {
        document.documentElement.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('resize', updateTop);
        window.removeEventListener('scroll', updateTop);
      };
    } else {
      document.documentElement.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: t.nav.services, path: '/layanan' },
    { label: t.nav.doctors, path: '/dokter' },
    { label: t.nav.results, path: '/hasil-kami' },
    { label: t.nav.articles, path: '/artikel' },
    { label: t.nav.manageBooking, path: '/booking/kelola' },
  ];

  const secondaryLinks = [
    { label: t.nav.facilities, path: '/fasilitas' },
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
      ref={headerRef}
      className={`sticky top-0 z-50 transition-[padding,background-color,border-color] duration-300 ease-out border-b ${
        isScrolled && !isMobileMenuOpen
          ? 'py-2.5 px-4 bg-surface/95 backdrop-blur-md border-border lg:py-2.5 lg:px-8 lg:bg-transparent lg:border-transparent'
          : 'py-2.5 px-4 sm:px-6 lg:py-3.5 lg:px-8 bg-surface/95 lg:bg-bg/85 backdrop-blur-md border-border'
      }`}
      role="navigation"
      aria-label="Navigasi Utama"
    >
      {/* Morphing Inner Container: full-width flush on mobile & when drawer is open; floating pill on desktop scroll */}
      <div
        className={`max-w-7xl mx-auto transition-[padding,background-color,border-color,box-shadow,border-radius] duration-300 ease-out border ${
          isScrolled && !isMobileMenuOpen
            ? 'rounded-none bg-transparent border-transparent shadow-none px-0 lg:rounded-2xl lg:bg-surface/95 lg:backdrop-blur-xl lg:border-border lg:shadow-soft lg:px-6'
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

            {!isBookingFlow && (
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
            )}

            {/* Mobile menu toggle button (WCAG Touch Target min 44x44px) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-11 h-11 text-text bg-surface hover:bg-bg-alt border border-border rounded-xl flex items-center justify-center cursor-pointer transition-transform active:scale-[0.96] shadow-2xs"
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

      {/* Mobile Right-Side Drawer Navigation (Below Header, Portaled to document.body) */}
      {isMobileMenuOpen &&
        createPortal(
          <div
            className="lg:hidden fixed inset-0 z-[45] flex justify-end"
            style={{ paddingTop: `${drawerTop}px` }}
          >
            {/* Backdrop covers full viewport behind z-50 header so floating pill has no unblurred gap */}
            <div
              className="fixed inset-0 bg-secondary/45 backdrop-blur-xs transition-opacity duration-200"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Right Drawer Surface */}
            <div
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Navigasi Menu Mobile"
              className="relative z-10 ml-auto h-full w-[min(86vw,340px)] bg-surface border-l border-border shadow-floating p-5 pb-[max(1.75rem,env(safe-area-inset-bottom,1.75rem))] overflow-y-auto animate-slide-left flex flex-col justify-between"
            >
              <div>
                <div className="pb-2.5 mb-3 border-b border-border/70">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
                    {lang === 'en' ? 'Menu' : 'Menu Utama'}
                  </span>
                </div>

            {/* Primary Nav Links - Vertical Stack with large tap targets */}
            <nav className="space-y-1.5 mb-5" aria-label="Navigasi Mobile">
              {navLinks.map((item) => {
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={localePath(item.path)}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full min-h-[48px] px-4 py-3 rounded-xl flex items-center justify-between text-sm font-semibold transition-all active:scale-[0.98] ${
                      active
                        ? 'bg-primary text-white shadow-soft font-bold'
                        : 'bg-bg-alt/60 text-secondary hover:bg-bg-alt'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      {active && <span className="w-2 h-2 rounded-full bg-accent inline-block" />}
                      <span>{item.label}</span>
                    </span>
                    <svg className={`w-4 h-4 ${active ? 'text-white/80' : 'text-text-muted'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
            </nav>

            {/* Secondary Links Grid */}
            <div className="pt-3 border-t border-border/70 mb-5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted block mb-2">
                {lang === 'en' ? 'Clinic & Information' : 'Informasi & Fasilitas'}
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {secondaryLinks.map((item) => {
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={localePath(item.path)}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`min-h-[44px] px-2 py-2.5 flex items-center justify-center text-center rounded-xl border transition-all active:scale-[0.98] font-medium ${
                        active
                          ? 'bg-primary text-white border-primary font-bold shadow-xs'
                          : 'bg-surface text-secondary border-border/80 hover:bg-bg-alt'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
            </div>

            {/* Bottom Actions: Emergency WhatsApp & Book CTA */}
            <div className="space-y-2.5 pt-2">
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsMobileMenuOpen(false)}
                className="btn-emergency w-full min-h-[48px] text-sm rounded-xl justify-center font-bold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span>{lang === 'en' ? 'Emergency WhatsApp Hotline' : 'Hotline Darurat Gigi 24 Jam'}</span>
              </a>
              {!isBookingFlow && (
                <Link
                  to={localePath('/booking')}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="btn-primary w-full min-h-[48px] text-sm rounded-xl justify-center font-bold shadow-soft"
                >
                  <span>{t.nav.bookNow}</span>
                  <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              )}
            </div>
          </div>
        </div>,
          document.body,
        )}
    </header>
  );
};
