import { PageHeader } from '../components/common/PageHeader';
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useI18n } from '../i18n';
import { AppHelmet } from '../components/common/AppHelmet';

export const LegalPage: React.FC = () => {
  const location = useLocation();
  const { lang, t, localePath } = useI18n();

  const isPrivacy = location.pathname.includes('/privacy');
  const pageTitle = isPrivacy ? t.legal.privacyTitle : t.legal.termsTitle;

  return (
    <>
      <AppHelmet
        title={pageTitle}
        description={isPrivacy ? t.legal.privacyIntro : t.legal.termsIntro}
        path={isPrivacy ? '/privacy' : '/terms'}
      />

      <PageHeader title={pageTitle} description={t.legal.lastUpdated} />

      <div className="page-content bg-bg py-6 sm:py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-surface rounded-2xl border border-border shadow-card p-6 sm:p-10">

            <div className="prose max-w-none text-text text-sm sm:text-base leading-relaxed space-y-6">
              <p className="font-semibold text-secondary text-base sm:text-lg">
                {isPrivacy ? t.legal.privacyIntro : t.legal.termsIntro}
              </p>

              <div className="p-5 rounded-xl bg-bg-alt/70 border border-border text-xs sm:text-sm text-text-muted">
                <span className="font-bold text-primary block mb-1">Catatan Medis Penting:</span>
                {t.legal.disclaimerMedical}
              </div>

              {isPrivacy ? (
                <>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    1. Pengumpulan Data Pribadi
                  </h2>
                  <p>
                    Kami hanya mengumpulkan data yang mutlak diperlukan untuk keperluan konfirmasi janji temu medis, yaitu nama lengkap pasien dan nomor telepon aktif (WhatsApp). Kami tidak mengumpulkan email untuk spam atau meminta data kartu kredit secara daring tanpa otorisasi.
                  </p>

                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    2. Kerahasiaan Rekam Medis Pasien
                  </h2>
                  <p>
                    Seluruh catatan pemeriksaan, riwayat gigi, foto intraoral, dan hasil rontgen digital pasien disimpan dalam server medis terenkripsi dan hanya dapat diakses oleh dokter gigi yang merawat Anda sesuai Kode Etik Kedokteran Gigi Indonesia (KODEGI) dan peraturan perundang-undangan Kementerian Kesehatan RI.
                  </p>

                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    3. Penggunaan Nomor WhatsApp
                  </h2>
                  <p>
                    Nomor kontak Anda semata-mata dimanfaatkan untuk pengiriman notifikasi pengingat jadwal reservasi, petunjuk pra-tindakan, konfirmasi kedatangan, dan pemantauan kondisi pasca-perawatan. Kami tidak pernah membagikan atau menjual data kontak kepada pihak ketiga manapun.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    1. Ketentuan Reservasi Online
                  </h2>
                  <p>
                    Reservasi yang dibuat melalui website ini merupakan janji temu terjadwal. Pasien diharapkan hadir minimal 10 menit sebelum jam janji temu dimulai untuk proses registrasi dan validasi identitas di resepsionis klinik.
                  </p>

                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    2. Kebijakan Perubahan Jadwal & Pembatalan
                  </h2>
                  <p>
                    Jika Anda berhalangan hadir, harap melakukan perubahan jadwal (reschedule) atau pembatalan paling lambat 3 (tiga) jam sebelum jam janji temu melalui fitur "Kelola Janji Temu" di website ini atau menghubungi nomor hotline WhatsApp kami.
                  </p>

                  <h2 className="font-heading text-xl sm:text-2xl font-bold text-secondary pt-4">
                    3. Transparansi Estimasi Biaya
                  </h2>
                  <p>
                    Biaya yang tertera pada katalog layanan website ini merupakan estimasi awal ("mulai dari"). Biaya final akan dijelaskan secara tertulis dan memerlukan persetujuan pasien setelah pemeriksaan klinis, foto intraoral, atau rontgen dilakukan oleh dokter spesialis.
                  </p>
                </>
              )}
            </div>

            <div className="mt-10 pt-6 border-t border-border">
              <Link
                to={localePath('/')}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
                <span>Kembali ke Beranda</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
