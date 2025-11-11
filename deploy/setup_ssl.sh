#!/usr/bin/env bash
set -euo pipefail

# 依赖环境变量：DOMAIN, LETSENCRYPT_EMAIL

if [ -z "${DOMAIN:-}" ] || [ -z "${LETSENCRYPT_EMAIL:-}" ]; then
  echo "DOMAIN and LETSENCRYPT_EMAIL are required" >&2
  exit 1
fi

echo "[SSL] issuing certificate for $DOMAIN"

if command -v certbot >/dev/null 2>&1; then
  sudo certbot --nginx -d "$DOMAIN" -m "$LETSENCRYPT_EMAIL" --agree-tos --redirect || true
  sudo systemctl reload nginx || sudo service nginx reload || true
else
  echo "certbot not installed, please install certbot manually." >&2
fi

echo "[SSL] done."