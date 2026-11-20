# Deploy and backup runbook

This repository intentionally does not build production Docker images in CI. For a demo or a single-host deployment, Docker Compose builds and runs PostgreSQL, API, Public web and Admin web. Before a sale, deploy behind a clinic-owned HTTPS reverse proxy. Run `corepack yarn lint && corepack yarn typecheck && corepack yarn test && corepack yarn build`, then run Prisma migrations once against the production database.

Required clinic-owned credentials: domain/DNS, VPS, PostgreSQL, `JWT_SECRET`, `PUBLIC_WEB_URL` (the HTTPS public domain), WhatsApp/Fonnte, object-storage remote, GPG backup key, analytics/Search Console and monitoring accounts. Never put them in this repository.

The public Nginx virtual host must disable proxy buffering for `/api/v1/public/bookings/:code/status/stream`; the bundled `scripts/setup-ubuntu-vps.sh` writes this location automatically so booking-confirmation SSE events arrive in real time.

## Docker Compose demo

Copy `.env.example` to `.env`, set a strong `JWT_SECRET` and `ADMIN_SEED_PASSWORD`, then run `docker compose -f docker-compose.yml -f docker-compose.demo.yml up -d --build`. Apply the demo data once with `docker compose exec api node --import tsx apps/api/prisma/seed.ts`. The production containers deliberately never invoke the Yarn executable shims: use this direct Node command for maintenance scripts as well. The public site and admin bind only to `127.0.0.1` on ports 5173 and 5174; PostgreSQL and the API have no host ports. Place an HTTPS reverse proxy in front of the two web services for an internet-facing deployment.

On an Ubuntu VPS with Docker Engine and the Compose plugin already installed, `scripts/setup-docker-vps-domain.sh` performs that reverse-proxy step: it starts the Compose stack, creates the two Nginx virtual hosts, preserves SSE streaming, opens Nginx in UFW and provisions Let's Encrypt certificates. DNS for both domains must point to the VPS before running it. When `.env` does not exist (or `OVERWRITE_ENV=true` is set), the script prompts for admin, public URL and optional R2 credentials, then creates `.env` with a generated `JWT_SECRET` before deployment:

```sh
sudo CLIENT_DOMAIN=dental.nodenesia.id \
  ADMIN_DOMAIN=admin.clinic.nodenesia.id \
  CERTBOT_EMAIL=ops@example.com \
  bash scripts/setup-docker-vps-domain.sh
```

## Public maintenance mode

Maintenance mode is stored in `clinic_settings`, not exposed in the Admin application, and leaves the Admin site available. It displays a public maintenance page and blocks public slot lookup and new booking requests with `503`. After deploying the migration, run the following from the repository root on the VPS:

```sh
bash scripts/maintenance-mode.sh status
bash scripts/maintenance-mode.sh on
bash scripts/maintenance-mode.sh off
```

The public site checks the setting when it loads, so visitors only need to reload their page after it is toggled.

## Backup

Install PostgreSQL client tools, GnuPG and optionally rclone. Import the clinic-owned public GPG key, set `DATABASE_URL`, `BACKUP_GPG_RECIPIENT`, and optionally `RCLONE_REMOTE` (an rclone remote/path owned by the clinic). Validate with `bash infra/backup.sh --check`; schedule `bash infra/backup.sh` daily. The script creates encrypted dumps, retains 14 local copies and copies each new dump to object storage when rclone is configured.

## Restore rehearsal

Create a separate empty PostgreSQL database. Set `TARGET_DATABASE_URL` to it, run `bash infra/restore.sh infra/backups/<file>.sql.gz.gpg`, then run the API against that database and check `/api/v1/health`, public settings and an admin login. Never rehearse restore against production.
