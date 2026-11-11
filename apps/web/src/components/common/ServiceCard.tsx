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
  const categoryLabel = t.services.categories[service.category] || service.category;

  return (
    <article className="group bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card hover:shadow-hover hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top content */}
      <div className="flex-1 flex flex-col">
        {/* Category tag + Duration */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            {categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs text-text-muted font-medium bg-bg-alt px-2.5 py-1 rounded-md">
            <svg className="w-3.5 h-3.5 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            <span>{service.durationMinutes} {t.common.minutes}</span>
          </span>
        </div>

        {/* Title */}
        <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-snug mb-2.5">
          <Link to={localePath(`/layanan/${service.slug}`)} className="focus:outline-none">
            {serviceName}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3 mb-5">
          {shortDesc}
        </p>
      </div>

      {/* Price & Single CTA Footer */}
      <div className="pt-4 mt-auto border-t border-border flex flex-col gap-3.5">
        {/* Price row */}
        <div className="flex items-baseline justify-between gap-2 whitespace-nowrap overflow-hidden">
          <span className="text-xs text-text-muted font-medium shrink-0">
            {t.services.startingFrom}
          </span>
          <span className="font-heading font-bold text-base sm:text-lg text-primary tabular-nums tracking-tight whitespace-nowrap">
            {formatRupiah(service.priceFrom, lang === 'en')}
            {service.priceTo && (
              <span className="font-medium text-secondary/80 text-sm">
                {' '}– {formatRupiah(service.priceTo, lang === 'en')}
              </span>
            )}
          </span>
        </div>

        {/* Action Button Row */}
        <div className="flex items-center gap-2">
          <Link
            to={localePath(`/booking?layanan=${service.slug}`)}
            className="flex-1 btn-primary py-2.5 px-4 text-xs sm:text-sm font-semibold justify-center min-h-[44px]"
          >
            <span>{t.common.bookNow}</span>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            to={localePath(`/layanan/${service.slug}`)}
            className="px-3.5 min-h-[44px] inline-flex items-center justify-center rounded-xl border border-border bg-surface text-secondary hover:bg-bg-alt hover:text-primary text-xs sm:text-sm font-semibold transition-colors"
            aria-label={`Detail ${serviceName}`}
          >
            <span>Detail</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
