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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#14201C]/60 p-0 sm:p-4 transition-opacity animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-lg bg-[#F4F1EA] hairline-border shadow-2xl p-6 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 mb-4 pb-3 hairline-b">
          <div>
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36]">
              {t.prices.activeZone}
            </span>
            <h3 id="price-sheet-title" className="font-serif text-2xl text-[#14201C]">
              {zoneNames[zone]}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-xs font-mono text-[#14201C]/60 hover:text-[#14201C] underline"
            aria-label="Tutup panel biaya"
          >
            ✕ Tutup
          </button>
        </div>

        <div className="space-y-4">
          {matchingServices.map((service) => {
            const serviceName = lang === 'en' ? service.nameEn : service.name;
            const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
            const priceNote = lang === 'en' ? service.priceNoteEn : service.priceNote;

            return (
              <div key={service.id} className="p-4 bg-[#E9E4D8]/50 hairline-border">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h4 className="font-serif text-lg text-[#14201C]">
                    {serviceName}
                  </h4>
                  <span className="font-mono text-xs font-medium text-[#1F3D36] whitespace-nowrap">
                    {formatRupiah(service.priceFrom, lang === 'en')}
                  </span>
                </div>
                <p className="text-xs text-[#14201C]/75 mb-3 leading-relaxed">
                  {shortDesc}
                </p>
                {priceNote && (
                  <div className="text-[11px] font-mono text-[#14201C]/60 mb-3">
                    {priceNote}
                  </div>
                )}
                <div className="flex items-center gap-2 pt-2 hairline-t">
                  <Link
                    to={localePath(`/layanan/${service.slug}`)}
                    className="text-xs font-mono text-[#14201C]/70 hover:text-[#14201C] underline underline-offset-4 flex-1"
                    onClick={onClose}
                  >
                    {t.common.moreDetail}
                  </Link>
                  <Link
                    to={localePath(`/booking?layanan=${service.slug}`)}
                    className="px-3 py-1.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] transition-colors whitespace-nowrap"
                    onClick={onClose}
                  >
                    {t.common.bookNow}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 hairline-t flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono hairline-border bg-[#E9E4D8] text-[#14201C] hover:bg-[#DDD7C9]"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
