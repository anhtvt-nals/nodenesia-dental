# Clinic Platform and Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the monorepo, API contracts, scheduling engine, transaction-safe booking, authentication, and WhatsApp job pipeline.

**Architecture:** Nest modules own one domain each; controllers translate validated HTTP input to services, services own use cases, repositories isolate Prisma. The slot engine is pure and tested without HTTP or database. Booking commits first, then queues notifications.

**Tech Stack:** Yarn 4/Corepack (`nodeLinker: node-modules`), Turbo, NestJS 10/Fastify, Prisma/PostgreSQL 16, Zod/nestjs-zod, pg-boss, argon2, Vitest/Jest.

**Spec:** `docs/SPEC.md`; `docs/superpowers/specs/2026-10-18-dental-clinic-v1-design.md`

## Global Constraints

- Store instants as PostgreSQL `timestamptz`; render in the configured clinic timezone (default `Asia/Jakarta`).
- Public booking validates with Zod, honeypot and rate limits; normalize phone numbers to E.164.
- A successful public booking is `confirmed`; concurrent overlap returns `409`, never a duplicate appointment.
- Keep access JWT at 15 minutes; store only argon2 hashes of passwords and refresh/manage tokens.
- Generate OpenAPI and the shared client; web/admin never access the database directly.
- Use focused JSX/components as defined in the roadmap; do not put feature state in route files.
- CI runs lint, typecheck, unit/integration tests and workspace builds only.

## Review Focus

- Two same-slot requests: only one is confirmed and the other receives `409` with alternatives (Task 5).
- A 90-minute service spanning a lunch gap never appears as an available slot (Task 4).
- Clinic-wide time off blocks every doctor even with normal working hours (Task 4).
- A WhatsApp provider failure retains the confirmed booking and records a retryable log (Task 6).
- An expired/revoked refresh or booking-management token cannot access protected data (Tasks 6 and 7).

---

### Task 1: Bootstrap workspace and local platform

**Files:** Create `package.json`, `.yarnrc.yml`, `.yarn/releases/*`, `turbo.json`, `apps/{api,web,admin}/package.json`, `packages/shared/package.json`, `docker-compose.yml`, `.env.example`, `.github/workflows/ci.yml`.

**Produces:** `yarn lint`, `yarn typecheck`, `yarn test`, and `yarn build` Turbo tasks; local Postgres and application service definitions.

- [x] Write a workspace smoke test that imports `@clinic/shared` from an app.
- [x] Run `yarn test` and verify it fails before the workspace/export exists.
- [x] Configure Yarn 4/Corepack, workspaces, Turbo task graph, TypeScript base config, Compose/Postgres, and CI commands.
- [x] Run `yarn lint && yarn typecheck && yarn test && yarn build`; expect all pass.
- [ ] Commit when a Git repository is initialized: `chore: bootstrap clinic workspace`.

### Task 2: Define shared contracts and Prisma data model

**Files:** Create `packages/shared/src/{enums,schemas,api}/`, `apps/api/prisma/schema.prisma`, `apps/api/prisma/migrations/*`, `apps/api/prisma/seed.ts`.

**Produces:** `BookingStatus`, `ServiceZone`, `UserRole`, `CreatePublicBookingInput`, `SlotQuery`, `Slot`, `BookingSummary`; Prisma models, indexes, `btree_gist`/`pgcrypto`, and the conditional `no_overlap` exclusion constraint.

- [ ] Write migration/integration assertions for unique patient phone, active-booking overlap exclusion, and all required booking indexes.
- [ ] Run the migration test against an empty test database; expect failure before schema/migration exists.
- [ ] Implement every table and the demo seed described in SPEC, including articles/promotions and `review_request` notification type.
- [ ] Generate OpenAPI client types from the API contract into `packages/shared/src/api`.
- [ ] Run migration, seed, and integration tests; expect pass.
- [ ] Commit: `feat: add clinic data model and contracts`.

### Task 3: Implement configuration, doctor and service API modules

**Files:** Create `apps/api/src/modules/{settings,doctors,services}/{*.module.ts,*.controller.ts,*.service.ts,*.repository.ts,dto/*,*.spec.ts}`, `apps/api/src/app.module.ts`.

**Interfaces:** `SettingsService.getPublic(): PublicClinicSettings`; `ServicesService.listPublic(): ServiceSummary[]`; `DoctorsService.listAvailable(serviceId): DoctorSummary[]`.

