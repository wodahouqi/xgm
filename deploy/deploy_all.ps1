Param(
  [string]$EnvDeployPath = "$(Resolve-Path -Path "$PSScriptRoot/.env.deploy")",
  [string]$EnvServerPath = "$(Resolve-Path -Path "$PSScriptRoot/.env.server")"
)

function Read-DotEnv {
  param([string]$Path)
  if (!(Test-Path $Path)) { throw "Env file not found: $Path" }
  $envs = @{}
  Get-Content -Path $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $kv = $line -split '=', 2
    if ($kv.Count -eq 2) { $envs[$kv[0]] = $kv[1] }
  }
  return $envs
}

function Assert-Cmd {
  param([string]$Cmd)
  if (-not (Get-Command $Cmd -ErrorAction SilentlyContinue)) {
    throw "Required command not found: $Cmd"
  }
}

Write-Host "[DEPLOY] Reading env files..."
$DEPLOY = Read-DotEnv -Path $EnvDeployPath
$SERVER = Read-DotEnv -Path $EnvServerPath

Assert-Cmd ssh
Assert-Cmd scp

$SSH_HOST = $DEPLOY['SSH_HOST']
$SSH_PORT = $DEPLOY['SSH_PORT']
$SSH_USER = $DEPLOY['SSH_USER']
$REMOTE_ROOT = $DEPLOY['REMOTE_ROOT']
$DOMAIN = $DEPLOY['DOMAIN']
$ENABLE_SSL = 'false'
if ($DEPLOY.ContainsKey('ENABLE_SSL')) { $ENABLE_SSL = $DEPLOY['ENABLE_SSL'] }
$LETSENCRYPT_EMAIL = $DEPLOY['LETSENCRYPT_EMAIL']
$API_PORT = $DEPLOY['API_PORT']
$SITE_NAME = $DEPLOY['NGINX_SITE_NAME']
$LOCAL_FRONTEND_BUILD_DIR = $DEPLOY['LOCAL_FRONTEND_BUILD_DIR']
$LOCAL_BACKEND_DIR = $DEPLOY['LOCAL_BACKEND_DIR']

if (-not (Test-Path "$LOCAL_FRONTEND_BUILD_DIR/index.html")) {
  Write-Host "[DEPLOY] Frontend not built. Running 'npm run build'..."
  npm run -s build | Write-Host
}

Write-Host "[DEPLOY] Target: $($SSH_USER)@$($SSH_HOST):$SSH_PORT, root: $REMOTE_ROOT, domain: $DOMAIN"

Write-Host "[DEPLOY] Creating remote directories..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "sudo mkdir -p '$REMOTE_ROOT/deploy' '$REMOTE_ROOT/frontend' '$REMOTE_ROOT/api' '$REMOTE_ROOT/logs'" | Write-Host

Write-Host "[DEPLOY] Uploading helper files..."
scp -P $SSH_PORT "$PSScriptRoot/server_init.sh" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/deploy/"
scp -P $SSH_PORT "$PSScriptRoot/setup_ssl.sh" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/deploy/"
scp -P $SSH_PORT "$PSScriptRoot/db_init.sh" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/deploy/"
scp -P $SSH_PORT "$PSScriptRoot/ecosystem.config.js" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/deploy/"
scp -P $SSH_PORT "$PSScriptRoot/nginx.conf.template" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/deploy/"

Write-Host "[INIT] Remote server initialization..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "DOMAIN='$DOMAIN' ENABLE_SSL='$ENABLE_SSL' REMOTE_ROOT='$REMOTE_ROOT' API_PORT='$API_PORT' bash '$REMOTE_ROOT/deploy/server_init.sh'"

Write-Host "[BACKEND] Uploading backend directory..."
scp -P $SSH_PORT -r "$LOCAL_BACKEND_DIR" "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/"

Write-Host "[BACKEND] Uploading backend .env..."
scp -P $SSH_PORT $EnvServerPath "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/api/.env"

Write-Host "[BACKEND] Installing deps and building on remote..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "cd '$REMOTE_ROOT/api' && npm ci && npm run -s build"

Write-Host "[BACKEND] Starting API with PM2..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "APP_CWD='$REMOTE_ROOT/api' APP_LOG_OUT='$REMOTE_ROOT/logs/api-out.log' APP_LOG_ERR='$REMOTE_ROOT/logs/api-err.log' pm2 start '$REMOTE_ROOT/deploy/ecosystem.config.js' --update-env && pm2 save"

Write-Host "[FRONTEND] Uploading dist..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "sudo mkdir -p '$REMOTE_ROOT/frontend' && sudo rm -rf '$REMOTE_ROOT/frontend/'*"
# Copy all files from local dist to remote frontend directory
$root = (Resolve-Path "$LOCAL_FRONTEND_BUILD_DIR").Path
Get-ChildItem -Path $root -Recurse | ForEach-Object {
  $full = $_.FullName
  $rel = $full.Substring($root.Length)
  $rel = $rel.TrimStart('\\','/')
  $relUnix = $rel -replace '\\','/'
  if ($_.PSIsContainer) {
    ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "mkdir -p '$REMOTE_ROOT/frontend/$relUnix'" | Out-Null
  } else {
    scp -P $SSH_PORT $full "$($SSH_USER)@$($SSH_HOST):$REMOTE_ROOT/frontend/$relUnix"
  }
}

Write-Host "[NGINX] Configuring and reloading..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "sudo bash -lc 'sed -e s#__DOMAIN__#${DOMAIN}#g -e s#__FRONTEND_ROOT__#${REMOTE_ROOT}/frontend#g -e s#__API_PORT__#${API_PORT}#g ${REMOTE_ROOT}/deploy/nginx.conf.template > /etc/nginx/sites-available/${SITE_NAME}.conf && ln -sf /etc/nginx/sites-available/${SITE_NAME}.conf /etc/nginx/sites-enabled/${SITE_NAME}.conf && nginx -t && (systemctl reload nginx || service nginx reload)'"

if ($ENABLE_SSL -eq 'true') {
  Write-Host "[SSL] Requesting certificate..."
  ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "DOMAIN='$DOMAIN' LETSENCRYPT_EMAIL='$LETSENCRYPT_EMAIL' bash '$REMOTE_ROOT/deploy/setup_ssl.sh'"
}

Write-Host "[DB] Initializing database..."
ssh -p $SSH_PORT "$($SSH_USER)@$($SSH_HOST)" "REMOTE_ROOT='$REMOTE_ROOT' bash '$REMOTE_ROOT/deploy/db_init.sh'"

Write-Host "[DEPLOY] Completed. Visit: http://$DOMAIN (or https if SSL enabled)"