import React from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../../i18n';
import { useClinicSettings } from '../../lib/clinic-settings';
import { OpenNowBadge } from '../common/OpenNowBadge';

export const Footer: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();

  return (
    <footer className="bg-[#14201C] text-[#F4F1EA] pt-16 pb-24 lg:pb-16 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Col 1-2: Brand & Address */}
          <div className="lg:col-span-2">
            <Link
              to={localePath('/')}
              className="font-serif text-3xl tracking-tight text-[#F4F1EA] block mb-3"
            >
              {t.brandName}
            </Link>
            <p className="text-sm text-white/70 max-w-sm mb-6 leading-relaxed">
              {t.footer.aboutText}
            </p>
            <div className="mb-4">
              <OpenNowBadge className="bg-white/10 border-white/20 text-[#F4F1EA]" />
            </div>
            <div className="text-xs font-mono text-white/60 space-y-1">
              <p>{settings.address}</p>
              <p>Tel: {settings.phone} · WA: +{settings.whatsappNumber}</p>
            </div>
          </div>

          {/* Col 3: Navigation */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/50 mb-4">
              {t.footer.quickLinks}
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to={localePath('/')} className="hover:text-white transition-colors">
                  {t.nav.home}
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  {t.nav.services}
                </Link>
              </li>
              <li>
                <Link to={localePath('/dokter')} className="hover:text-white transition-colors">
                  {t.nav.doctors}
                </Link>
              </li>
              <li>
                <Link to={localePath('/jadwal')} className="hover:text-white transition-colors">
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link to={localePath('/harga')} className="hover:text-white transition-colors">
                  {t.nav.prices}
                </Link>
              </li>
              <li>
                <Link to={localePath('/pasien')} className="hover:text-white transition-colors">
                  {t.nav.patient}
                </Link>
              </li>
              <li>
                <Link to={localePath('/hasil-kami')} className="hover:text-white transition-colors">
                  {t.nav.results}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Secondary links */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/50 mb-4">
              Edukasi & Fasilitas
            </h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              <li>
                <Link to={localePath('/fasilitas')} className="hover:text-white transition-colors">
                  {t.nav.facilities}
                </Link>
              </li>
              <li>
                <Link to={localePath('/artikel')} className="hover:text-white transition-colors">
                  {t.nav.articles}
                </Link>
              </li>
              <li>
                <Link to={localePath('/testimoni')} className="hover:text-white transition-colors">
                  {t.testimonials.pageTitle}
                </Link>
              </li>
              <li>
                <Link to={localePath('/kontak')} className="hover:text-white transition-colors">
                  {t.nav.contact}
                </Link>
              </li>
              <li>
                <Link to={localePath('/booking/kelola')} className="hover:text-white transition-colors font-mono text-xs">
                  → {t.nav.manageBooking}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Operating Hours */}
          <div>
            <h4 className="font-mono text-xs uppercase tracking-wider text-white/50 mb-4">
              {t.footer.hoursTitle}
            </h4>
            <div className="text-xs font-mono text-white/70 space-y-2">
              <div>
                <span className="block text-white font-medium">{settings.regularHours.weekdays}</span>
                <span>{settings.regularHours.weekdaysTime}</span>
              </div>
              <div>
                <span className="block text-white font-medium">{settings.regularHours.sunday}</span>
                <span>{settings.regularHours.sundayTime}</span>
              </div>
              <div className="pt-2 text-white/50">
                {settings.regularHours.breakTime}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            {t.footer.legalNotice}
          </div>
          <div className="flex items-center gap-6">
            <Link to={localePath('/privacy')} className="hover:text-white underline underline-offset-4">
              {t.footer.privacyLink}
            </Link>
            <Link to={localePath('/terms')} className="hover:text-white underline underline-offset-4">
              {t.footer.termsLink}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
