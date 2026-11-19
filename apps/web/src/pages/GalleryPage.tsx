import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getGallery } from '../lib/api';
import { GalleryItem } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';
import { BeforeAfterSlider } from '../components/common/BeforeAfterSlider';

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

  const getCategoryLabel = (cat: string) => {
    if (cat === 'all') return lang === 'en' ? 'All Treatments' : 'Semua Tindakan';
    const match = items.find((i) => i.serviceSlug === cat);
    if (match) return lang === 'en' ? match.serviceNameEn || match.serviceName : match.serviceName;
    return cat.replace(/-/g, ' ').toUpperCase();
  };

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
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 border-b border-border scrollbar-none snap-x snap-mandatory">
              {serviceCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveFilter(cat)}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border min-h-[44px] shrink-0 snap-start active:scale-95 ${
                    activeFilter === cat
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-secondary border-border hover:border-primary/40 hover:bg-bg-alt'
                  }`}
                >
                  {getCategoryLabel(cat)}
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
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 bg-surface rounded-2xl border border-border p-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-secondary font-medium">
                {lang === 'en' ? 'No cases found for this treatment.' : 'Belum ada dokumentasi kasus untuk kategori ini.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredItems.map((item) => {
                const serviceName = lang === 'en' ? item.serviceNameEn || item.serviceName : item.serviceName;
                const caption = lang === 'en' ? item.captionEn || item.caption : item.caption;
                const beforeLabel = item.beforeLabel || (lang === 'en' ? 'Before' : 'Sebelum');
                const afterLabel = item.afterLabel || (lang === 'en' ? 'After' : 'Sesudah');

                return (
                  <div
                    key={item.id}
                    className="bg-surface rounded-2xl border border-border shadow-card hover:shadow-hover transition-all duration-300 p-5 sm:p-7 flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Frame: Interactive Slider or Single Photo */}
                      <div className="mb-5">
                        {item.beforeUrl && item.afterUrl ? (
                          <BeforeAfterSlider
                            beforeUrl={item.beforeUrl}
                            afterUrl={item.afterUrl}
                            beforeLabel={beforeLabel}
                            afterLabel={afterLabel}
                            aspectRatio="4/3"
                          />
                        ) : item.afterUrl ? (
                          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-bg-alt relative shadow-xs">
                            <img
                              src={item.afterUrl}
                              alt={afterLabel}
                              loading="lazy"
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute bottom-3 left-3 text-[11px] font-bold uppercase tracking-wider bg-primary/90 text-white px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
                              {afterLabel}
                            </span>
                          </div>
                        ) : (
                          <PhotoPlaceholder
                            label="Hasil Perawatan"
                            sublabel={afterLabel}
                            aspect="4:3"
                          />
                        )}
                      </div>

                      {/* Case metadata */}
                      <div className="flex flex-wrap items-center justify-between gap-2 text-xs mb-3">
                        {serviceName ? (
                          <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary font-bold text-xs">
                            {serviceName}
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-bg-alt text-text-muted font-medium text-xs border border-border">
                            {lang === 'en' ? 'Clinical Treatment' : 'Tindakan Klinis'}
                          </span>
                        )}

                        {item.treatmentDuration && (
                          <span className="text-text-muted font-medium">
                            {t.gallery.treatmentTime}: <strong className="text-secondary">{item.treatmentDuration}</strong>
                          </span>
                        )}
                      </div>

                      <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary mb-2">
                        {item.afterLabel || serviceName || (lang === 'en' ? 'Clinical Result' : 'Hasil Tindakan Medis')}
                      </h3>
                      {caption && (
                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed mb-6">
                          {caption}
                        </p>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
                        <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{t.gallery.verifiedCase}</span>
                      </span>
                      <Link
                        to={item.serviceSlug ? localePath(`/booking?layanan=${encodeURIComponent(item.serviceSlug)}`) : localePath('/booking')}
                        className="btn-primary text-xs py-2.5 px-4 cursor-pointer min-h-[44px] flex items-center justify-center active:scale-[0.98]"
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
