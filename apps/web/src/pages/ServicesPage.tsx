import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getServices } from '../lib/api';
import { Service } from '../types';
import { ServiceCard } from '../components/common/ServiceCard';
import { AppHelmet } from '../components/common/AppHelmet';
import { DEFAULT_SERVICES } from '../lib/fallback-data';
import { PriceRow } from '../components/common/PriceRow';

export const ServicesPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getServices().catch(() => [] as Service[]);
      setServices(data.length > 0 ? data : DEFAULT_SERVICES);
      setLoading(false);
    }
    load();
  }, []);

  const categories: { key: string; label: string }[] = [
    { key: 'all', label: t.services.categoryAll },
    { key: 'pencegahan', label: t.services.categories.pencegahan },
    { key: 'restoratif', label: t.services.categories.restoratif },
    { key: 'estetik', label: t.services.categories.estetik },
    { key: 'ortodonti', label: t.services.categories.ortodonti },
    { key: 'bedah', label: t.services.categories.bedah },
  ];

  const filteredServices = selectedCat === 'all'
    ? services
    : services.filter((s) => s.category === selectedCat);

  return (
    <>
      <AppHelmet
        title={t.services.pageTitle}
        description={t.services.pageDesc}
        path="/layanan"
      />

      <PageHeader title={t.services.pageTitle} description={t.services.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Control Bar: Categories & View Mode Toggle */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-border">
            {/* Category Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setSelectedCat(cat.key)}
                  className={`px-4 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border min-h-[44px] shrink-0 snap-start active:scale-95 ${
                    selectedCat === cat.key
                      ? 'bg-primary text-white border-primary shadow-xs'
                      : 'bg-surface text-secondary border-border hover:border-primary/40 hover:bg-bg-alt'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* View switcher */}
            <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-surface border border-border shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-secondary'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
                <span>{lang === 'en' ? 'Cards' : 'Katalog'}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-primary text-white'
                    : 'text-text-muted hover:text-secondary'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                <span>{lang === 'en' ? 'Fee Schedule' : 'Tabel Tarif'}</span>
              </button>
            </div>
          </div>

          {/* Services Display */}
          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8">
              <div className="border-t border-border divide-y divide-border">
                {filteredServices.map((svc, idx) => (
                  <PriceRow key={svc.id} service={svc} index={idx} />
                ))}
              </div>
            </div>
          )}

          {/* Pricing transparency promise banner */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-accent/15 text-accent flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading text-base font-bold text-secondary">
                {lang === 'en' ? 'Transparent Dental Pricing Guarantee' : 'Transparansi Biaya & Rencana Perawatan Jelas'}
              </h4>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {lang === 'en'
                  ? 'All treatments are preceded by an initial diagnosis, intraoral photographs, and transparent fee quotation before any procedure begins. No hidden costs or surprise surcharges.'
                  : 'Seluruh tindakan didahului pemeriksaan intraoral, foto kondisi gigi, dan rincian estimasi biaya tertulis sebelum tindakan dimulai. Tidak ada biaya tersembunyi atau biaya tambahan yang tidak disetujui pasien.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
