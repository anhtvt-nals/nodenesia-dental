import { PageHeader } from '../components/common/PageHeader';
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
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    async function load() {
      const data = await getGallery();
      setItems(data);
      setLoading(false);
    }
    load();
  }, []);

  const serviceCategories = ['all', ...new Set(items.map((i) => i.serviceSlug).filter(Boolean))];
  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter((i) => i.serviceSlug === activeFilter);

  return (
    <>
      <AppHelmet
        title={t.gallery.pageTitle}
        description={t.gallery.pageDesc}
        path="/hasil-kami"
      />

      <PageHeader title={t.gallery.pageTitle} description={t.gallery.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Mandatory Informed Consent Notice */}
          <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="text-xs sm:text-sm text-text-muted leading-relaxed">
              <span className="font-bold text-secondary block mb-1">
                {lang === 'en' ? 'Clinical Consent & Medical Ethics Notice:' : 'Pemberitahuan Persetujuan Medis (Informed Consent):'}
              </span>
              {t.gallery.consentNotice}
            </div>
          </div>

          {/* Filter Pills */}
          {serviceCategories.length > 2 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-border scrollbar-none">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                    activeFilter === cat
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-secondary border-border hover:border-primary/40 hover:bg-bg-alt'
                  }`}
                >
                  {cat === 'all'
                    ? (lang === 'en' ? 'All Treatments' : 'Semua Tindakan')
                    : cat.replace('-', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          )}

          {/* Cases Grid */}
          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredItems.map((item) => {
                const serviceName = lang === 'en' ? item.serviceNameEn : item.serviceName;
                const caption = lang === 'en' ? item.captionEn : item.caption;

                return (
                  <div
                    key={item.id}
                    className="bg-surface rounded-2xl border border-border shadow-card hover:shadow-hover transition-all duration-300 p-6 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      {/* Before / After Dual Frame */}
                      <div className="grid grid-cols-2 gap-3.5 mb-5">
                        <div className="space-y-2">
                          {item.beforeUrl ? (
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-border bg-bg-alt relative">
                              <img
                                src={item.beforeUrl}
                                alt={item.beforeLabel}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <PhotoPlaceholder
                              label="Kondisi Awal"
                              sublabel={item.beforeLabel}
                              aspect="4:3"
                            />
                          )}
                          <div className="text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-bg-alt text-text-muted text-[11px] font-semibold border border-border">
                              Sebelum: {item.beforeLabel}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          {item.afterUrl ? (
                            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden border border-primary/30 bg-bg-alt relative shadow-xs">
                              <img
                                src={item.afterUrl}
                                alt={item.afterLabel}
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <PhotoPlaceholder
                              label="Hasil Akhir"
                              sublabel={item.afterLabel}
                              aspect="4:3"
                            />
                          )}
                          <div className="text-center">
                            <span className="inline-block px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold border border-primary/20">
                              Sesudah: {item.afterLabel}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Case metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                          {serviceName}
                        </span>
                        <span className="text-text-muted font-medium">
                          {t.gallery.treatmentTime}: <strong className="text-secondary">{item.treatmentDuration}</strong>
                        </span>
                      </div>

                      <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary mb-2">
                        {item.afterLabel}
                      </h3>
                      <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
                        {caption}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t.gallery.verifiedCase}</span>
                      </span>
                      <Link
                        to={localePath(`/booking?layanan=${item.serviceSlug}`)}
                        className="btn-primary text-xs py-2.5 px-4 cursor-pointer"
                      >
                        {lang === 'en' ? 'Consult Similar Case' : 'Konsultasi Kasus Ini'}
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
