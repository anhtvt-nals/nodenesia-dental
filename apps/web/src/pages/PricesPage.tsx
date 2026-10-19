import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getServices } from '../lib/api';
import { Service } from '../types';
import { LazyTeethScene as TeethScene } from '../components/teeth/LazyTeethScene';
import { AppHelmet } from '../components/common/AppHelmet';
import { formatRupiah, formatExactCurrency } from '../lib/utils';

export const PricesPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getServices();
      setServices(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.prices.pageTitle}
        description={t.prices.pageDesc}
        path="/harga"
      />

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Transparansi Biaya Perawatan
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.prices.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.prices.pageDesc}
            </p>
          </div>

          {/* Section 1: 3D Teeth Price Explorer */}
          <div className="mb-16">
            <div className="mb-4">
              <h2 className="font-serif text-2xl text-[#14201C]">
                {t.prices.explorerTitle}
              </h2>
              <p className="text-xs font-mono text-[#14201C]/60">
                {t.prices.explorerDesc}
              </p>
            </div>
            <TeethScene services={services} />
          </div>

          {/* Section 2: Complete Plain HTML Price Table (SEO & Accessibility) */}
          <div className="pt-8 hairline-t">
            <div className="mb-6">
              <h2 className="font-serif text-2xl sm:text-3xl text-[#14201C] mb-2">
                {t.prices.tableTitle}
              </h2>
              <p className="text-xs font-mono text-[#14201C]/60">
                Daftar lengkap tindakan, durasi klinis, dan estimasi biaya
              </p>
            </div>

            {loading ? (
              <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
                {t.common.loading}
              </div>
            ) : (
              <div className="overflow-x-auto hairline-border bg-[#F4F1EA]">
                <table className="w-full text-left border-collapse" aria-label="Tabel Biaya Layanan Gigi">
                  <thead>
                    <tr className="bg-[#E9E4D8] hairline-b text-xs font-mono text-[#14201C]/70 uppercase tracking-wider">
                      <th scope="col" className="p-4">{t.prices.serviceCol}</th>
                      <th scope="col" className="p-4 hidden sm:table-cell">{t.prices.categoryCol}</th>
                      <th scope="col" className="p-4">{t.prices.durationCol}</th>
                      <th scope="col" className="p-4">{t.prices.priceCol}</th>
                      <th scope="col" className="p-4 text-right">{t.prices.actionCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#14201C]/10 text-sm">
                    {services.map((svc) => {
                      const name = lang === 'en' ? svc.nameEn : svc.name;
                      const priceNote = lang === 'en' ? svc.priceNoteEn : svc.priceNote;

                      return (
                        <tr key={svc.id} className="hover:bg-[#E9E4D8]/30 transition-colors">
                          <td className="p-4">
                            <Link
                              to={localePath(`/layanan/${svc.slug}`)}
                              className="font-serif text-lg text-[#14201C] hover:text-[#1F3D36] block"
                            >
                              {name}
                            </Link>
                            <span className="text-xs font-mono text-[#14201C]/50 sm:hidden">
                              {t.services.categories[svc.category]}
                            </span>
                          </td>
                          <td className="p-4 text-xs font-mono text-[#14201C]/70 hidden sm:table-cell">
                            {t.services.categories[svc.category]}
                          </td>
                          <td className="p-4 text-xs font-mono text-[#14201C]/80 whitespace-nowrap">
                            {svc.durationMinutes} {t.common.minutes}
                          </td>
                          <td className="p-4 font-mono">
                            <div className="font-semibold text-[#1F3D36]">
                              {formatRupiah(svc.priceFrom, lang === 'en')}
                              {svc.priceTo && ` – ${formatRupiah(svc.priceTo, lang === 'en')}`}
                            </div>
                            {priceNote && (
                              <div className="text-[11px] text-[#14201C]/55 font-normal">
                                {priceNote}
                              </div>
                            )}
                          </td>
                          <td className="p-4 text-right whitespace-nowrap">
                            <Link
                              to={localePath(`/booking?layanan=${svc.slug}`)}
                              className="px-3 py-1.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] transition-colors"
                            >
                              {t.common.bookNow}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 p-4 bg-[#E9E4D8]/30 hairline-border text-xs font-mono text-[#14201C]/70">
              {t.prices.disclaimer}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
