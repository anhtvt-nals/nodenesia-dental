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

      <div className="py-12 md:py-16 bg-gradient-to-b from-bg to-bg-alt">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="badge badge-primary mb-3">
              {lang === 'en' ? 'Self-Service Patient Portal' : 'Layanan Pasien Mandiri'}
            </span>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-2">
              {t.manageBooking.pageTitle}
            </h1>
            <p className="text-base text-text-muted">
              {t.manageBooking.pageDesc}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8 p-6 sm:p-8 trust-card bg-bg-card">
            <label htmlFor="booking-code-search" className="font-heading text-xl font-bold text-text block mb-1.5">
              {t.manageBooking.inputCodeTitle}
            </label>
            <p className="text-sm text-text-muted mb-5">
              {t.manageBooking.inputCodeDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                id="booking-code-search"
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={t.manageBooking.codePlaceholder}
                className="form-input flex-1 uppercase tracking-wider font-semibold"
              />
              <button
                type="submit"
                className="btn-primary px-6 py-3 justify-center cursor-pointer"
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
              className={`p-4 mb-8 text-sm font-medium rounded-xl border ${
                actionMessage.type === 'success'
                  ? 'bg-success/10 text-success-dark border-success/30'
                  : 'bg-error/10 text-error-dark border-error/30'
              }`}
            >
              {actionMessage.text}
            </div>
          )}

          {isLoading ? (
            <div className="p-16 text-center text-sm font-medium text-text-muted">
              {t.common.loading}
            </div>
          ) : booking ? (
            <div className="trust-card bg-bg-card p-6 md:p-8 space-y-6">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-text-muted block mb-1">
                    Kode Reservasi
                  </span>
                  <div className="font-heading text-3xl font-extrabold text-primary">
                    {booking.code}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="text-xs font-medium text-text-muted block mb-1">
                    {t.manageBooking.statusLabel}
                  </span>
                  <span
                    className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold uppercase ${
                      booking.status === 'confirmed'
                        ? 'badge-success'
                        : booking.status === 'cancelled'
                        ? 'bg-error/15 text-error-dark'
                        : 'bg-bg-alt text-text'
                    }`}
                  >
                    {t.manageBooking.statusMap[booking.status] || booking.status}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 rounded-xl bg-bg-alt border border-border">
                  <span className="text-xs text-text-muted block mb-1">Nama Pasien:</span>
                  <span className="font-semibold text-text">{booking.patient.name}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt border border-border">
                  <span className="text-xs text-text-muted block mb-1">Nomor WhatsApp:</span>
                  <span className="font-semibold text-text">{formatPhoneDisplay(booking.patient.phone)}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt border border-border">
                  <span className="text-xs text-text-muted block mb-1">Layanan Gigi:</span>
                  <span className="font-semibold text-text">{serviceName}</span>
                </div>
                <div className="p-4 rounded-xl bg-bg-alt border border-border">
                  <span className="text-xs text-text-muted block mb-1">Dokter Spesialis:</span>
                  <span className="font-semibold text-text">{doctorName}</span>
                </div>
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 sm:col-span-2">
                  <span className="text-xs text-text-muted block mb-1">Waktu Janji Temu:</span>
                  <span className="font-heading font-bold text-lg text-primary">
                    {booking.startsAt.split('T')[0]} · {booking.startsAt.split('T')[1]?.slice(0, 5)} WIB
                  </span>
                </div>
              </div>

              {/* Action Buttons (Only if active) */}
              {booking.status === 'confirmed' && (
                <div className="pt-6 border-t border-border flex flex-wrap gap-3.5">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="btn-primary text-sm py-2.5 px-5 cursor-pointer"
                  >
                    {isRescheduling ? 'Tutup Pilihan Jadwal' : t.manageBooking.rescheduleBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-5 py-2.5 rounded-xl border border-error/40 text-error-dark text-sm font-semibold hover:bg-error/10 transition-colors cursor-pointer"
                  >
                    {t.manageBooking.cancelBookingBtn}
                  </button>
                </div>
              )}

              {/* Reschedule Interface */}
              {isRescheduling && (
                <div className="mt-6 p-6 rounded-xl bg-bg-alt border border-border">
                  <h3 className="font-heading text-xl font-bold text-text mb-1.5">
                    {t.manageBooking.rescheduleTitle}
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted mb-5">
                    Pilih tanggal baru (14 hari ke depan) dan jam yang masih tersedia
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
                      className="btn-primary text-sm py-2.5 px-6 disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessingAction ? 'Menyimpan...' : t.manageBooking.saveRescheduleBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-4 py-2.5 rounded-xl border border-border bg-bg-card text-sm font-semibold text-text hover:bg-bg transition-colors cursor-pointer"
                    >
                      Batal
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-bg-dark/60 backdrop-blur-xs p-4"
            >
              <div className="w-full max-w-md bg-bg-card rounded-2xl border border-border p-6 shadow-xl">
                <h3 className="font-heading text-xl font-bold text-text mb-2">
                  {t.manageBooking.confirmCancelTitle}
                </h3>
                <p className="text-sm text-text-muted mb-6 leading-relaxed">
                  {t.manageBooking.confirmCancelDesc}
                </p>
                <div className="flex items-center justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2.5 rounded-xl border border-border bg-bg-alt font-semibold text-text hover:bg-border/50 transition-colors cursor-pointer"
                  >
                    {t.manageBooking.keepBookingAction}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={handleCancel}
                    className="btn-emergency py-2.5 px-5 disabled:opacity-50 cursor-pointer"
                  >
                    {isProcessingAction ? 'Memproses...' : t.manageBooking.confirmCancelAction}
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
