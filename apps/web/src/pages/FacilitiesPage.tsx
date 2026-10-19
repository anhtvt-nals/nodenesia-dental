import React from 'react';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';

export const FacilitiesPage: React.FC = () => {
  const { t } = useI18n();

  return (
    <>
      <AppHelmet
        title={t.facilities.pageTitle}
        description={t.facilities.pageDesc}
        path="/fasilitas"
      />

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Standar Medis & Kenyamanan
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.facilities.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.facilities.pageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {t.facilities.items.map((facility, index) => (
              <div key={index} className="hairline-border bg-[#F4F1EA] flex flex-col justify-between">
                <div>
                  <PhotoPlaceholder
                    label={`[FOTO FASILITAS 0${index + 1}]`}
                    sublabel={facility.title}
                    aspect="16:9"
                  />
                  <div className="p-6">
                    <span className="font-mono text-xs text-[#1F3D36] block mb-2">
                      0{index + 1}. TEKNOLOGI
                    </span>
                    <h3 className="font-serif text-xl text-[#14201C] mb-2">
                      {facility.title}
                    </h3>
                    <p className="text-sm font-sans text-[#14201C]/75 leading-relaxed">
                      {facility.desc}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0 text-[11px] font-mono text-[#14201C]/50 hairline-t mt-4">
                  Teruji & Terkalibrasi Berkala
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
