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

      <div className="py-20 md:py-32 text-center bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-md mx-auto px-4">
          <div className="trust-card p-8 sm:p-10 bg-bg-card">
            <span className="stat-number text-6xl md:text-7xl block mb-3">
              {t.notFound.code}
            </span>
            <h1 className="font-heading text-2xl md:text-3xl font-bold text-text mb-3">
              {t.notFound.title}
            </h1>
            <p className="text-sm text-text-muted mb-8 leading-relaxed">
              {t.notFound.desc}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={localePath('/')}
                className="btn-primary w-full sm:w-auto justify-center text-sm py-3 px-6 cursor-pointer"
              >
                {t.notFound.backHome}
              </Link>
              <Link
                to={localePath('/layanan')}
                className="btn-secondary w-full sm:w-auto justify-center text-sm py-3 px-6 cursor-pointer"
              >
                {t.notFound.exploreServices}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
