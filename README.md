# Clinic platform

## Docker demo

Create `.env` from `.env.example`, set a non-default `JWT_SECRET` and an `ADMIN_SEED_PASSWORD`, then start the complete demo:

```sh
cp .env.example .env
docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build
docker compose exec api node --import tsx apps/api/prisma/seed.ts
```

- Public web: `http://localhost:5173`
- Admin: `http://localhost:5174`
- API health: `http://localhost:5173/api/v1/health`

The owner email is `owner@clinic.local` unless `ADMIN_SEED_EMAIL` is set. Reset demo data only in a demo environment:

```sh
docker compose exec api sh -c 'node --import tsx apps/api/prisma/reset-demo.ts && node --import tsx apps/api/prisma/seed.ts'
```

Stop the stack with `docker compose -f docker-compose.yml -f docker-compose.demo.yml down`. Add `-v` only when intentionally deleting the local database volume. PostgreSQL and the API are deliberately not exposed on host ports.

## Local development

```sh
corepack yarn
cp .env.example .env
docker compose up -d
DATABASE_URL='postgresql://clinic:clinic@localhost:5432/clinic?schema=public' corepack yarn workspace @clinic/api prisma migrate deploy
ADMIN_SEED_PASSWORD='choose-a-local-password' corepack yarn workspace @clinic/api seed
```

The API dev process loads the root `.env` automatically (via `tsx --env-file-if-exists`), so `DATABASE_URL` and friends are picked up without exporting them by hand. `docker compose` reads the same file for its `${POSTGRES_*}` defaults.

Start all three apps from the root:

```sh
corepack yarn dev
```

Public web and admin Vite servers proxy `/api` to the API on port 3000. The local owner email defaults to `owner@clinic.local`; override it with `ADMIN_SEED_EMAIL` when seeding.

Swagger is disabled during development because the `tsx` dev runner does not emit the parameter metadata it needs. It can only be enabled from a compiled production runtime with `NODE_ENV=production SWAGGER_ENABLED=true`.

## Verification

```sh
corepack yarn lint
corepack yarn typecheck
corepack yarn test
corepack yarn build
```

## Before production

Set a unique `JWT_SECRET`, run behind HTTPS/reverse proxy, and move the in-memory booking rate limiter to shared storage if the API is scaled beyond one instance.
