# Spec: Website + Booking + Admin Klinik Gigi

Bản chốt v1 · 18/10/2026 · Single-tenant, bán đứt cho 1 klinik tại Indonesia

## 1. Mục tiêu

- Landing hiện đại, có scene 3D bộ răng, hover/tap để xem giá theo vùng.
- Booking online: chọn layanan, drg, slot trống, xác nhận và nhắc lịch qua WhatsApp.
- Admin để klinik tự vận hành: lịch, drg, layanan, pasien, nội dung.
- Bàn giao hoàn chỉnh: klinik tự chạy được, đứng tên mọi tài khoản (domain, hosting, WA, GBP).

**Ngoài phạm vi (v1):** rekam medis/SATUSEHAT, thanh toán QRIS/VA, app mobile, multi-klinik, đa chi nhánh.

## 2. Tech stack (chốt)

**Monorepo:** Yarn 4 workspaces (Corepack, `nodeLinker: node-modules`) + Turborepo

**apps/web (landing + booking UI)**

- Next.js 15 (App Router), TypeScript, Tailwind CSS v4
- three, @react-three/fiber, @react-three/drei
- GSAP (ScrollTrigger) + Lenis cho scroll/animation
- next-intl (ID mặc định, EN tuỳ chọn)
- react-hook-form + Zod, TanStack Query

**apps/admin (SPA)**

- Vite + React + TypeScript
- TanStack Router + TanStack Query
- shadcn/ui + Tailwind
- FullCalendar (timeGrid day/week, lọc theo drg; không dùng gói resource premium)

**apps/api**

- NestJS 10 với Fastify adapter
- Prisma ORM + PostgreSQL 16
- Zod (nestjs-zod) validate, Swagger/OpenAPI
- Auth: Passport JWT (access 15 phút) + refresh token httpOnly cookie, hash bằng argon2
- Queue/cron: pg-boss (chạy trên Postgres, không cần Redis)
- Rate limit: @nestjs/throttler
- Upload ảnh: sharp resize + StorageProvider (mặc định local volume, đổi sang S3/R2 được)
- Notification: NotificationProvider (Fonnte trước, Meta Cloud API sau)

**packages/shared**

- Zod schemas, enums, type dùng chung; client API sinh từ OpenAPI (orval)

**Hạ tầng**

- Docker Compose trên VPS: caddy (TLS, reverse proxy), web, api, admin (static), postgres
- Backup: pg\_dump hằng ngày, đẩy lên object storage (R2/Backblaze), giữ 14 bản, có script restore
- CI: GitHub Actions (lint, typecheck, unit/integration test, build workspace)
- Giám sát: Sentry (web/api), Uptime Kuma
- Test: Vitest/Jest (service layer), test tích hợp database; UAT thủ công cho luồng booking + admin

## 3. Database (PostgreSQL)

Timezone lưu `timestamptz` (UTC), hiển thị theo `Asia/Jakarta` (hoặc múi giờ klinik trong settings). Extension: `btree_gist`, `pgcrypto`.

**Bảng**

- `users`: id, email (unique), password\_hash, name, role (`owner` | `staff`), is\_active, created\_at
- `refresh_tokens`: id, user\_id, token\_hash, expires\_at, revoked\_at, user\_agent
- `clinic_settings` (1 dòng): name, phone, wa\_number, address, lat, lng, timezone, slot\_step\_minutes (mặc định 15), booking\_lead\_minutes, booking\_horizon\_days, cancel\_cutoff\_hours, chairs\_count, reminder\_templates (jsonb), socials (jsonb)
- `doctors`: id, name, slug, bio, photo\_url, is\_active, sort\_order
- `services`: id, slug, name, name\_en?, short\_desc, description, zone (`front` | `molar` | `gum` | `arch`), duration\_minutes, price\_from, price\_to?, price\_note?, seo\_title, seo\_desc, is\_active, sort\_order
- `doctor_services`: doctor\_id, service\_id (PK kép)
- `working_hours`: id, doctor\_id, weekday (0-6), start\_time, end\_time (nhiều dòng/ngày để chia ca, nghỉ trưa)
- `time_offs`: id, doctor\_id (null = nghỉ cả klinik), starts\_at, ends\_at, reason
- `patients`: id, name, phone\_e164 (unique), notes, created\_at
- `bookings`: id, code (unique, ngắn), patient\_id, doctor\_id, service\_id, starts\_at, ends\_at, status (`pending` | `confirmed` | `completed` | `cancelled` | `no_show`), source (`web` | `admin`), notes, manage\_token\_hash, cancelled\_reason, created\_at, updated\_at
- `notification_logs`: id, booking\_id, type (`confirmation` | `reminder_h1` | `reminder_2h` | `cancel` | `reschedule`), channel, provider, status (`queued` | `sent` | `failed`), provider\_msg\_id, error, scheduled\_at, sent\_at, attempts
- `testimonials`: id, name, text, rating, source, is\_published, sort\_order
- `gallery_items`: id, type (`before_after` | `photo`), before\_url, after\_url, caption, service\_id?, consent\_confirmed, is\_published, sort\_order
- `faqs`: id, question, answer, service\_id?, is\_published, sort\_order
- `content_blocks`: key, locale, content (jsonb), unique (key, locale) cho copy chỉnh sửa được
- `audit_logs`: id, user\_id, action, entity, entity\_id, diff (jsonb), ip, created\_at

