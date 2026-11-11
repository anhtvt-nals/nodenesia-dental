# Admin Page Overrides

> **Project:** Klinik Gigi  
> **Page type:** Clinic operations console  
> **Precedence:** These rules refine `../MASTER.md`; its enamel, mint, pine, gum,
> ink, line, Bricolage Grotesque, and Figtree foundations remain mandatory.

## Admin shell

- The pine sidebar is grouped under `Harian`, `Kelola`, and `Sistem`, with clinic
  name and small `Admin` label at the top and the user/logout action at the bottom.
  The top bar is limited to page title and page-specific actions.

- Fixed `240px` pine sidebar on desktop; use enamel text and a simple clinic name.
- At `1024px` and below, collapse the rail to icon-width while retaining accessible
  labels; below `768px`, present it as an accessible drawer.
- The current item uses a `3px` gum left rule and text change—never a filled pill.
- Content is enamel, with a slim hairline-separated top bar: page title, current
  user, and the existing logout action.
- Keep all content in a practical `max-inline-size: 1440px` with `24px` desktop
  gutters and `16px` mobile gutters.

## Login

- Desktop is a `5 / 7` full-height split: plain pine clinic panel at left and a
  vertically centred, unboxed enamel form at right (`max-inline-size: 380px`).
- The pine panel contains only clinic name and one plain sentence. At mobile it
  becomes a short pine name strip; hide the sentence.
- Inputs are `48px`, `10px` radius, labelled above, and use the gum focus ring.
  Present validation below its field and submission failures in a text alert.

## Data views

- Ringkasan starts with the Indonesian date and one plain summary line. Its
  pending and no-show counts link to a pre-filtered Janji temu page; its main
  content is one `Jadwal hari ini` table with no duplicate heading or chart.
- Loading preserves table geometry with accessible skeleton rows; errors include
  `Coba lagi`, and empty states include an appropriate next action.

## Indonesian language and formatting

- `id` is the only Admin locale. All visible copy, validation, aria labels,
  dialogs, API error mappings, empty states, and status labels come from one
  dictionary; components contain no user-facing literals.
- Use short, polite, sentence-case Bahasa Indonesia. Use the agreed glossary:
  `Ringkasan`, `Janji temu`, `Pasien`, `Dokter`, `Layanan`, `Konten`,
  `Operasional`, `Pengaturan`, `Jadwal`, `Tambah`, `Ubah`, `Hapus`, `Simpan`,
  `Batal`, `Konfirmasi`, `Keluar`, and `Memuat...`.
- Format dates, times, numbers, and currency through `Intl` with `id-ID` and
  `Asia/Jakarta`; use a 24-hour clock with `WIB`, rupiah without decimals, and
  `+62` phone formatting. Weeks begin on Monday.
- Authentication uses custom Indonesian inline validation with `noValidate`; do
  not expose browser-native validation messages.

- Dashboard begins with one large, plain operational summary sentence, followed by
  the `Hari ini` appointments table. Do not add a chart: the available guidance
  only recommends a chart when a real target/benchmark exists.
- Tables use sharp corners, fixed column widths, a sticky header, `44px` minimum
  row height, and `1px` line separators. Their wrapper scrolls horizontally on
  narrow screens; never transform rows into unrelated card layouts.
- Put search, status, and date controls before each applicable table. Existing
  multi-select controls remain available for bulk actions.
- A status is always a readable label paired with a dot: pending, confirmed,
  cancelled, done, and no-show. The dot is supplementary only.
- Row actions are concise text buttons. Loading, empty, and error states live
  inside the content region rather than in toasts alone.

## Forms and overlays

- Forms are one column with labels above controls and inline validation. Use a
  sticky save bar for edit/create flows where it does not change the data flow.
- Destructive actions require a confirmation dialog. Dialogs and dropdowns are
  the only surfaces with a shadow; dialogs use a `14px` radius.
- Buttons and inputs use `10px`; tables use `0`; do not use hover-lift, gradients,
  glass, decorative icon tiles, or entrance animation. Respect reduced motion;
  only dialog and toast transitions may remain.

## Semantic implementation tokens

```css
:root {
  --admin-background: var(--color-bg, #F6F7F4);
  --admin-surface: var(--color-bg-alt, #DDEAE3);
  --admin-foreground: var(--color-text, #1B2623);
  --admin-primary: var(--color-primary, #12392F);
  --admin-accent: var(--color-accent, #E59A93);
  --admin-border: var(--color-border, #CBD6D0);
  --admin-ring: var(--color-ring, #E59A93);
}
```

Use token names in new styles; do not introduce a second palette or substitute
the generator's dark/glass recommendation.
