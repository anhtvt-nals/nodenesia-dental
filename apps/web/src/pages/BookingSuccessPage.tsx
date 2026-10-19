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
      <div className="max-w-7xl mx-auto px-4 py-20 text-center font-mono text-xs text-[#14201C]/60">
        {t.common.loading}
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h1 className="font-serif text-3xl mb-4">Data Reservasi Tidak Ditemukan</h1>
        <p className="text-sm font-sans text-[#14201C]/70 mb-6">
          Kode booking {code} tidak terdaftar dalam sistem.
        </p>
        <Link
          to={localePath('/booking')}
          className="px-6 py-2.5 bg-[#1F3D36] text-[#F4F1EA] text-xs font-mono uppercase tracking-wider"
        >
          Buat Janji Baru
        </Link>
      </div>
    );
  }

  const serviceName = service ? (lang === 'en' ? service.nameEn : service.name) : booking.serviceId;
  const doctorName = doctor ? doctor.name : (lang === 'en' ? 'Any Available Specialist' : 'Dokter mana saja');

  const datePart = booking.startsAt.split('T')[0];
  const timePart = booking.startsAt.split('T')[1]?.slice(0, 5) + ' WIB';

  // WhatsApp prefilled message
  const waConfirmMessage = `Halo [NAMA KLINIK], saya telah membuat reservasi online:\n- Kode Booking: ${booking.code}\n- Nama: ${booking.patient.name}\n- Layanan: ${serviceName}\n- Jadwal: ${datePart} pukul ${timePart}\nMohon konfirmasinya. Terima kasih!`;

  const waLink = buildWhatsAppLink(settings.whatsappNumber, waConfirmMessage);

  return (
    <>
      <AppHelmet
        title={t.bookingSuccess.pageTitle}
        description={t.bookingSuccess.pageSubtitle}
        path={`/booking/sukses/${booking.code}`}
      />

      <div className="py-12 md:py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-10">
            <span className="font-mono text-xs uppercase tracking-widest text-[#1F3D36] bg-[#1F3D36]/10 px-3 py-1 hairline-border border-[#1F3D36]/20 inline-block mb-3">
              RESERVASI BERHASIL DITERIMA
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-3">
              {t.bookingSuccess.pageTitle}
            </h1>
            <p className="text-sm sm:text-base text-[#14201C]/75 max-w-lg mx-auto leading-relaxed">
              {t.bookingSuccess.pageSubtitle}
            </p>
          </div>

          {/* Booking Code Callout */}
          <div className="p-8 bg-[#14201C] text-[#F4F1EA] text-center mb-8 hairline-border">
            <span className="font-mono text-xs uppercase tracking-wider text-white/60 block mb-2">
              {t.bookingSuccess.codeLabel}
            </span>
            <div className="font-mono text-4xl sm:text-5xl font-semibold tracking-wider text-[#F4F1EA] mb-3">
              {booking.code}
            </div>
            <p className="text-xs font-mono text-white/70 max-w-sm mx-auto">
              {t.bookingSuccess.saveCodeNotice}
            </p>
          </div>

          {/* Details Table */}
          <div className="p-6 md:p-8 bg-[#F4F1EA] hairline-border mb-8 space-y-4 font-mono text-xs">
            <h2 className="font-serif text-2xl text-[#14201C] mb-4">
              {t.bookingSuccess.detailTitle}
            </h2>

            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#14201C]/60">Nama Pasien:</span>
              <span className="font-medium text-[#14201C]">{booking.patient.name}</span>
            </div>
            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#14201C]/60">Nomor WhatsApp:</span>
              <span className="font-medium text-[#14201C]">{formatPhoneDisplay(booking.patient.phone)}</span>
            </div>
            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#14201C]/60">Jenis Layanan:</span>
              <span className="font-medium text-[#14201C]">{serviceName}</span>
            </div>
            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#14201C]/60">Dokter Spesialis:</span>
              <span className="font-medium text-[#14201C]">{doctorName}</span>
            </div>
            <div className="flex justify-between py-2 hairline-b">
              <span className="text-[#14201C]/60">Tanggal & Jam:</span>
              <span className="font-medium text-[#1F3D36] text-sm">{datePart} · {timePart}</span>
            </div>
            {booking.complaint && (
              <div className="flex justify-between py-2 hairline-b">
                <span className="text-[#14201C]/60">Catatan Keluhan:</span>
                <span className="font-sans text-[#14201C]/80 max-w-xs text-right">{booking.complaint}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-[#14201C]/60">Status:</span>
              <span className="font-semibold text-[#1F3D36] uppercase">{booking.status}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 mb-10">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full block py-4 bg-[#1F3D36] text-[#F4F1EA] text-center font-mono text-xs uppercase tracking-wider hover:bg-[#162B26] transition-colors"
            >
              {t.bookingSuccess.openWhatsAppBtn} ↗
            </a>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to={localePath(`/booking/kelola/${booking.code}${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                className="flex-1 py-3 hairline-border bg-[#E9E4D8]/60 text-[#14201C] text-center font-mono text-xs uppercase tracking-wider hover:bg-[#E9E4D8] transition-colors"
              >
                {t.bookingSuccess.manageBookingBtn}
              </Link>
              <Link
                to={localePath('/')}
                className="flex-1 py-3 hairline-border bg-[#F4F1EA] text-[#14201C] text-center font-mono text-xs uppercase tracking-wider hover:bg-[#E9E4D8] transition-colors"
              >
                {t.bookingSuccess.backHomeBtn}
              </Link>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-6 bg-[#E9E4D8]/30 hairline-border">
            <h3 className="font-serif text-lg text-[#14201C] mb-3">
              {t.bookingSuccess.instructionsTitle}
            </h3>
            <ul className="space-y-2 text-xs font-sans text-[#14201C]/80">
              {t.bookingSuccess.instructions.map((inst, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="font-mono text-xs text-[#1F3D36]">0{i + 1}.</span>
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
