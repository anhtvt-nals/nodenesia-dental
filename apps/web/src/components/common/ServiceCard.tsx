import React from 'react';
import { Link } from 'react-router-dom';
import { Service, ServiceCategory } from '../../types';
import { formatRupiah } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface ServiceCardProps {
  service: Service;
}

const getCategoryIconStyle = (category: ServiceCategory) => {
  switch (category) {
    case 'pencegahan':
      return {
        bg: 'bg-primary/10 text-primary',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        ),
      };
    case 'estetik':
      return {
        bg: 'bg-secondary/10 text-secondary',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        ),
      };
    case 'ortodonti':
      return {
        bg: 'bg-info/10 text-info',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        ),
      };
    case 'restoratif':
      return {
        bg: 'bg-warning/15 text-text',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        ),
      };
    case 'bedah':
      return {
        bg: 'bg-success/12 text-success-dark',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        ),
      };
    default:
      return {
        bg: 'bg-primary/10 text-primary',
        icon: (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        ),
      };
  }
};

export const ServiceCard: React.FC<ServiceCardProps> = ({ service }) => {
  const { lang, t, localePath } = useI18n();
  const serviceName = lang === 'en' ? service.nameEn : service.name;
  const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;
  const categoryLabel = t.services.categories[service.category];
  const { bg, icon } = getCategoryIconStyle(service.category);

  return (
    <article className="service-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${bg}`} aria-hidden="true">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {icon}
            </svg>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="px-2.5 py-1 rounded-full bg-bg-alt text-text-muted text-xs font-semibold">
              {categoryLabel}
            </span>
            <span className="text-xs text-text-muted font-medium">
              {service.durationMinutes} {t.common.minutes}
            </span>
          </div>
        </div>

        <h3 className="font-heading text-xl font-semibold text-text mb-2">
          <Link to={localePath(`/layanan/${service.slug}`)} className="hover:text-primary transition-colors">
            {serviceName}
          </Link>
        </h3>
        <p className="text-sm text-text-muted leading-relaxed mb-5">
          {shortDesc}
        </p>
      </div>

      <div className="pt-4 border-t border-border">
        <div className="flex items-baseline justify-between gap-2 mb-4">
          <span className="text-xs text-text-muted font-medium">
            {t.services.startingFrom}
          </span>
          <span className="font-heading text-lg font-bold text-primary">
            {formatRupiah(service.priceFrom, lang === 'en')}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <Link
            to={localePath(`/layanan/${service.slug}`)}
            className="inline-flex items-center gap-1.5 text-sm text-primary font-semibold hover:underline rounded py-1.5"
          >
            <span>{t.common.moreDetail}</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
          <Link
            to={localePath(`/booking?layanan=${service.slug}`)}
            className="btn-primary text-xs py-2.5 px-4 min-h-[40px]"
          >
            {t.common.bookNow}
          </Link>
        </div>
      </div>
    </article>
  );
};
