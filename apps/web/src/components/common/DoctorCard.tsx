import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { useI18n } from '../../i18n';

interface DoctorCardProps {
  doctor: Doctor;
  compact?: boolean;
}

export const DoctorCard: React.FC<DoctorCardProps> = ({ doctor, compact = false }) => {
  const { lang, t, localePath } = useI18n();
  const [failedPhoto, setFailedPhoto] = useState(false);

  const title = lang === 'en' ? doctor.titleEn || doctor.title : doctor.title;
  const specialty = lang === 'en' ? doctor.specialtyEn || doctor.specialty : doctor.specialty;
  const experience = (lang === 'en' ? doctor.experienceEn : doctor.experience)
    || (doctor.experienceYears ? `${doctor.experienceYears}+ ${lang === 'en' ? 'years exp.' : 'tahun pengalaman'}` : '');

  const days = [...new Set(doctor.workingHours.map((hour) => hour.weekday))];
  const profilePath = localePath(`/dokter/${doctor.slug}`);

  return (
    <article className="group bg-surface rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-hover hover:border-primary/40 transition-all duration-300 flex flex-col justify-between h-full">
      {/* Top Section: Portrait & Badges */}
      <div>
        <Link
          to={profilePath}
          className="block relative aspect-[4/4.2] overflow-hidden bg-bg-alt"
          aria-label={lang === 'en' ? `View profile of ${doctor.name}` : `Lihat profil ${doctor.name}`}
        >
          {doctor.photoUrl && !failedPhoto ? (
            <img
              src={doctor.photoUrl}
              alt={doctor.name}
              loading="lazy"
              width="600"
              height="630"
              onError={() => setFailedPhoto(true)}
              className="w-full h-full object-cover object-top transition-transform duration-500 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/5 text-secondary p-6 text-center">
              <span className="font-heading text-3xl font-bold tracking-wider mb-1">
                {doctor.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}
              </span>
              <span className="text-xs text-text-muted font-medium">
                {lang === 'en' ? 'Dental Specialist' : 'Dokter Spesialis'}
              </span>
            </div>
          )}

          {/* Experience floating badge */}
          {experience && (
            <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface/95 backdrop-blur-xs border border-border text-secondary text-[11px] font-bold shadow-xs">
              <span className="text-accent mr-1">✦</span>
              <span>{experience}</span>
            </div>
          )}

          {/* SIP badge on compact or desktop */}
          {doctor.sipNumber && (
            <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-secondary/85 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider shadow-xs">
              {doctor.sipNumber}
            </div>
          )}
        </Link>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-3">
          {/* Specialty tag */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
              {specialty}
            </span>
          </div>

          {/* Doctor Name */}
          <h3 className="font-heading text-lg sm:text-xl font-bold text-secondary group-hover:text-primary transition-colors leading-snug">
            <Link to={profilePath}>
              {doctor.name}
            </Link>
          </h3>

          {/* Degree / Official Title */}
          {title && (
            <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
              {title}
            </p>
          )}

          {/* Practice Schedule days chips */}
          <div className="pt-2">
            <span className="text-[11px] font-semibold text-text-muted block mb-1.5 uppercase tracking-wide">
              {t.doctors.weeklyHours}
            </span>
            {days.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {days.map((day) => (
                  <span
                    key={day}
                    className="inline-flex items-center px-2 py-0.5 rounded-md bg-bg-alt text-secondary text-[11px] font-medium border border-border/70"
                  >
                    {t.schedule.days[day as keyof typeof t.schedule.days]}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-muted">
                {lang === 'en' ? 'Contact clinic for schedule' : 'Hubungi klinik untuk jadwal praktik'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Actions Footer */}
      <div className="p-5 sm:p-6 pt-0 mt-auto flex items-center gap-2">
        <Link
          to={localePath(`/booking?dokter=${encodeURIComponent(doctor.id)}`)}
          className="flex-1 btn-primary py-2.5 px-3 text-xs sm:text-sm font-semibold justify-center min-h-[44px] active:scale-[0.98]"
        >
          <span>{lang === 'en' ? 'Book' : 'Buat Janji'}</span>
          <svg className="w-3.5 h-3.5 ml-1 inline" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 2v4m8-4v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2Z" />
          </svg>
        </Link>
        <Link
          to={profilePath}
          className="inline-flex items-center justify-center px-3.5 min-h-[44px] rounded-xl border border-border bg-surface text-secondary hover:bg-bg-alt hover:text-primary text-xs sm:text-sm font-semibold transition-colors active:scale-[0.98]"
          aria-label={lang === 'en' ? `Profile of ${doctor.name}` : `Profil ${doctor.name}`}
        >
          <span>{lang === 'en' ? 'Profile' : 'Profil'}</span>
          <span className="ml-1 text-xs" aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
};
