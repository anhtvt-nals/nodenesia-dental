import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { useClinicSettings } from '../lib/clinic-settings';
import { getService, getDoctors } from '../lib/api';
import { Service, Doctor } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { DoctorCard } from '../components/common/DoctorCard';
import { FaqAccordion } from '../components/common/FaqAccordion';
import { formatRupiah, buildWhatsAppLink } from '../lib/utils';

export const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();

  const [service, setService] = useState<Service | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const [svcData, allDocs] = await Promise.all([
        getService(slug),
        getDoctors(),
      ]);
      setService(svcData);
      if (svcData) {
        const matchingDocs = allDocs.filter((d) => d.serviceIds.includes(svcData.id));
        setDoctors(matchingDocs.length > 0 ? matchingDocs : allDocs.slice(0, 2));
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#14201C]/60">
        {t.common.loading}
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Layanan Tidak Ditemukan</h1>
        <p className="text-sm font-sans text-[#14201C]/70 mb-6">
          Layanan gigi yang Anda tuju tidak tersedia atau tautan tidak valid.
        </p>
        <Link
          to={localePath('/layanan')}
          className="px-6 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider"
        >
          {t.services.backToServices}
        </Link>
      </div>
    );
  }

  const name = lang === 'en' ? service.nameEn : service.name;
  const desc = lang === 'en' ? service.descriptionEn : service.description;
  const priceNote = lang === 'en' ? service.priceNoteEn : service.priceNote;

  const waServiceLink = buildWhatsAppLink(
    settings.whatsappNumber,
    `${t.booking.waPrefillService}"${name}"`
  );

  return (
    <>
      <AppHelmet
        title={name}
        description={lang === 'en' ? service.shortDescEn : service.shortDesc}
        path={`/layanan/${service.slug}`}
      />

      <div className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={localePath('/layanan')}
              className="text-xs font-mono text-[#14201C]/60 hover:text-[#14201C] underline underline-offset-4"
            >
              ← {t.services.backToServices}
            </Link>
          </div>

          {/* Service Header & Meta */}
          <div className="mb-10 pb-8 hairline-b">
            <div className="flex items-center gap-3 text-xs font-mono text-[#1F3D36] uppercase tracking-wider mb-3">
              <span>{t.services.categories[service.category]}</span>
              <span>·</span>
              <span>Zona: {service.zone.toUpperCase()}</span>
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-[#14201C] tracking-tight mb-6 text-balance">
              {name}
            </h1>

            <div className="p-6 bg-[#E9E4D8]/50 hairline-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-mono text-[#14201C]/60 uppercase tracking-wider block">
                  {t.services.startingFrom}
                </span>
                <div className="font-mono text-3xl font-medium text-[#1F3D36]">
                  {formatRupiah(service.priceFrom, lang === 'en')}
                </div>
                {priceNote && (
                  <span className="text-xs font-mono text-[#14201C]/70 block">
                    {priceNote}
                  </span>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-xs font-mono text-[#14201C]/60 uppercase tracking-wider block">
                  {t.services.duration}
                </span>
                <div className="font-mono text-2xl text-[#14201C]">
                  {service.durationMinutes} {t.common.minutes}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                to={localePath(`/booking?layanan=${service.slug}`)}
                className="px-6 py-3.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
              >
                {t.services.bookThisService} →
              </Link>
              <a
                href={waServiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 hairline-border bg-[#F4F1EA] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#E9E4D8] transition-colors"
              >
                {t.booking.askViaWhatsApp}
              </a>
            </div>
          </div>

          {/* Detailed Clinical Description */}
          <div className="mb-14">
            <h2 className="font-serif text-2xl text-[#14201C] mb-4">
              Deskripsi Prosedur Medis
            </h2>
            <div className="prose max-w-none text-[#14201C]/80 font-sans leading-relaxed text-base space-y-4">
              <p>{desc}</p>
              <p>
                Seluruh prosedur dilakukan dalam lingkungan steril dengan pengawasan ketat oleh dokter gigi spesialis. Pasien akan mendapatkan penjelasan pra-tindakan terperinci serta panduan perawatan pasca-tindakan untuk memastikan hasil optimal.
              </p>
            </div>
          </div>

          {/* Attending Doctors for this service */}
          <div className="mb-14 pt-8 hairline-t">
            <h2 className="font-serif text-2xl text-[#14201C] mb-2">
              {t.services.doctorsForService}
            </h2>
            <p className="text-xs font-mono text-[#14201C]/60 mb-6">
              Dokter spesialis yang menangani tindakan ini di klinik kami
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {doctors.map((doc) => (
                <DoctorCard key={doc.id} doctor={doc} compact />
              ))}
            </div>
          </div>

          {/* Service FAQs */}
          {service.faqs && service.faqs.length > 0 && (
            <div className="pt-8 hairline-t">
              <h2 className="font-serif text-2xl text-[#14201C] mb-6">
                {t.services.faqTitle}
              </h2>
              <FaqAccordion
                faqs={service.faqs.map((f, i) => ({
                  id: `faq-${i}`,
                  question: f.question,
                  questionEn: f.questionEn,
                  answer: f.answer,
                  answerEn: f.answerEn,
                }))}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
