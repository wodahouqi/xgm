#!/usr/bin/env bash
set -euo pipefail

# 从后端 .env 读取数据库配置
if [ -z "${REMOTE_ROOT:-}" ]; then
  echo "REMOTE_ROOT is required" >&2
  exit 1
fi

ENV_FILE="$REMOTE_ROOT/api/.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Env file not found: $ENV_FILE" >&2
  exit 1
fi

set -a
source "$ENV_FILE"
set +a

echo "[DB] initializing database: $DB_DATABASE on $DB_HOST:$DB_PORT"
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" \
  -e "CREATE DATABASE IF NOT EXISTS \`$DB_DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

echo "[DB] importing schema and sample data if present..."

SCHEMA_FILE="$REMOTE_ROOT/api/database/init.sql"
SAMPLE_FILE="$REMOTE_ROOT/api/database/sample_data.sql"

if [ -f "$SCHEMA_FILE" ]; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$SCHEMA_FILE" || true
fi
if [ -f "$SAMPLE_FILE" ]; then
  mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USERNAME" -p"$DB_PASSWORD" "$DB_DATABASE" < "$SAMPLE_FILE" || true
fi

echo "[DB] done."
