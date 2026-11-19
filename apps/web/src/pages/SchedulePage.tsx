import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { AppHelmet } from '../components/common/AppHelmet';
import { OpenNowBadge } from '../components/common/OpenNowBadge';
import { DEFAULT_HERO_DOCTORS } from '../lib/fallback-data';
import { useClinicSettings } from '../lib/clinic-settings';
import { buildWhatsAppLink } from '../lib/utils';

export const SchedulePage: React.FC = () => {
  const { lang, t } = useI18n();
  const settings = useClinicSettings();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const docs = await getDoctors();
        setDoctors(docs.length > 0 ? docs : DEFAULT_HERO_DOCTORS);
      } catch {
        setDoctors(DEFAULT_HERO_DOCTORS);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const emergencyWaLink = buildWhatsAppLink(
    settings.whatsappNumber,
    'Halo Klinik Gigi Senyum Sehat, saya memerlukan bantuan darurat sakit gigi di luar jam praktik reguler.'
  );

  return (
    <>
      <AppHelmet
        title={t.schedule.pageTitle}
        description={t.schedule.pageDesc}
        path="/jadwal"
      />

      <PageHeader title={t.schedule.pageTitle} description={t.schedule.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Practice Hours Summary Banner */}
          <div className="mb-8 p-5 sm:p-8 rounded-2xl bg-surface border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="mb-2">
                <OpenNowBadge />
              </div>
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary">
                {lang === 'en' ? 'Clinical Timetable & Shifts' : 'Jadwal Praktik Dokter Spesialis'}
              </h2>
              <p className="text-xs sm:text-sm text-text-muted">
                {lang === 'en'
                  ? 'Monday – Saturday: 09:00 – 20:00 WIB · Sunday: Emergency On-Call Only'
                  : 'Senin – Sabtu: 09:00 – 20:00 WIB · Minggu: Khusus Konsultasi Darurat On-Call'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="px-4 py-2.5 rounded-xl bg-bg-alt border border-border text-xs text-text-muted">
                <span className="block font-semibold text-secondary">Waktu Indonesia Barat (WIB)</span>
                <span>Pendaftaran online 24 jam</span>
              </div>
            </div>
          </div>

          {/* Timetable Interactive Segmented View */}
          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : (
            <div className="p-5 sm:p-8 rounded-2xl bg-surface border border-border shadow-card">
              <ScheduleTabs doctors={doctors} />
            </div>
          )}

          {/* Sunday emergency notice */}
          <div className="mt-8 p-5 sm:p-8 rounded-2xl border border-amber-300/60 bg-amber-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-amber-950">
                  {t.schedule.closedSunday}
                </h3>
                <p className="text-xs sm:text-sm text-amber-900/80 mt-1 leading-relaxed max-w-2xl">
                  {lang === 'en'
                    ? 'For severe acute toothaches, crown fractures, or trauma outside regular clinic hours, our on-call dental triage team is reachable via WhatsApp hotline.'
                    : 'Untuk keadaan darurat sakit gigi hebat, patah mahkota gigi, atau trauma gigi mendadak di luar jam reguler, tim on-call kami tetap siaga merespons via WhatsApp.'}
                </p>
              </div>
            </div>
            <a
              href={emergencyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp whitespace-nowrap py-3.5 px-6 text-sm cursor-pointer shrink-0 shadow-soft w-full sm:w-auto text-center justify-center min-h-[48px] flex items-center active:scale-[0.98]"
            >
              <span>{lang === 'en' ? 'Emergency WhatsApp' : 'Hotline Darurat WA'}</span>
            </a>
          </div>

        </div>
      </div>
    </>
  );
};
