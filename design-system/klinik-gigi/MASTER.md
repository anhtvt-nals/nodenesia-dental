# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/klinik-gigi/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Klinik Gigi
**Generated:** 2026-10-19
**Category:** Healthcare / Dental Clinic Web Application (Indonesia)
**Precedence:** Demo Theme (`https://uupm.cc/demo/medical-clinic`) wins for color, typography, and component look. `ui-ux-pro-max` skill rules, anti-patterns, and pre-delivery checklist apply on top.

---

## Conflict Resolution & Precedence Decisions

1. **Color Palette (`Demo Theme` vs `ui-ux-pro-max` Neumorphism Generator)**:
   - *Skill Generator Output:* Cyan/Green Neumorphism (`#0891B2` primary, `#22D3EE` secondary, `#059669` accent, `#ECFEFF` tinted cyan background).
   - *Demo Theme Extracted:* Clinical Trust Blue & Medical Teal (`#0066CC` primary, `#00A67E` secondary, `#10B981` success, `#F59E0B` warning/accent, `#EF4444` emergency/error, `#FAFBFC` background, `#F0F4F8` surface/alt background, `#FFFFFF` card, `#1E3A5F` dark footer, `#1A202C` text, `#4A5568` muted text, `#E2E8F0` border).
   - *Decision:* **Demo theme tokens win** for all colors. However, where `#718096` (`--color-text-subtle`) is used for normal-sized text on `#FAFBFC` or `#F0F4F8` (contrast ~3.8:1), we enforce the **skill's >= 4.5:1 contrast rule** by using `#4A5568` (`--color-text-muted`, contrast 7.5:1 on `#FAFBFC` and 6.8:1 on `#F0F4F8`) for all readable text, reserving `#64748B` (contrast 4.6:1 on `#FFFFFF`) or `#4A5568` for helper labels.

2. **Typography (`Demo Theme` vs `ui-ux-pro-max` Generator & Domain Search)**:
   - *Skill Generator Output:* `Atkinson Hyperlegible` (generator) / `Figtree + Noto Sans` (`--domain typography`).
   - *Demo Theme Extracted:* `Plus Jakarta Sans` (500, 600, 700) for headings (`--font-heading`) and `Inter` (400, 500, 600, 700) for body (`--font-body`), plus `JetBrains Mono` / system monospace for booking codes.
   - *Decision:* **Demo theme fonts win** (`Plus Jakarta Sans` + `Inter`). Both have excellent Indonesian/English character support and legibility.

3. **Card & Surface Style (`Demo Theme` vs `ui-ux-pro-max` Neumorphism)**:
   - *Skill Generator Output:* Neumorphism with dual embossed/debossed shadows on `#ECFEFF`.
   - *Demo Theme Extracted:* Clean bordered cards (`background: #FFFFFF`, `border: 1px solid #E2E8F0`, `border-radius: 16px`, `padding: 24px`/`28px`) with subtle hover lift (`translateY(-2px)` on interactive cards, `box-shadow: 0 8px 24px rgba(0, 102, 204, 0.10)`).
   - *Decision:* **Demo theme card & surface styles win**, combined with the skill's `prefers-reduced-motion: reduce` rule to disable hover transforms/transitions when requested.

4. **Section Order & Content Rules (`Demo Theme` vs Repo & Indonesian Context)**:
   - *Skill Generator Output:* `Hero > Problem statement > Solution overview > Testimonials carousel > CTA`.
   - *Project Rule:* Keep existing `HomePage` section order intact. Add the demo's hero accreditation badge, 3-stat row (with `[JUMLAH]` placeholders — never invent stats), and hero image card with 2 floating trust badges. Replace US-specific elements (JCAHO, HIPAA, ADA, Medicare/Aetna, US phone `(555)`, Patient Portal sign-in) with Indonesian equivalents (`[AKREDITASI KLINIK]`, `Terdaftar Resmi Kemenkes RI`, `Standar Sterilisasi Medis`, `Ramah Anak & Lansia`, WhatsApp contact, `Kelola Booking` -> `/booking/kelola`, and Indonesian payment/insurance placeholders).

