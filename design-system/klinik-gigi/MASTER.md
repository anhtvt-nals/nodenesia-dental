# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/klinik-gigi/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Klinik Gigi (Senyum Sehat Dental Care)
**Updated:** 2026-10-25
**Category:** Healthcare / Dental Clinic Web Application (Indonesia)
**Stack Detected:** React 18 + Vite 5 + React Router 6 + Tailwind CSS v4 (`@import "tailwindcss";` + `@theme` in `apps/web/src/index.css`)
**Precedence:** Step 2–4 Explicit Non-Negotiable Overrides > `ui-ux-pro-max` UX/Accessibility Guidelines.

---

## 1. Conflict Resolution (`ui-ux-pro-max` Output vs. Explicit Overrides)

| Dimension | `ui-ux-pro-max` Search Output | Final Decision (Overrides Win) |
|-----------|-------------------------------|--------------------------------|
| **Color Palette** | Sky blue `#0EA5E9`, ice `#F0F9FF` | **Enamel & Pine Editorial Palette**: `enamel #F6F7F4` (bg), `mint #DDEAE3` (alt sections), `pine #12392F` (primary), `pine-2 #1E5245` (hover), `gum #E59A93` (WhatsApp button & focus ring only), `ink #1B2623` (foreground), `ink-2 #51605B` (muted), `line #CBD6D0` (hairlines). **No blue primary, no gradients, no gradient text, no purple/pink washes.** |
| **Typography** | Generator: `Poppins / Open Sans`; Domain: `Baloo 2 / Varela Round / Plus Jakarta Sans` | **Bricolage Grotesque** (headings `500`, `700`) + **Figtree** (body `400`, `500`, `600`). Replaces Plus Jakarta Sans, Inter, and Manrope. Sentence case headings with `text-wrap: balance`. |
| **Anti-AI-Slop Rules** | Soft UI cards, badges, icons | **Strict Removal of AI Tells**: Remove numbered section labels (`01 / Layanan`) and eyebrow labels above headings; remove tracked all-caps labels; remove trailing `→` on links/buttons; remove repeated trust badges (keep ONE trust line in the footer only: `Kemenkes RI, STR & SIP, Autoclave Kelas B`); remove icon-in-tinted-square on every card; remove identical rounded cards with soft shadows, hover-lift (`translateY`), and fade-slide-up entrances. |
| **Border Radius by Role** | Uniform rounded cards | **Distinct Radius per Role**: Buttons = `10px`; Photos = asymmetric (`rounded-[24px_8px_24px_8px]` or `rounded-[28px_0_0_28px]` for edge-bleed); Table/list rows = `0px` (sharp hairlines). |
| **Section Layouts** | Hero + Card grids | **Every Section Has a Distinct Structure**: Hero (`7fr/5fr` asymmetric with right-bleeding doctor photo, max 2 CTAs, 2 facts only); Services (1 hairline table list, no icons/cards); Doctors (full-width alternating left/right editorial blocks); Reviews (1 large pull quote + 2–3 plain list quotes, no 5-star icon rows); Schedule (plain weekly table, no pill tabs); Articles (plain list rows, no cards); Location (map + plain text address/parking/transit, no boxed sub-cards). |

---

## 2. Semantic Design Tokens (`apps/web/src/index.css`)

### Color Tokens

| Token / Variable | Hex | Role & Contrast |
|------------------|-----|-----------------|
| `--color-bg` / `--color-background` | `#F6F7F4` | **Enamel** — Primary background |
| `--color-bg-alt` / `--color-surface` | `#DDEAE3` | **Mint** — Alternating section background |
| `--color-bg-card` | `#F6F7F4` | Surface fill (matches enamel; no drop-shadow white card boxes on landing) |
| `--color-primary` / `--color-bg-dark` | `#12392F` | **Pine** — Primary actions, footer background (`12.1:1` vs `#F6F7F4`) |
| `--color-primary-hover` | `#1E5245` | **Pine-2** — Primary hover state (`8.6:1` vs `#FFFFFF`) |
| `--color-accent` / `--color-ring` | `#E59A93` | **Gum** — Single accent: WhatsApp button fill (`#1B2623` ink text on `#E59A93` = `6.4:1` AA pass) & `:focus-visible` ring only |
| `--color-text` / `--color-foreground` | `#1B2623` | **Ink** — Primary text (`14.3:1` on `#F6F7F4`, `11.8:1` on `#DDEAE3`) |
| `--color-text-muted` / `--color-text-subtle` | `#51605B` | **Ink-2** — Secondary text (`5.8:1` on `#F6F7F4`, `4.8:1` on `#DDEAE3` — passes WCAG AA `>= 4.5:1`) |
| `--color-border` | `#CBD6D0` | **Line** — Hairline dividers and table borders |

