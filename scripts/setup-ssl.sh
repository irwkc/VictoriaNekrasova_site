#!/usr/bin/env bash
# Run on the VPS after DNS A-record points to this server.
set -euo pipefail

DOMAIN="${1:-victorianekrasova.ru}"

if ! command -v certbot >/dev/null 2>&1; then
  sudo apt-get update
  sudo apt-get install -y certbot python3-certbot-nginx
fi

sudo certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN" --redirect
sudo nginx -t
sudo systemctl reload nginx

echo "✓ HTTPS enabled for $DOMAIN"
