import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getDoctor, getServices } from '../lib/api';
import { Doctor, Service } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';
import { PriceRow } from '../components/common/PriceRow';
import { DEFAULT_HERO_DOCTORS, DEFAULT_SERVICES } from '../lib/fallback-data';

export const DoctorDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { lang, t, localePath } = useI18n();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [photoFailed, setPhotoFailed] = useState(false);

  useEffect(() => {
    async function load() {
      if (!slug) return;
      setLoading(true);
      const [docData, allServices] = await Promise.all([
        getDoctor(slug).catch(() => null),
        getServices().catch(() => [] as Service[]),
      ]);
      const resolvedDoc = docData || DEFAULT_HERO_DOCTORS.find((d) => d.slug === slug || d.id === slug) || null;
      const resolvedServices = allServices.length > 0 ? allServices : DEFAULT_SERVICES;
      setDoctor(resolvedDoc);
      if (resolvedDoc) {
        setServices(resolvedServices.filter((s) => resolvedDoc.serviceIds.includes(s.id) || resolvedDoc.serviceIds.includes(s.slug)));
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

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8 shadow-card">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-secondary mb-4">
            {lang === 'en' ? 'Doctor Profile Not Found' : 'Profil Dokter Tidak Ditemukan'}
          </h1>
          <p className="text-sm text-text-muted mb-6">
            {lang === 'en'
              ? 'The doctor profile you are looking for is unavailable.'
              : 'Profil dokter yang Anda tuju tidak tersedia atau tautan tidak valid.'}
          </p>
          <Link
            to={localePath('/dokter')}
            className="btn-primary text-sm cursor-pointer"
          >
            {t.doctors.backToDoctors}
          </Link>
        </div>
      </div>
    );
  }

  const title = lang === 'en' ? doctor.titleEn : doctor.title;
  const specialty = lang === 'en' ? doctor.specialtyEn : doctor.specialty;
  const bio = lang === 'en' ? doctor.bioEn : doctor.bio;

  // Determine current day of week (0=Sun, 1=Mon, ..., 6=Sat)
  const todayDay = new Date().getDay();

  return (
    <>
      <AppHelmet
        title={doctor.name}
        description={`${specialty} - ${title}`}
        path={`/dokter/${doctor.slug}`}
      />

      <PageHeader title={doctor.name} description={[specialty, title].filter(Boolean).join(' · ')} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Breadcrumb */}
          <div className="mb-6">
            <Link
              to={localePath('/dokter')}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              <span>{t.doctors.backToDoctors}</span>
            </Link>
          </div>

          {/* Main Profile Card */}
          <div className="bg-surface rounded-2xl border border-border shadow-card p-5 sm:p-8 lg:p-10 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start mb-12">
            {/* Doctor Photo Column */}
            <div className="md:col-span-5 space-y-4">
              {doctor.photoUrl && !photoFailed ? (
                <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-none mx-auto aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-bg-alt relative shadow-sm">
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    onError={() => setPhotoFailed(true)}
                    className="w-full h-full object-cover object-top"
                  />
                  {doctor.experience && (
                    <div className="absolute bottom-3 left-3 px-3.5 py-1.5 rounded-full bg-surface/95 backdrop-blur-xs border border-border text-secondary text-xs font-bold shadow-xs">
                      <span className="text-accent mr-1">✦</span>
                      <span>{lang === 'en' ? doctor.experienceEn : doctor.experience}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full max-w-[280px] sm:max-w-[340px] md:max-w-none mx-auto">
                  <PhotoPlaceholder
                    label={doctor.name}
                    sublabel={specialty}
                    aspect="3:4"
                  />
                </div>
              )}

              {/* Verified SIP license block */}
              {doctor.sipNumber && (
                <div className="p-4 rounded-xl bg-bg-alt/70 border border-border/70 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5 mb-1 font-bold text-secondary">
                    <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>{t.doctors.sipBadge} Terverifikasi</span>
                  </div>
                  <span className="font-mono text-text">{doctor.sipNumber}</span>
                </div>
              )}
            </div>

            {/* Doctor Info Column */}
            <div className="md:col-span-7 space-y-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2.5">
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {specialty}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-alt text-secondary border border-border">
                    Konsultasi Bahasa: ID · EN
                  </span>
                </div>

                <h1 className="font-heading text-2xl sm:text-3xl font-bold text-secondary">
                  {doctor.name}
                </h1>
                <p className="text-sm text-text-muted font-medium mt-1">
                  {title}
                </p>
              </div>

              {/* Bio & Philosophy */}
              <div className="p-5 rounded-xl bg-bg-alt/50 border border-border/70">
                <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-2">
                  {lang === 'en' ? 'Clinical Philosophy' : 'Filosofi Perawatan'}
                </span>
                <p className="text-sm sm:text-base text-text leading-relaxed">
                  "{bio}"
                </p>
              </div>

              {/* Education & Credentials */}
              {doctor.education && doctor.education.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                    {t.doctors.education}
                  </h3>
                  <ul className="space-y-2.5 text-sm text-text">
                    {doctor.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent mt-2 shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Practice Schedule */}
              <div className="p-5 rounded-xl bg-bg-alt/70 border border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  {t.doctors.weeklyHours}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
                  {doctor.workingHours.map((wh) => {
                    const isToday = wh.weekday === todayDay;
                    return (
                      <div
                        key={wh.weekday}
                        className={`flex items-center justify-between py-1.5 px-2.5 rounded-lg transition-colors ${
                          isToday ? 'bg-primary/10 font-semibold text-primary' : 'text-text-muted'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isToday && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                          <span className={isToday ? 'text-primary' : 'text-text'}>
                            {t.schedule.days[wh.weekday as keyof typeof t.schedule.days]}
                          </span>
                          {isToday && <span className="text-[10px] uppercase tracking-wide bg-primary/20 text-primary px-1.5 py-0.5 rounded">Hari Ini</span>}
                        </span>
                        <span className="font-semibold tabular-nums text-secondary">
                          {wh.start} – {wh.end} WIB
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Book Appointment CTA */}
              <div className="pt-2">
                <Link
                  to={localePath(`/booking?dokter=${doctor.id}`)}
                  className="btn-primary w-full sm:w-auto justify-center py-3.5 px-8 text-sm cursor-pointer shadow-soft min-h-[48px] active:scale-[0.98]"
                >
                  <span>{t.doctors.bookWithDoctor}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>

          {/* Services handled by this doctor */}
          <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary mb-1.5">
              {t.doctors.servicesHandled}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              {lang === 'en'
                ? `Procedures routinely handled with precision by ${doctor.name}`
                : `Tindakan medis yang dilakukan secara rutin oleh ${doctor.name}`}
            </p>
            <div className="border-t border-border divide-y divide-border">
              {services.map((svc, idx) => (
                <PriceRow key={svc.id} service={svc} index={idx} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
