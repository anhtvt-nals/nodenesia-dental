import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { DoctorCard } from '../components/common/DoctorCard';
import { AppHelmet } from '../components/common/AppHelmet';

export const DoctorsPage: React.FC = () => {
  const { t } = useI18n();
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

      <div className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-3xl">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Keahlian & Sertifikasi
            </span>
            <h1 className="font-serif text-4xl sm:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
              {t.doctors.pageTitle}
            </h1>
            <p className="text-base text-[#14201C]/80 leading-relaxed font-sans">
              {t.doctors.pageDesc}
            </p>
          </div>

          {loading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
