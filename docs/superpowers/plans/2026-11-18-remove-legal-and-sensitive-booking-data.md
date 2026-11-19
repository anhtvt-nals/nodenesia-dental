# Remove Legal UI and Sensitive Booking Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove public legal pages and stop collecting, persisting, exposing, or displaying the booking fields `medicalFlags`, `medicalOther`, `medicalRecordNo`, `insuranceName`, and `insuranceNumber`.

**Architecture:** The database schema migration is the source of truth for permanently removing the columns. Shared Zod schemas and TypeScript DTOs remove the fields at the API boundary; API services, admin UI, and public web then compile against that reduced booking model. Public legal routes and footer links are removed, while technical operational docs remain untouched. WhatsApp messages initiated from the booking success screen retain code, patient, date/time, and optional note only.

**Tech Stack:** PostgreSQL/Prisma, NestJS, Zod, React/TypeScript, Vitest.

**Spec:** User request, 2026-11-18.

## Global Constraints

- Preserve appointment scheduling, patient contact, service selection, doctor assignment, and existing non-sensitive booking data.
- Do not alter unrelated uncommitted UI work.
- Remove the columns through a forward-only Prisma migration; do not reset production data.
- The public legal routes must no longer render legal content or appear in navigation.

## Review Focus

- Existing booking requests containing removed fields must be rejected or ignored without reintroducing stored data; test the shared public schema.
- Existing database rows must migrate successfully when the five columns contain null or populated values; validate on a disposable PostgreSQL database before release.
- Admin booking lists, calendar, and dashboard must render bookings without medical alerts or insurance/record fields.
- The booking success WhatsApp link must contain no doctor or service text in either Indonesian or English.
- `/privacy`, `/terms`, and English variants must resolve through the normal not-found route rather than exposing the removed page.

### Task 1: Remove sensitive booking persistence and API contracts

**Files:**
- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_remove_sensitive_booking_fields/migration.sql`
- Modify: `packages/shared/src/schemas/booking.ts`
- Modify: `apps/api/src/modules/bookings/bookings.service.ts`
- Modify: `apps/api/src/modules/bookings/bookings.repository.ts`
- Modify: `apps/api/src/modules/bookings/public-booking.service.ts`
- Modify: `apps/api/src/modules/bookings/manual-booking.service.ts`
- Modify: `apps/api/src/modules/bookings/admin-bookings.controller.ts`
- Modify: `apps/api/src/modules/bookings/admin-bookings.service.ts`
- Test: `packages/shared/src/schemas/booking.spec.ts`

**Interfaces:**
- Consumes: `CreatePublicBookingInput` from `packages/shared/src/schemas/booking.ts`.
- Produces: booking create/list responses without the five removed properties.

- [ ] Write a failing shared-schema test that a payload containing each removed property parses without exposing it in the parsed result.
- [ ] Run the focused shared-schema test and verify it fails because removed properties are currently retained.
- [ ] Remove the five properties and insurance conditional validation from the shared Zod schema and its exported auxiliary constants.
- [ ] Remove the five Prisma model fields and add a migration that drops their database columns.
- [ ] Remove field mapping, persistence, request validation, and admin response serialization in the API booking modules.
- [ ] Run the focused schema/API tests, then `corepack yarn typecheck`.

### Task 2: Remove sensitive booking fields from web and admin

**Files:**
- Modify: `apps/web/src/types.ts`
- Modify: `apps/web/src/lib/api.ts`
- Modify: `apps/admin/src/api/admin-api.ts`
- Modify: `apps/admin/src/features/bookings/ManualBookingForm.tsx`
- Modify: `apps/admin/src/features/bookings/BookingsList.tsx`
- Modify: `apps/admin/src/features/calendar/CalendarPanel.tsx`
- Modify: `apps/admin/src/features/dashboard/AdminDashboard.tsx`

**Interfaces:**
- Consumes: reduced booking API payload from Task 1.
- Produces: booking forms and admin screens with no medical-alert, record-number, or insurance UI.

- [ ] Write or update focused UI helper tests to assert medical-alert derivation is absent from booking presentation data.
- [ ] Run the focused test and verify it fails on the current medical-alert behavior.
- [ ] Remove the five fields from browser/admin booking types, request payload construction, manual form controls, list/calendar/dashboard rendering, and related helper functions/imports.
- [ ] Run affected admin tests and `corepack yarn typecheck`.

### Task 3: Remove public legal UI and simplify clinic WhatsApp confirmation

**Files:**
- Modify: `apps/web/src/App.tsx`
- Delete: `apps/web/src/pages/LegalPage.tsx`
- Modify: `apps/web/src/components/layout/Footer.tsx`
- Modify: `apps/web/src/i18n/id.ts`
- Modify: `apps/web/src/i18n/en.ts`
- Modify: `apps/web/src/pages/BookingSuccessPage.tsx`
- Test: new focused unit test for the WhatsApp booking-confirmation message helper, extracted only if needed for testability.

**Interfaces:**
- Produces: no public legal routes/links and a WhatsApp message comprising booking code, patient name, appointment date/time, and optional note.

- [ ] Write a failing test that builds an Indonesian booking-confirmation message and asserts it excludes doctor and service names while retaining code, patient, date/time, and note.
- [ ] Run the focused test and verify it fails against the existing message construction.
- [ ] Extract or update the message construction minimally to satisfy the test.
- [ ] Remove legal route imports/routes, footer legal links, and now-unused translation entries; delete `LegalPage.tsx`.
- [ ] Run web tests, `corepack yarn lint`, `corepack yarn typecheck`, and `corepack yarn build`.

### Task 4: Verify database upgrade and full regression suite

**Files:**
- Modify only if verification identifies a migration or test defect.

- [ ] Start a disposable PostgreSQL instance, apply all Prisma migrations, and verify the booking table no longer has the five dropped columns.
- [ ] Run `corepack yarn test`; report any pre-existing failures separately from this change.
- [ ] Inspect `git diff` to confirm no unrelated user changes were modified.
