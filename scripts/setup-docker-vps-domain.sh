#!/usr/bin/env bash
set -euo pipefail

# Configure host Nginx + Let's Encrypt for the Docker Compose deployment.
# Run from a checked-out repository on Ubuntu after Docker Engine/Compose is installed.
#
# Usage:
#   sudo CLIENT_DOMAIN=clinic.example.com \
#        ADMIN_DOMAIN=admin.clinic.example.com \
#        CERTBOT_EMAIL=ops@example.com \
#        bash scripts/setup-docker-vps-domain.sh

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root: sudo bash scripts/setup-docker-vps-domain.sh"
  exit 1
fi

APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
ENV_FILE="${APP_DIR}/.env"

if [[ -z "${CLIENT_DOMAIN:-}" ]]; then read -rp "Public domain: " CLIENT_DOMAIN </dev/tty || true; fi
if [[ -z "${ADMIN_DOMAIN:-}" ]]; then read -rp "Admin domain: " ADMIN_DOMAIN </dev/tty || true; fi
if [[ -z "${CERTBOT_EMAIL:-}" ]]; then read -rp "Certbot email: " CERTBOT_EMAIL </dev/tty || true; fi

if [[ -z "${CLIENT_DOMAIN:-}" || -z "${ADMIN_DOMAIN:-}" || -z "${CERTBOT_EMAIL:-}" ]]; then
  echo "CLIENT_DOMAIN, ADMIN_DOMAIN, and CERTBOT_EMAIL are required."
  exit 1
fi

is_hostname() {
  [[ "$1" =~ ^[A-Za-z0-9.-]+$ && "$1" == *.* && "$1" != .* && "$1" != *. && "$1" != *..* ]]
}
if ! is_hostname "${CLIENT_DOMAIN}" || ! is_hostname "${ADMIN_DOMAIN}"; then
  echo "Domains must be valid hostnames without a scheme, path, or port."
  exit 1
fi

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Docker Engine with the Docker Compose plugin is required before running this script."
  exit 1
fi

if [[ -f "${ENV_FILE}" && "${OVERWRITE_ENV:-false}" != "true" ]]; then
  read -rp "${ENV_FILE} already exists. Replace it with prompted deployment values? [y/N]: " REPLACE_ENV </dev/tty || true
  if [[ "${REPLACE_ENV:-}" =~ ^[Yy]$ ]]; then
    OVERWRITE_ENV=true
  fi
fi

if [[ ! -f "${ENV_FILE}" || "${OVERWRITE_ENV:-false}" == "true" ]]; then
  if [[ -z "${ADMIN_SEED_EMAIL:-}" ]]; then
    read -rp "Admin email [owner@${CLIENT_DOMAIN}]: " ADMIN_SEED_EMAIL </dev/tty || true
    ADMIN_SEED_EMAIL="${ADMIN_SEED_EMAIL:-owner@${CLIENT_DOMAIN}}"
  fi
  if [[ -z "${ADMIN_SEED_PASSWORD:-}" ]]; then
    read -rsp "Admin password (leave blank to generate): " ADMIN_SEED_PASSWORD </dev/tty || true
    echo ""
  fi
  GENERATED_ADMIN_PASSWORD=false
  if [[ -z "${ADMIN_SEED_PASSWORD:-}" ]]; then
    ADMIN_SEED_PASSWORD="$(openssl rand -base64 18)"
    GENERATED_ADMIN_PASSWORD=true
  fi
  if [[ -z "${PUBLIC_WEB_URL:-}" ]]; then
    read -rp "Public web URL [https://${CLIENT_DOMAIN}]: " PUBLIC_WEB_URL </dev/tty || true
    PUBLIC_WEB_URL="${PUBLIC_WEB_URL:-https://${CLIENT_DOMAIN}}"
  fi
  if [[ "${PUBLIC_WEB_URL}" != "https://${CLIENT_DOMAIN}" ]]; then
    echo "PUBLIC_WEB_URL must be exactly https://${CLIENT_DOMAIN}."
    exit 1
  fi
  JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

  if [[ -z "${R2_ACCOUNT_ID:-}" ]]; then read -rp "Cloudflare R2 Account ID (optional): " R2_ACCOUNT_ID </dev/tty || true; fi
  if [[ -z "${R2_ACCESS_KEY_ID:-}" ]]; then read -rp "Cloudflare R2 Access Key ID (optional): " R2_ACCESS_KEY_ID </dev/tty || true; fi
  if [[ -z "${R2_SECRET_ACCESS_KEY:-}" ]]; then read -rsp "Cloudflare R2 Secret Access Key (optional): " R2_SECRET_ACCESS_KEY </dev/tty || true; echo ""; fi
  if [[ -z "${R2_BUCKET:-}" ]]; then read -rp "Cloudflare R2 Bucket (optional): " R2_BUCKET </dev/tty || true; fi
  if [[ -z "${R2_PUBLIC_URL:-}" ]]; then read -rp "Cloudflare R2 Public URL (optional): " R2_PUBLIC_URL </dev/tty || true; fi
  if [[ -z "${FONNTE_TOKEN:-}" ]]; then read -rsp "Fonnte WhatsApp token (optional): " FONNTE_TOKEN </dev/tty || true; echo ""; fi

  cat > "${ENV_FILE}" <<EOF
