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
      <ol className="grid grid-cols-2 md:grid-cols-4 gap-2 hairline-b pb-4">
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
                className={`text-left w-full p-2.5 transition-colors flex flex-col justify-between hairline-border ${
                  isCurrent
                    ? 'bg-[#1F3D36] text-[#F4F1EA] border-[#1F3D36]'
                    : isCompleted
                    ? 'bg-[#E9E4D8]/60 text-[#14201C] hover:bg-[#E9E4D8]'
                    : 'bg-[#F4F1EA] text-[#14201C]/40 cursor-not-allowed border-[#14201C]/10'
                }`}
                aria-current={isCurrent ? 'step' : undefined}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span>STEP 0{step.num}</span>
                  {isCompleted && <span className="text-[#1F3D36]">✓</span>}
                </div>
                <div className="font-sans text-xs md:text-sm font-medium truncate">
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
