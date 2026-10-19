import React from 'react';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';

export const FacilitiesPage: React.FC = () => {
  const { lang, t } = useI18n();

  return (
    <>
      <AppHelmet
        title={t.facilities.pageTitle}
        description={t.facilities.pageDesc}
        path="/fasilitas"
      />

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Medical Standards & Comfort' : 'Standar Medis & Kenyamanan'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.facilities.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.facilities.pageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {t.facilities.items.map((facility, index) => (
              <div key={index} className="trust-card bg-bg-card overflow-hidden p-0 flex flex-col justify-between">
                <div>
                  <PhotoPlaceholder
                    label={`[FOTO FASILITAS 0${index + 1}]`}
                    sublabel={facility.title}
                    aspect="16:9"
                    className="rounded-none border-0 border-b border-border"
                  />
                  <div className="p-6">
                    <span className="badge badge-primary mb-3">
                      0{index + 1} · TEKNOLOGI
                    </span>
                    <h3 className="font-heading text-xl font-bold text-text mb-2">
                      {facility.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {facility.desc}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 text-xs font-semibold text-success-dark border-t border-border bg-bg-alt/50 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Teruji & Terkalibrasi Berkala</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
