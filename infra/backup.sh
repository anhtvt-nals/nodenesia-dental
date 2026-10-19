#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "--check" ]]; then
  command -v pg_dump >/dev/null || { echo 'pg_dump is required'; exit 1; }
  command -v gpg >/dev/null || { echo 'gpg is required'; exit 1; }
  [[ -n "${DATABASE_URL:-}" ]] || { echo 'DATABASE_URL is required'; exit 1; }
  [[ -n "${BACKUP_GPG_RECIPIENT:-}" ]] || { echo 'BACKUP_GPG_RECIPIENT is required'; exit 1; }
  echo 'Backup prerequisites are configured.'
  exit 0
fi

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
backup_dir="$script_dir/backups"
timestamp=$(date -u +%Y%m%dT%H%M%SZ)
backup_file="$backup_dir/clinic-$timestamp.sql.gz.gpg"

mkdir -p "$backup_dir"
"$0" --check >/dev/null
pg_dump --no-owner --no-privileges "$DATABASE_URL" | gzip | gpg --batch --yes --encrypt --recipient "$BACKUP_GPG_RECIPIENT" --output "$backup_file"

# Keep the 14 most recent encrypted local copies. Configure RCLONE_REMOTE for clinic-owned object storage.
find "$backup_dir" -maxdepth 1 -type f -name 'clinic-*.sql.gz.gpg' -print | sort | head -n -14 | while IFS= read -r old_backup; do rm -f -- "$old_backup"; done
if [[ -n "${RCLONE_REMOTE:-}" ]]; then
  command -v rclone >/dev/null || { echo 'rclone is required when RCLONE_REMOTE is set'; exit 1; }
  rclone copy "$backup_file" "$RCLONE_REMOTE"
fi
echo "Created $backup_file"
