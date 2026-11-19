import { authenticatedFetch } from './auth-session';
import { copy } from '../i18n';
export type { Session } from './auth-session';
export { loginSession as login, refreshSession as refresh, logoutSession as logout } from './auth-session';
export type PaginatedResponse<T> = { items: T[]; total: number; page: number; pageSize: number };
export type PaginationParams = { page?: number; pageSize?: number };
export type ServerPagination = { current: number; pageSize: number; total: number; onChange: (page: number, pageSize: number) => void };
export type BlockedTimeRow = { id: string; label: string; weekdays: number[]; start: string; end: string };
export type Settings = { name: string; phone: string; waNumber: string; address: string; tagline?: string | null; taglineEn?: string | null; city?: string | null; instagramHandle?: string | null; googleMapsUrl?: string | null; timezone: string; adminLocale: 'id' | 'en'; slotStepMinutes: number; bookingLeadMinutes: number; bookingHorizonDays: number; chairsCount: number; turnoverBufferMinutes?: number; blockedTimes?: BlockedTimeRow[]; autoReleaseHours?: number; cancelCutoffHours?: number; paymentMethods?: string[] };
export type Booking = { code: string; status: 'pending' | 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'cancelled' | 'no_show'; createdAt?: string; startsAt: string; endsAt: string; turnoverEndsAt?: string | null; chairIndex?: number | null; parentBookingId?: string | null; complaint?: string | null; notes?: string | null; patient: { name: string; phone: string; noShowCount?: number };
  bookingFor?: 'self' | 'child' | 'other_family' | null; bookerName?: string | null; bookerPhone?: string | null; patientFullName?: string | null; patientBirthDate?: string | null; patientAge?: number | null; patientType?: 'new' | 'returning' | null; payer?: 'umum' | 'asuransi' | null; confirmationExpiresAt?: string | null; confirmedAt?: string | null; consentWhatsappAt?: string | null; consentDataAt?: string | null; doctor: string; doctorId?: string; service: string; serviceId?: string; serviceDuration?: number; requiresConsultation?: boolean };
export type ClinicService = { id: string; slug: string; name: string; shortDesc: string; description: string; zone: 'front' | 'molar' | 'gum' | 'arch'; category: 'prevention' | 'aesthetic' | 'orthodontic' | 'restorative' | 'surgery' | 'pediatric'; durationMinutes: number; requiresConsultation?: boolean; turnoverBufferMinutes?: number | null; priceFrom: string; priceTo: string | null; priceNote: string | null; isActive: boolean; sortOrder: number };
export type ServiceInput = Omit<ClinicService, 'id'>;
export type WorkingHour = { id: string; weekday: number; startTime: string; endTime: string };
export type ClinicDoctor = { id: string; slug: string; name: string; title: string | null; specialty: string | null; photoUrl?: string | null; gender?: 'female' | 'male' | null; sipNumber?: string | null; isActive: boolean; sortOrder: number; services: Array<{ serviceId: string }>; workingHours: WorkingHour[]; _count?: { bookings: number } };
export type DoctorInput = { slug: string; name: string; title?: string | null; specialty?: string | null; photoUrl?: string | null; gender?: 'female' | 'male' | null; sipNumber?: string | null; serviceIds: string[] };
export type WorkingHourInput = { weekday: number; start: string; end: string };
export type TimeOff = { id: string; doctorId: string | null; startsAt: string; endsAt: string; reason: string | null; doctor: { name: string } | null };
export type AdminFaq = { id: string; question: string; answer: string; serviceId: string | null; isPublished: boolean; sortOrder: number };
export type BookingReport = { total: number; noShows: number; noShowRate: number; byService: Record<string, number>; bySource: Record<string, number> };
export type AuditLog = { id: string; action: string; entity: string; entityId: string | null; createdAt: string; user: { name: string; email: string } | null };
export type NotificationLog = { id: string; type: string; status: string; scheduledAt: string; attempts: number; error: string | null; booking: { code: string; patient: { name: string } } };
export type AdminNotification = { id: string; type: string; title: string; body: string; entityType: string | null; entityId: string | null; isRead: boolean; readAt: string | null; createdAt: string };
export type InAppNotificationListResponse = PaginatedResponse<AdminNotification> & { unreadCount: number };
export type AdminUser = { id: string; email: string; name: string; role: 'owner' | 'staff'; isActive: boolean; createdAt: string };
export type Promotion = { id: string; title: string; description: string; serviceId: string | null; startsAt: string; endsAt: string; isPublished: boolean };
export type Testimonial = { id: string; name: string; text: string; rating: number; source: string; isPublished: boolean; sortOrder: number };
export type ArticleCategory = { id: string; name: string; slug: string; sortOrder: number };
export type Article = { id: string; slug: string; title: string; excerpt: string; body: string; categoryId: string | null; coverUrl: string | null; seoTitle: string | null; seoDesc: string | null; publishedAt: string | null; category: ArticleCategory | null };
export type GalleryItem = {
  id: string;
  type: 'before_after' | 'photo';
  beforeUrl: string | null;
  afterUrl: string | null;
  beforeLabel?: string | null;
  afterLabel?: string | null;
  caption: string | null;
  captionEn?: string | null;
  treatmentDuration?: string | null;
  serviceId: string | null;
  service?: { id: string; name: string; nameEn?: string | null; slug: string } | null;
  consentConfirmed: boolean;
  isPublished: boolean;
  sortOrder: number;
};
export type ContentBlock = { key: string; locale: string; content: Record<string, unknown> };
export type Patient = { id: string; name: string; phoneE164: string; notes: string | null; createdAt: string; _count: { bookings: number } };

