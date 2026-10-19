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
      <div className="p-8 text-center hairline-border bg-[#E9E4D8]/30 font-mono text-xs text-[#14201C]/60">
        {t.common.loading}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="p-6 text-center hairline-border bg-[#E9E4D8]/30 font-mono text-xs text-[#14201C]/70">
        {t.booking.noSlotsAvailable}
      </div>
    );
  }

  // Split into Morning (09:00 - 12:00), Afternoon (13:00 - 17:00), Evening (17:00 - 20:00)
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
        <div className="text-xs font-mono uppercase tracking-wider text-[#14201C]/50 mb-3">
          {title}
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {groupSlots.map((slot) => {
            const isSelected = selectedSlot === slot.time;
            const isAvailable = slot.available;

            return (
              <button
                key={slot.time}
                type="button"
                disabled={!isAvailable}
                onClick={() => isAvailable && onSelectSlot(slot.time)}
                className={`py-2 px-3 text-xs font-mono tracking-tight text-center hairline-border transition-colors ${
                  !isAvailable
                    ? 'bg-[#E9E4D8]/30 text-[#14201C]/25 cursor-not-allowed border-dashed'
                    : isSelected
                    ? 'bg-[#1F3D36] text-[#F4F1EA] border-[#1F3D36] font-medium'
                    : 'bg-[#F4F1EA] text-[#14201C] hover:bg-[#E9E4D8]'
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
