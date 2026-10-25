import React from 'react';
import { Link } from 'react-router-dom';
import { Service } from '../../types';
import { formatRupiah } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface ServiceCardProps {
  service: Service;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { lang, t, localePath } = useI18n();
  const serviceName = lang === 'en' ? service.nameEn : service.name;
  const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
  const categoryLabel = t.services.categories[service.category];

  return (
    <article className="py-6 border-b border-border flex flex-col justify-between h-full">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 text-base text-text-muted mb-2">
          <span className="font-medium">{categoryLabel}</span>
          <span>
            {service.durationMinutes} {t.common.minutes}
          </span>
        </div>

        <h3 className="font-heading text-xl font-bold text-text mb-2">
          <Link to={localePath(`/layanan/${service.slug}`)} className="hover:text-primary transition-colors">
            {serviceName}
          </Link>
        </h3>
        <p className="text-base text-text-muted leading-relaxed mb-5">
          {shortDesc}
        </p>
      </div>

      <div className="pt-4 border-t border-border/60 flex items-center justify-between gap-4">
        <div>
          <span className="text-base text-text-muted block">
            {t.services.startingFrom}
          </span>
          <span className="font-heading text-lg font-bold text-text tabular-nums">
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
    </article>
  );
};
