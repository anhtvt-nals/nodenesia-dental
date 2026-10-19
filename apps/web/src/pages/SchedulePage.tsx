import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { AppHelmet } from '../components/common/AppHelmet';
import { OpenNowBadge } from '../components/common/OpenNowBadge';

export const SchedulePage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36]">
                Jam Praktek Dokter
              </span>
              <span>·</span>
              <OpenNowBadge />
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.schedule.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.schedule.pageDesc}
            </p>
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : (
            <div className="p-6 md:p-8 hairline-border bg-[#F4F1EA]">
              <ScheduleTabs doctors={doctors} />
            </div>
          )}

          {/* Sunday emergency notice */}
          <div className="mt-8 p-6 hairline-border bg-[#E9E4D8]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl text-[#14201C]">
                {t.schedule.closedSunday}
              </h3>
              <p className="text-xs font-mono text-[#14201C]/70 mt-1">
                Untuk keadaan darurat sakit gigi hebat atau trauma gigi, tim kami tetap siaga.
              </p>
            </div>
            <a
              href="https://wa.me/6281289001234?text=Halo%20Klinik,%20saya%20memerlukan%20bantuan%20darurat%20sakit%20gigi."
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#C8553D] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#a6432e] transition-colors whitespace-nowrap"
            >
              Hotline Darurat WA
            </a>
          </div>
        </div>
      </div>
    </>
  );
};
