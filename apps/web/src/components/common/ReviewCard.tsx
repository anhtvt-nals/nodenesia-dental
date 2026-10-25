import React from 'react';
import { Testimonial } from '../../types';
import { useI18n } from '../../i18n';

interface ReviewCardProps {
  testimonial: Testimonial;
}

/**
 * Plain editorial review block without repeated 5-star icon rows or rounded card boxes.
 */
export const ReviewCard: React.FC<ReviewCardProps> = ({ testimonial }) => {
  const { lang } = useI18n();
  const comment = lang === 'en' ? testimonial.commentEn : testimonial.comment;

  return (
    <article className="py-6 border-b border-border flex flex-col justify-between">
      <blockquote className="font-body text-base text-text mb-4 leading-relaxed">
        “{comment}”
      </blockquote>

      <div className="text-base text-text-muted">
        <span className="font-heading font-bold text-text">{testimonial.name}</span>
        {testimonial.serviceName && (
          <>
            <span aria-hidden="true"> — </span>
            <span>{testimonial.serviceName}</span>
          </>
        )}
      </div>
    </article>
  );
};
