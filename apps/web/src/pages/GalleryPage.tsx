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

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Clinical Documentation' : 'Dokumentasi Klinis'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.gallery.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed mb-5">
              {t.gallery.pageDesc}
            </p>

            {/* Mandatory Consent Notice */}
            <div className="p-4 rounded-xl bg-bg-card border border-border text-xs sm:text-sm text-text-muted">
              <span className="font-bold text-primary block mb-1">
                Pemberitahuan Persetujuan Medis (Informed Consent):
              </span>
              {t.gallery.consentNotice}
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {items.map((item) => {
                const serviceName = lang === 'en' ? item.serviceNameEn : item.serviceName;
                const caption = lang === 'en' ? item.captionEn : item.caption;

                return (
                  <div key={item.id} className="trust-card bg-bg-card p-6 flex flex-col justify-between">
                    <div>
                      {/* Before / After Dual Frame */}
                      <div className="grid grid-cols-2 gap-3.5 mb-5">
                        <div>
                          <PhotoPlaceholder
                            label="[FOTO SEBELUM]"
                            sublabel={item.beforeLabel}
                            aspect="4:3"
                          />
                          <span className="block text-xs font-medium text-text-muted mt-2 text-center">
                            Sebelum Perawatan
                          </span>
                        </div>
                        <div>
                          <PhotoPlaceholder
                            label="[FOTO SESUDAH]"
                            sublabel={item.afterLabel}
                            aspect="4:3"
                          />
                          <span className="block text-xs font-bold text-secondary mt-2 text-center">
                            Hasil Sesudah
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted mb-3">
                        <span className="badge badge-primary">{serviceName}</span>
                        <span className="font-medium">{t.gallery.treatmentTime}: {item.treatmentDuration}</span>
                      </div>

                      <h3 className="font-heading text-xl font-bold text-text mb-2">
                        {item.afterLabel}
                      </h3>
                      <p className="text-sm text-text-muted leading-relaxed mb-6">
                        {caption}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success-dark">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t.gallery.verifiedCase}</span>
                      </span>
                      <Link
                        to={localePath(`/booking?layanan=${item.serviceSlug}`)}
                        className="btn-primary text-xs py-2 px-4 cursor-pointer"
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
