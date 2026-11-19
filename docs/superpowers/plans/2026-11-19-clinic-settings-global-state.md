# Clinic Settings Global State Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the hero quick-booking form and make clinic identity/contact information editable in Admin Settings and consistently available to the public web through its global clinic-settings state.

**Architecture:** Reuse the existing `clinic_settings` row and `ClinicSettingsProvider`; no new table or client state store is introduced. The admin settings contract exposes the existing identity fields, and the public provider remains the single API-backed source consumed by pages and shared layout.

**Tech Stack:** NestJS, Prisma, React, TypeScript, Ant Design, Vitest.

**Spec:** User-approved scope, 2026-11-19.

## Global Constraints

- Do not add a database migration: all requested fields already exist in `clinic_settings`.
- Preserve booking through `/booking`; remove only the hero form.
- Use API-provided settings instead of new hard-coded public contact values.

## Review Focus

- Partial admin updates must preserve unrelated scheduling settings.
- Empty optional social/map/copy fields must not break public layout.
- Phone/WhatsApp values must stay valid strings across Admin → API → global public state.
- No hero form controls or state remain after removal.

### Task 1: Expand clinic settings admin contract

**Files:**
- Modify: `apps/api/src/modules/settings/admin-settings.service.ts`
- Modify: `apps/api/src/modules/settings/admin-settings.controller.ts`
- Modify: `apps/admin/src/api/admin-api.ts`
- Modify: `apps/admin/src/features/settings/SettingsEditor.tsx`
- Test: `apps/api/src/modules/settings/settings.service.spec.ts`

- [ ] Write a failing API/settings test proving public identity fields are retained and returned after an admin update.
- [ ] Extend the typed admin schema and service contract for phone, WhatsApp, address, city, tagline (ID/EN), Instagram, Google Maps URL, open-hours text and stats.
- [ ] Add grouped admin form inputs for those properties.
- [ ] Run settings tests and typecheck.

### Task 2: Simplify hero and consume global settings

**Files:**
- Modify: `apps/web/src/pages/HomePage.tsx`
- Modify: public layout/page consumers only where they retain duplicated contact fallbacks.
- Test: focused web component/helper test if extraction is necessary.

- [ ] Write a failing source-level or component test proving hero no longer renders the quick-booking form.
- [ ] Remove quick-booking state, handler and form from the hero; retain primary booking CTA and WhatsApp CTA.
- [ ] Replace local HomePage settings fetch/state with `useClinicSettings()` global context.
- [ ] Run web tests, lint, typecheck and build.
