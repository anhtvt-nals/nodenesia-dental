# Clinic Public Web, SEO and Operations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the bilingual public clinic experience, booking UI, SEO/3D experience, deployment hardening and handoff readiness.

**Architecture:** Next App Router routes remain thin compositions of named feature sections. Each feature folder owns query/API adapters, schemas and UI; visual primitives and layout stay shared. SEO markup exists independently of the optional lazy 3D canvas.

**Tech Stack:** Next.js 15, TypeScript, Tailwind v4, next-intl, TanStack Query, react-hook-form/Zod, three/R3F/drei, GSAP/Lenis, Docker Compose/Caddy, Sentry.

**Spec:** `docs/SPEC.md`; `docs/superpowers/specs/2026-10-18-dental-clinic-v1-design.md`

## Global Constraints

- Execute after platform booking and admin/CMS plans; consume only generated API client/public endpoints.
- ID is default locale; EN remains optional and has canonical/hreflang metadata.
- Text/service price content is semantic HTML and API-driven; never hardcode 3D prices.
- 3D is lazy, uses a static poster fallback, respects reduced motion and caps DPR at 1.5.
- No gradients/glassmorphism/template card grids; use the approved editorial tokens and accessible controls.
- CI has no Playwright E2E or Docker-image build; manual UAT is a release gate.

## Review Focus

- JavaScript/WebGL failure still leaves prices, service content and booking CTA usable (Task 4).
- A changed service price appears consistently on detail pages, price explorer and booking selection (Tasks 2 and 4).
- A missing EN translation falls back safely without emitting incorrect canonical/hreflang metadata (Task 1).
- Invalid/expired manage-booking URL gives an actionable public error without leaking patient information (Task 3).
- Lighthouse regressions from fonts/images/3D fail the documented manual performance gate (Task 6).

---

### Task 1: Establish web shell, design tokens and international routing

**Files:** Create `apps/web/src/{app/[locale]/layout.tsx,app/[locale]/not-found.tsx,i18n/*,styles/globals.css,components/layout/*,components/ui/*,features/site-settings/*}`.

**Produces:** `SiteHeader`, `SiteFooter`, `MobileActionBar`, semantic `Button`/`SectionLabel`, locale resolver, metadata helpers and CSS tokens.

- [ ] Write tests for ID default, EN route selection and metadata fallback.
- [ ] Run tests; expect failure before routing/helpers exist.
- [ ] Implement locale/layout composition and locked ivory/near-black/moss/coral tokens; keep navigation and mobile actions as small explicit components.
- [ ] Run web tests, typecheck and build; expect pass.
- [ ] Commit: `feat: add public web shell and locales`.

### Task 2: Implement content-driven public routes and SEO

**Files:** Create `apps/web/src/app/[locale]/(marketing)/{page.tsx,layanan/**,dokter/**,jadwal/**,harga/**,hasil-kami/**,fasilitas/**,artikel/**,kontak/**}`, `features/{services,doctors,schedule,articles,seo}/**`, `app/{sitemap.ts,robots.ts}`; add API public read endpoints/tests as needed.

**Interfaces:** `ServicePage({ service, locale })`; `DoctorSchedule({ doctorId })`; `buildPageMetadata(input): Metadata`; `buildJsonLd(input): JsonLd`.

- [ ] Write tests for inactive content exclusion, service canonical/hreflang, valid Dentist/Service/Physician/FAQ JSON-LD, and redirect resolution.
- [ ] Run targeted tests; expect failure before helpers/routes exist.
- [ ] Implement each route as a composition of dedicated feature sections (for example `ServiceHero`, `ServicePricing`, `ServiceFaq`, `DoctorList`), not one page-sized JSX component.
- [ ] Generate sitemap/robots, 404 suggestions and redirect API/admin support; run tests/build.
- [ ] Commit: `feat: add public content routes and SEO`.

### Task 3: Build public booking and management UI

**Files:** Create `apps/web/src/app/[locale]/(booking)/booking/page.tsx`, `manage-booking/[code]/page.tsx`, `features/booking/{api.ts,queries.ts,schema.ts,BookingFlow.tsx,ServiceStep.tsx,DoctorStep.tsx,SlotStep.tsx,PatientStep.tsx,BookingConfirmation.tsx,ManageBookingPanel.tsx}`.

**Interfaces:** `BookingFlow({ initialServiceSlug?: string, initialDoctorSlug?: string })`; `useSlots(query: SlotQuery)`; `bookingSchema` mirrors `CreatePublicBookingInput`.

- [ ] Write form/query tests for step validation, stale slot `409` recovery, phone errors, confirmation rendering and invalid manage token response.
- [ ] Run tests; expect failure before feature components/hooks exist.
- [ ] Implement a named step component per input group, form state in `BookingFlow`, and API calls in `api.ts`; routes only pass params and render the feature.
- [ ] Run tests/typecheck/build; expect pass.
- [ ] Commit: `feat: add public booking experience`.

### Task 4: Add accessible 3D price explorer

**Files:** Create `apps/web/src/features/pricing-3d/{PricingExplorer.tsx,ToothScene.tsx,ToothMesh.tsx,ZonePricePanel.tsx,MobileZoneSheet.tsx,useToothSelection.ts,scene-config.ts}`, `components/ui/StaticPoster.tsx`.

**Interfaces:** `PricingExplorer({ services: ServiceSummary[] })`; `useToothSelection(): { selectedZone, selectZone }`; `zoneForMeshName(name): ServiceZone | null`.

- [ ] Write tests for FDI mesh-name to zone mapping, API price rendering, reduced-motion/fallback render and mobile tap selection.
- [ ] Run tests; expect failure before map/components exist.
- [ ] Implement lazy client-only scene, Draco/WebP GLB loading, 1.5 DPR cap, hover desktop/tap mobile panels and static semantic price-list fallback.
- [ ] Run tests and manually measure compressed model budget below 1.5 MB; expect pass.
- [ ] Commit: `feat: add 3d service price explorer`.

### Task 5: Add analytics, observability and deployment automation

**Files:** Create `apps/web/src/features/analytics/*`, `apps/{web,api}/sentry.*.config.*`, `infra/{Caddyfile,backup.sh,restore.sh,uptime-kuma/README.md}`, `docs/{deploy.md,admin-guide.md,seo-handoff.md,uat-checklist.md}`.

**Interfaces:** `trackBookingEvent(name: 'view_service' | 'start_booking' | 'complete_booking' | 'click_whatsapp', data): void`; `backup.sh`; `restore.sh <backup-file>`.

- [ ] Write script checks for required environment variables and a restore rehearsal checklist; test analytics event payload construction.
- [ ] Run checks; expect failure before scripts/configuration exist.
- [ ] Implement GA4 or Plausible adapter selected by environment, Sentry setup, Compose/Caddy production configuration, daily encrypted backup upload with 14-retention policy, and restore script.
- [ ] Run workspace checks and restore rehearsal against a separate database; expect pass.
- [ ] Commit: `feat: add production operations and handoff docs`.

### Task 6: Run manual acceptance and release review

**Files:** Modify `docs/uat-checklist.md`, `docs/deploy.md`.

- [ ] Record manual UAT results for phone booking, concurrent booking, cancel/reschedule, admin changes, provider retry, backup restore, Indonesian/English pages, mobile fallback and credentials ownership.
- [ ] Measure Lighthouse mobile Performance/SEO; require both scores >= 90 before production approval.
- [ ] Run `yarn lint && yarn typecheck && yarn test && yarn build`; expect all pass.
- [ ] Commit the UAT evidence when a Git repository is initialized: `docs: record clinic release verification`.
