import { useEffect, useState } from 'react';
import { cancelBooking, getSettings, listArticleCategories, listArticles, listAuditLogs, listBookings, listContentBlocks, listDoctors, listFaqs, listGallery, listNotifications, listPatients, listPromotions, listServices, listTestimonials, listTimeOffs, listUsers, updateBookingStatus, type AdminFaq, type AdminUser, type Article, type ArticleCategory, type AuditLog, type Booking, type ClinicDoctor, type ClinicService, type ContentBlock, type GalleryItem, type NotificationLog, type Patient, type Promotion, type Settings, type Testimonial, type TimeOff } from '../../api/admin-api';
import { AuditLogList } from '../audit-logs/AuditLogList';
import { BookingsList } from '../bookings/BookingsList';
import { BookingFilters } from '../bookings/BookingFilters';
import { ManualBookingForm } from '../bookings/ManualBookingForm';
import { DoctorsPanel } from '../doctors/DoctorsPanel';
import { FaqManager } from '../faqs/FaqManager';
import { NotificationLogList } from '../notifications/NotificationLogList';
import { ReportsPanel } from '../reports/ReportsPanel';
import { ServiceCatalogue } from '../services/ServiceCatalogue';
import { SettingsEditor } from '../settings/SettingsEditor';
import { PromotionManager } from '../promotions/PromotionManager';
import { TestimonialManager } from '../testimonials/TestimonialManager';
import { ArticleManager } from '../articles/ArticleManager';
import { GalleryManager } from '../gallery/GalleryManager';
import { ContentBlockEditor } from '../content/ContentBlockEditor';
import { PatientList } from '../patients/PatientList';
import { UserManager } from '../users/UserManager';

export function AdminDashboard({ accessToken, role }: { accessToken: string; role: string }) {
  const [settings, setSettings] = useState<Settings>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<ClinicService[]>([]);
  const [doctors, setDoctors] = useState<ClinicDoctor[]>([]);
  const [faqs, setFaqs] = useState<AdminFaq[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [timeOffs, setTimeOffs] = useState<TimeOff[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [articleCategories, setArticleCategories] = useState<ArticleCategory[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [bookingFilter, setBookingFilter] = useState<{ doctorId?: string; status?: string }>({});
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [message, setMessage] = useState('Đang tải dữ liệu…');

  async function load() {
    const [nextSettings, nextBookings, nextServices, nextDoctors, nextFaqs, nextAuditLogs, nextNotificationLogs, nextPromotions, nextTestimonials, nextTimeOffs, nextArticles, nextArticleCategories, nextGallery, nextContentBlocks, nextPatients, nextUsers] = await Promise.all([getSettings(accessToken), listBookings(accessToken), listServices(accessToken), listDoctors(accessToken), listFaqs(accessToken), listAuditLogs(accessToken), listNotifications(accessToken), listPromotions(accessToken), listTestimonials(accessToken), listTimeOffs(accessToken), listArticles(accessToken), listArticleCategories(accessToken), listGallery(accessToken), listContentBlocks(accessToken), listPatients(accessToken), role === 'owner' ? listUsers(accessToken) : Promise.resolve([])]);
    setSettings(nextSettings); setBookings(nextBookings); setServices(nextServices); setDoctors(nextDoctors); setFaqs(nextFaqs); setAuditLogs(nextAuditLogs); setNotificationLogs(nextNotificationLogs); setPromotions(nextPromotions); setTestimonials(nextTestimonials); setTimeOffs(nextTimeOffs); setArticles(nextArticles); setArticleCategories(nextArticleCategories); setGallery(nextGallery); setContentBlocks(nextContentBlocks); setPatients(nextPatients); setUsers(nextUsers); setMessage('');
  }
  useEffect(() => { void load().catch((error: Error) => setMessage(error.message)); }, [accessToken]);
  async function reloadBookings(filter = bookingFilter) { try { setBookings(await listBookings(accessToken, filter)); } catch (error) { setMessage((error as Error).message); } }
  async function cancel(code: string) { try { await cancelBooking(accessToken, code); await reloadBookings(); } catch (error) { setMessage((error as Error).message); } }
  async function changeStatus(code: string, status: 'confirmed' | 'completed' | 'no_show') { try { await updateBookingStatus(accessToken, code, status); await reloadBookings(); } catch (error) { setMessage((error as Error).message); } }
  async function reloadDoctors() { try { setDoctors(await listDoctors(accessToken)); } catch (error) { setMessage((error as Error).message); } }
  async function reloadNotifications() { try { setNotificationLogs(await listNotifications(accessToken)); } catch (error) { setMessage((error as Error).message); } }

  if (!settings) return <p role="status">{message}</p>;
  return <>
    <ManualBookingForm accessToken={accessToken} doctors={doctors} services={services} onCreated={() => void reloadBookings()} onError={setMessage} />
    <BookingFilters doctors={doctors} onChange={(filter) => { setBookingFilter(filter); void reloadBookings(filter); }} />
    <BookingsList bookings={bookings} onCancel={cancel} onStatus={changeStatus} />
    <NotificationLogList accessToken={accessToken} logs={notificationLogs} onResent={() => void reloadNotifications()} onError={setMessage} />
    <ServiceCatalogue accessToken={accessToken} services={services} onChanged={setServices} onError={setMessage} />
    <DoctorsPanel accessToken={accessToken} doctors={doctors} services={services} timeOffs={timeOffs} onTimeOffsChanged={setTimeOffs} onReload={() => void reloadDoctors()} onChanged={setDoctors} onError={setMessage} />
    <FaqManager accessToken={accessToken} faqs={faqs} onChanged={setFaqs} onError={setMessage} />
    <PromotionManager accessToken={accessToken} promotions={promotions} onChanged={setPromotions} onError={setMessage} />
    <TestimonialManager accessToken={accessToken} testimonials={testimonials} onChanged={setTestimonials} onError={setMessage} />
    <GalleryManager accessToken={accessToken} items={gallery} onChanged={setGallery} onError={setMessage} />
    <ArticleManager accessToken={accessToken} articles={articles} categories={articleCategories} onArticlesChanged={setArticles} onCategoriesChanged={setArticleCategories} onError={setMessage} />
    <ContentBlockEditor accessToken={accessToken} blocks={contentBlocks} onChanged={setContentBlocks} onError={setMessage} />
    <PatientList accessToken={accessToken} patients={patients} onChanged={setPatients} onError={setMessage} />
    <ReportsPanel accessToken={accessToken} onError={setMessage} />
    <AuditLogList logs={auditLogs} />
    <SettingsEditor settings={settings} accessToken={accessToken} onSaved={setSettings} />
    {role === 'owner' && <UserManager accessToken={accessToken} users={users} onChanged={setUsers} onError={setMessage} />}
    <p aria-live="polite">{message}</p>
  </>;
}
