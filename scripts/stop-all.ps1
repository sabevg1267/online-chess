$ErrorActionPreference = 'SilentlyContinue'

Write-Host "[stop] Stopping background jobs (backend, frontend) if any..." -ForegroundColor Yellow
Get-Job -Name backend,frontend | Stop-Job -Force
Get-Job -Name backend,frontend | Remove-Job -Force

Write-Host "[stop] Killing Node.js processes bound to 3000/3001 (if any)..." -ForegroundColor Yellow
try {
  # Windows: kill node processes (best-effort)
  Get-NetTCPConnection -State Listen -LocalPort 3000,3001 | ForEach-Object {
    $pid = $_.OwningProcess
    if ($pid) { Stop-Process -Id $pid -Force }
  }
} catch {}

try {
  taskkill /F /IM node.exe /T | Out-Null
} catch {}

Write-Host "[stop] Done" -ForegroundColor Green


