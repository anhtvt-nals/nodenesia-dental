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
      ? `Hello ${settings.name || 'Klinik Gigi Senyum Sehat'}, I need emergency dental assistance.`
      : `Halo ${settings.name || 'Klinik Gigi Senyum Sehat'}, saya memerlukan bantuan darurat sakit gigi.`
  );

  return (
    <footer className="bg-primary text-bg pt-14 pb-24 sm:pt-16 sm:pb-24" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-bg/15">
          {/* Col 1: Brand & Hotline */}
          <div className="min-w-0">
            <Link to={localePath('/')} className="inline-block mb-3">
              <span className="font-heading text-xl font-bold text-bg block">
                {t.brandName}
              </span>
              <span className="block text-xs text-bg/75 mt-0.5">
                {t.tagline}
              </span>
            </Link>

            <p className="text-bg/80 text-sm mb-5 leading-relaxed">
              {t.footer.aboutText}
            </p>

            <div className="mb-5">
              <OpenNowBadge variant="dark" showDetail={false} />
            </div>

            <div className="pt-4 border-t border-bg/15">
              <span className="block text-xs text-bg/75 mb-1">
                {lang === 'en' ? 'Emergency toothache line (WhatsApp)' : 'Saluran darurat sakit gigi (WhatsApp)'}
              </span>
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-semibold text-bg underline underline-offset-4 hover:opacity-85"
              >
                {settings.phone || '+62 21 7208 4500'}
              </a>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-heading font-medium text-base text-bg mb-4">
              {t.footer.quickLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={localePath('/')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link to={localePath('/dokter')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.doctors}
                </Link>
              </li>
              <li>
                <Link to={localePath('/jadwal')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link to={localePath('/harga')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.prices}
                </Link>
              </li>
              <li>
                <Link to={localePath('/hasil-kami')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.results}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Patient Links */}
          <div>
            <h3 className="font-heading font-medium text-base text-bg mb-4">
              {lang === 'en' ? 'Patient information' : 'Informasi pasien'}
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to={localePath('/booking')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.bookNow}
                </Link>
              </li>
              <li>
                <Link to={localePath('/booking/kelola')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.manageBooking}
                </Link>
              </li>
              <li>
                <Link to={localePath('/pasien')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.patient}
                </Link>
              </li>
              <li>
                <Link to={localePath('/fasilitas')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.facilities}
                </Link>
              </li>
              <li>
                <Link to={localePath('/testimoni')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.testimonials.pageTitle}
                </Link>
              </li>
              <li>
                <Link to={localePath('/artikel')} className="text-bg/80 hover:text-bg transition-colors">
                  {t.nav.articles}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Hours & Address */}
          <div>
            <h3 className="font-heading font-medium text-base text-bg mb-4">
              {t.footer.hoursTitle}
            </h3>
            <div className="space-y-3 text-sm text-bg/80">
              <div>
                <span className="block text-bg font-medium">
                  {settings.regularHours.weekdays || 'Senin – Sabtu'}
                </span>
                <span>{settings.regularHours.weekdaysTime || '09:00 – 20:00 WIB'}</span>
              </div>
              <div>
                <span className="block text-bg font-medium">
                  {settings.regularHours.sunday || 'Minggu'}
                </span>
                <span>{settings.regularHours.sundayTime || 'Darurat dengan perjanjian via WhatsApp'}</span>
              </div>
              <div className="pt-3 border-t border-bg/15 text-xs text-bg/80 space-y-1.5">
                <p>{settings.address || 'Jl. Wolter Monginsidi No. 88, Kebayoran Baru, Jakarta Selatan'}</p>
                <p>
                  <Link to={localePath('/kontak')} className="text-bg underline underline-offset-4 hover:opacity-85 font-medium">
                    {t.nav.contact}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Single Trust Line in Footer Only (per Step 2 override) */}
        <div className="py-6 border-b border-bg/15 text-xs sm:text-sm text-bg/85">
          {lang === 'en'
            ? 'Registered with Indonesian Ministry of Health (Kemenkes RI) · Verified Specialist Licenses (STR & SIP) · Hospital-Grade Class B Autoclave Sterilization'
            : 'Terdaftar Resmi Kemenkes RI · Dokter Gigi Spesialis Berizin (STR & SIP) · Sterilisasi Autoclave Kelas B'}
        </div>

        {/* Copyright & Legal */}
        <div className="pt-6 pb-12 min-[800px]:pb-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-bg/75">
          <p>{t.footer.legalNotice}</p>
          <div className="flex flex-wrap gap-6">
            <Link to={localePath('/privacy')} className="hover:text-bg transition-colors">
              {t.footer.privacyLink}
            </Link>
            <Link to={localePath('/terms')} className="hover:text-bg transition-colors">
              {t.footer.termsLink}
            </Link>
            <Link to={localePath('/booking/kelola')} className="hover:text-bg transition-colors">
              {t.nav.manageBooking}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
