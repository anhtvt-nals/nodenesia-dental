# Deploy and backup runbook

This repository intentionally does not build production Docker images in CI. Before a sale, deploy the API, Public web and Admin web behind a clinic-owned HTTPS reverse proxy. Run `corepack yarn lint && corepack yarn typecheck && corepack yarn test && corepack yarn build`, then run Prisma migrations once against the production database.

Required clinic-owned credentials: domain/DNS, VPS, PostgreSQL, `JWT_SECRET`, `PUBLIC_WEB_URL` (the HTTPS public domain), WhatsApp/Fonnte, object-storage remote, GPG backup key, analytics/Search Console and monitoring accounts. Never put them in this repository.

## Backup

Install PostgreSQL client tools, GnuPG and optionally rclone. Import the clinic-owned public GPG key, set `DATABASE_URL`, `BACKUP_GPG_RECIPIENT`, and optionally `RCLONE_REMOTE` (an rclone remote/path owned by the clinic). Validate with `bash infra/backup.sh --check`; schedule `bash infra/backup.sh` daily. The script creates encrypted dumps, retains 14 local copies and copies each new dump to object storage when rclone is configured.

## Restore rehearsal

Create a separate empty PostgreSQL database. Set `TARGET_DATABASE_URL` to it, run `bash infra/restore.sh infra/backups/<file>.sql.gz.gpg`, then run the API against that database and check `/api/v1/health`, public settings and an admin login. Never rehearse restore against production.
