import React from 'react';
import { useI18n } from '../i18n';
import { useClinicSettings } from '../lib/clinic-settings';
import { OpenNowBadge } from '../components/common/OpenNowBadge';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';
import { buildWhatsAppLink } from '../lib/utils';

export const ContactPage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Informasi & Lokasi
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.contact.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.contact.pageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left 6 cols: Details & Hours Table */}
            <div className="lg:col-span-6 space-y-8">
              {/* Status & Hours Table */}
              <div className="p-6 hairline-border bg-[#F4F1EA]">
                <div className="flex items-center justify-between gap-4 mb-4 pb-3 hairline-b">
                  <h2 className="font-serif text-2xl text-[#14201C]">
                    {t.contact.hoursTitle}
                  </h2>
                  <OpenNowBadge />
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div className="flex items-center justify-between py-1.5 hairline-b">
                    <span className="font-medium text-[#14201C]">Senin – Sabtu</span>
                    <span className="text-[#1F3D36] font-semibold">09:00 – 20:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 hairline-b">
                    <span className="text-[#14201C]/70">Istirahat Siang</span>
                    <span className="text-[#14201C]/70">12:00 – 13:00 WIB</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 hairline-b text-[#C8553D]">
                    <span className="font-medium">Minggu & Libur Nasional</span>
                    <span>Tutup (On Call Darurat)</span>
                  </div>
                </div>
              </div>

              {/* Direct Communication Channels */}
              <div className="p-6 hairline-border bg-[#F4F1EA] space-y-4">
                <h2 className="font-serif text-2xl text-[#14201C]">
                  {t.contact.contactTitle}
                </h2>

                <div className="space-y-3">
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-[#1F3D36] text-[#F4F1EA] hover:bg-[#162B26] transition-colors"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider">{t.contact.chatWhatsApp}</span>
                    <span className="font-mono text-xs">+{settings.whatsappNumber} →</span>
                  </a>

                  <a
                    href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex items-center justify-between p-3.5 hairline-border bg-[#E9E4D8]/50 hover:bg-[#E9E4D8] text-[#14201C] transition-colors"
                  >
                    <span className="font-mono text-xs uppercase tracking-wider">{t.contact.callClinic}</span>
                    <span className="font-mono text-xs">{settings.phone}</span>
                  </a>

                  <div className="p-3.5 hairline-border bg-[#E9E4D8]/30 flex items-center justify-between text-xs font-mono text-[#14201C]/80">
                    <span className="uppercase tracking-wider">Instagram</span>
                    <span className="font-medium text-[#1F3D36]">{settings.instagramHandle}</span>
                  </div>
                </div>
              </div>

              {/* Emergency Call Box */}
              <div className="p-6 hairline-border border-[#C8553D]/30 bg-[#C8553D]/5">
                <span className="font-mono text-xs uppercase tracking-wider text-[#C8553D] block mb-1 font-semibold">
                  {t.contact.emergencyTitle}
                </span>
                <p className="text-sm font-sans text-[#14201C]/80 mb-4 leading-relaxed">
                  {t.contact.emergencyDesc}
                </p>
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`}
                  className="inline-block px-5 py-2.5 bg-[#C8553D] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#a6432e] transition-colors"
                >
                  {t.contact.emergencyBtn} →
                </a>
              </div>
            </div>

            {/* Right 6 cols: Address & Map Placeholder */}
            <div className="lg:col-span-6 space-y-6">
              <div className="p-6 hairline-border bg-[#F4F1EA]">
                <h2 className="font-serif text-2xl text-[#14201C] mb-2">
                  {t.contact.addressTitle}
                </h2>
                <p className="font-sans text-base text-[#14201C]/85 mb-4 leading-relaxed">
                  {settings.address}
                </p>
                <p className="text-xs font-mono text-[#14201C]/60 mb-6">
                  Patokan: Dekat stasiun MRT / halte TransJakarta, area parkir mobil dan motor tersedia di lokasi klinik.
                </p>
                <a
                  href={settings.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block px-5 py-2.5 hairline-border bg-[#E9E4D8] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#DDD7C9] transition-colors"
                >
                  {t.contact.viewOnMap} ↗
                </a>
              </div>

              {/* Map Placeholder Block */}
              <PhotoPlaceholder
                label="[PETA LOKASI KLINIK]"
                sublabel={t.contact.mapPlaceholderNotice}
                aspect="16:9"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
