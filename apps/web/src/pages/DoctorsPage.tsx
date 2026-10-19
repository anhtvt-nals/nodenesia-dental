import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { DoctorCard } from '../components/common/DoctorCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const DoctorsPage: React.FC = () => {
  const { lang, t } = useI18n();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const data = await getDoctors();
      setDoctors(data);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <>
      <AppHelmet
        title={t.doctors.pageTitle}
        description={t.doctors.pageDesc}
        path="/dokter"
      />

      <div className="py-10 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Expertise & Credentials' : 'Keahlian & Sertifikasi'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-4 text-balance">
              {t.doctors.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.doctors.pageDesc}
            </p>
          </div>

          {loading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctors.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
