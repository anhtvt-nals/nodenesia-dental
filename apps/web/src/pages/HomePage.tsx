import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getSettings,
  getServices,
  getDoctors,
  getArticles,
  getTestimonials,
} from '../lib/api';
import {
  ClinicSettings,
  Service,
  Doctor,
  Article,
  Testimonial,
} from '../types';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { AppHelmet } from '../components/common/AppHelmet';
import { StaticMap } from '../components/common/StaticMap';
import { formatRupiah, buildWhatsAppLink } from '../lib/utils';

// TODO: Replace demo stock portraits with verified in-clinic photography of each specialist
const DEFAULT_HERO_DOCTORS: Doctor[] = [
  {
    id: 'fallback-drg-ayu',
    slug: 'drg-ayu',
    name: 'drg. Ayu Larasati, Sp.KG',
    title: 'Dokter Gigi Spesialis Konservasi Gigi (Sp.KG)',
    titleEn: 'Specialist in Conservative Dentistry & Endodontics (Sp.KG)',
    specialty: 'Konservasi Gigi & Estetik (Sp.KG)',
    specialtyEn: 'Conservative Dentistry & Aesthetics (Sp.KG)',
    bio: 'Menangani perawatan saluran akar mikroskopis, veneer porselen minimal-prep, dan tambal komposit estetik.',
    bioEn: 'Handles microscopic root canal therapy, minimal-prep porcelain veneers, and aesthetic composite restorations.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80',
    sipNumber: 'SIP. 503/4421/DPMPTSP/2023',
    experienceYears: 12,
    education: ['Spesialis Konservasi Gigi — Universitas Indonesia', 'Dokter Gigi — Universitas Airlangga'],
    serviceIds: [],
    workingHours: [],
  },
  {
    id: 'fallback-drg-bima',
    slug: 'drg-bima',
    name: 'drg. Bima Wicaksono, Sp.Ort',
    title: 'Dokter Gigi Spesialis Ortodonti (Sp.Ort)',
    titleEn: 'Specialist in Orthodontics & Dentofacial Orthopedics (Sp.Ort)',
    specialty: 'Ortodonti & Perataan Gigi (Sp.Ort)',
    specialtyEn: 'Orthodontics & Bite Alignment (Sp.Ort)',
    bio: 'Menangani perataan gigi berjejal tanpa cabut gigi sehat, behel self-ligating, serta aligner transparan.',
    bioEn: 'Focuses on non-extraction crowding correction, self-ligating braces, and clear aligners.',
    photoUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80',
    sipNumber: 'SIP. 503/8912/DPMPTSP/2022',
    experienceYears: 10,
    education: ['Spesialis Ortodonti — Universitas Gadjah Mada', 'Dokter Gigi — Universitas Indonesia'],
    serviceIds: [],
    workingHours: [],
  },
  {
    id: 'fallback-drg-citra',
    slug: 'drg-citra',
    name: 'drg. Citra Dewi, Sp.BM',
    title: 'Dokter Gigi Spesialis Bedah Mulut & Maksilofasial (Sp.BM)',
    titleEn: 'Specialist in Oral & Maxillofacial Surgery (Sp.BM)',
    specialty: 'Implan Gigi & Bedah Mulut (Sp.BM)',
    specialtyEn: 'Implantology & Oral Surgery (Sp.BM)',
    bio: 'Menangani pemasangan implan gigi terpandu 3D CBCT dan pencabutan gigi bungsu impaksi minim trauma.',
    bioEn: 'Dedicated to 3D CBCT-guided dental implants and atraumatic wisdom tooth extractions.',
    photoUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80',
    sipNumber: 'SIP. 503/3218/DPMPTSP/2024',
    experienceYears: 9,
    education: ['Spesialis Bedah Mulut — Universitas Padjadjaran', 'Dokter Gigi — Universitas Padjadjaran'],
    serviceIds: [],
    workingHours: [],
  },
];

