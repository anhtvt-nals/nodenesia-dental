# Dental Clinic v1 — Technical Design

## Goal and scope

Deliver the complete v1 described in `docs/SPEC.md` for a single Indonesian dental clinic. It includes the public bilingual website, online booking, an operational admin application, WhatsApp notifications, CMS/SEO, the 3D pricing explorer, deployment, backups, and handoff. The product must be suitable for a real clinic pilot; go-live happens once it is sold and passes UAT.

Out of scope: medical records/SATUSEHAT, payments, mobile apps, multi-clinic and multi-branch support.

## Architecture

Use a Yarn 4 workspace monorepo managed through Corepack, Turborepo, and `nodeLinker: node-modules` for compatibility with Next.js, NestJS, Prisma, and Docker.

| Workspace | Responsibility |
| --- | --- |
| `apps/web` | Next.js 15 public website and booking UI; ID default, EN optional |
| `apps/admin` | Vite/React SPA for clinic staff and owners |
| `apps/api` | NestJS 10/Fastify REST API, jobs, auth, notifications and uploads |
| `packages/shared` | Zod schemas, enums, shared types, and generated OpenAPI client |

Web and admin communicate only with `/api/v1`; neither accesses PostgreSQL directly. PostgreSQL remains the source of truth. Content remains server-rendered HTML so SEO and the public experience do not depend on the 3D canvas.

## Delivery roadmap

The project is delivered through deployable staging milestones, not a calendar deadline. A release candidate contains the whole scope; the milestones make the dependency order testable before that point.

1. **Foundation:** Yarn/Turbo, Docker Compose, CI, Prisma/PostgreSQL schema and migrations, seed data, environment examples, Caddy.
2. **Scheduling core:** settings, doctors, services, working hours, time off, slot calculation, overlap protection and chair capacity.
3. **Booking and WhatsApp:** public booking/manage APIs and UI, abuse controls, pg-boss notifications and logs/retries.
4. **Admin operations:** JWT/cookie auth, roles, calendar, booking management, operational CRUD and audit logs.
5. **CMS and growth:** content blocks, FAQ, gallery/consent, testimonials, promotions, articles, exports, limited operational statistics, SEO management.
6. **Public experience:** complete public sitemap, multilingual pages, responsive UX, 3D pricing explorer with a static fallback.
7. **Hardening and handoff:** monitoring, security review, backup/restore rehearsal, manual UAT, documentation and clinic-owned credentials.

If trade-offs arise, correctness of scheduling and data is protected first, followed by admin/notifications, then SEO/content, then visual polish/3D. This orders work; it does not remove approved v1 features.

## Booking design

1. The browser requests slots by service, optional doctor, and date. The API calculates availability from working hours, doctor/clinic time off, active bookings, lead time, horizon, duration, and slot step.
2. The client submits name, WhatsApp number, service, doctor/preferred availability, slot, and a short complaint. Server-side Zod validation, honeypot and rate limits apply. Phone numbers are normalized to E.164.
3. The API recomputes availability in a transaction. When no doctor is selected, it chooses the first available doctor by the established priority/load rule. An advisory lock scoped to the relevant day protects chair-capacity checking.
4. It inserts a `confirmed` booking. The database exclusion constraint on doctor and `tstzrange` is the final overlap protection. A losing concurrent request receives `409` plus refreshed suggested slots.
5. Only after the transaction commits is a confirmation notification queued. A failed WhatsApp delivery does not cancel the appointment: it is logged and retried with backoff, while the confirmation page exposes the booking code, management link, and clinic contact.
6. Public management links use booking code plus a high-entropy token; only the token hash is stored. Cancellation/rescheduling respects the configured cutoff; staff may still handle exceptions in admin.
7. A review-request job runs H+1 only for bookings marked `completed`.

Required automated coverage is unit/service and database integration tests: split shifts, lunch breaks, cross-midnight hours, long services, timezone handling, simultaneous same-slot booking, overlap protection and chair capacity. Notification providers are faked in tests. Browser E2E automation is intentionally excluded; booking/admin/WhatsApp flows are verified in manual UAT.

## Admin and public product boundaries

The admin application uses short-lived access JWTs and httpOnly refresh cookies. Owners manage users and clinic settings; staff operate bookings, schedules and content according to endpoint-level authorization.

Admin includes calendar day/week views filtered by doctor (not premium resource columns), doctors and schedules, services/prices, patients, bookings/statuses, notification logs/retry, audit logs, content, promotions, articles, limited booking/no-show/source statistics, and CSV export.

The public web supplies the routes in the source SPEC: services, doctors, schedule, prices, results, facilities, patient information, articles, testimonials, contact, booking and booking management. Mobile exposes clear booking, WhatsApp and phone actions. Public content is ID-first with an optional EN translation.

## Deployment, security and release gates

Staging and production use Docker Compose with Caddy, web, API, static admin, PostgreSQL and the pg-boss worker. Deploy configuration is environment-specific; application secrets and provider credentials are never hardcoded.

The API applies CORS allowlists, Helmet, public rate limits, upload size/MIME checks plus Sharp processing, argon2 password hashing, httpOnly/SameSite refresh cookies, and endpoint-level role checks. Gallery before/after material stays unpublished unless consent is confirmed.

Daily encrypted `pg_dump` backups are uploaded to clinic-owned object storage with 14 retained copies. A restore rehearsal into a separate environment is required before production. Sentry monitors web/API and Uptime Kuma monitors availability and TLS.

CI runs lint, type checking, unit/integration tests, and workspace builds. It deliberately does **not** run Playwright E2E or build Docker images. Docker Compose builds images during staging/production deployment.

Before go-live, manual UAT verifies concurrent booking, cancellation/rescheduling, admin operations, WhatsApp confirmation and retry, timezone/schedules, backup restore, responsive 3D fallback/performance, and the approved acceptance checklist. Lighthouse mobile Performance and SEO must be at least 90.

## Clinic handoff

Before a sold clinic goes live, replace demo branding/content/data with its approved material; configure its domain, VPS, WhatsApp, object storage, analytics and Search Console accounts; run UAT; then provide operating documentation, deployment/credential inventory, backup/restore instructions and agreed bug warranty terms. All external accounts remain owned by the clinic.
