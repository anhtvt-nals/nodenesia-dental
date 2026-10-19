import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';

export const MobileBar: React.FC = () => {
  const { t, localePath } = useI18n();
  const settings = useClinicSettings();

  const waLink = buildWhatsAppLink(
    settings.whatsappNumber,
    t.booking.waPrefillGeneral
  );

  return (
    <aside
      aria-label="Aksi Cepat Mobile"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#F4F1EA]/95 backdrop-blur-md hairline-t px-3 pt-2 pb-[max(0.6rem,env(safe-area-inset-bottom,0.6rem))] shadow-[0_-4px_16px_rgba(20,32,28,0.08)]"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        {/* Call Hotline */}
        <a
          href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
          className="h-12 flex flex-col items-center justify-center text-center hairline-border bg-[#E9E4D8]/80 text-[#14201C] hover:bg-[#DDD7C9] active:scale-[0.98] transition-all rounded-xs"
          aria-label={t.mobileBar.call}
        >
          <svg className="w-4 h-4 mb-0.5 text-[#14201C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="font-sans text-[11px] font-medium leading-none">{t.mobileBar.call}</span>
        </a>

        {/* WhatsApp Chat */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-12 flex flex-col items-center justify-center text-center hairline-border bg-[#E9E4D8]/80 text-[#14201C] hover:bg-[#DDD7C9] active:scale-[0.98] transition-all rounded-xs"
          aria-label={t.mobileBar.whatsapp}
        >
          <svg className="w-4 h-4 mb-0.5 text-[#1F3D36]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.974.53 1.815.819 2.795.82h.005c3.181 0 5.767-2.587 5.768-5.766.001-3.181-2.586-5.767-5.772-5.767zm7.687 5.767c0 4.24-3.447 7.688-7.687 7.688-1.321 0-2.588-.344-3.704-.949l-4.108 1.077 1.096-4.008c-.689-1.184-1.054-2.533-1.054-3.808 0-4.24 3.447-7.688 7.687-7.688 4.242 0 7.77 3.448 7.77 7.688z"/>
          </svg>
          <span className="font-sans text-[11px] font-medium leading-none">{t.mobileBar.whatsapp}</span>
        </a>

        {/* Direct Booking */}
        <Link
          to={localePath('/booking')}
          className="h-12 flex flex-col items-center justify-center text-center bg-[#1F3D36] text-[#F4F1EA] hover:bg-[#162B26] active:scale-[0.98] transition-all shadow-xs rounded-xs"
          aria-label={t.mobileBar.book}
        >
          <svg className="w-4 h-4 mb-0.5 text-[#F4F1EA]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-sans text-[11px] font-semibold tracking-wide leading-none">{t.mobileBar.book}</span>
        </Link>
      </div>
    </aside>
  );
};
