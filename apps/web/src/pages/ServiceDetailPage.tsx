import { PageHeader } from '../components/common/PageHeader';
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
import { DEFAULT_SERVICES, DEFAULT_HERO_DOCTORS } from '../lib/fallback-data';

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
        getService(slug).catch(() => null),
        getDoctors().catch(() => [] as Doctor[]),
      ]);
      const resolvedService = svcData || DEFAULT_SERVICES.find((s) => s.slug === slug || s.id === slug) || null;
      const resolvedDocs = allDocs.length > 0 ? allDocs : DEFAULT_HERO_DOCTORS;
      setService(resolvedService);
      if (resolvedService) {
        const matchingDocs = resolvedDocs.filter((d) => d.serviceIds.includes(resolvedService.id) || d.serviceIds.includes(resolvedService.slug));
        setDoctors(matchingDocs.length > 0 ? matchingDocs : resolvedDocs.slice(0, 2));
      }
      setLoading(false);
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted">{t.common.loading}</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-secondary mb-3">
            {lang === 'en' ? 'Service Not Found' : 'Layanan Tidak Ditemukan'}
          </h1>
          <p className="text-sm text-text-muted mb-6">
            {lang === 'en'
              ? 'The dental procedure you are looking for is unavailable.'
              : 'Layanan gigi yang Anda tuju tidak tersedia atau tautan tidak valid.'}
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

      <PageHeader title={name} description={lang === 'en' ? service.shortDescEn : service.shortDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
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

          {/* Service Header & Meta Card */}
          <div className="bg-surface rounded-2xl border border-border p-5 sm:p-8 lg:p-10 shadow-card mb-10">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                {t.services.categories[service.category]}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-alt text-secondary border border-border">
                Ruang Tindakan: Zona {service.zone.toUpperCase()}
              </span>
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-bg-alt/70 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                  {t.services.startingFrom}
                </span>
                <div className="font-heading text-2xl sm:text-4xl font-extrabold text-primary">
                  {formatRupiah(service.priceFrom, lang === 'en')}
                </div>
                {priceNote && (
                  <span className="text-xs text-text-muted block">
                    {priceNote}
                  </span>
                )}
              </div>

              <div className="space-y-1 sm:text-right">
                <span className="text-xs font-bold uppercase tracking-wider text-text-muted block">
                  {t.services.duration}
                </span>
                <div className="font-heading text-xl sm:text-2xl font-bold text-secondary flex items-center sm:justify-end gap-2">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>{service.durationMinutes} {t.common.minutes}</span>
                </div>
              </div>
            </div>

            {/* CTAs: Full width on mobile for easy one-hand tapping */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
              <Link
                to={localePath(`/booking?layanan=${service.slug}`)}
                className="btn-primary text-sm py-3.5 px-8 cursor-pointer shadow-soft w-full sm:w-auto text-center justify-center min-h-[48px] active:scale-[0.98]"
              >
                <span>{t.services.bookThisService}</span>
                <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <a
                href={waServiceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp text-sm py-3.5 px-6 cursor-pointer w-full sm:w-auto text-center justify-center min-h-[48px] active:scale-[0.98]"
              >
                <span>{t.booking.askViaWhatsApp}</span>
                <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>

          {/* Detailed Clinical Description */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 lg:p-10 shadow-card mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary mb-4">
              {lang === 'en' ? 'Clinical Procedure & Overview' : 'Deskripsi Prosedur Medis'}
            </h2>
            <div className="prose max-w-none text-text leading-relaxed text-sm sm:text-base space-y-4">
              <p>{desc}</p>
              <p className="text-text-muted">
                {lang === 'en'
                  ? 'All procedures are performed in a Class B autoclave-sterilized operatory under strict specialist supervision. Before treatment commences, you will receive an intraoral camera demonstration and written treatment plan.'
                  : 'Seluruh prosedur dilakukan dalam lingkungan steril dengan instrumen bersegel Autoclave Class B dan pengawasan ketat dokter gigi spesialis. Pasien akan mendapatkan penjelasan pra-tindakan terperinci melalui kamera intraoral serta panduan perawatan pasca-tindakan.'}
              </p>
            </div>
          </div>

          {/* Attending Doctors for this service */}
          <div className="mb-12">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary mb-1.5">
              {t.services.doctorsForService}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {lang === 'en'
                ? 'Certified specialists practicing this procedure at Senyum Sehat'
                : 'Dokter spesialis yang menangani tindakan ini di klinik kami'}
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
              <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary mb-6">
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
