import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import { formatRupiah } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface PriceRowProps {
  service: Service;
  index?: number;
  showCategory?: boolean;
}

export const PriceRow: React.FC<PriceRowProps> = ({ service, index, showCategory = false }) => {
  const { lang, t, localePath } = useI18n();
  const serviceName = lang === 'en' ? service.nameEn : service.name;
  const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
  const priceNote = lang === 'en' ? service.priceNoteEn : service.priceNote;

  const displayIndex = index !== undefined ? String(index + 1).padStart(2, '0') : null;

  return (
    <div className="group py-5 hairline-b flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-[#E9E4D8]/30 px-3 -mx-3">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {displayIndex && (
          <span className="font-mono text-xs text-[#14201C]/40 pt-1 shrink-0">
            {displayIndex}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <Link
              to={localePath(`/layanan/${service.slug}`)}
              className="font-serif text-xl md:text-2xl text-[#14201C] hover:text-[#1F3D36] transition-colors"
            >
              {serviceName}
            </Link>
            {showCategory && (
              <span className="text-xs font-mono text-[#14201C]/50">
                · {t.services.categories[service.category]}
              </span>
            )}
          </div>
          <p className="text-sm text-[#14201C]/70 mt-1 max-w-2xl line-clamp-2">
            {shortDesc}
          </p>
          <div className="flex items-center gap-3 mt-2 text-xs font-mono text-[#14201C]/60">
            <span>{service.durationMinutes} {t.common.minutes}</span>
            <span>·</span>
            <span>{priceNote || `${t.services.startingFrom} ${formatRupiah(service.priceFrom, lang === 'en')}`}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0">
        <Link
          to={localePath(`/layanan/${service.slug}`)}
          className="text-xs font-mono uppercase tracking-wider text-[#14201C]/70 hover:text-[#14201C] underline underline-offset-4 py-2"
        >
          {t.common.moreDetail}
        </Link>
        <Link
          to={localePath(`/booking?layanan=${service.slug}`)}
          className="px-4 py-2 min-h-[38px] flex items-center justify-center bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] active:bg-[#162B26] transition-colors whitespace-nowrap shadow-xs"
        >
          {t.common.bookNow} →
        </Link>
      </div>
    </div>
  );
};
