# Public Web App Integration (`apps/web`)

`apps/web` is the public, patient-facing site. It was replaced with a
React 19 / Vite / Tailwind v4 single-page app (originally generated in Google AI
Studio) and has since been wired into this monorepo and the NestJS API.

## Toolchain normalization

The imported app was aligned with the rest of the repo so a single
`yarn install` / `yarn build` works across all workspaces:

| Concern | Before (imported) | After (repo-aligned) |
| :--- | :--- | :--- |
| Package name | `react-example` | `@clinic/web` (so `turbo`/`yarn --filter` work) |
| React | 19 | 18.3.1 (matches `@clinic/admin`) — the UI uses no React 19-only APIs |
| Vite / plugin-react | 8 / 6 | 5.4 / 4.3 (matches `@clinic/admin`) |
| TypeScript | 7 | 5.7.2 (matches the repo) |
| Scripts | `dev`, `build`, `lint` | `dev`, `build` (`tsc --noEmit && vite build`), `lint`, `typecheck`, `test`, `preview` |
| Dev proxy | none | `/api` → `http://localhost:3000` |
| Removed | AI Studio artifacts, `bun.lock`, `metadata.json`, `@google/genai`, `express`, `dotenv`, `tsx`, `esbuild`, `autoprefixer`, unused `motion`, `lucide-react`, `src/mocks`, `src/assets` | — |

The 3D tooth scene (`three.js`) is loaded lazily (`LazyTeethScene`) and split into
its own vendor chunk, keeping it out of the initial bundle.

## Data layer

`src/lib/api.ts` is the only place that talks to the backend; every page consumes
it through the types in `src/types.ts`. It reads `GET /api/v1/public/*` and adapts
the payloads (bilingual fallbacks, `priceFrom` string → number, category enum →
UI slug, UTC ↔ clinic-timezone conversion).

Clinic settings are fetched once and shared through
`ClinicSettingsProvider` / `useClinicSettings()` (`src/lib/clinic-settings.tsx`).

### Booking management token

`POST /public/bookings` returns a one-time `manageToken`. The success and manage
screens carry it as `?token=…`; `getBooking` / `cancelBooking` /
`rescheduleBooking` all require it.

## i18n strategy (database)

The public UI is bilingual (Indonesian default, English under `/en`). Instead of a
generic translations table, translations are stored as sibling `*_en` columns,
consistent with the pre-existing `Service.nameEn`. The API returns the `*_en`
value with the Indonesian value as fallback, and the client picks by locale.

Columns added (migration `20261019120000_public_i18n_content`, all nullable):

- `clinic_settings`: `tagline(_en)`, `city`, `instagram_handle`, `google_maps_url`, `open_hours` (JSON), `stats` (JSON)
- `doctors`: `title_en`, `specialty_en`, `bio_en`, `sip_number`, `experience_years`, `education` (JSON)
- `services`: `short_desc_en`, `description_en`, `price_note_en` (`name_en` already existed)
- `faqs`: `question_en`, `answer_en`, `category`
- `testimonials`: `text_en`, `service_name(_en)`, `reviewed_at`
- `gallery_items`: `before_label`, `after_label`, `caption_en`, `treatment_duration`
- `article_categories`: `name_en`
- `articles`: `title_en`, `excerpt_en`, `body_en`, `read_time`, `author_name`, `author_title`

Trade-off: adding a third language would require new columns. If a third locale is
ever needed, migrate to a `translations` table keyed by `(entity, entity_id,
field, locale)`.

## Extended public API

To satisfy the UI, the following public endpoints were enriched (additive; no
existing consumers were broken):

- `GET /public/settings` — now includes tagline, city, socials, structured
  opening hours, and homepage stats.
- `GET /public/services` — now includes EN copy, `category`, `description`, and
  the service's FAQs.
- `GET /public/doctors` — now includes EN copy, `photoUrl`, `sipNumber`,
  `experienceYears`, `education`, and weekly `workingHours`.
- `GET /public/slots` — each slot now carries the assigned `doctorId`.
- `POST /public/bookings` — `doctorId` is now optional ("any doctor"); the server
  assigns the first available doctor. `complaint` is persisted.
- `GET /public/bookings/:code` — now returns `patient { name, phone }` and
  `complaint` so the confirmation and management screens can render them.

## Doctor portraits

The seed fills `Doctor.photoUrl` with real, publicly hosted portraits from the
Unsplash CDN (`images.unsplash.com`, free to hotlink, no API key):

```
https://images.unsplash.com/<photo-id>?auto=format&fit=crop&crop=faces&w=1200&h=750&q=80
```

