import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getServices,
  getDoctors,
  getPublicTimeOffs,
  getSlots,
  createBooking,
} from '../lib/api';
import {
  Service,
  Doctor,
  DoctorTimeOff,
  BookingSlot,
} from '../types';
import { BookingLoadingOverlay } from '../components/common/BookingLoadingOverlay';
import { AppHelmet } from '../components/common/AppHelmet';
import {
  validateIndonesianWhatsApp,
  normalizePhoneForWhatsApp,
  buildWhatsAppLink,
  formatDateSummary,
} from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';
import { DEFAULT_SERVICES, DEFAULT_HERO_DOCTORS } from '../lib/fallback-data';

function isDateOverlapping(dateStr: string, startsAt: string, endsAt: string): boolean {
  if (!dateStr || !startsAt || !endsAt) return false;
  const dayStart = new Date(`${dateStr}T00:00:00+07:00`).getTime();
  const dayEnd = new Date(`${dateStr}T23:59:59.999+07:00`).getTime();
  const toStart = new Date(startsAt).getTime();
  const toEnd = new Date(endsAt).getTime();
  return toStart <= dayEnd && toEnd >= dayStart;
}

function getDefaultDateStr(): string {
  const tmrw = new Date();
  tmrw.setDate(tmrw.getDate() + 1);
  if (tmrw.getDay() === 0) tmrw.setDate(tmrw.getDate() + 1);
  const y = tmrw.getFullYear();
  const m = String(tmrw.getMonth() + 1).padStart(2, '0');
  const d = String(tmrw.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const BookingPage: React.FC = () => {
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const prefilledServiceSlug = searchParams.get('layanan') || '';
  const prefilledDate = searchParams.get('tanggal') || '';
  const prefilledTime = searchParams.get('jam') || '';

  // Master data
  const [services, setServices] = useState<Service[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [clinicTimeOffs, setClinicTimeOffs] = useState<DoctorTimeOff[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // 1-Step Selections (clinic assigns the doctor automatically)
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const selectedDoctorId = 'any';
  const [selectedDate, setSelectedDate] = useState<string>(prefilledDate || getDefaultDateStr());
  const [selectedTime, setSelectedTime] = useState<string>(prefilledTime);

  // Calendar view state
  const initialDateObj = selectedDate ? new Date(`${selectedDate}T00:00:00`) : new Date();
  const [viewYear, setViewYear] = useState<number>(
    isNaN(initialDateObj.getTime()) ? new Date().getFullYear() : initialDateObj.getFullYear(),
  );
  const [viewMonth, setViewMonth] = useState<number>(
    isNaN(initialDateObj.getTime()) ? new Date().getMonth() : initialDateObj.getMonth(),
  );

  // Patient contact & note
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Bot protection & validation UI state
  const [honeypotValue, setHoneypotValue] = useState<string>('');
  const [attemptedSubmit, setAttemptedSubmit] = useState<boolean>(false);

  // Slots state
  const [slots, setSlots] = useState<BookingSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionPending = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Load services, doctors, time offs
  useEffect(() => {
    let active = true;
    async function loadInitial() {
      const [allServices, allDocs, allTimeOffs] = await Promise.all([
        getServices().catch(() => [] as Service[]),
        getDoctors().catch(() => [] as Doctor[]),
        getPublicTimeOffs().catch(() => [] as DoctorTimeOff[]),
      ]);
      if (!active) return;

      const resolvedServices = allServices.length > 0 ? allServices : DEFAULT_SERVICES;
      const resolvedDocs = allDocs.length > 0 ? allDocs : DEFAULT_HERO_DOCTORS;
      setServices(resolvedServices);
      setDoctors(resolvedDocs);
      setClinicTimeOffs(allTimeOffs);

      // Resolve service (prefill from URL or default to consultation / first service)
      const defaultService =
        resolvedServices.find((s) => s.slug === 'konsultasi-umum' || s.name.toLowerCase().includes('konsultasi')) ||
        resolvedServices[0];

      if (prefilledServiceSlug) {
        const found = resolvedServices.find(
          (s) => s.slug === prefilledServiceSlug || s.id === prefilledServiceSlug,
        );
        setSelectedServiceId(found ? found.id : defaultService?.id ?? '');
      } else if (defaultService) {
        setSelectedServiceId(defaultService.id);
      }

      setLoadingInitial(false);
    }
    loadInitial();
    return () => {
      active = false;
    };
  }, [prefilledServiceSlug]);

  // Keep calendar month in sync with selectedDate
  useEffect(() => {
    if (!selectedDate) return;
    const d = new Date(`${selectedDate}T00:00:00`);
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
    }
  }, [selectedDate]);

  // Fetch slots whenever service or date changes
  useEffect(() => {
    let active = true;
    async function fetchAvailability() {
      if (!selectedServiceId || !selectedDate || doctors.length === 0) return;
      setLoadingSlots(true);
      try {
        const results = await Promise.all(
          doctors.map((doc) =>
            getSlots({
              serviceId: selectedServiceId,
              doctorId: doc.id,
              date: selectedDate,
            }).catch(() => [] as BookingSlot[]),
          ),
        );
        if (active) setSlots(results.flat());
      } catch (err) {
        console.error('Failed to load slots', err);
      } finally {
        if (active) setLoadingSlots(false);
      }
    }
    fetchAvailability();
    return () => {
      active = false;
    };
  }, [selectedServiceId, selectedDate, doctors]);

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

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setSelectedTime('');
    setErrorMessage(null);
    updateUrlState({ tanggal: date, jam: null });
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setErrorMessage(null);
    updateUrlState({ jam: time });
  };

  // Slots deduplicated across all available clinic doctors
  const visibleSlots = useMemo(() => {
    const seen = new Set<string>();
    const unique: BookingSlot[] = [];
    for (const s of [...slots].sort((a, b) => a.time.localeCompare(b.time))) {
      if (!seen.has(s.time)) {
        seen.add(s.time);
        unique.push(s);
      }
    }
    return unique;
  }, [slots]);

  // Calendar grid
  const monthNamesEn = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthNamesId = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
  ];
  const monthName = lang === 'en' ? monthNamesEn[viewMonth] : monthNamesId[viewMonth];

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const daysGrid = useMemo(() => {
    const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
    const startingDay = (firstDayOfMonth.getDay() + 6) % 7; // Mon = 0 .. Sun = 6
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells: Array<{ dayNum: number; dateStr: string; isPast: boolean; isSunday: boolean } | null> = [];
    for (let i = 0; i < startingDay; i++) cells.push(null);

    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    for (let d = 1; d <= totalDays; d++) {
      const mm = String(viewMonth + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      const dateStr = `${viewYear}-${mm}-${dd}`;
      const dateObj = new Date(viewYear, viewMonth, d);
      cells.push({
        dayNum: d,
        dateStr,
        isPast: dateStr < todayStr,
        isSunday: dateObj.getDay() === 0,
      });
    }
    return cells;
  }, [viewYear, viewMonth]);

  // Validation
  const isTimeSelected = Boolean(selectedDate && selectedTime);
  const isNameValid = patientName.trim().length >= 2;
  const phoneCheck = patientPhone.trim()
    ? validateIndonesianWhatsApp(patientPhone)
    : { valid: true, error: undefined };
  const isPhoneValid = phoneCheck.valid;

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    setErrorMessage(null);

    if (!isTimeSelected) {
      setErrorMessage(
        lang === 'en'
          ? 'Please select an available date and time slot first.'
          : 'Harap pilih tanggal dan jam kunjungan yang tersedia terlebih dahulu.',
      );
      document.getElementById('booking-schedule-section')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!isNameValid) {
      setErrorMessage(t.booking.nameError);
      document.getElementById('patient-name')?.focus();
      return;
    }

    if (!isPhoneValid) {
      setErrorMessage(phoneCheck.error || t.booking.phoneError);
      document.getElementById('patient-phone')?.focus();
      return;
    }

    if (submissionPending.current) return;
    submissionPending.current = true;
    setIsSubmitting(true);

    try {
      const normalizedPhone = patientPhone.trim() ? normalizePhoneForWhatsApp(patientPhone) : undefined;
      const booking = await createBooking({
        serviceId: selectedServiceId,
        doctorId: selectedDoctorId,
        date: selectedDate,
        time: selectedTime,
        patient: {
          name: patientName.trim(),
          ...(normalizedPhone ? { phone: normalizedPhone } : {}),
        },
        complaint: note.trim() || undefined,
        honeypot: honeypotValue,
        whatsappConsent: true,
        dataProcessingConsent: true,
      });

      if (booking.token) {
        try {
          localStorage.setItem(`booking_token_${booking.code}`, booking.token);
        } catch {
          // ignore storage errors
        }
      }

      const tokenQuery = booking.token ? `?token=${encodeURIComponent(booking.token)}` : '';
      navigate(localePath(`/booking/sukses/${booking.code}${tokenQuery}`));
    } catch (err: any) {
      if (err?.status === 409) {
        setErrorMessage(t.booking.conflictError);
        setSelectedTime('');
      } else if (err?.status === 429) {
        setErrorMessage(
          lang === 'en'
            ? 'Too many pending bookings. Maximum 3 pending bookings per WhatsApp number in 24 hours.'
            : 'Batas reservasi tercapai. Maksimal 3 janji temu berstatus menunggu konfirmasi per nomor WhatsApp dalam 24 jam.',
        );
      } else {
        setErrorMessage(err?.message || t.booking.generalError);
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
      : t.booking.waPrefillGeneral,
  );

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

      {/* Header */}
      <section className="hero-pattern pt-8 pb-8 border-b border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
            {lang === 'en' ? 'INSTANT 1-STEP BOOKING' : 'RESERVASI CEPAT 1 LANGKAH'}
          </span>
          <h1 className="font-heading text-3xl sm:text-5xl font-bold text-secondary tracking-tight">
            {t.booking.pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-text-muted mt-2 max-w-2xl leading-relaxed">
            {t.booking.pageDesc}
          </p>
        </div>
      </section>

      <div className="py-6 sm:py-8 bg-bg min-h-[70vh] pb-28 lg:pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">

            {/* Main 1-Step Booking Form */}
            <div className="lg:col-span-8">
              <form
                id="booking-form"
                onSubmit={handleFormSubmit}
                noValidate
                aria-label={t.booking.pageTitle}
                className="space-y-6"
              >
                {/* Honeypot */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="booking-website">Website</label>
                  <input
                    id="booking-website"
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypotValue}
                    onChange={(e) => setHoneypotValue(e.target.value)}
                  />
                </div>

                {/* Error Banner */}
                {errorMessage && (
                  <div
                    role="alert"
                    aria-live="assertive"
                    className="p-4 rounded-2xl bg-error/10 border border-error/30 text-error-dark text-sm flex items-start gap-3 shadow-xs"
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

                {/* CARD 1: SELECT DATE & TIME */}
                <section
                  id="booking-schedule-section"
                  className="bg-surface rounded-3xl p-5 sm:p-8 border border-border shadow-soft"
                >
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-1">
                      {lang === 'en' ? '01 · DATE & TIME' : '01 · PILIH TANGGAL & JAM'}
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary">
                      {lang === 'en' ? 'Select your preferred date & time' : 'Tentukan tanggal & jam kunjungan'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-6 items-start">
                    {/* Calendar */}
                    <div className="bg-bg-alt/70 p-4 sm:p-5 rounded-2xl border border-border">
                      <div className="flex flex-wrap items-center gap-3 mb-4 text-[11px] text-text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-surface border border-border" />
                          {lang === 'en' ? 'Available' : 'Tersedia'}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="text-primary font-bold">{lang === 'en' ? 'Selected' : 'Dipilih'}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                          <span className="text-amber-700 font-semibold">{lang === 'en' ? 'Doctor Off' : 'Libur'}</span>
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <span className="font-heading font-bold text-base text-secondary">
                          {monthName} {viewYear}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border/60 text-text-muted transition-colors cursor-pointer"
                            aria-label={lang === 'en' ? 'Previous month' : 'Bulan sebelumnya'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                          <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-border/60 text-text-muted transition-colors cursor-pointer"
                            aria-label={lang === 'en' ? 'Next month' : 'Bulan berikutnya'}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-7 text-center text-xs font-bold text-text-muted mb-2">
                        <span>{lang === 'en' ? 'Mo' : 'Sn'}</span>
                        <span>{lang === 'en' ? 'Tu' : 'Sl'}</span>
                        <span>{lang === 'en' ? 'We' : 'Rb'}</span>
                        <span>{lang === 'en' ? 'Th' : 'Km'}</span>
                        <span>{lang === 'en' ? 'Fr' : 'Jm'}</span>
                        <span>{lang === 'en' ? 'Sa' : 'Sb'}</span>
                        <span>{lang === 'en' ? 'Su' : 'Mg'}</span>
                      </div>

                      <div className="grid grid-cols-7 gap-1.5 text-center auto-rows-[38px]">
                        {daysGrid.map((cell, idx) => {
                          if (!cell) return <div key={`empty-${idx}`} />;
                          const isSelected = selectedDate === cell.dateStr;
                          const clinicOff = clinicTimeOffs.find(
                            (to) => !to.doctorId && isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt),
                          );

                          let isDoctorOff = false;
                          let offReason = '';
                          if (selectedDoctorId && selectedDoctorId !== 'any') {
                            const doc = doctors.find((d) => d.id === selectedDoctorId);
                            const docOff = doc?.timeOffs?.find((to) =>
                              isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt),
                            );
                            if (clinicOff || docOff) {
                              isDoctorOff = true;
                              offReason = docOff?.reason || clinicOff?.reason || '';
                            }
                          } else {
                            const allDocsOff =
                              doctors.length > 0 &&
                              doctors.every((d) =>
                                (d.timeOffs || []).some((to) =>
                                  isDateOverlapping(cell.dateStr, to.startsAt, to.endsAt),
                                ),
                              );
                            if (clinicOff || allDocsOff) {
                              isDoctorOff = true;
                              offReason = clinicOff?.reason || '';
                            }
                          }

                          const isDisabled = cell.isPast || cell.isSunday || isDoctorOff;
                          let btnStyles =
                            'bg-surface text-secondary hover:bg-primary/10 border border-border cursor-pointer';
                          if (isDoctorOff) {
                            btnStyles = 'bg-amber-500/10 text-amber-800/60 border-amber-300/40 cursor-not-allowed';
                          } else if (isDisabled) {
                            btnStyles = 'bg-transparent text-text-muted/40 cursor-not-allowed opacity-40';
                          } else if (isSelected) {
                            btnStyles = 'bg-primary text-white font-bold border-primary ring-2 ring-primary/20';
                          }

                          return (
                            <button
                              key={cell.dateStr}
                              type="button"
                              disabled={isDisabled}
                              title={offReason || undefined}
                              onClick={() => handleSelectDate(cell.dateStr)}
                              className={`w-full h-full rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center ${btnStyles}`}
                            >
                              <span>{cell.dayNum}</span>
                              {isDoctorOff && <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <div className="mb-3">
                        <h3 className="font-heading text-base font-bold text-secondary">
                          {formatDateSummary(selectedDate, lang === 'en')}
                        </h3>
                        <p className="text-xs text-text-muted">
                          {lang === 'en'
                            ? 'Doctor will be assigned automatically by the clinic'
                            : 'Dokter akan dijadwalkan oleh klinik sesuai ketersediaan'}
                        </p>
                      </div>

                      {loadingSlots ? (
                        <div className="py-8 text-xs text-text-muted flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block" />
                          <span>{lang === 'en' ? 'Checking available time slots…' : 'Memeriksa slot jam tersedia…'}</span>
                        </div>
                      ) : visibleSlots.length > 0 ? (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                          {visibleSlots.map((slot) => {
                            const active = selectedTime === slot.time;
                            return (
                              <button
                                key={`${slot.doctorId}-${slot.time}`}
                                type="button"
                                onClick={() => handleSelectTime(slot.time)}
                                className={`px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tabular-nums transition-all cursor-pointer min-h-[44px] active:scale-95 ${
                                  active
                                    ? 'bg-primary text-white shadow-xs ring-2 ring-primary/30'
                                    : 'bg-bg-alt text-secondary border border-border hover:bg-primary hover:text-white'
                                }`}
                              >
                                {slot.time}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 rounded-2xl bg-bg-alt/70 border border-border text-xs text-text-muted space-y-2">
                          <p>{t.booking.noSlotsAvailable}</p>
                          <a
                            href={waAskLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline"
                          >
                            {t.booking.askViaWhatsApp} →
                          </a>
                        </div>
                      )}

                      {attemptedSubmit && !isTimeSelected && (
                        <p className="text-xs text-error-dark font-semibold mt-2">
                          {lang === 'en' ? 'Please select a time slot above.' : 'Silakan pilih salah satu jam di atas.'}
                        </p>
                      )}
                    </div>
                  </div>
                </section>

                {/* CARD 2: CONTACT & NOTE */}
                <section className="bg-surface rounded-3xl p-5 sm:p-8 border border-border shadow-soft">
                  <div className="mb-5">
                    <span className="text-xs uppercase tracking-widest font-bold text-accent block mb-1">
                      {lang === 'en' ? '02 · CONTACT & NOTE' : '02 · DATA KONTAK & CATATAN'}
                    </span>
                    <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary">
                      {t.booking.patientFormTitle}
                    </h2>
                    <p className="text-xs sm:text-sm text-text-muted mt-1">
                      {t.booking.patientFormDesc}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="patient-name" className="block text-xs font-bold text-secondary mb-1.5">
                        {t.booking.fullName} <span className="text-error-dark" aria-hidden="true">*</span>
                      </label>
                      <input
                        id="patient-name"
                        name="name"
                        type="text"
                        required
                        minLength={2}
                        maxLength={120}
                        autoComplete="name"
                        enterKeyHint="next"
                        placeholder={t.booking.fullNamePlaceholder}
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        aria-invalid={attemptedSubmit && !isNameValid}
                        aria-describedby={attemptedSubmit && !isNameValid ? 'patient-name-error' : undefined}
                        className={`w-full rounded-xl border px-4 py-3 text-sm bg-bg-alt/40 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                          attemptedSubmit && !isNameValid ? 'border-error' : 'border-border'
                        }`}
                      />
                      {attemptedSubmit && !isNameValid && (
                        <p id="patient-name-error" className="text-xs text-error-dark mt-1">
                          {t.booking.nameError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="patient-phone" className="block text-xs font-bold text-secondary mb-1.5">
                        {t.booking.phoneLabel}
                      </label>
                      <input
                        id="patient-phone"
                        name="phone"
                        type="tel"
                        inputMode="tel"
                        autoComplete="tel"
                        autoCorrect="off"
                        autoCapitalize="none"
                        spellCheck={false}
                        enterKeyHint="next"
                        placeholder={t.booking.phonePlaceholder}
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        aria-invalid={attemptedSubmit && !isPhoneValid}
                        aria-describedby="patient-phone-hint"
                        className={`w-full rounded-xl border px-4 py-3 text-sm bg-bg-alt/40 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary ${
                          attemptedSubmit && !isPhoneValid ? 'border-error' : 'border-border'
                        }`}
                      />
                      <p id="patient-phone-hint" className="text-[11px] text-text-muted mt-1">
                        {attemptedSubmit && !isPhoneValid
                          ? (phoneCheck.error || t.booking.phoneError)
                          : t.booking.phoneHint}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="patient-note" className="block text-xs font-bold text-secondary mb-1.5">
                      {t.booking.complaintLabel}
                    </label>
                    <textarea
                      id="patient-note"
                      name="complaint"
                      rows={3}
                      maxLength={500}
                      placeholder={t.booking.complaintPlaceholder}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full rounded-xl border border-border px-4 py-3 text-sm bg-bg-alt/40 text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                    />
                  </div>
                </section>
              </form>
            </div>

            {/* Sticky Summary Sidebar */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-4">
              <div className="bg-surface rounded-3xl p-6 border border-border shadow-soft">
                <h2 className="font-heading text-lg font-bold text-secondary mb-4 pb-3 border-b border-border/80">
                  {t.booking.summaryTitle}
                </h2>

                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t.booking.selectedService}</dt>
                    <dd className="font-semibold text-secondary text-right">
                      {currentService ? (lang === 'en' ? currentService.nameEn : currentService.name) : '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t.booking.selectedDate}</dt>
                    <dd className="font-semibold text-secondary text-right">
                      {selectedDate ? formatDateSummary(selectedDate, lang === 'en') : '—'}
                    </dd>
                  </div>

                  <div className="flex justify-between gap-3">
                    <dt className="text-text-muted">{t.booking.selectedSlot}</dt>
                    <dd className="font-bold text-primary text-right">
                      {selectedTime ? `${selectedTime} WIB` : '—'}
                    </dd>
                  </div>

                  {note.trim() && (
                    <div className="pt-2 border-t border-border/60">
                      <dt className="text-xs text-text-muted mb-1">{lang === 'en' ? 'Note' : 'Catatan'}</dt>
                      <dd className="text-xs text-secondary bg-bg-alt/60 p-2.5 rounded-xl border border-border/60">
                        {note.trim()}
                      </dd>
                    </div>
                  )}
                </dl>

                <button
                  type="submit"
                  form="booking-form"
                  disabled={isSubmitting}
                  className="btn-whatsapp w-full mt-6 py-3.5 rounded-xl text-sm font-bold justify-center shadow-soft min-h-[48px] cursor-pointer active:scale-[0.98]"
                >
                  {isSubmitting ? t.booking.submitting : t.booking.submitBtn}
                </button>

                <div className="mt-4 pt-4 border-t border-border/70 text-center space-y-2">
                  <Link
                    to={localePath('/booking/kelola')}
                    className="block text-xs font-semibold text-primary hover:underline"
                  >
                    {lang === 'en' ? 'Already have a booking code? Manage booking →' : 'Sudah punya kode booking? Kelola jadwal →'}
                  </Link>
                  <a
                    href={waAskLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-text-muted hover:text-secondary"
                  >
                    {t.booking.needHelpBooking}
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Submit Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-between gap-3 max-w-xl mx-auto">
          <div className="min-w-0">
            <div className="text-xs font-bold text-secondary truncate">
              {currentService ? (lang === 'en' ? currentService.nameEn : currentService.name) : t.booking.summaryTitle}
            </div>
            <div className="text-[11px] text-primary font-semibold truncate">
              {selectedDate ? formatDateSummary(selectedDate, lang === 'en') : ''}
              {selectedTime ? ` · ${selectedTime} WIB` : ''}
            </div>
          </div>
          <button
            type="submit"
            form="booking-form"
            disabled={isSubmitting}
            className="btn-whatsapp px-4 py-3 rounded-xl text-xs font-bold shrink-0 min-h-[44px] cursor-pointer"
          >
            {isSubmitting ? t.booking.submitting : (lang === 'en' ? 'Book via WA' : 'Pesan via WA')}
          </button>
        </div>
      </div>
    </>
  );
};

export default BookingPage;