**Chống trùng lịch ở tầng DB**

```sql
ALTER TABLE bookings ADD CONSTRAINT no_overlap
  EXCLUDE USING gist (
    doctor_id WITH =,
    tstzrange(starts_at, ends_at) WITH &&
  ) WHERE (status IN ('pending','confirmed'));
```

Giới hạn số ghế (`chairs_count`) kiểm tra trong service layer, trong transaction có advisory lock theo ngày.

**Index:** `bookings(starts_at)`, `bookings(doctor_id, starts_at)`, `bookings(status)`, `patients(phone_e164)`, `notification_logs(status, scheduled_at)`.

## 4. Logic slot

1. Lấy `working_hours` của drg theo weekday của ngày chọn.
2. Trừ `time_offs` (của drg và của klinik).
3. Trừ các booking `pending`/`confirmed` (kèm khoảng đệm nếu có).
4. Cắt thành slot theo `slot_step_minutes`, chỉ giữ slot đủ `duration_minutes` của layanan.
5. Loại slot trước `now + booking_lead_minutes` và sau `booking_horizon_days`.
6. Chọn drg bebas: gán drg đầu tiên còn trống theo thứ tự ưu tiên/cân tải.
7. Tạo booking trong transaction; nếu vướng constraint thì trả 409 và gợi ý slot kế tiếp.

Viết test trước cho: ca chia đôi, nghỉ trưa, qua nửa đêm, DST không áp dụng (WIB/WITA/WIT), layanan dài hơn khoảng trống, race condition 2 request cùng slot.

## 5. API (REST, prefix `/api/v1`)

**Public**

- `GET /public/settings`, `/public/services`, `/public/doctors`, `/public/faqs`, `/public/testimonials`, `/public/gallery`
- `GET /public/slots?serviceId&doctorId?&date`
- `POST /public/bookings` (honeypot + rate limit theo IP và SĐT; Turnstile nếu bị spam)
- `GET /public/bookings/:code?token=`, `POST /public/bookings/:code/cancel`, `POST /public/bookings/:code/reschedule`

**Auth:** `POST /auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/me`

**Admin (JWT + role)**

- `bookings`: list (lọc theo khoảng ngày, drg, trạng thái), tạo thủ công, đổi trạng thái, dời lịch, huỷ
- CRUD: `services`, `doctors` (+ working\_hours, time\_offs), `patients`, `testimonials`, `gallery`, `faqs`, `content-blocks`
- `GET /admin/notifications` (log gửi, gửi lại), `GET /admin/export/bookings.csv`, `GET /admin/audit-logs`
- `users` (chỉ `owner`)

**Webhook:** `POST /webhooks/whatsapp` (cập nhật trạng thái gửi/nhận từ provider)

## 6. Nhắc lịch

- Gửi xác nhận ngay khi đặt, nhắc H-1 (sáng hôm trước) và H-2 giờ.
- pg-boss job có retry (backoff), ghi `notification_logs`.
- Template Bahasa Indonesia chỉnh sửa được trong admin, có biến: nama, layanan, drg, tanggal, jam, link kelola lịch.
- Provider tách qua interface để đổi Fonnte sang Meta Cloud API không sửa logic. Chi phí gateway do klinik trả.

## 7. Landing 3D

