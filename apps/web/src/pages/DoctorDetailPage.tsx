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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#14201C]/60">
        {t.common.loading}
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Profil Dokter Tidak Ditemukan</h1>
        <Link
          to={localePath('/dokter')}
          className="px-6 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider"
        >
          {t.doctors.backToDoctors}
        </Link>
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

      <div className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <Link
              to={localePath('/dokter')}
              className="text-xs font-mono text-[#14201C]/60 hover:text-[#14201C] underline underline-offset-4"
            >
              ← {t.doctors.backToDoctors}
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start mb-12 pb-12 hairline-b">
            {/* Doctor Photo */}
            <div className="md:col-span-5">
              {doctor.photoUrl && !photoFailed ? (
                <div className="w-full aspect-[3/4] overflow-hidden hairline-border bg-[#E9E4D8] relative">
                  <img
                    src={doctor.photoUrl}
                    alt={doctor.name}
                    onError={() => setPhotoFailed(true)}
                    className="w-full h-full object-cover object-top filter brightness-[0.98]"
                  />
                  {doctor.experience && (
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#14201C]/85 backdrop-blur-sm text-[#F4F1EA] text-xs font-mono uppercase tracking-wider">
                      {lang === 'en' ? doctor.experienceEn : doctor.experience}
                    </div>
                  )}
                </div>
              ) : (
                <PhotoPlaceholder
                  label={`[FOTO ${doctor.name.toUpperCase()}]`}
                  sublabel={specialty}
                  aspect="3:4"
                />
              )}
              {doctor.sipNumber && (
                <div className="mt-3 p-3 bg-[#E9E4D8]/50 hairline-border text-xs font-mono text-[#14201C]/70">
                  <span className="block font-medium text-[#14201C] mb-0.5">{t.doctors.sipBadge}</span>
                  <span>{doctor.sipNumber}</span>
                </div>
              )}
            </div>

            {/* Doctor Info */}
            <div className="md:col-span-7">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
                {specialty}
              </span>
              <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-2">
                {doctor.name}
              </h1>
              <p className="text-sm font-mono text-[#14201C]/70 mb-6">
                {title}
              </p>

              <div className="prose max-w-none text-[#14201C]/80 font-sans text-base leading-relaxed mb-8">
                <p>{bio}</p>
              </div>

              {/* Education */}
              {doctor.education && (
                <div className="mb-8">
                  <h3 className="font-mono text-xs uppercase tracking-wider text-[#14201C]/50 mb-2">
                    {t.doctors.education}
                  </h3>
                  <ul className="space-y-1.5 text-sm font-sans text-[#14201C]/80">
                    {doctor.education.map((edu, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#1F3D36]">·</span>
                        <span>{edu}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weekly Practice Hours */}
              <div className="mb-8 p-4 bg-[#E9E4D8]/50 hairline-border">
                <h3 className="font-mono text-xs uppercase tracking-wider text-[#14201C]/60 mb-2">
                  {t.doctors.weeklyHours}
                </h3>
                <div className="space-y-1 text-xs font-mono text-[#14201C]/80">
                  {doctor.workingHours.map((wh) => (
                    <div key={wh.weekday} className="flex items-center justify-between">
                      <span className="font-medium text-[#14201C]">
                        {t.schedule.days[wh.weekday as keyof typeof t.schedule.days]}:
                      </span>
                      <span>{wh.start} – {wh.end} WIB</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action */}
              <Link
                to={localePath(`/booking?dokter=${doctor.id}`)}
                className="w-full sm:w-auto inline-block text-center px-8 py-3.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
              >
                {t.doctors.bookWithDoctor} →
              </Link>
            </div>
          </div>

          {/* Services handled by this doctor */}
          <div>
            <h2 className="font-serif text-2xl text-[#14201C] mb-2">
              {t.doctors.servicesHandled}
            </h2>
            <p className="text-xs font-mono text-[#14201C]/60 mb-6">
              Tindakan medis yang dilakukan secara rutin oleh {doctor.name}
            </p>
            <div className="hairline-t divide-y divide-[#14201C]/10">
              {services.map((svc) => (
                <PriceRow key={svc.id} service={svc} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
