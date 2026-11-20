import type {
  Article,
  ArticleCategory,
  Booking,
  BookingSlot,
  ClinicSettings,
  Doctor,
  DoctorTimeOff,
  Faq,
  GalleryItem,
  Service,
  ServiceCategory,
  Testimonial,
  ToothZone,
} from '../types';

const API_BASE = '/api/v1';

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init?.body ? { 'content-type': 'application/json' } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Permintaan gagal (status ${response.status}).`;
    try {
      const body = (await response.json()) as { message?: unknown };
      if (body?.message) message = Array.isArray(body.message) ? body.message.join(', ') : String(body.message);
    } catch {
      // keep the generic message
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const digits = (value: string) => value.replace(/\D/g, '');

function toE164(input: string): string {
  const value = digits(input);
  if (value.startsWith('62')) return `+${value}`;
  if (value.startsWith('0')) return `+62${value.slice(1)}`;
  return `+${value}`;
}

const CATEGORY_BY_API: Record<string, ServiceCategory> = {
  prevention: 'pencegahan',
  aesthetic: 'estetik',
  orthodontic: 'ortodonti',
  restorative: 'restoratif',
  surgery: 'bedah',
  pediatric: 'anak',
};

const toUiCategory = (value: string): ServiceCategory => CATEGORY_BY_API[value] ?? 'pencegahan';

const timeZoneOffsetMinutes = (date: Date, timeZone: string): number => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(date);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  const asUtc = Date.UTC(read('year'), read('month') - 1, read('day'), read('hour'), read('minute'), read('second'));
  return Math.round((asUtc - date.getTime()) / 60_000);
};

/** Converts a clinic-local wall clock (YYYY-MM-DD + HH:mm in the clinic timezone) to a UTC ISO instant. */
function zonedWallClockToUtc(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const guess = Date.UTC(year, month - 1, day, hour, minute);
  return new Date(guess - timeZoneOffsetMinutes(new Date(guess), timeZone) * 60_000).toISOString();
}

/** Renders a UTC ISO instant as a clinic-local naive ISO string (no offset) for display. */
function toLocalNaive(iso: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(iso));
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? '00';
  return `${read('year')}-${read('month')}-${read('day')}T${read('hour')}:${read('minute')}:${read('second')}`;
}

// ---------------------------------------------------------------------------
// Clinic settings
// ---------------------------------------------------------------------------

type ApiSettings = {
  name: string;
  phone: string;
  waNumber: string;
  address: string;
  timezone: string;
  maintenanceMode: boolean;
  tagline: string | null;
  taglineEn: string | null;
  city: string | null;
  instagramHandle: string | null;
  googleMapsUrl: string | null;
  openHours: unknown;
  stats: unknown;
};

let settingsCache: Promise<ClinicSettings> | null = null;

export function getSettings(): Promise<ClinicSettings> {
  if (!settingsCache) {
    settingsCache = request<ApiSettings>('/public/settings')
      .then(mapSettings)
      .catch((error) => {
        settingsCache = null;
        throw error;
      });
  }
  return settingsCache;
}

function mapSettings(raw: ApiSettings): ClinicSettings {
  const openHours = (raw.openHours ?? {}) as {
    openHoursDesc?: string;
    openHoursDescEn?: string;
    regularHours?: Partial<ClinicSettings['regularHours']>;
  };
  const stats = Array.isArray(raw.stats) ? (raw.stats as ClinicSettings['stats']) : [];

  return {
    name: raw.name,
    tagline: raw.tagline ?? '',
    taglineEn: raw.taglineEn ?? raw.tagline ?? '',
    address: raw.address,
    city: raw.city ?? '',
    phone: raw.phone,
    whatsappNumber: digits(raw.waNumber),
    instagramHandle: raw.instagramHandle ?? '',
    googleMapsUrl: raw.googleMapsUrl ?? '',
    timezone: raw.timezone,
    maintenanceMode: raw.maintenanceMode === true,
    openHoursDesc: openHours.openHoursDesc ?? '',
    openHoursDescEn: openHours.openHoursDescEn ?? openHours.openHoursDesc ?? '',
    regularHours: {
      weekdays: openHours.regularHours?.weekdays ?? '',
      weekdaysTime: openHours.regularHours?.weekdaysTime ?? '',
      sunday: openHours.regularHours?.sunday ?? '',
      sundayTime: openHours.regularHours?.sundayTime ?? '',
      breakTime: openHours.regularHours?.breakTime ?? '',
    },
    stats: stats.map((stat) => ({
      label: stat.label,
      labelEn: stat.labelEn,
      value: stat.value,
      unit: stat.unit,
    })),
    paymentMethods: (raw as any).paymentMethods ?? ['QRIS', 'GoPay', 'OVO', 'DANA', 'Debit / Kredit', 'Asuransi'],
    cancelCutoffHours: (raw as any).cancelCutoffHours ?? 3,
    autoReleaseHours: (raw as any).autoReleaseHours ?? 2,
    blockedTimes: (raw as any).blockedTimes ?? [],
  };
}

// ---------------------------------------------------------------------------
// Services
// ---------------------------------------------------------------------------

type ApiServiceFaq = { question: string; questionEn: string | null; answer: string; answerEn: string | null };

type ApiService = {
  id: string;
  slug: string;
  name: string;
  nameEn: string | null;
  shortDesc: string;
  shortDescEn: string | null;
  description: string;
  descriptionEn: string | null;
  zone: string;
  category: string;
  durationMinutes: number;
  priceFrom: string;
  priceTo: string | null;
  priceNote: string | null;
  priceNoteEn: string | null;
  faqs: ApiServiceFaq[];
};

function mapService(raw: ApiService): Service {
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    nameEn: raw.nameEn ?? raw.name,
    category: toUiCategory(raw.category),
    zone: raw.zone as ToothZone,
    shortDesc: raw.shortDesc,
    shortDescEn: raw.shortDescEn ?? raw.shortDesc,
    description: raw.description,
    descriptionEn: raw.descriptionEn ?? raw.description,
    durationMinutes: raw.durationMinutes,
    priceFrom: Number(raw.priceFrom),
    priceTo: raw.priceTo != null ? Number(raw.priceTo) : undefined,
    priceNote: raw.priceNote ?? undefined,
    priceNoteEn: raw.priceNoteEn ?? undefined,
    faqs: (raw.faqs ?? []).map((faq) => ({
      question: faq.question,
      questionEn: faq.questionEn ?? faq.question,
      answer: faq.answer,
      answerEn: faq.answerEn ?? faq.answer,
    })),
  };
}

export async function getServices(): Promise<Service[]> {
  const raw = await request<ApiService[]>('/public/services');
  return raw.map(mapService);
}

export async function getService(slug: string): Promise<Service | null> {
  const services = await getServices();
  return services.find((service) => service.slug === slug || service.id === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Doctors
// ---------------------------------------------------------------------------

type ApiDoctorWorkingHour = { weekday: number; start: string; end: string };

type ApiDoctorTimeOff = {
  id: string;
  doctorId?: string | null;
  startsAt: string;
  endsAt: string;
  reason?: string | null;
};

type ApiDoctor = {
  id: string;
  name: string;
  slug: string;
  title: string | null;
  titleEn: string | null;
  specialty: string | null;
  specialtyEn: string | null;
  bio: string | null;
  bioEn: string | null;
  photoUrl: string | null;
  sipNumber: string | null;
  experienceYears: number | null;
  education: string[];
  serviceIds: string[];
  workingHours: ApiDoctorWorkingHour[];
  timeOffs?: ApiDoctorTimeOff[];
};

function mapDoctor(raw: ApiDoctor): Doctor {
  const years = raw.experienceYears;
  return {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    title: raw.title ?? '',
    titleEn: raw.titleEn ?? raw.title ?? '',
    specialty: raw.specialty ?? '',
    specialtyEn: raw.specialtyEn ?? raw.specialty ?? '',
    bio: raw.bio ?? '',
    bioEn: raw.bioEn ?? raw.bio ?? '',
    photoUrl: raw.photoUrl ?? '',
    serviceIds: raw.serviceIds,
    workingHours: raw.workingHours.map((hour) => ({ weekday: hour.weekday, start: hour.start, end: hour.end })),
    timeOffs: (raw.timeOffs || []).map((t) => ({
      id: t.id,
      doctorId: t.doctorId,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      reason: t.reason,
    })),
    education: raw.education ?? [],
    sipNumber: raw.sipNumber ?? undefined,
    gender: (raw as any).gender ?? null,
    experienceYears: years ?? undefined,
    experience: years ? `${years}+ Tahun Pengalaman Klinis` : undefined,
    experienceEn: years ? `${years}+ Years Clinical Experience` : undefined,
  };
}

export async function getDoctors(): Promise<Doctor[]> {
  const raw = await request<ApiDoctor[]>('/public/doctors');
  return raw
    .map(mapDoctor)
    .filter((doc) => doc.slug !== 'dev' && doc.name.toLowerCase() !== 'dev' && doc.title !== 'dra oaovoaa');
}

export async function getPublicTimeOffs(): Promise<DoctorTimeOff[]> {
  try {
    const raw = await request<ApiDoctorTimeOff[]>('/public/doctors/time-offs');
    return raw.map((t) => ({
      id: t.id,
      doctorId: t.doctorId,
      startsAt: t.startsAt,
      endsAt: t.endsAt,
      reason: t.reason,
    }));
  } catch {
    return [];
  }
}

export async function getDoctor(slug: string): Promise<Doctor | null> {
  const doctors = await getDoctors();
  return doctors.find((doctor) => doctor.slug === slug || doctor.id === slug) ?? null;
}

// ---------------------------------------------------------------------------
// Availability & booking
// ---------------------------------------------------------------------------

export interface GetSlotsParams {
  serviceId: string;
  doctorId?: string; // 'any' or doctor ID
  date: string; // YYYY-MM-DD
}

export async function getSlots(params: GetSlotsParams): Promise<BookingSlot[]> {
  try {
    const search = new URLSearchParams({ serviceId: params.serviceId, date: params.date });
    if (params.doctorId && params.doctorId !== 'any') search.set('doctorId', params.doctorId);

    const slots = await request<Array<{ start: string; end: string; doctorId: string }>>(`/public/slots?${search.toString()}`);
    return slots
      .map((slot) => ({ time: slot.start, available: true, doctorId: slot.doctorId }))
      .sort((left, right) => left.time.localeCompare(right.time));
  } catch {
    // Dynamic duration-based fallback (service duration + 15 min turnover buffer)
    const services = await getServices().catch(() => []);
    const foundSvc = services.find((s) => s.id === params.serviceId || s.slug === params.serviceId);
    const duration = foundSvc?.durationMinutes || 45;
    const turnover = foundSvc?.turnoverBufferMinutes || 15;
    const step = duration + turnover;

    const dateObj = new Date(params.date + 'T00:00:00+07:00');
    const isFriday = dateObj.getDay() === 5;
    const blockedStart = isFriday ? 11 * 60 + 30 : 12 * 60;
    const blockedEnd = 13 * 60;

    const slots: BookingSlot[] = [];
    const openMinute = 9 * 60; // 09:00
    const closeMinute = 19 * 60 + 30; // 19:30

    for (let cursor = openMinute; cursor + duration <= closeMinute; cursor += step) {
      const slotEnd = cursor + duration;
      // Skip if overlaps Friday prayer or lunch
      if (cursor < blockedEnd && blockedStart < slotEnd) {
        continue;
      }
      const hour = String(Math.floor(cursor / 60)).padStart(2, '0');
      const minute = String(cursor % 60).padStart(2, '0');
      slots.push({
        time: `${hour}:${minute}`,
        available: true,
        doctorId: params.doctorId || 'any',
      });
    }

    return slots;
  }
}

export interface CreateBookingPayload {
  serviceId: string;
  doctorId: string; // doctor ID or 'any'
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patient: { name: string; phone?: string };
  complaint?: string;
  honeypot?: string; // Bot protection
  bookingFor?: 'self' | 'child' | 'other_family';
  booker?: { name: string; phone: string };
  patientAge?: number;
  patientType?: 'new' | 'returning';
  birthDate?: string;
  payer?: 'umum' | 'asuransi';
  whatsappConsent?: boolean;
  dataProcessingConsent?: boolean;
}

type ApiCreatedBooking = {
  code: string;
  status: string;
  manageToken: string;
  doctorId: string;
  serviceId: string;
  startsAt: string;
  endsAt: string;
};

export async function createBooking(payload: CreateBookingPayload): Promise<Booking> {
  const timezone = (await getSettings()).timezone;
  const name = payload.patient.name.trim();
  const phone = payload.patient.phone?.trim() ? toE164(payload.patient.phone) : undefined;

  const body = {
    name,
    ...(phone ? { phone } : {}),
    serviceId: payload.serviceId,
    ...(payload.doctorId && payload.doctorId !== 'any' ? { doctorId: payload.doctorId } : {}),
    startsAt: zonedWallClockToUtc(payload.date, payload.time, timezone),
    ...(payload.complaint ? { complaint: payload.complaint.trim() } : {}),
    bookingFor: payload.bookingFor ?? 'self',
    ...(payload.booker ? { booker: { name: payload.booker.name.trim(), phone: toE164(payload.booker.phone) } } : {}),
    ...(payload.patientAge !== undefined ? { patientAge: payload.patientAge } : {}),
    patientType: payload.patientType ?? 'new',
    ...(payload.birthDate ? { birthDate: payload.birthDate } : {}),
    payer: payload.payer ?? 'umum',
    whatsappConsent: payload.whatsappConsent ?? true,
    dataProcessingConsent: payload.dataProcessingConsent ?? true,
    website: payload.honeypot ?? '',
  };

  const created = await request<ApiCreatedBooking>('/public/bookings', { method: 'POST', body: JSON.stringify(body) });

  return {
    id: created.code,
    code: created.code,
    token: created.manageToken,
    serviceId: created.serviceId,
    doctorId: created.doctorId,
    startsAt: toLocalNaive(created.startsAt, timezone),
    endsAt: toLocalNaive(created.endsAt, timezone),
    status: created.status as Booking['status'],
    patient: { name, phone: phone ?? '' },
    complaint: payload.complaint?.trim(),
    createdAt: new Date().toISOString(),
  };
}

type ApiBookingSummary = {
  code: string;
  status: string;
  startsAt: string;
  endsAt: string;
  doctorId: string;
  serviceId: string;
  patient?: { name: string; phone: string };
  complaint: string | null;
};

export async function getBooking(code: string, token?: string, phone?: string): Promise<Booking | null> {
  const query = new URLSearchParams();
  if (token) query.set('token', token);
  if (phone) query.set('phone', phone);
  const qs = query.toString() ? `?${query.toString()}` : '';
  try {
    const summary = await request<ApiBookingSummary & { canManage?: boolean }>(`/public/bookings/${encodeURIComponent(code)}${qs}`);
    const timezone = (await getSettings()).timezone;
    return {
      id: summary.code,
      code: summary.code,
      token,
      serviceId: summary.serviceId,
      doctorId: summary.doctorId,
      startsAt: toLocalNaive(summary.startsAt, timezone),
      endsAt: toLocalNaive(summary.endsAt, timezone),
      status: summary.status as Booking['status'],
      patient: summary.patient ?? { name: '', phone: '' },
      complaint: summary.complaint ?? undefined,
      canManage: summary.canManage ?? Boolean(token),
      createdAt: summary.startsAt,
    };
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) return null;
    throw error;
  }
}

export async function cancelBooking(code: string, token?: string, phone?: string): Promise<Booking> {
  if (!token && !phone) throw new ApiError('Token atau nomor HP diperlukan untuk membatalkan booking.', 403);
  await request(`/public/bookings/${encodeURIComponent(code)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ token, phone }),
  });
  const booking = await getBooking(code, token, phone);
  if (!booking) throw new ApiError('Booking tidak ditemukan.', 404);
  return { ...booking, status: 'cancelled' };
}

