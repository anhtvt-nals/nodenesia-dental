import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getDoctor, getServices } from '../lib/api';
import { Doctor, Service } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { PhotoPlaceholder } from '../components/common/PhotoPlaceholder';
import { PriceRow } from '../components/common/PriceRow';

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
        getDoctor(slug),
        getServices(),
      ]);
      setDoctor(docData);
      if (docData) {
        setServices(allServices.filter((s) => docData.serviceIds.includes(s.id)));
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

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <div className="trust-card p-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-4">
            Profil Dokter Tidak Ditemukan
          </h1>
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

  return (
    <>
      <AppHelmet
        title={doctor.name}
        description={`${specialty} - ${title}`}
        path={`/dokter/${doctor.slug}`}
      />

      <div className="py-10 md:py-16 bg-bg">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

          <div className="trust-card p-6 sm:p-8 bg-bg-card grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-10 items-start mb-12">
            {/* Doctor Photo */}
            <div className="md:col-span-5">
              {doctor.photoUrl && !photoFailed ? (
                <div className="w-full aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-bg-alt relative">
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    onError={() => setPhotoFailed(true)}
                    className="w-full h-full object-cover object-top"
                  />
                  {doctor.experience && (
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-bg-card/95 backdrop-blur-sm border border-border text-text text-xs font-bold shadow-sm">
                      {lang === 'en' ? doctor.experienceEn : doctor.experience}
                    </div>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder
                  label={doctor.name}
                  sublabel={specialty}
                  aspect="3:4"
                />
              )}
              {doctor.sipNumber && (
                <div className="mt-4 p-4 rounded-xl bg-bg-alt border border-border text-xs text-text-muted">
                  <span className="block font-bold text-text mb-0.5">{t.doctors.sipBadge}</span>
                  <span>{doctor.sipNumber}</span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="md:col-span-7">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="badge badge-primary">{specialty}</span>
                <span className="badge badge-success">Indonesia · English</span>
              </div>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-1.5">
                {doctor.name}
              </h1>
              <p className="text-sm font-medium text-text-muted mb-6">
                {title}
              </p>

              <div className="prose max-w-none text-text-muted text-base leading-relaxed mb-8">
                <p>{bio}</p>
              </div>

              {/* Education */}
              {doctor.education && (
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-2.5">
                    {t.doctors.education}
                  </h3>
                  <ul className="space-y-2 text-sm text-text-muted">
                    {doctor.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Practice Hours */}
              <div className="mb-8 p-5 rounded-xl bg-bg-alt border border-border">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary mb-3">
                  {t.doctors.weeklyHours}
                </h3>
                <div className="space-y-2 text-xs sm:text-sm text-text-muted">
                  {doctor.workingHours.map((wh) => (
                    <div key={wh.weekday} className="flex items-center justify-between py-1 border-b border-border/60 last:border-0">
                      <span className="font-semibold text-text">
                        {t.schedule.days[wh.weekday as keyof typeof t.schedule.days]}
                      </span>
                      <span className="font-medium text-primary">{wh.start} – {wh.end} WIB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Link
                to={localePath(`/booking?dokter=${doctor.id}`)}
                className="btn-primary w-full sm:w-auto justify-center py-3 px-8 cursor-pointer"
              >
                <span>{t.doctors.bookWithDoctor}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Services handled by this doctor */}
          <div className="trust-card p-6 sm:p-8 bg-bg-card">
            <h2 className="font-heading text-2xl font-bold text-text mb-1.5">
              {t.doctors.servicesHandled}
            </h2>
            <p className="text-sm text-text-muted mb-6">
              Tindakan medis yang dilakukan secara rutin oleh {doctor.name}
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
