#!/usr/bin/env bash
set -euo pipefail

# 本脚本通常由 deploy_all.sh 调用，不建议单独运行。
# 需要以下环境变量：SSH_HOST SSH_PORT SSH_USER REMOTE_ROOT LOCAL_FRONTEND_BUILD_DIR

echo "[FRONTEND] building locally..."
npm run build

echo "[FRONTEND] uploading dist to remote..."
tar -czf - -C "$LOCAL_FRONTEND_BUILD_DIR" . \
  | ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "sudo mkdir -p '$REMOTE_ROOT/frontend' && sudo rm -rf '$REMOTE_ROOT/frontend/'* && sudo tar -xzf - -C '$REMOTE_ROOT/frontend'"

echo "[FRONTEND] done."