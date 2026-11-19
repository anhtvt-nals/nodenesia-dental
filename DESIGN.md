# DESIGN.md — Sistem Desain Klinik Gigi Senyum Sehat
> Chuẩn thiết kế giao diện thống nhất cho toàn bộ hệ thống website & portal quản trị (Boutique Dental Atelier).  
> Được trích xuất và chuẩn hóa trực tiếp từ trải nghiệm Trang chủ (Home Page).

---

## 1. Triết lý Thiết kế (Design Philosophy)

- **Cảm giác chủ đạo**: Phòng khám chuyên khoa cao cấp (**Atelier / Boutique Dental Clinic**), ấm áp, tĩnh tại và chuẩn xác y khoa. Xoá bỏ hoàn toàn cảm giác bệnh viện lạnh lẽo, dashboard SaaS công nghiệp hay template thương mại điện tử đại trà.
- **Quy tắc Emil Kowalski**:
  - Không animate hành động lặp lại nhiều lần.
  - Easing chuẩn vật lý: `cubic-bezier(0.23, 1, 0.32, 1)`, thời lượng tương tác ≤ 300ms.
  - Phản hồi xúc giác thị giác: Mọi nút bấm đều có `active:scale-[0.98]`.
  - Không có element nào xuất hiện từ số 0 (`opacity: 0` + `scale: 0.96`).
  - Tôn trọng tuyệt đối `@media (prefers-reduced-motion: reduce)`.
- **Nguyên tắc Hallmark & Nhịp điệu thị giác (Visual Rhythm)**:
  - **Mỗi section mang một bố cục riêng biệt**, tuyệt đối không để 2 section liên tiếp dùng chung một cấu trúc lưới (như 2 lưới 3 cột liền nhau).
  - Kết hợp linh hoạt: Menu danh mục dạng Accordion ngang, Timeline ngang có đường nối, Showcase bác sĩ so le hai bên (editorial alternating), Carousel kéo cho ca điều trị và Bố cục tạp chí 1 Lớn + 2 Nhỏ cho bài viết.
  - Tối đa 3 màu nền xen kẽ xuyên suốt trang (`--color-bg`, `--color-surface`, `--color-bg-dark`) để tạo nhịp tương phản sâu sắc.

---

## 2. Design Tokens (Hệ thống Token Chuẩn)

### 2.1. Bảng màu (Color Palette)

| Token | Giá trị HEX | Vai trò / Ngữ cảnh sử dụng |
| :--- | :--- | :--- |
| `--color-bg` | `#FBF9F5` | Nền kem ấm chính (Warm Cream / Linen) cho toàn bộ trang |
| `--color-bg-alt` | `#F4EFE6` | Nền phụ ấm (Alabaster Cream) cho các dải phân cách nhẹ & card nổi |
| `--color-surface` | `#FFFFFF` | Nền trắng sứ (Pure Porcelain) cho card, bảng giá, form, modal |
| `--color-bg-dark` | `#122820` | Nền nhung bách thảo (Deep Cypress Velvet) tạo tương phản mạnh cho Timetable & Footer |
| `--color-primary` | `#184E3F` | Xanh thông rừng đậm (Deep Emerald Pine) — nút bấm chính, liên kết, điểm nhấn y khoa |
| `--color-primary-hover` | `#123C30` | Trạng thái hover của nút bấm chính |
| `--color-secondary` | `#122820` | Màu chữ tiêu đề chính, tạo độ đầm và sang trọng |
| `--color-accent` | `#C48B46` | Vàng đất nung / Hổ phách ấm (Warm Ochre Gold) — số section, milestone, rating badge |
| `--color-accent-light` | `#F7EFE3` | Nền nhạt cho tag điểm nhấn |
| `--color-accent-text` | `#8E5D23` | Màu chữ trên nền accent light |
| `--color-text` | `#16231E` | Màu chữ thân bài chính (Deep Charcoal Pine, không dùng đen thuần `#000`) |
| `--color-text-muted` | `#576860` | Màu chữ phụ, mô tả, nhãn phụ (WCAG AA ≥ 4.5:1) |
| `--color-border` | `#E8E2D8` | Viền đá ấm mềm mại (Warm Stone) — dùng có tiết chế |
| `--color-error` | `#DC2626` | Trạng thái lỗi hoặc cảnh báo y khoa |

