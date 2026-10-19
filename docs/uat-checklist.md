# Pilot UAT checklist

- [ ] Clinic owner has changed demo branding, content, owner email/password and `JWT_SECRET`.
- [ ] HTTPS, domain, clinic timezone, phone/WhatsApp and provider credentials are configured.
- [ ] Two simultaneous booking attempts for the same slot produce one booking only.
- [ ] Create, cancel and reschedule a booking; check confirmation and scheduled notification logs.
- [ ] Staff can operate bookings/CMS but cannot manage users; owner can manage users.
- [ ] Working hours and clinic-wide/doctor time-off immediately remove affected availability.
- [ ] Gallery consent is recorded before publication; private/draft content is not public.
- [ ] Restore an encrypted backup into a separate database and record the date/result.
- [ ] Check mobile booking, article page, privacy/booking terms, and monitoring alerts.
