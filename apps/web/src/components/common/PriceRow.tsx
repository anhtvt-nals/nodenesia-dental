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
    <div className="py-5 border-b border-border rounded-none grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-baseline">
      <div className="md:col-span-4">
        <Link
          to={localePath(`/layanan/${service.slug}`)}
          className="font-heading text-lg font-bold text-text hover:text-primary transition-colors"
        >
          {serviceName}
        </Link>
        {showCategory && (
          <span className="block text-xs text-text-muted mt-0.5">
            {t.services.categories[service.category]} · {service.durationMinutes} {t.common.minutes}
          </span>
        )}
      </div>

      <div className="md:col-span-4 text-sm text-text-muted">
        <p>{shortDesc}</p>
        {priceNote && <p className="text-xs mt-1">{priceNote}</p>}
      </div>

      <div className="md:col-span-2 md:text-right">
        <span className="text-xs text-text-muted block">{t.services.startingFrom}</span>
        <span className="font-heading font-bold text-base text-text tabular-nums">
          {formatRupiah(service.priceFrom, lang === 'en')}
        </span>
      </div>

      <div className="md:col-span-2 flex items-center md:justify-end gap-4 text-sm font-semibold">
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
  );
};