---

## Global Rules & Tokens

### Color Palette

| Role | Hex | CSS Variable | Tailwind Token | Contrast Notes |
|------|-----|--------------|----------------|----------------|
| Primary | `#0066CC` | `--color-primary` | `bg-primary` / `text-primary` | 5.56:1 on `#FFFFFF` (AA Pass) |
| Primary Hover | `#0052A3` | `--color-primary-hover` | `hover:bg-primary-hover` | 7.95:1 on `#FFFFFF` (AAA Pass) |
| Secondary (Teal) | `#00A67E` | `--color-secondary` | `bg-secondary` / `text-secondary` | Used for accents, gradients, icon badges |
| Accent / Warning | `#F59E0B` | `--color-warning` | `bg-warning` / `text-warning` | Used for stars, highlights, caution badges |
| Info | `#3B82F6` | `--color-info` | `bg-info` / `text-info` | Informational badges |
| Success | `#10B981` | `--color-success` | `bg-success` / `text-success` | Accredited/Open badges (text uses `#047857` for >=4.5:1 contrast on light pills) |
| Error / Emergency | `#EF4444` | `--color-error` | `bg-error` / `text-error` | Emergency CTA (`#DC2626` for accessible button fill / text contrast) |
| Background | `#FAFBFC` | `--color-bg` | `bg-bg` | Main page background |
| Background Alt / Surface | `#F0F4F8` | `--color-bg-alt` | `bg-bg-alt` / `bg-surface` | Alternating section & chip background |
| Card Surface | `#FFFFFF` | `--color-bg-card` | `bg-card` | Elevated card & input background |
| Dark Surface (Footer) | `#1E3A5F` | `--color-bg-dark` | `bg-bg-dark` | 4-column footer & dark callouts (11.5:1 with `#FFFFFF`) |
| Primary Text | `#1A202C` | `--color-text` | `text-text` | 15.8:1 on `#FAFBFC` |
| Muted Text | `#4A5568` | `--color-text-muted` | `text-text-muted` | 7.5:1 on `#FAFBFC`, 6.8:1 on `#F0F4F8` |
| Subtle Text | `#64748B` | `--color-text-subtle` | `text-text-subtle` | 4.75:1 on `#FFFFFF` (upgraded from `#718096` to pass AA 4.5:1) |
| Border | `#E2E8F0` | `--color-border` | `border-border` | Card, input, and section dividers |

### Typography

- **Heading Font (`--font-heading`):** `"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (weights: 500, 600, 700; line-height: 1.25–1.3)
- **Body Font (`--font-body`):** `"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif` (weights: 400, 500, 600, 700; line-height: 1.6)
- **Monospace Font (`--font-mono`):** `"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace` (for booking codes, timestamps, prices)

