# =============================================================================
# Starts the SIWS PostgreSQL instance — no Administrator rights needed.
#
# WHY THIS EXISTS
# This machine has PostgreSQL 16 and 18 installed. Both were configured for port
# 5432 and both start automatically, so whichever won the boot race owned the
# port — and the app's credentials would then fail against the wrong cluster,
# with the misleading error "password authentication failed for user siws_app".
#
# PostgreSQL 18 now listens on 5433 and holds the SIWS database; PG16 keeps 5432.
#
# `Start-Service postgresql-x64-18` requires elevation. `pg_ctl` does not, as
# long as the current user can write the data directory — which is the case here.
# So this script starts the same server without a UAC prompt.
#
#   Usage:  powershell -File scripts/start-postgres.ps1
#           powershell -File scripts/start-postgres.ps1 -Stop
# =============================================================================

param([switch]$Stop)

$ErrorActionPreference = 'Stop'

$pgCtl = 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe'
$data  = 'C:\Program Files\PostgreSQL\18\data'
$log   = Join-Path $env:TEMP 'siws-pg18.log'
$port  = 5433

if (-not (Test-Path $pgCtl)) {
  Write-Error "pg_ctl not found at $pgCtl. Is PostgreSQL 18 installed?"
  exit 1
}

if ($Stop) {
  & $pgCtl -D $data stop
  exit $LASTEXITCODE
}

# Already running is a success, not an error — this script is safe to re-run.
& $pgCtl -D $data status *> $null
if ($LASTEXITCODE -eq 0) {
  Write-Output "PostgreSQL 18 is already running on port $port."
  exit 0
}

& $pgCtl -D $data -l $log -o "-p $port" start
if ($LASTEXITCODE -ne 0) {
  Write-Error "Failed to start. Check the log at $log"
  exit $LASTEXITCODE
}

Write-Output "PostgreSQL 18 started on port $port."
Write-Output "Log: $log"
