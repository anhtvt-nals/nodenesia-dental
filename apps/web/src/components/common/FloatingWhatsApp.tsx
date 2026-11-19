import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';

export const FloatingWhatsApp: React.FC = () => {
  const { lang, t } = useI18n();
  const location = useLocation();
  const settings = useClinicSettings();

  const isHome = location.pathname === '/' || location.pathname === '/en' || location.pathname === '';
  const [scrolledPastHero, setScrolledPastHero] = useState(!isHome);
  const [nearFooter, setNearFooter] = useState(false);

  // Check if scrolled past Hero on homepage
  useEffect(() => {
    if (!isHome) {
      setScrolledPastHero(true);
      return;
    }

    const checkHeroScroll = () => {
      const hero = document.querySelector('section.hero-pattern');
      if (hero) {
        const rect = hero.getBoundingClientRect();
        // Visible once the user scrolls past the hero section
        setScrolledPastHero(rect.bottom <= 100);
      } else {
        setScrolledPastHero(window.scrollY > 450);
      }
    };

    checkHeroScroll();
    window.addEventListener('scroll', checkHeroScroll, { passive: true });
    return () => window.removeEventListener('scroll', checkHeroScroll);
  }, [isHome, location.pathname]);

  // Hide button when near footer to avoid overlapping footer CTAs
  useEffect(() => {
    const footer = document.querySelector('footer[role="contentinfo"]');
    if (!footer || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setNearFooter(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  const isVisible = (!isHome || scrolledPastHero) && !nearFooter;

  const waLink = buildWhatsAppLink(
    settings.whatsappNumber || '6281289001234',
    t.booking.waPrefillGeneral
  );

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={lang === 'en' ? 'Ask via WhatsApp' : 'Tanya via WhatsApp'}
      aria-hidden={!isVisible}
      tabIndex={isVisible ? 0 : -1}
      className={`hidden min-[800px]:inline-flex fixed bottom-6 right-6 z-40 items-center gap-2.5 bg-secondary text-surface font-body font-semibold text-xs sm:text-sm px-4 py-3 rounded-2xl border border-surface/20 shadow-floating cursor-pointer transition-all duration-300 ease-out hover:bg-primary hover:scale-[1.03] active:scale-[0.98] ${
        isVisible
          ? 'opacity-100 translate-y-0 pointer-events-auto'
          : 'opacity-0 translate-y-4 pointer-events-none'
      }`}
    >
      {/* Official WhatsApp Icon with high contrast and no clipping */}
      <span className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs">
        <svg
          className="w-3.5 h-3.5 fill-current"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      </span>
      <span className="text-surface font-semibold tracking-wide">
        {lang === 'en' ? 'Ask via WhatsApp' : 'Tanya via WhatsApp'}
      </span>
    </a>
  );
};
