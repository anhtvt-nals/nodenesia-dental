import { PageHeader } from '../components/common/PageHeader';
import React from 'react';
import { useI18n } from '../i18n';
import { useClinicSettings } from '../lib/clinic-settings';
import { OpenNowBadge } from '../components/common/OpenNowBadge';
import { AppHelmet } from '../components/common/AppHelmet';
import { StaticMap } from '../components/common/StaticMap';
import { buildWhatsAppLink } from '../lib/utils';

export const ContactPage: React.FC = () => {
  const { lang, t } = useI18n();
  const settings = useClinicSettings();

  const waLink = buildWhatsAppLink(
    settings.whatsappNumber,
    t.booking.waPrefillGeneral
  );

  return (
    <>
      <AppHelmet
        title={t.contact.pageTitle}
        description={t.contact.pageDesc}
        path="/kontak"
      />

      <PageHeader title={t.contact.pageTitle} description={t.contact.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left 6 cols: Details & Direct Channels */}
            <div className="lg:col-span-6 space-y-6">
              {/* Status & Hours Table */}
              <div className="bg-surface rounded-2xl border border-border p-5 sm:p-8 shadow-card">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <h2 className="font-heading text-xl font-bold text-secondary">
                    {t.contact.hoursTitle}
                  </h2>
                  <OpenNowBadge />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border/70">
                    <span className="font-semibold text-text">Senin – Sabtu</span>
                    <span className="text-primary font-bold">09:00 – 20:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border/70">
                    <span className="text-text-muted">Istirahat Siang</span>
                    <span className="text-text-muted">12:00 – 13:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-amber-900 font-medium">
                    <span>Minggu & Libur Nasional</span>
                    <span className="text-xs bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">On Call Darurat</span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="bg-surface rounded-2xl border border-border p-5 sm:p-8 shadow-card space-y-4">
                <h2 className="font-heading text-xl font-bold text-secondary">
                  {t.contact.contactTitle}
                </h2>

                <div className="space-y-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp w-full justify-between py-3.5 px-5 text-sm cursor-pointer shadow-soft min-h-[48px] flex items-center active:scale-[0.98]"
                  >
                    <span>{t.contact.chatWhatsApp}</span>
                    <span className="font-mono">+{settings.whatsappNumber}</span>
                  </a>

                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn-secondary w-full justify-between py-3.5 px-5 text-sm cursor-pointer min-h-[48px] flex items-center active:scale-[0.98]"
                  >
                    <span>{t.contact.callClinic}</span>
                    <span className="font-mono">{settings.phone}</span>
                  </a>

                  <div className="p-4 rounded-xl bg-bg-alt/70 border border-border flex items-center justify-between text-sm">
                    <span className="font-semibold text-secondary">Instagram Resmi</span>
                    <span className="font-bold text-primary">{settings.instagramHandle}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Call Box */}
              <div className="p-5 sm:p-6 rounded-2xl border border-amber-300/60 bg-amber-50/50">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950 block mb-1.5">
                  {t.contact.emergencyTitle}
                </span>
                <p className="text-xs sm:text-sm text-amber-900/80 mb-4 leading-relaxed">
                  {t.contact.emergencyDesc}
                </p>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-whatsapp py-3 px-5 text-xs sm:text-sm font-semibold cursor-pointer min-h-[44px] inline-flex items-center active:scale-[0.98]"
                >
                  <span>{t.contact.emergencyBtn}</span>
                </a>
              </div>
            </div>

            {/* Right 6 cols: Address & Full-bleed Map */}
            <div className="lg:col-span-6 space-y-6">
              <div className="bg-surface rounded-2xl border border-border p-5 sm:p-8 shadow-card">
                <h2 className="font-heading text-xl font-bold text-secondary mb-2">
                  {t.contact.addressTitle}
                </h2>
                <p className="text-base text-text mb-3 leading-relaxed font-medium">
                  {settings.address}
                </p>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  {lang === 'en'
                    ? 'Landmark: Near Blok M MRT station & CSW TransJakarta hub. Dedicated valet and private on-site parking available for clinic patients.'
                    : 'Patokan: Dekat stasiun MRT Blok M & Halte CSW TransJakarta. Tersedia area parkir khusus mobil dan motor di pelataran klinik.'}
                </p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-3 px-5 cursor-pointer inline-flex items-center gap-2 min-h-[44px] active:scale-[0.98]"
                >
                  <span>{t.contact.viewOnMap}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>

              {/* Map: raster tiles */}
              <StaticMap
                lat={-6.2408}
                lng={106.8032}
                href={settings.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
                label={lang === 'en' ? 'Open clinic location in maps' : 'Buka lokasi klinik di peta'}
                className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden p-0 h-[340px] sm:h-[400px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
