import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';

export const NotFoundPage: React.FC = () => {
  const { t, localePath } = useI18n();

  return (
    <>
      <AppHelmet
        title={t.notFound.title}
        description={t.notFound.desc}
        path="/404"
      />

      <div className="py-24 md:py-36 text-center">
        <div className="max-w-md mx-auto px-4">
          <span className="font-mono text-6xl md:text-7xl font-light text-[#1F3D36] block mb-4">
            {t.notFound.code}
          </span>
          <h1 className="font-serif text-3xl md:text-4xl text-[#14201C] mb-3">
            {t.notFound.title}
          </h1>
          <p className="text-sm font-sans text-[#14201C]/75 mb-8 leading-relaxed">
            {t.notFound.desc}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to={localePath('/')}
              className="w-full sm:w-auto px-6 py-3 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
            >
              {t.notFound.backHome}
            </Link>
            <Link
              to={localePath('/layanan')}
              className="w-full sm:w-auto px-6 py-3 hairline-border bg-[#E9E4D8] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#DDD7C9] transition-colors"
            >
              {t.notFound.exploreServices}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
