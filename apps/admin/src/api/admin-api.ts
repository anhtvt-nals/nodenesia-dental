export type Session = { accessToken: string; user: { name: string; role: string } };
export type Settings = { name: string; timezone: string; slotStepMinutes: number; bookingLeadMinutes: number; bookingHorizonDays: number; chairsCount: number; reminderTemplates: Partial<Record<'confirmation' | 'reminder_h1' | 'reminder_2h' | 'review_request', string>> };
export type Booking = { code: string; status: string; startsAt: string; patient: { name: string; phone: string }; doctor: string; service: string };
export type ClinicService = { id: string; slug: string; name: string; shortDesc: string; description: string; zone: 'front' | 'molar' | 'gum' | 'arch'; category: 'prevention' | 'aesthetic' | 'orthodontic' | 'restorative' | 'surgery' | 'pediatric'; durationMinutes: number; priceFrom: string; priceTo: string | null; priceNote: string | null; isActive: boolean; sortOrder: number };
export type ServiceInput = Omit<ClinicService, 'id'>;
export type WorkingHour = { id: string; weekday: number; startTime: string; endTime: string };
export type ClinicDoctor = { id: string; slug: string; name: string; title: string | null; specialty: string | null; isActive: boolean; sortOrder: number; services: Array<{ serviceId: string }>; workingHours: WorkingHour[] };
export type DoctorInput = { slug: string; name: string; title?: string | null; specialty?: string | null; serviceIds: string[] };
export type WorkingHourInput = { weekday: number; start: string; end: string };
export type TimeOff = { id: string; doctorId: string | null; startsAt: string; endsAt: string; reason: string | null; doctor: { name: string } | null };
export type AdminFaq = { id: string; question: string; answer: string; serviceId: string | null; isPublished: boolean; sortOrder: number };
export type BookingReport = { total: number; noShows: number; noShowRate: number; byService: Record<string, number>; bySource: Record<string, number> };
export type AuditLog = { id: string; action: string; entity: string; entityId: string | null; createdAt: string; user: { name: string; email: string } | null };
export type NotificationLog = { id: string; type: string; status: string; scheduledAt: string; attempts: number; error: string | null; booking: { code: string; patient: { name: string } } };
export type AdminUser = { id: string; email: string; name: string; role: 'owner' | 'staff'; isActive: boolean; createdAt: string };
export type Promotion = { id: string; title: string; description: string; serviceId: string | null; startsAt: string; endsAt: string; isPublished: boolean };
export type Testimonial = { id: string; name: string; text: string; rating: number; source: string; isPublished: boolean; sortOrder: number };
export type ArticleCategory = { id: string; name: string; slug: string; sortOrder: number };
export type Article = { id: string; slug: string; title: string; excerpt: string; body: string; categoryId: string | null; coverUrl: string | null; seoTitle: string | null; seoDesc: string | null; publishedAt: string | null; category: ArticleCategory | null };
export type GalleryItem = { id: string; type: 'before_after' | 'photo'; beforeUrl: string | null; afterUrl: string | null; caption: string | null; serviceId: string | null; consentConfirmed: boolean; isPublished: boolean; sortOrder: number };
export type ContentBlock = { key: string; locale: string; content: Record<string, unknown> };
export type Patient = { id: string; name: string; phoneE164: string; notes: string | null; createdAt: string; _count: { bookings: number } };

