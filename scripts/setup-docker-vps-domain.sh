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

if [[ ! -f "${APP_DIR}/.env" ]]; then
  echo "Missing ${APP_DIR}/.env. Copy .env.example, set JWT_SECRET and ADMIN_SEED_PASSWORD, then retry."
  exit 1
fi

if grep -q '^JWT_SECRET=replace-with-a-long-random-production-secret$' "${APP_DIR}/.env"; then
  echo "Set a unique JWT_SECRET in ${APP_DIR}/.env before deploying."
  exit 1
fi
if ! grep -Fqx "PUBLIC_WEB_URL=https://${CLIENT_DOMAIN}" "${APP_DIR}/.env"; then
  echo "Set PUBLIC_WEB_URL=https://${CLIENT_DOMAIN} in ${APP_DIR}/.env before deploying."
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
