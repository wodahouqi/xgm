#!/usr/bin/env bash
set -euo pipefail

# 一键本地部署脚本（在服务器上执行）
# 依赖：nodejs、npm、mysql、nginx 已安装；项目代码位于 /usr/local/src/project/xgm

DOMAIN="xgm.shcytech.cn"
REMOTE_ROOT="/usr/local/src/project/xgm"
API_PORT="3000"
CERT_DIR="$REMOTE_ROOT/.trae/documents/xgm.shcytech.cn_nginx"
# 使用实际存在的证书文件名
# 目录内容示例：xgm.shcytech.cn_bundle.pem、xgm.shcytech.cn.key、xgm.shcytech.cn_bundle.crt
SSL_CERT_PATH="$CERT_DIR/xgm.shcytech.cn_bundle.pem"
SSL_KEY_PATH="$CERT_DIR/xgm.shcytech.cn.key"

echo "[ENV] domain=$DOMAIN root=$REMOTE_ROOT api_port=$API_PORT"
echo "[ENV] cert=$SSL_CERT_PATH key=$SSL_KEY_PATH"

if [ ! -d "$REMOTE_ROOT" ]; then
  echo "[ERR] Project directory not found: $REMOTE_ROOT" >&2
  exit 1
fi

cd "$REMOTE_ROOT"

# 校验证书文件是否存在
if [ ! -f "$SSL_CERT_PATH" ]; then
  echo "[ERR] SSL cert not found: $SSL_CERT_PATH" >&2
  echo "[HINT] 请确认证书文件位于 $CERT_DIR，并且文件名为 xgm.shcytech.cn_bundle.pem 或修改脚本中的 SSL_CERT_PATH。" >&2
  exit 1
fi
if [ ! -f "$SSL_KEY_PATH" ]; then
  echo "[ERR] SSL key not found: $SSL_KEY_PATH" >&2
  echo "[HINT] 请确认私钥文件位于 $CERT_DIR，并且文件名为 xgm.shcytech.cn.key 或修改脚本中的 SSL_KEY_PATH。" >&2
  exit 1
fi

echo "[FRONTEND] installing deps and building..."
if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@8 --activate >/dev/null 2>&1 || true
fi
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile || pnpm install
  NODE_OPTIONS=--max-old-space-size=1024 pnpm run -s build
else
  npm install
  NODE_OPTIONS=--max-old-space-size=1024 npm run -s build
fi

echo "[FRONTEND] syncing dist to $REMOTE_ROOT/frontend"
sudo mkdir -p "$REMOTE_ROOT/frontend"
sudo rm -rf "$REMOTE_ROOT/frontend"/*
sudo cp -r "$REMOTE_ROOT/dist"/* "$REMOTE_ROOT/frontend/" || true

echo "[BACKEND] installing deps and building..."
cd "$REMOTE_ROOT/api"
if ! command -v pnpm >/dev/null 2>&1 && command -v corepack >/dev/null 2>&1; then
  corepack enable >/dev/null 2>&1 || true
  corepack prepare pnpm@8 --activate >/dev/null 2>&1 || true
fi
if command -v pnpm >/dev/null 2>&1; then
  pnpm install --frozen-lockfile || pnpm install
  pnpm run -s build
else
  npm install
  npm run -s build
fi

echo "[BACKEND] writing .env"
cat > "$REMOTE_ROOT/api/.env" <<EOF
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=Shcytech@123456
DB_DATABASE=artwork_booking
JWT_SECRET=change-me-in-prod
PORT=$API_PORT
NODE_ENV=production
FRONTEND_URL=https://$DOMAIN
UPLOAD_MAX_FILE_SIZE_MB=20
EOF

echo "[INIT] ensure logs directory exists"
mkdir -p "$REMOTE_ROOT/logs"

echo "[DB] initializing database"
chmod +x "$REMOTE_ROOT/deploy/db_init.sh" || true
REMOTE_ROOT="$REMOTE_ROOT" bash "$REMOTE_ROOT/deploy/db_init.sh" || true

echo "[NGINX] generating site config"
SITE_CONF_CONTENT="server {
  listen 80;
  server_name $DOMAIN;
  return 301 https://\$host\$request_uri;
}

server {
  listen 443 ssl http2;
  server_name $DOMAIN;

  ssl_certificate $SSL_CERT_PATH;
  ssl_certificate_key $SSL_KEY_PATH;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_prefer_server_ciphers on;
  client_max_body_size 20M;

  root $REMOTE_ROOT/frontend;
  index index.html;

  gzip on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

  location ~* \\.(js|css|png|jpg|jpeg|gif|svg|ico|webp)$ {
    expires 7d;
    add_header Cache-Control \"public, max-age=604800\";
    try_files \$uri =404;
  }

  location / {
    try_files \$uri \$uri/ /index.html;
  }

  location /api/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \"upgrade\";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
    proxy_pass http://127.0.0.1:$API_PORT/api/;
  }

  location /uploads/ {
    proxy_http_version 1.1;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection \"upgrade\";
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_read_timeout 60s;
    proxy_send_timeout 60s;
    proxy_pass http://127.0.0.1:$API_PORT/uploads/;
  }
}"

SITE_NAME="booking-xgm"
if [ -d "/etc/nginx/sites-available" ]; then
  echo "[NGINX] using sites-available/sites-enabled"
  echo "$SITE_CONF_CONTENT" | sudo tee "/etc/nginx/sites-available/$SITE_NAME.conf" >/dev/null
  sudo ln -sf "/etc/nginx/sites-available/$SITE_NAME.conf" "/etc/nginx/sites-enabled/$SITE_NAME.conf"
else
  echo "[NGINX] fallback to conf.d"
  echo "$SITE_CONF_CONTENT" | sudo tee "/etc/nginx/conf.d/$SITE_NAME.conf" >/dev/null
fi

echo "[NGINX] test and reload"
sudo nginx -t
sudo systemctl reload nginx || sudo service nginx reload || true

echo "[PM2] start API"
sudo npm i -g pm2 || true
APP_CWD="$REMOTE_ROOT/api" APP_LOG_OUT="$REMOTE_ROOT/logs/api-out.log" APP_LOG_ERR="$REMOTE_ROOT/logs/api-err.log" pm2 start "$REMOTE_ROOT/deploy/ecosystem.config.cjs" --update-env
pm2 save
pm2 status

echo "[DONE] Visit: https://$DOMAIN"
