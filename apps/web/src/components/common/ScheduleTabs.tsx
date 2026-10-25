import React from 'react';
import { Link } from 'react-router-dom';
import { Doctor } from '../../types';
import { useI18n } from '../../i18n';

interface ScheduleTabsProps {
  doctors: Doctor[];
  initialDay?: number;
  variant?: 'light' | 'pine';
}

/**
 * Plain weekly schedule table (Monday–Saturday) without interactive pill tabs.
 */
export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({ doctors, variant = 'light' }) => {
  const { lang, t, localePath } = useI18n();
  const weekdays = [1, 2, 3, 4, 5, 6];
  const isPine = variant === 'pine';

  if (doctors.length === 0) {
    return (
      <div
        className={`py-8 border-t border-b text-base ${
          isPine ? 'border-bg/20 text-bg/80' : 'border-border text-text-muted'
        }`}
      >
        {t.common.loading}
      </div>
    );
  }

  return (
    <div>
      <div className={`w-full overflow-x-auto border-t ${isPine ? 'border-bg/20' : 'border-border'}`}>
        <table className="w-full text-left border-collapse min-w-[680px]" aria-label={t.schedule.pageTitle}>
          <thead>
            <tr
              className={`border-b text-base font-semibold ${
                isPine ? 'border-bg/20 text-bg/85' : 'border-border text-text-muted'
              }`}
            >
              <th scope="col" className="py-3.5 pr-4">{t.schedule.doctorHeader}</th>
              {weekdays.map((dayNum) => (
                <th key={dayNum} scope="col" className="py-3.5 px-3">
                  {t.schedule.days[dayNum as keyof typeof t.schedule.days]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`divide-y text-base ${isPine ? 'divide-bg/15' : 'divide-border'}`}>
            {doctors.map((doc) => {
              const specialty = lang === 'en' ? doc.specialtyEn : doc.specialty;

              return (
                <tr key={doc.id} className="align-top">
                  <td className="py-4 pr-4">
                    <Link
                      to={localePath(`/dokter/${doc.slug}`)}
                      className={`font-heading font-bold text-lg block ${
                        isPine ? 'text-bg hover:opacity-85' : 'text-text hover:text-primary'
                      }`}
                    >
                      {doc.name}
                    </Link>
                    <span className={`text-base block mt-0.5 ${isPine ? 'text-bg/80' : 'text-text-muted'}`}>
                      {specialty}
                    </span>
                  </td>

                  {weekdays.map((dayNum) => {
                    const shifts = doc.workingHours.filter((w) => w.weekday === dayNum);
                    return (
                      <td
                        key={dayNum}
                        className={`py-4 px-3 text-base tabular-nums ${
                          isPine ? 'text-bg' : 'text-text'
                        }`}
                      >
                        {shifts.length > 0 ? (
                          shifts.map((s, i) => (
                            <div key={i} className="whitespace-nowrap">
                              {s.start}–{s.end}
                            </div>
                          ))
                        ) : (
                          <span className={isPine ? 'text-bg/45' : 'text-text-muted'}>—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <p className={`text-base ${isPine ? 'text-bg/80' : 'text-text-muted'}`}>
          {t.schedule.closedSunday}
        </p>
        <Link
          to={localePath('/booking')}
          className={
            isPine
              ? 'inline-flex items-center justify-center rounded-[10px] bg-bg text-primary font-semibold text-base px-6 py-3 hover:opacity-90 transition-opacity shrink-0'
              : 'btn-primary text-base shrink-0'
          }
        >
          {t.common.bookNow}
        </Link>
      </div>
    </div>
  );
};
