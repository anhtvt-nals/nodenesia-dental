import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useI18n } from '../../i18n';

export function BookingLoadingOverlay() {
  const { lang, t } = useI18n();
  const dialog = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previousFocus = document.activeElement;
    const root = document.getElementById('root');
    const wasInert = root?.inert ?? false;
    const overflow = document.body.style.overflow;
    if (root) root.inert = true;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => {
      if (root) root.inert = wasInert;
      document.body.style.overflow = overflow;
      if (previousFocus instanceof HTMLElement && previousFocus.isConnected) previousFocus.focus();
    };
  }, []);
  return createPortal(<div className="fixed inset-0 z-[100] flex items-center justify-center bg-secondary/35 backdrop-blur-sm px-5">
    <div ref={dialog} role="dialog" aria-modal="true" aria-labelledby="booking-loading-title" aria-describedby="booking-loading-description" tabIndex={-1} onKeyDown={(event) => { if (event.key === 'Tab') event.preventDefault(); }} className="w-full max-w-sm rounded-3xl border border-border bg-white p-8 text-center shadow-xl outline-none">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/8" aria-hidden="true"><svg className="h-8 w-8 animate-spin motion-reduce:animate-none text-primary" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.2"/><path d="M12 3a9 9 0 0 1 9 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg></div>
      <h2 id="booking-loading-title" className="font-heading text-2xl font-bold text-secondary" role="status">{t.booking.submitting}</h2>
      <p id="booking-loading-description" className="mt-3 text-sm text-text-muted leading-relaxed">{lang === 'en' ? 'Please wait while we save your appointment.' : 'Mohon tunggu sebentar, kami sedang menyimpan janji temu Anda.'}</p>
    </div>
  </div>, document.body);
}
