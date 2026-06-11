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

    $text = $Output -join "`n"
    if ($text -notmatch $Pattern) {
        throw "Expected output pattern not found: $Pattern`n$text"
    }
}

function Assert-Equal {
    param(
        [Parameter(Mandatory = $true)][object]$Actual,
        [Parameter(Mandatory = $true)][object]$Expected,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if ($Actual -ne $Expected) {
        throw "$Label mismatch. Expected '$Expected', got '$Actual'."
    }
}

function Get-StablePathHash {
    param([Parameter(Mandatory = $true)][string]$Value)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value.ToLowerInvariant())
        $hashBytes = $sha256.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Set-ModuleRunV2RunRegistryFinalizer.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing run registry finalizer script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-run-registry-finalizer-" + [guid]::NewGuid().ToString("N"))
$repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
$runRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "automation-runs"

try {
    New-Item -ItemType Directory -Path $repoPath, $runRegistryRoot | Out-Null
    & git -C $repoPath init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize finalizer smoke repository."
    }

    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "README.md") -Value "baseline" -Encoding UTF8
    & git -C $repoPath add README.md | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit finalizer smoke baseline."
    }

    Set-Content -LiteralPath (Join-Path -Path $repoPath -ChildPath "owner-recovery.txt") -Value "dirty owner" -Encoding UTF8

    $normalizedRepoPath = $repoPath.Replace("\", "/")
    $expectedRegistryPath = Join-Path -Path $runRegistryRoot -ChildPath "$(Get-StablePathHash -Value $normalizedRepoPath).json"
    @"
{
  "runId": "$(Get-StablePathHash -Value $normalizedRepoPath)",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "interactive",
  "taskId": "batch-102",
  "branch": "(detached HEAD)",
  "worktreePath": "$normalizedRepoPath",
  "status": "active",
  "heartbeatAtUtc": "2026-06-08T19:59:00Z",
  "phase": "readiness",
  "changedFiles": [],
  "lastSafeCheckpoint": "unattended readiness started",
  "nextRecommendedAction": "continue current task after gates pass",
  "safeToAdopt": false,
  "cleanupPolicy": "none",
  "redactedHandoffPath": null
}
"@ | Set-Content -LiteralPath $expectedRegistryPath -Encoding UTF8

    $dirtyOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "batch-102" `
            -RunRegistryRoot $runRegistryRoot `
            -WorktreePath $repoPath `
            -Status "stopped" `
            -Phase "validation_failed" `
            -BlockerKind "advisory_baseline_out_of_scope" `
            -StopTaxonomy "validation_failed" `
            -Severity "hard_block" `
            -RequiresHuman 1 `
            -EvidencePath "docs/05-execution-logs/evidence/batch-102.md" `
            -AuditReviewPath "docs/05-execution-logs/audits-reviews/batch-102.md" `
            -CloseoutTransactionState "closeout_pending_commit_evidence" `
            -CleanupPolicy "none" `
            -NextRecommendedAction "manual_required_owner_recovery" `
            -NextCommand "rerun validation command after fixing owner-recovery state" `
            -RiskIfAutoContinued "validation state may be lost or overwritten" `
            -StateWritten "run_registry" `
            -ResumePointer "docs/05-execution-logs/evidence/batch-102.md"
    )

    Assert-Contains -Output $dirtyOutput -Pattern "runRegistryFinalizer: wrote"
    Assert-Contains -Output $dirtyOutput -Pattern "changedFile: owner-recovery\.txt"
    Assert-Contains -Output $dirtyOutput -Pattern "stopTaxonomy: validation_failed"
    Assert-Contains -Output $dirtyOutput -Pattern "severity: hard_block"
    Assert-Contains -Output $dirtyOutput -Pattern "requiresHuman: true"
    Assert-Contains -Output $dirtyOutput -Pattern "closeoutTransactionState: closeout_pending_commit_evidence"
    Assert-Contains -Output $dirtyOutput -Pattern "safeToAdopt: false"
    Assert-Contains -Output $dirtyOutput -Pattern "nextCommand: rerun validation command after fixing owner-recovery state"
    Assert-Contains -Output $dirtyOutput -Pattern "riskIfAutoContinued: validation state may be lost or overwritten"
    Assert-Contains -Output $dirtyOutput -Pattern "stateWritten: run_registry"
    Assert-Contains -Output $dirtyOutput -Pattern "resumePointer: docs/05-execution-logs/evidence/batch-102.md"

    $registryPath = (($dirtyOutput | Where-Object { $_ -match "^runRegistryPath:\s+" }) -replace "^runRegistryPath:\s+", "").Trim()
    if (-not (Test-Path -LiteralPath $registryPath)) {
        throw "Finalizer did not write registry path: $registryPath"
    }

    Assert-Equal -Actual $registryPath -Expected $expectedRegistryPath -Label "normalized registry path"
    $registryFileCount = @(Get-ChildItem -LiteralPath $runRegistryRoot -Filter "*.json" -File).Count
    Assert-Equal -Actual $registryFileCount -Expected 1 -Label "registry file count after finalizer"

    $dirtyRegistry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
    Assert-Equal -Actual ([string]$dirtyRegistry.status) -Expected "stopped" -Label "dirty registry status"
    Assert-Equal -Actual ([string]$dirtyRegistry.phase) -Expected "validation_failed" -Label "dirty registry phase"
    Assert-Equal -Actual ([string]$dirtyRegistry.blockerKind) -Expected "advisory_baseline_out_of_scope" -Label "dirty registry blocker kind"
    Assert-Equal -Actual ([string]$dirtyRegistry.stopTaxonomy) -Expected "validation_failed" -Label "dirty registry stop taxonomy"
    Assert-Equal -Actual ([string]$dirtyRegistry.severity) -Expected "hard_block" -Label "dirty registry severity"
    Assert-Equal -Actual ([bool]$dirtyRegistry.requiresHuman) -Expected $true -Label "dirty registry requires human"
    Assert-Equal -Actual ([string]$dirtyRegistry.closeoutTransactionState) -Expected "closeout_pending_commit_evidence" -Label "dirty registry closeout state"
    Assert-Equal -Actual ([string]$dirtyRegistry.nextCommand) -Expected "rerun validation command after fixing owner-recovery state" -Label "dirty registry next command"
    Assert-Equal -Actual ([string]$dirtyRegistry.riskIfAutoContinued) -Expected "validation state may be lost or overwritten" -Label "dirty registry risk"
    Assert-Equal -Actual ([string]$dirtyRegistry.stateWritten) -Expected "run_registry" -Label "dirty registry state written"
    Assert-Equal -Actual ([string]$dirtyRegistry.resumePointer) -Expected "docs/05-execution-logs/evidence/batch-102.md" -Label "dirty registry resume pointer"
    Assert-Equal -Actual ([bool]$dirtyRegistry.safeToAdopt) -Expected $false -Label "dirty registry safeToAdopt"
    Assert-Contains -Output @($dirtyRegistry.changedFiles) -Pattern "owner-recovery\.txt"

    & git -C $repoPath add owner-recovery.txt | Out-Null
    & git -C $repoPath -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "owner recovery" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit finalizer smoke owner recovery."
    }

    $cleanupOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "batch-102" `
            -RunRegistryRoot $runRegistryRoot `
            -WorktreePath $repoPath `
            -Status "cleanup_ready" `
            -Phase "closed" `
            -BlockerKind "none" `
            -StopTaxonomy "auto_recoverable" `
            -Severity "auto_recoverable" `
            -RequiresHuman 0 `
            -EvidencePath "docs/05-execution-logs/evidence/batch-102.md" `
            -AuditReviewPath "docs/05-execution-logs/audits-reviews/batch-102.md" `
            -CloseoutTransactionState "closed" `
            -CleanupPolicy "cleanup_ready" `
            -NextRecommendedAction "cleanup_stale_artifacts" `
            -NextCommand "run stopped automation hygiene cleanup" `
            -RiskIfAutoContinued "none; cleanup can proceed when hygiene remains clean" `
            -StateWritten "run_registry" `
            -ResumePointer "cleanupPolicy=cleanup_ready"
    )

    Assert-Contains -Output $cleanupOutput -Pattern "runRegistryStatus: cleanup_ready"
    Assert-Contains -Output $cleanupOutput -Pattern "changedFilesCount: 0"
    Assert-Contains -Output $cleanupOutput -Pattern "cleanupPolicy: cleanup_ready"
    Assert-Contains -Output $cleanupOutput -Pattern "severity: auto_recoverable"
    Assert-Contains -Output $cleanupOutput -Pattern "requiresHuman: false"
    Assert-Contains -Output $cleanupOutput -Pattern "nextCommand: run stopped automation hygiene cleanup"

    $cleanupRegistry = Get-Content -LiteralPath $registryPath -Raw | ConvertFrom-Json
    Assert-Equal -Actual ([string]$cleanupRegistry.status) -Expected "cleanup_ready" -Label "cleanup registry status"
    Assert-Equal -Actual ([string]$cleanupRegistry.cleanupPolicy) -Expected "cleanup_ready" -Label "cleanup registry policy"
    Assert-Equal -Actual ([string]$cleanupRegistry.closeoutTransactionState) -Expected "closed" -Label "cleanup registry closeout state"
    Assert-Equal -Actual ([string]$cleanupRegistry.severity) -Expected "auto_recoverable" -Label "cleanup registry severity"
    Assert-Equal -Actual ([bool]$cleanupRegistry.requiresHuman) -Expected $false -Label "cleanup registry requires human"
    Assert-Equal -Actual ([string]$cleanupRegistry.nextCommand) -Expected "run stopped automation hygiene cleanup" -Label "cleanup registry next command"
    Assert-Equal -Actual ([string]$cleanupRegistry.riskIfAutoContinued) -Expected "none; cleanup can proceed when hygiene remains clean" -Label "cleanup registry risk"
    Assert-Equal -Actual ([string]$cleanupRegistry.stateWritten) -Expected "run_registry" -Label "cleanup registry state written"
    Assert-Equal -Actual ([string]$cleanupRegistry.resumePointer) -Expected "cleanupPolicy=cleanup_ready" -Label "cleanup registry resume pointer"
    Assert-Equal -Actual (@($cleanupRegistry.changedFiles).Count) -Expected 0 -Label "cleanup registry changed files"

    $noWriteOutput = @(
        & powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $scriptPath `
            -TaskId "idle" `
            -RunRegistryRoot $runRegistryRoot `
            -WorktreePath $repoPath `
            -Status "stopped" `
            -Phase "idle" `
            -BlockerKind "none" `
            -StopTaxonomy "idle" `
            -Severity "idle" `
            -RequiresHuman 0 `
            -CloseoutTransactionState "not_applicable" `
            -CleanupPolicy "none" `
            -NextRecommendedAction "none" `
            -NextCommand "none" `
            -RiskIfAutoContinued "none; idle terminal state has no runnable task" `
            -StateWritten "none" `
            -NoWriteReason "idle terminal state does not need durable registry" `
            -ResumePointer "docs/04-agent-system/state/project-state.yaml" `
            -NoWrite
    )

    Assert-Contains -Output $noWriteOutput -Pattern "runRegistryFinalizer: dry_run"
    Assert-Contains -Output $noWriteOutput -Pattern "severity: idle"
    Assert-Contains -Output $noWriteOutput -Pattern "requiresHuman: false"
    Assert-Contains -Output $noWriteOutput -Pattern "stateWritten: none"
    Assert-Contains -Output $noWriteOutput -Pattern "noWriteReason: idle terminal state does not need durable registry"
    Assert-Contains -Output $noWriteOutput -Pattern "resumePointer: docs/04-agent-system/state/project-state.yaml"
    $registryFileCountAfterNoWrite = @(Get-ChildItem -LiteralPath $runRegistryRoot -Filter "*.json" -File).Count
    Assert-Equal -Actual $registryFileCountAfterNoWrite -Expected 1 -Label "registry file count after no-write finalizer"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 run registry finalizer smoke passed"
