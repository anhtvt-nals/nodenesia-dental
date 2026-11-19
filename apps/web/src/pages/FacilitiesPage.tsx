import { PageHeader } from '../components/common/PageHeader';
import React from 'react';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';

const FACILITY_PHOTOS = [
  'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
];

export const FacilitiesPage: React.FC = () => {
  const { lang, t } = useI18n();

  return (
    <>
      <AppHelmet
        title={t.facilities.pageTitle}
        description={t.facilities.pageDesc}
        path="/fasilitas"
      />

      <PageHeader title={t.facilities.pageTitle} description={t.facilities.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Standards Overview Banner */}
          <div className="mb-10 p-5 sm:p-8 rounded-2xl bg-secondary text-surface shadow-floating relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-accent block">
                {lang === 'en' ? 'Clinical Infrastructure & Hygiene' : 'Infrastruktur Klinis & Higienitas'}
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-surface">
                {lang === 'en'
                  ? 'Built for Sterile Precision & Patient Comfort'
                  : 'Dirancang untuk Presisi Medis Steril & Kenyamanan Menyeluruh'}
              </h2>
              <p className="text-xs sm:text-sm text-surface/80 leading-relaxed">
                {lang === 'en'
                  ? 'Our clinic features German-engineered Class B autoclaves, low-radiation 3D CBCT imaging, and medical-grade HEPA 14 air filtration in every dental operatory.'
                  : 'Setiap ruang perawatan dilengkapi sistem sterilisasi Autoclave Kelas B berstandar rumah sakit, pencitraan 3D CBCT dosis radiasi minimal, dan filtrasi udara medis HEPA 14.'}
              </p>
            </div>
          </div>

          {/* Facility Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {t.facilities.items.map((facility, index) => (
              <div
                key={index}
                className="group bg-surface rounded-2xl border border-border shadow-card hover:shadow-hover hover:border-primary/40 transition-all duration-300 overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="w-full aspect-[16/10] overflow-hidden bg-bg-alt relative">
                    <img
                      src={FACILITY_PHOTOS[index % FACILITY_PHOTOS.length]}
                      alt={facility.title}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-secondary/85 backdrop-blur-xs text-surface text-[11px] font-mono font-bold tracking-wider">
                      0{index + 1}
                    </div>
                  </div>

                  <div className="p-5 sm:p-7 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-accent block">
                      TEKNOLOGI MEDIS
                    </span>
                    <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-primary transition-colors">
                      {facility.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {facility.desc}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 py-4 text-xs font-semibold text-emerald-800 border-t border-border bg-bg-alt/50 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{lang === 'en' ? 'Certified & Routinely Calibrated' : 'Teruji & Terkalibrasi Berkala'}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};
