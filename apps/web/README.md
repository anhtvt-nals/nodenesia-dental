# Dental Clinic Website (Public Client UI)

A modern, editorial, and accessible dental clinic client web application built for Indonesia with TypeScript, React, Vite, Tailwind CSS, Three.js, and multi-language routing (ID default, EN mirrored under `/en/...`).

---

## 1. Route Map

All routes exist in Indonesian (default, no prefix) and mirror under `/en/...` with automatic hreflang tags:

| Indonesian Route | English Mirrored Route | Description |
| :--- | :--- | :--- |
| `/` | `/en` | Homepage (7 numbered sections, 3D explorer, today's quick slots, FAQ, Doctor cards) |
| `/layanan` | `/en/layanan` | Service directory categorized (Preventive, Cosmetic, Ortho, Surgery, etc.) |
| `/layanan/:slug` | `/en/layanan/:slug` | Service detail page with duration, price estimate, attending doctors, FAQ, Booking CTA |
| `/dokter` | `/en/dokter` | Specialist doctor profiles directory with SIP and degrees |
| `/dokter/:slug` | `/en/dokter/:slug` | Doctor detail page with specialty, weekly hours, clinical bio, booking CTA |
| `/jadwal` | `/en/jadwal` | Weekly doctor clinical schedule with day tabs (Senin–Sabtu), "Slot Hari Ini" badge |
| `/hasil-kami` | `/en/hasil-kami` | Clinical before/after gallery with patient informed consent disclosure |
| `/fasilitas` | `/en/fasilitas` | Medical technology and sterilization standards (Class B Autoclave, HD intraoral, lounge) |
| `/artikel` | `/en/artikel` | Patient educational articles with topic filter and read times |
| `/artikel/:slug` | `/en/artikel/:slug` | Article reader with clinical reviewer attribution and share tool |
| `/testimoni` | `/en/testimoni` | Curated patient reviews from Google Reviews and verified clinic visits |
| `/kontak` | `/en/kontak` | Practice address, operating hours with live "Buka / Tutup" badge, WhatsApp, hotline |
| `/booking` | `/en/booking` | 4-step booking flow (Service, Doctor/Date, Slot Picker, Patient WhatsApp data & honeypot) |
| `/booking/sukses/:code` | `/en/booking/sukses/:code` | Confirmation screen with 1-click WhatsApp deep link with prefilled booking message |
| `/booking/kelola/:code` | `/en/booking/kelola/:code` | Self-service booking management (view status, online reschedule, cancel with modal) |
| `*` | `*` | 404 page with navigation links back |

---

## 2. Data Layer API (`src/lib/api.ts`)

Every component consumes data exclusively through the asynchronous functions in `src/lib/api.ts`, which call the NestJS backend under `/api/v1/public/*`. The Vite dev server proxies `/api` to `http://localhost:3000` (see `vite.config.ts`), so run the API alongside `yarn dev`.

The adapter normalizes the backend payloads into the client-facing types in `src/types.ts`, including:

- Bilingual content: Indonesian columns plus their `*_en` counterparts (falling back to the Indonesian value when a translation is missing).
- Currency/price: `priceFrom`/`priceTo` strings are converted to numbers for `formatRupiah`.
- Service categories: the backend enum (`prevention`, `aesthetic`, …) is mapped to the UI slugs (`pencegahan`, `estetik`, …).
- Timezones: booking wall-clock times are converted to/from UTC using the clinic timezone from `GET /public/settings`.

Functions:

- `getSettings()`: Clinic contact info, opening hours, WhatsApp number, and statistics (also cached and shared via `ClinicSettingsProvider` / `useClinicSettings()`).
- `getServices()`: Fetches the full service catalog (with per-service FAQs).
- `getService(slug)`: Fetches an individual service by slug or ID.
- `getDoctors()`: Fetches doctors with credentials, weekly schedules, and education.
- `getDoctor(slug)`: Fetches doctor detail by slug or ID.
- `getSlots({ serviceId, doctorId, date })`: Fetches slot availability (respecting procedure duration and lunch breaks). Each slot carries the assigned `doctorId` so "any doctor" bookings work.
- `createBooking(payload)`: Submits a reservation. Normalizes the phone to E.164, converts the local date/time to UTC, sends the `website` honeypot, and stores the returned management token. Surfaces HTTP 409 conflicts.
- `getBooking(code, token)`: Retrieves a reservation for the confirmation/management screens using its management token.
- `cancelBooking(code, token)`: Cancels a reservation and frees the slot.
- `rescheduleBooking(code, { newDate, newTime, token })`: Reschedules a reservation.
- `getArticles()` & `getArticle(slug)`: Educational dental articles (paragraphs split from the stored body).
- `getFaqs()`: Clinic questions and answers.
- `getTestimonials()`: Verified patient reviews.
- `getGallery()`: Before-and-after cases with consent confirmations and linked service names.

The confirmation and management screens carry the management token as a `?token=` query parameter (it is returned once when the booking is created).

---

## 3. How to Replace the Placeholder 3D Model with a GLB

The 3D tooth scene in `src/components/teeth/TeethScene.tsx` is structured with FDI 2-digit tooth numbering:
- Upper right: `tooth_11`, `tooth_12`, `tooth_13`, `tooth_14`, `tooth_15`
- Upper left: `tooth_21`, `tooth_22`, `tooth_23`, `tooth_24`, `tooth_25`
- Gingival tissue: `gum`

To replace the procedural placeholder with a high-fidelity 3D model:

1. Place your GLB file inside `/public/models/teeth_arch.glb`. Ensure meshes inside the file are named following standard FDI notation (`tooth_11` through `tooth_48` and `gum`).
2. In `src/components/teeth/TeethScene.tsx`, import `GLTFLoader`:
   ```ts
   import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
   ```
3. Load the model and traverse its children to assign zone tags and materials:
   ```ts
   const loader = new GLTFLoader();
   loader.load('/models/teeth_arch.glb', (gltf) => {
     gltf.scene.traverse((child) => {
       if ((child as THREE.Mesh).isMesh) {
         const mesh = child as THREE.Mesh;
         const name = mesh.name; // e.g. "tooth_11" or "gum"
         
         // Classify zone
         if (name === 'gum') {
           mesh.userData.zone = 'gum';
         } else if (['tooth_11','tooth_12','tooth_13','tooth_21','tooth_22','tooth_23'].includes(name)) {
           mesh.userData.zone = 'front';
         } else {
           mesh.userData.zone = 'molar';
         }
         
         teethMeshes.push(mesh);
         originalMaterialsRef.current.set(mesh, mesh.material);
       }
     });
     toothGroup.add(gltf.scene);
   });
   ```
4. The Raycasting, emissive highlights, hover zones, mobile bottom sheet, and booking prefill will immediately work without any other changes.

---

## 4. Next.js App Router Portability

The project adheres to portable architecture:
- Pages are self-contained in `src/pages/`
- Zero routing logic or `useNavigate` inside presentational cards
- Metadata handled via `AppHelmet` (`react-helmet-async`), which maps 1:1 to Next.js `generateMetadata` in `app/**/page.tsx`
- Layout components (`Navbar`, `Footer`, `MobileBar`) are decoupled in `src/components/layout/`
