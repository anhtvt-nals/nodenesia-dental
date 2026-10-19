# Clinic Admin and CMS Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver an admin SPA that lets clinic staff operate schedules, bookings and all approved content without developer help.

**Architecture:** Each admin feature owns API functions, query keys/hooks, forms, focused UI and routes. Routes compose feature screens; shared UI contains only reusable visual primitives. API modules extend the platform/booking contracts from the preceding plan.

**Tech Stack:** Vite, React, TypeScript, TanStack Router/Query, shadcn/ui, Tailwind, FullCalendar, NestJS/Prisma, Vitest/Jest.

**Spec:** `docs/SPEC.md`; `docs/superpowers/specs/2026-10-18-dental-clinic-v1-design.md`

## Global Constraints

- Execute after `clinic-platform-booking.md`; consume its generated shared client.
- Admin routes require authenticated owner/staff access; API roles are checked at endpoints.
- FullCalendar uses day/week timeGrid with doctor filtering, not premium resource views.
- No page owns its own API wrapper, form schema and large JSX tree; use the feature folder boundary.
- Audit every admin mutation with actor, entity, ID, JSON diff, IP and timestamp.
- UAT is manual; no Playwright E2E is introduced.

## Review Focus

- Staff cannot create users or alter owner-only settings (Task 1).
- Editing a doctor’s hours refreshes booking availability rather than retaining stale cached slots (Task 2).
- A cancelled/no-show booking is excluded from active availability and review-message scheduling (Task 3).
- An unpublished gallery item or one without consent never appears in public API output (Task 4).
- Exported CSV is filtered by the requested date range and safely escapes patient values (Task 5).

---

### Task 1: Create admin shell, session handling and route guards

**Files:** Create `apps/admin/src/{main.tsx,router.tsx,lib/api-client.ts,components/layout/*,features/auth/{api.ts,queries.ts,LoginPage.tsx,RequireSession.tsx}}`.

**Produces:** `useSession()`, `RequireSession`, owner-route guard, responsive `AdminShell` with labelled navigation.

- [ ] Write component/query tests for expired session redirect and owner-only route denial.
- [ ] Run tests; expect failure before route/session components exist.
- [ ] Implement router, query provider, refresh-aware API client and small named layout components (`Sidebar`, `Topbar`, `MainContent`).
- [ ] Run admin tests/typecheck; expect pass.
- [ ] Commit: `feat: add admin shell and session guard`.

### Task 2: Implement settings, doctors, services and scheduling administration

**Files:** Create `apps/admin/src/features/{settings,doctors,services,schedules}/**`; create API CRUD modules/controllers/tests for doctor services, working hours and time offs.

**Interfaces:** `DoctorForm`, `WorkingHoursEditor`, `TimeOffForm`, `useDoctors()`, `useSaveDoctor()`; API invalidates availability-relevant cache tags after mutation.

- [ ] Write tests for multi-row daily shifts, time-off validation and owner/staff authorization.
- [ ] Run targeted tests; expect failure before feature/API endpoints exist.
- [ ] Implement focused form sections (`DoctorIdentityFields`, `DoctorServicePicker`, `WorkingHoursEditor`, `TimeOffList`) rather than a monolithic doctor form.
- [ ] Run API/admin tests and typecheck; expect pass.
- [ ] Commit: `feat: manage clinic catalogue and schedules`.

### Task 3: Build booking operations and calendar

**Files:** Create `apps/admin/src/features/bookings/{api.ts,queries.ts,BookingCalendar.tsx,BookingFilters.tsx,BookingDetailsPanel.tsx,BookingStatusForm.tsx,routes.tsx}`; create admin bookings API module/tests.

**Interfaces:** `BookingCalendar({ events, selectedDoctorId, onRangeChange })`; `BookingsService.list(filter): Paginated<AdminBooking>`; `updateStatus(id, input)`.

- [ ] Write tests for doctor/date/status filters, manual booking conflict response, status transitions, and audit-log creation.
- [ ] Run tests; expect failure before bookings admin module exists.
- [ ] Implement timeGrid calendar, filter bar, manual booking form and explicit detail/status panels; retain validation/error messages at the affected field/action.
- [ ] Run tests/typecheck; expect pass.
- [ ] Commit: `feat: operate bookings from admin calendar`.

### Task 4: Deliver patients, notifications, content and CMS features

**Files:** Create `apps/admin/src/features/{patients,notifications,content,testimonials,gallery,faqs,promotions,articles}/**`; create matching API modules/controllers/services/repositories/tests.

**Interfaces:** one `api.ts`, `queries.ts`, `forms/*.tsx`, and `components/*.tsx` per feature; `ContentBlockEditor`, `GalleryPublishForm`, `ArticleEditor` are separate components.

- [ ] Write tests for notification resend logging, gallery consent/publish validation, locale-specific content uniqueness, and article/promotion publish windows.
- [ ] Run tests; expect failure before CMS modules exist.
- [ ] Implement CRUD, a `StorageProvider` with local-volume default and S3/R2 replacement boundary, Sharp resize plus MIME/size checks, content forms and public-safe publication filtering; do not combine article body editing with gallery/FAQ logic.
- [ ] Run tests/typecheck; expect pass.
- [ ] Commit: `feat: add clinic CMS and notification operations`.

### Task 5: Add reporting, export and audit-log screens

**Files:** Create `apps/api/src/modules/{reports,audit-logs}/**`; `apps/admin/src/features/{reports,audit-logs}/**`.

**Interfaces:** `ReportsService.bookingSummary(range): BookingSummaryMetrics`; `ExportsService.bookingsCsv(filter): Stream`; `AuditLogList`.

- [ ] Write tests for no-show/source/service aggregation, CSV escaping/date filtering, and immutable audit rows.
- [ ] Run target tests; expect failure before report/export services exist.
- [ ] Implement the limited metrics in SPEC, streamed CSV and filterable audit table with no generic dashboard framework.
- [ ] Run tests/typecheck; expect pass.
- [ ] Commit: `feat: add clinic reports exports and audit logs`.