`w=1200&h=750` matches the hero's 16:10 frame (no upscaling/cropping there) and
`crop=faces` keeps the face centred, so the same URL also fills the 3:4 doctor
cards and the profile page. The hero slider's prev/next arrows live outside the
sliding track, so they stay anchored to the frame while the slides move, and
each `<img>` falls back to the labelled `[FOTO …]` placeholder via `onError`
(offline demos, blocked CDN). Swap the URLs in `apps/api/prisma/seed.ts` and
re-run `yarn workspace @clinic/api seed` to use real clinic photos.

## 3D dental model asset

The hero and prices pages render a real dental model (both jaws) instead of the
previous procedural arch.

- Asset: `apps/web/public/models/human-mouth.stl` (~2.3 MB, 45.6k triangles,
  geometry only — STL carries no materials).
- Source & licence: "Human mouth detailed" by **Mince**, **CC BY 4.0**
  (hosted on Wikimedia Commons as `File:3D model of the human mouth.stl`).
  Attribution is shown on the model ("3D: Mince · CC BY 4.0").
- Colour: the STL is actually made of **31 detached shells** — one soft-tissue
  shell (gums, lips, tongue, palate) plus a separate shell per tooth (~30 teeth;
  a couple of touching pairs are welded). `TeethScene` splits them by connected
  component at load time and shades teeth with a glossy ivory
  `MeshPhysicalMaterial` (clearcoat) and the gum mass with a matte rose
  `MeshStandardMaterial`. Because the shells are welded into indexed geometry,
  normals are smooth rather than faceted.
- Soft-tissue crop: that tissue shell also contains the lips, cheeks, palate,
  tongue and throat. Triangles whose vertices are all further than
  `0.072 × model-width` from any tooth vertex are dropped, so only the two
  dental arches (gums + teeth) remain.
- Solid gum mass (roots are covered, not cut): the trimmed sheet is only a thin
  band, so the roots would poke out of it as white spikes. Instead of deleting
  them, `buildGumMass` samples the trimmed gum (vertices + edge midpoints +
  centroids) and the tooth roots (vertices on the root side of the cervical line)
  into a voxel grid, runs a chamfer distance transform, smooths the field with a
  separable box blur (2 passes, radius 2) and extracts the isosurface with naive
  surface nets at `0.0265 × model-width`. The result is one watertight pink block
  that encases the roots and the ragged crop border; the crowns emerge from it.
  Grid step is `0.0154 × model-width`; the pass costs ~30 ms (distance) + ~20 ms
  (blur) + ~35 ms (surface nets) on first load. The material is `DoubleSide`
  because the extracted winding is not guaranteed.
- Zone highlight: each tooth shell becomes its own mesh with a cloned material,
  classified as **front** (incisors/canines, `|x| < 0.31 × half-width`) or
  **molar** (premolars/molars). Selecting a zone pill glows the matching shells
  via `emissive` (`front`, `molar`, `arch` = all teeth, `gum` = generated gum mass),
  pulsing gently at ~0.4 Hz between 50% and 100% of the base intensity (steady
  under `prefers-reduced-motion`). The compact price list below still filters
  services by zone.
- Orientation: the scan is authored mouth-facing `-Y` with the arches stacked
  along `Z`, so the model group is rotated `-90°` about X to face the camera
  with the upper arch up.
- Lighting: `RoomEnvironment` + `PMREMGenerator` image-based lighting with warm
  key / cool fill / rim directional lights.
- Loading: `TeethScene` lazy-loads `STLLoader`, welds + centres the geometry and
  scales it to a fixed world radius so camera framing is deterministic.
- Interaction: `OrbitControls` — **drag to rotate**, **wheel / pinch to zoom**
  (pan disabled; idle auto-rotate that stops on first interaction, and is off
  under `prefers-reduced-motion`).
- Swapping the model: drop a file in `apps/web/public/models/` and update
  `MODEL_URL` in `src/components/teeth/TeethScene.tsx`. `.stl` works as-is;
  a `.glb`/`.gltf` (with its own materials) needs `GLTFLoader` instead of
  `STLLoader` and would not use the shell-splitting colour pass.

## Running locally

```bash
docker compose up -d                                   # Postgres
yarn workspace @clinic/api exec prisma migrate deploy  # apply migrations
yarn workspace @clinic/api seed                        # demo content
yarn dev                                               # api :3000, web :5173, admin :5174
```

`yarn seed` now refreshes the canonical demo rows on re-run (upsert with an
`update` payload) instead of skipping existing records.
