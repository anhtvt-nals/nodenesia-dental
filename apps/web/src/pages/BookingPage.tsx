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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#14201C]/60">
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

      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Sistem Reservasi Klinis
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-2 text-balance">
              {t.booking.pageTitle}
            </h1>
            <p className="text-sm font-sans text-[#14201C]/75">
              {t.booking.pageDesc}
            </p>
          </div>

          {/* Stepper */}
          <BookingStepper
            currentStep={currentStep}
            onStepClick={(s) => goToStep(s)}
          />

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="mb-8 p-4 bg-[#C8553D]/10 hairline-border border-[#C8553D]/30 text-[#C8553D] text-xs font-mono"
            >
              <span className="font-semibold block mb-0.5">Pemberitahuan:</span>
              {errorMessage}
            </div>
          )}

          {/* Main Booking Container */}
          <div className="hairline-border bg-[#F4F1EA] p-4 sm:p-6 md:p-8">
            {/* STEP 1: LAYANAN */}
            {currentStep === 1 && (
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-[#14201C] mb-2">
                  {t.booking.selectServicePrompt}
                </h2>
                <p className="text-xs font-mono text-[#14201C]/60 mb-6">
                  Pilih salah satu perawatan untuk melanjutkan ke pemilihan jadwal dokter
                </p>

                <div className="space-y-3">
                  {services.map((svc) => {
                    const isSelected = selectedServiceId === svc.id;
                    const name = lang === 'en' ? svc.nameEn : svc.name;
                    const desc = lang === 'en' ? svc.shortDescEn : svc.shortDesc;
                    const priceNote = lang === 'en' ? svc.priceNoteEn : svc.priceNote;

                    return (
                      <div
                        key={svc.id}
                        onClick={() => handleSelectService(svc)}
                        className={`p-3.5 sm:p-4 hairline-border cursor-pointer transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 ${
                          isSelected
                            ? 'bg-[#1F3D36]/10 border-[#1F3D36]'
                            : 'bg-[#F4F1EA] hover:bg-[#E9E4D8]/40'
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
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-mono text-[#1F3D36]">
                              {t.services.categories[svc.category]}
                            </span>
                            <span>·</span>
                            <span className="text-xs font-mono text-[#14201C]/50">
                              {svc.durationMinutes} {t.common.minutes}
                            </span>
                          </div>
                          <h3 className="font-serif text-lg sm:text-xl text-[#14201C] mb-1">
                            {name}
                          </h3>
                          <p className="text-xs text-[#14201C]/70 line-clamp-2">
                            {desc}
                          </p>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 hairline-t sm:border-t-0 shrink-0">
                          <span className="text-xs font-mono text-[#14201C]/50 block">
                            {t.services.startingFrom}
                          </span>
                          <span className="font-mono text-base font-semibold text-[#1F3D36]">
                            {formatRupiah(svc.priceFrom, lang === 'en')}
                          </span>
                          {priceNote && (
                            <span className="text-[11px] font-mono text-[#14201C]/50 block sm:text-right">
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
                    className="w-full sm:w-auto px-6 py-3 min-h-[44px] flex items-center justify-center bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] active:bg-[#162B26] transition-colors shadow-xs"
                  >
                    {t.booking.nextStep} →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DOKTER & TANGGAL */}
            {currentStep === 2 && (
              <div>
                {/* Doctor Selection */}
                <div className="mb-8 pb-8 hairline-b">
                  <h2 className="font-serif text-2xl text-[#14201C] mb-2">
                    {t.booking.selectDoctorPrompt}
                  </h2>
                  <p className="text-xs font-mono text-[#14201C]/60 mb-4">
                    Pilih dokter spesialis atau serahkan penentuan dokter kepada pihak klinik
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedDoctorId('any');
                        updateUrlState({ dokter: 'any' });
                      }}
                      className={`p-4 text-left hairline-border transition-colors ${
                        selectedDoctorId === 'any'
                          ? 'bg-[#1F3D36] text-[#F4F1EA] border-[#1F3D36]'
                          : 'bg-[#F4F1EA] text-[#14201C] hover:bg-[#E9E4D8]'
                      }`}
                    >
                      <span className="font-serif text-lg block mb-1">
                        {t.booking.anyDoctor}
                      </span>
                      <span className={`text-xs font-mono block ${selectedDoctorId === 'any' ? 'text-white/70' : 'text-[#14201C]/60'}`}>
                        Slot waktu paling fleksibel
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
                        className={`p-4 text-left hairline-border transition-colors ${
                          selectedDoctorId === doc.id
                            ? 'bg-[#1F3D36] text-[#F4F1EA] border-[#1F3D36]'
                            : 'bg-[#F4F1EA] text-[#14201C] hover:bg-[#E9E4D8]'
                        }`}
                      >
                        <span className="font-serif text-lg block mb-1">
                          {doc.name}
                        </span>
                        <span className={`text-xs font-mono block ${selectedDoctorId === doc.id ? 'text-white/70' : 'text-[#14201C]/60'}`}>
                          {doc.specialty}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-8">
                  <h2 className="font-serif text-2xl text-[#14201C] mb-2">
                    {t.booking.selectDatePrompt}
                  </h2>
                  <p className="text-xs font-mono text-[#14201C]/60 mb-4">
                    Klinik buka Senin hingga Sabtu (Minggu tutup)
                  </p>
                  <DateStrip
                    selectedDate={selectedDate}
                    onSelectDate={handleSelectDate}
                  />
                </div>

                <div className="flex items-center justify-between pt-6 hairline-t">
                  <button
                    type="button"
                    onClick={() => goToStep(1)}
                    className="px-5 py-2.5 hairline-border bg-[#E9E4D8] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#DDD7C9]"
                  >
                    ← {t.booking.prevStep}
                  </button>
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-6 py-3 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
                  >
                    {t.booking.nextStep} →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: JAM PRAKTEK (SLOT PICKER) */}
            {currentStep === 3 && (
              <div>
                <div className="flex items-baseline justify-between gap-4 mb-2">
                  <h2 className="font-serif text-2xl text-[#14201C]">
                    {t.booking.selectSlotPrompt}
                  </h2>
                  <span className="text-xs font-mono text-[#1F3D36]">
                    {t.booking.serviceDurationNote} {currentService?.durationMinutes} {t.common.minutes}
                  </span>
                </div>
                <p className="text-xs font-mono text-[#14201C]/60 mb-6">
                  Tanggal: {selectedDate} · Dokter:{' '}
                  {currentDoctor ? currentDoctor.name : t.booking.anyDoctor}
                </p>

                <SlotPicker
                  slots={slots}
                  selectedSlot={selectedTime}
                  onSelectSlot={handleSelectSlot}
                  isLoading={loadingSlots}
                />

                {selectedTime && (
                  <div className="mt-6 p-4 bg-[#E9E4D8]/50 hairline-border text-xs font-mono text-[#1F3D36]">
                    Jam yang dipilih: <span className="font-semibold text-sm">{selectedTime} WIB</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 hairline-t mt-8">
                  <button
                    type="button"
                    onClick={() => goToStep(2)}
                    className="px-5 py-2.5 hairline-border bg-[#E9E4D8] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#DDD7C9]"
                  >
                    ← {t.booking.prevStep}
                  </button>
                  <button
                    type="button"
                    disabled={!selectedTime}
                    onClick={() => selectedTime && goToStep(4)}
                    className={`px-6 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                      selectedTime
                        ? 'bg-[#1F3D36] text-[#F4F1EA] hover:bg-[#162B26]'
                        : 'bg-[#E9E4D8] text-[#14201C]/40 cursor-not-allowed'
                    }`}
                  >
                    {t.booking.nextStep} →
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: DATA DIRI & KONFIRMASI */}
            {currentStep === 4 && (
              <form onSubmit={handleFormSubmit}>
                <div className="mb-8">
                  <h2 className="font-serif text-2xl text-[#14201C] mb-2">
                    {t.booking.patientFormTitle}
                  </h2>
                  <p className="text-xs font-mono text-[#14201C]/60 mb-6">
                    {t.booking.patientFormDesc}
                  </p>

                  {/* Summary Card */}
                  <div className="p-4 bg-[#E9E4D8]/40 hairline-border mb-6 space-y-1.5 font-mono text-xs">
                    <div className="text-[11px] uppercase tracking-wider text-[#1F3D36] font-semibold mb-1">
                      {t.booking.summaryTitle}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#14201C]/60">{t.booking.selectedService}:</span>
                      <span className="font-medium text-[#14201C]">{currentService?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#14201C]/60">{t.booking.selectedDoctor}:</span>
                      <span className="font-medium text-[#14201C]">{currentDoctor ? currentDoctor.name : t.booking.anyDoctor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#14201C]/60">{t.booking.selectedDate}:</span>
                      <span className="font-medium text-[#14201C]">{selectedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#14201C]/60">{t.booking.selectedSlot}:</span>
                      <span className="font-medium text-[#1F3D36]">{selectedTime} WIB</span>
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="patient-name" className="block text-xs font-mono uppercase tracking-wider text-[#14201C] mb-1">
                        {t.booking.fullName} *
                      </label>
                      <input
                        id="patient-name"
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder={t.booking.fullNamePlaceholder}
                        className="w-full p-3 text-sm font-sans hairline-border bg-[#F4F1EA] focus:outline-none focus:ring-1 focus:ring-[#1F3D36]"
                      />
                    </div>

                    <div>
                      <label htmlFor="patient-phone" className="block text-xs font-mono uppercase tracking-wider text-[#14201C] mb-1">
                        {t.booking.phoneLabel} *
                      </label>
                      <input
                        id="patient-phone"
                        type="tel"
                        required
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder={t.booking.phonePlaceholder}
                        className="w-full p-3 text-sm font-mono hairline-border bg-[#F4F1EA] focus:outline-none focus:ring-1 focus:ring-[#1F3D36]"
                      />
                      <span className="text-[11px] font-mono text-[#14201C]/50 mt-1 block">
                        {t.booking.phoneHint}
                      </span>
                    </div>

                    <div>
                      <label htmlFor="patient-complaint" className="block text-xs font-mono uppercase tracking-wider text-[#14201C] mb-1">
                        {t.booking.complaintLabel}
                      </label>
                      <textarea
                        id="patient-complaint"
                        rows={3}
                        value={complaint}
                        onChange={(e) => setComplaint(e.target.value)}
                        placeholder={t.booking.complaintPlaceholder}
                        className="w-full p-3 text-sm font-sans hairline-border bg-[#F4F1EA] focus:outline-none focus:ring-1 focus:ring-[#1F3D36]"
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
                          className="mt-1 h-4 w-4 rounded-none accent-[#1F3D36]"
                        />
                        <span className="text-xs font-sans text-[#14201C]/80 leading-relaxed">
                          {t.booking.consentCheckbox}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 hairline-t">
                  <button
                    type="button"
                    onClick={() => goToStep(3)}
                    className="px-5 py-2.5 hairline-border bg-[#E9E4D8] text-[#14201C] text-xs font-mono uppercase tracking-wider hover:bg-[#DDD7C9]"
                  >
                    ← {t.booking.prevStep}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? t.booking.submitting : t.booking.submitBtn} →
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Secondary WhatsApp CTA everywhere */}
          <div className="mt-8 text-center">
            <span className="text-xs font-mono text-[#14201C]/60 mr-2">
              Ada pertanyaan seputar prosedur atau jadwal?
            </span>
            <a
              href={waAskLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-[#1F3D36] font-semibold hover:underline"
            >
              {t.booking.askViaWhatsApp} ↗
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingPage;