- Model GLB, mỗi răng là một mesh tên FDI (`tooth_11` đến `tooth_48`) cộng mesh `gum`; nén Draco + WebP, mục tiêu dưới 1.5 MB. Kiểm tra license asset trước khi dùng.
- Map vùng sang dịch vụ: răng cửa/nanh (veneer, bleaching), răng hàm (tambal, implan, saluran akar), cả cung hàm (behel), nướu (scaling). Giá lấy từ API, không hardcode.
- Desktop: hover hiện bảng giá kiểu editorial gắn theo vùng, nút Booking đẩy sẵn layanan vào form.
- Mobile: tap chọn vùng, giá hiện ở bottom sheet.
- Camera chạy theo scroll (hero toàn hàm, zoom theo từng section dịch vụ).
- Vật liệu gốm mờ, ánh sáng studio, nền cùng màu trang.
- Hiệu năng: tải lazy khi vào viewport, poster ảnh tĩnh làm fallback và LCP, dpr tối đa 1.5, tôn trọng `prefers-reduced-motion`.
- SEO: bảng giá và nội dung dịch vụ luôn có dạng HTML text bên cạnh canvas.

## 8. Định hướng UI

- Tránh dấu hiệu template AI: gradient tím/xanh, glassmorphism, lưới 3 card icon, hero căn giữa 2 nút, ảnh stock.
- Phong cách editorial, ấm, dịu (không xanh y tế cliché): nền ivory, mực gần đen, xanh rêu đậm, một accent san hô/cam đất.
- Typography dẫn dắt: display serif hoặc grotesk có cá tính + một sans trung tính; chữ hero rất lớn, nhãn mono viết hoa kèm số thứ tự.
- Đường kẻ mảnh thay card có shadow; bảng giá dạng danh sách.
- Khoá design tokens (CSS variables/Tailwind theme) trước khi dựng component.
- Ảnh thật của phòng khám, drg và ca điều trị (có consent), copy cụ thể bằng Bahasa tự nhiên.
- Art direction cuối cùng: chờ chốt (xem mục 12).

## 10. Deploy và bàn giao

- Mọi tài khoản đứng tên klinik: domain, VPS/hosting, Google Business Profile, số WhatsApp, object storage.
- `docker compose up` chạy được toàn bộ; có `.env.example`, seed data, migration, script backup/restore.
- Tài liệu: hướng dẫn admin (PDF hoặc video ngắn), sơ đồ deploy, danh sách credential, quy trình cập nhật.
- Garansi bug 30-90 hari; sau đó bảo trì theo gói tuỳ chọn hằng tháng (backup, update, sửa nhỏ, SEO cơ bản).

## 11. Lộ trình

1. Khởi tạo monorepo, CI, Docker, schema Prisma + seed (S)
2. Logic slot + test, API booking public (M)
3. Auth + API admin (M)
4. Admin UI: lịch, drg, layanan, pasien (L)
5. Notification queue + template (M)
6. Landing + scene 3D + booking UI (L)
7. CMS nội dung, export CSV, audit log (S)
8. SEO, hiệu năng, test thiết bị thật (M)
9. Deploy, backup, tài liệu, UAT với klinik, bàn giao (M)

## 12. Acceptance checklist

- [ ] Đặt lịch end-to-end từ điện thoại, nhận xác nhận WhatsApp
- [ ] Không thể đặt trùng slot (test đồng thời)
- [ ] Admin quản lý được drg, jam praktik, cuti, layanan, giá mà không cần dev
- [ ] Nhắc lịch H-1 và H-2 giờ chạy đúng, có log và retry
- [ ] Scene 3D chạy mượt trên điện thoại tầm trung, có fallback
- [ ] Lighthouse mobile: Performance và SEO từ 90 trở lên
- [ ] Backup hằng ngày và restore thử thành công
- [ ] Tài liệu bàn giao đầy đủ, klinik tự đăng nhập và vận hành được

## 13. Đã chốt và dữ liệu mặc định

**Đã chốt**

- Giao source code cho klinik (hợp đồng ghi rõ quyền tái sử dụng core)
- Ngôn ngữ: ID và EN
- Hosting: VPS
- Làm luôn module SEO (mục 14)
- Art direction và model 3D: tự làm bằng AI public, kiểm tra license từng asset
- Giá bán: quyết định sau

**Dữ liệu mặc định để dựng demo** (ước lượng, thay bằng dữ liệu thật của klinik khi có)

- Klinik độc lập, 3 drg, 3 kursi, múi giờ Asia/Jakarta (WIB)
- Giờ praktik: Senin đến Sabtu 09:00-20:00, nghỉ trưa 12:00-13:00, slot bước 15 phút
- Scaling: 45 phút, Rp 300-600 rb
- Tambal: 45 phút, Rp 250-600 rb
- Bleaching: 60 phút, Rp 1,5-3,5 jt
- Veneer: 90 phút, Rp 1,5-4 jt/gigi
- Behel (pemasangan): 60 phút, Rp 5-15 jt
- Implan: 90 phút, Rp 10-25 jt/gigi
- Nội dung demo bằng Bahasa tự nhiên; ảnh và model do AI tạo gắn nhãn demo cho tới khi thay bằng ảnh thật

