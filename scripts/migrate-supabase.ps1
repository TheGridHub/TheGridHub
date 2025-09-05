# Requires: Supabase CLI installed (scoop installs to %USERPROFILE%\scoop\shims\supabase.exe)
# Purpose: Apply Supabase SQL migrations to a target Postgres database safely without echoing secrets.
# Usage examples (PowerShell):
#   # 1) Use environment variable (recommended)
#   #    Set in this shell session (here-string avoids quoting issues):
#   #    $env:SUPABASE_DB_URL = @'
#   #    postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
#   #    '@
#   #    pwsh -NoProfile -File .\scripts\migrate-supabase.ps1
#   #
#   # 2) Pass explicitly (still avoids logging the secret):
#   #    $DB = @'
#   #    postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres?sslmode=require
#   #    '@
#   #    pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -DbUrl $DB
#   #
#   # 3) Read from a .env file (if it includes SUPABASE_DB_URL or DATABASE_URL):
#   #    pwsh -NoProfile -File .\scripts\migrate-supabase.ps1 -EnvFile .\.env.local

[CmdletBinding()]
param(
  [Parameter(Mandatory=$false)] [string]$DbUrl,
  [Parameter(Mandatory=$false)] [string]$EnvFile
)

$ErrorActionPreference = 'Stop'

function Write-Info($msg) { Write-Host "[i] $msg" -ForegroundColor Cyan }
function Write-Warn($msg) { Write-Host "[!] $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[x] $msg" -ForegroundColor Red }

function Get-ValueFromEnvFile {
  param(
    [string]$Path,
    [string[]]$Keys
  )
  if (-not (Test-Path -LiteralPath $Path)) { return $null }
  $content = Get-Content -LiteralPath $Path -ErrorAction Stop
  foreach ($k in $Keys) {
    $regex = "^\s*" + [regex]::Escape($k) + "\s*=\s*(.*)\s*$"
    foreach ($line in $content) {
      $m = [regex]::Match($line, $regex)
      if ($m.Success) {
        $val = $m.Groups[1].Value.Trim()
        # Strip surrounding quotes if present
        if ($val.StartsWith('"') -and $val.EndsWith('"')) { $val = $val.Substring(1, $val.Length-2) }
        if ($val.StartsWith("'") -and $val.EndsWith("'")) { $val = $val.Substring(1, $val.Length-2) }
        return $val
      }
    }
  }
  return $null
}

# 1) Resolve DB URL from param, env file, or process env
if (-not $DbUrl) {
  if ($EnvFile) {
    Write-Info "Reading database URL from env file: $EnvFile"
    $DbUrl = Get-ValueFromEnvFile -Path $EnvFile -Keys @('SUPABASE_DB_URL','DATABASE_URL')
  }
}
if (-not $DbUrl) {
  if ($env:SUPABASE_DB_URL) { $DbUrl = $env:SUPABASE_DB_URL }
  elseif ($env:DATABASE_URL) { $DbUrl = $env:DATABASE_URL }
}

if (-not $DbUrl) {
  Write-Err "No database URL provided. Set SUPABASE_DB_URL or DATABASE_URL, or pass -DbUrl, or supply -EnvFile."
  exit 1
}

# 2) Ensure sslmode=require for hosted Supabase if not already present
if ($DbUrl -match 'supabase\.co' -and $DbUrl -notmatch 'sslmode=') {
  if ($DbUrl -like '*?*') { $DbUrl = "$DbUrl&sslmode=require" } else { $DbUrl = "$DbUrl?sslmode=require" }
  Write-Info "Appended sslmode=require for Supabase host."
}

# 3) Locate Supabase CLI
$supabaseCandidates = @(
  (Join-Path $env:USERPROFILE 'scoop\shims\supabase.exe'),
  'supabase'
)
$supabase = $null
foreach ($cand in $supabaseCandidates) {
  try {
    if (Test-Path -LiteralPath $cand) { $supabase = $cand; break }
    $cmd = Get-Command $cand -ErrorAction SilentlyContinue
    if ($cmd) { $supabase = $cmd.Path; break }
  } catch {}
}
if (-not $supabase) {
  Write-Err "Supabase CLI not found. Install it (e.g., via Scoop) and retry."
  Write-Host "Try: powershell -NoProfile -File \"$env:USERPROFILE\scoop\shims\scoop.ps1\" install supabase" -ForegroundColor Yellow
  exit 1
}

# 4) Determine project workdir (repo root)
$workdir = Resolve-Path (Join-Path $PSScriptRoot '..')
Write-Info "Using workdir: $workdir"
Write-Info "Running migrations... (DB URL source: hidden)"

# 5) Execute migration without echoing secrets
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $supabase
$psi.ArgumentList = @('db','push','--workdir', $workdir, '--db-url', $DbUrl, '--yes')
$psi.RedirectStandardOutput = $true
$psi.RedirectStandardError = $true
$psi.UseShellExecute = $false
$proc = New-Object System.Diagnostics.Process
$proc.StartInfo = $psi
$null = $proc.Start()
$stdout = $proc.StandardOutput.ReadToEnd()
$stderr = $proc.StandardError.ReadToEnd()
$proc.WaitForExit()

# Forward tool output
if ($stdout) { Write-Host $stdout }
if ($stderr) { Write-Warn $stderr }

if ($proc.ExitCode -ne 0) {
  Write-Err "Migration failed with exit code $($proc.ExitCode)."
  exit $proc.ExitCode
}

Write-Host "Migrations applied successfully." -ForegroundColor Green
exit 0

