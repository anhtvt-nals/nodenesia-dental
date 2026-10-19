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
import { PriceRow } from '../components/common/PriceRow';
import { DoctorCard } from '../components/common/DoctorCard';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { ArticleCard } from '../components/common/ArticleCard';
import { LazyTeethScene as TeethScene } from '../components/teeth/LazyTeethScene';
import { AppHelmet } from '../components/common/AppHelmet';
import { formatRupiah, buildWhatsAppLink } from '../lib/utils';

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

  return (
    <>
      <AppHelmet
        title={lang === 'en' ? 'Modern Dental Care in Jakarta' : 'Klinik Gigi Modern & Terpercaya'}
        description={t.home.heroDesc}
        path="/"
        jsonLd={jsonLdDentist}
      />

      {/* Hero Section */}
      <section className="pt-10 md:pt-16 pb-12 md:pb-20 border-b border-[#14201C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
            {/* Left Column: Doctor spotlight slider (photo + condensed info + CTAs) */}
            <div className="lg:col-span-7 flex flex-col">
              {selectedHeroDoctor && (
                <div className="relative h-full overflow-hidden hairline-border bg-[#F4F1EA] shadow-xs">
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
                          <div className="relative w-full aspect-[16/10] sm:aspect-[16/8] max-h-[320px] shrink-0 bg-[#E9E4D8] overflow-hidden hairline-b">
                            {doc.photoUrl && !brokenPhotos[doc.id] ? (
                              <img
                                src={doc.photoUrl}
                                alt={doc.name}
                                loading={idx === 0 ? 'eager' : 'lazy'}
                                onError={() =>
                                  setBrokenPhotos((current) => ({ ...current, [doc.id]: true }))
                                }
                                className="w-full h-full object-cover object-top filter brightness-[0.98] contrast-[1.02]"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 bg-[#E9E4D8]/60">
                                <span className="font-mono text-sm uppercase tracking-wider text-[#14201C]">
                                  [FOTO {doc.name.toUpperCase()}]
                                </span>
                              </div>
                            )}

                            {/* Specialty & Experience overlays */}
                            <div className="absolute bottom-2.5 sm:bottom-3 left-2.5 sm:left-3 right-2.5 sm:right-3 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                              <span className="px-2.5 sm:px-3 py-1 bg-[#14201C]/85 backdrop-blur-sm text-[#F4F1EA] text-[10px] sm:text-xs font-mono uppercase tracking-wider">
                                {docSpecialty}
                              </span>
                              {docExperience && (
                                <span className="px-2.5 sm:px-3 py-1 bg-[#1F3D36]/90 backdrop-blur-sm text-[#F4F1EA] text-[10px] sm:text-xs font-mono tracking-wider font-medium">
                                  ★ {docExperience}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Condensed info + CTAs */}
                          <div className="p-4 sm:p-6 flex flex-col flex-1">
                            <div className="mb-3">
                              <h2 className="font-serif text-2xl sm:text-3xl text-[#14201C] tracking-tight mb-1">
                                {doc.name}
                              </h2>
                              <p className="text-xs sm:text-sm font-mono text-[#14201C]/70">
                                {docTitle}
                              </p>
                            </div>

                            <p className="text-xs sm:text-sm font-sans text-[#14201C]/85 leading-relaxed line-clamp-2">
                              {docBio}
                            </p>

                            <div className="mt-auto pt-5">
                              {hasMultipleDoctors && (
                                <div className="flex items-center justify-between gap-4 mb-3">
                                  <div className="flex items-center gap-1.5">
                                    {doctors.map((d, i) => (
                                      <button
                                        key={d.id}
                                        type="button"
                                        aria-label={d.name}
                                        aria-current={i === safeHeroIndex ? 'true' : undefined}
                                        onClick={() => setHeroIndex(i)}
                                        className={`h-1.5 transition-all ${
                                          i === safeHeroIndex
                                            ? 'w-6 bg-[#1F3D36]'
                                            : 'w-1.5 bg-[#14201C]/25 hover:bg-[#14201C]/45'
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  <span className="text-[11px] font-mono text-[#14201C]/50 tabular-nums">
                                    {String(safeHeroIndex + 1).padStart(2, '0')} / {String(doctors.length).padStart(2, '0')}
                                  </span>
                                </div>
                              )}

                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-4 hairline-t">
                                <Link
                                  to={localePath(`/booking?dokter=${doc.id}`)}
                                  className="w-full sm:w-auto px-6 py-3 min-h-[44px] flex items-center justify-center text-center bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] active:bg-[#162B26] transition-colors font-medium shadow-xs"
                                >
                                  {t.home.heroDoctorBook} →
                                </Link>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <Link
                                    to={localePath(`/dokter/${doc.slug}`)}
                                    className="flex-1 sm:flex-initial px-4 py-3 min-h-[44px] flex items-center justify-center text-center hairline-border bg-[#F4F1EA] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#E9E4D8] active:bg-[#E9E4D8] transition-colors"
                                  >
                                    {t.home.heroDoctorProfile}
                                  </Link>
                                  <a
                                    href={waAskLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial px-4 py-3 min-h-[44px] flex items-center justify-center text-center hairline-border bg-[#E9E4D8]/60 text-xs font-mono text-[#1F3D36] font-medium hover:bg-[#DDD7C9] active:bg-[#DDD7C9] transition-colors sm:border-0 sm:bg-transparent sm:underline sm:underline-offset-4 sm:ml-auto"
                                  >
                                    {t.booking.askViaWhatsApp} ↗
                                  </a>
                                </div>
                              </div>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  {/* Prev / Next controls — kept outside the slider track so they
                      stay anchored to the frame instead of sliding with the photos. */}
                  {hasMultipleDoctors && (
                    <div className="absolute inset-x-0 top-0 aspect-[16/10] sm:aspect-[16/8] max-h-[320px] pointer-events-none">
                      <button
                        type="button"
                        aria-label="Previous doctor"
                        onClick={() => goToHero(safeHeroIndex - 1)}
                        className="pointer-events-auto absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#F4F1EA]/90 backdrop-blur-sm hairline-border text-[#14201C] hover:bg-[#F4F1EA] active:bg-[#E9E4D8] transition-colors shadow-xs"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        aria-label="Next doctor"
                        onClick={() => goToHero(safeHeroIndex + 1)}
                        className="pointer-events-auto absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-[#F4F1EA]/90 backdrop-blur-sm hairline-border text-[#14201C] hover:bg-[#F4F1EA] active:bg-[#E9E4D8] transition-colors shadow-xs"
                      >
                        →
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

          {/* Stats Row (Placeholders strictly kept per prompt) */}
          <div className="mt-14 pt-8 hairline-t grid grid-cols-2 md:grid-cols-4 gap-6">
            {settings?.stats.map((stat, idx) => (
              <div key={idx} className="hairline-r last:border-r-0 pr-4">
                <div className="font-mono text-2xl sm:text-3xl font-normal text-[#1F3D36]">
                  {stat.value}
                </div>
                <div className="text-xs font-mono text-[#14201C]/60 mt-1 uppercase tracking-wider">
                  {lang === 'en' ? stat.labelEn : stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 01 / Layanan (Numbered list with prices, "Butuh perawatan lain?" link) */}
      <section className="py-16 md:py-24 border-b border-[#14201C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secLayananNum} />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight text-balance">
                {t.home.secLayananTitle}
              </h2>
              <p className="text-sm md:text-base text-[#14201C]/75 max-w-2xl mt-2 leading-relaxed">
                {t.home.secLayananDesc}
              </p>
            </div>
            <Link
              to={localePath('/layanan')}
              className="text-xs font-mono uppercase tracking-wider text-[#1F3D36] hover:text-[#14201C] underline underline-offset-4 shrink-0"
            >
              {t.home.viewAllServices} →
            </Link>
          </div>

          {/* Numbered price list */}
          <div className="hairline-t divide-y divide-[#14201C]/10">
            {services.map((service, idx) => (
              <PriceRow
                key={service.id}
                service={service}
                index={idx}
                showCategory
              />
            ))}
          </div>

          <div className="mt-8 pt-6 hairline-t flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#E9E4D8]/30 p-5 hairline-border">
            <span className="text-sm font-sans text-[#14201C]/80">
              {t.home.secLayananMore}
            </span>
            <a
              href={waAskLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-[#14201C] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#1F3D36] transition-colors whitespace-nowrap"
            >
              {t.booking.askViaWhatsApp}
            </a>
          </div>
        </div>
      </section>

      {/* 02 / Alur Kunjungan (4 steps) */}
      <section className="py-16 md:py-24 border-b border-[#14201C]/15 bg-[#E9E4D8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secFlowNum} />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
            {t.home.secFlowTitle}
          </h2>
          <p className="text-sm md:text-base text-[#14201C]/75 max-w-2xl mb-12 leading-relaxed">
            {t.home.secFlowDesc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.home.flowSteps.map((step) => (
              <div key={step.step} className="hairline-border p-6 bg-[#F4F1EA] flex flex-col justify-between">
                <div>
                  <span className="font-mono text-3xl font-light text-[#1F3D36]/80 block mb-4">
                    {step.step}
                  </span>
                  <h3 className="font-serif text-xl text-[#14201C] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#14201C]/75 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 03 / Tim Dokter (Cards) */}
      <section className="py-16 md:py-24 border-b border-[#14201C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secDoctorNum} />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight text-balance">
                {t.home.secDoctorTitle}
              </h2>
              <p className="text-sm md:text-base text-[#14201C]/75 max-w-2xl mt-2 leading-relaxed">
                {t.home.secDoctorDesc}
              </p>
            </div>
            <Link
              to={localePath('/dokter')}
              className="text-xs font-mono uppercase tracking-wider text-[#1F3D36] hover:text-[#14201C] underline underline-offset-4 shrink-0"
            >
              {t.home.viewAllDoctors} →
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
      <section className="py-16 md:py-24 border-b border-[#14201C]/15 bg-[#E9E4D8]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secScheduleNum} />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-4 text-balance">
            {t.home.secScheduleTitle}
          </h2>
          <p className="text-sm md:text-base text-[#14201C]/75 max-w-2xl mb-10 leading-relaxed">
            {t.home.secScheduleDesc}
          </p>

          <ScheduleTabs doctors={doctors} />
        </div>
      </section>

      {/* 05 / Tentang (Visi & Misi) */}
      <section className="py-16 md:py-24 border-b border-[#14201C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secAboutNum} />
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-12 max-w-3xl text-balance">
            {t.home.secAboutTitle}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
            <div className="p-8 hairline-border bg-[#E9E4D8]/30">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
                01 / {t.home.secAboutVision}
              </span>
              <h3 className="font-serif text-2xl text-[#14201C] mb-4">
                Inovasi & Integritas Medis
              </h3>
              <p className="text-sm sm:text-base text-[#14201C]/80 leading-relaxed font-sans">
                {t.home.secAboutVisionDesc}
              </p>
            </div>

            <div className="p-8 hairline-border bg-[#E9E4D8]/30">
              <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
                02 / {t.home.secAboutMission}
              </span>
              <ul className="space-y-3 font-sans text-sm text-[#14201C]/80">
                {t.home.secAboutMissionItems.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="font-mono text-xs text-[#1F3D36] pt-1">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 06 / Artikel Edukasi (3 Cards) */}
      <section className="py-16 md:py-24 border-b border-[#14201C]/15">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionLabel number={t.home.secArticlesNum} />
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight text-balance">
                {t.home.secArticlesTitle}
              </h2>
              <p className="text-sm md:text-base text-[#14201C]/75 max-w-2xl mt-2 leading-relaxed">
                {t.home.secArticlesDesc}
              </p>
            </div>
            <Link
              to={localePath('/artikel')}
              className="text-xs font-mono uppercase tracking-wider text-[#1F3D36] hover:text-[#14201C] underline underline-offset-4 shrink-0"
            >
              {t.home.viewAllArticles} →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </div>
      </section>

      {/* 07 / Booking Strip (Green band with mini form + time chips) */}
      <section className="bg-[#1F3D36] text-[#F4F1EA] py-14 border-t border-[#14201C]/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-5">
              <span className="font-mono text-xs uppercase tracking-wider text-[#F4F1EA]/60 block mb-2">
                {t.home.secStripNum}
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#F4F1EA] mb-2 leading-tight">
                {t.home.secStripTitle}
              </h2>
              <p className="text-xs sm:text-sm text-[#F4F1EA]/80 leading-relaxed mb-4">
                {t.home.secStripDesc}
              </p>
              <div className="text-xs font-mono text-[#F4F1EA]/70">
                Praktek: Senin–Sabtu 09:00–20:00 WIB
              </div>
            </div>

            <div className="lg:col-span-7 bg-[#162B26] p-6 hairline-border border-white/10">
              <div className="flex flex-col sm:flex-row items-stretch gap-4 mb-4">
                <div className="flex-1">
                  <label htmlFor="home-strip-service" className="text-xs font-mono text-[#F4F1EA]/60 uppercase tracking-wider block mb-1">
                    Pilih Layanan
                  </label>
                  <select
                    id="home-strip-service"
                    value={selectedMiniService}
                    onChange={(e) => setSelectedMiniService(e.target.value)}
                    className="w-full bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono p-2.5 hairline-border border-white/20 focus:outline-none"
                  >
                    {services.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#14201C] text-[#F4F1EA]">
                        {s.name} ({formatRupiah(s.priceFrom, lang === 'en')})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="shrink-0 flex items-end">
                  <Link
                    to={localePath(`/booking?layanan=${services.find((s) => s.id === selectedMiniService)?.slug || 'scaling'}`)}
                    className="w-full sm:w-auto px-6 py-2.5 bg-[#F4F1EA] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#E9E4D8] transition-colors font-medium text-center"
                  >
                    Lanjut Booking →
                  </Link>
                </div>
              </div>

              {/* Today Time Chips snippet */}
              <div>
                <span className="text-[11px] font-mono text-[#F4F1EA]/50 block mb-2">
                  Slot Tersedia Hari Ini ({todaySlots.length} slot terbuka):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {todaySlots.map((slot) => (
                    <Link
                      key={slot.time}
                      to={localePath(`/booking?layanan=${services.find((s) => s.id === selectedMiniService)?.slug || 'scaling'}&jam=${slot.time}`)}
                      className="px-2.5 py-1 text-[11px] font-mono bg-white/10 hover:bg-white/20 text-[#F4F1EA] border border-white/15 transition-colors"
                    >
                      {slot.time}
                    </Link>
                  ))}
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