export const HomePage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});
  const [quickService, setQuickService] = useState('');
  const [quickDoctor, setQuickDoctor] = useState('');

  const displayDoctors = doctors.length > 0 ? doctors : DEFAULT_HERO_DOCTORS;

  const heroChips = Array.from(new Set(services.map((s) => t.services.categories[s.category]))).slice(0, 4);

  const handleQuickBook = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (quickService) params.set('layanan', quickService);
    if (quickDoctor) params.set('dokter', quickDoctor);
    const query = params.toString();
    navigate(localePath(`/booking${query ? `?${query}` : ''}`));
  };

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      const [sData, srvData, docData, artData, revData] = await Promise.all([
        getSettings(),
        getServices(),
        getDoctors(),
        getArticles(),
        getTestimonials().catch(() => [] as Testimonial[]),
      ]);
      if (!isMounted) return;
      setSettings(sData);
      setServices(srvData);
      setDoctors(docData);
      setArticles(artData.slice(0, 3));
      setReviews(revData.slice(0, 4));
    }
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const clinicName = settings?.name || 'Klinik Gigi Senyum Sehat';
  const clinicAddress =
    settings?.address || 'Jl. Wolter Monginsidi No. 88, Kebayoran Baru, Jakarta Selatan 12180';

  const jsonLdDentist = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: clinicName,
    telephone: settings?.phone || '+62 21 7208 4500',
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinicAddress,
      addressLocality: 'Jakarta Selatan',
      addressRegion: 'DKI Jakarta',
      postalCode: '12180',
      addressCountry: 'ID',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -6.2408,
      longitude: 106.8032,
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

  // Filter for real review data (non-empty name, treatment/serviceName, and comment without bracket placeholders)
  const validReviews = reviews.filter(
    (rev) =>
      Boolean(rev.name?.trim()) &&
      Boolean(rev.serviceName?.trim()) &&
      Boolean((lang === 'en' ? rev.commentEn : rev.comment)?.trim()) &&
      !/\[.*\]/.test(rev.name) &&
      !/\[.*\]/.test(rev.comment)
  );
  const featuredReview = validReviews[0];
  const secondaryReviews = validReviews.slice(1, 4);

  return (
    <>
      <AppHelmet
        title={lang === 'en' ? 'Specialist Dental Clinic in South Jakarta' : 'Klinik Dokter Gigi Spesialis Jakarta Selatan'}
        description={t.home.heroDesc}
        path="/"
        jsonLd={jsonLdDentist}
      />

      {/* 1. HERO: replicates hero.png layout - eyebrow, 2-line headline, pill CTAs with arrow circles, stacked booking fields, large rounded photo with floating stat card and glass chips */}
      <section className="bg-bg border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-14 md:pt-14 md:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left */}
            <div className="min-w-0 lg:pt-2">
              <p className="inline-flex items-center gap-2 text-base font-medium text-primary mb-5">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
                </svg>
                {lang === 'en' ? 'Open Monday – Saturday, 09:00 – 20:00' : 'Buka Senin – Sabtu, 09.00 – 20.00 WIB'}
              </p>

              <h1 className="font-heading text-[2.5rem] sm:text-5xl lg:text-[3.5rem] font-bold text-primary leading-[1.1] tracking-[-0.02em] mb-5 max-w-[14ch] sm:max-w-none">
                <span className="block">{t.home.heroTitlePart1}</span>
                <span className="block">
                  {t.home.heroTitleAccent} {t.home.heroTitlePart2}
                </span>
              </h1>

              <p className="text-base sm:text-[1.0625rem] text-text-muted mb-8 leading-relaxed max-w-[52ch]">
                {t.home.heroDesc}
              </p>

              {/* Max 2 CTAs, pill shape with arrow circle */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Link
                  to={localePath('/booking')}
                  className="group inline-flex items-center gap-3 rounded-full bg-primary text-bg pl-6 pr-2 py-2 text-base font-medium hover:bg-primary-hover transition-colors"
                >
                  {t.home.heroPrimaryCta}
                  <span className="w-9 h-9 rounded-full bg-bg text-primary inline-flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </Link>

                <a
                  href={waAskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 rounded-full bg-accent text-text border border-text/15 pl-6 pr-2 py-2 text-base font-medium hover:opacity-90 transition-opacity"
                >
                  {t.home.heroSecondaryCta}
                  <span className="w-9 h-9 rounded-full bg-text text-bg inline-flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </span>
                </a>
              </div>

              {/* Quick booking: stacked fields -> existing /booking?layanan=&dokter= params */}
              <form onSubmit={handleQuickBook} className="space-y-3 max-w-[510px]">
                <div className="relative">
                  <label className="sr-only" htmlFor="hero-service">
                    {lang === 'en' ? 'Treatment' : 'Layanan'}
                  </label>
                  <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 3h10a2 2 0 012 2v14l-4-2-3 2-3-2-4 2V5a2 2 0 012-2zM9 8h6M9 12h6" />
                  </svg>
                  <select
                    id="hero-service"
                    value={quickService}
                    onChange={(e) => setQuickService(e.target.value)}
                    className="w-full appearance-none rounded-[14px] bg-bg-alt text-primary font-medium text-base pl-12 pr-11 py-3.5 min-h-[56px] cursor-pointer border border-transparent focus:border-primary"
                  >
                    <option value="">{lang === 'en' ? 'Treatment' : 'Layanan'}</option>
                    {services.map((sv) => (
                      <option key={sv.id} value={sv.slug}>
                        {lang === 'en' ? sv.nameEn : sv.name}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                <div className="relative">
                  <label className="sr-only" htmlFor="hero-doctor">
                    {lang === 'en' ? 'Specialist' : 'Dokter spesialis'}
                  </label>
                  <svg className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
                  </svg>
                  <select
                    id="hero-doctor"
                    value={quickDoctor}
                    onChange={(e) => setQuickDoctor(e.target.value)}
                    className="w-full appearance-none rounded-[14px] bg-bg-alt text-primary font-medium text-base pl-12 pr-11 py-3.5 min-h-[56px] cursor-pointer border border-transparent focus:border-primary"
                  >
                    <option value="">{lang === 'en' ? 'Specialist' : 'Dokter spesialis'}</option>
                    {doctors.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  <svg className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                  </svg>
                </div>

                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-bg px-6 py-3 text-base font-medium hover:bg-primary-hover transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                  </svg>
                  {lang === 'en' ? 'Check slots' : 'Cek jadwal'}
                </button>
              </form>
            </div>

            {/* Right: large rounded photo, floating stat card, glass chips */}
            <div className="relative w-full max-w-[540px] mx-auto lg:mr-0 lg:ml-auto">
              {/* TODO: Replace stock photo with real in-clinic photography */}
              <div className="relative aspect-[533/604] w-full overflow-hidden rounded-[36px] bg-bg-alt">
                <img
                  src="https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80"
                  alt={lang === 'en' ? 'Patient during a dental checkup' : 'Pasien saat pemeriksaan gigi'}
                  loading="eager"
                  className="w-full h-full object-cover"
                />

                {heroChips.length > 0 && (
                  <div className="absolute inset-x-4 bottom-4 flex flex-wrap gap-2">
                    {heroChips.map((chip) => (
                      <span
                        key={chip}
                        className="rounded-full bg-primary/70 backdrop-blur-md border border-bg/40 text-bg text-sm font-medium px-4 py-2"
                      >
                        {chip}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Floating stat card overlapping the photo's left edge */}
              <div className="absolute -left-4 sm:-left-10 top-[56%] bg-bg rounded-[20px] px-5 py-4 shadow-[0_16px_36px_-16px_rgba(18,57,47,0.4)] max-w-[220px]">
                <p className="font-heading text-lg font-bold text-text leading-tight">
                  {lang === 'en' ? '380+ reviews' : '380+ ulasan'}
                </p>
                <p className="text-sm text-text-muted leading-snug mt-1">
                  {lang === 'en'
                    ? 'Rated 4.9 / 5.0 on Google Maps'
                    : 'Rating 4,9 / 5,0 di Google Maps'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SERVICES (Mint #DDEAE3): ONE hairline table-style list replacing both cards & duplicate fee table */}
      <section className="py-16 md:py-24 bg-bg-alt border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
                {t.home.secLayananTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-2 leading-relaxed">
                {t.home.secLayananDesc}
              </p>
            </div>
            <Link
              to={localePath('/harga')}
              className="text-base font-semibold text-primary underline underline-offset-4 hover:opacity-80 shrink-0 self-start md:self-auto"
            >
              {t.home.viewAllServices}
            </Link>
          </div>

          <div className="border-t border-border divide-y divide-border">
            {services.map((service) => {
              const serviceName = lang === 'en' ? service.nameEn : service.name;
              const shortDesc = lang === 'en' ? service.shortDescEn : service.shortDesc;

              return (
                <div
                  key={service.id}
                  className="py-5 rounded-none grid grid-cols-1 md:grid-cols-[1fr_1.6fr_auto] gap-2 md:gap-8 items-baseline"
                >
                  <div>
                    <Link
                      to={localePath(`/layanan/${service.slug}`)}
                      className="font-heading text-lg sm:text-xl font-bold text-text hover:text-primary transition-colors"
                    >
                      {serviceName}
                    </Link>
                  </div>

                  <div className="text-base text-text-muted leading-relaxed">
                    {shortDesc} ({service.durationMinutes} {t.common.minutes})
                  </div>

                  <div className="md:text-right text-base text-text tabular-nums whitespace-nowrap flex flex-wrap md:justify-end items-baseline gap-x-4 gap-y-1">
                    <span>
                      <span className="text-text-muted mr-1.5">{t.services.startingFrom}</span>
                      <strong className="font-heading font-bold text-lg text-text">
                        {formatRupiah(service.priceFrom, lang === 'en')}
                      </strong>
                    </span>
                    <Link
                      to={localePath(`/layanan/${service.slug}`)}
                      className="text-base font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                    >
                      {t.common.moreDetail}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. DOCTORS (Enamel #F6F7F4): Lead doctor block larger; others compact. Photo alternating left/right, 1 CTA per doctor */}
      <section className="py-16 md:py-24 bg-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
              {t.home.secDoctorTitle}
            </h2>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {displayDoctors.map((doc, idx) => {
              const isLead = idx === 0;
              const isPhotoRight = idx % 2 === 1;
              const docTitle = lang === 'en' ? doc.titleEn : doc.title;
              const docSpecialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
              const docBio = lang === 'en' ? doc.bioEn : doc.bio;
              const fallbackImg = DEFAULT_HERO_DOCTORS[idx % DEFAULT_HERO_DOCTORS.length].photoUrl;

              return (
                <article
                  key={doc.id}
                  className={
                    isLead
                      ? 'py-12 md:py-16 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center'
                      : 'py-8 md:py-10 grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center'
                  }
                >
                  {/* Doctor Portrait */}
                  <div
                    className={`${isLead ? 'md:col-span-6' : 'md:col-span-4'} ${
                      isPhotoRight ? 'md:order-2' : 'md:order-1'
                    }`}
                  >
                    <div
                      className={`${
                        isLead ? 'aspect-[4/3]' : 'aspect-[16/10]'
                      } w-full bg-bg-alt overflow-hidden border border-border ${
                        isPhotoRight ? 'photo-asymmetric-alt' : 'photo-asymmetric'
                      }`}
                    >
                      <img
                        src={doc.photoUrl && !brokenPhotos[doc.slug] ? doc.photoUrl : fallbackImg}
                        alt={doc.name}
                        loading="lazy"
                        onError={() =>
                          setBrokenPhotos((prev) => ({ ...prev, [doc.slug]: true }))
                        }
                        className="w-full h-full object-cover object-top"
                      />
                    </div>
                  </div>

                  {/* Doctor Editorial Copy */}
                  <div
                    className={`${isLead ? 'md:col-span-6' : 'md:col-span-8'} ${
                      isPhotoRight ? 'md:order-1' : 'md:order-2'
                    }`}
                  >
                    <p className="text-base font-medium text-primary mb-1">
                      {docSpecialty}
                      {doc.experienceYears
                        ? ` · ${doc.experienceYears} ${lang === 'en' ? 'years clinical practice' : 'tahun praktik klinis'}`
                        : ''}
                    </p>
                    <h3
                      className={`font-heading font-bold text-text mb-1 ${
                        isLead ? 'text-2xl sm:text-4xl' : 'text-xl sm:text-2xl'
                      }`}
                    >
                      <Link to={localePath(`/dokter/${doc.slug}`)} className="hover:text-primary">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-base text-text-muted mb-3">
                      {docTitle}
                      {doc.sipNumber ? ` · ${doc.sipNumber}` : ''}
                    </p>

                    <p className="text-base text-text-muted leading-relaxed mb-4 max-w-[60ch]">
                      {docBio}
                    </p>

                    {isLead && doc.education && doc.education.length > 0 && (
                      <ul className="text-base text-text-muted space-y-1 mb-5">
                        {doc.education.map((edu, eduIdx) => (
                          <li key={eduIdx}>{edu}</li>
                        ))}
                      </ul>
                    )}

                    {/* One CTA per doctor */}
                    <div>
                      <Link
                        to={localePath(`/booking?dokter=${doc.id}`)}
                        className="text-base font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                      >
                        {t.doctors.bookWithDoctor}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REVIEWS (Mint #DDEAE3): Hidden if no real review data; otherwise 1 large pull quote + 2-3 small quotes showing real name + treatment only */}
      {featuredReview && (
        <section className="py-16 md:py-24 bg-bg-alt border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
                {lang === 'en' ? 'What patients say after their visit' : 'Cerita pasien seusai kunjungan'}
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-8 border-t border-border items-start">
              {/* Large Pull Quote */}
              <div className="lg:col-span-7">
                <blockquote className="font-heading text-2xl sm:text-3xl lg:text-[2.1rem] font-medium text-text leading-[1.28] mb-6">
                  “{lang === 'en' ? featuredReview.commentEn : featuredReview.comment}”
                </blockquote>
                <div className="text-base text-text-muted">
                  <strong className="font-semibold text-text">{featuredReview.name}</strong>
                  {featuredReview.serviceName ? ` — ${featuredReview.serviceName}` : ''}
                </div>
              </div>

              {/* 2–3 Smaller Quotes as a Plain Hairline List */}
              {secondaryReviews.length > 0 && (
                <div className="lg:col-span-5 divide-y divide-border border-t lg:border-t-0 lg:border-l border-border lg:pl-10">
                  {secondaryReviews.map((rev) => (
                    <div key={rev.id} className="py-5 first:pt-0 last:pb-0">
                      <blockquote className="text-base text-text leading-relaxed mb-2">
                        “{lang === 'en' ? rev.commentEn : rev.comment}”
                      </blockquote>
                      <div className="text-base text-text-muted">
                        <strong className="font-semibold text-text">{rev.name}</strong>
                        {rev.serviceName ? ` — ${rev.serviceName}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. SCHEDULE (Pine #12392F for section rhythm): Plain weekly table, no pill tabs */}
      <section className="py-16 md:py-24 bg-primary text-bg border-b border-bg/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-bg tracking-tight">
              {t.home.secScheduleTitle}
            </h2>
          </div>

          <ScheduleTabs doctors={displayDoctors} variant="pine" />
        </div>
      </section>

      {/* 6. ARTICLES (Mint #DDEAE3): List rows, no cards */}
      {articles.length > 0 && (
        <section className="py-16 md:py-24 bg-bg-alt border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
                {t.home.secArticlesTitle}
              </h2>
            </div>

            <div className="border-t border-border divide-y divide-border">
              {articles.map((art) => {
                const title = lang === 'en' ? art.titleEn : art.title;
                const summary = lang === 'en' ? art.summaryEn : art.summary;

                return (
                  <article
                    key={art.id}
                    className="py-6 grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-baseline"
                  >
                    <div className="md:col-span-5">
                      <h3 className="font-heading text-xl font-bold text-text leading-snug">
                        <Link to={localePath(`/artikel/${art.slug}`)} className="hover:text-primary">
                          {title}
                        </Link>
                      </h3>
                      <span className="block text-base text-text-muted mt-1">
                        {art.authorName} · {art.readTime}
                      </span>
                    </div>

                    <p className="md:col-span-5 text-base text-text-muted leading-relaxed">
                      {summary}
                    </p>

                    <div className="md:col-span-2 md:text-right">
                      <Link
                        to={localePath(`/artikel/${art.slug}`)}
                        className="text-base font-semibold text-primary underline underline-offset-4 hover:opacity-80 whitespace-nowrap"
                      >
                        {lang === 'en' ? 'Read article' : 'Baca artikel'}
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* 7. LOCATION (Enamel #F6F7F4): Map + plain text address/parking/transit, no boxed sub-cards */}
      <section className="py-16 md:py-24 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
              {lang === 'en' ? 'Location, parking, and visit details' : 'Lokasi klinik, parkir, dan pembayaran'}
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Plain Text Address, Parking, Transit & Payment Details */}
            <div className="lg:col-span-5 space-y-6 border-t border-border pt-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {t.contact.addressTitle}
                </h3>
                <p className="text-base text-text-muted leading-relaxed">
                  {clinicAddress}
                </p>
                <a
                  href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-base font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {t.contact.viewOnMap}
                </a>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {lang === 'en' ? 'Parking & public transit' : 'Kapasitas parkir & transportasi umum'}
                </h3>
                <p className="text-base text-text-muted leading-relaxed">
                  {lang === 'en'
                    ? 'Free private parking for 6 cars and 15 motorcycles at the clinic entrance. 5 minutes from Blok M / Senayan MRT Station and Tendean TransJakarta stop.'
                    : 'Parkir halaman pribadi gratis untuk 6 mobil dan 15 motor tepat di depan lobi. Berjarak 5 menit dari Stasiun MRT Blok M / Senayan dan Halte TransJakarta Tendean.'}
                </p>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {lang === 'en' ? 'Payment & insurance' : 'Pembayaran & klaim asuransi'}
                </h3>
                <p className="text-base text-text-muted leading-relaxed">
                  {lang === 'en'
                    ? 'Accepts QRIS, Debit/Credit cards, bank transfer, and cash. We provide itemized medical receipts and odontograms for private/corporate insurance reimbursement (non-BPJS clinic).'
                    : 'Menerima QRIS, kartu Debit/Kredit, transfer bank, dan tunai. Kami menerbitkan kuitansi medis rincian tindakan serta odontogram resmi untuk klaim reimbursement asuransi swasta/kantor (belum melayani BPJS Kesehatan).'}
                </p>
              </div>

              <div className="pt-5 border-t border-border flex flex-wrap items-center gap-4">
                <Link
                  to={localePath('/booking')}
                  className="btn-primary text-base"
                >
                  {t.home.heroPrimaryCta}
                </Link>
                <Link
                  to={localePath('/booking/kelola')}
                  className="text-base font-semibold text-text-muted hover:text-text underline underline-offset-4"
                >
                  {t.nav.manageBooking}
                </Link>
              </div>
            </div>

            {/* Map: raster tiles (no iframe / key / WebGL) so no blank box or spinner can appear */}
            <StaticMap
              lat={-6.2408}
              lng={106.8032}
              href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
              label={lang === 'en' ? 'Open clinic location in maps' : 'Buka lokasi klinik di peta'}
              className="lg:col-span-7 border border-border photo-asymmetric h-[360px] sm:h-[420px]"
            />
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