export async function login(email: string, password: string): Promise<Session> {
  const response = await fetch('/api/v1/auth/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email, password }) });
  if (!response.ok) throw new Error('Email hoặc mật khẩu không hợp lệ.');
  return response.json() as Promise<Session>;
}

export async function refresh(): Promise<Session> {
  const response = await fetch('/api/v1/auth/refresh', { method: 'POST' });
  if (!response.ok) throw new Error('Phiên đăng nhập đã hết hạn.');
  return response.json() as Promise<Session>;
}

export async function logout() {
  await fetch('/api/v1/auth/logout', { method: 'POST' });
}

export async function getSettings(accessToken: string): Promise<Settings> {
  const response = await fetch('/api/v1/admin/settings', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải cấu hình phòng khám.');
  return response.json() as Promise<Settings>;
}

export async function updateSettings(accessToken: string, input: Partial<Settings>): Promise<Settings> {
  const response = await fetch('/api/v1/admin/settings', { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể lưu cấu hình phòng khám.');
  return response.json() as Promise<Settings>;
}

export async function listBookings(accessToken: string, filter: { doctorId?: string; status?: string } = {}): Promise<Booking[]> {
  const query = new URLSearchParams(filter).toString();
  const response = await fetch(`/api/v1/admin/bookings${query ? `?${query}` : ''}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải lịch hẹn.');
  return response.json() as Promise<Booking[]>;
}

export async function cancelBooking(accessToken: string, code: string) {
  const response = await fetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/cancel`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: '{}' });
  if (!response.ok) throw new Error('Không thể hủy lịch hẹn.');
}

export async function updateBookingStatus(accessToken: string, code: string, status: 'confirmed' | 'completed' | 'no_show') {
  const response = await fetch(`/api/v1/admin/bookings/${encodeURIComponent(code)}/status`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ status }) });
  if (!response.ok) throw new Error('Không thể đổi trạng thái lịch hẹn.');
}

