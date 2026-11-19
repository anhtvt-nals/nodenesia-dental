import { PageHeader } from '../components/common/PageHeader';
import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getBooking, getService, getDoctor } from '../lib/api';
import { Booking, Service, Doctor } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { buildWhatsAppLink, formatPhoneDisplay, formatDateSummary } from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';

export const BookingSuccessPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();
  const bookingToken = token || (typeof window !== 'undefined' && code ? localStorage.getItem(`booking_token_${code}`) || undefined : undefined);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!code) return;
      const b = await getBooking(code, bookingToken);
      setBooking(b);
      if (b) {
        const [s, d] = await Promise.all([
          getService(b.serviceId),
          b.doctorId && b.doctorId !== 'any' ? getDoctor(b.doctorId) : null,
        ]);
        setService(s);
        setDoctor(d);
      }
      setLoading(false);
    }
    load();
  }, [bookingToken, code]);

  useEffect(() => {
    if (!code || !bookingToken || booking?.status === 'confirmed') return;

    const params = new URLSearchParams({ token: bookingToken });
    const source = new EventSource(`/api/v1/public/bookings/${encodeURIComponent(code)}/status/stream?${params.toString()}`);
    const onStatus = (event: MessageEvent<string>) => {
      try {
        const next = JSON.parse(event.data) as { code?: string; status?: Booking['status'] };
        if (next.code !== code || !next.status) return;
        setBooking((current) => current ? { ...current, status: next.status } : current);
        if (next.status === 'confirmed') source.close();
      } catch {
        // Ignore malformed stream messages; EventSource will reconnect when necessary.
      }
    };
    source.addEventListener('status', onStatus as EventListener);
    return () => source.close();
  }, [booking?.status, bookingToken, code]);

  const downloadIcsCalendar = () => {
    if (!booking) return;
    const startIso = booking.startsAt.includes('Z') ? booking.startsAt : `${booking.startsAt}+07:00`;
    const endIso = booking.endsAt.includes('Z') ? booking.endsAt : `${booking.endsAt}+07:00`;
    const startUtc = new Date(startIso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endUtc = new Date(endIso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const nowUtc = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    const sName = service ? (lang === 'en' ? service.nameEn : service.name) : booking.serviceId;
    const dName = doctor ? doctor.name : (lang === 'en' ? 'Dental Specialist' : 'Dokter Gigi Spesialis');

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Klinik Gigi Senyum Sehat//Booking//ID',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${booking.code}@klinikgigisenyumsehat.com`,
      `DTSTAMP:${nowUtc}`,
      `DTSTART:${startUtc}`,
      `DTEND:${endUtc}`,
      `SUMMARY:Janji Temu: ${sName} - ${settings.name || 'Klinik Gigi Senyum Sehat'}`,
      `DESCRIPTION:Kode Reservasi: ${booking.code}\\nDokter: ${dName}\\nPasien: ${booking.patient.name}\\nStatus: Menunggu Konfirmasi`,
      `LOCATION:${settings.address || 'Jakarta'}, ${settings.city || 'Indonesia'}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reservasi-${booking.code}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin mb-4" />
        <p className="text-sm font-medium text-text-muted">{t.common.loading}</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="bg-surface rounded-2xl border border-border p-8 sm:p-10 shadow-card">
          <div className="w-14 h-14 rounded-full bg-accent-light/50 text-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
            </svg>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-secondary mb-3">
            {lang === 'en' ? 'Reservation Record Not Found' : 'Data Reservasi Tidak Ditemukan'}
          </h1>
          <p className="text-sm text-text-muted mb-6 leading-relaxed">
            {lang === 'en'
              ? `Booking code "${code}" is not registered in our system.`
              : `Kode booking "${code}" tidak terdaftar dalam sistem.`}
          </p>
          <Link
            to={localePath('/booking')}
            className="btn-primary text-sm cursor-pointer"
          >
            {lang === 'en' ? 'Book New Appointment' : 'Buat Janji Baru'}
          </Link>
        </div>
      </div>
    );
  }

  const serviceName = service ? (lang === 'en' ? service.nameEn : service.name) : booking.serviceId;
  const doctorName = doctor ? doctor.name : (lang === 'en' ? 'Any Available Specialist' : 'Dokter mana saja');

  const datePart = booking.startsAt.split('T')[0];
  const timePart = booking.startsAt.split('T')[1]?.slice(0, 5) + ' WIB';
  const formattedDate = formatDateSummary(datePart, lang === 'en');

  // WhatsApp prefilled message
  const waConfirmMessage = [
    `Halo ${settings.name || 'Klinik Gigi Senyum Sehat'}, saya ingin konfirmasi reservasi online:`,
    `- Kode Booking: ${booking.code}`,
    `- Pasien: ${booking.patient.name}`,
    `- Jadwal: ${formattedDate} pukul ${timePart}`,
    ...(booking.complaint ? [`- Catatan: ${booking.complaint}`] : []),
    'Mohon konfirmasi ketersediaan jadwal saya. Terima kasih!',
  ].join('\n');

  const waLink = buildWhatsAppLink(settings.whatsappNumber, waConfirmMessage);

  return (
    <>
      <AppHelmet
        title={t.bookingSuccess.pageTitle}
        description={t.bookingSuccess.pageSubtitle}
        path={`/booking/sukses/${booking.code}`}
      />

      <PageHeader title={t.bookingSuccess.pageTitle} description={t.bookingSuccess.pageSubtitle} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Clinical Appointment Pass / Ticket */}
          <div className="bg-surface rounded-2xl border border-border shadow-card overflow-hidden mb-8">
            {/* Ticket Header */}
            <div className="bg-secondary text-surface p-5 sm:p-8 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-surface/70">
                      {settings.name || 'Klinik Gigi Senyum Sehat'} · Appointment Pass
                    </span>
                  </div>
                  <div className="text-xs text-surface/60 font-medium">
                    {t.bookingSuccess.codeLabel}
                  </div>
                  <div className="font-heading text-3xl sm:text-4xl font-extrabold tracking-widest text-surface mt-1">
                    {booking.code}
                  </div>
                </div>

                <div className="flex items-center sm:flex-col sm:items-end justify-between gap-2">
                  {booking.status === 'pending' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-400/40">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                        <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                      </svg>
                      <span>{lang === 'en' ? 'Pending Clinic Review' : 'Menunggu Konfirmasi'}</span>
                    </span>
                  ) : booking.status === 'confirmed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{lang === 'en' ? 'Confirmed' : 'Terkonfirmasi'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase bg-surface/20 text-surface border border-surface/30">
                      <span>{booking.status}</span>
                    </span>
                  )}
                  <span className="text-[11px] text-surface/60">
                    {lang === 'en' ? 'Save this code' : 'Simpan kode ini'}
                  </span>
                </div>
              </div>

              {booking.status === 'pending' && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-400/30 text-xs text-amber-100 flex items-start gap-2.5">
                  <span className="text-base leading-none">⏳</span>
                  <div className="leading-relaxed">
                    <strong>{lang === 'en' ? 'Verification in progress: ' : 'Status Reservasi: Menunggu Konfirmasi. '}</strong>
                    {lang === 'en'
                      ? 'Our clinic receptionist is reviewing doctor and chair availability. You will receive an official confirmation via WhatsApp shortly.'
                      : 'Resepsionis klinik sedang memverifikasi jadwal dokter dan kursi gigi. Slot akan dilepaskan otomatis jika tidak dikonfirmasi dalam waktu yang ditentukan.'}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-surface/10 text-xs text-surface/75 leading-relaxed">
                {t.bookingSuccess.saveCodeNotice}
              </div>
            </div>

            {/* Perforated divider look */}
            <div className="relative border-b border-dashed border-border my-0 bg-surface">
              <div className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-bg border border-border" />
              <div className="absolute -right-3 -top-3 w-6 h-6 rounded-full bg-bg border border-border" />
            </div>

            {/* Ticket Details Body */}
            <div className="p-5 sm:p-8 space-y-5 text-sm">
              <h2 className="font-heading text-lg font-bold text-secondary">
                {t.bookingSuccess.detailTitle}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Patient Name' : 'Nama Pasien'}
                  </span>
                  <span className="font-semibold text-text text-base">{booking.patient.name}</span>
                </div>

                {booking.patient.phone && (
                  <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                    <span className="text-xs text-text-muted font-medium block mb-1">
                      {lang === 'en' ? 'WhatsApp Number' : 'Nomor WhatsApp'}
                    </span>
                    <span className="font-semibold text-text text-base">{formatPhoneDisplay(booking.patient.phone)}</span>
                  </div>
                )}

                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Treatment / Service' : 'Jenis Layanan'}
                  </span>
                  <span className="font-semibold text-text text-base">{serviceName}</span>
                </div>

                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    {lang === 'en' ? 'Attending Specialist' : 'Dokter Spesialis'}
                  </span>
                  <span className="font-semibold text-text text-base">{doctorName}</span>
                </div>

                {/* Formatted Date & Time */}
                <div className="p-4 sm:p-5 rounded-xl bg-primary/5 border border-primary/20 sm:col-span-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary block mb-1">
                    {lang === 'en' ? 'Scheduled Date & Time' : 'Jadwal Janji Temu'}
                  </span>
                  <div className="font-heading text-xl sm:text-2xl font-bold text-primary">
                    {formattedDate} · {timePart}
                  </div>
                  <span className="text-xs text-text-muted mt-1 block">
                    {lang === 'en'
                      ? 'Please arrive 10 minutes prior to complete initial registration.'
                      : 'Harap hadir 10 menit lebih awal untuk registrasi awal.'}
                  </span>
                </div>

                {/* Clinic Address */}
                <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70 sm:col-span-2">
                  <span className="text-xs text-text-muted font-medium block mb-1">
                    📍 {lang === 'en' ? 'Clinic Address' : 'Alamat Klinik'}
                  </span>
                  <p className="font-semibold text-text text-sm">
                    {settings.name || 'Klinik Gigi Senyum Sehat'}
                  </p>
                  <p className="text-xs text-text-muted mt-0.5">
                    {settings.address || 'Jl. Senopati No. 45, Kebayoran Baru'}, {settings.city || 'Jakarta Selatan 12190'}
                  </p>
                </div>

                {booking.complaint && (
                  <div className="p-4 rounded-xl bg-bg-alt/60 border border-border/70 sm:col-span-2">
                    <span className="text-xs text-text-muted font-medium block mb-1">
                      {lang === 'en' ? 'Initial Notes / Complaints' : 'Catatan Keluhan Awal'}
                    </span>
                    <span className="text-text text-sm leading-relaxed">{booking.complaint}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action CTAs: Konfirmasi via WhatsApp & Secondary Actions */}
          <div className="space-y-3.5 mb-8">
            <div className="bg-surface rounded-2xl border border-[#128C7E]/25 p-4 sm:p-5 shadow-soft">
              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full justify-center py-3.5 px-6 rounded-xl bg-[#128C7E] hover:bg-[#0E7A6D] text-white text-sm sm:text-base cursor-pointer shadow-xs min-h-[50px] active:scale-[0.98] flex items-center font-bold gap-2.5 transition-all"
              >
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>{t.bookingSuccess.openWhatsAppBtn}</span>
              </a>
              <p className="text-xs text-text-muted text-center mt-2.5">
                {t.bookingSuccess.waNotificationNotice}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={downloadIcsCalendar}
                className="h-12 px-4 rounded-xl border border-border bg-surface text-secondary hover:border-primary/40 hover:bg-bg-alt/60 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span>{lang === 'en' ? 'Add to Calendar' : 'Tambah ke Kalender'}</span>
              </button>

              <Link
                to={localePath(`/booking/kelola/${booking.code}${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                className="h-12 px-4 rounded-xl border border-border bg-surface text-secondary hover:border-primary/40 hover:bg-bg-alt/60 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-4 h-4 text-primary shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>{t.bookingSuccess.manageBookingBtn}</span>
              </Link>

              <Link
                to={localePath('/')}
                className="h-12 px-4 rounded-xl border border-border bg-surface text-secondary hover:border-primary/40 hover:bg-bg-alt/60 text-xs sm:text-sm font-semibold whitespace-nowrap inline-flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer active:scale-[0.98]"
              >
                <svg className="w-4 h-4 text-text-muted shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>{t.bookingSuccess.backHomeBtn}</span>
              </Link>
            </div>
          </div>

          {/* Clinical Preparation Instructions */}
          <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 shadow-card">
            <h3 className="font-heading text-lg font-bold text-secondary mb-4">
              {t.bookingSuccess.instructionsTitle}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {t.bookingSuccess.instructions.map((inst, i) => (
                <div key={i} className="flex flex-col p-4 rounded-xl bg-bg-alt/50 border border-border/60">
                  <span className="w-7 h-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mb-3">
                    0{i + 1}
                  </span>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    {inst}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default BookingSuccessPage;
