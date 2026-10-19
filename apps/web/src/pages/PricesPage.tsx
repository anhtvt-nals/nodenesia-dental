import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getServices } from '../lib/api';
import { Service } from '../types';
import { LazyTeethScene as TeethScene } from '../components/teeth/LazyTeethScene';
import { AppHelmet } from '../components/common/AppHelmet';
import { formatRupiah } from '../lib/utils';

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

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Transparent Fee Schedule' : 'Transparansi Biaya Perawatan'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.prices.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.prices.pageDesc}
            </p>
          </div>

          {/* Section 1: 3D Teeth Price Explorer */}
          <div className="mb-16">
            <div className="mb-5">
              <h2 className="font-heading text-2xl font-bold text-text mb-1">
                {t.prices.explorerTitle}
              </h2>
              <p className="text-sm text-text-muted">
                {t.prices.explorerDesc}
              </p>
            </div>
            <TeethScene services={services} />
          </div>

          {/* Section 2: Complete Plain HTML Price Table (SEO & Accessibility) */}
          <div className="pt-8 border-t border-border">
            <div className="mb-6">
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-1.5">
                {t.prices.tableTitle}
              </h2>
              <p className="text-sm text-text-muted">
                {lang === 'en'
                  ? 'Complete list of clinical procedures, estimated duration, and fee ranges'
                  : 'Daftar lengkap tindakan, durasi klinis, dan estimasi biaya'}
              </p>
            </div>

            {loading ? (
              <div className="p-16 text-center text-sm font-medium text-text-muted">
                {t.common.loading}
              </div>
            ) : (
              <div className="overflow-x-auto trust-card bg-bg-card p-0">
                <table className="w-full text-left border-collapse" aria-label="Tabel Biaya Layanan Gigi">
                  <thead>
                    <tr className="bg-bg-alt border-b border-border text-xs font-bold text-text-muted uppercase tracking-wider">
                      <th scope="col" className="p-4 sm:p-5">{t.prices.serviceCol}</th>
                      <th scope="col" className="p-4 sm:p-5 hidden sm:table-cell">{t.prices.categoryCol}</th>
                      <th scope="col" className="p-4 sm:p-5">{t.prices.durationCol}</th>
                      <th scope="col" className="p-4 sm:p-5">{t.prices.priceCol}</th>
                      <th scope="col" className="p-4 sm:p-5 text-right">{t.prices.actionCol}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-sm">
                    {services.map((svc) => {
                      const name = lang === 'en' ? svc.nameEn : svc.name;
                      const priceNote = lang === 'en' ? svc.priceNoteEn : svc.priceNote;

                      return (
                        <tr key={svc.id} className="hover:bg-bg-alt/60 transition-colors">
                          <td className="p-4 sm:p-5">
                            <Link
                              to={localePath(`/layanan/${svc.slug}`)}
                              className="font-heading font-bold text-base text-text hover:text-primary block transition-colors"
                            >
                              {name}
                            </Link>
                            <span className="badge badge-primary mt-1 sm:hidden">
                              {t.services.categories[svc.category]}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 hidden sm:table-cell">
                            <span className="badge badge-primary">
                              {t.services.categories[svc.category]}
                            </span>
                          </td>
                          <td className="p-4 sm:p-5 text-xs font-medium text-text-muted whitespace-nowrap">
                            {svc.durationMinutes} {t.common.minutes}
                          </td>
                          <td className="p-4 sm:p-5">
                            <div className="font-heading font-bold text-base text-primary">
                              {formatRupiah(svc.priceFrom, lang === 'en')}
                              {svc.priceTo && ` – ${formatRupiah(svc.priceTo, lang === 'en')}`}
                            </div>
                            {priceNote && (
                              <div className="text-xs text-text-muted mt-0.5">
                                {priceNote}
                              </div>
                            )}
                          </td>
                          <td className="p-4 sm:p-5 text-right whitespace-nowrap">
                            <Link
                              to={localePath(`/booking?layanan=${svc.slug}`)}
                              className="btn-primary text-xs py-2 px-4 cursor-pointer"
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

            <div className="mt-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
              <div className="md:col-span-7 p-4 rounded-xl bg-bg-card border border-border text-xs sm:text-sm text-text-muted">
                {t.prices.disclaimer}
              </div>
              <div className="md:col-span-5 p-4 rounded-xl bg-bg-card border border-border flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-semibold text-text">
                  {lang === 'en' ? 'Payment Methods:' : 'Metode Pembayaran:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">QRIS</span>
                  <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Debit/Kredit</span>
                  <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Transfer</span>
                  <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Tunai</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
