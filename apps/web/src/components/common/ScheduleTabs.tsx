import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { useI18n } from '../../i18n';

interface ScheduleTabsProps {
  doctors: Doctor[];
  initialDay?: number;
  variant?: 'light' | 'pine';
}

/**
 * Segmented control schedule timetable.
 * Displays on-duty specialists with clear shift slots and handles empty days
 * gracefully by pointing to the nearest available clinic practice day.
 */
export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({
  doctors,
  initialDay,
  variant = 'light',
}) => {
  const { lang, t, localePath } = useI18n();
  const weekdays = [1, 2, 3, 4, 5, 6]; // Senin (1) to Sabtu (6)
  const isPine = variant === 'pine';

  // Determine current weekday in Asia/Jakarta (1-6, default to 1 if Sunday 0)
  const getCurrentDay = () => {
    try {
      const now = new Date();
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Jakarta',
        weekday: 'short',
      }).formatToParts(now);
      const dayStr = parts.find((p) => p.type === 'weekday')?.value;
      const dayMap: Record<string, number> = {
        Mon: 1,
        Tue: 2,
        Wed: 3,
        Thu: 4,
        Fri: 5,
        Sat: 6,
        Sun: 0,
      };
      const d = dayStr ? dayMap[dayStr] ?? 1 : 1;
      return d === 0 ? 1 : d;
    } catch {
      return 1;
    }
  };

  const [activeDay, setActiveDay] = useState<number>(initialDay || getCurrentDay());
  const currentTodayDay = getCurrentDay();

  if (doctors.length === 0) {
    return (
      <div
        className={`py-12 text-center text-base ${
          isPine ? 'text-white/80' : 'text-text-muted'
        }`}
      >
        <span className="inline-block w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-3 align-middle" />
        {t.common.loading}
      </div>
    );
  }

  // Filter doctors working on activeDay
  const onDutyDoctors = doctors
    .map((doc) => {
      const shifts = doc.workingHours.filter((w) => w.weekday === activeDay);
      return {
        doc,
        shifts,
      };
    })
    .filter(({ shifts }) => shifts.length > 0);

  // Find nearest day with slots if activeDay has none
  const findNearestDayWithSlots = (): number => {
    for (let offset = 1; offset <= 6; offset++) {
      const checkDay = ((activeDay - 1 + offset) % 6) + 1;
      const hasSlots = doctors.some((d) => d.workingHours.some((w) => w.weekday === checkDay));
      if (hasSlots) return checkDay;
    }
    return 1; // Default to Monday
  };

  const nearestDay = findNearestDayWithSlots();
  const nearestDayName = t.schedule.days[nearestDay as keyof typeof t.schedule.days];

  return (
    <div className="w-full">
      {/* 1. Segmented Control Day Selector (Snap-scrollable on mobile) */}
      <div
        role="tablist"
        aria-label={lang === 'en' ? 'Select weekday schedule' : 'Pilih jadwal hari praktek'}
        className={`p-1.5 rounded-2xl flex items-center gap-1.5 overflow-x-auto scrollbar-none snap-x snap-mandatory border ${
          isPine
            ? 'bg-black/30 border-white/10 backdrop-blur-md'
            : 'bg-surface border-border shadow-xs'
        }`}
      >
        {weekdays.map((dayNum) => {
          const isSelected = dayNum === activeDay;
          const isToday = dayNum === currentTodayDay;
          const dayName = t.schedule.days[dayNum as keyof typeof t.schedule.days];

          return (
            <button
              key={dayNum}
              type="button"
              role="tab"
              aria-selected={isSelected}
              onClick={() => setActiveDay(dayNum)}
              className={`flex-1 min-w-[96px] snap-center py-3 px-3 min-h-[44px] rounded-xl text-sm font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center justify-center gap-2 active:scale-[0.98] ${
                isSelected
                  ? isPine
                    ? 'bg-white text-secondary shadow-md font-bold scale-[1.01]'
                    : 'bg-primary text-white shadow-md font-bold scale-[1.01]'
                  : isPine
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-text-muted hover:text-text hover:bg-bg-alt'
              }`}
            >
              <span>{dayName}</span>
              {isToday && (
                <span
                  className={`text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded font-bold ${
                    isSelected
                      ? isPine
                        ? 'bg-accent/20 text-accent-text'
                        : 'bg-white/20 text-white'
                      : isPine
                      ? 'bg-white/20 text-white'
                      : 'bg-primary/10 text-primary'
                  }`}
                >
                  {lang === 'en' ? 'Today' : 'Hari Ini'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 2. On-Duty Specialist Timeline Cards */}
      <div className="mt-6 space-y-4">
        {onDutyDoctors.length > 0 ? (
          onDutyDoctors.map(({ doc, shifts }) => {
            const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
            const fallbackImg =
              'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=300&h=300&q=80';

            return (
              <div
                key={doc.id}
                className={`p-5 sm:p-6 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                  isPine
                    ? 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/[0.08]'
                    : 'bg-surface border-border shadow-soft hover:border-primary/30 hover:shadow-hover'
                }`}
              >
                {/* Doctor Identity */}
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden shrink-0 border border-white/20 bg-bg-alt shadow-xs">
                    <img
                      src={doc.photoUrl || fallbackImg}
                      alt={doc.name}
                      className="w-full h-full object-cover object-top"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0">
                    <Link
                      to={localePath(`/dokter/${doc.slug}`)}
                      className={`font-heading font-bold text-lg sm:text-xl block truncate ${
                        isPine ? 'text-white hover:text-accent' : 'text-secondary hover:text-primary'
                      }`}
                    >
                      {doc.name}
                    </Link>
                    <p
                      className={`text-sm truncate mt-1 ${
                        isPine ? 'text-white/75' : 'text-text-muted'
                      }`}
                    >
                      {specialty} {doc.experienceYears ? `· ${doc.experienceYears} th pengalaman` : ''}
                    </p>
                  </div>
                </div>

                {/* Shift Hours & Action CTA */}
                <div className="flex flex-col md:flex-row md:items-center justify-between md:justify-end gap-3.5 sm:gap-4 pt-3.5 md:pt-0 border-t md:border-t-0 border-white/10 w-full md:w-auto">
                  <div className="flex flex-wrap items-center gap-2">
                    {shifts.map((s, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tabular-nums border ${
                          isPine
                            ? 'bg-white/10 text-white border-white/15'
                            : 'bg-bg-alt text-secondary border-border'
                        }`}
                      >
                        <svg
                          className="w-4 h-4 text-accent"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <circle cx="12" cy="12" r="9" />
                          <path strokeLinecap="round" d="M12 7v5l3 2" />
                        </svg>
                        <span>
                          {s.start} – {s.end} WIB
                        </span>
                      </span>
                    ))}
                  </div>

                  <Link
                    to={localePath(`/booking?dokter=${doc.id}`)}
                    className={`inline-flex items-center justify-center min-h-[48px] w-full md:w-auto px-6 py-3 rounded-xl text-sm font-bold transition-all shrink-0 cursor-pointer active:scale-[0.98] ${
                      isPine
                        ? 'bg-accent text-white hover:bg-accent-hover shadow-md'
                        : 'btn-primary'
                    }`}
                  >
                    <span>{t.schedule.bookSlot || t.common.bookNow}</span>
                    <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          /* Graceful State when no slots on this specific day (never an empty dead-end) */
          <div
            className={`p-8 sm:p-10 rounded-2xl border text-center ${
              isPine ? 'bg-white/5 border-white/10 text-white' : 'bg-surface border-border text-text'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-accent/20 text-accent flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <path strokeLinecap="round" d="M12 6v6l4 2" />
              </svg>
            </div>
            <h4 className="font-heading font-bold text-xl sm:text-2xl mb-2">
              {lang === 'en'
                ? 'No Practice Slots on this Day'
                : 'Tidak Ada Praktek Rutin di Hari Ini'}
            </h4>
            <p className={`text-sm sm:text-base max-w-lg mx-auto mb-6 leading-relaxed ${isPine ? 'text-white/80' : 'text-text-muted'}`}>
              {lang === 'en'
                ? `The clinic is resting or on special procedures. The closest available practice day is ${nearestDayName} starting from 09:00 WIB.`
                : `Klinik sedang persiapan tindakan khusus atau libur. Jadwal praktek terdekat dengan spesialis tersedia pada hari ${nearestDayName} mulai pukul 09:00 WIB.`}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setActiveDay(nearestDay)}
                className="btn-primary rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer"
              >
                {lang === 'en' ? `View ${nearestDayName} Schedule` : `Lihat Jadwal ${nearestDayName}`}
              </button>
              <Link
                to={localePath('/booking')}
                className={`rounded-xl px-5 py-2.5 text-sm font-semibold border transition-all ${
                  isPine
                    ? 'border-white/30 text-white hover:bg-white/10'
                    : 'border-border text-text hover:bg-bg-alt'
                }`}
              >
                {lang === 'en' ? 'Book Custom Date' : 'Buat Janji Fleksibel'}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* 3. Footer Note & Sunday Warning */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm pt-4 border-t border-white/10">
        <p className={`flex items-center gap-2 ${isPine ? 'text-white/70' : 'text-text-muted'}`}>
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span>{t.schedule.closedSunday} (Hari Minggu Buka Khusus Janji Darurat via WhatsApp)</span>
        </p>

        <Link
          to={localePath('/jadwal')}
          className={`font-semibold transition-colors flex items-center gap-1.5 ${
            isPine ? 'text-accent hover:text-white' : 'text-primary hover:underline'
          }`}
        >
          <span>{lang === 'en' ? 'View all doctors schedule' : 'Lihat direktori jadwal lengkap'}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};
