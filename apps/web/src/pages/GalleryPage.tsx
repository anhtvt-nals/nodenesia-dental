import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getGallery } from '../lib/api';
import { GalleryItem } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';

export const GalleryPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getGallery();
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.gallery.pageTitle}
        description={t.gallery.pageDesc}
        path="/hasil-kami"
      />

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Dokumentasi Klinis
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.gallery.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans mb-4">
              {t.gallery.pageDesc}
            </p>

            {/* Mandatory Consent Notice */}
            <div className="p-4 bg-[#E9E4D8]/50 hairline-border text-xs font-mono text-[#14201C]/70">
              <span className="font-semibold text-[#1F3D36] block mb-1">
                Pemberitahuan Persetujuan Medis (Informed Consent):
              </span>
              {t.gallery.consentNotice}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {items.map((item) => {
                const serviceName = lang === 'en' ? item.serviceNameEn : item.serviceName;
                const caption = lang === 'en' ? item.captionEn : item.caption;

                return (
                  <div key={item.id} className="hairline-border bg-[#F4F1EA] p-6 flex flex-col justify-between">
                    <div>
                      {/* Before / After Dual Frame */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div>
                          <PhotoPlaceholder
                            label="[FOTO SEBELUM]"
                            sublabel={item.beforeLabel}
                            aspect="4:3"
                          />
                          <span className="block text-[11px] font-mono text-[#14201C]/60 mt-1.5 text-center">
                            Sebelum Perawatan
                          </span>
                        </div>
                        <div>
                          <PhotoPlaceholder
                            label="[FOTO SESUDAH]"
                            sublabel={item.afterLabel}
                            aspect="4:3"
                          />
                          <span className="block text-[11px] font-mono text-[#1F3D36] font-medium mt-1.5 text-center">
                            Hasil Sesudah
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-[#14201C]/60 mb-2">
                        <span className="text-[#1F3D36] font-medium">{serviceName}</span>
                        <span>{t.gallery.treatmentTime}: {item.treatmentDuration}</span>
                      </div>

                      <h3 className="font-serif text-xl text-[#14201C] mb-2">
                        {item.afterLabel}
                      </h3>
                      <p className="text-sm font-sans text-[#14201C]/75 leading-relaxed mb-6">
                        {caption}
                      </p>
                    </div>

                    <div className="pt-4 hairline-t flex items-center justify-between">
                      <span className="text-xs font-mono text-[#14201C]/50">
                        {t.gallery.verifiedCase} ✓
                      </span>
                      <Link
                        to={localePath(`/booking?layanan=${item.serviceSlug}`)}
                        className="px-4 py-2 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] transition-colors"
                      >
                        Konsultasi Kasus Ini
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
