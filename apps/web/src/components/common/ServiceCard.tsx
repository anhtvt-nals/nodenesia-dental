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
    <article className="group bg-surface rounded-2xl border border-border p-5 sm:p-7 shadow-card hover:shadow-hover hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top content */}
      <div className="flex-1 flex flex-col">
        {/* Category tag + Duration */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
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
        <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-snug mb-2">
          <Link to={localePath(`/layanan/${service.slug}`)} className="focus:outline-none">
            {serviceName}
          </Link>
        </h3>

        {/* Description */}
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3 mb-4">
          {shortDesc}
        </p>
      </div>

      {/* Price & Single CTA Footer */}
      <div className="pt-4 mt-auto border-t border-border flex flex-col gap-3.5">
        {/* Price row: gracefully wrap on narrow mobile screens */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
          <span className="text-xs text-text-muted font-medium shrink-0">
            {t.services.startingFrom}
          </span>
          <div className="font-heading font-bold text-base sm:text-lg text-primary tabular-nums tracking-tight text-right">
            <span>{formatRupiah(service.priceFrom, lang === 'en')}</span>
            {service.priceTo && (
              <span className="font-medium text-secondary/80 text-xs sm:text-sm">
                {' '}– {formatRupiah(service.priceTo, lang === 'en')}
              </span>
            )}
          </div>
        </div>

        {/* Action Button Row */}
        <div className="service-card__actions grid grid-cols-[1.35fr_1fr] gap-2.5">
          <Link
            to={localePath(`/booking?layanan=${service.slug}`)}
            className="btn-primary relative h-12 w-full px-3 sm:px-4 text-xs sm:text-sm font-semibold whitespace-nowrap active:scale-[0.98]"
          >
            <span className="absolute inset-x-0 text-center">{t.common.bookNow}</span>
            <svg className="absolute right-3.5 h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
          <Link
            to={localePath(`/layanan/${service.slug}`)}
            className="inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-btn)] border border-border bg-surface px-3 sm:px-4 text-xs sm:text-sm font-semibold text-secondary transition-colors hover:bg-bg-alt hover:text-primary whitespace-nowrap active:scale-[0.98]"
            aria-label={`Detail ${serviceName}`}
          >
            <span>Detail</span>
          </Link>
        </div>
      </div>
    </article>
  );
};