export interface ReschedulePayload {
  newDate: string;
  newTime: string;
  token?: string;
  phone?: string;
}

export async function rescheduleBooking(code: string, payload: ReschedulePayload): Promise<Booking> {
  if (!payload.token && !payload.phone) throw new ApiError('Token atau nomor HP diperlukan untuk mengubah jadwal.', 403);
  const timezone = (await getSettings()).timezone;
  await request(`/public/bookings/${encodeURIComponent(code)}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({
      token: payload.token,
      phone: payload.phone,
      startsAt: zonedWallClockToUtc(payload.newDate, payload.newTime, timezone),
    }),
  });
  const booking = await getBooking(code, payload.token, payload.phone);
  if (!booking) throw new ApiError('Booking tidak ditemukan.', 404);
  return booking;
}

// ---------------------------------------------------------------------------
// FAQ, testimonials, gallery, articles
// ---------------------------------------------------------------------------

type ApiFaq = { id: string; question: string; questionEn: string | null; answer: string; answerEn: string | null; category: string | null };

export async function getFaqs(): Promise<Faq[]> {
  const raw = await request<ApiFaq[]>('/public/faqs');
  return raw.map((faq) => ({
    id: faq.id,
    question: faq.question,
    questionEn: faq.questionEn ?? faq.question,
    answer: faq.answer,
    answerEn: faq.answerEn ?? faq.answer,
    category: faq.category ?? undefined,
  }));
}

type ApiTestimonial = {
  id: string;
  name: string;
  text: string;
  textEn: string | null;
  serviceName: string | null;
  serviceNameEn: string | null;
  reviewedAt: string | null;
  rating: number;
  source: string;
};

const TESTIMONIAL_SOURCES = ['Google Review', 'WhatsApp', 'Pasien Terverifikasi'];

export async function getTestimonials(): Promise<Testimonial[]> {
  const raw = await request<ApiTestimonial[]>('/public/testimonials');
  return raw.map((item) => ({
    id: item.id,
    name: item.name,
    source: TESTIMONIAL_SOURCES.includes(item.source) ? (item.source as Testimonial['source']) : 'Google Review',
    stars: item.rating,
    serviceName: item.serviceName ?? '',
    date: item.reviewedAt ?? '',
    comment: item.text,
    commentEn: item.textEn ?? item.text,
  }));
}

type ApiGalleryItem = {
  id: string;
  type: string;
  beforeUrl: string | null;
  afterUrl: string | null;
  beforeLabel: string | null;
  afterLabel: string | null;
  caption: string | null;
  captionEn: string | null;
  treatmentDuration: string | null;
  serviceId: string | null;
  consentConfirmed: boolean;
};

export async function getGallery(): Promise<GalleryItem[]> {
  const [raw, services] = await Promise.all([
    request<ApiGalleryItem[]>('/public/gallery'),
    getServices().catch(() => [] as Service[]),
  ]);
  const byId = new Map(services.map((service) => [service.id, service]));

  return raw.map((item) => {
    const service = item.serviceId ? byId.get(item.serviceId) : undefined;
    return {
      id: item.id,
      serviceSlug: service?.slug ?? '',
      serviceName: service?.name ?? '',
      serviceNameEn: service?.nameEn ?? service?.name ?? '',
      beforeUrl: item.beforeUrl ?? undefined,
      afterUrl: item.afterUrl ?? undefined,
      beforeLabel: item.beforeLabel ?? '',
      afterLabel: item.afterLabel ?? '',
      caption: item.caption ?? '',
      captionEn: item.captionEn ?? item.caption ?? '',
      treatmentDuration: item.treatmentDuration ?? '',
      consentConfirmed: item.consentConfirmed,
    };
  });
}

type ApiArticleCategory = { name: string; nameEn: string | null; slug: string };

type ApiArticle = {
  id: string;
  slug: string;
  title: string;
  titleEn: string | null;
  excerpt: string;
  excerptEn: string | null;
  body: string;
  bodyEn: string | null;
  coverUrl?: string | null;
  readTime: string | null;
  authorName: string | null;
  authorTitle: string | null;
  publishedAt: string | null;
  category: ApiArticleCategory | null;
};

const ARTICLE_CATEGORIES: ArticleCategory[] = ['kesehatan-gigi', 'ortodonti', 'estetik', 'anak', 'bedah'];

const toUiArticleCategory = (slug?: string | null): ArticleCategory =>
  (ARTICLE_CATEGORIES as string[]).includes(slug ?? '') ? (slug as ArticleCategory) : 'kesehatan-gigi';

const splitBody = (body: string): string[] =>
  body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

function mapArticle(raw: ApiArticle): Article {
  return {
    id: raw.id,
    slug: raw.slug,
    title: raw.title,
    titleEn: raw.titleEn ?? raw.title,
    category: toUiArticleCategory(raw.category?.slug),
    categoryName: raw.category?.name ?? '',
    categoryNameEn: raw.category?.nameEn ?? raw.category?.name ?? '',
    readTime: raw.readTime ?? '',
    publishedAt: (raw.publishedAt ?? '').slice(0, 10),
    authorName: raw.authorName ?? '',
    authorTitle: raw.authorTitle ?? '',
    summary: raw.excerpt,
    summaryEn: raw.excerptEn ?? raw.excerpt,
    content: splitBody(raw.body),
    contentEn: splitBody(raw.bodyEn ?? raw.body),
    coverUrl: raw.coverUrl ?? null,
  };
}

export async function getArticles(): Promise<Article[]> {
  const raw = await request<ApiArticle[]>('/public/articles');
  return raw.map(mapArticle);
}

export async function getArticle(slug: string): Promise<Article | null> {
  try {
    return mapArticle(await request<ApiArticle>(`/public/articles/${encodeURIComponent(slug)}`));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
