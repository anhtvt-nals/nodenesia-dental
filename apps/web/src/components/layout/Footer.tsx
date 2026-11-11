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
    <footer className="bg-[#122820] text-[#FBF9F5] pt-20 pb-28 sm:pt-24 sm:pb-20 border-t border-white/10" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Giant Closing Statement & Direct Booking Banner */}
        <div className="pb-16 mb-16 border-b border-white/10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
          <div className="lg:col-span-8">
            <span className="text-xs uppercase tracking-widest text-[#C48B46] font-semibold block mb-3">
              {lang === 'en' ? 'Boutique Specialist Dental Practice' : 'Praktek Dokter Gigi Spesialis'}
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.12]">
              {lang === 'en' ? (
                <>
                  Healthy smiles begin with <span className="italic text-[#C48B46]">gentle precision</span>.
                </>
              ) : (
                <>
                  Senyum sehat berawal dari perawatan yang <span className="italic text-[#C48B46]">tenang & presisi</span>.
                </>
              )}
            </h2>
          </div>
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3.5">
            <Link
              to={localePath('/booking')}
              className="inline-flex items-center justify-center min-h-[52px] px-8 rounded-xl bg-[#C48B46] text-white font-bold text-base hover:bg-[#B07835] transition-all shadow-lg text-center"
            >
              <span>{t.home.heroPrimaryCta}</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
            <a
              href={emergencyWaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center min-h-[52px] px-6 rounded-xl border border-white/20 text-white font-semibold text-sm hover:bg-white/10 transition-colors text-center"
            >
              <span className="w-2 h-2 rounded-full bg-[#C48B46] mr-2" />
              <span>{lang === 'en' ? 'Emergency WhatsApp 24/7' : 'Hotline Darurat Sakit Gigi'}</span>
            </a>
          </div>
        </div>

        {/* 4-Column Directory Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 pb-16 border-b border-white/10 text-sm">
          {/* Col 1: Brand & Operational status */}
          <div className="min-w-0">
            <Link to={localePath('/')} className="inline-block mb-4">
              <span className="font-heading text-2xl font-bold text-white block">
                {t.brandName}
              </span>
              <span className="block text-xs text-[#8E9F97] mt-1">
                Kebayoran Baru, Jakarta Selatan
              </span>
            </Link>

            <p className="text-[#A7B6AF] mb-6 leading-relaxed">
              {t.footer.aboutText}
            </p>

            <div className="mb-6">
              <OpenNowBadge variant="dark" showDetail={false} />
            </div>

            <div className="pt-4 border-t border-white/10">
              <span className="block text-xs text-[#8E9F97] mb-1 font-medium">
                {lang === 'en' ? 'Reception & Emergency WhatsApp' : 'Resepsionis & Darurat Gigi'}
              </span>
              <a
                href={emergencyWaLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-lg font-bold text-[#C48B46] hover:underline underline-offset-4 tracking-wide"
              >
                {settings.phone || '+62 21 7208 4500'}
              </a>
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-4">
              {lang === 'en' ? 'Specialized Treatments' : 'Layanan Spesialis'}
            </h3>
            <ul className="space-y-3 text-[#A7B6AF]">
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  Ortodonti & Kawat Gigi (Sp.Ort)
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  Konservasi Gigi & Veneer (Sp.KG)
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  Implan Gigi Titanium CBCT (Sp.BM)
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  Perawatan Saluran Akar Mikroskopis
                </Link>
              </li>
              <li>
                <Link to={localePath('/layanan')} className="hover:text-white transition-colors">
                  Bleaching In-Office & Pembersihan Karang
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Navigation & Patient Guide */}
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-4">
              {lang === 'en' ? 'Patient Portal' : 'Navigasi & Pasien'}
            </h3>
            <ul className="space-y-3 text-[#A7B6AF]">
              <li>
                <Link to={localePath('/booking')} className="hover:text-white transition-colors">
                  {t.nav.bookNow}
                </Link>
              </li>
              <li>
                <Link to={localePath('/jadwal')} className="hover:text-white transition-colors">
                  {t.nav.schedule}
                </Link>
              </li>
              <li>
                <Link to={localePath('/dokter')} className="hover:text-white transition-colors">
                  {t.nav.doctors}
                </Link>
              </li>
              <li>
                <Link to={localePath('/hasil-kami')} className="hover:text-white transition-colors">
                  {t.nav.results}
                </Link>
              </li>
              <li>
                <Link to={localePath('/fasilitas')} className="hover:text-white transition-colors">
                  {t.nav.facilities}
                </Link>
              </li>
              <li>
                <Link to={localePath('/booking/kelola')} className="hover:text-white transition-colors">
                  {t.nav.manageBooking}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Address, Transit & License */}
          <div>
            <h3 className="font-heading font-bold text-base text-white mb-4">
              {lang === 'en' ? 'Clinic & Directions' : 'Lokasi & Izin Praktek'}
            </h3>
            <address className="not-italic text-[#A7B6AF] space-y-2 mb-4 leading-relaxed">
              <p className="text-white font-medium">Klinik Gigi Senyum Sehat</p>
              <p>{settings.address || 'Jl. Wolter Monginsidi No. 88, Kebayoran Baru, Jakarta Selatan 12180'}</p>
              <p className="text-xs text-[#8E9F97] pt-1">
                🅿️ Parkir gratis 6 mobil di depan lobi · 5 menit dari Stasiun MRT Blok M
              </p>
            </address>

            <div className="pt-3 border-t border-white/10 text-xs text-[#8E9F97]">
              <p>Izin Operasional Klinik Pratama:</p>
              <p className="font-mono text-white/80 mt-0.5">503/4421/DPMPTSP/2023</p>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E9F97]">
          <p>© {new Date().getFullYear()} {settings.name || 'Klinik Gigi Senyum Sehat'}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to={localePath('/legal')} className="hover:text-white transition-colors">
              {lang === 'en' ? 'Privacy & Medical Records' : 'Kebijakan Privasi & Rekam Medis'}
            </Link>
            <Link to={localePath('/kontak')} className="hover:text-white transition-colors">
              {lang === 'en' ? 'Contact' : 'Kontak'}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
