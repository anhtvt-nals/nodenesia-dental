import React from 'react';
import { Testimonial } from '../../types';
import { useI18n } from '../../i18n';

interface ReviewCardProps {
  testimonial: Testimonial;
}

export const ReviewCard: React.FC<ReviewCardProps> = ({ testimonial }) => {
  const { lang } = useI18n();
  const comment = lang === 'en' ? testimonial.commentEn : testimonial.comment;

  return (
    <div className="hairline-border p-6 bg-[#F4F1EA] flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between text-xs font-mono text-[#14201C]/50 mb-3">
          <div className="flex items-center text-[#C8553D] tracking-widest" aria-label={`${testimonial.stars} dari 5 bintang`}>
            {'★'.repeat(testimonial.stars)}
          </div>
          <span>{testimonial.source}</span>
        </div>
        <p className="font-serif italic text-lg md:text-xl text-[#14201C] mb-4 leading-snug">
          "{comment}"
        </p>
      </div>

      <div className="pt-4 hairline-t">
        <div className="font-sans font-medium text-sm text-[#14201C]">
          {testimonial.name}
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-[#14201C]/60 mt-0.5">
          <span>{testimonial.serviceName}</span>
          <span>·</span>
          <span>{testimonial.date}</span>
        </div>
      </div>
    </div>
  );
};
