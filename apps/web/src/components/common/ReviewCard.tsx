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
    <article className="trust-card flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div
            className="flex items-center gap-1 text-warning"
            aria-label={`${testimonial.stars} dari 5 bintang`}
          >
            {Array.from({ length: testimonial.stars }).map((_, idx) => (
              <svg key={idx} className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-bg-alt text-text-muted text-xs font-semibold">
            {testimonial.source}
          </span>
        </div>
        <p className="font-body text-base text-text mb-5 leading-relaxed">
          "{comment}"
        </p>
      </div>

      <div className="pt-4 border-t border-border flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-heading font-bold text-sm flex items-center justify-center shrink-0" aria-hidden="true">
          {testimonial.name.charAt(0).toUpperCase()}
        </div>
        <div className="min-w-0">
          <div className="font-heading font-semibold text-sm text-text truncate">
            {testimonial.name}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted mt-0.5 flex-wrap">
            <span>{testimonial.serviceName}</span>
            <span aria-hidden="true">·</span>
            <span>{testimonial.date}</span>
          </div>
        </div>
      </div>
    </article>
  );
};
