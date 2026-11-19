#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# Ubuntu VPS Setup Script for Klinik Gigi Senyum Sehat
# Installs: Node.js 22 + Corepack (Yarn 4), PostgreSQL, Nginx, Certbot (SSL),
#           Systemd service for @clinic/api, and builds @clinic/web + @clinic/admin.
#
# Usage:
#   sudo CLIENT_DOMAIN=klinikanda.id \
#        ADMIN_DOMAIN=admin.klinikanda.id \
#        CERTBOT_EMAIL=owner@klinikanda.id \
#        bash scripts/setup-ubuntu-vps.sh
# ==============================================================================

if [[ "${EUID}" -ne 0 ]]; then
  echo "Please run as root (e.g. sudo bash scripts/setup-ubuntu-vps.sh)"
  exit 1
fi

# --- Configuration (override via environment variables or interactive prompts) ---
APP_DIR="${APP_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)}"
APP_USER="${APP_USER:-${SUDO_USER:-www-data}}"

if [[ -z "${CLIENT_DOMAIN:-}" ]]; then
  read -rp "Client domain (e.g. senyumsehat.id): " CLIENT_DOMAIN </dev/tty || true
fi
if [[ -z "${ADMIN_DOMAIN:-}" ]]; then
  read -rp "Admin domain (e.g. admin.senyumsehat.id): " ADMIN_DOMAIN </dev/tty || true
fi
if [[ -z "${CERTBOT_EMAIL:-}" ]]; then
  read -rp "Certbot email (e.g. admin@senyumsehat.id): " CERTBOT_EMAIL </dev/tty || true
fi

if [[ -z "${CLIENT_DOMAIN}" || -z "${ADMIN_DOMAIN}" || -z "${CERTBOT_EMAIL}" ]]; then
  echo "Error: CLIENT_DOMAIN, ADMIN_DOMAIN, and CERTBOT_EMAIL are required."
  exit 1
fi

if [[ -z "${ADMIN_SEED_EMAIL:-}" ]]; then
  read -rp "Admin seed email [owner@${CLIENT_DOMAIN}]: " INPUT_SEED_EMAIL </dev/tty || true
  ADMIN_SEED_EMAIL="${INPUT_SEED_EMAIL:-owner@${CLIENT_DOMAIN}}"
fi

if [[ -z "${ADMIN_SEED_PASSWORD:-}" ]]; then
  read -rsp "Admin seed password (leave blank to auto-generate): " INPUT_SEED_PASS </dev/tty || true
  echo ""
  ADMIN_SEED_PASSWORD="${INPUT_SEED_PASS:-$(openssl rand -base64 14)}"
fi

if [[ -z "${R2_ACCOUNT_ID:-}" ]]; then
  read -rp "Cloudflare R2 Account ID (optional, press Enter to skip): " R2_ACCOUNT_ID </dev/tty || true
fi
if [[ -z "${R2_ACCESS_KEY_ID:-}" ]]; then
  read -rp "Cloudflare R2 Access Key ID: " R2_ACCESS_KEY_ID </dev/tty || true
fi
if [[ -z "${R2_SECRET_ACCESS_KEY:-}" ]]; then
  read -rsp "Cloudflare R2 Secret Access Key: " R2_SECRET_ACCESS_KEY </dev/tty || true
  echo ""
fi
if [[ -z "${R2_BUCKET:-}" ]]; then
  read -rp "Cloudflare R2 Bucket name: " R2_BUCKET </dev/tty || true
fi
if [[ -z "${R2_PUBLIC_URL:-}" ]]; then
  read -rp "Cloudflare R2 Public URL (e.g. https://pub-xxx.r2.dev): " R2_PUBLIC_URL </dev/tty || true
fi

DB_NAME="${DB_NAME:-clinic}"
DB_USER="${DB_USER:-clinic}"
DB_PASS="${DB_PASS:-$(openssl rand -hex 16)}"
JWT_SECRET="${JWT_SECRET:-$(openssl rand -hex 32)}"