### 2.2. Typography & Thang cỡ chữ

- **Heading & Display Font**: `Playfair Display`, Georgia, serif (tracking `-0.025em` đến `-0.03em`, `text-wrap: balance`).
- **Body & UI Font**: `Plus Jakarta Sans`, `Montserrat`, sans-serif.
- **Thang kích thước**:
  - `Hero Display`: `clamp(2.5rem, 5.5vw, 4.25rem)` (40px – 68px), `leading-[1.08]`.
  - `Section Title (H2)`: `clamp(1.85rem, 3.5vw, 3rem)` (30px – 48px), `leading-[1.15]`.
  - `Oversized Milestone Number`: `font-heading text-4xl sm:text-5xl font-bold text-accent/80`.
  - `Card Title (H3)`: `1.25rem – 1.75rem` (20px – 28px), `leading-[1.25]`.
  - `Body Base`: `0.9375rem` (15px), `leading-relaxed` (1.6).
  - `Caption / Meta`: `0.8125rem – 0.875rem` (13px – 14px).

### 2.3. Quy tắc Đánh số Section (Curated Section Labeling)

- **Không đánh số máy móc tất cả các section từ 01 đến 09**.
- **Chỉ đánh số trên các trụ cột nội dung chính** với kiểu chữ số lớn thanh lịch:
  - `01.` KATALOG PERAWATAN & TRANSPARANSI BIAYA
  - `02.` ALUR KUNJUNGAN PASIEN
  - `03.` DOKTER GIGI SPESIALIS
  - `04.` DOKUMENTASI HASIL KLINIS
  - `05.` EDUKASI & JURNAL KESEHATAN GIGI
  - Cú pháp: `<span className="font-heading text-2xl sm:text-3xl font-bold text-accent">01.</span> <span className="text-xs uppercase tracking-widest font-bold text-accent">TIÊU ĐỀ</span>`
- **Các section tiện ích / xã hội (Utility & Social Proof) dùng Eyebrow không số**:
  - Testimonials: `ULASAN TERVERIFIKASI · PASIEN NYATA`
  - Schedule: `JADWAL MINGGUAN PRAKTEK SPESIALIS`
  - Location: `LOKASI & AKSES KUNJUNGAN`

### 2.4. Radius (Bo góc có hệ thống)

- **Subtle (`12px` / `rounded-xl` / `--radius-btn`)**: Nút bấm, input, select, badge, segmented tab.
- **Prominent (`24px – 32px` / `rounded-2xl – rounded-3xl`)**: Khung card, modal, drawer, floating navbar, panel.
- **Architectural Arch**:
  - Hero Image: `rounded-t-[140px] rounded-b-[28px]` với lớp viền `ring-8 ring-white/60 shadow-floating`.
  - Doctor Portrait: `rounded-t-[140px] rounded-b-[24px]` với viền trắng nổi `border-4 border-white shadow-floating`.

### 2.5. Xử lý Ảnh Toàn Trang (Global Editorial Color Grade)

Toàn bộ ảnh chụp trên hệ thống (ngoại trừ bản đồ SVG/Leaflet) đều được phủ một lớp color grade nhẹ bằng CSS filter nhằm tạo sự đồng bộ ấm áp, giảm chói, chuẩn phòng khám boutique:
```css
img:not([src*=".svg"]):not([src*="data:image/svg"]) {
  filter: saturate(0.92) contrast(1.02) sepia(0.05);
  transition: filter 0.3s ease, transform 0.3s ease;
}

a:hover img, button:hover img, .group:hover img {
  filter: saturate(0.98) contrast(1.03) sepia(0.02);
}
```

