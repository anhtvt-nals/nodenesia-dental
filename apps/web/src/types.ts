export type ServiceCategory =
  | 'pencegahan'
  | 'estetik'
  | 'ortodonti'
  | 'restoratif'
  | 'bedah'
  | 'anak';

export type ToothZone = 'front' | 'molar' | 'gum' | 'arch';

export interface Service {
  id: string;
  slug: string;
  name: string;
  nameEn: string;
  category: ServiceCategory;
  zone: ToothZone;
  shortDesc: string;
  shortDescEn: string;
  description: string;
  descriptionEn: string;
  durationMinutes: number;
  priceFrom: number;
  priceTo?: number;
  priceNote?: string;
  priceNoteEn?: string;
  faqs?: { question: string; questionEn: string; answer: string; answerEn: string }[];
}

export interface DoctorWorkingHours {
  weekday: number; // 1 = Senin, ..., 6 = Sabtu, 0 = Minggu
  start: string; // "09:00"
  end: string;   // "16:00"
}

export interface Doctor {
  id: string;
  slug: string;
  name: string;
  title: string;
  titleEn: string;
  specialty: string;
  specialtyEn: string;
  bio: string;
  bioEn: string;
  photoUrl: string;
  serviceIds: string[];
  workingHours: DoctorWorkingHours[];
  education?: string[];
  sipNumber?: string;
  experienceYears?: number;
  experience?: string;
  experienceEn?: string;
}

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show';

export interface BookingPatient {
  name: string;
  phone: string;
}

export interface Booking {
  id: string;
  code: string;
  token?: string;
  serviceId: string;
  doctorId: string; // Doctor id or 'any'
  startsAt: string; // ISO String
  endsAt: string;   // ISO String
  status: BookingStatus;
  patient: BookingPatient;
  complaint?: string;
  createdAt: string;
}

export interface BookingSlot {
  time: string; // "09:00"
  available: boolean;
  doctorId?: string;
  reason?: string;
}

export type ArticleCategory = 'kesehatan-gigi' | 'ortodonti' | 'estetik' | 'anak' | 'bedah';

export interface Article {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  category: ArticleCategory;
  categoryName: string;
  categoryNameEn: string;
  readTime: string;
  publishedAt: string;
  authorName: string;
  authorTitle: string;
  summary: string;
  summaryEn: string;
  content: string[];
  contentEn: string[];
}

export interface Faq {
  id: string;
  question: string;
  questionEn: string;
  answer: string;
  answerEn: string;
  category?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  source: 'Google Review' | 'WhatsApp' | 'Pasien Terverifikasi';
  stars: number;
  serviceName: string;
  date: string;
  comment: string;
  commentEn: string;
}

export interface GalleryItem {
  id: string;
  serviceSlug: string;
  serviceName: string;
  serviceNameEn: string;
  beforeUrl?: string;
  afterUrl?: string;
  beforeLabel: string;
  afterLabel: string;
  caption: string;
  captionEn: string;
  treatmentDuration: string;
  consentConfirmed: boolean;
}

export interface ClinicSettings {
  name: string;
  tagline: string;
  taglineEn: string;
  address: string;
  city: string;
  phone: string;
  whatsappNumber: string; // e.g. "6281234567890"
  instagramHandle: string;
  googleMapsUrl: string;
  timezone: string;
  openHoursDesc: string;
  openHoursDescEn: string;
  regularHours: {
    weekdays: string; // "Senin – Sabtu"
    weekdaysTime: string; // "09:00 – 20:00 WIB"
    sunday: string; // "Minggu"
    sundayTime: string; // "Tutup"
    breakTime: string; // "Istirahat: 12:00 – 13:00 WIB"
  };
  stats: {
    label: string;
    labelEn: string;
    value: string;
    unit: string;
  }[];
}
