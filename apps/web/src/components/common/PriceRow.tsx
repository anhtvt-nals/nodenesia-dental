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

      <div className="md:text-right flex flex-wrap md:justify-end items-baseline gap-x-5 gap-y-2 whitespace-nowrap">
        <div>
          <span className="text-base text-text-muted mr-1.5">{t.services.startingFrom}</span>
          <span className="font-heading font-bold text-lg text-text tabular-nums">
            {formatRupiah(service.priceFrom, lang === 'en')}
          </span>
        </div>

        <div className="flex items-center gap-4 text-base font-semibold">
          <Link
            to={localePath(`/layanan/${service.slug}`)}
            className="text-text-muted hover:text-primary underline underline-offset-4"
          >
            {t.common.moreDetail}
          </Link>
          <Link
            to={localePath(`/booking?layanan=${service.slug}`)}
            className="text-primary hover:underline underline-offset-4"
          >
            {t.common.bookNow}
          </Link>
        </div>
      </div>
    </div>
  );
};