## 14. Module SEO

- Meta theo trang và theo ngôn ngữ (title, description, canonical, hreflang id/en, OG image sinh động), sửa được trong admin cho từng trang và từng layanan
- Schema.org: Dentist/LocalBusiness (giờ mở cửa, địa chỉ, toạ độ), Service cho mỗi layanan, Physician cho drg, FAQPage, BreadcrumbList; AggregateRating chỉ khi có đánh giá thật
- sitemap.xml có hreflang, robots.txt, slug sạch theo layanan, quản lý redirect 301, trang 404 có gợi ý
- Mỗi layanan một trang riêng với nội dung duy nhất (quy trình, thời gian, giá từ, FAQ, drg phụ trách); trang theo khu vực chỉ làm khi thật sự khác biệt, tránh doorway page
- Hiệu năng: LCP dưới 2,5 giây, CLS dưới 0,1, ảnh WebP/AVIF, font subset, 3D lazy-load
- Đo lường: GA4 hoặc Plausible, Search Console, sự kiện booking (xem layanan, bắt đầu form, hoàn tất, bấm WhatsApp)
- Checklist Google Business Profile: danh mục, giờ, ảnh, layanan, link booking, quy trình xin đánh giá
- Tài liệu bàn giao SEO: cách sửa meta, thêm layanan mới, đọc báo cáo Search Console

## 15. Phân tích đối thủ

Trong 7 site chỉ đọc được 6 trang chủ; Friendly Clinic chặn truy cập tự động nên chưa có dữ liệu. Chưa mở các trang con và trang đặt lịch riêng (reservation.dentalrakyat.id, sbdental.co.id/reservation).

| Đối thủ | Định vị | Booking | Điểm đáng lấy |
| --- | --- | --- | --- |
| Dental Rakyat | Bình dân, 13 cabang | Trang reservasi riêng: chọn cabang, xem slot và antrean hôm nay; live chat 24/7 | Hero 2 CTA, quy trình 3 bước, thanh tin cậy (tanpa biaya tersembunyi, garansi), 10 layanan dạng danh sách đánh số, review có sao |
| Friendly Clinic | Chưa kiểm tra | Chưa kiểm tra | Chưa có dữ liệu |
| All Care Dental Centre | Chuyên khoa, drg có Sp. | Nút Book Appointment ngay trên từng drg | Trang Lokasi & Jadwal với lịch drg theo thứ trong tuần, drg kèm spesialis, layanan nhóm theo chuyên khoa, artikel có danh mục, Terms và Privacy |
| IRHdental | Premium giá vừa, thẩm mỹ | Không có form, mọi CTA mở WhatsApp | Trang Our Work (before/after), Facility & Technology, Patients, review Google, video, giờ mở cửa rõ, keyword local trong meta |
| Jakarta Smile | Family dental, 3 cabang | Form trên home: nama, email, HP, tanggal, cabang, layanan, pesan, honeypot | Chuyển ngôn ngữ ID/EN, banner promo cicilan, gallery và video, rencana perawatan tertulis kèm estimasi, ô góp ý; giao diện cũ |
| SB Dental | Giá hợp lý, 9 cabang | Trang reservasi riêng; luồng 5 bước có đặt DP | Service flow 5 bước, thông điệp tanpa antre, garansi, 9 testimoni, promo scaling |
| Dentme | 1 klinik ở Surabaya | Nút Book mở WhatsApp (chọn drg, jam, keluhan) | FAQ so sánh (veneer vs bleaching, behel self-ligating), mô tả layanan dạng giải thích, promo hàng tháng, Minggu tutup |

**Rút ra**

- Đặt lịch có xem slot trống trên web chỉ thấy ở Dental Rakyat; Dentme và IRH đẩy hết sang WhatsApp, Jakarta Smile là form gửi yêu cầu. Chọn drg + slot trống + nhắc lịch là chỗ khác biệt thật.
- Không site nào liệt kê giá từng layanan ở trang chủ (chỉ promo hoặc câu "harga transparan"). Công cụ xem giá 3D theo vùng răng là điểm khác biệt rõ.
- Ít nhất 3 trong 6 site dựng trên WordPress với theme/builder (Elementor, Enfold, Slider Revolution), nên tốc độ và giao diện riêng là lợi thế.
- Single klinik không nên cạnh tranh về giá với chuỗi (Dental Rakyat, SB Dental); cạnh tranh bằng trải nghiệm, minh bạch giá và độ tin cậy gần kiểu IRH.

