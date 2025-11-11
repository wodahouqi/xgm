#!/usr/bin/env bash
set -euo pipefail

# 本脚本通常由 deploy_all.sh 调用，不建议单独运行。
# 需要以下环境变量：SSH_HOST SSH_PORT SSH_USER REMOTE_ROOT LOCAL_BACKEND_DIR

echo "[BACKEND] packaging and uploading backend..."

# 以 tar 流的方式上传，排除 node_modules 与 dist
tar --exclude=node_modules --exclude=dist -czf - -C "$LOCAL_BACKEND_DIR" . \
  | ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" "mkdir -p '$REMOTE_ROOT/api' && tar -xzf - -C '$REMOTE_ROOT/api'"

echo "[BACKEND] installing dependencies and building on remote..."
ssh -p "$SSH_PORT" "$SSH_USER@$SSH_HOST" \
  "cd '$REMOTE_ROOT/api' && npm ci && npm run build"

echo "[BACKEND] done."