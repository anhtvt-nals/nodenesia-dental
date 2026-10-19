import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getTestimonials } from '../lib/api';
import { Testimonial } from '../types';
import { ReviewCard } from '../components/common/ReviewCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const TestimonialsPage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Suara Pasien
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.testimonials.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans mb-6">
              {t.testimonials.pageDesc}
            </p>

            {/* Scorecard anchor */}
            <div className="inline-flex items-center gap-4 p-4 bg-[#E9E4D8]/50 hairline-border">
              <div className="font-mono text-3xl font-normal text-[#1F3D36]">
                4.9 <span className="text-base text-[#14201C]/50">/ 5.0</span>
              </div>
              <div className="text-xs font-mono text-[#14201C]/70">
                <div className="text-[#C8553D] tracking-widest text-sm mb-0.5">★★★★★</div>
                <div>{t.testimonials.overallRating} (Google Review & Terverifikasi)</div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
