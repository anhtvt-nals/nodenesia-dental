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
    <div className="group py-5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors hover:bg-bg-alt/60 px-4 -mx-4 rounded-xl">
      <div className="flex items-start gap-4 flex-1 min-w-0">
        {displayIndex && (
          <span className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-heading text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
            {displayIndex}
          </span>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to={localePath(`/layanan/${service.slug}`)}
              className="font-heading text-lg md:text-xl font-bold text-text hover:text-primary transition-colors"
            >
              {serviceName}
            </Link>
            {showCategory && (
              <span className="px-2.5 py-0.5 rounded-full bg-bg-alt text-text-muted text-xs font-semibold">
                {t.services.categories[service.category]}
              </span>
            )}
          </div>
          <p className="text-sm text-text-muted mt-1 max-w-2xl line-clamp-2">
            {shortDesc}
          </p>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-text-muted font-medium">
            <span className="inline-flex items-center gap-1">
              <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {service.durationMinutes} {t.common.minutes}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-heading font-bold text-primary text-sm">
              {formatRupiah(service.priceFrom, lang === 'en')}
            </span>
            {priceNote && (
              <>
                <span aria-hidden="true">·</span>
                <span>{priceNote}</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0">
        <Link
          to={localePath(`/layanan/${service.slug}`)}
          className="inline-flex items-center gap-1 text-sm text-primary font-semibold hover:underline py-2"
        >
          <span>{t.common.moreDetail}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
        <Link
          to={localePath(`/booking?layanan=${service.slug}`)}
          className="btn-primary text-xs py-2.5 px-4 min-h-[40px] whitespace-nowrap"
        >
          <span>{t.common.bookNow}</span>
        </Link>
      </div>
    </div>
  );
};
