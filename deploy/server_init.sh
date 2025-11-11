#!/usr/bin/env bash
set -euo pipefail

# 依赖环境变量（由 deploy_all.sh 通过 SSH 注入）：
# DOMAIN, ENABLE_SSL, REMOTE_ROOT, API_PORT

detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    echo apt
  elif command -v yum >/dev/null 2>&1; then
    echo yum
  else
    echo unknown
  fi
}

PM=$(detect_pkg_manager)
echo "[INIT] using package manager: $PM"

sudo mkdir -p "$REMOTE_ROOT/frontend" "$REMOTE_ROOT/api" "$REMOTE_ROOT/deploy" "$REMOTE_ROOT/logs"

if [ "$PM" = "apt" ]; then
  sudo apt-get update -y
  sudo apt-get install -y curl gnupg ca-certificates lsb-release
  # Node.js (20.x LTS)
  curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
  sudo apt-get install -y nodejs build-essential
  # Nginx
  sudo apt-get install -y nginx
  # Certbot（SSL 可选）
  sudo apt-get install -y certbot python3-certbot-nginx || true
elif [ "$PM" = "yum" ]; then
  sudo yum -y install curl ca-certificates
  # Node.js via NodeSource
  curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
  sudo yum install -y nodejs gcc-c++ make
  # Nginx
  sudo yum install -y epel-release || true
  sudo yum install -y nginx || true
  # Certbot（SSL 可选）
  sudo yum install -y certbot python3-certbot-nginx || true
else
  echo "Unsupported package manager. Please install nodejs, pm2, nginx, certbot manually." >&2
fi

# PM2 全局安装
sudo npm i -g pm2

# 启动并设置 Nginx 随系统启动
sudo systemctl enable nginx || true
sudo systemctl start nginx || sudo service nginx start || true

echo "[INIT] server initialized. REMOTE_ROOT=$REMOTE_ROOT"