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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-medium text-text-muted">
        {t.common.loading}
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="trust-card p-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-3">
            Layanan Tidak Ditemukan
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Layanan gigi yang Anda tuju tidak tersedia atau tautan tidak valid.
          </p>
          <Link
            to={localePath('/layanan')}
            className="btn-primary text-sm cursor-pointer"
          >
            {t.services.backToServices}
          </Link>
        </div>
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

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={localePath('/layanan')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{t.services.backToServices}</span>
            </Link>
          </div>

          {/* Service Header & Meta */}
          <div className="trust-card p-6 sm:p-8 bg-bg-card mb-10">
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <span className="badge badge-primary">
                {t.services.categories[service.category]}
              </span>
              <span className="badge badge-success">
                Zona: {service.zone.toUpperCase()}
              </span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-6 text-balance">
              {name}
            </h1>

            <div className="p-5 sm:p-6 rounded-xl bg-bg-alt border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  {t.services.startingFrom}
                </span>
                <div className="font-heading text-3xl font-extrabold text-primary">
                  {formatRupiah(service.priceFrom, lang === 'en')}
                </div>
                {priceNote && (
                  <span className="text-xs text-text-muted block">
                    {priceNote}
                  </span>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-xs font-semibold text-text-muted uppercase tracking-wider block">
                  {t.services.duration}
                </span>
                <div className="font-heading text-2xl font-bold text-text">
                  {service.durationMinutes} {t.common.minutes}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3.5">
              <Link
                to={localePath(`/booking?layanan=${service.slug}`)}
                className="btn-primary text-sm py-3 px-6 cursor-pointer"
              >
                <span>{t.services.bookThisService}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a
                href={waServiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-sm py-3 px-6 cursor-pointer"
              >
                <span>{t.booking.askViaWhatsApp}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Detailed Clinical Description */}
          <div className="trust-card p-6 sm:p-8 bg-bg-card mb-12">
            <h2 className="font-heading text-2xl font-bold text-text mb-4">
              Deskripsi Prosedur Medis
            </h2>
            <div className="prose max-w-none text-text-muted leading-relaxed text-base space-y-4">
              <p>{desc}</p>
              <p>
                Seluruh prosedur dilakukan dalam lingkungan steril dengan pengawasan ketat oleh dokter gigi spesialis. Pasien akan mendapatkan penjelasan pra-tindakan terperinci serta panduan perawatan pasca-tindakan untuk memastikan hasil optimal.
              </p>
            </div>
          </div>

          {/* Attending Doctors for this service */}
          <div className="mb-12">
            <h2 className="font-heading text-2xl font-bold text-text mb-1.5">
              {t.services.doctorsForService}
            </h2>
            <p className="text-sm text-text-muted mb-6">
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
            <div className="pt-8 border-t border-border">
              <h2 className="font-heading text-2xl font-bold text-text mb-6">
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
