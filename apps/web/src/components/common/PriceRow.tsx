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

export const PriceRow: React.FC<PriceRowProps> = ({ service, showCategory = false }) => {
  const { lang, t, localePath } = useI18n();
  const serviceName = lang === 'en' ? service.nameEn : service.name;
  const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
  const priceNote = lang === 'en' ? service.priceNoteEn : service.priceNote;

  return (
    <div className="py-5 border-b border-border rounded-none grid grid-cols-1 md:grid-cols-[1fr_1.6fr_auto] gap-3 md:gap-8 items-baseline">
      <div>
        <Link
          to={localePath(`/layanan/${service.slug}`)}
          className="font-heading text-lg font-bold text-text hover:text-primary transition-colors"
        >
          {serviceName}
        </Link>
        {showCategory && (
          <span className="block text-base text-text-muted mt-0.5">
            {t.services.categories[service.category]} · {service.durationMinutes} {t.common.minutes}
          </span>
        )}
      </div>

      <div className="text-base text-text-muted leading-relaxed">
        <p>{shortDesc}</p>
        {priceNote && <p className="text-base mt-1">{priceNote}</p>}
      </div>

      <div className="md:text-right flex flex-wrap md:justify-end items-center gap-x-5 gap-y-3">
        <div>
          <span className="text-xs sm:text-sm text-text-muted mr-1.5">{t.services.startingFrom}</span>
          <span className="font-heading font-bold text-base sm:text-lg text-primary tabular-nums">
            {formatRupiah(service.priceFrom, lang === 'en')}
          </span>
        </div>

        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold w-full sm:w-auto">
          <Link
            to={localePath(`/layanan/${service.slug}`)}
            className="px-3.5 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl border border-border bg-surface text-secondary hover:bg-bg-alt hover:text-primary transition-colors active:scale-95"
          >
            {t.common.moreDetail}
          </Link>
          <Link
            to={localePath(`/booking?layanan=${service.slug}`)}
            className="btn-primary px-4 py-2 min-h-[44px] inline-flex items-center justify-center rounded-xl text-xs sm:text-sm font-semibold active:scale-95"
          >
            {t.common.bookNow}
          </Link>
        </div>
      </div>
    </div>
  );
};
