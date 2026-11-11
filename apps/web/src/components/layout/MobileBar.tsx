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
      className="min-[800px]:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border px-3 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom,0.75rem))] shadow-[0_-8px_24px_rgba(0,0,0,0.06)]"
    >
      <div className="grid grid-cols-12 gap-2 max-w-md mx-auto items-center">
        {/* Telephone */}
        <a
          href={`tel:${(settings.phone || '+622172084500').replace(/[^0-9+]/g, '')}`}
          className="col-span-3 h-12 flex flex-col items-center justify-center text-center border border-border bg-bg-alt text-text hover:bg-border/60 transition-colors rounded-xl cursor-pointer text-[11px] font-semibold"
          aria-label={t.mobileBar.call}
        >
          <svg className="w-4 h-4 mb-0.5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{t.mobileBar.call}</span>
        </a>

        {/* WhatsApp */}
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="col-span-4 h-12 flex flex-col items-center justify-center text-center bg-accent text-white hover:bg-accent-hover transition-colors rounded-xl cursor-pointer text-[11px] font-semibold shadow-xs"
          aria-label={t.mobileBar.whatsapp}
        >
          <svg className="w-4 h-4 mb-0.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12.031 2C6.494 2 2 6.495 2 12.031c0 1.947.558 3.766 1.526 5.309L2 22l4.821-1.488a9.97 9.97 0 005.21 1.519h.005c5.536 0 10.03-4.494 10.03-10.03 0-2.678-1.042-5.196-2.936-7.09A9.957 9.957 0 0012.031 2zm5.82 14.364c-.242.684-1.22 1.309-1.748 1.391-.497.078-1.127.112-3.23-.762-2.69-1.116-4.42-3.864-4.555-4.045-.13-.18-1.085-1.446-1.085-2.758 0-1.312.689-1.956.933-2.222.245-.266.536-.333.715-.333.18 0 .36 0 .517.008.167.009.39-.063.61.464.226.541.77 1.882.837 2.02.068.138.113.3.023.48-.09.18-.135.292-.27.45-.135.158-.283.352-.405.473-.135.135-.276.282-.119.552.158.27.7 1.155 1.501 1.869 1.031.919 1.899 1.204 2.169 1.34.27.135.428.113.585-.068.158-.18.675-.788.855-1.058.18-.27.36-.226.61-.135.248.09 1.576.744 1.846.88.27.135.45.203.517.316.068.113.068.654-.174 1.338z" />
          </svg>
          <span>WhatsApp</span>
        </a>

        {/* Primary Booking */}
        <Link
          to={localePath('/booking')}
          className="col-span-5 h-12 flex items-center justify-center text-center bg-primary text-white hover:bg-primary-hover transition-colors rounded-xl cursor-pointer text-xs font-bold shadow-md px-3 gap-1.5"
          aria-label={t.mobileBar.book}
        >
          <span>{t.mobileBar.book}</span>
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </Link>
      </div>
    </aside>
  );
};
