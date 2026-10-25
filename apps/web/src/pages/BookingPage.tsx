import React, { useEffect, useState } from 'react';
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
import { DateStrip } from '../components/common/DateStrip';
import { SlotPicker } from '../components/common/SlotPicker';
import { AppHelmet } from '../components/common/AppHelmet';
import {
  formatRupiah,
  isValidIndonesianPhone,
  normalizePhoneForWhatsApp,
  buildWhatsAppLink,
} from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load services and doctors
  useEffect(() => {
    async function loadInitial() {
      const [allServices, allDocs] = await Promise.all([
        getServices(),
        getDoctors(),
      ]);
      setServices(allServices);
      setDoctors(allDocs);

      // Auto-select service if slug in URL
      if (prefilledServiceSlug) {
        const found = allServices.find((s) => s.slug === prefilledServiceSlug || s.id === prefilledServiceSlug);
        if (found) {
          setSelectedServiceId(found.id);
        } else if (allServices.length > 0) {
          setSelectedServiceId(allServices[0].id);
        }
      } else if (allServices.length > 0 && !selectedServiceId) {
        setSelectedServiceId(allServices[0].id);
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
  }, [prefilledServiceSlug]);

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
  };

  // Fetch slots whenever service, doctor, or date changes
  useEffect(() => {
    async function fetchAvailability() {
      if (!selectedServiceId || !selectedDate) return;
      setLoadingSlots(true);
      try {
        const result = await getSlots({
          serviceId: selectedServiceId,
          doctorId: selectedDoctorId,
          date: selectedDate,
        });
        setSlots(result);
      } catch (err) {
        console.error('Failed to load slots', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchAvailability();
  }, [selectedServiceId, selectedDoctorId, selectedDate]);

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

      // Redirect to booking success page (carry the management token so the
      // success/manage page can read the reservation back from the API).
      const tokenQuery = booking.token ? `?token=${encodeURIComponent(booking.token)}` : '';
      navigate(localePath(`/booking/sukses/${booking.code}${tokenQuery}`));
    } catch (err: any) {
      if (err.status === 409) {
        setErrorMessage(t.booking.conflictError);
        // Step back to slot selection
        goToStep(3);
      } else {
        setErrorMessage(err.message || t.booking.generalError);
      }
    } finally {
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

  if (loadingInitial) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-medium text-text-muted">
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

      <div className="py-10 md:py-16 bg-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 max-w-3xl">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Clinical Reservation System' : 'Sistem Reservasi Klinis'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-text tracking-tight mb-3 text-balance">
              {t.booking.pageTitle}
            </h1>
            <p className="text-base text-text-muted leading-relaxed">
              {t.booking.pageDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
                  className="mb-6 p-4 rounded-xl bg-error/10 border border-error/30 text-error-dark text-sm flex items-start gap-3"
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

              {/* Main Demo Form Card Container */}
              <div className="trust-card p-5 sm:p-8 bg-bg-card">
                {/* STEP 1: LAYANAN */}
                {currentStep === 1 && (
                  <div>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-1.5">
                      {t.booking.selectServicePrompt}
                    </h2>
                    <p className="text-sm text-text-muted mb-6">
                      {lang === 'en'
                        ? 'Select a dental procedure to proceed to doctor & date selection'
                        : 'Pilih salah satu perawatan untuk melanjutkan ke pemilihan jadwal dokter'}
                    </p>

                    <div className="space-y-3.5">
                      {services.map((svc) => {
                        const isSelected = selectedServiceId === svc.id;
                        const name = lang === 'en' ? svc.nameEn : svc.name;
                        const desc = lang === 'en' ? svc.shortDescEn : svc.shortDesc;
                        const priceNote = lang === 'en' ? svc.priceNoteEn : svc.priceNote;

                        return (
                          <div
                            key={svc.id}
                            onClick={() => handleSelectService(svc)}
                            className={`p-4 sm:p-5 rounded-xl border cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                              isSelected
                                ? 'bg-primary/5 border-primary ring-2 ring-primary/15 shadow-sm'
                                : 'bg-bg-card border-border hover:border-primary/50 hover:bg-bg-alt/50'
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
                                <span className="badge badge-primary">
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
                              <h3 className="font-heading text-lg font-bold text-text mb-1">
                                {name}
                              </h3>
                              <p className="text-xs sm:text-sm text-text-muted line-clamp-2">
                                {desc}
                              </p>
                            </div>

                            <div className="flex sm:flex-col items-baseline sm:items-end justify-between sm:justify-start gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-border shrink-0">
                              <div className="flex sm:flex-col items-baseline sm:items-end gap-1.5 sm:gap-0.5 shrink-0">
                                <span className="text-xs text-text-subtle">
                                  {t.services.startingFrom}
                                </span>
                                <span className="font-heading text-base sm:text-lg font-bold text-primary whitespace-nowrap">
                                  {formatRupiah(svc.priceFrom, lang === 'en')}
                                </span>
                              </div>
                              {priceNote && (
                                <span className="text-[11px] text-text-muted block text-right max-w-[180px] sm:max-w-none">
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
                        className="btn-primary w-full sm:w-auto justify-center cursor-pointer"
                      >
                        <span>{t.booking.nextStep}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: DOKTER & TANGGAL */}
                {currentStep === 2 && (
                  <div>
                    {/* Doctor Selection */}
                    <div className="mb-8 pb-8 border-b border-border">
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-1.5">
                        {t.booking.selectDoctorPrompt}
                      </h2>
                      <p className="text-sm text-text-muted mb-5">
                        {lang === 'en'
                          ? 'Choose a specific specialist or let our clinic assign the earliest available dentist'
                          : 'Pilih dokter spesialis atau serahkan penentuan dokter kepada pihak klinik'}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedDoctorId('any');
                            updateUrlState({ dokter: 'any' });
                          }}
                          className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                            selectedDoctorId === 'any'
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'bg-bg-card text-text border-border hover:border-primary/50 hover:bg-bg-alt'
                          }`}
                        >
                          <span className="font-heading font-bold text-base block mb-1">
                            {t.booking.anyDoctor}
                          </span>
                          <span className={`text-xs block ${selectedDoctorId === 'any' ? 'text-white/85' : 'text-text-muted'}`}>
                            {lang === 'en' ? 'Most flexible time slots' : 'Slot waktu paling fleksibel'}
                          </span>
                        </button>

                        {doctors.map((doc) => (
                          <button
                            key={doc.id}
                            type="button"
                            onClick={() => {
                              setSelectedDoctorId(doc.id);
                              updateUrlState({ dokter: doc.id });
                            }}
                            className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                              selectedDoctorId === doc.id
                                ? 'bg-primary text-white border-primary shadow-md'
                                : 'bg-bg-card text-text border-border hover:border-primary/50 hover:bg-bg-alt'
                            }`}
                          >
                            <span className="font-heading font-bold text-base block mb-1">
                              {doc.name}
                            </span>
                            <span className={`text-xs block ${selectedDoctorId === doc.id ? 'text-white/85' : 'text-text-muted'}`}>
                              {lang === 'en' ? doc.specialtyEn : doc.specialty}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div className="mb-8">
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-1.5">
                        {t.booking.selectDatePrompt}
                      </h2>
                      <p className="text-sm text-text-muted mb-4">
                        {lang === 'en'
                          ? 'Clinic open Monday to Saturday (Closed on Sundays)'
                          : 'Klinik buka Senin hingga Sabtu (Minggu tutup)'}
                      </p>
                      <DateStrip
                        selectedDate={selectedDate}
                        onSelectDate={handleSelectDate}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-6 border-t border-border">
                      <button
                        type="button"
                        onClick={() => goToStep(1)}
                        className="btn-secondary text-sm py-2.5 px-5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span>{t.booking.prevStep}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => goToStep(3)}
                        className="btn-primary text-sm py-2.5 px-6 cursor-pointer"
                      >
                        <span>{t.booking.nextStep}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: JAM PRAKTEK (SLOT PICKER) */}
                {currentStep === 3 && (
                  <div>
                    <div className="flex flex-wrap items-baseline justify-between gap-4 mb-2">
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-text">
                        {t.booking.selectSlotPrompt}
                      </h2>
                      <span className="badge badge-primary">
                        {t.booking.serviceDurationNote} {currentService?.durationMinutes} {t.common.minutes}
                      </span>
                    </div>
                    <p className="text-sm text-text-muted mb-6">
                      {lang === 'en' ? 'Date:' : 'Tanggal:'} <strong className="text-text">{selectedDate}</strong> · {lang === 'en' ? 'Doctor:' : 'Dokter:'}{' '}
                      <strong className="text-text">{currentDoctor ? currentDoctor.name : t.booking.anyDoctor}</strong>
                    </p>

                    <SlotPicker
                      slots={slots}
                      selectedSlot={selectedTime}
                      onSelectSlot={handleSelectSlot}
                      isLoading={loadingSlots}
                    />

                    {selectedTime && (
                      <div className="mt-6 p-4 rounded-xl bg-primary/10 border border-primary/20 text-sm text-primary font-medium flex items-center gap-2.5">
                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {lang === 'en' ? 'Selected time slot:' : 'Jam yang dipilih:'}{' '}
                          <strong className="font-bold">{selectedTime} WIB</strong>
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-border mt-8">
                      <button
                        type="button"
                        onClick={() => goToStep(2)}
                        className="btn-secondary text-sm py-2.5 px-5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span>{t.booking.prevStep}</span>
                      </button>
                      <button
                        type="button"
                        disabled={!selectedTime}
                        onClick={() => selectedTime && goToStep(4)}
                        className={`text-sm py-2.5 px-6 rounded-xl font-semibold inline-flex items-center gap-2 transition-all ${
                          selectedTime
                            ? 'btn-primary cursor-pointer'
                            : 'bg-bg-alt text-text-subtle border border-border cursor-not-allowed'
                        }`}
                      >
                        <span>{t.booking.nextStep}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: DATA DIRI & KONFIRMASI */}
                {currentStep === 4 && (
                  <form onSubmit={handleFormSubmit}>
                    <div className="mb-8">
                      <h2 className="font-heading text-xl sm:text-2xl font-bold text-text mb-1.5">
                        {t.booking.patientFormTitle}
                      </h2>
                      <p className="text-sm text-text-muted mb-6">
                        {t.booking.patientFormDesc}
                      </p>

                      {/* Summary Card */}
                      <div className="p-5 rounded-xl bg-bg-alt border border-border mb-6 space-y-2 text-sm">
                        <div className="text-xs font-bold uppercase tracking-wider text-primary mb-2">
                          {t.booking.summaryTitle}
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">{t.booking.selectedService}:</span>
                          <span className="font-semibold text-text">
                            {currentService ? (lang === 'en' ? currentService.nameEn : currentService.name) : ''}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">{t.booking.selectedDoctor}:</span>
                          <span className="font-semibold text-text">{currentDoctor ? currentDoctor.name : t.booking.anyDoctor}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">{t.booking.selectedDate}:</span>
                          <span className="font-semibold text-text">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-text-muted">{t.booking.selectedSlot}:</span>
                          <span className="font-bold text-primary">{selectedTime} WIB</span>
                        </div>
                      </div>

                      {/* Input Fields (Strict: only name, phone, complaint, consent, honeypot — no email, no medical history) */}
                      <div className="space-y-5">
                        <div>
                          <label htmlFor="patient-name" className="form-label">
                            {t.booking.fullName} *
                          </label>
                          <input
                            id="patient-name"
                            type="text"
                            required
                            value={patientName}
                            onChange={(e) => setPatientName(e.target.value)}
                            placeholder={t.booking.fullNamePlaceholder}
                            className="form-input"
                          />
                        </div>

                        <div>
                          <label htmlFor="patient-phone" className="form-label">
                            {t.booking.phoneLabel} *
                          </label>
                          <input
                            id="patient-phone"
                            type="tel"
                            required
                            value={patientPhone}
                            onChange={(e) => setPatientPhone(e.target.value)}
                            placeholder={t.booking.phonePlaceholder}
                            className="form-input"
                          />
                          <span className="text-xs text-text-muted mt-1.5 block">
                            {t.booking.phoneHint}
                          </span>
                        </div>

                        <div>
                          <label htmlFor="patient-complaint" className="form-label">
                            {t.booking.complaintLabel}
                          </label>
                          <textarea
                            id="patient-complaint"
                            rows={3}
                            value={complaint}
                            onChange={(e) => setComplaint(e.target.value)}
                            placeholder={t.booking.complaintPlaceholder}
                            className="form-input"
                          />
                        </div>

                        {/* Hidden Honeypot Field (Bot prevention, do not fill) */}
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
                        <div className="pt-2">
                          <label className="flex items-start gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              required
                              checked={consentChecked}
                              onChange={(e) => setConsentChecked(e.target.checked)}
                              className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
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
                        onClick={() => goToStep(3)}
                        className="btn-secondary text-sm py-2.5 px-5 cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                        </svg>
                        <span>{t.booking.prevStep}</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="btn-primary text-sm py-3 px-7 disabled:opacity-50 cursor-pointer"
                      >
                        <span>{isSubmitting ? t.booking.submitting : t.booking.submitBtn}</span>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* Right Column: Demo Contact & Indonesian Trust/Payment Info Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Contact & Assistance Card */}
              <div className="trust-card p-6 bg-bg-card">
                <h3 className="font-heading text-lg font-bold text-text mb-2">
                  {lang === 'en' ? 'Need Assistance?' : 'Butuh Bantuan Reservasi?'}
                </h3>
                <p className="text-xs sm:text-sm text-text-muted mb-5 leading-relaxed">
                  {lang === 'en'
                    ? 'Our clinical team is ready to assist with treatment questions or urgent scheduling via WhatsApp.'
                    : 'Tim resepsionis medis kami siap membantu konsultasi awal atau penjadwalan darurat via WhatsApp.'}
                </p>

                <div className="space-y-3.5 mb-6 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-text">
                        {lang === 'en' ? 'Practice Hours' : 'Jam Praktek'}
                      </p>
                      <p className="text-xs text-text-muted">Senin – Sabtu, 09:00 – 20:00 WIB</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-text">WhatsApp & Telepon</p>
                      <p className="text-xs text-text-muted">{settings.phone}</p>
                    </div>
                  </div>
                </div>

                <a
                  href={waAskLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary w-full justify-center text-xs py-2.5 cursor-pointer"
                >
                  <span>{t.booking.askViaWhatsApp}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              </div>

              {/* Manage Existing Booking Card */}
              <div className="trust-card p-6 bg-bg-card">
                <div className="flex items-center gap-2.5 mb-2">
                  <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="font-heading text-base font-bold text-text">
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
                  className="text-xs font-semibold text-primary hover:text-primary-hover inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>{lang === 'en' ? 'Check Booking Code' : 'Cek Kode Booking'}</span>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>

              {/* Indonesian Payment Methods Placeholder */}
              <div className="trust-card p-6 bg-bg-card">
                <h3 className="font-heading text-sm font-bold text-text mb-2">
                  {lang === 'en' ? 'Payment Methods at Clinic' : 'Metode Pembayaran di Klinik'}
                </h3>
                <p className="text-xs text-text-muted mb-3">
                  {lang === 'en'
                    ? 'No upfront payment required for online booking. Pay after treatment via:'
                    : 'Booking online tidak dipungut biaya di muka. Pembayaran dilakukan selesai perawatan melalui:'}
                </p>
                <div className="flex flex-wrap gap-1.5 text-xs">
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
    </>
  );
};

export default BookingPage;
