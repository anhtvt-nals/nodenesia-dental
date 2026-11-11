# DESIGN.md — Sistem Desain Klinik Gigi Senyum Sehat
> Chuẩn thiết kế giao diện thống nhất cho toàn bộ hệ thống website & portal quản trị (Boutique Dental Atelier).

---

## 1. Triết lý Thiết kế (Design Philosophy)
- **Cảm giác chủ đạo**: Phòng khám chuyên khoa cao cấp (Atelier / Boutique Clinic), ấm áp, yên bình và chuẩn xác y khoa. Xoá bỏ hoàn toàn cảm giác bệnh viện lạnh lẽo hoặc dashboard SaaS công nghiệp.
- **Quy tắc Emil Kowalski**:
  - Không animate hành động lặp lại nhiều lần.
  - Easing chuẩn vật lý: `cubic-bezier(0.23, 1, 0.32, 1)`, thời lượng tương tác ≤ 300ms.
  - Phản hồi xúc giác thị giác: Mọi nút bấm đều có `active:scale-[0.98]`.
  - Không có element nào xuất hiện từ số 0 (`opacity: 0` + `scale: 0.96`).
  - Tôn trọng tuyệt đối `@media (prefers-reduced-motion: reduce)`.
- **Nguyên tắc Hallmark**:
  - Mỗi trang có một bố cục riêng phù hợp nội dung, **tuyệt đối không lặp lại công thức "pill tag + heading serif + lưới thẻ bo góc giống hệt nhau"**.
  - Tối đa 3 màu nền xuyên suốt toàn trang để tạo nhịp thị giác tương phản.

---

## 2. Design Tokens (Hệ thống Token Chuẩn)

### 2.1. Bảng màu (Color Palette)
| Token | Giá trị HEX | Vai trò / Ngữ cảnh sử dụng |
| :--- | :--- | :--- |
| `--color-bg` | `#FBF9F5` | Nền kem ấm chính (Warm Cream / Linen) cho toàn bộ trang |
| `--color-bg-alt` | `#F4EFE6` | Nền phụ ấm (Alabaster Cream) cho các dải phân cách nhẹ |
| `--color-surface` | `#FFFFFF` | Nền trắng sứ (Pure Porcelain) cho card, bảng giá, form |
| `--color-bg-dark` | `#122820` | Nền nhung bách thảo (Deep Cypress Velvet) tạo tương phản mạnh cho Jadwal & Footer |
| `--color-primary` | `#184E3F` | Xanh thông rừng đậm (Deep Emerald Pine) — nút bấm chính, liên kết, điểm nhấn y khoa |
| `--color-primary-hover` | `#123C30` | Trạng thái hover của nút bấm chính |
| `--color-secondary` | `#122820` | Màu chữ tiêu đề chính, tạo độ đầm và sang trọng |
| `--color-accent` | `#C48B46` | Vàng đất nung / Hổ phách ấm (Warm Ochre Gold) — badge rating, hotline, sparkle logo |
| `--color-accent-light` | `#F7EFE3` | Nền nhạt cho badge điểm nhấn |
| `--color-accent-text` | `#8E5D23` | Màu chữ trên nền accent light |
| `--color-text` | `#16231E` | Màu chữ thân bài chính (Deep Charcoal Pine, không dùng đen thuần `#000`) |
| `--color-text-muted` | `#576860` | Màu chữ phụ, mô tả, nhãn phụ (WCAG AA ≥ 4.5:1) |
| `--color-border` | `#E8E2D8` | Viền đá ấm mềm mại (Warm Stone) — dùng có tiết chế |
| `--color-error` | `#DC2626` | Trạng thái lỗi hoặc cảnh báo y khoa |

