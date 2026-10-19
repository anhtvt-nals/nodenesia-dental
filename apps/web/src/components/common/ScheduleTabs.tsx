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
  // Default to today if Mon-Sat, else default to Monday (1)
  const defaultTab = initialDay !== undefined ? initialDay : (currentDayOfWeek >= 1 && currentDayOfWeek <= 6 ? currentDayOfWeek : 1);

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

  // Sort by start hour
  rows.sort((a, b) => a.start.localeCompare(b.start));

  const isToday = selectedDay === currentDayOfWeek;

  return (
    <div className="w-full">
      {/* Day Tabs */}
      <div
        role="tablist"
        aria-label="Pilih hari praktek dokter"
        className="flex items-center gap-1 border-b border-[#14201C]/15 overflow-x-auto pb-px mb-6 scrollbar-none"
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
              className={`px-4 py-2.5 text-xs font-mono tracking-wider transition-colors whitespace-nowrap shrink-0 border-b-2 -mb-px flex items-center gap-1.5 ${
                isActive
                  ? 'border-[#14201C] text-[#14201C] font-semibold bg-[#E9E4D8]/50'
                  : 'border-transparent text-[#14201C]/60 hover:text-[#14201C] hover:bg-[#E9E4D8]/20'
              }`}
            >
              <span>{dayName}</span>
              {isDayToday && (
                <span className="text-[10px] text-[#1F3D36] font-medium bg-[#1F3D36]/10 px-1 py-0.2">
                  {t.common.today}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Schedule Table / List */}
      {isToday && (
        <div className="mb-4 inline-flex items-center gap-2 text-xs font-mono text-[#1F3D36] bg-[#1F3D36]/10 px-3 py-1.5 hairline-border border-[#1F3D36]/20">
          <span className="font-semibold">{t.schedule.todaySlotBadge}</span>
          <span>·</span>
          <span>Reservasi sebelum jam 17:00 untuk tindakan hari ini</span>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="p-8 hairline-border bg-[#E9E4D8]/30 text-center text-sm font-mono text-[#14201C]/60">
          Tidak ada dokter yang berpraktek pada hari ini.
        </div>
      ) : (
        <div className="hairline-border bg-[#F4F1EA] divide-y divide-[#14201C]/10">
          {rows.map(({ doctor, start, end }) => {
            const specialty = lang === 'en' ? doctor.specialtyEn : doctor.specialty;

            return (
              <div
                key={doctor.id}
                className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#E9E4D8]/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0">
                  <div className="font-mono text-xs sm:text-base font-medium text-[#1F3D36] bg-[#E9E4D8] px-2.5 sm:px-3 py-1 sm:py-1.5 whitespace-nowrap shrink-0">
                    {start} – {end} WIB
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-serif text-base sm:text-xl text-[#14201C] truncate">
                      <Link to={localePath(`/dokter/${doctor.slug}`)} className="hover:text-[#1F3D36] transition-colors">
                        {doctor.name}
                      </Link>
                    </h4>
                    <p className="text-xs font-mono text-[#14201C]/60 truncate">
                      {specialty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 hairline-t sm:border-t-0">
                  <Link
                    to={localePath(`/dokter/${doctor.slug}`)}
                    className="text-xs font-mono text-[#14201C]/70 hover:text-[#14201C] underline underline-offset-4 py-1"
                  >
                    Profil
                  </Link>
                  <Link
                    to={localePath(`/booking?dokter=${doctor.id}`)}
                    className="px-4 py-2 min-h-[38px] flex items-center justify-center bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono hover:bg-[#162B26] active:bg-[#162B26] transition-colors whitespace-nowrap shadow-xs"
                  >
                    {t.schedule.bookSlot} →
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
