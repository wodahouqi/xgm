#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)
DEPLOY_DIR="$ROOT_DIR/deploy"

if [ ! -f "$DEPLOY_DIR/.env.deploy" ]; then
  echo "Please create $DEPLOY_DIR/.env.deploy from .env.deploy.example and fill in values." >&2
  exit 1
fi

set -a
source "$DEPLOY_DIR/.env.deploy"
set +a

required=(SSH_HOST SSH_PORT SSH_USER REMOTE_ROOT DOMAIN API_PORT NGINX_SITE_NAME LOCAL_FRONTEND_BUILD_DIR LOCAL_BACKEND_DIR)
for k in "${required[@]}"; do
  if [ -z "${!k:-}" ]; then
    echo "Missing required env: $k" >&2
    exit 1
  fi
done

echo "[DEPLOY] target: $SSH_USER@$SSH_HOST:$SSH_PORT, root: $REMOTE_ROOT, domain: $DOMAIN"

# 上传部署辅助文件到远端
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "sudo mkdir -p '$REMOTE_ROOT/deploy' '$REMOTE_ROOT/frontend' '$REMOTE_ROOT/api' '$REMOTE_ROOT/logs'"
scp -P "$SSH_PORT" "$DEPLOY_DIR/server_init.sh" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/deploy/"
scp -P "$SSH_PORT" "$DEPLOY_DIR/setup_ssl.sh" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/deploy/"
scp -P "$SSH_PORT" "$DEPLOY_DIR/db_init.sh" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/deploy/"
scp -P "$SSH_PORT" "$DEPLOY_DIR/ecosystem.config.js" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/deploy/"
scp -P "$SSH_PORT" "$DEPLOY_DIR/nginx.conf.template" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/deploy/"

# 远端初始化（安装 Node/PM2/Nginx/Certbot）
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "DOMAIN='$DOMAIN' ENABLE_SSL='${ENABLE_SSL:-false}' REMOTE_ROOT='$REMOTE_ROOT' API_PORT='$API_PORT' bash '$REMOTE_ROOT/deploy/server_init.sh'"

# 上传后端代码并安装依赖、构建
bash "$DEPLOY_DIR/backend_deploy.sh"

# 上传后端 .env
if [ ! -f "$DEPLOY_DIR/.env.server" ]; then
  echo "Please create $DEPLOY_DIR/.env.server from .env.server.example and fill in values." >&2
  exit 1
fi
scp -P "$SSH_PORT" "$DEPLOY_DIR/.env.server" "$SSH_USER@$SSH_HOST:$REMOTE_ROOT/api/.env"

# 使用 PM2 启动后端
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "APP_CWD='$REMOTE_ROOT/api' APP_LOG_OUT='$REMOTE_ROOT/logs/api-out.log' APP_LOG_ERR='$REMOTE_ROOT/logs/api-err.log' pm2 start '$REMOTE_ROOT/deploy/ecosystem.config.js' --update-env && pm2 save"

# 构建并上传前端
bash "$DEPLOY_DIR/frontend_deploy.sh"

# 生成并启用 Nginx 站点配置
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "sudo bash -lc 'sed -e s#__DOMAIN__#${DOMAIN}#g -e s#__FRONTEND_ROOT__#${REMOTE_ROOT}/frontend#g -e s#__API_PORT__#${API_PORT}#g ${REMOTE_ROOT}/deploy/nginx.conf.template > /etc/nginx/sites-available/${NGINX_SITE_NAME}.conf && ln -sf /etc/nginx/sites-available/${NGINX_SITE_NAME}.conf /etc/nginx/sites-enabled/${NGINX_SITE_NAME}.conf && nginx -t && (systemctl reload nginx || service nginx reload)'"

# 可选：签发 SSL 证书
if [ "${ENABLE_SSL:-false}" = "true" ]; then
  ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
    "DOMAIN='$DOMAIN' LETSENCRYPT_EMAIL='${LETSENCRYPT_EMAIL:-}' bash '$REMOTE_ROOT/deploy/setup_ssl.sh'"
fi

# 初始化数据库（创建库）
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "REMOTE_ROOT='$REMOTE_ROOT' bash '$REMOTE_ROOT/deploy/db_init.sh'"

echo "[DEPLOY] completed. Visit: http://${DOMAIN} (or https if SSL enabled)"