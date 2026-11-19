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
    pending: 'Menunggu konfirmasi', confirmed: 'Terkonfirmasi', arrived: 'Sudah hadir (Ruang tunggu)', in_chair: 'Sedang di kursi gigi', completed: 'Selesai', cancelled: 'Dibatalkan', noShow: 'Tidak hadir', daily: 'Harian', manage: 'Kelola', system: 'Sistem', appointmentToday: 'Jadwal hari ini', makeAppointment: 'Buat janji temu', viewAllAppointments: 'Lihat semua janji temu', adminLanguage: 'Bahasa admin', indonesian: 'Bahasa Indonesia', english: 'English', apiError: 'Terjadi kesalahan. Silakan coba lagi.',
  } },
  en: { translation: {
    appTitle: 'Dental Clinic Admin', admin: 'Admin', menu: 'Menu', login: 'Sign in', logout: 'Sign out', loginIntro: 'Manage clinic operations in one place.', loginHelp: 'Sign in to continue managing the clinic.',
    username: 'Username', password: 'Password', showPassword: 'Show password', hidePassword: 'Hide password', requiredUsername: 'Username is required', requiredPassword: 'Password is required', invalidCredentials: 'Incorrect username or password',
    loading: 'Loading...', save: 'Save', saveChanges: 'Save changes', cancel: 'Cancel', add: 'Add', edit: 'Edit', delete: 'Delete', confirm: 'Confirm', retry: 'Try again',
    dashboard: 'Overview', appointments: 'Appointments', patients: 'Patients', doctors: 'Doctors', services: 'Services', content: 'Content', operations: 'Operations', settings: 'Settings', schedule: 'Schedule', today: 'Today', tomorrow: 'Tomorrow', status: 'Status', search: 'Search', filter: 'Filter', noData: 'No data yet', actions: 'Actions',
    pending: 'Pending confirmation', confirmed: 'Confirmed', arrived: 'Arrived (Waiting room)', in_chair: 'In dental chair', completed: 'Completed', cancelled: 'Cancelled', noShow: 'No show', daily: 'Daily', manage: 'Manage', system: 'System', appointmentToday: "Today's appointments", makeAppointment: 'Create appointment', viewAllAppointments: 'View all appointments', adminLanguage: 'Admin language', indonesian: 'Bahasa Indonesia', english: 'English', apiError: 'Something went wrong. Please try again.',
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
export function statusText(status: string) { return ({ pending: text('pending'), confirmed: text('confirmed'), arrived: text('arrived'), in_chair: text('in_chair'), completed: text('completed'), cancelled: text('cancelled'), no_show: text('noShow') } as Record<string, string>)[status] ?? status; }
export function formatDate(value: string | Date) { return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { timeZone, weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value)); }
export function formatDateTime(value: string | Date) { return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { timeZone, day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZoneName: 'short' }).format(new Date(value)); }
export function formatCurrency(value: string | number) { return new Intl.NumberFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(value)); }
export function formatPhone(value: string) {
  if (!value || value.startsWith('wa-pending-') || !value.startsWith('+')) {
    return tr('Nomor belum diverifikasi', 'Unverified number');
  }
  return value.startsWith('+62') ? value : value.replace(/^0/, '+62');
}

export function isPendingPhone(value?: string | null): boolean {
  return !value || value.startsWith('wa-pending-') || !value.startsWith('+');
}

export function formatTimeOnly(value: string | Date): string {
  return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(value));
}

export function formatDateShort(value: string | Date): string {
  return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export function formatDayGroup(value: string | Date): string {
  const d = new Date(value);
  const now = new Date();
  const key = (dt: Date) =>
    new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(dt);
  const targetKey = key(d);
  if (targetKey === key(now)) return text('today');
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60_000);
  if (targetKey === key(tomorrow)) return text('tomorrow');
  return new Intl.DateTimeFormat(currentLocale() === 'id' ? 'id-ID' : 'en-US', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(d);
}

export function formatLateDuration(minutes: number): string {
  if (minutes >= 1440) {
    const days = Math.floor(minutes / 1440);
    return currentLocale() === 'id' ? `Terlambat ${days} hari` : `${days}d late`;
  }
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    return currentLocale() === 'id' ? `Terlambat ${hours} jam` : `${hours}h late`;
  }
  return currentLocale() === 'id' ? `Terlambat ${minutes} mnt` : `${minutes}m late`;
}

export function clientError(_: unknown) { return text('apiError'); }
