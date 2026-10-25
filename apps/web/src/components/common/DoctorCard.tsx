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
    (doctor.experienceYears ? `${doctor.experienceYears}+ ${lang === 'en' ? 'years' : 'tahun'}` : '');

  return (
    <article className="border-b border-border pb-6 flex flex-col justify-between h-full">
      <div>
        {/* TODO: Replace demo stock portrait with verified in-clinic doctor photography */}
        {doctor.photoUrl && !photoFailed ? (
          <div className="w-full h-[260px] overflow-hidden bg-bg-alt photo-asymmetric mb-5 border border-border">
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              loading="lazy"
              onError={() => setPhotoFailed(true)}
              className="w-full h-full object-cover object-top"
            />
          </div>
        ) : (
          <div className="mb-5">
            <PhotoPlaceholder
              label={doctor.name}
              sublabel={specialty}
              aspect={compact ? '4:3' : '4:3'}
              className="h-[240px] photo-asymmetric"
            />
          </div>
        )}

        <div>
          <h3 className="font-heading text-xl font-bold text-text">
            <Link to={localePath(`/dokter/${doctor.slug}`)} className="hover:text-primary transition-colors">
              {doctor.name}
            </Link>
          </h3>
          <p className="text-primary font-medium text-sm mt-0.5">
            {specialty}
          </p>
          <p className="text-text-muted text-sm mt-1">
            {title}
          </p>

          {!compact && (
            <p className="text-sm text-text-muted leading-relaxed mt-3">
              {bio}
            </p>
          )}

          <div className="mt-4 pt-3 border-t border-border/60 text-xs text-text-muted space-y-1.5">
            {experience && (
              <div>
                <span className="font-semibold text-text">{experience}</span>
                {doctor.sipNumber ? ` · ${doctor.sipNumber}` : ''}
              </div>
            )}
            {doctor.workingHours && doctor.workingHours.length > 0 && (
              <div className="truncate">
                <span className="font-semibold text-text">{t.doctors.weeklyHours}:</span>{' '}
                {doctor.workingHours
                  .map((w) => `${t.schedule.days[w.weekday as keyof typeof t.schedule.days]} (${w.start}–${w.end})`)
                  .join(', ')}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-5 flex items-center justify-between gap-4 text-sm font-semibold">
        <Link
          to={localePath(`/dokter/${doctor.slug}`)}
          className="text-text-muted hover:text-primary underline underline-offset-4"
        >
          {t.common.moreDetail}
        </Link>
        <Link
          to={localePath(`/booking?dokter=${doctor.id}`)}
          className="text-primary hover:underline underline-offset-4"
        >
          {t.common.bookNow}
        </Link>
      </div>
    </article>
  );
};
