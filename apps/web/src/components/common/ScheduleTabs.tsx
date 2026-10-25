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
 * Modern Day-Switcher Timeline Schedule (Direction 3).
 * Allows patients to pick a day of the week (Mon–Sat) and view all on-duty specialists
 * with crisp shift time badges, doctor avatar/specialty, and quick booking links.
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
        className={`py-8 text-center text-base ${
          isPine ? 'text-bg/80' : 'text-text-muted'
        }`}
      >
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

  return (
    <div>
      {/* 1. Day Selector Bar (Monday - Saturday) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 sm:pb-4 no-scrollbar">
        {weekdays.map((dayNum) => {
          const isSelected = dayNum === activeDay;
          const isToday = dayNum === currentTodayDay;
          const dayName = t.schedule.days[dayNum as keyof typeof t.schedule.days];

          return (
            <button
              key={dayNum}
              type="button"
              onClick={() => setActiveDay(dayNum)}
              className={`relative px-4 py-3 rounded-[12px] text-sm sm:text-base font-semibold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 border ${
                isSelected
                  ? isPine
                    ? 'bg-bg text-primary border-bg shadow-sm scale-[1.02]'
                    : 'bg-primary text-bg border-primary shadow-sm scale-[1.02]'
                  : isPine
                  ? 'bg-bg/10 text-bg/85 border-bg/15 hover:bg-bg/15 hover:text-bg'
                  : 'bg-bg text-text-muted border-border hover:bg-bg-alt hover:text-text'
              }`}
              aria-selected={isSelected}
            >
              <span>{dayName}</span>
              {isToday && (
                <span
                  className={`text-[11px] uppercase tracking-wider px-1.5 py-0.5 rounded-[4px] font-bold ${
                    isSelected
                      ? isPine
                        ? 'bg-primary/15 text-primary'
                        : 'bg-bg/20 text-bg'
                      : isPine
                      ? 'bg-bg/25 text-bg'
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
      <div className="mt-5 space-y-3.5">
        {onDutyDoctors.length > 0 ? (
          onDutyDoctors.map(({ doc, shifts }) => {
            const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
            const fallbackImg =
              'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=300&h=300&q=80';

            return (
              <div
                key={doc.id}
                className={`p-4 sm:p-5 rounded-[14px] border transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  isPine
                    ? 'bg-bg/10 border-bg/20 hover:border-bg/35'
                    : 'bg-bg-card border-border hover:border-primary/40'
                }`}
              >
                {/* Doctor Identity */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden shrink-0 border border-border/40 bg-bg-alt">
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
                      className={`font-heading font-bold text-base sm:text-lg block truncate ${
                        isPine ? 'text-bg hover:opacity-85' : 'text-text hover:text-primary'
                      }`}
                    >
                      {doc.name}
                    </Link>
                    <p
                      className={`text-sm truncate mt-0.5 ${
                        isPine ? 'text-bg/80' : 'text-text-muted'
                      }`}
                    >
                      {specialty}
                    </p>
                  </div>
                </div>

                {/* Shift Hours & Action CTA */}
                <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 sm:gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-border/20">
                  <div className="flex flex-wrap items-center gap-2">
                    {shifts.map((s, idx) => (
                      <span
                        key={idx}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-semibold tabular-nums border ${
                          isPine
                            ? 'bg-bg/15 text-bg border-bg/25'
                            : 'bg-bg-alt text-primary border-primary/20'
                        }`}
                      >
                        <svg
                          className="w-4 h-4 opacity-80"
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
                    className={`inline-flex items-center justify-center px-4 py-2 rounded-[10px] text-sm font-semibold transition-opacity shrink-0 ${
                      isPine
                        ? 'bg-bg text-primary hover:opacity-90'
                        : 'btn-primary py-2 px-4 text-sm'
                    }`}
                  >
                    {t.schedule.bookSlot || t.common.bookNow}
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div
            className={`py-10 text-center rounded-[14px] border ${
              isPine ? 'bg-bg/5 border-bg/15 text-bg/75' : 'bg-bg-alt border-border text-text-muted'
            }`}
          >
            <p className="text-base font-medium">
              {lang === 'en'
                ? 'No specialist practice scheduled on this day.'
                : 'Tidak ada jadwal praktek dokter spesialis di hari ini.'}
            </p>
          </div>
        )}
      </div>

      {/* 3. Footer Note & Sunday Warning */}
      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
        <p className={`flex items-center gap-2 ${isPine ? 'text-bg/80' : 'text-text-muted'}`}>
          <span className="w-2 h-2 rounded-full bg-accent shrink-0" />
          <span>{t.schedule.closedSunday}</span>
        </p>

        <Link
          to={localePath('/jadwal')}
          className={`font-semibold hover:underline underline-offset-4 ${
            isPine ? 'text-bg/90' : 'text-primary'
          }`}
        >
          {lang === 'en' ? 'View all practice details →' : 'Lihat jadwal lengkap 6 hari →'}
        </Link>
      </div>
    </div>
  );
};