---

## 3. Kiến trúc Layout & Component Đặc trưng

### 3.1. Hero Section
- **Architectural Arch Frame**: Khung ảnh phòng khám theo dáng vòm đặc trưng (`rounded-t-[140px] rounded-b-[28px] ring-8 ring-white/60`).
- **Floating Google Rating Badge**: Card đánh giá Google Maps 4.9⭐ tích hợp badge nổi nhẹ tạo điểm tựa tin cậy y khoa.
- **Marquee Ribbon**: Băng chuyền chuyển động mượt mà ở chân hero hiển thị các cam kết lâm sàng cốt lõi.

### 3.2. Timeline Ngang 5 Bước ("5 Tahap" Alur Kunjungan)
- **Đường nối chuẩn xác (Exact-aligned Connecting Line)**: 
  - Đường nối ngang `h-0.5 bg-accent/35` chạy xuyên suốt trực tiếp qua tâm các node tròn mốc milestone `◎` (`left-[10%] right-[10%]`), không bị đứt quãng hay chạy lệch xuống thân card.
  - Mỗi bước có node mốc đồng tâm nổi bật (`w-8 h-8 rounded-full bg-surface border-2 border-accent` với nhân `w-2.5 h-2.5 bg-accent`) đặt phía trên card tương ứng.
- **Số lớn tinh gọn (Clean Large Numerals)**: Mỗi thẻ mang số thứ tự serif cỡ lớn `01`, `02`, `03`, `04`, `05` bằng font Playfair Display (`text-4xl sm:text-5xl font-bold text-accent/80`), loại bỏ thẻ nhãn lặp từ `TAHAP X` để giữ nhịp thoáng đãng.
- **Cuộn ngang trên Mobile**: Trên thiết bị di động, dải timeline tự động cuộn ngang mượt mà (`flex overflow-x-auto pb-6 scrollbar-none snap-x snap-mandatory`) với thẻ `min-w-[280px]` và các đoạn nối liên tục giữa các bước.

### 3.3. Bác sĩ Chuyên khoa (Editorial Staggered Showcase)
- **Cả 3 bác sĩ dùng cùng ngôn ngữ editorial so le**: Tuyệt đối không dùng 1 thẻ lớn rồi 2 thẻ nhỏ.
- **Rhythm so le (Alternating Left-Right)**:
  - Bác sĩ 1 & 3: Ảnh vòm lớn bên Trái (5 cột), Thông tin & Triết lý điều trị bên Phải (7 cột).
  - Bác sĩ 2: Thông tin bên Trái (7 cột), Ảnh vòm lớn bên Phải (5 cột).
- **Tên cỡ lớn**: `font-heading font-bold text-3xl sm:text-4xl text-secondary` đi kèm bằng cấp chuyên khoa, kinh nghiệm lâm sàng và nút đặt lịch trực tiếp.

### 3.4. Ca Điều Trị (Transformasi) vs. Bài Viết (Artikel) — Bố Cục Khác Nhau
Nhằm phá vỡ sự nhàm chán của 2 section 3 cột liên tiếp:
1. **Transformasi Senyum (Section 04)**:
   - Dùng **Carousel kéo ngang (Draggable/Scrollable Carousel)**.
   - Các thẻ so sánh Trước / Sau xếp ngang (`w-[85vw] sm:w-[420px] md:w-[460px] shrink-0 snap-start`).
   - Có nút điều hướng Mũi tên Trái / Phải để cuộn mượt bằng JavaScript.
2. **Edukasi & Bài Viết (Section 05)**:
   - Dùng **Bố cục Tạp chí 1 Lớn + 2 Nhỏ (1 Lead + 2 Companion Stories)**:
     - 1 Bài viết chính nổi bật (Lead story) chiếm **7 cột** với ảnh hero 16:9 lớn, tag "Lựa chọn của biên tập viên", tiêu đề `text-2xl sm:text-3xl` và tóm tắt dài.
     - 2 Bài viết phụ chiếm **5 cột**, xếp dọc cân đối với thumbnail ngang 4:3 gọn gàng.

