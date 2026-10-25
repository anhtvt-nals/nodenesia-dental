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
    <div className={`w-full overflow-x-auto border-t ${isPine ? 'border-bg/20' : 'border-border'}`}>
      <table className="w-full text-left border-collapse min-w-[720px]" aria-label={t.schedule.pageTitle}>
        <thead>
          <tr
            className={`border-b text-sm font-semibold ${
              isPine ? 'border-bg/20 text-bg/80' : 'border-border text-text-muted'
            }`}
          >
            <th scope="col" className="py-3.5 pr-4">{t.schedule.doctorHeader}</th>
            {weekdays.map((dayNum) => (
              <th key={dayNum} scope="col" className="py-3.5 px-3">
                {t.schedule.days[dayNum as keyof typeof t.schedule.days]}
              </th>
            ))}
            <th scope="col" className="py-3.5 pl-4 text-right">{t.schedule.actionHeader}</th>
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
                    className={`font-heading font-bold text-base block ${
                      isPine ? 'text-bg hover:opacity-85' : 'text-text hover:text-primary'
                    }`}
                  >
                    {doc.name}
                  </Link>
                  <span className={`text-sm block mt-0.5 ${isPine ? 'text-bg/75' : 'text-text-muted'}`}>
                    {specialty}
                  </span>
                </td>

                {weekdays.map((dayNum) => {
                  const shifts = doc.workingHours.filter((w) => w.weekday === dayNum);
                  return (
                    <td
                      key={dayNum}
                      className={`py-4 px-3 text-sm sm:text-base tabular-nums ${
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

                <td className="py-4 pl-4 text-right whitespace-nowrap">
                  <Link
                    to={localePath(`/booking?dokter=${doc.id}`)}
                    className={`text-sm font-semibold hover:underline underline-offset-4 ${
                      isPine ? 'text-bg' : 'text-primary'
                    }`}
                  >
                    {t.common.bookNow}
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className={`text-sm mt-3 ${isPine ? 'text-bg/75' : 'text-text-muted'}`}>
        {t.schedule.closedSunday}
      </p>
    </div>
  );
};
