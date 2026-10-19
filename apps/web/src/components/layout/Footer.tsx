import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { buildWhatsAppLink } from '../../lib/utils';
import { OpenNowBadge } from '../common/OpenNowBadge';

export const Footer: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();

  const emergencyWaLink = buildWhatsAppLink(
    settings.whatsappNumber || '6281289001234',
    lang === 'en'
      ? 'Hello [NAMA KLINIK], I need emergency dental assistance.'
      : 'Halo [NAMA KLINIK], saya memerlukan bantuan darurat sakit gigi.'
  );

  const trustBadges = lang === 'en'
    ? [
        'Registered with Ministry of Health RI',
        'Class B Autoclave Sterilization Standard',
        'Verified STR & SIP Specialist Dentists',
      ]
    : [
        'Terdaftar Resmi Kemenkes RI',
        'Standar Sterilisasi Autoclave Kelas B',
        'Dokter Berizin Resmi STR & SIP',
      ];

  return (
    <footer className="bg-bg-dark text-white py-12 sm:py-16 mt-20" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 4-Column Main Footer Grid matching demo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 mb-10 sm:mb-12">
          {/* Col 1: Brand, About & Emergency Callout Box */}
          <div>
            <Link to={localePath('/')} className="flex items-center gap-3 mb-4 group">
              <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center shrink-0 group-hover:bg-white/20 transition-colors">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <div>
                <span className="font-heading text-lg font-bold text-white block leading-tight">
                  {t.brandName}
                </span>
                <span className="block text-xs text-white/75">
                  {t.tagline}
                </span>
              </div>
            </Link>

            <p className="text-white/80 text-sm mb-5 leading-relaxed">
              {t.footer.aboutText}
            </p>

            <div className="mb-5">
              <OpenNowBadge variant="dark" />
            </div>

            {/* Emergency WhatsApp / Hotline Box matching demo's bg-error card */}
            <div className="bg-error-dark rounded-xl p-4">
              <div className="font-heading font-semibold text-sm text-white mb-1 flex items-center gap-2">
                <svg className="w-4 h-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{lang === 'en' ? 'Emergency Dental Hotline' : 'Darurat Sakit Gigi (WA)'}</span>
              </div>
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-white hover:underline block"
              >
                {settings.phone || '+62 21 7890 1234'}
              </a>
            </div>
          </div>

          {/* Col 2: Services / Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-base text-white mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to={localePath('/')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link to={localePath('/dokter')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.doctors}
                </Link>
              </li>
              <li>
                <Link to={localePath('/jadwal')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link to={localePath('/harga')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.prices}
                </Link>
              </li>
              <li>
                <Link to={localePath('/hasil-kami')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.results}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: For Patients (Indonesian equivalents, no US Portal/Medicare) */}
          <div>
            <h4 className="font-heading font-semibold text-base text-white mb-4">
              {lang === 'en' ? 'For Patients' : 'Untuk Pasien'}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to={localePath('/booking')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.bookNow}
                </Link>
              </li>
              <li>
                <Link to={localePath('/booking/kelola')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5 font-medium">
                  {t.nav.manageBooking}
                </Link>
              </li>
              <li>
                <Link to={localePath('/pasien')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.patient}
                </Link>
              </li>
              <li>
                <Link to={localePath('/fasilitas')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.facilities}
                </Link>
              </li>
              <li>
                <Link to={localePath('/testimoni')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.testimonials.pageTitle}
                </Link>
              </li>
              <li>
                <Link to={localePath('/artikel')} className="text-white/75 hover:text-white transition-colors rounded px-1 py-0.5">
                  {t.nav.articles}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hours & Location */}
          <div>
            <h4 className="font-heading font-semibold text-base text-white mb-4">
              {t.footer.hoursTitle}
            </h4>
            <div className="space-y-3 text-sm text-white/80">
              <div>
                <span className="block text-white font-semibold">
                  {settings.regularHours.weekdays || 'Senin – Sabtu'}
                </span>
                <span>{settings.regularHours.weekdaysTime || '09:00 – 20:00 WIB'}</span>
              </div>
              <div>
                <span className="block text-white font-semibold">
                  {settings.regularHours.sunday || 'Minggu'}
                </span>
                <span>{settings.regularHours.sundayTime || 'Tutup (On Call Darurat)'}</span>
              </div>
              <div className="text-xs text-white/70">
                {settings.regularHours.breakTime || 'Istirahat: 12:00 – 13:00 WIB'}
              </div>
              <div className="pt-3 border-t border-white/15 text-xs text-white/75 space-y-1">
                <p>{settings.address || '[ALAMAT KLINIK], Jakarta Selatan'}</p>
                <p>
                  <Link to={localePath('/kontak')} className="text-white hover:underline font-medium">
                    {t.nav.contact} →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Indonesian Clinical Trust Badges Row (replaces JCAHO / HIPAA / ADA) */}
        <div className="border-t border-white/15 pt-8 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {trustBadges.map((badgeText) => (
              <div key={badgeText} className="flex items-center gap-2 text-white/80 text-sm">
                <svg className="w-5 h-5 text-success shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <span>{badgeText}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Copyright & Legal Links */}
        <div className="border-t border-white/15 pt-8 pb-10 lg:pb-0 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-white/75 text-sm text-center md:text-left">
            {t.footer.legalNotice}
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-white/75">
            <Link to={localePath('/privacy')} className="hover:text-white transition-colors rounded px-1">
              {t.footer.privacyLink}
            </Link>
            <Link to={localePath('/terms')} className="hover:text-white transition-colors rounded px-1">
              {t.footer.termsLink}
            </Link>
            <Link to={localePath('/booking/kelola')} className="hover:text-white transition-colors rounded px-1">
              {t.nav.manageBooking}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