---

## 4. Bảng Kiểm Tra Đồng Bộ Trang Con (Subpages Checklist)

Khi phát triển hoặc cập nhật các trang con (`/layanan`, `/dokter`, `/tentang-kami`, `/hasil-kami`, `/artikel`, `/booking`), bắt buộc tuân theo:

1. **Header trang con ([PageHeader.tsx](apps/web/src/components/common/PageHeader.tsx))**:
   - Nền kem `bg-bg`, tiêu đề Playfair Display lớn, breadcrumbs rõ ràng.
2. **Không dùng lưới thẻ lặp lại**:
   - Trang `/layanan`: Dùng dạng danh mục Accordion chi tiết hoặc chia nhóm chuyên khoa.
   - Trang `/dokter`: Dùng profile thẻ lớn có thông tin lịch trực và chứng chỉ.
   - Trang `/hasil-kami`: Dùng bộ lọc danh mục và component `BeforeAfterSlider` tương tác.
3. **Mọi nút bấm đều có phản hồi**:
   - Dùng class `.btn-primary`, `.btn-secondary`, `.btn-whatsapp`.
   - Có `active:scale-[0.98]` và transition mượt.
4. **Không hard-code mã màu ngoài palette**:
   - Sử dụng biến CSS `--color-*` hoặc utility Tailwind chuẩn đã khai báo.
5. **Kiểm tra chuẩn Responsive**:
   - Mobile: 375px & 414px (không bị tràn ngang, chữ không bị gãy cụt).
   - Tablet: 768px (lưới co giãn hợp lý).
   - Desktop: 1280px & 1440px (max-w-7xl, canh giữa cân đối).

---

## 5. Admin Portal (`apps/admin`)

Toàn bộ giao diện quản trị (`apps/admin`) giữ nguyên font (`Playfair Display` cho tiêu đề trang, `Plus Jakarta Sans` cho bảng biểu & thao tác), ngôn ngữ mặc định **Bahasa Indonesia** qua `i18n.ts`, và áp dụng hệ thống Color Tokens chuẩn hoá (`apps/admin/src/styles.css` & `apps/admin/src/main.tsx`):

### 5.1. Hệ thống Token Màu Admin & Tương phản (WCAG AA/AAA)
- **Warm Neutral (10 bậc + Surface)**:
  - `--surface: #FFFFFF` · `--neutral-50: #FBF9F5` (nền trang) · `--neutral-100: #F4EFE6` (header bảng, hover) · `--neutral-200: #E8E2D8` (viền) · `--neutral-300: #D6CFC3` (viền input) · `--neutral-400: #ABA396` (placeholder) · `--neutral-500: #7E776B` (disabled) · `--neutral-600: #5E584E` (chữ phụ, `7.04:1` AAA trên `#FFF`) · `--neutral-700: #433E37` (label/header bảng, `9.25:1` AAA trên `#F4EFE6`) · `--neutral-800: #2A2722` · `--neutral-900: #1B1E1C` (chữ chính, không dùng đen thuần, `16.81:1` AAA trên `#FFF`).
- **Brand (Moss Green, 5 bậc)** & **Accent (Bronze Gold)**:
  - `--brand-50: #EEF4F1`, `--brand-100: #D6E5DD`, `--brand-500: #2D6E59`, `--brand-700: #184E3F` (**chỉ** dùng cho nút chính, mục sidebar đang active, logo), `--brand-900: #122820` (hover nút chính, hero tối).
  - `--accent-50: #F7EFE3`, `--accent-500: #C48B46`, `--accent-700: #8E5D23` (`4.92:1` AA trên `#F7EFE3`).