async function responseError(response: Response) {
  const payload = await response.json().catch(() => null) as { message?: string | string[]; error?: string } | null;
  const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
  return message || payload?.error || copy.apiError;
}

export async function getSettings(accessToken: string): Promise<Settings> {
  const response = await authenticatedFetch('/api/v1/admin/settings', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Settings>;
}

export async function updateSettings(accessToken: string, input: Partial<Settings>): Promise<Settings> {
  const response = await authenticatedFetch('/api/v1/admin/settings', { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Settings>;
}

function buildListUrl(path: string, params?: PaginationParams, extra?: Record<string, string | undefined>) {
  const search = new URLSearchParams();
  if (extra) {
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== '') search.set(k, v);
    }
  }
  if (params?.page) search.set('page', String(params.page));
  if (params?.pageSize) search.set('pageSize', String(params.pageSize));
  const qs = search.toString();
  return `${path}${qs ? `?${qs}` : ''}`;
}

export async function listBookings(
  accessToken: string,
  filter: { from?: string; to?: string; doctorId?: string; status?: string; q?: string; page?: number; pageSize?: number } = {},
): Promise<PaginatedResponse<Booking>> {
  const { page, pageSize, ...rest } = filter;
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/bookings', { page, pageSize }, rest), {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<Booking>>;
}

export async function cancelBooking(accessToken: string, code: string) {
  const response = await authenticatedFetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/cancel`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: '{}' });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function updateBookingStatus(
  accessToken: string,
  code: string,
  status: 'confirmed' | 'arrived' | 'in_chair' | 'completed' | 'no_show',
  options?: { chairIndex?: number; phone?: string },
) {
  const response = await authenticatedFetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/status`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      status,
      ...(options?.chairIndex ? { chairIndex: options.chairIndex } : {}),
      ...(options?.phone ? { phone: options.phone } : {}),
    }),
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function createManualBooking(
  accessToken: string,
  input: {
    name: string;
    phone: string;
    doctorId: string;
    serviceId: string;
    startsAt: string;
    chairIndex?: number;
    parentBookingId?: string;
    complaint?: string;
    isWalkIn?: boolean;
    bookingFor?: 'self' | 'child' | 'other_family';
    booker?: { name: string; phone: string };
    birthDate?: string;
    patientAge?: number;
    patientType?: 'new' | 'returning';
    payer?: 'umum' | 'asuransi';
  },
) {
  const response = await authenticatedFetch('/api/v1/admin/bookings', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function extendBookingTime(accessToken: string, code: string, additionalMinutes: number) {
  const response = await authenticatedFetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/extend`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ additionalMinutes }),
  });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json();
}

export async function updateClinicalNotes(accessToken: string, code: string, notes: string) {
  const response = await authenticatedFetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/clinical-notes`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({ notes }),
  });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json();
}

