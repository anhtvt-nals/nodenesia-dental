import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getTestimonials } from '../lib/api';
import { Testimonial } from '../types';
import { ReviewCard } from '../components/common/ReviewCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const TestimonialsPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getTestimonials();
      setReviews(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.testimonials.pageTitle}
        description={t.testimonials.pageDesc}
        path="/testimoni"
      />

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Patient Voices' : 'Suara Pasien'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.testimonials.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed mb-6">
              {t.testimonials.pageDesc}
            </p>

            {/* Scorecard anchor with SVG stars (no text/emoji stars) */}
            <div className="inline-flex items-center gap-4 p-4 sm:p-5 rounded-2xl bg-bg-card border border-border shadow-sm">
              <div className="stat-number text-3xl sm:text-4xl">
                4.9 <span className="text-base font-normal text-text-subtle">/ 5.0</span>
              </div>
              <div className="text-xs text-text-muted">
                <div className="flex items-center gap-1 text-accent mb-1" aria-label="4.9 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-4 h-4 fill-current"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="font-medium text-text">{t.testimonials.overallRating} (Google Review & Terverifikasi)</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reviews.map((rev) => (
                <ReviewCard key={rev.id} testimonial={rev} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