POSTGRES_DB=clinic
POSTGRES_USER=clinic
POSTGRES_PASSWORD=clinic
CLINIC_TIMEZONE=Asia/Jakarta
JWT_SECRET=${JWT_SECRET}
ADMIN_SEED_EMAIL=${ADMIN_SEED_EMAIL}
ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}
PUBLIC_WEB_URL=${PUBLIC_WEB_URL}
FONNTE_TOKEN=${FONNTE_TOKEN:-}
R2_ACCOUNT_ID=${R2_ACCOUNT_ID:-}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID:-}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY:-}
R2_BUCKET=${R2_BUCKET:-}
R2_PUBLIC_URL=${R2_PUBLIC_URL:-}
EOF
  chmod 600 "${ENV_FILE}"
  echo "Created ${ENV_FILE} with permission 600."
  if [[ "${GENERATED_ADMIN_PASSWORD}" == "true" ]]; then
    echo "Generated admin password (save it now): ${ADMIN_SEED_PASSWORD}"
  fi
fi

if grep -q '^JWT_SECRET=replace-with-a-long-random-production-secret$' "${ENV_FILE}"; then
  echo "Set a unique JWT_SECRET in ${ENV_FILE} before deploying."
  exit 1
fi
if ! grep -Fqx "PUBLIC_WEB_URL=https://${CLIENT_DOMAIN}" "${ENV_FILE}"; then
  echo "Set PUBLIC_WEB_URL=https://${CLIENT_DOMAIN} in ${ENV_FILE} before deploying."
  exit 1
fi

apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx

cd "${APP_DIR}"
docker compose up -d --build

cat > "/etc/nginx/sites-available/${CLIENT_DOMAIN}" <<EOF
server {
    listen 80;
    server_name ${CLIENT_DOMAIN};
    client_max_body_size 15m;

    location ~ ^/api/v1/public/bookings/[^/]+/status/stream$ {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        chunked_transfer_encoding off;
    }

    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

cat > "/etc/nginx/sites-available/${ADMIN_DOMAIN}" <<EOF
server {
    listen 80;
    server_name ${ADMIN_DOMAIN};
    client_max_body_size 15m;

    location = /api/v1/admin/in-app-notifications/stream {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        chunked_transfer_encoding off;
    }

    location / {
        proxy_pass http://127.0.0.1:5174;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

ln -sf "/etc/nginx/sites-available/${CLIENT_DOMAIN}" "/etc/nginx/sites-enabled/${CLIENT_DOMAIN}"
ln -sf "/etc/nginx/sites-available/${ADMIN_DOMAIN}" "/etc/nginx/sites-enabled/${ADMIN_DOMAIN}"
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl reload nginx

ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true

certbot --nginx --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" \
  -d "${CLIENT_DOMAIN}" -d "${ADMIN_DOMAIN}" --redirect

echo "Deployment ready:"
echo "  Public: https://${CLIENT_DOMAIN}"
echo "  Admin:  https://${ADMIN_DOMAIN}"
