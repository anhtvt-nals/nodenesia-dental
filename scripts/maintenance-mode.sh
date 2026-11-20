#!/usr/bin/env bash
set -euo pipefail

# Toggle the public-site maintenance flag stored in PostgreSQL.
# Run from the repository root on the Docker Compose host:
#   bash scripts/maintenance-mode.sh on|off|status

usage() {
  echo "Usage: bash scripts/maintenance-mode.sh {on|off|status}"
  exit 64
}

MODE="${1:-}"
case "${MODE}" in
  on|off|status) ;;
  *) usage ;;
esac

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Docker Engine and the Docker Compose plugin are required."
  exit 1
fi

if [[ ! -f docker-compose.yml ]]; then
  echo "Run this command from the repository root (where docker-compose.yml exists)."
  exit 1
fi

run_sql() {
  docker compose exec -T -e MAINTENANCE_SQL="$1" postgres \
    sh -ec 'psql -v ON_ERROR_STOP=1 -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Atc "$MAINTENANCE_SQL"'
}

if [[ "${MODE}" == "status" ]]; then
  CURRENT="$(run_sql 'SELECT "maintenance_mode" FROM "clinic_settings" WHERE "id" = '\''default'\'';')"
  if [[ -z "${CURRENT}" ]]; then
    echo "Clinic settings were not found. Apply migrations and seed the clinic before toggling maintenance mode."
    exit 1
  fi
  echo "Maintenance mode: ${CURRENT}"
  exit 0
fi

VALUE=false
[[ "${MODE}" == "on" ]] && VALUE=true
RESULT="$(run_sql "UPDATE \"clinic_settings\" SET \"maintenance_mode\" = ${VALUE} WHERE \"id\" = 'default' RETURNING \"maintenance_mode\";")"
if [[ "${RESULT}" != "${VALUE}" ]]; then
  echo "Clinic settings were not found. Apply migrations and seed the clinic before toggling maintenance mode."
  exit 1
fi

echo "Maintenance mode is now ${RESULT}. Reload the public website to apply the change."