### 2.2. Typography & Thang cỡ chữ
- **Heading Font**: `Playfair Display`, Georgia, serif (tracking `-0.025em` đến `-0.03em`, `text-wrap: balance`).
- **Body Font**: `Plus Jakarta Sans`, `Montserrat`, sans-serif.
- **Thang kích thước**:
  - `Hero Display`: `clamp(2.5rem, 5.5vw, 4.25rem)` (40px – 68px), `leading-[1.08]`.
  - `Page Title (H1)`: `clamp(2rem, 4vw, 3rem)` (32px – 48px), `leading-[1.15]`.
  - `Section Title (H2)`: `clamp(1.75rem, 3.2vw, 2.5rem)` (28px – 40px), `leading-[1.2]`.
  - `Card Title (H3)`: `1.25rem – 1.5rem` (20px – 24px), `leading-[1.25]`.
  - `Body Base`: `0.9375rem` (15px), `leading-relaxed` (1.6).
  - `Caption / Meta`: `0.8125rem – 0.875rem` (13px – 14px).
  - `Eyebrow / Section Label`: `0.6875rem – 0.75rem` (11px – 12px), `font-bold uppercase tracking-widest text-accent` (VD: `01 / KLINIK SPESIALIS`).

### 2.3. Radius (Bo góc có hệ thống — 2 cấp độ)
- **Subtle (`12px` / `rounded-xl` / `--radius-btn`)**: Nút bấm, input, select, badge, segmented tab.
- **Prominent (`24px – 32px` / `rounded-2xl – rounded-3xl`)**: Khung card, modal, drawer, floating navbar, panel.
- **Architectural Arch (`rounded-t-[140px] rounded-b-[28px]`)**: Ảnh chân dung bác sĩ đầu ngành, visual hero.

### 2.4. Shadow (Đổ bóng mềm nhiều lớp)
- `--shadow-card`: `0 4px 20px -2px rgba(18, 40, 32, 0.05), 0 2px 6px -1px rgba(18, 40, 32, 0.03)`
- `--shadow-soft`: `0 16px 36px -10px rgba(18, 40, 32, 0.06), 0 4px 12px -2px rgba(18, 40, 32, 0.03)`
- `--shadow-floating`: `0 24px 48px -12px rgba(18, 40, 32, 0.12), 0 8px 16px -4px rgba(18, 40, 32, 0.06)`

### 2.5. Motion Tokens
- **Curve**: `--ease-out: cubic-bezier(0.23, 1, 0.32, 1);`
- **Tương tác nút**: `transition: transform 0.15s var(--ease-out), background-color 0.2s;`
- **Active state**: `active:scale-[0.98]`
- **Marquee Ticker**: CSS hardware-accelerated `translate3d(-50%, 0, 0)` thời lượng 38s tuyến tính, tạm dừng khi hover.

---

## 3. Thư viện Component Dùng Chung (Component Specifications)

### 3.1. Header & Navigation ([Navbar.tsx](apps/web/src/components/layout/Navbar.tsx))
- **Trạng thái đầu trang**: Nằm sát mép trên full-width, nền kính mờ nhẹ `bg-bg/85 backdrop-blur-md border-b border-border`.
- **Trạng thái cuộn trang (`isScrolled > 20px`)**: Thu gọn mượt mà thành Floating Pill bo tròn `rounded-2xl` nổi giữa màn hình, nền `bg-surface/95 backdrop-blur-xl border-border shadow-soft`.
- **Logo**: Tích hợp icon răng atelier đường nét mềm + sparkle vàng warm gold + chữ "Klinik Gigi Senyum Sehat".

### 3.2. Footer ([Footer.tsx](apps/web/src/components/layout/Footer.tsx))
- Nền Deep Cypress Velvet (`#122820`).
- Statement bế mạc lớn với chữ nghiêng màu accent: *"Senyum sehat berawal dari perawatan yang tenang & presisi"*.
- Nút bấm Hotline WhatsApp Darurat 24/7 (`#C48B46`).
- Lưới thông tin 4 cột phân tách rõ ràng: Về phòng khám, Dịch vụ chuyên khoa, Cổng thông tin bệnh nhân, Địa chỉ & Izin y tế.

### 3.3. Thanh Thao Tác Nhanh Mobile ([MobileBar.tsx](apps/web/src/components/layout/MobileBar.tsx))
- Cố định sát đáy mobile (`fixed bottom-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border`).
- 3 nút bấm chuẩn công thái học (chiều cao 48px, chạm dễ bằng ngón cái):
  - **Gọi điện**: Nền phụ `bg-bg-alt`.
  - **WhatsApp**: Nền ấm `bg-accent text-white`.
  - **Buat Janji**: Nền chính `bg-primary text-white font-bold`.

