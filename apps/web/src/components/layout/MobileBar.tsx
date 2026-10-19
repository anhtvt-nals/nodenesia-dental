import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';

export const MobileBar: React.FC = () => {
  const { t, localePath } = useI18n();
  const settings = useClinicSettings();

  const waLink = buildWhatsAppLink(
    settings.whatsappNumber || '6281289001234',
    t.booking.waPrefillGeneral
  );

  return (
    <aside
      aria-label="Aksi Cepat Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg-card/95 backdrop-blur-md border-t border-border px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0.65rem))] shadow-[0_-4px_20px_rgba(0,102,204,0.08)]"
    >
      <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
        {/* Call Hotline */}
        <a
          href={`tel:${(settings.phone || '+622178901234').replace(/[^0-9+]/g, '')}`}
          className="h-12 flex flex-col items-center justify-center text-center border border-border bg-bg-alt text-text hover:border-primary hover:text-primary transition-colors rounded-xl cursor-pointer"
          aria-label={t.mobileBar.call}
        >
          <svg className="w-4 h-4 mb-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-body text-[11px] font-semibold leading-none">{t.mobileBar.call}</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 flex flex-col items-center justify-center text-center border border-border bg-bg-alt text-text hover:border-secondary hover:text-secondary transition-colors rounded-xl cursor-pointer"
          aria-label={t.mobileBar.whatsapp}
        >
          <svg className="w-4 h-4 mb-0.5 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="font-body text-[11px] font-semibold leading-none">{t.mobileBar.whatsapp}</span>
        </a>

        {/* Direct Booking */}
        <Link
          to={localePath('/booking')}
          className="h-12 flex flex-col items-center justify-center text-center bg-primary text-white hover:bg-primary-hover transition-colors shadow-xs rounded-xl cursor-pointer"
          aria-label={t.mobileBar.book}
        >
          <svg className="w-4 h-4 mb-0.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-body text-[11px] font-semibold tracking-wide leading-none">{t.mobileBar.book}</span>
        </Link>
      </div>
    </aside>
  );
};
