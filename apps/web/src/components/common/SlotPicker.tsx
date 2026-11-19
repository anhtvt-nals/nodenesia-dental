import React from 'react';
import { BookingSlot } from '../../types';
import { useI18n } from '../../i18n';

interface SlotPickerProps {
  slots: BookingSlot[];
  selectedSlot: string | null;
  onSelectSlot: (time: string) => void;
  isLoading?: boolean;
}

export const SlotPicker: React.FC<SlotPickerProps> = ({
  slots,
  selectedSlot,
  onSelectSlot,
  isLoading = false,
}) => {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="p-8 text-center rounded-xl border border-border bg-bg-alt font-medium text-sm text-text-muted">
        {t.common.loading}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-6 text-center rounded-xl border border-border bg-bg-alt font-medium text-sm text-text-muted">
        {t.booking.noSlotsAvailable}
      </div>
    );
  }

  const morning = slots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h < 12;
  });
  const afternoon = slots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h >= 13 && h < 17;
  });
  const evening = slots.filter((s) => {
    const h = parseInt(s.time.split(':')[0], 10);
    return h >= 17;
  });

  const renderGroup = (title: string, groupSlots: BookingSlot[]) => {
    if (groupSlots.length === 0) return null;
    return (
      <div className="mb-6 last:mb-0">
        <div className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
          {title}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
          {groupSlots.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectSlot(slot.time)}
                className={`py-2.5 px-3 min-h-[44px] text-sm font-semibold rounded-xl border text-center transition-all ${
                  !isAvailable
                    ? 'bg-bg-alt/60 text-text-muted/50 cursor-not-allowed border-dashed border-border'
                    : isSelected
                    ? 'bg-primary text-white border-primary shadow-xs cursor-pointer ring-2 ring-primary/20 scale-[1.02]'
                    : 'bg-bg-card text-text border-border hover:border-primary hover:bg-primary/5 cursor-pointer active:scale-95'
                }`}
                title={slot.reason}
              >
                {slot.time}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
      {renderGroup('Pagi (09:00 – 12:00)', morning)}
      {renderGroup('Siang (13:00 – 17:00)', afternoon)}
      {renderGroup('Sore / Malam (17:00 – 20:00)', evening)}
    </div>
  );
};
