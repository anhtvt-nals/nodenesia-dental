import React, { useState } from 'react';
import { Faq } from '../../types';
import { useI18n } from '../../i18n';

interface FaqAccordionProps {
  faqs: Faq[];
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqs }) => {
  const { lang } = useI18n();
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-3">
      {faqs.map((faq, index) => {
        const isOpen = openIds.includes(faq.id);
        const question = lang === 'en' ? faq.questionEn : faq.question;
        const answer = lang === 'en' ? faq.answerEn : faq.answer;
        const indexStr = String(index + 1).padStart(2, '0');

        return (
          <div
            key={faq.id}
            className={`bg-bg-card border rounded-2xl transition-colors ${
              isOpen ? 'border-primary shadow-xs' : 'border-border hover:border-primary/60'
            }`}
          >
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              className="w-full text-left flex items-center justify-between gap-4 p-5 cursor-pointer rounded-2xl"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary font-heading text-xs font-bold flex items-center justify-center shrink-0">
                  {indexStr}
                </span>
                <span className="font-heading text-base md:text-lg font-bold text-text">
                  {question}
                </span>
              </div>
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                  isOpen ? 'bg-primary text-white' : 'bg-bg-alt text-text-muted'
                }`}
                aria-hidden="true"
              >
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2.2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 pl-16 text-sm text-text-muted leading-relaxed font-body border-t border-border/60 pt-4">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
