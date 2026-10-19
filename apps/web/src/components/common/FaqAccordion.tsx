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
    <div className="hairline-t divide-y divide-[#14201C]/15">
      {faqs.map((faq, index) => {
        const isOpen = openIds.includes(faq.id);
        const question = lang === 'en' ? faq.questionEn : faq.question;
        const answer = lang === 'en' ? faq.answerEn : faq.answer;
        const indexStr = String(index + 1).padStart(2, '0');

        return (
          <div key={faq.id} className="py-4">
            <button
              type="button"
              onClick={() => toggle(faq.id)}
              aria-expanded={isOpen}
              className="w-full text-left flex items-start justify-between gap-4 py-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1F3D36]"
            >
              <div className="flex items-start gap-4">
                <span className="font-mono text-xs text-[#14201C]/40 pt-1 shrink-0">
                  {indexStr}
                </span>
                <span className="font-serif text-lg md:text-xl text-[#14201C] group-hover:text-[#1F3D36] transition-colors">
                  {question}
                </span>
              </div>
              <span className="font-mono text-sm text-[#14201C]/60 pt-1 shrink-0">
                {isOpen ? '—' : '+'}
              </span>
            </button>
            {isOpen && (
              <div className="pl-9 pr-6 pt-2 pb-3 text-sm text-[#14201C]/80 leading-relaxed font-sans animate-in fade-in duration-150">
                {answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
