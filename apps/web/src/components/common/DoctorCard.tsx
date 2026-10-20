import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { PhotoPlaceholder } from './PhotoPlaceholder';
import { useI18n } from '../../i18n';

interface DoctorCardProps {
  doctor: Doctor;
  compact?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, compact = false }) => {
  const { lang, t, localePath } = useI18n();
  const [photoFailed, setPhotoFailed] = useState(false);
  const title = lang === 'en' ? doctor.titleEn : doctor.title;
  const specialty = lang === 'en' ? doctor.specialtyEn : doctor.specialty;
  const bio = lang === 'en' ? doctor.bioEn : doctor.bio;
  const experience =
    (lang === 'en' ? doctor.experienceEn : doctor.experience) ||
    (doctor.experienceYears ? `${doctor.experienceYears}+ ${lang === 'en' ? 'years' : 'tahun'}` : 'SIP Resmi');

  return (
    <article className="doctor-card flex flex-col justify-between h-full group">
      <div>
        {doctor.photoUrl && !doctor.photoUrl.includes('unsplash.com') && !photoFailed ? (
          <div className="w-full h-[240px] overflow-hidden bg-bg-alt relative border-b border-border">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              loading="lazy"
              onError={() => setPhotoFailed(true)}
              className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="p-3 pb-0">
            <PhotoPlaceholder
              label={`[FOTO ${doctor.name.toUpperCase()}]`}
              sublabel={specialty}
              aspect={compact ? '4:3' : '4:3'}
              className="h-[220px]"
            />
          </div>
        )}

        <div className="p-6 pb-4">
          <h3 className="font-heading text-lg font-bold text-text">
            <Link to={localePath(`/dokter/${doctor.slug}`)} className="hover:text-primary transition-colors">
              {doctor.name}
            </Link>
          </h3>
          <p className="text-primary font-semibold text-sm mt-0.5">
            {specialty}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {title}
          </p>

          {!compact && (
            <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2 mt-3">
              {bio}
            </p>
          )}

          {/* Demo pattern: experience + language pills */}
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between gap-2 text-sm flex-wrap">
              <span className="text-text-muted font-medium text-xs">
                {experience}
              </span>
              <div className="flex gap-1.5 flex-wrap">
                <span className="px-2 py-0.5 bg-bg-alt text-text-muted text-xs font-medium rounded-md border border-border">
                  Indonesia
                </span>
                <span className="px-2 py-0.5 bg-bg-alt text-text-muted text-xs font-medium rounded-md border border-border">
                  English
                </span>
              </div>
            </div>

            {/* Schedule snippet */}
            {doctor.workingHours && doctor.workingHours.length > 0 && (
              <div className="text-xs text-text-muted mt-3 pt-2.5 border-t border-border/60 truncate">
                <span className="font-semibold text-text">{t.doctors.weeklyHours}:</span>{' '}
                {doctor.workingHours
                  .map((w) => `${t.schedule.days[w.weekday as keyof typeof t.schedule.days]} (${w.start}-${w.end})`)
                  .join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 pt-0 flex flex-col gap-2.5">
        <Link
          to={localePath(`/dokter/${doctor.slug}`)}
          className="btn-secondary w-full text-sm py-2.5 min-h-[44px]"
        >
          {t.common.moreDetail}
        </Link>
        <Link
          to={localePath(`/booking?dokter=${doctor.id}`)}
          className="btn-primary w-full text-sm py-2.5 min-h-[44px]"
        >
          <span>{t.common.bookNow}</span>
        </Link>
      </div>
    </article>
  );
};
