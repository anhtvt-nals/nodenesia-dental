import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getSettings,
  getServices,
  getDoctors,
  getArticles,
  getSlots,
} from '../lib/api';
import {
  ClinicSettings,
  Service,
  Doctor,
  Article,
  BookingSlot,
} from '../types';
import { SectionLabel } from '../components/common/SectionLabel';
import { ServiceCard } from '../components/common/ServiceCard';
import { PriceRow } from '../components/common/PriceRow';
import { DoctorCard } from '../components/common/DoctorCard';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { ArticleCard } from '../components/common/ArticleCard';
import { LazyTeethScene as TeethScene } from '../components/teeth/LazyTeethScene';
import { AppHelmet } from '../components/common/AppHelmet';
import { formatRupiah, buildWhatsAppLink } from '../lib/utils';

const DEFAULT_STATS = [
  { value: '[JUMLAH]+', label: 'Pasien Terlayani', labelEn: 'Patients Treated' },
  { value: '[JUMLAH]', label: 'Dokter Spesialis', labelEn: 'Specialist Dentists' },
  { value: '[JUMLAH]%', label: 'Kepuasan Pasien', labelEn: 'Patient Satisfaction' },
  { value: '[JUMLAH] Thn', label: 'Pengalaman Klinis', labelEn: 'Clinical Experience' },
];