export type AvailableSlot = { start: string; end: string; doctorId: string };
export async function listAvailableSlots(accessToken: string, input: { serviceId: string; doctorId: string; date: string }): Promise<AvailableSlot[]> {
  const query = new URLSearchParams(input).toString();
  const response = await authenticatedFetch(`/api/v1/public/slots?${query}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<AvailableSlot[]>;
}

export async function listServices(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<ClinicService>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/services', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<ClinicService>>;
}

export async function createService(accessToken: string, input: ServiceInput): Promise<ClinicService> {
  const response = await authenticatedFetch('/api/v1/admin/services', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ClinicService>;
}

export async function updateService(accessToken: string, id: string, input: Partial<ServiceInput>): Promise<ClinicService> {
  const response = await authenticatedFetch(`/api/v1/admin/services/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ClinicService>;
}

export async function listDoctors(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<ClinicDoctor>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/doctors', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<ClinicDoctor>>;
}

export async function createDoctor(accessToken: string, input: DoctorInput): Promise<ClinicDoctor> {
  const response = await authenticatedFetch('/api/v1/admin/doctors', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ClinicDoctor>;
}

export async function updateDoctor(accessToken: string, id: string, input: Partial<DoctorInput & { isActive: boolean }>): Promise<ClinicDoctor> {
  const response = await authenticatedFetch(`/api/v1/admin/doctors/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ClinicDoctor>;
}

export async function deleteDoctor(accessToken: string, id: string) {
  const response = await authenticatedFetch(`/api/v1/admin/doctors/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (response.ok) return;
  const payload = await response.json().catch(() => null) as { message?: string | string[] } | null;
  const message = Array.isArray(payload?.message) ? payload.message.join(', ') : payload?.message;
  throw new Error(message || copy.apiError);
}

export async function replaceWorkingHours(accessToken: string, doctorId: string, input: WorkingHourInput[]): Promise<ClinicDoctor> {
  const response = await authenticatedFetch(`/api/v1/admin/doctors/${encodeURIComponent(doctorId)}/working-hours`, { method: 'PUT', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ClinicDoctor>;
}

export async function createTimeOff(accessToken: string, input: { doctorId?: string; startsAt: string; endsAt: string; reason?: string }): Promise<TimeOff> {
  const response = await authenticatedFetch('/api/v1/admin/time-offs', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<TimeOff>;
}

export async function listTimeOffs(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<TimeOff>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/time-offs', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<TimeOff>>;
}

export async function deleteTimeOff(accessToken: string, id: string) {
  const response = await authenticatedFetch(`/api/v1/admin/time-offs/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function listFaqs(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<AdminFaq>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/faqs', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<AdminFaq>>;
}

export async function createFaq(accessToken: string, input: Pick<AdminFaq, 'question' | 'answer'>): Promise<AdminFaq> {
  const response = await authenticatedFetch('/api/v1/admin/faqs', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<AdminFaq>;
}

export async function updateFaq(accessToken: string, id: string, input: Partial<AdminFaq>): Promise<AdminFaq> {
  const response = await authenticatedFetch(`/api/v1/admin/faqs/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<AdminFaq>;
}

export async function listPromotions(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<Promotion>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/promotions', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<Promotion>>;
}

export async function createPromotion(accessToken: string, input: Omit<Promotion, 'id'>): Promise<Promotion> {
  const response = await authenticatedFetch('/api/v1/admin/promotions', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Promotion>;
}

export async function updatePromotion(accessToken: string, id: string, input: Partial<Omit<Promotion, 'id'>>): Promise<Promotion> {
  const response = await authenticatedFetch(`/api/v1/admin/promotions/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Promotion>;
}

export async function listTestimonials(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<Testimonial>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/testimonials', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<Testimonial>>;
}

export async function createTestimonial(accessToken: string, input: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const response = await authenticatedFetch('/api/v1/admin/testimonials', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Testimonial>;
}

export async function updateTestimonial(accessToken: string, id: string, input: Partial<Omit<Testimonial, 'id'>>): Promise<Testimonial> {
  const response = await authenticatedFetch(`/api/v1/admin/testimonials/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Testimonial>;
}

export async function listArticleCategories(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<ArticleCategory>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/article-categories', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<ArticleCategory>>;
}

export async function createArticleCategory(accessToken: string, input: Omit<ArticleCategory, 'id'>): Promise<ArticleCategory> {
  const response = await authenticatedFetch('/api/v1/admin/article-categories', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ArticleCategory>;
}

export async function updateArticleCategory(accessToken: string, id: string, input: Partial<Omit<ArticleCategory, 'id'>>): Promise<ArticleCategory> {
  const response = await authenticatedFetch(`/api/v1/admin/article-categories/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ArticleCategory>;
}

export async function deleteArticleCategory(accessToken: string, id: string): Promise<void> {
  const response = await authenticatedFetch(`/api/v1/admin/article-categories/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function listArticles(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<Article>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/articles', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<Article>>;
}

export async function createArticle(accessToken: string, input: Omit<Article, 'id' | 'category'>): Promise<Article> {
  const response = await authenticatedFetch('/api/v1/admin/articles', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Article>;
}

export async function updateArticle(accessToken: string, id: string, input: Partial<Omit<Article, 'id' | 'category'>>): Promise<Article> {
  const response = await authenticatedFetch(`/api/v1/admin/articles/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Article>;
}

export async function deleteArticle(accessToken: string, id: string): Promise<void> {
  const response = await authenticatedFetch(`/api/v1/admin/articles/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function listGallery(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<GalleryItem>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/gallery', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<GalleryItem>>;
}

export async function createGalleryItem(accessToken: string, input: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const response = await authenticatedFetch('/api/v1/admin/gallery', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<GalleryItem>;
}

export async function updateGalleryItem(accessToken: string, id: string, input: Partial<Omit<GalleryItem, 'id'>>): Promise<GalleryItem> {
  const response = await authenticatedFetch(`/api/v1/admin/gallery/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<GalleryItem>;
}

export async function deleteGalleryItem(accessToken: string, id: string): Promise<{ success: boolean }> {
  const response = await authenticatedFetch(`/api/v1/admin/gallery/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<{ success: boolean }>;
}

export async function listContentBlocks(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<ContentBlock>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/content', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<ContentBlock>>;
}

export async function saveContentBlock(accessToken: string, key: string, input: Omit<ContentBlock, 'key'>): Promise<ContentBlock> {
  const response = await authenticatedFetch(`/api/v1/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<ContentBlock>;
}

export async function listPatients(accessToken: string, query = '', params?: PaginationParams): Promise<PaginatedResponse<Patient>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/patients', params, query ? { q: query } : undefined), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<Patient>>;
}

export async function updatePatientNotes(accessToken: string, id: string, notes: string | null): Promise<Patient> {
  const response = await authenticatedFetch(`/api/v1/admin/patients/${encodeURIComponent(id)}/notes`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ notes }) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<Patient>;
}

export async function bookingReport(accessToken: string, from: string, to: string): Promise<BookingReport> {
  const response = await authenticatedFetch(`/api/v1/admin/reports/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<BookingReport>;
}

export async function listAuditLogs(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<AuditLog>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/audit-logs', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<AuditLog>>;
}

export async function downloadBookingsCsv(accessToken: string, from: string, to: string) {
  const response = await authenticatedFetch(`/api/v1/admin/export/bookings.csv?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  const href = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a'); anchor.href = href; anchor.download = 'bookings.csv'; anchor.click(); URL.revokeObjectURL(href);
}

export async function listNotifications(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<NotificationLog>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/notifications', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<NotificationLog>>;
}

export async function resendNotification(accessToken: string, id: string) {
  const response = await authenticatedFetch(`/api/v1/admin/notifications/${encodeURIComponent(id)}/resend`, { method: 'POST', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function listInAppNotifications(accessToken: string, params?: PaginationParams): Promise<InAppNotificationListResponse> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/in-app-notifications', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<InAppNotificationListResponse>;
}

export async function markInAppNotificationRead(accessToken: string, id: string) {
  const response = await authenticatedFetch(`/api/v1/admin/in-app-notifications/${encodeURIComponent(id)}/read`, {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export async function markAllInAppNotificationsRead(accessToken: string) {
  const response = await authenticatedFetch('/api/v1/admin/in-app-notifications/read-all', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) throw new Error(await responseError(response));
}

export function subscribeInAppNotifications(
  accessToken: string,
  onNotification: (item: AdminNotification) => void,
): () => void {
  const controller = new AbortController();
  let stopped = false;

  const connect = async () => {
    while (!stopped && !controller.signal.aborted) {
      try {
        const response = await authenticatedFetch('/api/v1/admin/in-app-notifications/stream', {
          headers: { authorization: `Bearer ${accessToken}`, accept: 'text/event-stream' },
          signal: controller.signal,
        });
        if (!response.ok || !response.body) {
          throw new Error(`SSE HTTP ${response.status}`);
        }
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (!stopped) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const frames = buffer.split(/\r?\n\r?\n/);
          buffer = frames.pop() ?? '';
          for (const frame of frames) {
            const lines = frame.split(/\r?\n/);
            let eventType = 'message';
            const dataLines: string[] = [];
            for (const line of lines) {
              if (line.startsWith('event:')) eventType = line.slice(6).trim();
              else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
            }
            if (eventType === 'notification' && dataLines.length > 0) {
              try {
                onNotification(JSON.parse(dataLines.join('\n')) as AdminNotification);
              } catch {
                // ignore malformed frame
              }
            }
          }
        }
      } catch {
        if (stopped || controller.signal.aborted) break;
      }
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  };

  void connect();
  return () => {
    stopped = true;
    controller.abort();
  };
}

export async function listUsers(accessToken: string, params?: PaginationParams): Promise<PaginatedResponse<AdminUser>> {
  const response = await authenticatedFetch(buildListUrl('/api/v1/admin/users', params), { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<PaginatedResponse<AdminUser>>;
}

export async function createUser(accessToken: string, input: { email: string; name: string; role: 'owner' | 'staff'; password: string }): Promise<AdminUser> {
  const response = await authenticatedFetch('/api/v1/admin/users', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<AdminUser>;
}

export async function updateUserActive(accessToken: string, id: string, isActive: boolean): Promise<AdminUser> {
  const response = await authenticatedFetch(`/api/v1/admin/users/${encodeURIComponent(id)}/active`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ isActive }) });
  if (!response.ok) throw new Error(await responseError(response));
  return response.json() as Promise<AdminUser>;
}

export async function uploadDoctorAvatar(accessToken: string, file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await authenticatedFetch('/api/v1/admin/doctors/avatar-upload', {
    method: 'POST', headers: { authorization: `Bearer ${accessToken}` }, body,
  });
  if (!response.ok) throw new Error(await responseError(response));
  const { photoUrl } = await response.json() as { photoUrl: string };
  return photoUrl;
}

export async function uploadGalleryImage(accessToken: string, file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await authenticatedFetch('/api/v1/admin/gallery/upload', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
    body,
  });
  if (!response.ok) throw new Error(await responseError(response));
  const { url } = await response.json() as { url: string };
  return url;
}