### Typography Tokens

- **Heading (`--font-heading`):** `"Bricolage Grotesque", system-ui, -apple-system, sans-serif` (weights `500`, `700`; sentence case; `text-wrap: balance`; bounded `max-inline-size`)
- **Body (`--font-body`, `--font-sans`):** `"Figtree", system-ui, -apple-system, sans-serif` (weights `400`, `500`, `600`; line-height `1.6`)
- **Google Fonts URL:**
  `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Figtree:wght@400;500;600&display=swap`

### Shape & Radius Rules

- **Buttons (`.btn-primary`, `.btn-secondary`, `.btn-whatsapp`):** `border-radius: 10px` (`--radius-btn: 10px`). No hover lift.
- **Photos (`.photo-asymmetric`, `.photo-bleed-right`):** Asymmetric corners (`border-radius: 24px 8px 24px 8px` for editorial portraits; `border-radius: 28px 0 0 28px` for right-bleeding hero photo).
- **Table & List Rows:** `border-radius: 0px`, separated by `1px solid #CBD6D0` (`--color-border`).

---

## 3. Section-by-Section Structural Contract (Landing Page)

1. **Hero (`enamel #F6F7F4`):**
   - Asymmetric `7fr / 5fr` layout on desktop (`lg:grid-cols-12`).
   - Left (`7fr`): Concrete sentence-case headline (`"Gigi sehat, tanpa buru-buru."`), specific body copy (45-minute appointments, same specialist from checkup to completion, cost confirmed before procedure), max **2 CTAs** (`Buat janji temu` in Pine `#12392F`, `Tanya via WhatsApp` in Gum `#E59A93` with Ink `#1B2623` text), and **2 facts only** (`4,9 dari 380+ ulasan Google`, `3 dokter gigi spesialis`).
   - Right (`5fr`): Real doctor portrait bleeding to the right viewport edge, with subtle cross-fade switcher (`drg. Ayu`, `drg. Bima`, `drg. Citra`). No 3D jaw model, no floating trust badges on the photo, no extra stat boxes.

2. **Services (`mint #DDEAE3`):**
   - **ONE table-style list** replacing both the 6 service cards and the duplicate fee table.
   - Each row (`border-b border-border rounded-none py-5`): `Service Name` | `One-line concrete description + duration` | `Mulai dari Rp ...` | `Lihat detail` text link. No icons, no card borders, hairlines only.

3. **Doctors (`enamel #F6F7F4`):**
   - **Full-width editorial block per doctor**, with asymmetric photo alternating **left / right** on desktop, replacing the 3-card grid. Shows name, specialist degree (`Sp.KG`, `Sp.Ort`, `Sp.BM`), SIP license, concrete clinical focus, education, and a plain text link to book or view profile.

4. **Reviews (`mint #DDEAE3`):**
   - **One large pull quote** (`Bricolage Grotesque` 500, large editorial type) + **2–3 smaller quotes as a plain vertical/horizontal hairline list**. No repeated 5-star SVG rows, no boxed review cards.

5. **Schedule (`enamel #F6F7F4`):**
   - **Plain weekly HTML table** (`Senin` through `Sabtu` columns or doctor rows × weekday columns) showing exact hours for all 3 specialists at a glance. No interactive pill tabs.

6. **Articles (`mint #DDEAE3`):**
   - **Plain hairline list rows** (`Title` | `Author & Read time` | `Excerpt` | `Baca artikel`), no cards.

7. **Location & Access (`enamel #F6F7F4`):**
   - **Map embed + plain text columns** for address, parking capacity (6 cars, 15 motorcycles at lobby), and transit (5 mins from MRT Blok M/Senayan & TransJakarta), plus payment/insurance note. No boxed sub-cards.

8. **Footer (`pine #12392F`):**
   - Deep pine background with enamel text. Contains the **single trust line** (`Terdaftar Kemenkes RI · Dokter Berizin STR & SIP · Sterilisasi Autoclave Kelas B`).

9. **Floating WhatsApp & Sticky Mobile Bar (`<800px`):**
   - Floating WhatsApp button using Gum `#E59A93` (with `#1B2623` ink icon/text for contrast) and `max-[799px]:flex` sticky bottom CTA bar on mobile (`<800px`).
