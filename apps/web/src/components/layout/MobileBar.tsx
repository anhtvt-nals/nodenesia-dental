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
      className="min-[800px]:hidden fixed bottom-0 left-0 right-0 z-40 bg-bg border-t border-border px-3 pt-2.5 pb-[max(0.65rem,env(safe-area-inset-bottom,0.65rem))]"
    >
      <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
        <a
          href={`tel:${(settings.phone || '+622172084500').replace(/[^0-9+]/g, '')}`}
          className="h-11 flex items-center justify-center text-center border border-border bg-bg text-text hover:bg-bg-alt transition-colors rounded-[10px] cursor-pointer text-xs font-semibold px-2 whitespace-nowrap"
          aria-label={t.mobileBar.call}
        >
          {t.mobileBar.call}
        </a>

        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="h-11 flex items-center justify-center text-center bg-accent text-text hover:opacity-90 transition-opacity rounded-[10px] cursor-pointer text-xs font-semibold px-2 whitespace-nowrap"
          aria-label={t.mobileBar.whatsapp}
        >
          {t.mobileBar.whatsapp}
        </a>

        <Link
          to={localePath('/booking')}
          className="h-11 flex items-center justify-center text-center bg-primary text-bg hover:bg-primary-hover transition-colors rounded-[10px] cursor-pointer text-xs font-semibold px-2 whitespace-nowrap"
          aria-label={t.mobileBar.book}
        >
          {t.mobileBar.book}
        </Link>
      </div>
    </aside>
  );
};
