import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { AppHelmet } from '../components/common/AppHelmet';
import { OpenNowBadge } from '../components/common/OpenNowBadge';

export const SchedulePage: React.FC = () => {
  const { lang, t } = useI18n();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const docs = await getDoctors();
      setDoctors(docs);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.schedule.pageTitle}
        description={t.schedule.pageDesc}
        path="/jadwal"
      />

      <div className="py-10 md:py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className="badge badge-primary">
                {lang === 'en' ? 'Doctor Practice Hours' : 'Jam Praktek Dokter'}
              </span>
              <OpenNowBadge />
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.schedule.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.schedule.pageDesc}
            </p>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="trust-card p-6 md:p-8 bg-bg-card">
              <ScheduleTabs doctors={doctors} />
            </div>
          )}

          {/* Sunday emergency notice */}
          <div className="mt-8 p-6 rounded-2xl border border-error/25 bg-error/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-error/15 text-error-dark flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-text">
                  {t.schedule.closedSunday}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mt-0.5">
                  Untuk keadaan darurat sakit gigi hebat atau trauma gigi, tim kami tetap siaga melalui WhatsApp.
                </p>
              </div>
            </div>
            <a
              href="https://wa.me/6281289001234?text=Halo%20Klinik,%20saya%20memerlukan%20bantuan%20darurat%20sakit%20gigi."
              target="_blank"
              rel="noopener noreferrer"
              className="btn-emergency whitespace-nowrap cursor-pointer"
            >
              <span>Hotline Darurat WA</span>
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
