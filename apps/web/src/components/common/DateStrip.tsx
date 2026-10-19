import React from 'react';
import { getNextAvailableDates } from '../../lib/utils';
import { useI18n } from '../../i18n';

interface DateStripProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  className?: string;
}

export const DateStrip: React.FC<DateStripProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  const { lang, t } = useI18n();
  const dates = getNextAvailableDates(14);

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none">
        {dates.map((item, idx) => {
          const isSelected = selectedDate === item.date;
          const dayName = t.schedule.days[item.dayOfWeek as keyof typeof t.schedule.days];
          const dayNumber = item.dateObj.getDate();
          const monthName = item.dateObj.toLocaleDateString(lang === 'en' ? 'en-US' : 'id-ID', {
            month: 'short',
          });

          const isToday = idx === 0;

          return (
            <button
              key={item.date}
              type="button"
              disabled={item.isClosed}
              onClick={() => onSelectDate(item.date)}
              className={`p-3 min-w-[82px] text-center shrink-0 rounded-xl border transition-all flex flex-col items-center justify-center ${
                item.isClosed
                  ? 'bg-bg-alt/60 text-text-muted/60 cursor-not-allowed border-dashed border-border'
                  : isSelected
                  ? 'bg-primary text-white border-primary shadow-sm cursor-pointer'
                  : 'bg-bg-card text-text border-border hover:border-primary hover:bg-primary/5 cursor-pointer'
              }`}
              aria-label={`${dayName}, ${dayNumber} ${monthName}${item.isClosed ? ' (' + t.common.closed + ')' : ''}`}
            >
              <span className={`text-[11px] font-semibold uppercase tracking-wide block ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                {isToday ? t.common.today : dayName.slice(0, 3)}
              </span>
              <span className="font-heading text-2xl font-bold block my-0.5">
                {dayNumber}
              </span>
              <span className={`text-[11px] font-medium block ${isSelected ? 'text-white/90' : 'text-text-muted'}`}>
                {item.isClosed ? t.common.closed : monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
