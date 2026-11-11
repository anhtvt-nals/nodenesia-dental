import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';
import { useClinicSettings } from '../lib/clinic-settings';
import { buildWhatsAppLink } from '../lib/utils';

export const NotFoundPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();

  const waEmergencyLink = buildWhatsAppLink(
    settings.whatsappNumber,
    'Halo Resepsionis Klinik Senyum Sehat, saya membutuhkan bantuan informasi perawatan.'
  );

  return (
    <>
      <AppHelmet
        title={t.notFound.title}
        description={t.notFound.desc}
        path="/404"
      />

      <main className="hero-pattern min-h-[80vh] flex items-center justify-center py-12 sm:py-16 px-4 relative overflow-hidden">
        <div className="max-w-xl w-full mx-auto text-center relative z-10">

          {/* Aesthetic 404 Tooth Sculpture / Emblem */}
          <div className="relative inline-flex items-center justify-center mb-6">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-surface border border-border shadow-card flex items-center justify-center relative rotate-3 hover:rotate-0 transition-transform duration-300">
              {/* Dental Atelier Emblem SVG */}
              <svg className="w-14 h-14 text-primary" viewBox="0 0 36 36" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 9c-3.5-3.8-8-1.5-7 3.5.7 3.2 1.4 9.5 3.5 10.5 1.4.5 1.8-4 3.5-4s2.2 4.5 3.5 4c2.2-1 2.9-7.3 3.5-10.5 1-5-3.5-7.3-7-3.5z" />
                <path d="M15 11c1 .8 2.5.8 3.5 0" strokeWidth="1.4" />
              </svg>
              {/* Warm Ochre Sparkles */}
              <span className="absolute -top-2 -right-2 text-accent text-lg font-bold animate-pulse">✦</span>
              <span className="absolute -bottom-1 -left-2 text-accent text-xs font-bold">✦</span>
            </div>

            {/* Floating Error Badge */}
            <span className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-secondary text-surface text-xs font-mono font-bold tracking-widest uppercase shadow-sm">
              ERROR 404
            </span>
          </div>

          {/* Typography */}
          <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-secondary tracking-tight mb-3">
            {lang === 'en' ? 'Page Not Found' : 'Halaman Tidak Ditemukan'}
          </h1>

          <p className="text-sm sm:text-base text-text-muted max-w-md mx-auto mb-8 leading-relaxed">
            {lang === 'en'
              ? 'The treatment page or resource you are looking for might have been relocated or is temporarily unavailable.'
              : 'Sepertinya Anda tersesat di luar klinik kami. Ruang perawatan yang Anda tuju mungkin telah dipindahkan atau tautan yang dimasukkan kurang tepat.'}
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
            <Link
              to={localePath('/')}
              className="btn-primary w-full sm:w-auto justify-center text-sm py-3 px-7 cursor-pointer shadow-soft"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span>{t.notFound.backHome}</span>
            </Link>

            <Link
              to={localePath('/layanan')}
              className="btn-secondary w-full sm:w-auto justify-center text-sm py-3 px-6 cursor-pointer"
            >
              <span>{t.notFound.exploreServices}</span>
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          {/* Quick Helpful Shortcuts */}
          <div className="pt-6 border-t border-border/70 max-w-md mx-auto">
            <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-3">
              {lang === 'en' ? 'Quick Navigation' : 'Layanan & Informasi Cepat'}
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                to={localePath('/booking')}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                {lang === 'en' ? 'Book Online' : 'Buat Janji Temu'}
              </Link>
              <Link
                to={localePath('/jadwal')}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                {lang === 'en' ? 'Doctor Schedule' : 'Jadwal Praktik'}
              </Link>
              <Link
                to={localePath('/dokter')}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                {lang === 'en' ? 'Our Doctors' : 'Dokter Spesialis'}
              </Link>
              <Link
                to={localePath('/kontak')}
                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-xs font-semibold text-secondary hover:text-primary hover:border-primary/40 transition-colors"
              >
                {lang === 'en' ? 'Location & Maps' : 'Lokasi Klinik'}
              </Link>
            </div>

            <div className="mt-4">
              <a
                href={waEmergencyLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-accent hover:text-accent-hover inline-flex items-center gap-1.5"
              >
                <span>{lang === 'en' ? 'Need immediate assistance? Chat with receptionist' : 'Butuh bantuan segera? Chat dengan resepsionis'}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

        </div>
      </main>
    </>
  );
};
