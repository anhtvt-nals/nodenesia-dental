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
    <article className="hairline-border p-6 bg-[#F4F1EA] hover:bg-[#E9E4D8]/40 transition-colors flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-[#14201C]/50 mb-3">
          <span>{categoryLabel}</span>
          <span>{service.durationMinutes} {t.common.minutes}</span>
        </div>
        <h3 className="font-serif text-2xl text-[#14201C] mb-3">
          <Link to={localePath(`/layanan/${service.slug}`)} className="hover:text-[#1F3D36] transition-colors">
            {serviceName}
          </Link>
        </h3>
        <p className="text-sm text-[#14201C]/70 leading-relaxed mb-6">
          {shortDesc}
        </p>
      </div>

      <div className="pt-4 hairline-t">
        <div className="text-xs font-mono text-[#14201C]/50 mb-1">
          {t.services.startingFrom}
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-mono text-lg font-medium text-[#1F3D36]">
            {formatRupiah(service.priceFrom, lang === 'en')}
          </span>
          <div className="flex items-center gap-2">
            <Link
              to={localePath(`/layanan/${service.slug}`)}
              className="text-xs font-mono text-[#14201C]/70 hover:text-[#14201C] underline underline-offset-4"
            >
              {t.common.moreDetail}
            </Link>
            <Link
              to={localePath(`/booking?layanan=${service.slug}`)}
              className="px-3 py-1.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] transition-colors"
            >
              {t.common.bookNow}
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
