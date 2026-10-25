import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { getBooking, getService, getDoctor } from '../lib/api';
import { Booking, Service, Doctor } from '../types';
import { AppHelmet } from '../components/common/AppHelmet';
import { buildWhatsAppLink, formatPhoneDisplay } from '../lib/utils';
import { useClinicSettings } from '../lib/clinic-settings';

export const BookingSuccessPage: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || undefined;
  const { lang, t, localePath } = useI18n();
  const settings = useClinicSettings();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [service, setService] = useState<Service | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!code) return;
      const b = await getBooking(code, token);
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
  }, [code, token]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm font-medium text-text-muted">
        {t.common.loading}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="trust-card p-8">
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-text mb-3">
            Data Reservasi Tidak Ditemukan
          </h1>
          <p className="text-sm text-text-muted mb-6">
            Kode booking <strong>{code}</strong> tidak terdaftar dalam sistem.
          </p>
          <Link
            to={localePath('/booking')}
            className="btn-primary text-sm cursor-pointer"
          >
            Buat Janji Baru
          </Link>
        </div>
      </div>
    );
  }

  const serviceName = service ? (lang === 'en' ? service.nameEn : service.name) : booking.serviceId;
  const doctorName = doctor ? doctor.name : (lang === 'en' ? 'Any Available Specialist' : 'Dokter mana saja');

  const datePart = booking.startsAt.split('T')[0];
  const timePart = booking.startsAt.split('T')[1]?.slice(0, 5) + ' WIB';

  // WhatsApp prefilled message
  const waConfirmMessage = `Halo ${settings.name || 'Klinik Gigi Senyum Sehat'}, saya telah membuat reservasi online:\n- Kode Booking: ${booking.code}\n- Nama: ${booking.patient.name}\n- Layanan: ${serviceName}\n- Jadwal: ${datePart} pukul ${timePart}\nMohon konfirmasinya. Terima kasih!`;

  const waLink = buildWhatsAppLink(settings.whatsappNumber, waConfirmMessage);

  return (
    <>
      <AppHelmet
        title={t.bookingSuccess.pageTitle}
        description={t.bookingSuccess.pageSubtitle}
        path={`/booking/sukses/${booking.code}`}
      />

      <div className="py-12 md:py-20 bg-bg">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <div className="badge badge-success mb-3 inline-flex items-center gap-1.5">
              <svg className="w-4 h-4 text-success-dark" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>RESERVASI BERHASIL DITERIMA</span>
            </div>
            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-text tracking-tight mb-3">
              {t.bookingSuccess.pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-text-muted max-w-lg mx-auto leading-relaxed">
              {t.bookingSuccess.pageSubtitle}
            </p>
          </div>

          {/* Booking Code Callout */}
          <div className="p-8 rounded-[10px] bg-primary text-bg text-center mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-2">
              {t.bookingSuccess.codeLabel}
            </span>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold tracking-wider text-white mb-3">
              {booking.code}
            </div>
            <p className="text-xs text-white/85 max-w-sm mx-auto">
              {t.bookingSuccess.saveCodeNotice}
            </p>
          </div>

          {/* Details Table */}
          <div className="trust-card p-6 md:p-8 bg-bg-card mb-8 space-y-3.5 text-sm">
            <h2 className="font-heading text-xl font-bold text-text mb-4">
              {t.bookingSuccess.detailTitle}
            </h2>

            <div className="flex justify-between py-2.5 border-b border-border">
              <span className="text-text-muted">Nama Pasien:</span>
              <span className="font-semibold text-text">{booking.patient.name}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border">
              <span className="text-text-muted">Nomor WhatsApp:</span>
              <span className="font-semibold text-text">{formatPhoneDisplay(booking.patient.phone)}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border">
              <span className="text-text-muted">Jenis Layanan:</span>
              <span className="font-semibold text-text">{serviceName}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border">
              <span className="text-text-muted">Dokter Spesialis:</span>
              <span className="font-semibold text-text">{doctorName}</span>
            </div>
            <div className="flex justify-between py-2.5 border-b border-border">
              <span className="text-text-muted">Tanggal & Jam:</span>
              <span className="font-bold text-primary">{datePart} · {timePart}</span>
            </div>
            {booking.complaint && (
              <div className="flex justify-between py-2.5 border-b border-border">
                <span className="text-text-muted">Catatan Keluhan:</span>
                <span className="text-text max-w-xs text-right">{booking.complaint}</span>
              </div>
            )}
            <div className="flex justify-between items-center py-2">
              <span className="text-text-muted">Status:</span>
              <span className="badge badge-success uppercase">{booking.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-10">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary w-full justify-center py-3.5 text-sm cursor-pointer"
            >
              <span>{t.bookingSuccess.openWhatsAppBtn}</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M7 7h10v10" />
              </svg>
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={localePath(`/booking/kelola/${booking.code}${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                className="flex-1 btn-secondary justify-center py-3 text-sm cursor-pointer"
              >
                {t.bookingSuccess.manageBookingBtn}
              </Link>
              <Link
                to={localePath('/')}
                className="flex-1 inline-flex items-center justify-center py-3 px-4 rounded-xl border border-border bg-bg-card text-text hover:bg-bg-alt font-semibold text-sm transition-colors cursor-pointer"
              >
                {t.bookingSuccess.backHomeBtn}
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="trust-card p-6 bg-bg-alt/70">
            <h3 className="font-heading text-base font-bold text-text mb-3">
              {t.bookingSuccess.instructionsTitle}
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-text-muted">
              {t.bookingSuccess.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};
