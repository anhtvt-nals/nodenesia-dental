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

      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Layanan Pasien Mandiri
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#14201C] tracking-tight mb-2">
              {t.manageBooking.pageTitle}
            </h1>
            <p className="text-sm font-sans text-[#14201C]/75">
              {t.manageBooking.pageDesc}
            </p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="mb-8 p-6 hairline-border bg-[#F4F1EA]">
            <h2 className="font-serif text-xl text-[#14201C] mb-2">
              {t.manageBooking.inputCodeTitle}
            </h2>
            <p className="text-xs font-mono text-[#14201C]/60 mb-4">
              {t.manageBooking.inputCodeDesc}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder={t.manageBooking.codePlaceholder}
                className="flex-1 p-3 text-sm font-mono hairline-border bg-[#F4F1EA] uppercase tracking-wider focus:outline-none"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
              >
                {t.manageBooking.searchBtn}
              </button>
            </div>
          </form>

          {/* Feedback Message */}
          {actionMessage && (
            <div
              role="alert"
              className={`p-4 mb-8 text-xs font-mono hairline-border ${
                actionMessage.type === 'success'
                  ? 'bg-[#1F3D36]/10 text-[#1F3D36] border-[#1F3D36]/30'
                  : 'bg-[#C8553D]/10 text-[#C8553D] border-[#C8553D]/30'
              }`}
            >
              {actionMessage.text}
            </div>
          )}

          {isLoading ? (
            <div className="p-16 text-center font-mono text-xs text-[#14201C]/60">
              {t.common.loading}
            </div>
          ) : booking ? (
            <div className="hairline-border bg-[#F4F1EA] p-6 md:p-8 space-y-6">
              {/* Header Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 hairline-b">
                <div>
                  <span className="font-mono text-xs uppercase tracking-wider text-[#14201C]/60 block mb-1">
                    Kode Reservasi
                  </span>
                  <div className="font-mono text-3xl font-semibold text-[#14201C]">
                    {booking.code}
                  </div>
                </div>

                <div className="sm:text-right">
                  <span className="font-mono text-xs text-[#14201C]/60 block mb-1">
                    {t.manageBooking.statusLabel}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-mono font-semibold uppercase hairline-border ${
                      booking.status === 'confirmed'
                        ? 'bg-[#1F3D36]/10 text-[#1F3D36] border-[#1F3D36]/30'
                        : booking.status === 'cancelled'
                        ? 'bg-[#C8553D]/10 text-[#C8553D] border-[#C8553D]/30'
                        : 'bg-[#E9E4D8] text-[#14201C]'
                    }`}
                  >
                    {t.manageBooking.statusMap[booking.status] || booking.status}
                  </span>
                </div>
              </div>

              {/* Booking Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
                <div className="p-4 bg-[#E9E4D8]/40 hairline-border">
                  <span className="text-[#14201C]/60 block mb-1">Nama Pasien:</span>
                  <span className="font-sans font-medium text-sm text-[#14201C]">{booking.patient.name}</span>
                </div>
                <div className="p-4 bg-[#E9E4D8]/40 hairline-border">
                  <span className="text-[#14201C]/60 block mb-1">Nomor WhatsApp:</span>
                  <span className="font-medium text-sm text-[#14201C]">{formatPhoneDisplay(booking.patient.phone)}</span>
                </div>
                <div className="p-4 bg-[#E9E4D8]/40 hairline-border">
                  <span className="text-[#14201C]/60 block mb-1">Layanan Gigi:</span>
                  <span className="font-sans font-medium text-sm text-[#14201C]">{serviceName}</span>
                </div>
                <div className="p-4 bg-[#E9E4D8]/40 hairline-border">
                  <span className="text-[#14201C]/60 block mb-1">Dokter Spesialis:</span>
                  <span className="font-sans font-medium text-sm text-[#14201C]">{doctorName}</span>
                </div>
                <div className="p-4 bg-[#E9E4D8]/40 hairline-border sm:col-span-2">
                  <span className="text-[#14201C]/60 block mb-1">Waktu Janji Temu:</span>
                  <span className="font-semibold text-base text-[#1F3D36]">
                    {booking.startsAt.split('T')[0]} · {booking.startsAt.split('T')[1]?.slice(0, 5)} WIB
                  </span>
                </div>
              </div>

              {/* Action Buttons (Only if active) */}
              {booking.status === 'confirmed' && (
                <div className="pt-6 hairline-t flex flex-wrap gap-4">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(!isRescheduling)}
                    className="px-5 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors"
                  >
                    {isRescheduling ? 'Tutup Pilihan Jadwal' : t.manageBooking.rescheduleBtn}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    className="px-5 py-2.5 hairline-border border-[#C8553D]/40 text-[#C8553D] text-xs font-mono uppercase tracking-wider hover:bg-[#C8553D]/10 transition-colors"
                  >
                    {t.manageBooking.cancelBookingBtn}
                  </button>
                </div>
              )}

              {/* Reschedule Interface */}
              {isRescheduling && (
                <div className="mt-6 p-6 bg-[#E9E4D8]/50 hairline-border">
                  <h3 className="font-serif text-xl text-[#14201C] mb-2">
                    {t.manageBooking.rescheduleTitle}
                  </h3>
                  <p className="text-xs font-mono text-[#14201C]/60 mb-4">
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
                      className="px-6 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider hover:bg-[#162B26] transition-colors disabled:opacity-50"
                    >
                      {isProcessingAction ? 'Menyimpan...' : t.manageBooking.saveRescheduleBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-4 py-2.5 hairline-border bg-[#E9E4D8] text-xs font-mono text-[#14201C]"
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
              className="fixed inset-0 z-50 flex items-center justify-center bg-[#14201C]/60 p-4"
            >
              <div className="w-full max-w-md bg-[#F4F1EA] hairline-border p-6 shadow-2xl">
                <h3 className="font-serif text-2xl text-[#14201C] mb-2">
                  {t.manageBooking.confirmCancelTitle}
                </h3>
                <p className="text-sm font-sans text-[#14201C]/75 mb-6 leading-relaxed">
                  {t.manageBooking.confirmCancelDesc}
                </p>
                <div className="flex items-center justify-end gap-3 font-mono text-xs">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2.5 hairline-border bg-[#E9E4D8] text-[#14201C]"
                  >
                    {t.manageBooking.keepBookingAction}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={handleCancel}
                    className="px-5 py-2.5 bg-[#C8553D] text-[#F4F1EA] uppercase tracking-wider hover:bg-[#a6432e] disabled:opacity-50"
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
