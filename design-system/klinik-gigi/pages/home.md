# Home Page Overrides

> **PROJECT:** Klinik Gigi
> **Generated:** 2026-10-19
> **Page Type:** Landing / Marketing (`/`, `/en`)

> ⚠️ **IMPORTANT:** Rules in this file **override** the Master file (`design-system/klinik-gigi/MASTER.md`).
> Only deviations from the Master are documented here. For all other rules, refer to the Master.

---

## Page-Specific Rules

### Layout Overrides

- **Max Width:** `1280px` (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`)
- **Section Order:** Preserve existing `HomePage` section order:
  1. Hero Section (with accreditation badge, H1 with `.gradient-text`, CTA buttons, 3-stat row with `[JUMLAH]` placeholders, and right visual card with 2 floating badges)
  2. Interactive 3D Dental Explorer Section
  3. Services Grid (6 cards with icon badge, description, price pill, and "Pelajari lebih lanjut" / "Learn more" link)
  4. Doctors Grid (4 cards with photo placeholder, specialty, credentials/STR/SIP, experience/schedule, language badges, and "Lihat Profil" / "View Profile" button)
  5. Patient Testimonials Section
  6. Kelola Booking / Online Management Preview Section (Indonesian adaptation of demo's dashboard-mock section linking to `/booking/kelola`) & Final Booking/Contact CTA Banner

### Content Overrides

- **Hero Stats:** Must use `[JUMLAH]` placeholders (never invent numbers).
- **Floating Badges:** Use Indonesian clinical trust labels (e.g., Dokter Berizin STR & SIP / Standar Sterilisasi Medis & Jam Operasional).
- **3D Scene Integration:** Recolor 3D explorer container to `.portal-preview` style (`bg-white border border-[#E2E8F0] rounded-[20px] shadow-[0_20px_60px_rgba(0,102,204,0.10)]`) with clinical blue/teal lighting and highlights.
