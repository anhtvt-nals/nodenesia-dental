import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getServices } from '../lib/api';
import { Service } from '../types';
import { ServiceCard } from '../components/common/ServiceCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const ServicesPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getServices();
      setServices(data);
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

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Clinical Services Catalog' : 'Katalog Layanan Klinis'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.services.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.services.pageDesc}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 border-b border-border scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer border ${
                  selectedCat === cat.key
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-bg-card text-text-muted border-border hover:border-primary/40 hover:text-text'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard key={service.id} service={service} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