- **Semantic (Nền đặc, viền 1px, chữ đậm AA/AAA — tuyệt đối không dùng alpha overlay hay màu rời rạc như cyan/purple/blue)**:
  - `success`: surface `#EDF5F0`, border `#C6DFCE`, text `#1E563B` (`7.72:1` AAA)
  - `warning`: surface `#FBF4E4`, border `#E8D3A2`, text `#7A4F10` (`6.49:1` AA)
  - `danger`: surface `#FCEEEF`, border `#EEC6C9`, text `#8F2420` (`7.63:1` AAA)
  - `info` (xanh rêu-teal xám): surface `#ECF3F2`, border `#C3D8D5`, text `#23534F` (`7.71:1` AAA)
  - `neutral`: surface `#F1EFEA`, border `#DCD7CE`, text `#4A463F` (`8.16:1` AAA)
- **Ánh xạ Trạng thái & Quy tắc áp dụng**:
  - `pending` → `warning` · `confirmed` → `info` · `arrived` / `in_chair` → `brand` · `completed` → `success` · `cancelled` → `neutral` · `no_show` / `late` / `Medical Alert` → `danger` · `Time-off` → `warning`.
  - Header bảng dùng `--neutral-100` + chữ `--neutral-700` + viền dưới `--neutral-200` (không dùng khối xanh đậm).
  - Banner/Alert dùng nền đặc semantic + viền 1px cùng họ (không dùng alpha overlay).
  - Nút phá hủy dùng icon trung tính (`--neutral-600`), chỉ chuyển `--semantic-danger-text` khi hover/focus/xác nhận.
  - Mọi chip/tag dùng `.admin-badge--*` hoặc `.admin-tag--*`, cấm dùng preset `<Tag color="blue|cyan|purple|...">`.

### Shared Admin Components (`apps/admin/src/components/ui/`)
1. **`AdminPageHeader`**: Tiêu đề Playfair Display, mô tả ngắn, badge đếm bản ghi (`meta`), pill múi giờ `WIB · GMT+7` (`showTimezone` — chỉ hiển thị 1 lần ở header, không lặp ở từng dòng bảng) và vùng nút hành động chính (`actions`).
2. **`AdminTable`**: Bảng chuẩn desktop không cuộn ngang, header dính (`offsetHeader: 62`), chuyển đổi mật độ hiển thị (`comfortable` / `compact` lưu trong `localStorage`), skeleton khi tải, `AdminEmptyState` khi rỗng và tự động chuyển sang thẻ (`renderMobileCard`) trên màn hình `< 768px` (vùng bấm ≥ 44px).
3. **`AdminStatusBadge` & `AdminAlertBadge`**: Chip trạng thái đạt chuẩn tương phản WCAG AA, luôn kèm icon để không phụ thuộc màu sắc; hỗ trợ `overdueLabel` để làm nổi bật lịch hẹn quá hạn.
4. **`AdminFilterBar`**: Thanh tìm kiếm, bộ lọc, chip bộ lọc đang áp dụng (`activeChips`) và nút `Reset all`; hỗ trợ đồng bộ filter lên URL query params (`BookingFilters`).
5. **`AdminCommandPalette`**: Phím tắt `Cmd/Ctrl + K` giúp lễ tân chuyển nhanh giữa các màn hình quản trị.

### Motion, Accessibility & Optimistic UI
- Chỉ animate `transform` và `opacity` (`120–250ms` với `cubic-bezier(0.23, 1, 0.32, 1)`), nút có `active:scale(0.98)`, và tôn trọng `@media (prefers-reduced-motion: reduce)`.
- Xác nhận lịch hẹn sử dụng **optimistic UI** kèm toast phản hồi (`AntdApp.useApp()`).
- Số điện thoại tạm (`wa-pending-*`) luôn được ẩn dưới dạng `"Nomor belum diverifikasi"`.
- Thao tác phá hủy (hủy/xóa) tách riêng khỏi nút chính, luôn có xác nhận (`Modal` / `Popconfirm`) và mọi nút chỉ có icon đều bắt buộc có `aria-label`.
