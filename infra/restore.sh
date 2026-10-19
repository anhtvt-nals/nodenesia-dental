#!/usr/bin/env bash
set -euo pipefail

backup_file=${1:?Usage: restore.sh <encrypted-backup-file>}
[[ -f "$backup_file" ]] || { echo 'Backup file does not exist'; exit 1; }
[[ -n "${TARGET_DATABASE_URL:-}" ]] || { echo 'TARGET_DATABASE_URL is required'; exit 1; }
command -v gpg >/dev/null || { echo 'gpg is required'; exit 1; }
command -v psql >/dev/null || { echo 'psql is required'; exit 1; }

gpg --decrypt "$backup_file" | gzip --decompress | psql --set ON_ERROR_STOP=1 "$TARGET_DATABASE_URL"
echo 'Restore completed.'
