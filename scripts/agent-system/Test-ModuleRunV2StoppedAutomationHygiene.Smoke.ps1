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
$runRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "runs"
$handoffRoot = Join-Path -Path $fixtureRoot -ChildPath "handoffs"
New-Item -ItemType Directory -Path $leaseRoot, $worktreeRoot, $tempRoot, $runRegistryRoot, $handoffRoot | Out-Null

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

    $parkingRepo = Join-Path -Path $fixtureRoot -ChildPath "parking-repo"
    New-Item -ItemType Directory -Path $parkingRepo | Out-Null
    & git -C $parkingRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize parking fixture repository."
    }
    Set-Content -LiteralPath (Join-Path -Path $parkingRepo -ChildPath "README.md") -Value "parking baseline" -Encoding UTF8
    & git -C $parkingRepo add README.md | Out-Null
    & git -C $parkingRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "parking baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit parking fixture baseline."
    }
    $parkingTargetSha = ((& git -C $parkingRepo rev-parse HEAD) -join "").Trim()
    & git -C $parkingRepo update-ref refs/remotes/origin/master $parkingTargetSha
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create parking fixture origin/master ref."
    }
    & git -C $parkingRepo switch -c codex/parking-smoke | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create parking fixture task branch."
    }

    Push-Location $parkingRepo
    try {
        $parkingOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -NowUtc $now -ParkCurrentWorktree -ParkingTargetRef "origin/master")
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $parkingOutput -Pattern "automationWorktreeParking: completed"
    Assert-Contains -Output $parkingOutput -Pattern "parkingTargetRef: origin/master"
    $parkedBranch = ((& git -C $parkingRepo branch --show-current) -join "").Trim()
    if (-not [string]::IsNullOrWhiteSpace($parkedBranch)) {
        throw "Expected parking fixture repository to be detached after parking, got branch: $parkedBranch"
    }
    $parkedHead = ((& git -C $parkingRepo rev-parse HEAD) -join "").Trim()
    if ($parkedHead -ne $parkingTargetSha) {
        throw "Expected parked HEAD $parkingTargetSha, got $parkedHead"
    }

    $cleanupHandoffPath = Join-Path -Path $handoffRoot -ChildPath "cleanup-ready.md"
    Set-Content -LiteralPath $cleanupHandoffPath -Value "task:`nstatus: cleanup_ready`ncleanup allowed: yes" -Encoding UTF8
    $cleanupRunPath = Join-Path -Path $runRegistryRoot -ChildPath "cleanup-ready.json"
    @"
{
  "runId": "cleanup-ready-run",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "scheduled",
  "taskId": "module-run-v2-automation-handoff-contract-hardening",
  "branch": "codex/cleanup-ready",
  "worktreePath": "$($parkingRepo.Replace("\", "\\"))",
  "status": "cleanup_ready",
  "heartbeatAtUtc": "2026-06-08T19:30:00Z",
  "phase": "closeout",
  "changedFiles": [],
  "lastSafeCheckpoint": "closeout recorded",
  "nextRecommendedAction": "janitor cleanup",
  "safeToAdopt": false,
  "cleanupPolicy": "cleanup_ready",
  "redactedHandoffPath": "$($cleanupHandoffPath.Replace("\", "\\"))"
}
"@ | Set-Content -LiteralPath $cleanupRunPath -Encoding UTF8

    $registryCleanupAvailableOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -RunRegistryRoot $runRegistryRoot -HandoffRoot $handoffRoot -NowUtc $now)
    Assert-Contains -Output $registryCleanupAvailableOutput -Pattern "runRegistryCleanupCandidate:"
    Assert-Contains -Output $registryCleanupAvailableOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_available"

    $registrySummaryOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -RunRegistryRoot $runRegistryRoot -HandoffRoot $handoffRoot -NowUtc $now -SummaryOnly)
    Assert-Contains -Output $registrySummaryOutput -Pattern "stoppedAutomationHygieneSummaryOnly: true"
    Assert-Contains -Output $registrySummaryOutput -Pattern "stoppedAutomationHygieneCleanupCandidateKindCount:"
    if (($registrySummaryOutput -join "`n") -match "runRegistryCleanupCandidate:") {
        throw "Expected SummaryOnly output to suppress detailed run registry cleanup candidate lines."
    }

    $registryCleanupOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -RunRegistryRoot $runRegistryRoot -HandoffRoot $handoffRoot -NowUtc $now -Cleanup)
    Assert-Contains -Output $registryCleanupOutput -Pattern "runRegistryCleanupAction:"
    Assert-Contains -Output $registryCleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    if (Test-Path -LiteralPath $cleanupRunPath) {
        throw "Expected cleanup-ready run registry file to be removed."
    }
    if (Test-Path -LiteralPath $cleanupHandoffPath) {
        throw "Expected cleanup-ready handoff file to be removed."
    }

    $missingActiveWorktree = Join-Path -Path $fixtureRoot -ChildPath "missing-active-worktree"
    $expiredActiveRunPath = Join-Path -Path $runRegistryRoot -ChildPath "expired-active-missing.json"
    @"
{
  "runId": "expired-active-missing-run",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "scheduled",
  "taskId": "module-run-v2-expired-active-missing-worktree",
  "branch": "codex/expired-active-missing",
  "worktreePath": "$($missingActiveWorktree.Replace("\", "\\"))",
  "status": "active",
  "heartbeatAtUtc": "2026-06-08T19:00:00Z",
  "phase": "readiness",
  "changedFiles": [],
  "lastSafeCheckpoint": "heartbeat expired",
  "nextRecommendedAction": "janitor cleanup",
  "safeToAdopt": false,
  "cleanupPolicy": "none",
  "redactedHandoffPath": null
}
"@ | Set-Content -LiteralPath $expiredActiveRunPath -Encoding UTF8

    $expiredActiveAvailableOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -RunRegistryRoot $runRegistryRoot -HandoffRoot $handoffRoot -NowUtc $now -ActiveRunHeartbeatMinutes 30)
    Assert-Contains -Output $expiredActiveAvailableOutput -Pattern "expired_active_missing_worktree"
    Assert-Contains -Output $expiredActiveAvailableOutput -Pattern "runRegistryCleanupCandidate:"
    Assert-Contains -Output $expiredActiveAvailableOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_available"

    $expiredActiveCleanupOutput = @(& $scriptPath -LeasePath $missingLeasePath -LeaseCleanupRoot $leaseRoot -AutomationWorktreeRoot $worktreeRoot -TempRoot $tempRoot -RunRegistryRoot $runRegistryRoot -HandoffRoot $handoffRoot -NowUtc $now -ActiveRunHeartbeatMinutes 30 -Cleanup)
    Assert-Contains -Output $expiredActiveCleanupOutput -Pattern "runRegistryCleanupAction:"
    Assert-Contains -Output $expiredActiveCleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    if (Test-Path -LiteralPath $expiredActiveRunPath) {
        throw "Expected expired active missing-worktree run registry file to be removed."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 stopped automation hygiene smoke passed"
