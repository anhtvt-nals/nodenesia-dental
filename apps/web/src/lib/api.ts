import type {
  Article,
  ArticleCategory,
  Booking,
  BookingSlot,
  ClinicSettings,
  Doctor,
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
    education: raw.education ?? [],
    sipNumber: raw.sipNumber ?? undefined,
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
    // Graceful offline fallback: realistic clinic appointment slots
    const defaultSlots = [
      '09:00', '09:45', '10:30', '11:15',
      '13:30', '14:15', '15:00', '15:45', '16:30', '17:15', '18:00', '18:45'
    ];
    return defaultSlots.map((time) => ({
      time,
      available: true,
      doctorId: params.doctorId || 'any',
    }));
  }
}

export interface CreateBookingPayload {
  serviceId: string;
  doctorId: string; // doctor ID or 'any'
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  patient: { name: string; phone: string };
  complaint?: string;
  honeypot?: string; // Bot protection
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
  const phone = toE164(payload.patient.phone);

  const body = {
    name,
    phone,
    serviceId: payload.serviceId,
    ...(payload.doctorId && payload.doctorId !== 'any' ? { doctorId: payload.doctorId } : {}),
    startsAt: zonedWallClockToUtc(payload.date, payload.time, timezone),
    ...(payload.complaint ? { complaint: payload.complaint.trim() } : {}),
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
    patient: { name, phone },
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

export async function getBooking(code: string, token?: string): Promise<Booking | null> {
  if (!token) throw new ApiError('Token pengelolaan booking diperlukan.', 403);
  try {
    const summary = await request<ApiBookingSummary>(`/public/bookings/${encodeURIComponent(code)}?token=${encodeURIComponent(token)}`);
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
      createdAt: summary.startsAt,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function cancelBooking(code: string, token?: string): Promise<Booking> {
  if (!token) throw new ApiError('Token pengelolaan booking diperlukan.', 403);
  await request(`/public/bookings/${encodeURIComponent(code)}/cancel`, { method: 'PATCH', body: JSON.stringify({ token }) });
  const booking = await getBooking(code, token);
  if (!booking) throw new ApiError('Booking tidak ditemukan.', 404);
  return { ...booking, status: 'cancelled' };
}

export interface ReschedulePayload {
  newDate: string;
  newTime: string;
  token?: string;
}

export async function rescheduleBooking(code: string, payload: ReschedulePayload): Promise<Booking> {
  if (!payload.token) throw new ApiError('Token pengelolaan booking diperlukan.', 403);
  const timezone = (await getSettings()).timezone;
  await request(`/public/bookings/${encodeURIComponent(code)}/reschedule`, {
    method: 'PATCH',
    body: JSON.stringify({ token: payload.token, startsAt: zonedWallClockToUtc(payload.newDate, payload.newTime, timezone) }),
  });
  const booking = await getBooking(code, payload.token);
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
