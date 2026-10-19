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
      <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 scrollbar-none">
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
              className={`p-3 min-w-[76px] text-center shrink-0 transition-colors flex flex-col items-center justify-center hairline-border ${
                item.isClosed
                  ? 'bg-[#E9E4D8]/20 text-[#14201C]/30 cursor-not-allowed border-dashed'
                  : isSelected
                  ? 'bg-[#14201C] text-[#F4F1EA] border-[#14201C]'
                  : 'bg-[#F4F1EA] text-[#14201C] hover:bg-[#E9E4D8]'
              }`}
              aria-label={`${dayName}, ${dayNumber} ${monthName}${item.isClosed ? ' (' + t.common.closed + ')' : ''}`}
            >
              <span className="text-[11px] font-mono uppercase tracking-wider block">
                {isToday ? t.common.today : dayName.slice(0, 3)}
              </span>
              <span className="font-serif text-2xl font-normal block my-0.5">
                {dayNumber}
              </span>
              <span className="text-[10px] font-mono block">
                {item.isClosed ? t.common.closed : monthName}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
