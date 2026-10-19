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

  return (
    <div className="hairline-border bg-[#F4F1EA] flex flex-col justify-between h-full group hover:bg-[#E9E4D8]/30 transition-colors">
      <div>
        {doctor.photoUrl && !photoFailed ? (
          <div className={`w-full overflow-hidden hairline-b bg-[#E9E4D8] relative ${compact ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              loading="lazy"
              onError={() => setPhotoFailed(true)}
              className="w-full h-full object-cover object-top filter brightness-[0.98] group-hover:scale-105 transition-transform duration-500"
            />
            {doctor.experience && (
              <div className="absolute bottom-2 left-2 px-2.5 py-1 bg-[#14201C]/85 backdrop-blur-sm text-[#F4F1EA] text-[10px] font-mono uppercase tracking-wider">
                {lang === 'en' ? doctor.experienceEn : doctor.experience}
              </div>
            )}
          </div>
        ) : (
          <PhotoPlaceholder
            label={`[FOTO ${doctor.name.toUpperCase()}]`}
            sublabel={specialty}
            aspect={compact ? '4:3' : '3:4'}
          />
        )}
        <div className="p-4 sm:p-6">
          <div className="text-xs font-mono text-[#1F3D36] uppercase tracking-wider mb-2">
            {specialty}
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-[#14201C] mb-1">
            <Link to={localePath(`/dokter/${doctor.slug}`)} className="hover:text-[#1F3D36] transition-colors">
              {doctor.name}
            </Link>
          </h3>
          <p className="text-xs font-mono text-[#14201C]/60 mb-3">
            {title}
          </p>
          {!compact && (
            <p className="text-xs sm:text-sm text-[#14201C]/75 leading-relaxed line-clamp-3 mb-4">
              {bio}
            </p>
          )}

          {/* Schedule snippet */}
          <div className="text-xs font-mono text-[#14201C]/60 pt-3 hairline-t">
            <span className="font-medium text-[#14201C]">{t.doctors.weeklyHours}:</span>{' '}
            {doctor.workingHours.map((w) => `${t.schedule.days[w.weekday as keyof typeof t.schedule.days]} (${w.start}-${w.end})`).join(', ')}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6 pt-0 flex items-center justify-between gap-3 hairline-t mt-3">
        <Link
          to={localePath(`/dokter/${doctor.slug}`)}
          className="text-xs font-mono uppercase tracking-wider text-[#14201C]/70 hover:text-[#14201C] underline underline-offset-4 py-2"
        >
          {t.common.moreDetail}
        </Link>
        <Link
          to={localePath(`/booking?dokter=${doctor.id}`)}
          className="px-4 py-2.5 min-h-[40px] flex items-center justify-center bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] active:bg-[#162B26] transition-colors whitespace-nowrap shadow-xs"
        >
          {t.common.bookNow} →
        </Link>
      </div>
    </div>
  );
};