echo "==> [1/7] Installing system packages (curl, git, postgresql, nginx, certbot)..."
apt-get update -y
apt-get install -y curl gnupg ca-certificates lsb-release git ufw openssl \
  postgresql postgresql-contrib nginx certbot python3-certbot-nginx

echo "==> [2/7] Installing Node.js 22 & enabling Corepack (Yarn 4)..."
if ! command -v node >/dev/null 2>&1 || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 22 ]]; then
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt-get install -y nodejs
fi
corepack enable
corepack prepare yarn@4.5.3 --activate

echo "==> [3/7] Configuring PostgreSQL database (${DB_NAME})..."
systemctl enable --now postgresql
sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';"
sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME} OWNER ${DB_USER};"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

echo "==> [4/7] Preparing environment file at ${APP_DIR}/.env..."
if [[ ! -f "${APP_DIR}/.env" ]]; then
  cat > "${APP_DIR}/.env" <<EOF
NODE_ENV=production
DATABASE_URL=postgresql://${DB_USER}:${DB_PASS}@localhost:5432/${DB_NAME}?schema=public
POSTGRES_DB=${DB_NAME}
POSTGRES_USER=${DB_USER}
POSTGRES_PASSWORD=${DB_PASS}
CLINIC_TIMEZONE=Asia/Jakarta
JWT_SECRET=${JWT_SECRET}
ADMIN_SEED_EMAIL=${ADMIN_SEED_EMAIL}
ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD}
PUBLIC_WEB_URL=https://${CLIENT_DOMAIN}

# Optional: WhatsApp (Fonnte) & Cloudflare R2
FONNTE_TOKEN=${FONNTE_TOKEN:-}
R2_ACCOUNT_ID=${R2_ACCOUNT_ID:-}
R2_ACCESS_KEY_ID=${R2_ACCESS_KEY_ID:-}
R2_SECRET_ACCESS_KEY=${R2_SECRET_ACCESS_KEY:-}
R2_BUCKET=${R2_BUCKET:-}
R2_PUBLIC_URL=${R2_PUBLIC_URL:-}
EOF
  chmod 600 "${APP_DIR}/.env"
  chown "${APP_USER}:${APP_USER}" "${APP_DIR}/.env"
  echo "    Created ${APP_DIR}/.env (save ADMIN_SEED_PASSWORD=${ADMIN_SEED_PASSWORD} securely!)"
else
  echo "    Existing ${APP_DIR}/.env found; keeping it untouched."
fi

echo "==> [5/7] Installing dependencies, running Prisma migrations, and building web + admin..."
cd "${APP_DIR}"
sudo -u "${APP_USER}" yarn install --immutable
set -a; source "${APP_DIR}/.env"; set +a
sudo -u "${APP_USER}" -E yarn workspace @clinic/api exec prisma generate
sudo -u "${APP_USER}" -E yarn workspace @clinic/api exec prisma migrate deploy
sudo -u "${APP_USER}" -E yarn workspace @clinic/web build
sudo -u "${APP_USER}" -E yarn workspace @clinic/admin build

echo "==> [6/7] Creating systemd service (clinic-api.service)..."
cat > /etc/systemd/system/clinic-api.service <<EOF
[Unit]
Description=Klinik Gigi Senyum Sehat API (@clinic/api)
After=network.target postgresql.service
Requires=postgresql.service

[Service]
Type=simple
User=${APP_USER}
WorkingDirectory=${APP_DIR}/apps/api
Environment=NODE_ENV=production
EnvironmentFile=${APP_DIR}/.env
ExecStart=/usr/bin/env yarn exec tsx src/main.ts
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now clinic-api

