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
          const isCompleted = currentStep > step.num;
          const isCurrent = currentStep === step.num;
          const isNavigable = isCompleted && onStepClick;

          return (
            <li key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!isNavigable}
                onClick={() => isNavigable && onStepClick(step.num)}
                className={`text-left w-full p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                  isCurrent
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : isCompleted
                    ? 'bg-bg-card text-text border-primary/40 hover:border-primary cursor-pointer'
                    : 'bg-bg-alt text-text-muted border-border cursor-not-allowed opacity-75'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className={isCurrent ? 'text-white/90' : 'text-primary'}>
                    LANGKAH 0{step.num}
                  </span>
                  {isCompleted && (
                    <span className="w-5 h-5 rounded-full bg-success/15 text-success-dark flex items-center justify-center" aria-hidden="true">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
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