**Google Fonts Import:**
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@500;600;700;800&display=swap" rel="stylesheet" />
```

### Radius, Shadows & Spacing Rhythm

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `8px` (`0.5rem`) | Language pills, small tags, inner controls |
| `--radius-md` | `12px` (`0.75rem`) | Buttons (`.btn-primary`, `.btn-secondary`, `.btn-emergency`), inputs (`.form-input`), icon boxes |
| `--radius-lg` | `16px` (`1rem`) | `.trust-card`, `.service-card`, `.doctor-card`, standard cards |
| `--radius-xl` | `20px` (`1.25rem`) | `.portal-preview`, 3D explorer container, featured hero frame |
| `--radius-full` | `9999px` (`50px`) | `.badge`, `.badge-primary`, `.badge-success` |
| `--shadow-card` | `0 8px 24px rgba(0, 102, 204, 0.10)` | Card hover state |
| `--shadow-doctor` | `0 12px 32px rgba(0, 102, 204, 0.12)` | Doctor card hover state |
| `--shadow-portal` | `0 20px 60px rgba(0, 102, 204, 0.10)` | Dashboard mock / 3D stage elevation |
| `--space-xs` .. `--space-3xl` | `4px`, `8px`, `16px`, `24px`, `32px`, `48px`, `64px` | 4/8px spacing rhythm (`py-16 sm:py-24` sections, `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`) |

---

## Component Specifications (Demo Theme + A11y Rules)

- **Navbar (`.navbar-medical`):** Fixed/sticky top bar, `background: rgba(255, 255, 255, 0.98)`, `backdrop-filter: blur(10px)`, `border-bottom: 1px solid var(--color-border)`. Includes brand mark (rounded-xl primary icon + title + subtitle), navigation links, WhatsApp/Darurat button (`.btn-emergency`), and primary Booking CTA (`.btn-primary`).
- **Buttons:**
  - `.btn-primary`: `bg-[#0066CC] hover:bg-[#0052A3] text-white font-semibold rounded-[12px] min-h-[48px] px-6 py-3 transition-all duration-200 cursor-pointer`
  - `.btn-secondary`: `bg-white text-[#0066CC] border-2 border-[#0066CC] hover:bg-[#0066CC] hover:text-white font-semibold rounded-[12px] min-h-[48px] px-6 py-3 transition-all duration-200 cursor-pointer`
  - `.btn-emergency`: `bg-[#DC2626] hover:bg-[#B91C1C] text-white font-semibold rounded-[12px] min-h-[48px] px-5 py-3 transition-all duration-200 cursor-pointer`
- **Badges:**
  - `.badge`: `inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold`
  - `.badge-primary`: `bg-[#0066CC]/10 text-[#0052A3]` (ensures >4.5:1 contrast)
  - `.badge-success`: `bg-[#10B981]/15 text-[#047857]` (ensures >4.5:1 contrast)
- **Cards:**
  - `.trust-card`: `bg-white border border-[#E2E8F0] rounded-[16px] p-6 transition-all duration-200 hover:border-[#0066CC] hover:shadow-[0_8px_24px_rgba(0,102,204,0.1)]`
  - `.service-card`: `bg-white border border-[#E2E8F0] rounded-[16px] p-7 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#0066CC] hover:shadow-[0_8px_24px_rgba(0,102,204,0.1)] cursor-pointer`
  - `.doctor-card`: `bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden transition-all duration-200 hover:shadow-[0_12px_32px_rgba(0,102,204,0.12)]`
- **Forms:**
  - `.form-label`: `block text-[0.9375rem] font-semibold text-[#1A202C] mb-2`
  - `.form-input`: `w-full bg-white border-2 border-[#E2E8F0] rounded-[12px] min-h-[48px] px-[18px] py-3 text-base text-[#1A202C] transition-all duration-200 focus:border-[#0066CC] focus:outline-none focus:ring-4 focus:ring-[#0066CC]/15`

---

## Anti-Patterns & Pre-Delivery Checklist

- [x] **No emojis as icons** — Use Lucide / clean SVG icons with `aria-hidden="true"` when decorative.
- [x] **No US-specific medical copy** — No HIPAA, JCAHO, ADA, Medicare, Aetna, US `(555)` numbers, or patient portal login. Use Indonesian equivalents (`Kelola Booking` -> `/booking/kelola`, WhatsApp, Kemenkes/Sterilisasi badges, QRIS/Debit/Transfer placeholders).
- [x] **No invented statistics or hotlinked Unsplash photos** — Keep `[JUMLAH]` and `[FOTO ...]` placeholders intact.
- [x] **Contrast >= 4.5:1** — All body, badge, and muted text passes WCAG AA.
- [x] **Visible `:focus-visible`** — 2px/4px `#0066CC` focus ring with offset on all interactive elements.
- [x] **`cursor-pointer`** — Present on all buttons, cards, tabs, accordions, and interactive controls.
- [x] **`prefers-reduced-motion: reduce`** — Disables smooth scroll, hover transforms, and transitions.
- [x] **Responsive across 375px, 768px, 1024px, 1440px** — No horizontal overflow or clipped chips.