- [ ] Write controller/service tests for active-only public lists and owner-only settings mutation.
- [ ] Run targeted tests; expect missing module/service failure.
- [ ] Implement public read endpoints and role-protected CRUD, with controller classes limited to mapping Zod DTOs to services; publish Swagger/OpenAPI from the same Zod contracts.
- [ ] Regenerate OpenAPI client and run the target tests; expect pass.
- [ ] Commit: `feat: add clinic catalogue API`.

### Task 4: Build the pure availability engine

**Files:** Create `apps/api/src/modules/bookings/slot-engine.ts`, `slot-engine.spec.ts`, `slot.types.ts`, `availability.service.ts`.

**Interfaces:** `getAvailableSlots(input: AvailabilityInput): Slot[]`; `AvailabilityService.findSlots(query: SlotQuery): Promise<Slot[]>`.

- [ ] Add failing tests for split shifts, lunch breaks, cross-midnight working hours, 15-minute steps, lead/horizon boundaries, clinic/doctor time off, and a service longer than a gap.
- [ ] Run the engine test file; expect failure before `getAvailableSlots` exists.
- [ ] Implement pure interval subtraction and slot slicing; repository data conversion belongs in `AvailabilityService`, not the engine.
- [ ] Run targeted unit tests; expect pass.
- [ ] Commit: `feat: calculate bookable clinic slots`.

### Task 5: Create transaction-safe public booking and management API

**Files:** Create `apps/api/src/modules/bookings/{bookings.module.ts,public-bookings.controller.ts,bookings.service.ts,bookings.repository.ts,manage-bookings.service.ts,dto/*,*.integration-spec.ts}`.

**Interfaces:** `BookingsService.create(input: CreatePublicBookingInput, context: RequestContext): Promise<BookingConfirmation>`; `ManageBookingsService.cancel(code: string, token: string): Promise<BookingSummary>`; `reschedule(...): Promise<BookingSummary>`.

- [ ] Write integration tests for two concurrent creates, `409` alternatives, doctor auto-assignment, advisory chair lock, cutoff rejection, and opaque hashed management tokens.
- [ ] Run integration tests; expect failure before booking services/migration usage exists.
- [ ] Implement transaction recomputation, daily advisory lock, `confirmed` insert, conflict translation, patient upsert, and post-commit domain event.
- [ ] Expose `/public/slots`, `/public/bookings`, and code/token management endpoints; regenerate OpenAPI client.
- [ ] Run booking integration tests; expect pass.
- [ ] Commit: `feat: add conflict-safe public booking`.

### Task 6: Add notification provider and durable jobs

**Files:** Create `apps/api/src/modules/notifications/{notification.module.ts,notification.provider.ts,fonnte.provider.ts,notification.service.ts,notification.worker.ts,notification.repository.ts,webhook.controller.ts,*.spec.ts}`.

**Interfaces:** `NotificationProvider.send(message: NotificationMessage): Promise<ProviderReceipt>`; `NotificationService.queue(type: NotificationType, bookingId: string): Promise<void>`.

- [ ] Write tests using a fake provider: commit queues confirmation; failure creates `failed` log and retry; only completed booking schedules H+1 review.
- [ ] Run tests; expect failure before provider/service exists.
- [ ] Implement pg-boss jobs for confirmation, H-1, H-2, cancel, reschedule, review request and provider callback logging; expose the provider webhook endpoint and keep provider-specific HTTP inside `FonnteProvider`.
- [ ] Run notification tests; expect pass.
- [ ] Commit: `feat: add WhatsApp notifications and retries`.

### Task 7: Add admin authentication and authorization foundation

**Files:** Create `apps/api/src/modules/auth/{auth.module.ts,auth.controller.ts,auth.service.ts,refresh-token.repository.ts,guards/*,strategies/*,dto/*,*.spec.ts}`, `apps/api/src/modules/users/*`.

**Interfaces:** `AuthService.login(input: LoginInput, meta: RequestMeta): Promise<AuthSession>`; `AuthService.refresh(rawToken: string): Promise<AuthSession>`; `requireRole(...roles: UserRole[]): MethodDecorator`.

- [ ] Write tests for 15-minute access expiry, refresh rotation/revocation, inactive users and staff denial from owner endpoints.
- [ ] Run auth tests; expect failure before services/guards exist.
- [ ] Implement argon2 verification, httpOnly/SameSite refresh cookie handling, JWT strategy and per-endpoint role guard.
- [ ] Run auth tests and API typecheck; expect pass.
- [ ] Commit: `feat: add clinic admin auth`.
