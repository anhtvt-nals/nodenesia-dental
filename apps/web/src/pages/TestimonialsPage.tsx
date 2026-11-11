import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getTestimonials } from '../lib/api';
import { Testimonial } from '../types';
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

      <PageHeader title={t.testimonials.pageTitle} description={t.testimonials.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Aggregate Rating Scorecard */}
          <div className="mb-12 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="stat-number text-4xl sm:text-5xl font-extrabold text-primary">
                4.9 <span className="text-base font-normal text-text-muted">/ 5.0</span>
              </div>
              <div>
                <div className="flex items-center gap-1 text-accent mb-1" aria-label="4.9 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <svg
                      key={i}
                      className="w-5 h-5 fill-current"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <div className="text-xs sm:text-sm font-semibold text-secondary">
                  {t.testimonials.overallRating} · 380+ Ulasan Terverifikasi
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-semibold text-text-muted bg-bg-alt px-4 py-2.5 rounded-xl border border-border">
              <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Ulasan Pasien Asli via Google Maps</span>
            </div>
          </div>

          {/* Reviews Grid */}
          {loading ? (
            <div className="p-20 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {reviews.map((rev) => {
                const comment = lang === 'en' ? rev.commentEn : rev.comment;
                return (
                  <article
                    key={rev.id}
                    className="bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-card hover:shadow-hover transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Pull quote symbol */}
                      <span className="font-heading text-4xl text-accent/40 block -mb-2 leading-none" aria-hidden="true">
                        “
                      </span>
                      <blockquote className="text-sm sm:text-base text-text leading-relaxed mb-6 font-medium">
                        {comment}
                      </blockquote>
                    </div>

                    <div className="pt-4 border-t border-border flex items-center justify-between gap-3 text-xs">
                      <div>
                        <div className="font-heading font-bold text-secondary text-sm">
                          {rev.name}
                        </div>
                        {rev.serviceName && (
                          <div className="text-text-muted text-[11px] mt-0.5">
                            {rev.serviceName}
                          </div>
                        )}
                      </div>
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <span>Verifikasi</span>
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

        </div>
      </div>
    </>
  );
};
