import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getFaqs } from '../lib/api';
import { Faq } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { FaqAccordion } from '../components/common/FaqAccordion';

export const PatientGuidePage: React.FC = () => {
  const { lang, t } = useI18n();
  const [faqs, setFaqs] = useState<Faq[]>([]);

  useEffect(() => {
    async function load() {
      const data = await getFaqs();
      setFaqs(data);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.patientGuide.pageTitle}
        description={t.patientGuide.pageDesc}
        path="/pasien"
      />

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Patient Comfort & Rights' : 'Kenyamanan & Hak Pasien'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.patientGuide.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.patientGuide.pageDesc}
            </p>
          </div>

          {/* Section 1: 5-Stage Clinical Visit Flow */}
          <div className="mb-14">
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-6">
              {t.patientGuide.visitFlowTitle}
            </h2>
            <div className="space-y-4">
              {t.patientGuide.steps.map((st) => (
                <div
                  key={st.num}
                  className="trust-card p-6 bg-bg-card flex flex-col sm:flex-row sm:items-start gap-4"
                >
                  <span className="w-11 h-11 rounded-xl bg-primary/10 text-primary font-heading text-lg font-bold flex items-center justify-center shrink-0">
                    0{st.num}
                  </span>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-text mb-1">
                      {st.title}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Preparation */}
          <div className="mb-14 trust-card p-6 sm:p-8 bg-bg-card">
            <h2 className="font-heading text-2xl font-bold text-text mb-4">
              {t.patientGuide.preparationTitle}
            </h2>
            <ul className="space-y-3 text-sm sm:text-base text-text-muted">
              {t.patientGuide.prepItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-secondary/15 text-secondary font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    0{idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Warranty Policy */}
          <div className="mb-14 trust-card p-6 sm:p-8 bg-bg-card border-primary/20">
            <span className="badge badge-success mb-3">
              Jaminan Kepuasan & Kualitas
            </span>
            <h2 className="font-heading text-2xl font-bold text-text mb-3">
              {t.patientGuide.warrantyTitle}
            </h2>
            <p className="text-sm sm:text-base text-text-muted leading-relaxed">
              {t.patientGuide.warrantyDesc}
            </p>
          </div>

          {/* Section 4: FAQ Accordion */}
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-6">
              {t.patientGuide.faqTitle}
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>
    </>
  );
};
