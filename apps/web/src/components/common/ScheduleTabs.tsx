import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { useI18n } from '../../i18n';

interface ScheduleTabsProps {
  doctors: Doctor[];
  initialDay?: number;
}

export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({ doctors, initialDay }) => {
  const { lang, t, localePath } = useI18n();

  // Current day in Jakarta (1=Mon, ..., 6=Sat, 0=Sun)
  const currentDayOfWeek = new Date().getDay();
  const defaultTab =
    initialDay !== undefined
      ? initialDay
      : currentDayOfWeek >= 1 && currentDayOfWeek <= 6
      ? currentDayOfWeek
      : 1;

  const [selectedDay, setSelectedDay] = useState<number>(defaultTab);

  // Tabs for Monday (1) to Saturday (6)
  const daysList = [1, 2, 3, 4, 5, 6];

  // Filter doctors working on selectedDay
  const rows: { doctor: Doctor; start: string; end: string }[] = [];
  doctors.forEach((doc) => {
    const shift = doc.workingHours.find((w) => w.weekday === selectedDay);
    if (shift) {
      rows.push({
        doctor: doc,
        start: shift.start,
        end: shift.end,
      });
    }
  });

  rows.sort((a, b) => a.start.localeCompare(b.start));

  const isToday = selectedDay === currentDayOfWeek;

  return (
    <div className="w-full">
      {/* Day Tabs */}
      <div
        role="tablist"
        aria-label="Pilih hari praktek dokter"
        className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none"
      >
        {daysList.map((dayNum) => {
          const isActive = selectedDay === dayNum;
          const dayName = t.schedule.days[dayNum as keyof typeof t.schedule.days];
          const isDayToday = dayNum === currentDayOfWeek;

          return (
            <button
              key={dayNum}
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => setSelectedDay(dayNum)}
              className={`px-4 py-2.5 min-h-[44px] rounded-xl text-sm font-semibold transition-all whitespace-nowrap shrink-0 flex items-center gap-2 cursor-pointer border ${
                isActive
                  ? 'bg-primary text-white border-primary shadow-xs'
                  : 'bg-bg-card text-text-muted border-border hover:border-primary hover:text-primary'
              }`}
            >
              <span>{dayName}</span>
              {isDayToday && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-primary-hover' : 'bg-success/15 text-success-dark'
                  }`}
                >
                  {t.common.today}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Table / List */}
      {isToday && (
        <div className="mb-5 badge badge-success text-xs py-2 px-4">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
          <span>{t.schedule.todaySlotBadge}</span>
          <span aria-hidden="true">·</span>
          <span className="font-normal">Reservasi sebelum jam 17:00 untuk tindakan hari ini</span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-8 rounded-2xl border border-border bg-bg-card text-center text-sm text-text-muted">
          Tidak ada dokter yang berpraktek pada hari ini.
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-bg-card divide-y divide-border overflow-hidden">
          {rows.map(({ doctor, start, end }) => {
            const specialty = lang === 'en' ? doctor.specialtyEn : doctor.specialty;

            return (
              <div
                key={doctor.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-bg-alt/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 min-w-0">
                  <div className="inline-flex items-center gap-1.5 font-heading text-xs sm:text-sm font-bold text-primary bg-primary/10 px-3 py-2 rounded-xl whitespace-nowrap shrink-0">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{start} – {end} WIB</span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base sm:text-lg font-bold text-text truncate">
                      <Link to={localePath(`/dokter/${doctor.slug}`)} className="hover:text-primary transition-colors">
                        {doctor.name}
                      </Link>
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted font-medium truncate">
                      {specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-3 sm:pt-0 border-t border-border sm:border-t-0">
                  <Link
                    to={localePath(`/dokter/${doctor.slug}`)}
                    className="text-sm font-semibold text-primary hover:underline py-1"
                  >
                    Profil
                  </Link>
                  <Link
                    to={localePath(`/booking?dokter=${doctor.id}`)}
                    className="btn-primary text-xs py-2.5 px-4 min-h-[40px] whitespace-nowrap"
                  >
                    <span>{t.schedule.bookSlot}</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