echo "==> [7/7] Configuring Nginx & Certbot SSL for ${CLIENT_DOMAIN} and ${ADMIN_DOMAIN}..."
cat > /etc/nginx/conf.d/clinic-security.conf <<'EOF'
server_tokens off;
limit_req_zone $binary_remote_addr zone=clinic_api_per_ip:10m rate=30r/s;
limit_req_zone $binary_remote_addr zone=clinic_auth_per_ip:10m rate=10r/m;
limit_conn_zone $binary_remote_addr zone=clinic_sse_per_ip:10m;
EOF

mkdir -p /etc/nginx/snippets
cat > /etc/nginx/snippets/clinic-security-locations.conf <<'EOF'
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

location ~ /\.(?!well-known(?:/|$)) {
    access_log off;
    log_not_found off;
    return 404;
}

location ~* ^/(?:wp-admin|wp-login\.php|xmlrpc\.php|phpmyadmin|pma|vendor|cgi-bin)(?:/|$) {
    access_log off;
    log_not_found off;
    return 404;
}

location ~* \.(?:bak|sql|sqlite|tar|tgz|gz|zip|pem|key|log)$ {
    access_log off;
    log_not_found off;
    return 404;
}

location ~ ^/api/docs(?:/|$|-json) {
    access_log off;
    return 404;
}

location = /api/v1/auth/login {
    limit_req zone=clinic_auth_per_ip burst=10 nodelay;
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}
EOF

cat > "/etc/nginx/sites-available/${CLIENT_DOMAIN}" <<EOF
server {
    listen 80;
    server_name ${CLIENT_DOMAIN};

    root ${APP_DIR}/apps/web/dist;
    index index.html;
    client_max_body_size 15m;
    include /etc/nginx/snippets/clinic-security-locations.conf;

    # Public booking confirmation stream: do not buffer SSE events.
    location ~ ^/api/v1/public/bookings/[^/]+/status/stream$ {
        limit_req zone=clinic_api_per_ip burst=20 nodelay;
        limit_conn clinic_sse_per_ip 3;
        proxy_pass http://127.0.0.1:3000;
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

    location = /api/v1/admin/in-app-notifications/stream {
        proxy_pass http://127.0.0.1:3000;
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

    location /api/ {
        limit_req zone=clinic_api_per_ip burst=60 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

cat > "/etc/nginx/sites-available/${ADMIN_DOMAIN}" <<EOF
server {
    listen 80;
    server_name ${ADMIN_DOMAIN};

    root ${APP_DIR}/apps/admin/dist;
    index index.html;
    client_max_body_size 15m;
    include /etc/nginx/snippets/clinic-security-locations.conf;

    location = /api/v1/admin/in-app-notifications/stream {
        limit_req zone=clinic_api_per_ip burst=20 nodelay;
        limit_conn clinic_sse_per_ip 3;
        proxy_pass http://127.0.0.1:3000;
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

    location /api/ {
        limit_req zone=clinic_api_per_ip burst=60 nodelay;
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

ln -sf "/etc/nginx/sites-available/${CLIENT_DOMAIN}" "/etc/nginx/sites-enabled/${CLIENT_DOMAIN}"
ln -sf "/etc/nginx/sites-available/${ADMIN_DOMAIN}" "/etc/nginx/sites-enabled/${ADMIN_DOMAIN}"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl reload nginx

# Firewall (UFW)
ufw allow OpenSSH || true
ufw allow 'Nginx Full' || true

# Provision SSL certificates with Certbot (auto-renews via systemd timer)
certbot --nginx --non-interactive --agree-tos -m "${CERTBOT_EMAIL}" \
  -d "${CLIENT_DOMAIN}" -d "${ADMIN_DOMAIN}" --redirect

echo ""
echo "======================================================================"
echo " Setup Complete!"
echo " - Client URL : https://${CLIENT_DOMAIN}"
echo " - Admin URL  : https://${ADMIN_DOMAIN}"
echo " - API Status : systemctl status clinic-api"
echo " - Env File   : ${APP_DIR}/.env (update FONNTE_TOKEN & R2_* if needed)"
echo " - Seed Admin : cd ${APP_DIR} && yarn workspace @clinic/api seed"
echo "======================================================================"
