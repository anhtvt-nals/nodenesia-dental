import React from 'react';
import { useI18n } from '../i18n';
import { useClinicSettings } from '../lib/clinic-settings';
import { OpenNowBadge } from '../components/common/OpenNowBadge';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';
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

      <div className="py-10 md:py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Information & Location' : 'Informasi & Lokasi'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.contact.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.contact.pageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
            {/* Left 6 cols: Details & Hours Table */}
            <div className="lg:col-span-6 space-y-6">
              {/* Status & Hours Table */}
              <div className="trust-card p-6 bg-bg-card">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-4 border-b border-border">
                  <h2 className="font-heading text-xl font-bold text-text">
                    {t.contact.hoursTitle}
                  </h2>
                  <OpenNowBadge />
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="font-semibold text-text">Senin – Sabtu</span>
                    <span className="text-primary font-bold">09:00 – 20:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-text-muted">Istirahat Siang</span>
                    <span className="text-text-muted">12:00 – 13:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-2 text-error-dark">
                    <span className="font-semibold">Minggu & Libur Nasional</span>
                    <span className="font-medium">Tutup (On Call Darurat)</span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="trust-card p-6 bg-bg-card space-y-4">
                <h2 className="font-heading text-xl font-bold text-text">
                  {t.contact.contactTitle}
                </h2>

                <div className="space-y-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp w-full justify-between py-3.5 px-5 text-sm cursor-pointer"
                  >
                    <span>{t.contact.chatWhatsApp}</span>
                    <span>+{settings.whatsappNumber}</span>
                  </a>

                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="btn-secondary w-full justify-between py-3.5 px-5 text-sm cursor-pointer"
                  >
                    <span>{t.contact.callClinic}</span>
                    <span>{settings.phone}</span>
                  </a>

                  <div className="p-4 rounded-xl bg-bg-alt border border-border flex items-center justify-between text-sm text-text-muted">
                    <span className="font-semibold text-text">Instagram</span>
                    <span className="font-bold text-primary">{settings.instagramHandle}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Call Box */}
              <div className="p-6 rounded-2xl border border-error/30 bg-error/5">
                <span className="text-xs font-bold uppercase tracking-wider text-error-dark block mb-1.5">
                  {t.contact.emergencyTitle}
                </span>
                <p className="text-sm text-text-muted mb-4 leading-relaxed">
                  {t.contact.emergencyDesc}
                </p>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="btn-emergency cursor-pointer"
                >
                  <span>{t.contact.emergencyBtn}</span>
                </a>
              </div>
            </div>

            {/* Right 6 cols: Address & Map Placeholder */}
            <div className="lg:col-span-6 space-y-6">
              <div className="trust-card p-6 bg-bg-card">
                <h2 className="font-heading text-xl font-bold text-text mb-2">
                  {t.contact.addressTitle}
                </h2>
                <p className="text-base text-text mb-3 leading-relaxed">
                  {settings.address}
                </p>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  Patokan: Dekat stasiun MRT / halte TransJakarta, area parkir mobil dan motor tersedia di lokasi klinik.
                </p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2.5 px-5 cursor-pointer"
                >
                  <span>{t.contact.viewOnMap}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>

              {/* Embedded Map Block */}
              <div className="trust-card p-0 bg-bg-alt overflow-hidden h-[340px] sm:h-[380px]">
                <iframe
                  title="Peta Lokasi Klinik Gigi Senyum Sehat"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=106.7985%2C-6.2440%2C106.8085%2C-6.2375&layer=mapnik&marker=-6.2408%2C106.8032"
                  className="w-full h-full border-0 block"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
