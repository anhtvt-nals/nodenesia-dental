import React, { useEffect, useState } from 'react';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';

export const FloatingWhatsApp: React.FC = () => {
  const { lang, t } = useI18n();
  const settings = useClinicSettings();
  const [nearFooter, setNearFooter] = useState(false);

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
      aria-hidden={nearFooter}
      tabIndex={nearFooter ? -1 : 0}
      className={`fixed bottom-20 min-[800px]:bottom-6 right-4 min-[800px]:right-6 z-40 inline-flex items-center gap-2 bg-accent text-text font-body font-semibold text-sm px-4 py-3 rounded-[10px] border border-text/15 transition-opacity duration-200 cursor-pointer ${
        nearFooter ? 'opacity-0 pointer-events-none' : 'opacity-100 hover:opacity-90'
      }`}
    >
      <svg
        className="w-5 h-5 fill-current shrink-0"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12 0 2.625.846 5.059 2.284 7.033l-1.494 5.458 5.601-1.469c1.918 1.258 4.212 1.978 6.609 1.978 6.627 0 12-5.373 12-12s-5.373-12-12-12z" />
      </svg>
      <span>{lang === 'en' ? 'Ask via WhatsApp' : 'Tanya via WhatsApp'}</span>
    </a>
  );
};
