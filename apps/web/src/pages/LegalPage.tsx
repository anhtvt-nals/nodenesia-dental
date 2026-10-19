import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const { t, localePath } = useI18n();

  const isPrivacy = location.pathname.includes('/privacy');
  const pageTitle = isPrivacy ? t.legal.privacyTitle : t.legal.termsTitle;

  return (
    <>
      <AppHelmet
        title={pageTitle}
        description={isPrivacy ? t.legal.privacyIntro : t.legal.termsIntro}
        path={isPrivacy ? '/privacy' : '/terms'}
      />

      <div className="py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 pb-6 hairline-b">
            <span className="font-mono text-xs uppercase tracking-wider text-[#1F3D36] block mb-2">
              Kebijakan Hukum & Pasien
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#14201C] tracking-tight mb-2">
              {pageTitle}
            </h1>
            <p className="text-xs font-mono text-[#14201C]/60">
              {t.legal.lastUpdated}
            </p>
          </div>

          <div className="prose max-w-none text-[#14201C]/80 font-sans text-base leading-relaxed space-y-6">
            <p className="font-medium text-[#14201C]">
              {isPrivacy ? t.legal.privacyIntro : t.legal.termsIntro}
            </p>

            <div className="p-4 bg-[#E9E4D8]/50 hairline-border text-xs font-mono text-[#14201C]/75">
              <span className="font-semibold block mb-1">Catatan Medis Penting:</span>
              {t.legal.disclaimerMedical}
            </div>

            {isPrivacy ? (
              <>
                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  1. Pengumpulan Data Pribadi
                </h2>
                <p>
                  Kami hanya mengumpulkan data yang mutlak diperlukan untuk keperluan konfirmasi janji temu medis, yaitu nama lengkap pasien dan nomor telepon aktif (WhatsApp). Kami tidak mengumpulkan email atau data sensitif kartu kredit secara daring.
                </p>

                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  2. Kerahasiaan Rekam Medis
                </h2>
                <p>
                  Seluruh catatan pemeriksaan, riwayat gigi, dan foto rontgen pasien disimpan dalam server medis terenkripsi dan hanya dapat diakses oleh dokter gigi yang merawat Anda sesuai Kode Etik Kedokteran Gigi Indonesia (KODEGI).
                </p>

                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  3. Penggunaan Nomor WhatsApp
                </h2>
                <p>
                  Nomor kontak Anda semata-mata dimanfaatkan untuk pengiriman notifikasi jadwal reservasi, petunjuk pra-tindakan, dan pemantauan kondisi pasca-perawatan. Kami tidak pernah membagikan atau menjual data Anda kepada pihak ketiga manapun.
                </p>
              </>
            ) : (
              <>
                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  1. Ketentuan Reservasi Online
                </h2>
                <p>
                  Reservasi yang dibuat melalui website ini merupakan janji temu terjadwal. Pasien diharapkan hadir minimal 10 menit sebelum jam praktek dimulai untuk proses registrasi dan validasi identitas di resepsionis.
                </p>

                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  2. Kebijakan Perubahan Jadwal & Pembatalan
                </h2>
                <p>
                  Jika Anda berhalangan hadir, harap melakukan perubahan jadwal (reschedule) atau pembatalan paling lambat 3 (tiga) jam sebelum jam janji temu melalui halaman Kelola Booking atau menghubungi nomor hotline WhatsApp kami.
                </p>

                <h2 className="font-serif text-2xl text-[#14201C] pt-4">
                  3. Transparansi Estimasi Biaya
                </h2>
                <p>
                  Biaya yang tertera pada katalog layanan website ini merupakan estimasi awal ("mulai dari"). Biaya final akan dijelaskan secara tertulis dan memerlukan persetujuan pasien setelah pemeriksaan klinis dan foto rontgen dilakukan oleh dokter spesialis.
                </p>
              </>
            )}
          </div>

          <div className="mt-12 pt-6 hairline-t">
            <Link
              to={localePath('/')}
              className="text-xs font-mono text-[#1F3D36] hover:underline"
            >
              ← Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
