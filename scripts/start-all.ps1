param(
  [switch]$NewWindows = $true
)

$ErrorActionPreference = 'Stop'

function Ensure-Dependencies {
  param([string]$Path)
  if (-not (Test-Path (Join-Path $Path 'node_modules'))) {
    Write-Host "[deps] Installing in $Path" -ForegroundColor Cyan
    Push-Location $Path
    npm install --loglevel=error | Out-Null
    Pop-Location
  }
}

$root = Split-Path -Parent $PSScriptRoot
$backend = Join-Path $root 'backend'
$frontend = Join-Path $root 'frontend'

Ensure-Dependencies -Path $backend
Ensure-Dependencies -Path $frontend

if ($NewWindows) {
  Write-Host "[start] Backend → new window (http://localhost:3001)" -ForegroundColor Green
  Start-Process pwsh -ArgumentList '-NoExit','-Command',"cd `"$backend`"; npm run dev" | Out-Null

  Write-Host "[start] Frontend → new window (http://localhost:3000)" -ForegroundColor Green
  Start-Process pwsh -ArgumentList '-NoExit','-Command',"cd `"$frontend`"; npm start" | Out-Null
} else {
  Write-Host "[start] Backend → background job (backend)" -ForegroundColor Green
  Start-Job -Name backend -ScriptBlock { Set-Location $using:backend; npm run dev } | Out-Null

  Write-Host "[start] Frontend → background job (frontend)" -ForegroundColor Green
  Start-Job -Name frontend -ScriptBlock { Set-Location $using:frontend; npm start } | Out-Null

  Write-Host "Use 'Get-Job' to see jobs, 'Receive-Job -Name backend' to tail output, and 'Remove-Job -Name backend,frontend' to stop jobs." -ForegroundColor Yellow
}


