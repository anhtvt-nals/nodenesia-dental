import React from 'react';
import { useI18n } from '../../i18n';

interface BookingStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const BookingStepper: React.FC<BookingStepperProps> = ({ currentStep, onStepClick }) => {
  const { t } = useI18n();

  const steps = [
    { num: 1, label: t.booking.step1 },
    { num: 2, label: t.booking.step2 },
    { num: 3, label: t.booking.step3 },
  ];

  return (
    <nav aria-label="Progress Reservasi" className="w-full mb-8">
      <ol className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {steps.map((step) => {
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isNavigable = (isCompleted || isCurrent) && onStepClick;

          const handleClick = () => {
            if (!isNavigable || !onStepClick) return;
            onStepClick(step.num);
          };

          return (
            <li key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!isNavigable}
                onClick={handleClick}
                className={`text-left w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all flex flex-col justify-between min-h-[52px] ${
                  isCurrent
                    ? 'bg-primary text-white border-primary shadow-soft ring-2 ring-primary/20 scale-[1.01]'
                    : isCompleted
                    ? 'bg-surface text-secondary border-primary/30 hover:border-primary cursor-pointer shadow-xs active:scale-95'
                    : 'bg-bg-alt/70 text-text-muted border-border cursor-not-allowed opacity-60'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center justify-between text-[11px] sm:text-xs font-bold mb-1">
                  <span className={isCurrent ? 'text-white/85' : 'text-accent'}>
                    0{step.num}
                  </span>
                  {isCompleted && (
                    <span className="w-4 h-4 rounded-full bg-accent/20 text-accent-text flex items-center justify-center font-bold text-[10px]" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <div className="font-heading text-xs sm:text-sm font-bold truncate">
                  {step.label}
                </div>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
