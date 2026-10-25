import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});
  const [heroIndex, setHeroIndex] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [heroTouchStartX, setHeroTouchStartX] = useState<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const displayDoctors = doctors.length > 0 ? doctors : DEFAULT_HERO_DOCTORS;
  const safeHeroIndex = heroIndex % displayDoctors.length;
  const goToHero = (next: number) => {
    setHeroIndex(((next % displayDoctors.length) + displayDoctors.length) % displayDoctors.length);
  };

  useEffect(() => {
    if (isHeroPaused || displayDoctors.length <= 1) return;

    const timer = window.setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % displayDoctors.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [isHeroPaused, displayDoctors.length]);

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

  const featuredReview = reviews[0];
  const secondaryReviews = reviews.slice(1, 4);

  return (
    <>
      <AppHelmet
        title={lang === 'en' ? 'Specialist Dental Clinic in South Jakarta' : 'Klinik Dokter Gigi Spesialis Jakarta Selatan'}
        description={t.home.heroDesc}
        path="/"
        jsonLd={jsonLdDentist}
      />

      {/* 1. HERO (Enamel #F6F7F4): Asymmetric 7fr/5fr, contained doctor photo with auto cross-fade, max 2 CTAs, 2 facts only */}
      <section className="bg-bg border-b border-border overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-10 lg:gap-12 items-center">
            {/* Left 7fr: Headline, concrete description, 2 CTAs, 2 facts */}
            <div>
              <h1 className="font-heading text-[2.75rem] sm:text-6xl lg:text-[4.25rem] font-bold text-text leading-[1.04] tracking-[-0.03em] mb-7">
                <span className="block">{t.home.heroTitlePart1}</span>
                <span className="block mt-1.5 text-primary">
                  <span className="underline decoration-accent decoration-[4px] underline-offset-[10px]">
                    {t.home.heroTitleAccent} {t.home.heroTitlePart2}
                  </span>
                </span>
              </h1>

              <p className="text-base sm:text-lg text-text-muted mb-8 leading-relaxed max-w-[54ch]">
                {t.home.heroDesc}
              </p>

              {/* Max 2 CTAs: Buat janji temu (Pine) + Tanya via WhatsApp (Gum) */}
              <div className="flex flex-wrap items-center gap-3.5 mb-12">
                <Link
                  to={localePath('/booking')}
                  className="btn-primary text-base px-6 py-3.5"
                >
                  {t.home.heroPrimaryCta}
                </Link>

                <a
                  href={waAskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp text-base px-6 py-3.5"
                >
                  {t.home.heroSecondaryCta}
                </a>
              </div>

              {/* 2 Concrete Facts Only */}
              <dl className="grid grid-cols-2 gap-6 sm:gap-10 pt-6 border-t border-border max-w-md">
                <div>
                  <dt className="text-xs sm:text-sm text-text-muted mt-1">
                    {lang === 'en' ? 'Google Maps rating (380+ reviews)' : 'Rating Google Maps (380+ ulasan)'}
                  </dt>
                  <dd className="font-heading text-2xl sm:text-3xl font-bold text-text tabular-nums order-first">
                    4,9 / 5,0
                  </dd>
                </div>
                <div>
                  <dt className="text-xs sm:text-sm text-text-muted mt-1">
                    {lang === 'en' ? 'Specialist dentists (Sp.KG, Sp.Ort, Sp.BM)' : 'Dokter gigi spesialis tetap'}
                  </dt>
                  <dd className="font-heading text-2xl sm:text-3xl font-bold text-text tabular-nums order-first">
                    {doctors.length || 3} drg. Sp.
                  </dd>
                </div>
              </dl>
            </div>

            {/* Right 5fr: Contained doctor photo within grid container with auto cross-fade */}
            <div
              className="w-full"
              onMouseEnter={() => setIsHeroPaused(true)}
              onMouseLeave={() => setIsHeroPaused(false)}
              onFocusCapture={() => setIsHeroPaused(true)}
              onBlurCapture={() => setIsHeroPaused(false)}
              onTouchStart={(e) => setHeroTouchStartX(e.touches[0].clientX)}
              onTouchEnd={(e) => {
                if (heroTouchStartX === null) return;
                const delta = e.changedTouches[0].clientX - heroTouchStartX;
                if (Math.abs(delta) > 40) goToHero(safeHeroIndex + (delta < 0 ? 1 : -1));
                setHeroTouchStartX(null);
              }}
            >
              {/* TODO: Replace Unsplash demo portraits with real in-clinic specialist photos */}
              <div className="grid">
                {displayDoctors.map((doc, idx) => {
                  const isActive = idx === safeHeroIndex;
                  const docSpecialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
                  const fallbackImg = DEFAULT_HERO_DOCTORS[idx % DEFAULT_HERO_DOCTORS.length].photoUrl;

                  return (
                    <figure
                      key={doc.slug || doc.id}
                      aria-hidden={!isActive}
                      className={`hero-fade-slide col-start-1 row-start-1 flex flex-col transition-opacity duration-700 ease-in-out ${
                        isActive ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none z-0'
                      }`}
                    >
                      <div className="aspect-[4/3] w-full bg-bg-alt overflow-hidden photo-asymmetric border border-border">
                        <img
                          src={doc.photoUrl && !brokenPhotos[doc.slug] ? doc.photoUrl : fallbackImg}
                          alt={doc.name}
                          loading={idx === 0 ? 'eager' : 'lazy'}
                          onError={() =>
                            setBrokenPhotos((prev) => ({ ...prev, [doc.slug]: true }))
                          }
                          className="w-full h-full object-cover object-top"
                        />
                      </div>

                      <figcaption className="pt-4 flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <Link
                            to={localePath(`/dokter/${doc.slug}`)}
                            tabIndex={isActive ? 0 : -1}
                            className="font-heading text-lg font-bold text-text hover:text-primary"
                          >
                            {doc.name}
                          </Link>
                          <span className="block text-xs sm:text-sm text-text-muted">
                            {docSpecialty}
                          </span>
                        </div>
                        {doc.sipNumber && (
                          <span className="text-xs text-text-muted tabular-nums">
                            {doc.sipNumber}
                          </span>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>

              {/* Minimal fade switcher controls */}
              <div className="mt-3 flex items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label={t.home.heroDoctorSwitch}>
                  {displayDoctors.map((doc, i) => (
                    <button
                      key={doc.slug || doc.id}
                      type="button"
                      role="tab"
                      aria-selected={i === safeHeroIndex}
                      aria-label={doc.name}
                      onClick={() => setHeroIndex(i)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-[6px] border transition-colors cursor-pointer whitespace-nowrap ${
                        i === safeHeroIndex
                          ? 'bg-primary text-bg border-primary'
                          : 'bg-bg text-text-muted border-border hover:text-text'
                      }`}
                    >
                      {doc.name.split(',')[0]}
                    </button>
                  ))}
                </div>
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
              className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80 shrink-0 self-start md:self-auto"
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
                  className="py-5 rounded-none grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-6 items-baseline"
                >
                  <div className="md:col-span-4">
                    <Link
                      to={localePath(`/layanan/${service.slug}`)}
                      className="font-heading text-lg sm:text-xl font-bold text-text hover:text-primary transition-colors"
                    >
                      {serviceName}
                    </Link>
                  </div>

                  <div className="md:col-span-5 text-sm text-text-muted">
                    {shortDesc} ({service.durationMinutes} {t.common.minutes})
                  </div>

                  <div className="md:col-span-2 md:text-right text-sm text-text tabular-nums">
                    <span className="text-text-muted mr-1.5">{t.services.startingFrom}</span>
                    <strong className="font-heading font-bold text-base">
                      {formatRupiah(service.priceFrom, lang === 'en')}
                    </strong>
                  </div>

                  <div className="md:col-span-1 md:text-right">
                    <Link
                      to={localePath(`/layanan/${service.slug}`)}
                      className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80 whitespace-nowrap"
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

      {/* 3. DOCTORS (Enamel #F6F7F4): Full-width block per doctor, photo alternating left/right */}
      <section className="py-16 md:py-24 bg-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-12">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
              {t.home.secDoctorTitle}
            </h2>
            <p className="text-base text-text-muted mt-2 leading-relaxed">
              {t.home.secDoctorDesc}
            </p>
          </div>

          <div className="divide-y divide-border border-t border-border">
            {displayDoctors.map((doc, idx) => {
              const isPhotoRight = idx % 2 === 1;
              const docTitle = lang === 'en' ? doc.titleEn : doc.title;
              const docSpecialty = lang === 'en' ? doc.specialtyEn : doc.specialty;
              const docBio = lang === 'en' ? doc.bioEn : doc.bio;
              const fallbackImg = DEFAULT_HERO_DOCTORS[idx % DEFAULT_HERO_DOCTORS.length].photoUrl;

              return (
                <article
                  key={doc.id}
                  className="py-10 md:py-14 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-center"
                >
                  {/* Doctor Portrait */}
                  <div
                    className={`md:col-span-5 ${
                      isPhotoRight ? 'md:order-2' : 'md:order-1'
                    }`}
                  >
                    <div
                      className={`aspect-[4/3] w-full bg-bg-alt overflow-hidden border border-border ${
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
                    className={`md:col-span-7 ${
                      isPhotoRight ? 'md:order-1' : 'md:order-2'
                    }`}
                  >
                    <p className="text-sm font-medium text-primary mb-1">
                      {docSpecialty}
                      {doc.experienceYears
                        ? ` · ${doc.experienceYears} ${lang === 'en' ? 'years clinical practice' : 'tahun praktik klinis'}`
                        : ''}
                    </p>
                    <h3 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-1">
                      <Link to={localePath(`/dokter/${doc.slug}`)} className="hover:text-primary">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-sm text-text-muted mb-4">
                      {docTitle}
                      {doc.sipNumber ? ` · ${doc.sipNumber}` : ''}
                    </p>

                    <p className="text-base text-text leading-relaxed mb-5 max-w-[60ch]">
                      {docBio}
                    </p>

                    {doc.education && doc.education.length > 0 && (
                      <ul className="text-xs sm:text-sm text-text-muted space-y-1 mb-6">
                        {doc.education.map((edu, eduIdx) => (
                          <li key={eduIdx}>{edu}</li>
                        ))}
                      </ul>
                    )}

                    <div className="flex flex-wrap items-center gap-6 text-sm font-semibold">
                      <Link
                        to={localePath(`/booking?dokter=${doc.id}`)}
                        className="text-primary underline underline-offset-4 hover:opacity-80"
                      >
                        {t.doctors.bookWithDoctor}
                      </Link>
                      <Link
                        to={localePath(`/dokter/${doc.slug}`)}
                        className="text-text-muted hover:text-text underline underline-offset-4"
                      >
                        {t.home.heroDoctorProfile}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. REVIEWS (Mint #DDEAE3): One large pull quote + 2-3 small quotes as a plain list. No 5-star icon rows */}
      {featuredReview && (
        <section className="py-16 md:py-24 bg-bg-alt border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
                {lang === 'en' ? 'What patients say after their visit' : 'Cerita pasien seusai kunjungan'}
              </h2>
              <Link
                to={localePath('/testimoni')}
                className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
              >
                {lang === 'en' ? 'Read all patient reviews' : 'Lihat semua ulasan pasien'}
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pt-8 border-t border-border items-start">
              {/* Large Pull Quote */}
              <div className="lg:col-span-7">
                <blockquote className="font-heading text-2xl sm:text-3xl lg:text-[2.1rem] font-medium text-text leading-[1.28] mb-6">
                  “{lang === 'en' ? featuredReview.commentEn : featuredReview.comment}”
                </blockquote>
                <div className="text-sm text-text-muted">
                  <strong className="font-semibold text-text">{featuredReview.name}</strong>
                  {featuredReview.serviceName ? ` — ${featuredReview.serviceName}` : ''}
                  {featuredReview.source ? ` (${featuredReview.source})` : ''}
                </div>
              </div>

              {/* 2–3 Smaller Quotes as a Plain Hairline List */}
              {secondaryReviews.length > 0 && (
                <div className="lg:col-span-5 divide-y divide-border border-t lg:border-t-0 lg:border-l border-border lg:pl-10">
                  {secondaryReviews.map((rev) => (
                    <div key={rev.id} className="py-5 first:pt-0 last:pb-0">
                      <blockquote className="text-sm sm:text-base text-text leading-relaxed mb-2">
                        “{lang === 'en' ? rev.commentEn : rev.comment}”
                      </blockquote>
                      <div className="text-xs text-text-muted">
                        <strong className="font-semibold text-text">{rev.name}</strong>
                        {rev.serviceName ? ` · ${rev.serviceName}` : ''}
                        {rev.date ? ` · ${rev.date}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. SCHEDULE (Enamel #F6F7F4): Plain weekly table, no pill tabs */}
      <section className="py-16 md:py-24 bg-bg border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
              {t.home.secScheduleTitle}
            </h2>
            <p className="text-base text-text-muted leading-relaxed">
              {t.home.secScheduleDesc}
            </p>
          </div>

          <ScheduleTabs doctors={displayDoctors} />
        </div>
      </section>

      {/* 6. ARTICLES (Mint #DDEAE3): List rows, no cards */}
      {articles.length > 0 && (
        <section className="py-16 md:py-24 bg-bg-alt border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
              <div>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight">
                  {t.home.secArticlesTitle}
                </h2>
                <p className="text-base text-text-muted max-w-2xl mt-2 leading-relaxed">
                  {t.home.secArticlesDesc}
                </p>
              </div>
              <Link
                to={localePath('/artikel')}
                className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80 shrink-0 self-start md:self-auto"
              >
                {t.home.viewAllArticles}
              </Link>
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
                      <span className="block text-xs text-text-muted mt-1">
                        {art.authorName} · {art.readTime}
                      </span>
                    </div>

                    <p className="md:col-span-5 text-sm text-text-muted leading-relaxed">
                      {summary}
                    </p>

                    <div className="md:col-span-2 md:text-right">
                      <Link
                        to={localePath(`/artikel/${art.slug}`)}
                        className="text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80 whitespace-nowrap"
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
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
              {lang === 'en' ? 'Location, parking, and visit details' : 'Lokasi klinik, parkir, dan pembayaran'}
            </h2>
            <p className="text-base text-text-muted">
              {lang === 'en'
                ? 'Ground-floor clinic access in Kebayoran Baru with private parking directly in front of the lobby.'
                : 'Akses lantai dasar di Kebayoran Baru dengan area parkir pribadi tepat di depan lobi.'}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* Plain Text Address, Parking, Transit & Payment Details */}
            <div className="lg:col-span-5 space-y-6 border-t border-border pt-6">
              <div>
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {t.contact.addressTitle}
                </h3>
                <p className="text-sm sm:text-base text-text-muted leading-relaxed">
                  {clinicAddress}
                </p>
                <a
                  href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm font-semibold text-primary underline underline-offset-4 hover:opacity-80"
                >
                  {t.contact.viewOnMap}
                </a>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {lang === 'en' ? 'Parking & public transit' : 'Kapasitas parkir & transportasi umum'}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {lang === 'en'
                    ? 'Free private parking for 6 cars and 15 motorcycles at the clinic entrance. 5 minutes from Blok M / Senayan MRT Station and Tendean TransJakarta stop.'
                    : 'Parkir halaman pribadi gratis untuk 6 mobil dan 15 motor tepat di depan lobi. Berjarak 5 menit dari Stasiun MRT Blok M / Senayan dan Halte TransJakarta Tendean.'}
                </p>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-text mb-1">
                  {lang === 'en' ? 'Payment & insurance' : 'Pembayaran & klaim asuransi'}
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  {lang === 'en'
                    ? 'Accepts QRIS, Debit/Credit cards, bank transfer, and cash. We provide itemized medical receipts and odontograms for private/corporate insurance reimbursement (non-BPJS clinic).'
                    : 'Menerima QRIS, kartu Debit/Kredit, transfer bank, dan tunai. Kami menerbitkan kuitansi medis rincian tindakan serta odontogram resmi untuk klaim reimbursement asuransi swasta/kantor (belum melayani BPJS Kesehatan).'}
                </p>
              </div>

              <div className="pt-5 border-t border-border flex flex-wrap items-center gap-4">
                <Link
                  to={localePath('/booking')}
                  className="btn-primary text-sm"
                >
                  {t.home.heroPrimaryCta}
                </Link>
                <Link
                  to={localePath('/booking/kelola')}
                  className="text-sm font-semibold text-text-muted hover:text-text underline underline-offset-4"
                >
                  {t.nav.manageBooking}
                </Link>
              </div>
            </div>

            {/* Map Embed (OpenStreetMap — no Google iframe top-left white info box or API key error) */}
            <div className="lg:col-span-7 relative border border-border overflow-hidden photo-asymmetric bg-bg-alt h-[360px] sm:h-[420px]">
              {!mapLoaded && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-bg-alt text-base text-text-muted p-6 text-center"
                  aria-live="polite"
                >
                  {lang === 'en'
                    ? 'Loading map of Jl. Wolter Monginsidi No. 88, Kebayoran Baru…'
                    : 'Memuat peta Jl. Wolter Monginsidi No. 88, Kebayoran Baru…'}
                </div>
              )}
              <iframe
                title="Peta Lokasi Klinik Gigi Senyum Sehat"
                src="https://www.openstreetmap.org/export/embed.html?bbox=106.7985%2C-6.2440%2C106.8085%2C-6.2375&layer=mapnik&marker=-6.2408%2C106.8032"
                onLoad={() => setMapLoaded(true)}
                className={`w-full h-full border-0 block transition-opacity duration-300 ${
                  mapLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomePage;
