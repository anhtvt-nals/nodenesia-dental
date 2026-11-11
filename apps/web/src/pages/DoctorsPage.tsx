import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useI18n } from '../i18n';
import { getDoctors } from '../lib/api';
import { Doctor } from '../types';
import { DoctorCard } from '../components/common/DoctorCard';
import { AppHelmet } from '../components/common/AppHelmet';
import { DEFAULT_HERO_DOCTORS } from '../lib/fallback-data';
import { Link } from 'react-router-dom';

export const DoctorsPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [specialty, setSpecialty] = useState('all');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(false);
    getDoctors()
      .then((data) => {
        if (active) setDoctors(data.length > 0 ? data : DEFAULT_HERO_DOCTORS);
      })
      .catch(() => {
        if (active) {
          setDoctors(DEFAULT_HERO_DOCTORS);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const specialtyName = (doctor: Doctor) =>
    lang === 'en' ? doctor.specialtyEn || doctor.specialty : doctor.specialty;

  const specialties = [...new Set(doctors.map((doctor) => doctor.specialty).filter(Boolean))];
  const query = search.trim().toLocaleLowerCase();
  const filtered = doctors.filter(
    (doctor) =>
      (specialty === 'all' || specialty === doctor.specialty) &&
      `${doctor.name} ${specialtyName(doctor)} ${doctor.title} ${doctor.titleEn}`
        .toLocaleLowerCase()
        .includes(query)
  );

  const leadDoctor = doctors[0];

  return (
    <>
      <AppHelmet
        title={t.doctors.pageTitle}
        description={t.doctors.pageDesc}
        path="/dokter"
      />

      <PageHeader title={t.doctors.pageTitle} description={t.doctors.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Lead Doctor Editorial Feature (shown when no search filter active) */}
          {!loading && !search && specialty === 'all' && leadDoctor && (
            <div className="mb-14 p-6 sm:p-8 lg:p-10 rounded-2xl bg-secondary text-surface shadow-floating relative overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
                <div className="lg:col-span-4 flex justify-center">
                  <div className="w-56 h-64 sm:w-64 sm:h-72 rounded-[32px] overflow-hidden border-2 border-surface/20 shadow-xl bg-surface/10 relative">
                    <img
                      src={leadDoctor.photoUrl}
                      alt={leadDoctor.name}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-surface/90 backdrop-blur-xs text-secondary text-[11px] font-bold">
                      <span className="text-accent mr-1">✦</span> Lead Specialist
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface/10 text-accent text-xs font-semibold tracking-wider uppercase border border-surface/15">
                    <span>Dokter Penanggung Jawab Klinis</span>
                  </div>

                  <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold text-surface">
                    {leadDoctor.name}
                  </h2>

                  <p className="text-sm font-medium text-accent">
                    {specialtyName(leadDoctor)} · {leadDoctor.title}
                  </p>

                  <p className="text-sm sm:text-base text-surface/80 leading-relaxed max-w-2xl">
                    "{lang === 'en' ? leadDoctor.bioEn : leadDoctor.bio}"
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-4">
                    <Link
                      to={localePath(`/booking?dokter=${encodeURIComponent(leadDoctor.id)}`)}
                      className="btn-whatsapp text-sm py-3 px-6 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Book with Lead Specialist' : 'Buat Janji dengan drg. Ayu'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                    <Link
                      to={localePath(`/dokter/${leadDoctor.slug}`)}
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-surface/90 hover:text-surface underline underline-offset-4 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'View clinical credentials & education' : 'Lihat riwayat pendidikan & sertifikasi'}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Decorative soft watermark */}
              <div
                className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-accent/5 pointer-events-none"
                aria-hidden="true"
              />
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-3">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <label htmlFor="doctor-search" className="sr-only">
                  {lang === 'en' ? 'Search doctors' : 'Cari dokter'}
                </label>
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-text-muted">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  id="doctor-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={lang === 'en' ? 'Search name or specialty…' : 'Cari nama atau spesialisasi…'}
                  className="form-input pl-10 text-sm min-h-[44px]"
                />
              </div>

              {/* Specialty dropdown */}
              <div className="w-full sm:w-60">
                <label htmlFor="doctor-specialty" className="sr-only">
                  {t.doctors.specialty}
                </label>
                <select
                  id="doctor-specialty"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="form-input text-sm min-h-[44px] cursor-pointer"
                >
                  <option value="all">
                    {lang === 'en' ? 'All specialties' : 'Semua spesialisasi'}
                  </option>
                  {specialties.map((val) => (
                    <option key={val} value={val}>
                      {specialtyName(doctors.find((d) => d.specialty === val)!)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Results count */}
            {!loading && !error && (
              <div className="text-xs font-semibold text-text-muted shrink-0">
                {lang === 'en'
                  ? `Showing ${filtered.length} of ${doctors.length} specialists`
                  : `Menampilkan ${filtered.length} dari ${doctors.length} dokter spesialis`}
              </div>
            )}
          </div>

          {/* Doctors Grid / States */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[0, 1, 2].map((k) => (
                <div key={k} className="p-6 rounded-2xl bg-surface border border-border animate-pulse space-y-4">
                  <div className="aspect-[4/4.2] bg-bg-alt rounded-xl" />
                  <div className="h-4 bg-bg-alt rounded w-1/3" />
                  <div className="h-6 bg-bg-alt rounded w-3/4" />
                  <div className="h-4 bg-bg-alt rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border">
              <h3 className="font-heading text-xl font-bold text-secondary mb-2">
                {lang === 'en' ? 'Unable to load our team' : 'Daftar dokter belum dapat dimuat'}
              </h3>
              <p className="text-sm text-text-muted mb-6">
                {lang === 'en' ? 'Please try again in a moment.' : 'Silakan coba kembali beberapa saat lagi.'}
              </p>
              <button
                type="button"
                className="btn-primary text-sm cursor-pointer"
                onClick={() => setAttempt((v) => v + 1)}
              >
                {lang === 'en' ? 'Try again' : 'Coba lagi'}
              </button>
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((doctor) => (
                <DoctorCard key={doctor.id} doctor={doctor} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-surface border border-border">
              <h3 className="font-heading text-xl font-bold text-secondary mb-2">
                {lang === 'en' ? 'No doctors found' : 'Dokter tidak ditemukan'}
              </h3>
              <p className="text-sm text-text-muted mb-6">
                {lang === 'en' ? 'Try another keyword or specialty.' : 'Coba kata kunci atau spesialisasi lain.'}
              </p>
              {(search || specialty !== 'all') && (
                <button
                  type="button"
                  className="btn-secondary text-sm cursor-pointer"
                  onClick={() => {
                    setSearch('');
                    setSpecialty('all');
                  }}
                >
                  {lang === 'en' ? 'Clear filters' : 'Hapus filter'}
                </button>
              )}
            </div>
          )}

          {/* Credentials Reassurance Banner */}
          <div className="mt-14 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-card flex flex-col sm:flex-row items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-heading text-base font-bold text-secondary">
                {lang === 'en' ? 'Standard of Medical Excellence' : 'Standar Kompetensi & Legalitas Medis'}
              </h4>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                {lang === 'en'
                  ? 'All specialists hold verified active SIP (Practice Licenses), active membership in the Indonesian Dental Association (PDGI), and adhere to international sterilization protocols.'
                  : 'Seluruh dokter spesialis kami memegang Surat Izin Praktik (SIP) resmi terverifikasi, aktif di Persatuan Dokter Gigi Indonesia (PDGI), dan menerapkan protokol sterilisasi standar internasional.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
