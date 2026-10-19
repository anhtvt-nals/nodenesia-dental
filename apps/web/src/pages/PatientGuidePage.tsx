import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getFaqs } from '../lib/api';
import { Faq } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { FaqAccordion } from '../components/common/FaqAccordion';

export const PatientGuidePage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Kenyamanan & Hak Pasien
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.patientGuide.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.patientGuide.pageDesc}
            </p>
          </div>

          {/* Section 1: 5-Stage Clinical Visit Flow */}
          <div className="mb-16">
            <h2 className="font-serif text-2xl sm:text-3xl text-[#14201C] mb-6">
              {t.patientGuide.visitFlowTitle}
            </h2>
            <div className="space-y-4">
              {t.patientGuide.steps.map((st) => (
                <div
                  key={st.num}
                  className="p-6 hairline-border bg-[#F4F1EA] flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-[#E9E4D8]/30 transition-colors"
                >
                  <span className="font-mono text-2xl text-[#1F3D36] font-light shrink-0">
                    0{st.num}
                  </span>
                  <div>
                    <h3 className="font-serif text-xl text-[#14201C] mb-1">
                      {st.title}
                    </h3>
                    <p className="text-sm font-sans text-[#14201C]/75 leading-relaxed">
                      {st.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Preparation */}
          <div className="mb-16 p-8 hairline-border bg-[#E9E4D8]/30">
            <h2 className="font-serif text-2xl text-[#14201C] mb-4">
              {t.patientGuide.preparationTitle}
            </h2>
            <ul className="space-y-3 text-sm font-sans text-[#14201C]/80">
              {t.patientGuide.prepItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="font-mono text-xs text-[#1F3D36] pt-1 font-semibold">
                    0{idx + 1}.
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Warranty Policy */}
          <div className="mb-16 p-8 hairline-border bg-[#F4F1EA]">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Jaminan Kepuasan & Kualitas
            </span>
            <h2 className="font-serif text-2xl text-[#14201C] mb-3">
              {t.patientGuide.warrantyTitle}
            </h2>
            <p className="text-sm sm:text-base font-sans text-[#14201C]/80 leading-relaxed">
              {t.patientGuide.warrantyDesc}
            </p>
          </div>

          {/* Section 4: FAQ Accordion */}
          <div>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#14201C] mb-6">
              {t.patientGuide.faqTitle}
            </h2>
            <FaqAccordion faqs={faqs} />
          </div>
        </div>
      </div>
    </>
  );
};