export const HomePage: React.FC = () => {
  const { lang, t, localePath } = useI18n();

  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [todaySlots, setTodaySlots] = useState<BookingSlot[]>([]);
  const [selectedMiniService, setSelectedMiniService] = useState<string>('');
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroTouchStartX, setHeroTouchStartX] = useState<number | null>(null);
  // Remote portrait URLs can fail (offline demo, blocked CDN) — fall back to the
  // labelled placeholder instead of a broken image.
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});

  const safeHeroIndex = doctors.length ? Math.min(heroIndex, doctors.length - 1) : 0;
  const selectedHeroDoctor = doctors[safeHeroIndex];
  const hasMultipleDoctors = doctors.length > 1;
  const goToHero = (next: number) => {
    if (doctors.length <= 1) return;
    setHeroIndex(((next % doctors.length) + doctors.length) % doctors.length);
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [sData, srvData, docData, artData] = await Promise.all([
        getSettings(),
        getServices(),
        getDoctors(),
        getArticles(),
      ]);
      if (!isMounted) return;
      setSettings(sData);
      setServices(srvData);
      setDoctors(docData);
      setArticles(artData.slice(0, 3)); // 3 cards for Home

      // Default the interactive selectors to the first available records.
      const firstService = srvData[0];
      setSelectedMiniService((current) => current || firstService?.id || '');

      // Load preview slots for today
      if (firstService) {
        const todayStr = new Date().toISOString().split('T')[0];
        const slots = await getSlots({ serviceId: firstService.slug, date: todayStr });
        if (isMounted) {
          setTodaySlots(slots.filter((s) => s.available).slice(0, 8));
        }
      }
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const jsonLdDentist = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: 'Klinik Gigi [NAMA KLINIK]',
    image: 'https://klinikgigi.id/assets/clinic.jpg',
    telephone: settings?.phone || '+62 21 7890 1234',
    address: {
      '@type': 'PostalAddress',
      streetAddress: '[ALAMAT KLINIK]',
      addressLocality: 'Jakarta Selatan',
      addressRegion: 'DKI Jakarta',
      postalCode: '12430',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.2607,
      longitude: 106.8166,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '20:00',
      },
    ],
    priceRange: 'Rp 250.000 - Rp 15.000.000',
  };

  const waAskLink = buildWhatsAppLink(
    settings?.whatsappNumber || '6281289001234',
    t.booking.waPrefillGeneral
  );

  const heroStats = settings?.stats?.length ? settings.stats : DEFAULT_STATS;

  return (
    <>
      <AppHelmet
        title={lang === 'en' ? 'Modern Dental Care in Jakarta' : 'Klinik Gigi Modern & Terpercaya'}
        description={t.home.heroDesc}
        path="/"
        jsonLd={jsonLdDentist}
      />

      {/* Hero Section */}
      <section className="pt-8 md:pt-14 pb-16 md:pb-24 bg-gradient-to-b from-bg via-bg to-bg-alt border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Hero Header & Value Proposition */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
            <div className="lg:col-span-7">
              <div className="badge badge-success mb-5 inline-flex items-center gap-2">
                <svg className="w-4 h-4 text-success-dark shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  {lang === 'en'
                    ? 'Registered with Indonesian Ministry of Health · Class B Autoclave'
                    : 'Terdaftar Resmi Kemenkes RI · Standar Sterilisasi Kelas B'}
                </span>
              </div>

              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-text leading-[1.12] mb-5 tracking-tight">
                {t.home.heroTitlePart1}{' '}
                <span className="gradient-text">{t.home.heroTitleAccent}</span>{' '}
                {t.home.heroTitlePart2}
              </h1>

              <p className="text-base sm:text-lg text-text-muted mb-7 leading-relaxed max-w-2xl">
                {t.home.heroDesc}
              </p>

              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  to={localePath('/booking')}
                  className="btn-primary text-base px-6 py-3.5 cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>{t.home.heroPrimaryCta}</span>
                </Link>
                <Link
                  to={localePath('/harga')}
                  className="btn-secondary text-base px-6 py-3.5 cursor-pointer"
                >
                  <span>{t.nav.prices}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to={localePath('/booking/kelola')}
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-primary hover:text-primary-hover transition-colors cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <span>{t.nav.manageBooking}</span>
                </Link>
              </div>
            </div>

            {/* Hero Stats Grid (3+1 clinical metrics using placeholders from settings) */}
            <div className="lg:col-span-5">
              <div className="trust-card p-6 sm:p-7 bg-bg-card">
                <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-primary">
                        {lang === 'en' ? 'Clinical Indicators' : 'Indikator Layanan Klinis'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {lang === 'en' ? 'Transparent & standardized care' : 'Perawatan terstandarisasi & transparan'}
                      </p>
                    </div>
                  </div>
                  <span className="badge badge-primary">Kemenkes RI</span>
                </div>

                <div className="grid grid-cols-2 gap-3.5 sm:gap-5">
                  {heroStats.map((stat, idx) => (
                    <div key={idx} className="p-3 sm:p-3.5 rounded-xl bg-bg-alt/70 border border-border/70 min-w-0">
                      <div className="stat-number text-lg sm:text-2xl xl:text-3xl mb-1 break-words">
                        {stat.value}
                      </div>
                      <div className="text-xs font-medium text-text-muted">
                        {lang === 'en' ? stat.labelEn : stat.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Row: Doctor Spotlight Slider + Floating Trust Badges & 3D Teeth Explorer */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Left Column: Doctor spotlight slider with floating demo trust badges */}
            <div className="lg:col-span-7 flex flex-col relative">
              {selectedHeroDoctor && (
                <div className="relative h-full rounded-2xl overflow-hidden bg-bg-card border border-border shadow-lg flex flex-col">
                  {/* Slider track (swipeable on touch) */}
                  <div
                    className="flex h-full transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(-${safeHeroIndex * 100}%)` }}
                    onTouchStart={(e) => setHeroTouchStartX(e.touches[0].clientX)}
                    onTouchEnd={(e) => {
                      if (heroTouchStartX === null) return;
                      const delta = e.changedTouches[0].clientX - heroTouchStartX;
                      if (Math.abs(delta) > 40) goToHero(safeHeroIndex + (delta < 0 ? 1 : -1));
                      setHeroTouchStartX(null);
                    }}
                  >
                    {doctors.map((doc, idx) => {
                      const docTitle = lang === 'en' ? doc.titleEn : doc.title;
                      const docSpecialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
                      const docBio = lang === 'en' ? doc.bioEn : doc.bio;
                      const docExperience = lang === 'en' ? doc.experienceEn : doc.experience;
                      const isActive = idx === safeHeroIndex;

                      return (
                        <article
                          key={doc.id}
                          aria-hidden={!isActive}
                          className="w-full shrink-0 h-full flex flex-col"
                        >
                          {/* Photo */}
                          <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[340px] shrink-0 bg-bg-alt overflow-hidden border-b border-border">
                            {doc.photoUrl && !doc.photoUrl.includes('unsplash.com') && !brokenPhotos[doc.id] ? (
                              <img
                                src={doc.photoUrl}
                                alt={doc.name}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                onError={() =>
                                  setBrokenPhotos((current) => ({ ...current, [doc.id]: true }))
                                }
                                className="w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-gradient-to-br from-primary/10 to-secondary/10">
                                <svg className="w-12 h-12 text-primary/50 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                                  [FOTO {doc.name.toUpperCase()}]
                                </span>
                              </div>
                            )}

                            {/* Floating Trust Badges on Image (matching demo hero floating cards) */}
                            <div className="absolute top-3 left-3 bg-bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-md flex items-center gap-2.5 pointer-events-none">
                              <div className="w-8 h-8 rounded-full bg-success/15 text-success-dark flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                              </div>
                              <div>
                                <p className="text-xs font-bold text-text leading-tight">STR & SIP Resmi</p>
                                <p className="text-[11px] text-text-muted leading-tight">{docSpecialty}</p>
                              </div>
                            </div>

                            {docExperience && (
                              <div className="absolute bottom-3 right-3 bg-bg-card/95 backdrop-blur-md border border-border rounded-xl px-3 py-2 shadow-md flex items-center gap-2 pointer-events-none">
                                <div className="w-7 h-7 rounded-full bg-primary/15 text-primary flex items-center justify-center shrink-0">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <polyline points="12 6 12 12 16 14" />
                                  </svg>
                                </div>
                                <span className="text-xs font-semibold text-text">
                                  {docExperience}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Condensed info + CTAs */}
                          <div className="p-5 sm:p-6 flex flex-col flex-1">
                            <div className="mb-3">
                              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                <span className="badge badge-primary">{docSpecialty}</span>
                                {doc.sipNumber && (
                                  <span className="text-xs font-medium text-text-muted">• {doc.sipNumber}</span>
                                )}
                              </div>
                              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-text tracking-tight mb-1">
                                {doc.name}
                              </h2>
                              <p className="text-xs sm:text-sm font-medium text-text-muted">
                                {docTitle}
                              </p>
                            </div>

                            <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                              {docBio}
                            </p>

                            <div className="mt-auto pt-5">
                              {hasMultipleDoctors && (
                                <div className="flex items-center justify-between gap-4 mb-3">
                                  <div className="flex items-center gap-1">
                                    {doctors.map((d, i) => (
                                      <button
                                        key={d.id}
                                        type="button"
                                        tabIndex={isActive ? 0 : -1}
                                        aria-label={d.name}
                                        aria-current={i === safeHeroIndex ? 'true' : undefined}
                                        onClick={() => setHeroIndex(i)}
                                        className="min-w-[28px] min-h-[28px] flex items-center justify-center cursor-pointer"
                                      >
                                        <span
                                          className={`h-2 rounded-full transition-all block ${
                                            i === safeHeroIndex
                                              ? 'w-7 bg-primary'
                                              : 'w-2.5 bg-border hover:bg-text-subtle'
                                          }`}
                                        />
                                      </button>
                                    ))}
                                  </div>
                                  <span className="text-xs font-semibold text-text-muted tabular-nums">
                                    {String(safeHeroIndex + 1).padStart(2, '0')} / {String(doctors.length).padStart(2, '0')}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-4 border-t border-border">
                                <Link
                                  to={localePath(`/booking?dokter=${doc.id}`)}
                                  tabIndex={isActive ? 0 : -1}
                                  className="btn-primary text-sm py-2.5 px-5 justify-center cursor-pointer"
                                >
                                  <span>{t.home.heroDoctorBook}</span>
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                                  </svg>
                                </Link>
                                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                                  <Link
                                    to={localePath(`/dokter/${doc.slug}`)}
                                    tabIndex={isActive ? 0 : -1}
                                    className="flex-1 sm:flex-initial btn-secondary text-sm py-2.5 px-4 justify-center cursor-pointer"
                                  >
                                    {t.home.heroDoctorProfile}
                                  </Link>
                                  <a
                                    href={waAskLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    tabIndex={isActive ? 0 : -1}
                                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 min-h-[42px] rounded-xl text-xs font-bold text-primary-hover hover:bg-primary/10 transition-colors cursor-pointer sm:ml-auto"
                                  >
                                    <span>{t.booking.askViaWhatsApp}</span>
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Prev / Next controls */}
                  {hasMultipleDoctors && (
                    <div className="absolute inset-x-0 top-0 aspect-[16/10] sm:aspect-[16/9] max-h-[340px] pointer-events-none">
                      <button
                        type="button"
                        aria-label="Previous doctor"
                        onClick={() => goToHero(safeHeroIndex - 1)}
                        className="pointer-events-auto absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-bg-card/90 backdrop-blur-sm border border-border text-text hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-md cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Next doctor"
                        onClick={() => goToHero(safeHeroIndex + 1)}
                        className="pointer-events-auto absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center bg-bg-card/90 backdrop-blur-sm border border-border text-text hover:bg-primary hover:text-white hover:border-primary transition-colors shadow-md cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: 3D Teeth Scene Explorer */}
            <div className="lg:col-span-5 flex flex-col">
              <TeethScene services={services} fill />
            </div>
          </div>
        </div>
      </section>

      {/* 01 / Layanan (6 Service Cards matching demo + transparent PriceRow index) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel number={t.home.secLayananNum} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight text-balance">
                {t.home.secLayananTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-2 leading-relaxed">
                {t.home.secLayananDesc}
              </p>
            </div>
            <Link
              to={localePath('/layanan')}
              className="btn-secondary text-sm py-2.5 px-5 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <span>{t.home.viewAllServices}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* 6 Featured Service Cards (Demo pattern: 3-column grid with icon badge + Learn more) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Complete Price List Summary Card */}
          <div className="trust-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-2 border-b border-border">
              <div>
                <h3 className="font-heading text-lg font-bold text-text">
                  {lang === 'en' ? 'Complete Treatment Fee Schedule' : 'Ringkasan Tarif Perawatan Transparan'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted">
                  {lang === 'en'
                    ? 'Estimated ranges before clinical examination. Confirmed by your dentist beforehand.'
                    : 'Estimasi biaya sebelum tindakan. Dokter selalu mengonfirmasi rincian sebelum perawatan dimulai.'}
                </p>
              </div>
              <Link
                to={localePath('/harga')}
                className="text-sm font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>{t.nav.prices}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="divide-y divide-border">
              {services.map((service, idx) => (
                <PriceRow
                  key={service.id}
                  service={service}
                  index={idx}
                  showCategory
                />
              ))}
            </div>

            <div className="mt-6 pt-5 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-bg-alt rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <span className="text-sm font-medium text-text">
                  {t.home.secLayananMore}
                </span>
              </div>
              <a
                href={waAskLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-xs py-2.5 px-4 whitespace-nowrap cursor-pointer"
              >
                <span>{t.booking.askViaWhatsApp}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 02 / Alur Kunjungan (4 steps) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <SectionLabel number={t.home.secFlowNum} />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3 text-balance">
              {t.home.secFlowTitle}
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              {t.home.secFlowDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.home.flowSteps.map((step) => (
              <div key={step.step} className="service-card flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-heading font-bold text-lg flex items-center justify-center">
                      {step.step}
                    </span>
                    <span className="badge badge-primary">
                      {lang === 'en' ? `Step ${step.step}` : `Tahap ${step.step}`}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-text-muted leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 / Tim Dokter (Cards) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel number={t.home.secDoctorNum} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight text-balance">
                {t.home.secDoctorTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-2 leading-relaxed">
                {t.home.secDoctorDesc}
              </p>
            </div>
            <Link
              to={localePath('/dokter')}
              className="btn-secondary text-sm py-2.5 px-5 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <span>{t.home.viewAllDoctors}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <DoctorCard key={doctor.id} doctor={doctor} />
            ))}
          </div>
        </div>
      </section>

      {/* 04 / Jadwal Dokter (Day tabs) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10">
            <SectionLabel number={t.home.secScheduleNum} />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3 text-balance">
              {t.home.secScheduleTitle}
            </h2>
            <p className="text-base text-text-muted max-w-2xl leading-relaxed">
              {t.home.secScheduleDesc}
            </p>
          </div>

          <ScheduleTabs doctors={doctors} />
        </div>
      </section>

      {/* 05 / Tentang (Visi & Misi + Indonesian Self-Service Booking Dashboard Preview) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <SectionLabel number={t.home.secAboutNum} />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight max-w-3xl text-balance">
              {t.home.secAboutTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Vision & Mission Cards */}
            <div className="lg:col-span-7 grid grid-cols-1 gap-6">
              <div className="trust-card p-6 sm:p-8">
                <span className="badge badge-primary mb-3">
                  01 / {t.home.secAboutVision}
                </span>
                <h3 className="font-heading text-2xl font-bold text-text mb-3">
                  {lang === 'en' ? 'Medical Innovation & Integrity' : 'Inovasi & Integritas Medis'}
                </h3>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  {t.home.secAboutVisionDesc}
                </p>
              </div>

              <div className="trust-card p-6 sm:p-8">
                <span className="badge badge-success mb-3">
                  02 / {t.home.secAboutMission}
                </span>
                <ul className="space-y-3.5 text-sm sm:text-base text-text-muted">
                  {t.home.secAboutMissionItems.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-success/15 text-success-dark font-heading font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Indonesian Self-Service Booking Management Preview (Demo dashboard-mock pattern adapted for /booking/kelola) */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="portal-preview p-6 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-error" />
                      <span className="w-3 h-3 rounded-full bg-warning" />
                      <span className="w-3 h-3 rounded-full bg-success" />
                    </div>
                    <span className="text-xs font-semibold text-text-muted">
                      {lang === 'en' ? 'Self-Service Booking Code' : 'Kelola Booking Mandiri'}
                    </span>
                  </div>

                  <div className="bg-bg-alt rounded-xl p-4 mb-4 border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        {lang === 'en' ? 'Booking Reference' : 'Kode Booking Anda'}
                      </span>
                      <span className="badge badge-success">Terkonfirmasi</span>
                    </div>
                    <div className="font-heading text-lg font-bold text-primary mb-1">
                      KG-2026-[KODE]
                    </div>
                    <p className="text-xs text-text-muted">
                      {lang === 'en'
                        ? 'Reschedule or cancel online up to 6 hours before your appointment—no login required.'
                        : 'Ubah jadwal atau batalkan janji temu hingga 6 jam sebelum kedatangan tanpa perlu akun/login.'}
                    </p>
                  </div>

                  <div className="space-y-2.5 mb-6">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-text">
                          {lang === 'en' ? 'Instant Reschedule' : 'Ubah Jadwal Instan'}
                        </p>
                        <p className="text-text-muted">
                          {lang === 'en' ? 'Check live doctor slots anytime' : 'Pilih ulang tanggal & jam praktek dokter'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-bg border border-border">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="text-xs">
                        <p className="font-semibold text-text">
                          {lang === 'en' ? 'WhatsApp Confirmation' : ' pengingat & Konfirmasi WhatsApp'}
                        </p>
                        <p className="text-text-muted">
                          {lang === 'en' ? 'Direct summary sent to your phone' : 'Rincian kode booking dikirim langsung ke WhatsApp'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Link
                  to={localePath('/booking/kelola')}
                  className="btn-secondary w-full justify-center text-sm py-2.5 cursor-pointer"
                >
                  <span>{t.nav.manageBooking}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 06 / Artikel Edukasi (3 Cards) */}
      <section className="py-16 md:py-24 border-b border-border bg-bg-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <SectionLabel number={t.home.secArticlesNum} />
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight text-balance">
                {t.home.secArticlesTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-2 leading-relaxed">
                {t.home.secArticlesDesc}
              </p>
            </div>
            <Link
              to={localePath('/artikel')}
              className="btn-secondary text-sm py-2.5 px-5 shrink-0 self-start md:self-auto cursor-pointer"
            >
              <span>{t.home.viewAllArticles}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </section>

      {/* 07 / Booking Strip (Demo 2-column gradient CTA + white form card + Indonesian payment methods) */}
      <section className="bg-gradient-to-br from-primary to-bg-dark text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Contact Info & Practice Hours */}
            <div className="lg:col-span-5">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 text-white text-xs font-bold uppercase tracking-wider mb-4">
                {t.home.secStripNum}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight">
                {t.home.secStripTitle}
              </h2>
              <p className="text-base text-white/85 leading-relaxed mb-8">
                {t.home.secStripDesc}
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-white/75">
                      {lang === 'en' ? 'Clinic Hours' : 'Jam Operasional Klinik'}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      Senin–Sabtu 09:00–20:00 WIB
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <div className="text-xs text-white/75">
                      {lang === 'en' ? 'WhatsApp & Emergency Line' : 'Layanan WhatsApp & Darurat'}
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {settings?.phone || '+62 21 7890 1234'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Demo Form Card */}
            <div className="lg:col-span-7">
              <div className="bg-bg-card text-text rounded-2xl p-6 sm:p-8 shadow-xl border border-border">
                <h3 className="font-heading text-xl font-bold text-text mb-1">
                  {lang === 'en' ? 'Quick Online Appointment' : 'Mulai Booking Jadwal Online'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-6">
                  {lang === 'en'
                    ? 'Select a treatment or pick an open time slot today.'
                    : 'Pilih jenis perawatan atau klik langsung jam praktek yang tersedia hari ini.'}
                </p>

                <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-6">
                  <div className="flex-1">
                    <label htmlFor="home-strip-service" className="form-label">
                      {lang === 'en' ? 'Select Dental Service' : 'Pilih Layanan Perawatan'}
                    </label>
                    <select
                      id="home-strip-service"
                      value={selectedMiniService}
                      onChange={(e) => setSelectedMiniService(e.target.value)}
                      className="form-input cursor-pointer"
                    >
                      {services.map((s) => (
                        <option key={s.id} value={s.id}>
                          {lang === 'en' ? s.nameEn : s.name} ({formatRupiah(s.priceFrom, lang === 'en')})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="shrink-0 flex items-end">
                    <Link
                      to={localePath(`/booking?layanan=${services.find((s) => s.id === selectedMiniService)?.slug || 'scaling'}`)}
                      className="btn-primary w-full sm:w-auto justify-center py-3 px-6 cursor-pointer"
                    >
                      <span>{lang === 'en' ? 'Continue Booking' : 'Lanjut Booking'}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>

                {/* Today Time Chips snippet */}
                <div className="pt-5 border-t border-border">
                  <span className="text-xs font-semibold text-text-muted block mb-2.5">
                    {lang === 'en'
                      ? `Available Slots Today (${todaySlots.length} open):`
                      : `Slot Tersedia Hari Ini (${todaySlots.length} slot terbuka):`}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {todaySlots.map((slot) => (
                      <Link
                        key={slot.time}
                        to={localePath(`/booking?layanan=${services.find((s) => s.id === selectedMiniService)?.slug || 'scaling'}&jam=${slot.time}`)}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-bg-alt hover:bg-primary hover:text-white text-text border border-border transition-colors cursor-pointer"
                      >
                        {slot.time}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Indonesian Payment Methods Placeholder */}
                <div className="mt-6 pt-4 border-t border-border flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                  <span className="font-medium">
                    {lang === 'en' ? 'Payment at clinic:' : 'Metode pembayaran di klinik:'}
                  </span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">QRIS</span>
                    <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Debit / Kredit</span>
                    <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Transfer Bank</span>
                    <span className="px-2.5 py-1 rounded-md bg-bg-alt border border-border font-semibold text-text">Tunai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