export async function createManualBooking(accessToken: string, input: { name: string; phone: string; doctorId: string; serviceId: string; startsAt: string }) {
  const response = await fetch('/api/v1/admin/bookings', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo lịch hẹn; slot có thể không còn trống.');
}

export async function listServices(accessToken: string): Promise<ClinicService[]> {
  const response = await fetch('/api/v1/admin/services', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải danh mục dịch vụ.');
  return response.json() as Promise<ClinicService[]>;
}

export async function createService(accessToken: string, input: ServiceInput): Promise<ClinicService> {
  const response = await fetch('/api/v1/admin/services', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo dịch vụ.');
  return response.json() as Promise<ClinicService>;
}

export async function updateService(accessToken: string, id: string, input: Partial<ServiceInput>): Promise<ClinicService> {
  const response = await fetch(`/api/v1/admin/services/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật dịch vụ.');
  return response.json() as Promise<ClinicService>;
}

export async function listDoctors(accessToken: string): Promise<ClinicDoctor[]> {
  const response = await fetch('/api/v1/admin/doctors', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải danh sách bác sĩ.');
  return response.json() as Promise<ClinicDoctor[]>;
}

export async function createDoctor(accessToken: string, input: DoctorInput): Promise<ClinicDoctor> {
  const response = await fetch('/api/v1/admin/doctors', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo bác sĩ.');
  return response.json() as Promise<ClinicDoctor>;
}

export async function updateDoctor(accessToken: string, id: string, input: Partial<DoctorInput & { isActive: boolean }>): Promise<ClinicDoctor> {
  const response = await fetch(`/api/v1/admin/doctors/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật bác sĩ.');
  return response.json() as Promise<ClinicDoctor>;
}

export async function replaceWorkingHours(accessToken: string, doctorId: string, input: WorkingHourInput[]): Promise<ClinicDoctor> {
  const response = await fetch(`/api/v1/admin/doctors/${encodeURIComponent(doctorId)}/working-hours`, { method: 'PUT', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể lưu giờ làm việc.');
  return response.json() as Promise<ClinicDoctor>;
}

export async function createTimeOff(accessToken: string, input: { doctorId?: string; startsAt: string; endsAt: string; reason?: string }): Promise<TimeOff> {
  const response = await fetch('/api/v1/admin/time-offs', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể lưu lịch nghỉ.');
  return response.json() as Promise<TimeOff>;
}

export async function listTimeOffs(accessToken: string): Promise<TimeOff[]> {
  const response = await fetch('/api/v1/admin/time-offs', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải lịch nghỉ.');
  return response.json() as Promise<TimeOff[]>;
}

export async function deleteTimeOff(accessToken: string, id: string) {
  const response = await fetch(`/api/v1/admin/time-offs/${encodeURIComponent(id)}`, { method: 'DELETE', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể xóa lịch nghỉ.');
}

export async function listFaqs(accessToken: string): Promise<AdminFaq[]> {
  const response = await fetch('/api/v1/admin/faqs', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải FAQ.');
  return response.json() as Promise<AdminFaq[]>;
}

export async function createFaq(accessToken: string, input: Pick<AdminFaq, 'question' | 'answer'>): Promise<AdminFaq> {
  const response = await fetch('/api/v1/admin/faqs', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo FAQ.');
  return response.json() as Promise<AdminFaq>;
}

export async function updateFaq(accessToken: string, id: string, input: Partial<AdminFaq>): Promise<AdminFaq> {
  const response = await fetch(`/api/v1/admin/faqs/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật FAQ.');
  return response.json() as Promise<AdminFaq>;
}

export async function listPromotions(accessToken: string): Promise<Promotion[]> {
  const response = await fetch('/api/v1/admin/promotions', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải khuyến mãi.');
  return response.json() as Promise<Promotion[]>;
}

export async function createPromotion(accessToken: string, input: Omit<Promotion, 'id'>): Promise<Promotion> {
  const response = await fetch('/api/v1/admin/promotions', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo khuyến mãi.');
  return response.json() as Promise<Promotion>;
}

export async function updatePromotion(accessToken: string, id: string, input: Partial<Omit<Promotion, 'id'>>): Promise<Promotion> {
  const response = await fetch(`/api/v1/admin/promotions/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật khuyến mãi.');
  return response.json() as Promise<Promotion>;
}

export async function listTestimonials(accessToken: string): Promise<Testimonial[]> {
  const response = await fetch('/api/v1/admin/testimonials', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải đánh giá.');
  return response.json() as Promise<Testimonial[]>;
}

export async function createTestimonial(accessToken: string, input: Omit<Testimonial, 'id'>): Promise<Testimonial> {
  const response = await fetch('/api/v1/admin/testimonials', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo đánh giá.');
  return response.json() as Promise<Testimonial>;
}

export async function updateTestimonial(accessToken: string, id: string, input: Partial<Omit<Testimonial, 'id'>>): Promise<Testimonial> {
  const response = await fetch(`/api/v1/admin/testimonials/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật đánh giá.');
  return response.json() as Promise<Testimonial>;
}

export async function listArticleCategories(accessToken: string): Promise<ArticleCategory[]> {
  const response = await fetch('/api/v1/admin/article-categories', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải danh mục bài viết.');
  return response.json() as Promise<ArticleCategory[]>;
}

export async function createArticleCategory(accessToken: string, input: Omit<ArticleCategory, 'id'>): Promise<ArticleCategory> {
  const response = await fetch('/api/v1/admin/article-categories', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo danh mục bài viết.');
  return response.json() as Promise<ArticleCategory>;
}

export async function listArticles(accessToken: string): Promise<Article[]> {
  const response = await fetch('/api/v1/admin/articles', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải bài viết.');
  return response.json() as Promise<Article[]>;
}

export async function createArticle(accessToken: string, input: Omit<Article, 'id' | 'category'>): Promise<Article> {
  const response = await fetch('/api/v1/admin/articles', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo bài viết.');
  return response.json() as Promise<Article>;
}

export async function updateArticle(accessToken: string, id: string, input: Partial<Omit<Article, 'id' | 'category'>>): Promise<Article> {
  const response = await fetch(`/api/v1/admin/articles/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật bài viết.');
  return response.json() as Promise<Article>;
}

export async function listGallery(accessToken: string): Promise<GalleryItem[]> {
  const response = await fetch('/api/v1/admin/gallery', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải gallery.');
  return response.json() as Promise<GalleryItem[]>;
}

export async function createGalleryItem(accessToken: string, input: Omit<GalleryItem, 'id'>): Promise<GalleryItem> {
  const response = await fetch('/api/v1/admin/gallery', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo ảnh gallery.');
  return response.json() as Promise<GalleryItem>;
}

export async function updateGalleryItem(accessToken: string, id: string, input: Partial<Omit<GalleryItem, 'id'>>): Promise<GalleryItem> {
  const response = await fetch(`/api/v1/admin/gallery/${encodeURIComponent(id)}`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể cập nhật gallery.');
  return response.json() as Promise<GalleryItem>;
}

export async function listContentBlocks(accessToken: string): Promise<ContentBlock[]> {
  const response = await fetch('/api/v1/admin/content', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải content blocks.');
  return response.json() as Promise<ContentBlock[]>;
}

export async function saveContentBlock(accessToken: string, key: string, input: Omit<ContentBlock, 'key'>): Promise<ContentBlock> {
  const response = await fetch(`/api/v1/admin/content/${encodeURIComponent(key)}`, { method: 'PUT', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể lưu content block.');
  return response.json() as Promise<ContentBlock>;
}

export async function listPatients(accessToken: string, query = ''): Promise<Patient[]> {
  const suffix = query ? `?q=${encodeURIComponent(query)}` : '';
  const response = await fetch(`/api/v1/admin/patients${suffix}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải bệnh nhân.');
  return response.json() as Promise<Patient[]>;
}

export async function updatePatientNotes(accessToken: string, id: string, notes: string | null): Promise<Patient> {
  const response = await fetch(`/api/v1/admin/patients/${encodeURIComponent(id)}/notes`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ notes }) });
  if (!response.ok) throw new Error('Không thể lưu ghi chú bệnh nhân.');
  return response.json() as Promise<Patient>;
}

export async function bookingReport(accessToken: string, from: string, to: string): Promise<BookingReport> {
  const response = await fetch(`/api/v1/admin/reports/bookings?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải báo cáo.');
  return response.json() as Promise<BookingReport>;
}

export async function listAuditLogs(accessToken: string): Promise<AuditLog[]> {
  const response = await fetch('/api/v1/admin/audit-logs', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải audit log.');
  return response.json() as Promise<AuditLog[]>;
}

export async function downloadBookingsCsv(accessToken: string, from: string, to: string) {
  const response = await fetch(`/api/v1/admin/export/bookings.csv?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể xuất CSV.');
  const href = URL.createObjectURL(await response.blob());
  const anchor = document.createElement('a'); anchor.href = href; anchor.download = 'bookings.csv'; anchor.click(); URL.revokeObjectURL(href);
}

export async function listNotifications(accessToken: string): Promise<NotificationLog[]> {
  const response = await fetch('/api/v1/admin/notifications', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải notification log.');
  return response.json() as Promise<NotificationLog[]>;
}

export async function resendNotification(accessToken: string, id: string) {
  const response = await fetch(`/api/v1/admin/notifications/${encodeURIComponent(id)}/resend`, { method: 'POST', headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể xếp lại notification.');
}

export async function listUsers(accessToken: string): Promise<AdminUser[]> {
  const response = await fetch('/api/v1/admin/users', { headers: { authorization: `Bearer ${accessToken}` } });
  if (!response.ok) throw new Error('Không thể tải tài khoản.');
  return response.json() as Promise<AdminUser[]>;
}

export async function createUser(accessToken: string, input: { email: string; name: string; role: 'owner' | 'staff'; password: string }): Promise<AdminUser> {
  const response = await fetch('/api/v1/admin/users', { method: 'POST', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify(input) });
  if (!response.ok) throw new Error('Không thể tạo tài khoản.');
  return response.json() as Promise<AdminUser>;
}

export async function updateUserActive(accessToken: string, id: string, isActive: boolean): Promise<AdminUser> {
  const response = await fetch(`/api/v1/admin/users/${encodeURIComponent(id)}/active`, { method: 'PATCH', headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }, body: JSON.stringify({ isActive }) });
  if (!response.ok) throw new Error('Không thể đổi trạng thái tài khoản.');
  return response.json() as Promise<AdminUser>;
}
