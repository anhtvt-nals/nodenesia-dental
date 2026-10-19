import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getServices } from '../lib/api';
import { Service, ServiceCategory } from '../types';
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Katalog Layanan Klinis
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.services.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.services.pageDesc}
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 hairline-b scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCat(cat.key)}
                className={`px-4 py-2 text-xs font-mono tracking-wider transition-colors whitespace-nowrap hairline-border ${
                  selectedCat === cat.key
                    ? 'bg-[#14201C] text-[#F4F1EA] border-[#14201C] font-medium'
                    : 'bg-[#F4F1EA] text-[#14201C]/70 hover:bg-[#E9E4D8]'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
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
