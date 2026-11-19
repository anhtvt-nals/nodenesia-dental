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
import { buildWhatsAppLink, formatPhoneDisplay } from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';

export const ManageBookingPage: React.FC = () => {
  const { code: urlCode } = useParams<{ code?: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const navigate = useNavigate();
  const settings = useClinicSettings();

  const { lang, t, localePath } = useI18n();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [managementToken, setManagementToken] = useState<string | undefined>(token);
  const [verificationPhone, setVerificationPhone] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);

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
    const code = codeToSearch.trim().toUpperCase();
    const effectiveToken = token || managementToken || (typeof window !== 'undefined' ? localStorage.getItem(`booking_token_${code}`) || undefined : undefined);
    if (effectiveToken && !managementToken) setManagementToken(effectiveToken);

    try {
      const b = await getBooking(code, effectiveToken, verificationPhone || undefined);
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
    const cleanCode = inputCode.trim().toUpperCase();
    const effectiveToken = token || (typeof window !== 'undefined' ? localStorage.getItem(`booking_token_${cleanCode}`) || undefined : undefined);
    navigate(localePath(`/booking/kelola/${cleanCode}${effectiveToken ? `?token=${encodeURIComponent(effectiveToken)}` : ''}`));
    loadBookingData(cleanCode);
  };

  const handleVerifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!booking || !phoneInput.trim()) return;
    setIsVerifying(true);
    try {
      const b = await getBooking(booking.code, undefined, phoneInput.trim());
      if (b && b.canManage) {
        setBooking(b);
        setVerificationPhone(phoneInput.trim());
        setActionMessage({
          type: 'success',
          text: lang === 'en'
            ? 'Verification successful! You can now manage your appointment.'
            : 'Verifikasi berhasil! Anda sekarang dapat mengubah jadwal atau membatalkan janji temu.',
        });
      } else {
        setActionMessage({
          type: 'error',
          text: lang === 'en'
            ? 'Phone number does not match this booking record.'
            : 'Nomor telepon tidak sesuai dengan data reservasi janji temu ini.',
        });
      }
    } catch (err: any) {
      setActionMessage({
        type: 'error',
        text: err.message || (lang === 'en' ? 'Verification failed' : 'Verifikasi gagal'),
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCancel = async () => {
    if (!booking) return;
    setIsProcessingAction(true);
    try {
      const activeToken = managementToken || (typeof window !== 'undefined' ? localStorage.getItem(`booking_token_${booking.code}`) || undefined : undefined);
      const updated = await cancelBooking(booking.code, activeToken, verificationPhone || undefined);
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
      const activeToken = managementToken || (typeof window !== 'undefined' ? localStorage.getItem(`booking_token_${booking.code}`) || undefined : undefined);
      const updated = await rescheduleBooking(booking.code, {
        newDate: rescheduleDate,
        newTime: rescheduleTime,
        token: activeToken,
        phone: verificationPhone || undefined,
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
                className="form-input flex-1 uppercase tracking-widest font-mono font-bold text-base h-12 min-h-[48px]"
              />
              <button
                type="submit"
                className="btn-primary px-7 py-3 justify-center cursor-pointer shrink-0 min-h-[48px] flex items-center active:scale-[0.98]"
              >
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
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
                        : booking.status === 'pending'
                        ? 'bg-amber-500/15 text-amber-800 border border-amber-400/30'
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

              {booking.status === 'pending' && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
                  <span className="text-lg leading-none">⏳</span>
                  <div className="leading-relaxed">
                    <strong>{lang === 'en' ? 'Awaiting Clinic Confirmation: ' : 'Menunggu Konfirmasi Klinik: '}</strong>
                    {lang === 'en'
                      ? 'Your reservation has been received and is currently being reviewed by our clinic receptionist. You will receive an official confirmation via WhatsApp shortly.'
                      : 'Reservasi Anda telah kami terima dan sedang ditinjau oleh staf resepsionis klinik kami. Anda akan menerima pesan konfirmasi resmi melalui WhatsApp dalam 15-30 menit.'}
                  </div>
                </div>
              )}

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
              {['pending', 'confirmed'].includes(booking.status) && (
                <div className="pt-6 border-t border-border">
                  {booking.canManage ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => setIsRescheduling(!isRescheduling)}
                        className="btn-primary text-sm py-3 px-6 cursor-pointer min-h-[48px] justify-center flex items-center active:scale-[0.98]"
                      >
                        {isRescheduling
                          ? (lang === 'en' ? 'Close Schedule Picker' : 'Tutup Pilihan Jadwal')
                          : t.manageBooking.rescheduleBtn}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-5 py-3 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-sm font-semibold transition-colors cursor-pointer min-h-[48px] justify-center flex items-center active:scale-[0.98]"
                      >
                        {t.manageBooking.cancelBookingBtn}
                      </button>
                    </div>
                  ) : (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-400/30">
                      <h4 className="font-heading font-bold text-secondary mb-1">
                        {lang === 'en' ? 'Online Reschedule & Cancellation' : 'Ubah Jadwal & Pembatalan Mandiri'}
                      </h4>
                      <p className="text-xs text-text-muted mb-4 leading-relaxed">
                        {lang === 'en'
                          ? 'To reschedule or cancel this reservation online, enter your registered phone number below, or reach our reception team directly on WhatsApp.'
                          : 'Untuk mengubah jadwal atau membatalkan reservasi ini secara online, masukkan nomor telepon yang Anda daftarkan, atau hubungi resepsionis via WhatsApp.'}
                      </p>
                      <form onSubmit={handleVerifyPhone} className="flex flex-col sm:flex-row gap-2.5 mb-3">
                        <input
                          type="tel"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          placeholder={lang === 'en' ? 'e.g. 081234567890' : 'Contoh: 081234567890'}
                          className="form-input flex-1 text-base sm:text-sm font-mono h-12 min-h-[48px]"
                        />
                        <button
                          type="submit"
                          disabled={isVerifying || !phoneInput.trim()}
                          className="btn-primary text-xs sm:text-sm py-2.5 px-5 justify-center cursor-pointer disabled:opacity-50 min-h-[48px] flex items-center active:scale-[0.98]"
                        >
                          {isVerifying
                            ? (lang === 'en' ? 'Verifying...' : 'Memverifikasi...')
                            : (lang === 'en' ? 'Verify & Unlock' : 'Verifikasi & Buka Akses')}
                        </button>
                      </form>
                      <a
                        href={buildWhatsAppLink(
                          settings.whatsappNumber,
                          `Halo ${settings.name || 'Klinik Gigi Senyum Sehat'}, saya ingin mengonfirmasi / mengubah jadwal reservasi saya (Kode: ${booking.code}). Mohon bantuannya. Terima kasih!`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-whatsapp text-xs sm:text-sm py-3 px-4 justify-center min-h-[48px] flex items-center active:scale-[0.98]"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                        </svg>
                        <span>{lang === 'en' ? 'Contact Clinic via WhatsApp' : 'Hubungi Resepsionis via WhatsApp'}</span>
                      </a>
                    </div>
                  )}
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

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <button
                      type="button"
                      disabled={!rescheduleTime || isProcessingAction}
                      onClick={handleSaveReschedule}
                      className="btn-primary text-sm py-3.5 px-6 disabled:opacity-50 cursor-pointer min-h-[48px] justify-center flex items-center active:scale-[0.98]"
                    >
                      {isProcessingAction
                        ? (lang === 'en' ? 'Saving...' : 'Menyimpan...')
                        : t.manageBooking.saveRescheduleBtn}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsRescheduling(false)}
                      className="px-5 py-3 rounded-xl border border-border bg-surface text-sm font-semibold text-secondary hover:bg-bg transition-colors cursor-pointer min-h-[48px] justify-center flex items-center active:scale-[0.98]"
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
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-3 rounded-xl border border-border bg-bg-alt font-semibold text-secondary hover:bg-border/50 transition-colors cursor-pointer min-h-[48px] flex items-center justify-center active:scale-[0.98]"
                  >
                    {t.manageBooking.keepBookingAction}
                  </button>
                  <button
                    type="button"
                    disabled={isProcessingAction}
                    onClick={handleCancel}
                    className="px-5 py-3 rounded-xl bg-rose-600 text-white hover:bg-rose-700 font-semibold transition-colors disabled:opacity-50 cursor-pointer min-h-[48px] flex items-center justify-center active:scale-[0.98]"
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
