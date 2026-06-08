$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationLeaseReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing automation lease readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-automation-lease-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $now = "2026-06-08T20:00:00Z"
    $missingLeasePath = Join-Path -Path $fixtureRoot -ChildPath "missing-lease.json"
    $missingOutput = @(& $scriptPath -LeasePath $missingLeasePath -NowUtc $now)
    Assert-Contains -Output $missingOutput -Pattern "automationLeaseDecision: no_active_lease"

    $cleanWorktree = Join-Path -Path $fixtureRoot -ChildPath "clean-worktree"
    New-Item -ItemType Directory -Path $cleanWorktree | Out-Null
    & git -C $cleanWorktree init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize clean lease fixture worktree."
    }

    $activeLeasePath = Join-Path -Path $fixtureRoot -ChildPath "active-lease.json"
    @"
{
  "runId": "run-active",
  "taskId": "module-run-v2-autopilot-maturity-hardening",
  "owner": "codex-automation",
  "worktreePath": "$($cleanWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T20:30:00Z"
}
"@ | Set-Content -LiteralPath $activeLeasePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "automationLeaseDecision: stop_existing_run_active" -Command {
        & $scriptPath -LeasePath $activeLeasePath -NowUtc $now
    }

    $expiredCleanLeasePath = Join-Path -Path $fixtureRoot -ChildPath "expired-clean-lease.json"
    @"
{
  "runId": "run-expired-clean",
  "taskId": "module-run-v2-autopilot-maturity-hardening",
  "owner": "codex-automation",
  "worktreePath": "$($cleanWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T19:30:00Z"
}
"@ | Set-Content -LiteralPath $expiredCleanLeasePath -Encoding UTF8

    $expiredCleanOutput = @(& $scriptPath -LeasePath $expiredCleanLeasePath -NowUtc $now)
    Assert-Contains -Output $expiredCleanOutput -Pattern "automationLeaseDecision: expired_lease_reclaimable"

    $dirtyWorktree = Join-Path -Path $fixtureRoot -ChildPath "dirty-worktree"
    New-Item -ItemType Directory -Path $dirtyWorktree | Out-Null
    & git -C $dirtyWorktree init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize dirty lease fixture worktree."
    }
    Set-Content -LiteralPath (Join-Path -Path $dirtyWorktree -ChildPath "untracked.txt") -Value "dirty" -Encoding UTF8

    $expiredDirtyLeasePath = Join-Path -Path $fixtureRoot -ChildPath "expired-dirty-lease.json"
    @"
{
  "runId": "run-expired-dirty",
  "taskId": "module-run-v2-autopilot-maturity-hardening",
  "owner": "codex-automation",
  "worktreePath": "$($dirtyWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T19:30:00Z"
}
"@ | Set-Content -LiteralPath $expiredDirtyLeasePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "automationLeaseDecision: stop_expired_dirty_lease" -Command {
        & $scriptPath -LeasePath $expiredDirtyLeasePath -NowUtc $now
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 automation lease readiness smoke passed"
