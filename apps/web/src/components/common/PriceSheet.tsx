import React from 'react';
import { Link } from 'react-router-dom';
import { Service, ToothZone } from '../../types';
import { formatRupiah } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface PriceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  zone: ToothZone | null;
  services: Service[];
}

export const PriceSheet: React.FC<PriceSheetProps> = ({
  isOpen,
  onClose,
  zone,
  services,
}) => {
  const { lang, t, localePath } = useI18n();

  if (!isOpen || !zone) return null;

  const zoneNames: Record<ToothZone, string> = {
    front: t.prices.frontZone,
    molar: t.prices.molarZone,
    gum: t.prices.gumZone,
    arch: t.prices.archZone,
  };

  const matchingServices = services.filter((s) => s.zone === zone);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="price-sheet-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-text/60 backdrop-blur-xs p-0 sm:p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-bg-card border border-border rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-5 pb-4 border-b border-border">
          <div>
            <div className="badge badge-primary mb-2 py-1 px-3 text-xs">
              <span>{t.prices.activeZone}</span>
            </div>
            <h3 id="price-sheet-title" className="font-heading text-xl sm:text-2xl font-bold text-text">
              {zoneNames[zone]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-bg-alt text-text-muted hover:text-text border border-border cursor-pointer transition-colors"
            aria-label="Tutup panel biaya"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3.5">
          {matchingServices.map((service) => {
            const serviceName = lang === 'en' ? service.nameEn : service.name;
            const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
            const priceNote = lang === 'en' ? service.priceNoteEn : service.priceNote;

            return (
              <div key={service.id} className="p-4 bg-bg-alt/70 border border-border rounded-xl">
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <h4 className="font-heading text-base font-bold text-text">
                    {serviceName}
                  </h4>
                  <span className="font-heading text-sm font-bold text-primary whitespace-nowrap">
                    {formatRupiah(service.priceFrom, lang === 'en')}
                  </span>
                </div>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">
                  {shortDesc}
                </p>
                {priceNote && (
                  <div className="text-xs text-text-muted font-medium mb-3">
                    {priceNote}
                  </div>
                )}
                <div className="flex items-center justify-between gap-3 pt-3 border-t border-border">
                  <Link
                    to={localePath(`/layanan/${service.slug}`)}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    onClick={onClose}
                  >
                    <span>{t.common.moreDetail}</span>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to={localePath(`/booking?layanan=${service.slug}`)}
                    className="btn-primary text-xs py-2 px-4 min-h-[38px]"
                    onClick={onClose}
                  >
                    {t.common.bookNow}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-border flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-sm py-2.5 px-5 min-h-[42px]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
