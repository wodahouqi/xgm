Param(
  [string]$RepoUrl = "https://github.com/wodahouqi/xgm.git"
)

function Parse-Repo($url) {
  if ($url -match "github.com[:/](.+?)/(.+?)(\.git)?$") {
    return @{ owner = $matches[1]; repo = $matches[2] }
  }
  throw "Invalid GitHub repo URL: $url"
}

$token = $env:GITHUB_TOKEN
if ([string]::IsNullOrWhiteSpace($token)) {
  Write-Error "GITHUB_TOKEN not set. Please set a Personal Access Token with 'repo' scope: `$env:GITHUB_TOKEN='ghp_...'"; exit 1
}

$pr = Parse-Repo $RepoUrl
$owner = $pr.owner
$repo = $pr.repo
$apiBase = "https://api.github.com"

Write-Host ("[INIT] Repo: {0}/{1}" -f $owner, $repo)

# Detect default branch
try {
  $repoInfo = Invoke-RestMethod -Method GET -Uri "$apiBase/repos/$owner/$repo" -Headers @{ Authorization = "token $token" }
  $branch = $repoInfo.default_branch
  if ([string]::IsNullOrWhiteSpace($branch)) { $branch = "main" }
  Write-Host "[INIT] Default branch: $branch"
} catch {
  Write-Host "[WARN] Failed to query repo info. Fallback to 'main'"; $branch = "main"
}

# Collect files to upload
$root = Get-Location
$excludes = @(
  ".git", "node_modules", ".DS_Store", "deploy/frontend.tar", "dist"
)
$files = Get-ChildItem -Path $root -Recurse -File | Where-Object {
  $rel = $_.FullName.Substring($root.Path.Length).TrimStart('\\','/')
  foreach ($ex in $excludes) { if ($rel -like "*/$ex/*" -or $rel -eq $ex -or $rel -like "$ex/*") { return $false } }
  return $true
}

function To-RepoPath($full) {
  $rel = $full.Substring($root.Path.Length).TrimStart('\\','/')
  return ($rel -replace '\\','/')
}

function Get-FileSha($owner, $repo, $path, $branch) {
  try {
    $res = Invoke-RestMethod -Method GET -Uri "$apiBase/repos/$owner/$repo/contents/$path?ref=$branch" -Headers @{ Authorization = "token $token" }
    return $res.sha
  } catch { return $null }
}

function Upload-File($full) {
  $path = To-RepoPath $full
  $bytes = [System.IO.File]::ReadAllBytes($full)
  $b64 = [Convert]::ToBase64String($bytes)
  $sha = Get-FileSha $owner $repo $path $branch
  $body = @{ message = "chore: upload $path"; content = $b64; branch = $branch }
  if ($sha) { $body.sha = $sha }
  $json = ($body | ConvertTo-Json -Depth 4)
  $uri = "$apiBase/repos/$owner/$repo/contents/$path"
  try {
    $res = Invoke-RestMethod -Method PUT -Uri $uri -Headers @{ Authorization = "token $token" } -ContentType "application/json" -Body $json
    Write-Host ("[OK] {0} -> {1}" -f $path, $res.commit.sha)
  } catch {
    Write-Host ("[ERR] {0}: {1}" -f $path, $_.Exception.Message)
  }
}

Write-Host ("[UPLOAD] {0} files" -f $files.Count)
foreach ($f in $files) { Upload-File $f.FullName }

Write-Host ("[DONE] View: