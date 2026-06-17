#!/usr/bin/env bash
set -euo pipefail

KEY="${DEPLOY_KEY:-$HOME/Desktop/privatekey-1079877.pem}"
HOST="${DEPLOY_HOST:-ubuntu@195.209.213.154}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

echo "→ Building…"
cd "$ROOT"
npm run build

echo "→ Uploading static files…"
rsync -avz --delete \
  -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
  dist/ "$HOST:/tmp/vn-site/"

rsync -avz \
  -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
  server/ scripts/trim-photos.py "$HOST:/tmp/vn-server/"

echo "→ Deploying on server…"
ssh -i "$KEY" "$HOST" 'bash -s' << 'REMOTE'
set -euo pipefail

# Preserve server-side content and uploads (not in dist build)
sudo cp /var/www/vn/content.json /tmp/vn-content-backup.json 2>/dev/null || true

sudo rsync -a --delete \
  --exclude='content.json' \
  --exclude='photos/albums/' \
  --exclude='photos/upload-*' \
  /tmp/vn-site/ /var/www/vn/

if [ -f /tmp/vn-content-backup.json ]; then
  sudo cp /tmp/vn-content-backup.json /var/www/vn/content.json
fi

sudo rsync -a /tmp/vn-server/ /opt/vn-server/
sudo mkdir -p /opt/vn-server/scripts
sudo cp /tmp/vn-server/trim-photos.py /opt/vn-server/scripts/ 2>/dev/null || true
sudo chown -R www-data:www-data /var/www/vn
sudo mkdir -p /var/www/vn/photos/albums/{tests,photoshoots,shows,backstage,clips}
sudo chown -R www-data:www-data /var/www/vn/photos/albums

# Ensure admin env exists (do not overwrite existing secrets)
if [ ! -f /opt/vn-server/vn-api.env ]; then
  echo "WARNING: /opt/vn-server/vn-api.env missing — create it with ADMIN_USERNAME and ADMIN_PASSWORD"
fi

# systemd API service
sudo tee /etc/systemd/system/vn-api.service > /dev/null << 'UNIT'
[Unit]
Description=VN Site API
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/vn-server
Environment=SITE_ROOT=/var/www/vn
Environment=TRIM_SCRIPT=/opt/vn-server/scripts/trim-photos.py
EnvironmentFile=-/opt/vn-server/vn-api.env
ExecStart=/usr/bin/nodejs /opt/vn-server/index.mjs
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
sudo systemctl enable vn-api
sudo systemctl restart vn-api

# Security headers snippet (shared)

# nginx — static + API proxy (+ HTTPS if cert exists)
if sudo test -f /etc/letsencrypt/live/victorianekrasova.ru/fullchain.pem; then
  sudo tee /etc/nginx/sites-available/vn > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name victorianekrasova.ru www.victorianekrasova.ru 195.209.213.154 _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2 default_server;
    listen [::]:443 ssl http2 default_server;
    server_name victorianekrasova.ru www.victorianekrasova.ru 195.209.213.154 _;

    ssl_certificate /etc/letsencrypt/live/victorianekrasova.ru/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/victorianekrasova.ru/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:10m;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/vn;
    index index.html;

    client_max_body_size 100M;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~* \.(?:jpg|jpeg|png|webp|gif|ico|svg|css|js|woff2?|mp4|webm|mov|json)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }
}
NGINX
else
  sudo tee /etc/nginx/sites-available/vn > /dev/null << 'NGINX'
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name victorianekrasova.ru www.victorianekrasova.ru 195.209.213.154 _;

    root /var/www/vn;
    index index.html;

    client_max_body_size 100M;

    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 256;

    location /api/ {
        proxy_pass http://127.0.0.1:8787;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location = /index.html {
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        try_files $uri =404;
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    location ~* \.(?:jpg|jpeg|png|webp|gif|ico|svg|css|js|woff2?|mp4|webm|mov|json)$ {
        expires 7d;
        add_header Cache-Control "public";
        try_files $uri =404;
    }
}
NGINX
fi

sudo ln -sf /etc/nginx/sites-available/vn /etc/nginx/sites-enabled/vn
sudo nginx -t
sudo systemctl reload nginx

echo "DEPLOY_OK"
REMOTE

echo "✓ Deploy complete: https://victorianekrasova.ru"