### 3.4. Hệ thống Nút bấm (Buttons)
```html
<!-- Primary Action -->
<button class="btn-primary rounded-xl px-7 py-3 text-sm font-semibold shadow-xs">
  <span>Buat Janji Kunjungan</span>
</button>

<!-- Secondary Action -->
<button class="btn-secondary rounded-xl px-6 py-3 text-sm font-semibold">
  <span>Lihat Selengkapnya</span>
</button>

<!-- WhatsApp Action -->
<a class="btn-whatsapp rounded-xl px-6 py-3 text-sm font-semibold shadow-xs">
  <span>Konsultasi via WhatsApp</span>
</a>

<!-- Emergency Hotline Action -->
<a class="btn-emergency text-sm rounded-xl px-4 py-2.5">
  <span class="w-2 h-2 rounded-full bg-accent animate-pulse" />
  <span>Hotline Darurat 24 Jam</span>
</a>
```

### 3.5. Nhãn phân mục & Eyebrow (Section Labels)
- **Không dùng pill tag xám nhỏ**.
- Sử dụng số phân mục hoặc nhãn hoa rộng rãi:
```html
<span class="text-xs uppercase tracking-widest font-bold text-accent block mb-2">
  02 / KATALOG PERAWATAN & BIAYA
</span>
```

### 3.6. Bảng Giá & Menu Dịch vụ (Luxury Treatment Catalog)
- Thay thế hoàn toàn grid thẻ bằng **Bảng thực đơn điều trị ngang**:
  - Cột 1: Số thứ tự `01`, `02` + Tên điều trị + Badge chuyên khoa.
  - Cột 2: Thời lượng `⏱ 45 menit`.
  - Cột 3: Giá chạy ngang rõ ràng (`Rp 300 rb – Rp 550 rb`).
  - Cột 4: Nút mũi tên mở ngăn kéo chi tiết (expandable drawer) kèm nút "Pilih & Jadwalkan".

### 3.7. Lịch Khám & Timetable ([ScheduleTabs.tsx](apps/web/src/components/common/ScheduleTabs.tsx))
- Thanh chọn ngày dạng **Segmented Control** với tab đang chọn nổi màu trắng / primary.
- Danh sách bác sĩ trực ca hiển thị giờ trực rõ ràng (`09:00 – 15:00 WIB`) và nút đặt ca khám.
- **Quy tắc trạng thái rỗng**: Không bao giờ hiển thị hộp lỗi cụt lủn "Tidak ada jadwal". Luôn tự động tính toán và hiển thị ngày gần nhất có lịch (VD: Thứ Hai 09:00 WIB) đi kèm 2 nút hành động: Xem lịch ngày đó hoặc Đặt hẹn linh hoạt.

### 3.8. Form Input & Trạng thái Form
- Chiều cao chuẩn `48px`, font size `0.9375rem` (chống zoom tự động trên iOS Safari).
- Bo góc `rounded-xl`, nền `bg-surface`, viền `border-border`.
- Focus state rõ ràng: `border-primary ring-2 ring-primary/20`.
- Thông báo lỗi/thành công có icon trực quan, nền dịu, không gắt.

---

## 4. Quy tắc Không Vi Phạm (Strict Rules)
1. Không hard-code mã màu lạ (`#1C6BB8`, `#0D2235`, v.v.). Chỉ sử dụng các token trong bảng màu chuẩn.
2. Không chèn viền xám mỏng khắp mọi nơi (`border border-gray-200` bừa bãi). Phân tách bằng tương phản nền hoặc bóng đổ mềm.
3. Không lặp lại công thức grid thẻ đồng dạng cho tất cả các trang.
4. Mọi trang đều phải có:
   - Trạng thái tải tử tế (Skeleton animation mượt mà).
   - Trạng thái rỗng (Empty state có giải pháp/hướng dẫn cụ thể, không bế tắc).
   - Kiểm tra hiển thị responsive ở 375px (mobile), 768px (tablet), 1280px (desktop).
