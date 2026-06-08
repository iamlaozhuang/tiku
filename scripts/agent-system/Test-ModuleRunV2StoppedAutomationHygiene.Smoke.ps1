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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2StoppedAutomationHygiene.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing stopped automation hygiene script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-stopped-automation-hygiene-" + [guid]::NewGuid().ToString("N"))
$leaseRoot = Join-Path -Path $fixtureRoot -ChildPath "lease-root"
$worktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "worktrees"
$tempRoot = Join-Path -Path $fixtureRoot -ChildPath "temp"
New-Item -ItemType Directory -Path $leaseRoot, $worktreeRoot, $tempRoot | Out-Null

try {
    $now = "2026-06-08T20:00:00Z"
    $missingLeasePath = Join-Path -Path $leaseRoot -ChildPath "missing-lease.json"
    $cleanOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now)
    Assert-Contains -Output $cleanOutput -Pattern "stoppedAutomationHygieneDecision: clean"

    $activeWorktree = Join-Path -Path $fixtureRoot -ChildPath "active-worktree"
    New-Item -ItemType Directory -Path $activeWorktree | Out-Null
    & git -C $activeWorktree init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize active lease fixture worktree."
    }

    $activeLeasePath = Join-Path -Path $leaseRoot -ChildPath "active-lease.json"
    @"
{
  "runId": "run-active",
  "taskId": "module-run-v2-stopped-automation-hygiene",
  "owner": "codex-automation",
  "worktreePath": "$($activeWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T20:30:00Z"
}
"@ | Set-Content -LiteralPath $activeLeasePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "stoppedAutomationHygieneDecision: stop_existing_run_active" -Command {
        & $scriptPath -LeasePath $activeLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -Cleanup
    }

    $invalidLeasePath = Join-Path -Path $leaseRoot -ChildPath "invalid-lease.json"
    Set-Content -LiteralPath $invalidLeasePath -Value "{ invalid" -Encoding UTF8
    Invoke-ExpectFailure -ExpectedPattern "stoppedAutomationHygieneDecision: stop_invalid_lease" -Command {
        & $scriptPath -LeasePath $invalidLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -Cleanup
    }

    $expiredCleanLeasePath = Join-Path -Path $leaseRoot -ChildPath "expired-clean-lease.json"
    @"
{
  "runId": "run-expired-clean",
  "taskId": "module-run-v2-stopped-automation-hygiene",
  "owner": "codex-automation",
  "worktreePath": "$($activeWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T19:30:00Z"
}
"@ | Set-Content -LiteralPath $expiredCleanLeasePath -Encoding UTF8

    $cleanupAvailableOutput = @(& $scriptPath -LeasePath $expiredCleanLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now)
    Assert-Contains -Output $cleanupAvailableOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_available"

    $cleanupCompletedOutput = @(& $scriptPath -LeasePath $expiredCleanLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -Cleanup)
    Assert-Contains -Output $cleanupCompletedOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    if (Test-Path -LiteralPath $expiredCleanLeasePath) {
        throw "Expected expired clean lease to be removed."
    }

    $dirtyWorktree = Join-Path -Path $fixtureRoot -ChildPath "dirty-worktree"
    New-Item -ItemType Directory -Path $dirtyWorktree | Out-Null
    & git -C $dirtyWorktree init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize dirty lease fixture worktree."
    }
    Set-Content -LiteralPath (Join-Path -Path $dirtyWorktree -ChildPath "untracked.txt") -Value "dirty" -Encoding UTF8

    $expiredDirtyLeasePath = Join-Path -Path $leaseRoot -ChildPath "expired-dirty-lease.json"
    @"
{
  "runId": "run-expired-dirty",
  "taskId": "module-run-v2-stopped-automation-hygiene",
  "owner": "codex-automation",
  "worktreePath": "$($dirtyWorktree.Replace("\", "\\"))",
  "expiresAtUtc": "2026-06-08T19:30:00Z"
}
"@ | Set-Content -LiteralPath $expiredDirtyLeasePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "stoppedAutomationHygieneDecision: stop_dirty_worktree" -Command {
        & $scriptPath -LeasePath $expiredDirtyLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -Cleanup
    }

    $handoffDir = Join-Path -Path $tempRoot -ChildPath "tiku-autopilot-handoff-smoke"
    New-Item -ItemType Directory -Path $handoffDir | Out-Null
    Set-Content -LiteralPath (Join-Path -Path $handoffDir -ChildPath "handoff.md") -Value "redacted smoke handoff" -Encoding UTF8

    $tempCleanupOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -Cleanup)
    Assert-Contains -Output $tempCleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    if (Test-Path -LiteralPath $handoffDir) {
        throw "Expected dry-run handoff temp directory to be removed."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 stopped automation hygiene smoke passed"

