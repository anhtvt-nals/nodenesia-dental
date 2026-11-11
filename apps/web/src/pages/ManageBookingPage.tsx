import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useI18n } from '../i18n';
import {
  getBooking,
  cancelBooking,
  rescheduleBooking,
  getService,
  getDoctor,
  getSlots,
} from '../lib/api';
import { Booking, Service, Doctor, BookingSlot } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { DateStrip } from '../components/common/DateStrip';
import { SlotPicker } from '../components/common/SlotPicker';
import { formatPhoneDisplay } from '../lib/utils';

export const ManageBookingPage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const navigate = useNavigate();

  const { lang, t, localePath } = useI18n();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reschedule state
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [rescheduleSlots, setRescheduleSlots] = useState<BookingSlot[]>([]);
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  const loadBookingData = async (codeToSearch: string) => {
    setIsLoading(true);
    setActionMessage(null);
    try {
      const b = await getBooking(codeToSearch, token);
      if (b) {
        setBooking(b);
        const [s, d] = await Promise.all([
          getService(b.serviceId),
          b.doctorId && b.doctorId !== 'any' ? getDoctor(b.doctorId) : null,
        ]);
        setService(s);
        setDoctor(d);

        // Prep default reschedule date
        const nextDay = new Date();
        nextDay.setDate(nextDay.getDate() + 2);
        if (nextDay.getDay() === 0) nextDay.setDate(nextDay.getDate() + 1);
        setRescheduleDate(nextDay.toISOString().split('T')[0]);
      } else {
        setBooking(null);
        setActionMessage({ type: 'error', text: t.manageBooking.bookingNotFound });
      }
    } catch {
      setBooking(null);
      setActionMessage({ type: 'error', text: t.manageBooking.bookingNotFound });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (urlCode) loadBookingData(urlCode);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlCode]);

  // Load slots for reschedule
  useEffect(() => {
    async function loadReschedSlots() {
      if (!isRescheduling || !booking || !rescheduleDate) return;
      setLoadingRescheduleSlots(true);
      try {
        const s = await getSlots({
          serviceId: booking.serviceId,
          doctorId: booking.doctorId,
          date: rescheduleDate,
        });
        setRescheduleSlots(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingRescheduleSlots(false);
      }
    }
    loadReschedSlots();
  }, [isRescheduling, rescheduleDate, booking]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;
    navigate(localePath(`/booking/kelola/${inputCode.trim().toUpperCase()}${token ? `?token=${encodeURIComponent(token)}` : ''}`));
    loadBookingData(inputCode.trim());
  };

  const handleCancel = async () => {
    if (!booking) return;
    setIsProcessingAction(true);
    try {
      const updated = await cancelBooking(booking.code, token);
      setBooking(updated);
      setShowCancelModal(false);
      setActionMessage({ type: 'success', text: t.manageBooking.cancelSuccess });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal membatalkan booking' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const handleSaveReschedule = async () => {
    if (!booking || !rescheduleDate || !rescheduleTime) return;
    setIsProcessingAction(true);
    try {
      const updated = await rescheduleBooking(booking.code, {
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        token,
      });
      setBooking(updated);
      setIsRescheduling(false);
      setActionMessage({ type: 'success', text: t.manageBooking.rescheduleSuccess });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Gagal mengubah jadwal' });
    } finally {
      setIsProcessingAction(false);
    }
  };

  const serviceName = service ? (lang === 'en' ? service.nameEn : service.name) : booking?.serviceId;
  const doctorName = doctor ? doctor.name : (lang === 'en' ? 'Any Available Specialist' : 'Dokter mana saja');

  return (
    <>
      <AppHelmet
        title={t.manageBooking.pageTitle}
        description={t.manageBooking.pageDesc}
        path={`/booking/kelola/${urlCode || ''}`}
      />

      <PageHeader title={t.manageBooking.pageTitle} description={t.manageBooking.pageDesc} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Search Form Card */}
          <form onSubmit={handleSearch} className="mb-8 p-6 sm:p-8 rounded-2xl bg-surface border border-border shadow-card">
            <label htmlFor="booking-code-search" className="font-heading text-xl sm:text-2xl font-bold text-secondary block mb-1.5">
              {t.manageBooking.inputCodeTitle}
            </label>
            <p className="text-sm text-text-muted mb-5 leading-relaxed">
              {t.manageBooking.inputCodeDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="booking-code-search"
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={t.manageBooking.codePlaceholder}
                className="form-input flex-1 uppercase tracking-widest font-mono font-bold text-base"
              />
              <button
                type="submit"
                className="btn-primary px-7 py-3 justify-center cursor-pointer shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <span>{t.manageBooking.searchBtn}</span>
              </button>
            </div>
          </form>

          {/* Feedback Message */}
          {actionMessage && (
            <div
              role="alert"
              className={`p-4 mb-8 text-sm font-medium rounded-xl border flex items-center gap-3 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                  : 'bg-rose-50 text-rose-900 border-rose-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full shrink-0 bg-current" />
              <span>{actionMessage.text}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-3" />
              <span>{t.common.loading}</span>
            </div>
          ) : booking ? (
            <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-8 space-y-6">
              {/* Header Status Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-text-muted block mb-1">
                    {lang === 'en' ? 'Reservation Code' : 'Kode Reservasi'}
                  </span>
                  <div className="font-heading text-3xl font-extrabold tracking-wider text-primary">
                    {booking.code}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-medium text-text-muted block mb-1">
                    {t.manageBooking.statusLabel}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-400/30'
                        : booking.status === 'cancelled'
                        ? 'bg-rose-500/15 text-rose-800 border border-rose-400/30'
                        : 'bg-bg-alt text-secondary border border-border'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{t.manageBooking.statusMap[booking.status] || booking.status}</span>
                  </span>
                </div>
              </div>

              {/* Booking Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Patient Name' : 'Nama Pasien'}
                  </span>
                  <span className="font-semibold text-text text-base">{booking.patient.name}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'WhatsApp Number' : 'Nomor WhatsApp'}
                  </span>
                  <span className="font-semibold text-text text-base">{formatPhoneDisplay(booking.patient.phone)}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Treatment / Service' : 'Layanan Gigi'}
                  </span>
                  <span className="font-semibold text-text text-base">{serviceName}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Specialist' : 'Dokter Spesialis'}
                  </span>
                  <span className="font-semibold text-text text-base">{doctorName}</span>
                </div>
                <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                    {lang === 'en' ? 'Scheduled Appointment Time' : 'Waktu Janji Temu Terjadwal'}
                  </span>
                  <span className="font-heading font-bold text-xl sm:text-2xl text-primary">
                    {booking.startsAt.split('T')[0]} · {booking.startsAt.split('T')[1]?.slice(0, 5)} WIB
                  </span>
                </div>
              </div>

              {/* Action Buttons (Only if active) */}
              {booking.status === 'confirmed' && (
                <div className="pt-6 border-t border-border flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="btn-primary text-sm py-3 px-6 cursor-pointer"
                  >
                    {isRescheduling
                      ? (lang === 'en' ? 'Close Schedule Picker' : 'Tutup Pilihan Jadwal')
                      : t.manageBooking.rescheduleBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-5 py-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-semibold transition-colors cursor-pointer"
                  >
                    {t.manageBooking.cancelBookingBtn}
                  </button>
                </div>
              )}

              {/* Reschedule Interface */}
              {isRescheduling && (
                <div className="mt-6 p-6 sm:p-7 rounded-2xl bg-bg-alt border border-border">
                  <h3 className="font-heading text-xl font-bold text-secondary mb-1.5">
                    {t.manageBooking.rescheduleTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mb-5">
                    {lang === 'en'
                      ? 'Select a new date (within next 14 days) and available time slot:'
                      : 'Pilih tanggal baru (14 hari ke depan) dan jam yang masih tersedia:'}
                  </p>

                  <div className="mb-6">
                    <DateStrip
                      selectedDate={rescheduleDate}
                      onSelectDate={(d) => {
                        setRescheduleDate(d);
                        setRescheduleTime('');
                      }}
                    />
                  </div>

                  <div className="mb-6">
                    <SlotPicker
                      slots={rescheduleSlots}
                      selectedSlot={rescheduleTime}
                      onSelectSlot={(slot) => setRescheduleTime(slot)}
                      isLoading={loadingRescheduleSlots}
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={!rescheduleTime || isProcessingAction}
                      onClick={handleSaveReschedule}
                      className="btn-primary text-sm py-3 px-6 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingAction
                        ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
                        : t.manageBooking.saveRescheduleBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-5 py-3 rounded-xl border border-border bg-surface text-sm font-semibold text-secondary hover:bg-bg transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Cancel' : 'Batal'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}

          {/* Cancellation Confirmation Modal */}
          {showCancelModal && (
            <div
              role="dialog"
              aria-modal="true"
              className="fixed inset-0 z-50 flex items-center justify-center bg-secondary/60 backdrop-blur-sm p-4"
            >
              <div className="w-full max-w-md bg-surface rounded-2xl border border-border p-6 sm:p-7 shadow-floating animate-scale-in">
                <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="font-heading text-xl font-bold text-secondary mb-2">
                  {t.manageBooking.confirmCancelTitle}
                </h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                  {t.manageBooking.confirmCancelDesc}
                </p>
                <div className="flex items-center justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-bg-alt font-semibold text-secondary hover:bg-border/50 transition-colors cursor-pointer"
                  >
                    {t.manageBooking.keepBookingAction}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={handleCancel}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingAction
                      ? (lang === 'en' ? 'Processing...' : 'Memproses...')
                      : t.manageBooking.confirmCancelAction}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
