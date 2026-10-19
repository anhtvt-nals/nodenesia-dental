# Dental Clinic v1 Implementation Roadmap

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver the complete, deployable v1 clinic platform in reviewable dependency order.

**Architecture:** The API owns data and business rules. Web and admin are separate clients that consume its versioned OpenAPI contract. Plans are split by independently testable subsystem; execute them in order.

**Tech Stack:** Yarn 4/Corepack, Turborepo, Next.js 15, Vite/React, NestJS/Fastify, Prisma/PostgreSQL, Tailwind v4.

**Spec:** `docs/SPEC.md`; `docs/superpowers/specs/2026-10-18-dental-clinic-v1-design.md`

## Shared code structure

```text
apps/
  api/src/modules/<domain>/
    <domain>.module.ts          # Nest boundary and providers
    <domain>.controller.ts      # HTTP mapping only
    <domain>.service.ts         # use-case orchestration
    <domain>.repository.ts      # Prisma queries/transactions
    dto/                        # request/response schemas
    *.spec.ts                   # unit or integration tests beside domain
  web/src/
    app/[locale]/(marketing)/   # route composition and metadata only
    app/[locale]/booking/       # booking route composition
    features/<domain>/          # api, query hooks, schema, feature UI
    components/{layout,ui}/     # shared layout/primitives; no feature logic
  admin/src/features/<domain>/
    api.ts queries.ts forms/ components/ routes.tsx
packages/shared/src/
  schemas/ enums/ api/          # Zod contracts, enums, generated client
```

Pages/routes compose named feature components; they do not contain form state, API calls, or large JSX trees. A component is extracted when it has a distinct responsibility or is reused by two consumers—never merely to create a generic abstraction. Feature state stays in its feature folder. Use explicit prop types, named event handlers, labelled form controls, and semantic HTML; do not use anonymous render logic to conceal booking/admin behavior. A component exceeding roughly 250 lines is split by responsibility before adding more UI.

## Plan order

1. [Platform, scheduling and booking](2026-10-18-clinic-platform-booking.md)
2. [Admin and CMS](2026-10-18-clinic-admin-cms.md)
3. [Public web, SEO, 3D and operations](2026-10-18-clinic-public-ops.md)

Do not begin a later plan until the previous plan's interfaces and verification gates pass. No Playwright E2E or CI Docker-image build is included; manual UAT and Compose deployment remain required.
