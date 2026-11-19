#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env"

if [[ "${1:-}" == "--install-cron" ]]; then
  CRON_CMD="*/30 * * * * ${SCRIPT_DIR}/reset-demo.sh >> /var/log/clinic-demo-reset.log 2>&1"
  EXISTING_CRON="$(crontab -l 2>/dev/null || true)"
  if echo "${EXISTING_CRON}" | grep -Fq "${SCRIPT_DIR}/reset-demo.sh"; then
    echo "Cron job already installed."
  else
    (echo "${EXISTING_CRON}"; echo "${CRON_CMD}") | crontab -
    echo "Installed 30-minute demo reset cron job:"
    echo "  ${CRON_CMD}"
  fi
  exit 0
fi

cd "${ROOT_DIR}"

if [[ -f "${ENV_FILE}" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "${ENV_FILE}"
  set +a
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Resetting demo database..."
yarn workspace @clinic/api reset-demo

if command -v pm2 >/dev/null 2>&1 && pm2 describe clinic-api >/dev/null 2>&1; then
  pm2 reload clinic-api --update-env >/dev/null 2>&1 || true
fi

echo "[$(date -u +"%Y-%m-%dT%H:%M:%SZ")] Demo database reset complete."
