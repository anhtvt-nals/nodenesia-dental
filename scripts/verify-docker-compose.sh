#!/usr/bin/env bash
set -euo pipefail

# Full production-container smoke test.  This intentionally exercises the
# read-only filesystem, Prisma migration, and HTTP reverse-proxy paths that
# unit/type checks cannot cover.  It is designed for CI; it creates and removes
# the Docker project and its database volume on completion.

PROJECT_NAME="${COMPOSE_PROJECT_NAME:-clinic-smoke}"
COMPOSE=(docker compose -p "${PROJECT_NAME}")

export JWT_SECRET="docker-smoke-test-secret-must-be-at-least-32-chars"
export ADMIN_SEED_EMAIL="owner@clinic.test"
export ADMIN_SEED_PASSWORD="docker-smoke-password"
export PUBLIC_WEB_URL="https://clinic.test"

cleanup() {
  local status=$?
  if [[ ${status} -ne 0 ]]; then
    "${COMPOSE[@]}" ps -a || true
    "${COMPOSE[@]}" logs --tail=200 || true
  fi
  "${COMPOSE[@]}" down --volumes --remove-orphans || true
  exit "${status}"
}
trap cleanup EXIT

"${COMPOSE[@]}" build
"${COMPOSE[@]}" up -d

for _ in {1..36}; do
  if "${COMPOSE[@]}" exec -T api node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((r) => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    break
  fi
  sleep 5
done

"${COMPOSE[@]}" exec -T api node -e "fetch('http://127.0.0.1:3000/api/v1/health').then((r) => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"
curl -fsS --retry 5 --retry-connrefused http://127.0.0.1:5173/ >/dev/null
curl -fsS --retry 5 --retry-connrefused http://127.0.0.1:5174/ >/dev/null

migration_id="$("${COMPOSE[@]}" ps -aq migrate)"
test -n "${migration_id}"
test "$(docker inspect -f '{{.State.ExitCode}}' "${migration_id}")" = "0"

echo "Docker Compose smoke test passed."
