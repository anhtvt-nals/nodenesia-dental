import i18n from 'i18next';
import { initReactI18next, useTranslation } from 'react-i18next';

export type AdminLocale = 'id' | 'en';
export const timeZone = 'Asia/Jakarta';

const resources = {
  id: { translation: {
    appTitle: 'Admin Klinik Gigi', admin: 'Admin', menu: 'Menu', login: 'Masuk', logout: 'Keluar', loginIntro: 'Kelola operasional klinik di satu tempat.', loginHelp: 'Masuk untuk melanjutkan pengelolaan klinik.',
    username: 'Nama pengguna', password: 'Kata sandi', showPassword: 'Tampilkan kata sandi', hidePassword: 'Sembunyikan kata sandi', requiredUsername: 'Nama pengguna wajib diisi', requiredPassword: 'Kata sandi wajib diisi', invalidCredentials: 'Nama pengguna atau kata sandi salah',
    loading: 'Memuat...', save: 'Simpan', saveChanges: 'Simpan perubahan', cancel: 'Batal', add: 'Tambah', edit: 'Ubah', delete: 'Hapus', confirm: 'Konfirmasi', retry: 'Coba lagi',
    dashboard: 'Ringkasan', appointments: 'Janji temu', patients: 'Pasien', doctors: 'Dokter', services: 'Layanan', content: 'Konten', operations: 'Operasional', settings: 'Pengaturan', schedule: 'Jadwal', today: 'Hari ini', tomorrow: 'Besok', status: 'Status', search: 'Cari', filter: 'Filter', noData: 'Belum ada data', actions: 'Tindakan',
    pending: 'Menunggu konfirmasi', confirmed: 'Terkonfirmasi', completed: 'Selesai', cancelled: 'Dibatalkan', noShow: 'Tidak hadir', daily: 'Harian', manage: 'Kelola', system: 'Sistem', appointmentToday: 'Jadwal hari ini', makeAppointment: 'Buat janji temu', viewAllAppointments: 'Lihat semua janji temu', adminLanguage: 'Bahasa admin', indonesian: 'Bahasa Indonesia', english: 'English', apiError: 'Terjadi kesalahan. Silakan coba lagi.',
  } },
  en: { translation: {
    appTitle: 'Dental Clinic Admin', admin: 'Admin', menu: 'Menu', login: 'Sign in', logout: 'Sign out', loginIntro: 'Manage clinic operations in one place.', loginHelp: 'Sign in to continue managing the clinic.',
    username: 'Username', password: 'Password', showPassword: 'Show password', hidePassword: 'Hide password', requiredUsername: 'Username is required', requiredPassword: 'Password is required', invalidCredentials: 'Incorrect username or password',
    loading: 'Loading...', save: 'Save', saveChanges: 'Save changes', cancel: 'Cancel', add: 'Add', edit: 'Edit', delete: 'Delete', confirm: 'Confirm', retry: 'Try again',
    dashboard: 'Overview', appointments: 'Appointments', patients: 'Patients', doctors: 'Doctors', services: 'Services', content: 'Content', operations: 'Operations', settings: 'Settings', schedule: 'Schedule', today: 'Today', tomorrow: 'Tomorrow', status: 'Status', search: 'Search', filter: 'Filter', noData: 'No data yet', actions: 'Actions',
    pending: 'Pending confirmation', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled', noShow: 'No show', daily: 'Daily', manage: 'Manage', system: 'System', appointmentToday: "Today's appointments", makeAppointment: 'Create appointment', viewAllAppointments: 'View all appointments', adminLanguage: 'Admin language', indonesian: 'Bahasa Indonesia', english: 'English', apiError: 'Something went wrong. Please try again.',
  } },
} as const;

void i18n.use(initReactI18next).init({ resources, lng: 'id', fallbackLng: 'id', interpolation: { escapeValue: false }, react: { useSuspense: false } });

export default i18n;
export const useAdminTranslation = useTranslation;
export function setAdminLocale(locale: AdminLocale) { void i18n.changeLanguage(locale); }
export function currentLocale(): AdminLocale { return i18n.resolvedLanguage === 'en' ? 'en' : 'id'; }
export function text(key: keyof typeof resources.id.translation) { return i18n.t(key); }
type TranslationKey = keyof typeof resources.id.translation;
/** Compatibility accessor for non-React API helpers; React UI should prefer the hook. */
export const copy = new Proxy({} as Record<TranslationKey, string>, { get: (_, key: TranslationKey) => text(key) });
/** Transitional inline copy helper; new module copy should use `useAdminTranslation().t`. */
const inlineKeys = new Map<string, string>();
function inlineKey(id: string) {
  const cached = inlineKeys.get(id);
  if (cached) return cached;
  let hash = 5381;
  for (let index = 0; index < id.length; index += 1) hash = (hash * 33) ^ id.charCodeAt(index);
  const key = `inline.${(hash >>> 0).toString(36)}`;
  inlineKeys.set(id, key);
  return key;
}
/**
 * Compatibility for module copy not yet promoted to a named resource key.
 * It still registers and resolves through i18next (never through locale if/else).
 */
export function tr(id: string, en: string) {
  const key = inlineKey(id);
  if (!i18n.exists(key, { lng: 'id' })) {
    i18n.addResource('id', 'translation', key, id);
    i18n.addResource('en', 'translation', key, en);
  }
  return i18n.t(key);
}
export function statusText(status: string) { return ({ pending: text('pending'), confirmed: text('confirmed'), completed: text('completed'), cancelled: text('cancelled'), no_show: text('noShow') } as Record<string, string>)[status] ?? status; }
export function formatDate(value: string | Date) { return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { timeZone, weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
export function formatDateTime(value: string | Date) { return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { timeZone, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' }).format(new Date(value)); }
export function formatCurrency(value: string | number) { return new Intl.NumberFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value)); }
export function formatPhone(value: string) { return value.startsWith('+62') ? value : value.replace(/^0/, '+62'); }
export function clientError(_: unknown) { return text('apiError'); }
