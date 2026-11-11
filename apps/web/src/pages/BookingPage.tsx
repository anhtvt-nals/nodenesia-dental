import { BookingLoadingOverlay } from '../components/common/BookingLoadingOverlay';
import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getServices,
  getDoctors,
  getSlots,
  createBooking,
} from '../lib/api';
import {
  Service,
  Doctor,
  BookingSlot,
} from '../types';
import { BookingStepper } from '../components/common/BookingStepper';
import { WhitebloomBookingModal } from '../components/common/WhitebloomBookingModal';
import { AppHelmet } from '../components/common/AppHelmet';
import {
  formatRupiah,
  isValidIndonesianPhone,
  normalizePhoneForWhatsApp,
  buildWhatsAppLink,
} from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';
import { DEFAULT_SERVICES, DEFAULT_HERO_DOCTORS } from '../lib/fallback-data';

export const BookingPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // URL state
  const stepParam = parseInt(searchParams.get('step') || '1', 10);
  const currentStep = isNaN(stepParam) || stepParam < 1 || stepParam > 4 ? 1 : stepParam;

  const prefilledServiceSlug = searchParams.get('layanan') || '';
  const prefilledDoctorId = searchParams.get('dokter') || 'any';
  const prefilledDate = searchParams.get('tanggal') || '';
  const prefilledTime = searchParams.get('jam') || '';

  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('all');

  // Form selections
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(prefilledDoctorId);
  const [selectedDate, setSelectedDate] = useState<string>(prefilledDate);
  const [selectedTime, setSelectedTime] = useState<string>(prefilledTime);

  // Patient info (Step 4)
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [complaint, setComplaint] = useState<string>('');
  const [consentChecked, setConsentChecked] = useState<boolean>(false);
  const [honeypotValue, setHoneypotValue] = useState<string>(''); // Bot protection

  // Slots state
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionPending = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load services and doctors with resilient fallback
  useEffect(() => {
    async function loadInitial() {
      const [allServices, allDocs] = await Promise.all([
        getServices().catch(() => [] as Service[]),
        getDoctors().catch(() => [] as Doctor[]),
      ]);
      const resolvedServices = allServices.length > 0 ? allServices : DEFAULT_SERVICES;
      const resolvedDocs = allDocs.length > 0 ? allDocs : DEFAULT_HERO_DOCTORS;
      setServices(resolvedServices);
      setDoctors(resolvedDocs);

      // Auto-select service if slug in URL
      if (prefilledServiceSlug) {
        const found = resolvedServices.find((s) => s.slug === prefilledServiceSlug || s.id === prefilledServiceSlug);
        if (found) {
          setSelectedServiceId(found.id);
        } else if (resolvedServices.length > 0) {
          setSelectedServiceId(resolvedServices[0].id);
        }
      } else if (resolvedServices.length > 0 && !selectedServiceId) {
        setSelectedServiceId(resolvedServices[0].id);
      }

      // Auto-select doctor if slug or ID in URL
      if (prefilledDoctorId && prefilledDoctorId !== 'any') {
        const docFound = resolvedDocs.find((d) => d.slug === prefilledDoctorId || d.id === prefilledDoctorId);
        if (docFound) {
          setSelectedDoctorId(docFound.id);
        }
      }

      // Default date to tomorrow if not set
      if (!selectedDate) {
        const tmrw = new Date();
        tmrw.setDate(tmrw.getDate() + 1);
        if (tmrw.getDay() === 0) tmrw.setDate(tmrw.getDate() + 1); // skip sunday
        setSelectedDate(tmrw.toISOString().split('T')[0]);
      }

      setLoadingInitial(false);
    }
    loadInitial();
  }, [prefilledServiceSlug, prefilledDoctorId]);

  // Update query params as state changes
  const updateUrlState = (updates: Record<string, string | null>) => {
    const nextParams = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        nextParams.delete(key);
      } else {
        nextParams.set(key, val);
      }
    });
    setSearchParams(nextParams, { replace: true });
  };

  const goToStep = (step: number) => {
    setErrorMessage(null);
    updateUrlState({ step: String(step) });
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  // Fetch slots whenever service or date changes across all doctors
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedServiceId || !selectedDate || doctors.length === 0) return;
      setLoadingSlots(true);
      try {
        const slotPromises = doctors.map((doc) =>
          getSlots({
            serviceId: selectedServiceId,
            doctorId: doc.id,
            date: selectedDate,
          }).catch(() => [])
        );
        const results = await Promise.all(slotPromises);
        setSlots(results.flat());
      } catch (err) {
        console.error('Failed to load slots', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchAvailability();
  }, [selectedServiceId, selectedDate, doctors]);

  // Selection handlers
  const handleSelectService = (service: Service) => {
    setSelectedServiceId(service.id);
    updateUrlState({ layanan: service.slug, step: '2' });
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime(''); // Reset chosen time when date changes
    updateUrlState({ tanggal: date, jam: null });
  };

  const handleSelectSlot = (time: string) => {
    setSelectedTime(time);
    updateUrlState({ jam: time });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submissionPending.current) return;
    setErrorMessage(null);

    // Validations
    if (patientName.trim().length < 3) {
      setErrorMessage(t.booking.nameError);
      return;
    }

    if (!isValidIndonesianPhone(patientPhone)) {
      setErrorMessage(t.booking.phoneError);
      return;
    }

    if (!consentChecked) {
      setErrorMessage(t.booking.consentError);
      return;
    }

    if (!selectedTime) {
      setErrorMessage('Harap pilih slot jam praktek terlebih dahulu.');
      return;
    }

    submissionPending.current = true;
    setIsSubmitting(true);
    try {
      const normalizedPhone = normalizePhoneForWhatsApp(patientPhone);

      const booking = await createBooking({
        serviceId: selectedServiceId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: selectedTime,
        patient: {
          name: patientName.trim(),
          phone: normalizedPhone,
        },
        complaint: complaint.trim(),
        honeypot: honeypotValue,
      });

      const tokenQuery = booking.token ? `?token=${encodeURIComponent(booking.token)}` : '';
      navigate(localePath(`/booking/sukses/${booking.code}${tokenQuery}`));
    } catch (err: any) {
      if (err.status === 409) {
        setErrorMessage(t.booking.conflictError);
        goToStep(2);
      } else {
        setErrorMessage(err.message || t.booking.generalError);
      }
    } finally {
      submissionPending.current = false;
      setIsSubmitting(false);
    }
  };

  const currentService = services.find((s) => s.id === selectedServiceId);
  const currentDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const waAskLink = buildWhatsAppLink(
    settings.whatsappNumber,
    currentService
      ? `${t.booking.waPrefillService}"${lang === 'en' ? currentService.nameEn : currentService.name}"`
      : t.booking.waPrefillGeneral
  );

  const filteredServices = serviceCategoryFilter === 'all'
    ? services
    : services.filter((s) => s.category === serviceCategoryFilter);

  if (loadingInitial) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-28 text-center text-sm font-medium text-text-muted">
        <span className="inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mr-3 align-middle" />
        {t.common.loading}
      </div>
    );
  }

  return (
    <>
      <AppHelmet
        title={t.booking.pageTitle}
        description={t.booking.pageDesc}
        path="/booking"
      />

      {isSubmitting && <BookingLoadingOverlay />}

      {/* Atelier Booking Hero Header */}
      <section className="hero-pattern pt-8 pb-10 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
            01 / RESERVASI DOKTER GIGI SPESIALIS
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
            {t.booking.pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl leading-relaxed">
            {t.booking.pageDesc}
          </p>
        </div>
      </section>

      <div className="py-6 sm:py-8 bg-bg min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            
            {/* Main Booking Form Column */}
            <div className="lg:col-span-8">
              {/* Stepper */}
              <BookingStepper
                currentStep={currentStep}
                onStepClick={(s) => goToStep(s)}
              />

              {/* Error Banner */}
              {errorMessage && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-2xl bg-error/10 border border-error/30 text-error-dark text-sm flex items-start gap-3 shadow-xs"
                >
                  <svg className="w-5 h-5 text-error-dark shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <div>
                    <span className="font-bold block mb-0.5">
                      {lang === 'en' ? 'Notice:' : 'Pemberitahuan:'}
                    </span>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              {/* STEP 1: LAYANAN */}
              {currentStep === 1 && (
                <div className="bg-surface rounded-3xl p-6 sm:p-9 border border-border shadow-soft">
                  <div className="mb-6">
                    <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-1">
                      LANGKAH 01 / PILIH TINDAKAN
                    </span>
                    <h2 className="font-heading text-xl sm:text-3xl font-bold text-secondary mb-2">
                      {t.booking.selectServicePrompt}
                    </h2>
                    <p className="text-sm text-text-muted">
                      {lang === 'en'
                        ? 'Select a dental procedure to proceed to doctor & date selection'
                        : 'Pilih salah satu perawatan untuk melanjutkan ke pemilihan jadwal dokter'}
                    </p>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
                    {[
                      { id: 'all', label: 'Semua Layanan' },
                      { id: 'estetik', label: 'Estetik & Veneer' },
                      { id: 'restoratif', label: 'Tambal & Restorasi' },
                      { id: 'ortodonti', label: 'Ortodonti / Behel' },
                      { id: 'pencegahan', label: 'Scaling & Pembersihan' },
                      { id: 'bedah', label: 'Implan & Bedah' },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setServiceCategoryFilter(cat.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                          serviceCategoryFilter === cat.id
                            ? 'bg-secondary text-white border-secondary shadow-xs'
                            : 'bg-bg-alt text-text-muted border-border hover:bg-border/60 hover:text-secondary'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-3">
                    {filteredServices.map((svc) => {
                      const isSelected = selectedServiceId === svc.id;
                      const name = lang === 'en' ? svc.nameEn : svc.name;
                      const desc = lang === 'en' ? svc.shortDescEn : svc.shortDesc;
                      const priceNote = lang === 'en' ? svc.priceNoteEn : svc.priceNote;

                      return (
                        <div
                          key={svc.id}
                          onClick={() => handleSelectService(svc)}
                          className={`p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                            isSelected
                              ? 'bg-primary/5 border-primary ring-2 ring-primary/20 shadow-xs'
                              : 'bg-surface border-border hover:border-primary/40 hover:bg-bg-alt/40'
                          }`}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                              handleSelectService(svc);
                            }
                          }}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                                {t.services.categories[svc.category]}
                              </span>
                              <span className="text-xs font-medium text-text-muted inline-flex items-center gap-1">
                                <svg className="w-3.5 h-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                                  <circle cx="12" cy="12" r="10" />
                                  <polyline points="12 6 12 12 16 14" />
                                </svg>
                                {svc.durationMinutes} {t.common.minutes}
                              </span>
                            </div>
                            <h3 className="font-heading text-lg font-bold text-secondary mb-1">
                              {name}
                            </h3>
                            <p className="text-xs sm:text-sm text-text-muted line-clamp-2 leading-relaxed">
                              {desc}
                            </p>
                          </div>

                          <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                            <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5 sm:gap-0.5 shrink-0">
                              <span className="text-xs text-text-subtle">
                                {t.services.startingFrom}
                              </span>
                              <span className="font-heading text-base sm:text-lg font-bold text-primary whitespace-nowrap tabular-nums">
                                {formatRupiah(svc.priceFrom, lang === 'en')}
                              </span>
                            </div>
                            {priceNote && (
                              <span className="text-xs text-text-muted block text-right max-w-[200px] sm:max-w-none">
                                {priceNote}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="button"
                      onClick={() => goToStep(2)}
                      className="btn-primary rounded-xl px-8 py-3.5 text-sm font-semibold w-full sm:w-auto cursor-pointer shadow-xs"
                    >
                      <span>{t.booking.nextStep}</span>
                      <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2 & 3: JADWAL & DOKTER */}
              {(currentStep === 2 || currentStep === 3) && (
                <WhitebloomBookingModal
                  embedded={true}
                  doctors={doctors}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                  selectedDoctorId={selectedDoctorId}
                  onSelectDoctor={(docId) => {
                    setSelectedDoctorId(docId);
                    updateUrlState({ dokter: docId });
                  }}
                  selectedTime={selectedTime}
                  onSelectTime={handleSelectSlot}
                  slots={slots}
                  loadingSlots={loadingSlots}
                  serviceName={currentService ? (lang === 'en' ? currentService.nameEn : currentService.name) : undefined}
                  onBack={() => goToStep(1)}
                  onContinue={() => goToStep(4)}
                />
              )}

              {/* STEP 4: DATA DIRI & KONFIRMASI */}
              {currentStep === 4 && (
                <div className="bg-surface rounded-3xl p-6 sm:p-9 border border-border shadow-soft">
                  <form onSubmit={handleFormSubmit} aria-busy={isSubmitting}>
                    <fieldset disabled={isSubmitting} className="min-w-0 border-0 p-0 m-0">
                      <div className="mb-8">
                        <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-1">
                          LANGKAH 04 / KONFIRMASI
                        </span>
                        <h2 className="font-heading text-xl sm:text-3xl font-bold text-secondary mb-2">
                          {t.booking.patientFormTitle}
                        </h2>
                        <p className="text-sm text-text-muted mb-6 leading-relaxed">
                          {t.booking.patientFormDesc}
                        </p>

                        {/* Summary Clinical Ticket Card */}
                        <div className="p-6 rounded-2xl bg-bg-alt/70 border border-border mb-8 space-y-3 text-sm">
                          <div className="flex items-center justify-between pb-3 border-b border-border/80">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary">
                              {t.booking.summaryTitle}
                            </span>
                            <span className="text-[11px] font-semibold text-accent bg-accent/15 px-2.5 py-0.5 rounded-full">
                              Pembayaran Selesai Perawatan di Klinik
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">{t.booking.selectedService}:</span>
                            <span className="font-heading font-bold text-secondary">
                              {currentService ? (lang === 'en' ? currentService.nameEn : currentService.name) : ''}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">{t.booking.selectedDoctor}:</span>
                            <span className="font-semibold text-secondary">
                              {currentDoctor ? currentDoctor.name : t.booking.anyDoctor}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">{t.booking.selectedDate}:</span>
                            <span className="font-semibold text-secondary">{selectedDate}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-text-muted">{t.booking.selectedSlot}:</span>
                            <span className="font-bold text-primary font-mono bg-primary/10 px-2 py-0.5 rounded">
                              {selectedTime} WIB
                            </span>
                          </div>
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-5">
                          <div>
                            <label htmlFor="patient-name" className="form-label text-sm font-bold text-secondary mb-1.5 block">
                              {t.booking.fullName} <span className="text-error">*</span>
                            </label>
                            <input
                              id="patient-name"
                              type="text"
                              required
                              value={patientName}
                              onChange={(e) => setPatientName(e.target.value)}
                              placeholder={t.booking.fullNamePlaceholder}
                              className="form-input rounded-xl h-12 bg-surface text-secondary"
                            />
                          </div>

                          <div>
                            <label htmlFor="patient-phone" className="form-label text-sm font-bold text-secondary mb-1.5 block">
                              {t.booking.phoneLabel} <span className="text-error">*</span>
                            </label>
                            <input
                              id="patient-phone"
                              type="tel"
                              required
                              value={patientPhone}
                              onChange={(e) => setPatientPhone(e.target.value)}
                              placeholder={t.booking.phonePlaceholder}
                              className="form-input rounded-xl h-12 bg-surface text-secondary"
                            />
                            <span className="text-xs text-text-muted mt-1.5 block">
                              {t.booking.phoneHint}
                            </span>
                          </div>

                          <div>
                            <label htmlFor="patient-complaint" className="form-label text-sm font-bold text-secondary mb-1.5 block">
                              {t.booking.complaintLabel}
                            </label>
                            <textarea
                              id="patient-complaint"
                              rows={3}
                              value={complaint}
                              onChange={(e) => setComplaint(e.target.value)}
                              placeholder={t.booking.complaintPlaceholder}
                              className="form-input rounded-xl bg-surface text-secondary py-3"
                            />
                          </div>

                          {/* Hidden Honeypot Field */}
                          <div className="hidden" aria-hidden="true">
                            <label htmlFor="website-hp">Website</label>
                            <input
                              id="website-hp"
                              type="text"
                              name="website"
                              tabIndex={-1}
                              autoComplete="off"
                              value={honeypotValue}
                              onChange={(e) => setHoneypotValue(e.target.value)}
                            />
                          </div>

                          {/* Consent checkbox */}
                          <div className="pt-3">
                            <label className="flex items-start gap-3 cursor-pointer select-none">
                              <input
                                type="checkbox"
                                required
                                checked={consentChecked}
                                onChange={(e) => setConsentChecked(e.target.checked)}
                                className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer shrink-0"
                              />
                              <span className="text-xs sm:text-sm text-text-muted leading-relaxed">
                                {t.booking.consentCheckbox}
                              </span>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <button
                          type="button"
                          onClick={() => goToStep(2)}
                          className="btn-secondary rounded-xl text-xs sm:text-sm py-2.5 px-5 cursor-pointer"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                          </svg>
                          <span>{t.booking.prevStep}</span>
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="btn-primary rounded-xl text-sm py-3 px-8 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          <span>{isSubmitting ? t.booking.submitting : t.booking.submitBtn}</span>
                          <svg className="w-4 h-4 ml-1.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </button>
                      </div>
                    </fieldset>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Assistance & Booking Management Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Assistance Card */}
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border shadow-soft">
                <span className="text-xs font-bold uppercase tracking-wider text-accent block mb-1">
                  KONSULTASI AWAL
                </span>
                <h3 className="font-heading text-lg font-bold text-secondary mb-2">
                  {lang === 'en' ? 'Need Assistance?' : 'Butuh Bantuan Reservasi?'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-5 leading-relaxed">
                  {lang === 'en'
                    ? 'Our clinical team is ready to assist with treatment questions or urgent scheduling via WhatsApp.'
                    : 'Tim resepsionis medis kami siap membantu konsultasi awal atau penjadwalan darurat via WhatsApp.'}
                </p>

                <div className="space-y-3.5 mb-6 text-xs sm:text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-secondary">
                        {lang === 'en' ? 'Practice Hours' : 'Jam Praktek'}
                      </p>
                      <p className="text-xs text-text-muted">Senin – Sabtu, 09:00 – 20:00 WIB</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-accent/15 text-accent-text flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-bold text-secondary">WhatsApp & Telepon</p>
                      <p className="text-xs text-text-muted font-mono">{settings.phone}</p>
                    </div>
                  </div>
                </div>

                <a
                  href={waAskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp rounded-xl w-full justify-center text-xs sm:text-sm py-3 cursor-pointer shadow-xs"
                >
                  <span>{t.booking.askViaWhatsApp}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>

              {/* Manage Existing Booking Card */}
              <div className="bg-surface rounded-3xl p-6 sm:p-7 border border-border shadow-soft">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="font-heading text-base font-bold text-secondary">
                    {t.nav.manageBooking}
                  </h3>
                </div>
                <p className="text-xs text-text-muted mb-4 leading-relaxed">
                  {lang === 'en'
                    ? 'Already have a booking code? Reschedule or cancel online without creating an account.'
                    : 'Sudah memiliki kode booking? Ubah jadwal atau batalkan janji temu secara mandiri.'}
                </p>
                <Link
                  to={localePath('/booking/kelola')}
                  className="text-xs font-bold text-primary hover:text-primary-hover inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Check Booking Code →' : 'Cek Kode Booking →'}</span>
                </Link>
              </div>

              {/* Payment Methods Card */}
              <div className="bg-bg-alt/80 rounded-3xl p-6 border border-border">
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-secondary mb-2">
                  {lang === 'en' ? 'Payment Methods at Clinic' : 'Metode Pembayaran di Klinik'}
                </h3>
                <p className="text-xs text-text-muted mb-3 leading-relaxed">
                  {lang === 'en'
                    ? 'No upfront payment required for online booking. Pay after treatment via:'
                    : 'Booking online tanpa dipungut biaya di muka. Pembayaran dilakukan seusai perawatan melalui:'}
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs font-semibold text-secondary">
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">QRIS</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">Kartu Debit & Kredit</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">Transfer Bank</span>
                  <span className="px-2.5 py-1 rounded-lg bg-surface border border-border">Asuransi Swasta</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
