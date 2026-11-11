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
    { num: 4, label: t.booking.step4 },
  ];

  return (
    <nav aria-label="Progress Reservasi" className="w-full mb-8">
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step) => {
          const isCompleted = currentStep > step.num || (currentStep === 4 && step.num <= 3);
          const isCurrent = currentStep === step.num || ((currentStep === 2 || currentStep === 3) && step.num === 2);
          const isNavigable = (isCompleted || isCurrent) && onStepClick;

          const handleClick = () => {
            if (!isNavigable || !onStepClick) return;
            if (step.num === 3) {
              onStepClick(2);
            } else {
              onStepClick(step.num);
            }
          };

          return (
            <li key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!isNavigable}
                onClick={handleClick}
                className={`text-left w-full p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-primary text-white border-primary shadow-soft ring-2 ring-primary/20 scale-[1.01]'
                    : isCompleted
                    ? 'bg-surface text-secondary border-primary/30 hover:border-primary cursor-pointer shadow-xs'
                    : 'bg-bg-alt/70 text-text-muted border-border cursor-not-allowed opacity-60'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                  <span className={isCurrent ? 'text-white/85' : 'text-accent'}>
                    LANGKAH 0{step.num}
                  </span>
                  {isCompleted && (
                    <span className="w-5 h-5 rounded-full bg-accent/20 text-accent-text flex items-center justify-center font-bold" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </div>
                <div className="font-heading text-xs md:text-sm font-bold truncate">
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