## 16. Bổ sung vào spec từ phân tích đối thủ

**Sitemap (public)**

- Home, Layanan (danh sách + trang chi tiết từng layanan), Dokter (danh sách + trang từng drg), Jadwal (lịch drg theo tuần), Harga (explorer 3D + bảng HTML), Hasil kami (before/after), Fasilitas & Teknologi
- Pasien: alur kunjungan, FAQ, persiapan, kebijakan garansi, Artikel (có danh mục), Testimoni, Kontak & Lokasi, Booking, Kelola booking, Privacy Policy, Terms

**Tính năng thêm**

1. Thanh tin cậy: số pasien, năm hoạt động, garansi tindakan, harga transparan, protokol sterilisasi (Dental Rakyat, SB, IRH). Chỉ dùng số liệu thật của klinik.
2. Alur kunjungan 5 bước hiển thị trên site: đặt lịch, xác nhận WhatsApp, datang, perawatan, thanh toán (SB). Đặt cọc là tùy chọn, ngoài phạm vi v1.
3. Trang Jadwal: lịch drg theo thứ trong tuần, tab theo ngày, mỗi drg có nút Book (All Care); hiển thị slot còn trống hôm nay (Dental Rakyat).
4. Trang drg: spesialisasi, jam praktik, layanan phụ trách, nút Book với drg này.
5. Layanan nhóm theo danh mục: Pencegahan, Estetik, Ortodonti, Restoratif, Bedah, Anak (All Care).
6. FAQ theo từng layanan và trang so sánh perawatan, ví dụ veneer vs bleaching, behel self-ligating (Dentme).
7. Artikel edukasi có danh mục, soạn trong admin (All Care, IRH).
8. Promo/penawaran có ngày hiệu lực, gắn với layanan, banner trong admin (Dentme, Jakarta Smile, SB). Thông tin cicilan chỉ hiển thị, không tích hợp thanh toán.
9. Form booking: nama, nomor WA, layanan, drg, tanggal, jam, keluhan ngắn. Bỏ email bắt buộc (Jakarta Smile) và không thu riwayat penyakit ở v1 để giảm dữ liệu nhạy cảm theo UU PDP.
10. Tùy chọn "Tanya dulu via WhatsApp" cạnh nút đặt lịch, làm fallback khi form lỗi (Dentme, Dental Rakyat, SB).
11. Nhắn xin đánh giá Google sau kunjungan (H+1), thay cho ô góp ý của Jakarta Smile, và có giá trị cho SEO local.
12. Review: tuyển chọn thủ công từ Google kèm nguồn, ghi rõ tên nguồn; không gọi API ở v1 (IRH).
13. Hiển thị "Buka sekarang / tutup jam …" theo jam thực, nút gọi cho trường hợp darurat (IRH).
14. Admin: quản lý promo, artikel, thống kê (số booking theo layanan, tỉ lệ no-show, nguồn đặt).

**Thay đổi database**

- `doctors`: thêm `title` (ví dụ drg., Sp.Ort), `specialty`
- `services`: thêm `category` (enum), `faq` lấy từ `faqs.service_id` đã có
- `bookings`: thêm `complaint` (text ngắn)
- Bảng mới: `promotions` (title, description, service\_id?, starts\_at, ends\_at, is\_published), `articles` (slug, title, body, category\_id, cover\_url, seo fields, published\_at), `article_categories`
- `notification_logs.type`: thêm `review_request`

**Mẫu UI nên dùng**

- Danh sách layanan đánh số 01, 02, 03 với đường kẻ (Dental Rakyat), hợp hướng editorial.
- Headline lớn có một từ nhấn bằng chữ nghiêng hoặc màu accent; bố cục lệch với scene 3D thay vì hero căn giữa.
- Stepper 3-5 bước cho quy trình đặt lịch.
- Thẻ drg có spesialis và nút Book; lịch tuần dạng tab.
- Review dạng thẻ ngắn: sao, tên, nguồn.
- Mobile: thanh cố định dưới cùng với Reservasi, WhatsApp, Telepon.
- Trang booking riêng, ít trường, slot hiển thị trực quan.

**Nên tránh**

- Đặt bài viết dài ngay trên trang chủ (All Care).
- Form dài, bắt buộc email, nhiều thông tin y tế (Jakarta Smile, SB).
- Banner promo chen dày kiểu cũ; carousel lặp; ảnh stock.
- Số liệu tin cậy không có thật (số pasien, năm, garansi) chỉ để trông đẹp.
