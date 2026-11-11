import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getSettings,
  getServices,
  getDoctors,
  getArticles,
  getTestimonials,
  getGallery,
} from '../lib/api';
import {
  ClinicSettings,
  Service,
  Doctor,
  Article,
  Testimonial,
  GalleryItem,
  ServiceCategory,
} from '../types';
import { ScheduleTabs } from '../components/common/ScheduleTabs';
import { AppHelmet } from '../components/common/AppHelmet';
import { StaticMap } from '../components/common/StaticMap';
import { buildWhatsAppLink } from '../lib/utils';
import { DEFAULT_HERO_DOCTORS, DEFAULT_SERVICES } from '../lib/fallback-data';

const ARTICLE_THUMBNAILS = [
  'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=700&h=440&q=80',
  'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=700&h=440&q=80',
  'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=700&h=440&q=80',
];

export const HomePage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const navigate = useNavigate();

  const [settings, setSettings] = useState<ClinicSettings | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [reviews, setReviews] = useState<Testimonial[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [brokenPhotos, setBrokenPhotos] = useState<Record<string, boolean>>({});
  const [quickService, setQuickService] = useState('');
  const [quickDoctor, setQuickDoctor] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('semua');
  const [expandedServiceSlug, setExpandedServiceSlug] = useState<string | null>(null);

  // Safe Fallback Resolution: Guarantees zero blank state
  const displayServices = services.length > 0 ? services : DEFAULT_SERVICES;
  const displayDoctors = doctors.length > 0 ? doctors : DEFAULT_HERO_DOCTORS;

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
      const [sData, srvData, docData, artData, revData, galData] = await Promise.all([
        getSettings().catch(() => null),
        getServices().catch(() => [] as Service[]),
        getDoctors().catch(() => [] as Doctor[]),
        getArticles().catch(() => [] as Article[]),
        getTestimonials().catch(() => [] as Testimonial[]),
        getGallery().catch(() => [] as GalleryItem[]),
      ]);
      if (!isMounted) return;
      if (sData) setSettings(sData);
      if (srvData && srvData.length > 0) setServices(srvData);
      if (docData && docData.length > 0) setDoctors(docData);
      if (artData && artData.length > 0) setArticles(artData.slice(0, 3));
      if (revData && revData.length > 0) setReviews(revData.slice(0, 3));
      if (galData && galData.length > 0) setGallery(galData.slice(0, 3));
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
    priceRange: 'Rp 250.000 - Rp 18.000.000',
  };

  const waAskLink = buildWhatsAppLink(
    settings?.whatsappNumber || '6281289001234',
    t.booking.waPrefillGeneral
  );

  // Filter services by category
  const filteredServices =
    selectedCategory === 'semua'
      ? displayServices
      : displayServices.filter((s) => s.category === selectedCategory);

  return (
    <>
      <AppHelmet
        title={lang === 'en' ? 'Boutique Specialist Dental Clinic | South Jakarta' : 'Klinik Dokter Gigi Spesialis Jakarta Selatan'}
        description={t.home.heroDesc}
        path="/"
        jsonLd={jsonLdDentist}
      />

      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION: Architectural Arch Frame + Overlapping Typography
      ───────────────────────────────────────────────────────────── */}
      <section className="hero-pattern pt-8 pb-0 md:pt-12 md:pb-0 border-b border-border/70 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            
            {/* Left Content Column */}
            <div className="lg:col-span-7 min-w-0 z-10">
              {/* Subtle Atelier Eyebrow */}
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xs uppercase tracking-widest font-bold text-accent">01 / KLINIK SPESIALIS</span>
                <span className="w-1.5 h-1.5 rounded-full bg-border" />
                <span className="text-xs text-text-muted font-medium">Kebayoran Baru, Jakarta Selatan</span>
              </div>

              {/* Massive Display Heading */}
              <h1 className="font-heading text-4xl sm:text-6xl lg:text-[4.25rem] font-bold text-secondary leading-[1.08] tracking-tight mb-6">
                {lang === 'en' ? (
                  <>
                    Specialized dental care with <span className="italic font-serif text-primary">gentle precision</span> & transparent trust.
                  </>
                ) : (
                  <>
                    Perawatan gigi spesialis dengan pendekatan <span className="italic font-serif text-primary">tenang, presisi</span>, dan transparan.
                  </>
                )}
              </h1>

              {/* Refined Description */}
              <p className="text-base sm:text-lg text-text-muted mb-8 leading-relaxed max-w-[54ch]">
                {t.home.heroDesc}
              </p>

              {/* Main CTAs */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <Link
                  to={localePath('/booking')}
                  className="btn-primary rounded-xl px-8 py-3.5 text-base shadow-soft"
                >
                  <span>{t.home.heroPrimaryCta}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>

                <a
                  href={waAskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp rounded-xl px-6 py-3.5 text-base shadow-soft"
                >
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M12.031 2C6.494 2 2 6.495 2 12.031c0 1.947.558 3.766 1.526 5.309L2 22l4.821-1.488a9.97 9.97 0 005.21 1.519h.005c5.536 0 10.03-4.494 10.03-10.03 0-2.678-1.042-5.196-2.936-7.09A9.957 9.957 0 0012.031 2zm5.82 14.364c-.242.684-1.22 1.309-1.748 1.391-.497.078-1.127.112-3.23-.762-2.69-1.116-4.42-3.864-4.555-4.045-.13-.18-1.085-1.446-1.085-2.758 0-1.312.689-1.956.933-2.222.245-.266.536-.333.715-.333.18 0 .36 0 .517.008.167.009.39-.063.61.464.226.541.77 1.882.837 2.02.068.138.113.3.023.48-.09.18-.135.292-.27.45-.135.158-.283.352-.405.473-.135.135-.276.282-.119.552.158.27.7 1.155 1.501 1.869 1.031.919 1.899 1.204 2.169 1.34.27.135.428.113.585-.068.158-.18.675-.788.855-1.058.18-.27.36-.226.61-.135.248.09 1.576.744 1.846.88.27.135.45.203.517.316.068.113.068.654-.174 1.338z" />
                  </svg>
                  <span>{t.home.heroSecondaryCta}</span>
                </a>
              </div>

              {/* Integrated Luxury Quick Console */}
              <div className="bg-surface/90 backdrop-blur-md rounded-2xl p-3 border border-border shadow-soft max-w-2xl">
                <form
                  onSubmit={handleQuickBook}
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_auto] gap-2.5 items-center"
                >
                  {/* Select Treatment */}
                  <div className="relative">
                    <label className="sr-only" htmlFor="quick-treatment">
                      {lang === 'en' ? 'Select Treatment' : 'Pilih Layanan'}
                    </label>
                    <select
                      id="quick-treatment"
                      value={quickService}
                      onChange={(e) => setQuickService(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-bg-alt/70 text-secondary font-semibold text-xs sm:text-sm pl-3.5 pr-8 py-3 h-11 border border-border/80 focus:border-primary focus:bg-surface focus:outline-none cursor-pointer"
                    >
                      <option value="">{lang === 'en' ? 'Pilih Perawatan Gigi…' : 'Pilih Layanan Tindakan…'}</option>
                      {displayServices.map((sv) => (
                        <option key={sv.id} value={sv.slug}>
                          {lang === 'en' ? sv.nameEn : sv.name}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Select Doctor */}
                  <div className="relative">
                    <label className="sr-only" htmlFor="quick-specialist">
                      {lang === 'en' ? 'Select Specialist' : 'Pilih Dokter Spesialis'}
                    </label>
                    <select
                      id="quick-specialist"
                      value={quickDoctor}
                      onChange={(e) => setQuickDoctor(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-bg-alt/70 text-secondary font-semibold text-xs sm:text-sm pl-3.5 pr-8 py-3 h-11 border border-border/80 focus:border-primary focus:bg-surface focus:outline-none cursor-pointer"
                    >
                      <option value="">{lang === 'en' ? 'Pilih Dokter Spesialis…' : 'Pilih Dokter Spesialis…'}</option>
                      {displayDoctors.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                    <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary rounded-xl h-11 px-5 text-xs sm:text-sm font-semibold whitespace-nowrap cursor-pointer shadow-xs"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                      <circle cx="11" cy="11" r="7" />
                      <path strokeLinecap="round" d="M20 20l-3.5-3.5" />
                    </svg>
                    <span>{lang === 'en' ? 'Check Slots' : 'Cek Jadwal'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Architectural Arch Frame Visual */}
            <div className="lg:col-span-5 relative w-full max-w-[460px] mx-auto lg:mr-0 pt-4">
              <div className="relative aspect-[4/5] w-full rounded-t-[140px] rounded-b-[28px] overflow-hidden bg-bg-alt shadow-floating ring-8 ring-white/60">
                <img
                  src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                  alt="Klinik Gigi Senyum Sehat Jakarta Selatan"
                  loading="eager"
                  width="1000"
                  height="1250"
                  className="w-full h-full object-cover"
                />

                {/* In-photo Architectural Highlight */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-surface/90 backdrop-blur-md border border-white/60 text-secondary text-xs font-semibold px-4 py-1.5 rounded-full shadow-soft whitespace-nowrap">
                  <span className="inline-block w-2 h-2 rounded-full bg-accent mr-2 animate-pulse" />
                  <span>Sterilisasi Autoclave Kelas B Standar Rumah Sakit</span>
                </div>
              </div>

              {/* Offset Floating Google Maps Rating Badge */}
              <div className="relative mt-4 sm:absolute sm:mt-0 sm:-bottom-6 sm:-left-8 bg-surface rounded-2xl p-4 sm:p-5 border border-border shadow-floating max-w-[270px]">
                <div className="flex items-center gap-1.5 text-amber-500 mb-1.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
                    </svg>
                  ))}
                  <span className="font-heading font-bold text-secondary text-lg ml-1">4.9</span>
                </div>
                <p className="font-heading font-bold text-base text-secondary leading-snug">
                  380+ Ulasan Terverifikasi
                </p>
                <p className="text-xs text-text-muted mt-0.5">
                  Google Maps · Kebayoran Baru
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Running Smooth Marquee Ribbon pinned directly to bottom of Hero */}
        <div className="mt-8 md:mt-10 border-t border-border/60 overflow-hidden select-none bg-surface/60 py-3 sm:py-3.5">
          <div className="animate-marquee flex items-center gap-8 text-xs sm:text-sm font-semibold uppercase tracking-wider text-text-muted">
            <span>✦ Ortodonti & Behel Damon (Sp.Ort)</span>
            <span>✦ Implan Gigi Titanium 3D CBCT (Sp.BM)</span>
            <span>✦ Estetik Veneer Porselen e.max (Sp.KG)</span>
            <span>✦ Perawatan Saluran Akar Mikroskopis</span>
            <span>✦ Sterilisasi Kelas B Standar Rumah Sakit</span>
            <span>✦ Transparansi Biaya Tanpa Biaya Tersembunyi</span>
            <span>✦ Ortodonti & Behel Damon (Sp.Ort)</span>
            <span>✦ Implan Gigi Titanium 3D CBCT (Sp.BM)</span>
            <span>✦ Estetik Veneer Porselen e.max (Sp.KG)</span>
            <span>✦ Perawatan Saluran Akar Mikroskopis</span>
            <span>✦ Sterilisasi Kelas B Standar Rumah Sakit</span>
            <span>✦ Transparansi Biaya Tanpa Biaya Tersembunyi</span>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. LAYANAN & ESTIMASI BIAYA: Table / Accordion Luxury Menu
          (No card grid! Real verified data always shown)
      ───────────────────────────────────────────────────────────── */}
      <section id="layanan-dan-biaya" className="py-12 md:py-16 bg-surface border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
                02 / KATALOG PERAWATAN & BIAYA
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
                {t.home.secLayananTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-3 leading-relaxed">
                Biaya transparan disampaikan dokter spesialis secara tertulis sebelum tindakan dimulai. Sudah termasuk konsultasi awal dan alat steril satu kali pakai.
              </p>
            </div>

            <Link
              to={localePath('/layanan')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors shrink-0 bg-bg-alt px-5 py-2.5 rounded-xl border border-border shadow-xs"
            >
              <span>{t.home.viewAllServices}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
            {[
              { id: 'semua', label: lang === 'en' ? 'All Treatments' : 'Semua Layanan' },
              { id: 'estetik', label: lang === 'en' ? 'Aesthetic & Veneer' : 'Estetik & Veneer' },
              { id: 'restoratif', label: lang === 'en' ? 'Restoration & Filling' : 'Restorasi & Tambal' },
              { id: 'ortodonti', label: lang === 'en' ? 'Orthodontics & Braces' : 'Ortodonti & Behel' },
              { id: 'pencegahan', label: lang === 'en' ? 'Prevention & Scaling' : 'Pencegahan & Scaling' },
              { id: 'bedah', label: lang === 'en' ? 'Implant & Oral Surgery' : 'Implan & Bedah Mulut' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap border ${
                  selectedCategory === cat.id
                    ? 'bg-secondary text-white border-secondary shadow-xs'
                    : 'bg-bg-alt text-text-muted border-border hover:bg-border/60 hover:text-secondary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Luxury Menu Table / Accordion */}
          <div className="border-t border-border">
            {filteredServices.map((service, idx) => {
              const isExpanded = expandedServiceSlug === service.slug;
              const formattedIndex = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={service.id}
                  className="border-b border-border/80 transition-colors hover:bg-bg-alt/40"
                >
                  {/* Clickable Header Row */}
                  <div
                    onClick={() => setExpandedServiceSlug(isExpanded ? null : service.slug)}
                    className="py-5 sm:py-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer select-none"
                  >
                    {/* Index & Title */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-6 min-w-0">
                      <span className="font-heading text-lg sm:text-xl font-bold text-accent shrink-0 w-8">
                        {formattedIndex}
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <h3 className="font-heading text-lg sm:text-2xl font-bold text-secondary hover:text-primary transition-colors">
                            {lang === 'en' ? service.nameEn : service.name}
                          </h3>
                          <span className="text-[11px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                            {service.category}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-text-muted mt-1 max-w-xl truncate">
                          {lang === 'en' ? service.shortDescEn : service.shortDesc}
                        </p>
                      </div>
                    </div>

                    {/* Price Range & Expand Control */}
                    <div className="flex items-center justify-between md:justify-end gap-6 pl-12 md:pl-0 shrink-0">
                      <div className="text-left md:text-right">
                        <span className="block font-heading font-bold text-base sm:text-xl text-primary tabular-nums">
                          {service.priceNote || `Rp ${service.priceFrom.toLocaleString('id-ID')}`}
                        </span>
                        <span className="block text-xs text-text-muted">
                          ⏱ {service.durationMinutes} menit tindakan
                        </span>
                      </div>

                      <button
                        type="button"
                        aria-label={isExpanded ? 'Tutup rincian' : 'Buka rincian'}
                        className={`w-9 h-9 rounded-full border border-border flex items-center justify-center text-text-muted hover:text-primary transition-transform duration-200 ${
                          isExpanded ? 'rotate-180 bg-primary text-white border-primary' : 'bg-surface'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Detail Drawer */}
                  {isExpanded && (
                    <div className="pb-6 pl-12 pr-4 md:pr-12 grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-bg-alt/60 rounded-2xl p-5 mb-4 border border-border/80">
                      <div className="md:col-span-8">
                        <h4 className="text-xs uppercase tracking-wider font-bold text-secondary mb-1">
                          Deskripsi & Rencana Perawatan:
                        </h4>
                        <p className="text-sm text-text-muted leading-relaxed mb-3">
                          {lang === 'en' ? service.descriptionEn : service.description}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Alat steril bersegel autoclave kelas B
                          </span>
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                            Kuitansi resmi untuk klaim asuransi
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-4 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-end">
                        <Link
                          to={localePath(`/booking?layanan=${service.slug}`)}
                          className="btn-primary rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold text-center justify-center shadow-xs"
                        >
                          <span>Pilih & Jadwalkan Kunjungan</span>
                        </Link>
                        <Link
                          to={localePath(`/layanan/${service.slug}`)}
                          className="text-xs text-center font-semibold text-primary hover:underline py-1"
                        >
                          Lihat detail prosedur lengkap →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Transparency Commitment Notice */}
          <div className="mt-10 p-6 rounded-2xl bg-bg-alt border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                <strong>Kebijakan Tanpa Biaya Tersembunyi:</strong> Rencana perawatan lengkap dan perkiraan biaya selalu dipaparkan secara tertulis oleh dokter spesialis sebelum tindakan medis dilakukan.
              </p>
            </div>
            <Link
              to={localePath('/booking')}
              className="text-xs sm:text-sm font-bold text-primary hover:underline whitespace-nowrap shrink-0"
            >
              Konsultasi Pertama Sekarang →
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. ALUR KUNJUNGAN: Connected Horizontal Timeline
          (No identical card grid! Flowing timeline with giant numerals)
      ───────────────────────────────────────────────────────────── */}
      <section id="alur-kunjungan" className="py-20 md:py-28 bg-bg border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mb-14">
            <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
              03 / ALUR KUNJUNGAN PASIEN
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
              {t.patientGuide.visitFlowTitle}
            </h2>
            <p className="text-base text-text-muted mt-3 leading-relaxed">
              Kami merancang setiap tahap kunjungan agar terprediksi, nyaman, dan bebas rasa cemas dari awal reservasi hingga tindak lanjut pasca-perawatan.
            </p>
          </div>

          {/* Connected Flowing Step Track */}
          <div className="relative">
            {/* Desktop Horizontal Connecting Line */}
            <div className="hidden lg:block absolute top-14 left-8 right-8 h-0.5 bg-border z-0" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
              {t.patientGuide.steps.map((step, idx) => (
                <div
                  key={step.num}
                  className="bg-surface rounded-2xl p-6 border border-border shadow-soft flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200"
                >
                  <div>
                    {/* Oversized Typographic Step Number */}
                    <div className="flex items-center justify-between mb-5">
                      <span className="w-12 h-12 rounded-2xl bg-bg-alt text-primary font-heading text-xl font-bold flex items-center justify-center border border-border">
                        0{step.num}
                      </span>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                        Tahap {step.num}
                      </span>
                    </div>

                    <h3 className="font-heading text-lg font-bold text-secondary mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-text-muted flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent" />
                    <span>{idx === 0 ? 'Pendaftaran online 1 mnt' : idx === 2 ? 'Foto digital & rontgen' : 'Standar SOP ketat'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 p-6 rounded-2xl bg-surface border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
              <p className="text-sm text-secondary font-medium">
                Kunjungan pertama? Resepsionis kami siap mendampingi konfirmasi jadwal via WhatsApp.
              </p>
            </div>
            <Link to={localePath('/booking')} className="btn-primary rounded-xl px-6 py-2.5 text-sm font-semibold">
              {t.nav.bookNow}
            </Link>
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. TIM DOKTER SPESIALIS: Editorial Asymmetrical Layout
          (Lead specialist hero card + complementary asymmetrical subcards)
      ───────────────────────────────────────────────────────────── */}
      <section id="tim-dokter" className="py-20 md:py-28 bg-surface border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
                04 / DOKTER GIGI SPESIALIS
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
                {t.home.secDoctorTitle}
              </h2>
              <p className="text-base text-text-muted max-w-2xl mt-3 leading-relaxed">
                Seluruh tindakan dilakukan langsung oleh dokter gigi spesialis terdaftar (Sp.KG, Sp.Ort, Sp.BM) dengan pengalaman klinis lebih dari 10 tahun.
              </p>
            </div>

            <Link
              to={localePath('/dokter')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors shrink-0 bg-bg-alt px-5 py-2.5 rounded-xl border border-border shadow-xs"
            >
              <span>Lihat Semua Spesialis</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          {/* Lead Specialist Hero Featured Card (drg. Ayu Larasati, Sp.KG) */}
          {displayDoctors.length > 0 && (
            <article className="bg-bg-alt rounded-3xl border border-border p-6 sm:p-10 lg:p-12 shadow-soft mb-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
              {/* Doctor Arch Mask Portrait */}
              <div className="lg:col-span-5 relative">
                <div className="aspect-[4/5] w-full max-w-[380px] mx-auto rounded-t-[140px] rounded-b-[24px] overflow-hidden bg-surface shadow-floating border-4 border-white">
                  <img
                    src={displayDoctors[0].photoUrl}
                    alt={displayDoctors[0].name}
                    loading="lazy"
                    width="800"
                    height="1000"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/95 backdrop-blur-md px-4 py-2 rounded-xl border border-border shadow-xs text-xs font-bold text-secondary whitespace-nowrap">
                  ⭐ 12+ Tahun Pengalaman Klinis
                </div>
              </div>

              {/* Lead Doctor Credentials & Philosophy */}
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 mb-4">
                  <span>{displayDoctors[0].specialty}</span>
                  <span>· {displayDoctors[0].sipNumber}</span>
                </div>

                <h3 className="font-heading font-bold text-3xl sm:text-4xl text-secondary mb-3">
                  <Link to={localePath(`/dokter/${displayDoctors[0].slug}`)} className="hover:text-primary transition-colors">
                    {displayDoctors[0].name}
                  </Link>
                </h3>

                <p className="text-sm font-semibold text-text-muted mb-4">
                  {displayDoctors[0].title}
                </p>

                <p className="text-base text-text-muted leading-relaxed mb-6 max-w-[62ch]">
                  {displayDoctors[0].bio}
                </p>

                {displayDoctors[0].education && (
                  <div className="mb-8 pt-4 border-t border-border/80">
                    <span className="block text-xs font-bold uppercase tracking-wider text-secondary mb-2.5">
                      Pendidikan & Keanggotaan Profesi:
                    </span>
                    <ul className="text-sm text-text-muted space-y-1.5">
                      {displayDoctors[0].education.map((edu, eIdx) => (
                        <li key={eIdx} className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                          <span>{edu}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={localePath(`/booking?dokter=${displayDoctors[0].id}`)}
                    className="btn-primary rounded-xl px-7 py-3 text-sm font-semibold shadow-xs"
                  >
                    <span>{t.doctors.bookWithDoctor}</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </Link>
                  <Link
                    to={localePath(`/dokter/${displayDoctors[0].slug}`)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted hover:text-primary transition-colors px-4 py-3"
                  >
                    <span>Lihat jadwal & ulasan lengkap →</span>
                  </Link>
                </div>
              </div>
            </article>
          )}

          {/* Secondary Specialists (Asymmetric 2-Column Grid) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {displayDoctors.slice(1, 3).map((doc) => (
              <article
                key={doc.id}
                className="bg-surface rounded-3xl border border-border p-6 sm:p-8 shadow-soft flex flex-col justify-between hover:shadow-hover transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <div className="aspect-[4/5] w-28 sm:w-36 rounded-2xl overflow-hidden bg-bg-alt shrink-0 border border-border shadow-xs">
                    <img
                      src={doc.photoUrl}
                      alt={doc.name}
                      loading="lazy"
                      width="400"
                      height="500"
                      className="w-full h-full object-cover object-top"
                    />
                  </div>

                  <div className="min-w-0">
                    <span className="inline-block text-xs font-bold text-accent uppercase tracking-wider mb-1">
                      {doc.specialty}
                    </span>
                    <h3 className="font-heading font-bold text-xl sm:text-2xl text-secondary mb-1">
                      <Link to={localePath(`/dokter/${doc.slug}`)} className="hover:text-primary transition-colors">
                        {doc.name}
                      </Link>
                    </h3>
                    <p className="text-xs text-text-muted mb-3 font-mono">
                      {doc.sipNumber}
                    </p>
                    <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-3">
                      {doc.bio}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">
                    ⏱ Praktik Senin – Sabtu
                  </span>
                  <Link
                    to={localePath(`/booking?dokter=${doc.id}`)}
                    className="btn-primary rounded-xl px-4 py-2 text-xs font-semibold"
                  >
                    <span>Pilih Dokter Ini</span>
                  </Link>
                </div>
              </article>
            ))}
          </div>

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          5. PENGALAMAN PASIEN: Editorial Pull Quote + Asymmetric Reviews
          (No 3 identical square cards!)
      ───────────────────────────────────────────────────────────── */}
      <section id="ulasan-pasien" className="py-20 md:py-28 bg-bg border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
                05 / TESTIMONI & ULASAN NYATA
              </span>
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
                {lang === 'en' ? 'What Patients Say' : 'Pengalaman Pasien Kami'}
              </h2>
            </div>
            <a
              href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors bg-surface px-5 py-2.5 rounded-xl border border-border shadow-xs"
            >
              <span>{lang === 'en' ? 'Read 380+ reviews on Google' : 'Baca 380+ ulasan di Google Maps'}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>

          {/* Asymmetric Editorial Review Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Left Giant Pull-Quote Card */}
            <div className="lg:col-span-7 bg-surface rounded-3xl p-8 sm:p-12 border border-border shadow-soft flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-amber-500 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
                    </svg>
                  ))}
                  <span className="text-xs uppercase tracking-wider font-bold text-accent ml-2">Ulasan Terverifikasi Google</span>
                </div>

                <blockquote className="font-heading italic text-2xl sm:text-3xl lg:text-4xl text-secondary leading-snug mb-8">
                  “Takut ke dokter gigi hilang karena dokter dan perawatnya sangat ramah. Penjelasannya jelas dan jadwalnya on-time tanpa antre berjam-jam.”
                </blockquote>
              </div>

              <div className="flex items-center gap-4 pt-6 border-t border-border">
                <div className="w-12 h-12 rounded-full bg-primary text-white font-heading font-bold text-base flex items-center justify-center shrink-0">
                  AS
                </div>
                <div>
                  <strong className="block font-heading font-bold text-base text-secondary">
                    Anindita S.
                  </strong>
                  <span className="block text-xs text-text-muted">
                    Perawatan Saluran Akar Mikroskopis · Maret 2024
                  </span>
                </div>
              </div>
            </div>

            {/* Right Stack of 2 Varied Review Cards */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-soft flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-accent">Google Maps</span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed mb-4">
                    “Dokter Ayu sangat teliti dan komunikatif. Ditunjukkan foto sebelum dan sesudah tambal, hasilnya rapi banget tidak ada ngilu sama sekali.”
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <div className="w-8 h-8 rounded-full bg-accent/20 text-accent font-bold text-xs flex items-center justify-center shrink-0">
                    RD
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-xs font-bold text-secondary truncate">Rian Dimas</strong>
                    <span className="block text-[11px] text-text-muted truncate">Tambal Estetik & Scaling</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-2xl p-6 sm:p-7 border border-border shadow-soft flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                          <path d="M10 1.5l2.6 5.5 6 .8-4.4 4.2 1.1 6L10 15.1 4.7 18l1.1-6L1.4 7.8l6-.8L10 1.5z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-[11px] font-semibold text-accent">Google Maps</span>
                  </div>
                  <p className="text-sm text-secondary leading-relaxed mb-4">
                    “Klinik bersih, alat steril modern, dan parkir luas di depan lobi. Biaya transparan disampaikan di awal sebelum tindakan. Sangat puas.”
                  </p>
                </div>
                <div className="flex items-center gap-3 pt-3 border-t border-border/60">
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                    FW
                  </div>
                  <div className="min-w-0">
                    <strong className="block text-xs font-bold text-secondary truncate">Farhan Wibowo</strong>
                    <span className="block text-[11px] text-text-muted truncate">Bleaching & Konsultasi Implan</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          6. JADWAL DOKTER: Deep Cypress Velvet High-Contrast Timetable
          (No empty state! Segmented control + smart nearest day guidance)
      ───────────────────────────────────────────────────────────── */}
      <section id="jadwal-spesialis" className="py-20 md:py-28 bg-[#122820] text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
              06 / JADWAL PRAKTEK SPESIALIS
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-white tracking-tight">
              {t.home.secScheduleTitle}
            </h2>
            <p className="text-base text-white/75 mt-3 leading-relaxed">
              Pilih hari untuk melihat dokter spesialis yang bertugas. Jadwal dikonfirmasi langsung oleh sistem dan resepsionis tanpa antre panjang di klinik.
            </p>
          </div>

          <ScheduleTabs doctors={displayDoctors} variant="pine" />

        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          7. DOKUMENTASI HASIL KLINIS (Before & After)
      ───────────────────────────────────────────────────────────── */}
      {gallery.length > 0 && (
        <section id="dokumentasi-klinis" className="py-20 md:py-28 bg-surface border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
                  07 / HASIL TINDAKAN MEDIS
                </span>
                <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
                  Dokumentasi Transformasi Senyum
                </h2>
                <p className="text-base text-text-muted max-w-2xl mt-3 leading-relaxed">
                  Dokumentasi nyata hasil tindakan dokter spesialis kami dengan persetujuan pasien (informed consent).
                </p>
              </div>

              <Link
                to={localePath('/hasil-kami')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors shrink-0 bg-bg-alt px-5 py-2.5 rounded-xl border border-border shadow-xs"
              >
                <span>Lihat Semua Kasus Klinis</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {gallery.map((item, gIdx) => (
                <div
                  key={item.id || gIdx}
                  className="bg-bg-alt/70 rounded-3xl border border-border p-5 shadow-soft flex flex-col justify-between"
                >
                  {/* Before / After Photo Comparison */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface border border-border">
                      <img
                        src={item.beforeUrl || 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=400&q=80'}
                        alt={item.beforeLabel || 'Sebelum'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-secondary/90 text-white px-2 py-0.5 rounded">
                        Sebelum
                      </span>
                    </div>

                    <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface border border-border">
                      <img
                        src={item.afterUrl || 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=400&q=80'}
                        alt={item.afterLabel || 'Sesudah'}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-2 left-2 text-[10px] font-bold uppercase tracking-wider bg-primary text-white px-2 py-0.5 rounded">
                        Sesudah
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-xs font-bold text-accent uppercase tracking-wider">
                        {lang === 'en' ? item.serviceNameEn : item.serviceName}
                      </span>
                      {item.treatmentDuration && (
                        <span className="text-xs text-text-muted">
                          ⏱ {item.treatmentDuration}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed line-clamp-2">
                      {lang === 'en' ? item.captionEn : item.caption}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          8. EDUKASI KESEHATAN GIGI: Editorial Magazine List
      ───────────────────────────────────────────────────────────── */}
      {articles.length > 0 && (
        <section id="edukasi-kesehatan" className="py-20 md:py-28 bg-bg border-b border-border/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-14">
              <div>
                <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
                  08 / EDUKASI & ARTIKEL
                </span>
                <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
                  {t.home.secArticlesTitle}
                </h2>
              </div>
              <Link
                to={localePath('/artikel')}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors bg-surface px-5 py-2.5 rounded-xl border border-border shadow-xs"
              >
                <span>Lihat Semua Artikel</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {articles.map((art, idx) => {
                const title = lang === 'en' ? art.titleEn : art.title;
                const summary = lang === 'en' ? art.summaryEn : art.summary;
                const thumbnail = ARTICLE_THUMBNAILS[idx % ARTICLE_THUMBNAILS.length];

                return (
                  <article
                    key={art.id}
                    className="bg-surface rounded-3xl border border-border overflow-hidden shadow-soft hover:shadow-hover transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[16/10] w-full bg-bg-alt overflow-hidden border-b border-border">
                        <img
                          src={thumbnail}
                          alt={title}
                          loading="lazy"
                          width="700"
                          height="440"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      <div className="p-6">
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="text-xs font-bold text-accent uppercase tracking-wider">
                            {lang === 'en' ? art.categoryNameEn : art.categoryName}
                          </span>
                          <span className="text-xs text-text-muted">
                            ⏱ {art.readTime}
                          </span>
                        </div>

                        <h3 className="font-heading text-xl font-bold text-secondary leading-snug mb-2 hover:text-primary transition-colors">
                          <Link to={localePath(`/artikel/${art.slug}`)}>
                            {title}
                          </Link>
                        </h3>

                        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2">
                          {summary}
                        </p>
                      </div>
                    </div>

                    <div className="px-6 pb-6 pt-2">
                      <Link
                        to={localePath(`/artikel/${art.slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary hover:text-primary-hover transition-colors"
                      >
                        <span>Baca selengkapnya</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>

          </div>
        </section>
      )}

      {/* ─────────────────────────────────────────────────────────────
          9. LOKASI, PARKIR & AKSES KLINIK: Full-Bleed Map + Overlapping Card
      ───────────────────────────────────────────────────────────── */}
      <section id="lokasi-klinik" className="py-20 md:py-28 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-12 max-w-2xl">
            <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
              09 / LOKASI & AKSES
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
              Akses Kunjungan & Parkir Pribadi
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Scannable Details Card */}
            <div className="lg:col-span-5 space-y-6 bg-bg-alt p-8 sm:p-10 rounded-3xl border border-border shadow-soft">
              <div>
                <h3 className="font-heading text-xl font-bold text-secondary mb-1">
                  {t.contact.addressTitle}
                </h3>
                <p className="text-base text-text-muted leading-relaxed">
                  {clinicAddress}
                </p>
                <a
                  href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 mt-3 text-sm font-bold text-primary hover:underline underline-offset-4"
                >
                  <span>{t.contact.viewOnMap}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-secondary mb-1">
                  Kapasitas Parkir & Transportasi Publik
                </h3>
                <p className="text-sm text-text-muted leading-relaxed">
                  Halaman parkir pribadi gratis untuk 6 mobil dan 15 motor tepat di depan pintu masuk klinik. Berjarak hanya 5 menit dari Stasiun MRT Blok M dan Halte TransJakarta Tendean.
                </p>
              </div>

              <div className="pt-5 border-t border-border">
                <h3 className="font-heading text-lg font-bold text-secondary mb-1">
                  Bantuan Darurat Sakit Gigi 24/7
                </h3>
                <p className="text-sm text-text-muted leading-relaxed mb-4">
                  Mengalami nyeri hebat, trauma gigi, atau pendarahan pasca-tindakan? Resepsionis kami siaga membantu arahan darurat via WhatsApp.
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={waAskLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-whatsapp rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold"
                  >
                    <span>Hubungi WhatsApp Darurat</span>
                  </a>
                  <Link
                    to={localePath('/booking')}
                    className="btn-primary rounded-xl px-5 py-2.5 text-xs sm:text-sm font-semibold"
                  >
                    {t.home.heroPrimaryCta}
                  </Link>
                </div>
              </div>
            </div>

            {/* Interactive Leaflet Map Container */}
            <div className="lg:col-span-7">
              <div className="rounded-3xl overflow-hidden border border-border shadow-soft h-[420px] sm:h-[480px]">
                <StaticMap
                  lat={-6.2408}
                  lng={106.8032}
                  href={settings?.googleMapsUrl || 'https://maps.google.com/?q=Jl.+Wolter+Monginsidi+Kebayoran+Baru+Jakarta+Selatan'}
                  label={lang === 'en' ? 'Open clinic location in maps' : 'Buka lokasi klinik di peta'}
                  className="w-full h-full"
                />
              </div>
            </div>
          </div>

        </div>
      </section>

    </>
  );
};

export default HomePage;
