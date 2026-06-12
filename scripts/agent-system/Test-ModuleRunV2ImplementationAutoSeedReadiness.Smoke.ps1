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
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
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

function Write-FixtureFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][switch]$MissingGate,
        [Parameter(Mandatory = $false)][switch]$MissingApproval,
        [Parameter(Mandatory = $false)][switch]$UnsafeAllowedFile,
        [Parameter(Mandatory = $false)][switch]$ArchivedSourceTask,
        [Parameter(Mandatory = $false)][string]$ArchivedSourceTaskStatus = "done"
    )

    $projectStatePath = Join-Path -Path $Root -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $Root -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $Root -ChildPath "matrix.yaml"
    $taskHistoryIndexPath = Join-Path -Path $Root -ChildPath "task-history-index.yaml"
    $evidencePath = Join-Path -Path $Root -ChildPath "planning-evidence.md"

    $gateBlock = "implementationAutoSeedGate:`n  enabled: true"
    if ($MissingGate) {
        $gateBlock = "implementationSeedDisabled: true"
    }

    @"
schemaVersion: 2
moduleRunVersion: 2
$gateBlock
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    @"
schemaVersion: 1
currentTask:
  id: module-run-v2-ai-task-and-provider-planning
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    $approvalText = "autoDriveLocalImplementationApproval: approved low-risk local implementation"
    if ($MissingApproval) {
        $approvalText = "approval: planning only"
    }

    $allowedFile = "src/server/services/ai-task-local-service.ts"
    if ($UnsafeAllowedFile) {
        $allowedFile = "src/db/schema/ai-task.ts"
    }

    $sourceTaskBlock = if ($ArchivedSourceTask) {
        ""
    } else {
        @"
  - id: module-run-v2-ai-task-and-provider-planning
    status: done
    taskKind: implementation_planning
    allowedFiles:
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    blockedFiles:
      - src/**
    riskTypes:
      - module_run_planning
    validationCommands:
      - git diff --check
    evidencePath: $($evidencePath.Replace("\", "/"))
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
"@
    }

    @"
schemaVersion: 1
tasks:
$sourceTaskBlock
  - id: module-run-v2-ai-task-local-contract-implementation
    status: pending
    taskKind: implementation
    humanApproval: $approvalText
    allowedFiles:
      - $allowedFile
      - src/server/services/ai-task-local-service.test.ts
      - docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-local-contract-implementation.md
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-local-contract-implementation.md
      - docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-local-contract-implementation.md
    blockedFiles:
      - .env.local
      - .env.example
      - package.json
      - pnpm-lock.yaml
      - package-lock.yaml
      - package-lock.json
      - src/db/schema/**
      - drizzle/**
    riskTypes:
      - local_implementation
      - evidence_integrity
    validationCommandLifecycle:
      - phase: post_edit
        command: npm.cmd run lint
      - phase: post_edit
        command: npm.cmd run typecheck
      - phase: post_edit
        command: git diff --check
      - phase: advisory_baseline
        command: npm.cmd run test -- --run focused # focused test anchor
      - phase: closeout
        command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-ai-task-local-contract-implementation
    validationCommands:
      - npm.cmd run lint
      - npm.cmd run typecheck
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId module-run-v2-ai-task-local-contract-implementation
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-local-contract-implementation.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-local-contract-implementation.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
# Planning Evidence

- implementationAutoSeedGate: passed.
- localExperienceClosureGate: personal-learning-ai-experience.
- proposedImplementationTask: module-run-v2-ai-task-local-contract-implementation.
- focused test: src/server/services/ai-task-local-service.test.ts.
- localFullLoopGate: L2.
- Cost Calibration Gate remains blocked.
"@ | Set-Content -LiteralPath $evidencePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: module-run-v2-ai-task-and-provider-planning
    phase: module-run-v2-ai-task-and-provider-planning
    status: $ArchivedSourceTaskStatus
    taskKind: implementation_planning
    evidencePath: $($evidencePath.Replace("\", "/"))
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    archivePath: docs/04-agent-system/state/archive/task-queue-archive-smoke.yaml
    commitSha: null
    completedAt: "2026-06-11"
    archivedByTask: active-queue-slimming-smoke
"@ | Set-Content -LiteralPath $taskHistoryIndexPath -Encoding UTF8

    return [pscustomobject]@{
        ProjectStatePath = $projectStatePath
        QueuePath        = $queuePath
        MatrixPath       = $matrixPath
        TaskHistoryIndexPath = $taskHistoryIndexPath
    }
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing implementation auto-seed readiness script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-implementation-autoseed-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $fixture = Write-FixtureFiles -Root $fixtureRoot
    $passOutput = @(
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $fixture.ProjectStatePath `
            -QueuePath $fixture.QueuePath `
            -MatrixPath $fixture.MatrixPath
    )
    Assert-Contains -Output $passOutput -Pattern "implementation auto-seed readiness passed"

    $archivedSourceFixture = Write-FixtureFiles -Root $fixtureRoot -ArchivedSourceTask
    $archivedSourceOutput = @(
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $archivedSourceFixture.ProjectStatePath `
            -QueuePath $archivedSourceFixture.QueuePath `
            -MatrixPath $archivedSourceFixture.MatrixPath `
            -TaskHistoryIndexPath $archivedSourceFixture.TaskHistoryIndexPath
    )
    Assert-Contains -Output $archivedSourceOutput -Pattern "implementation auto-seed readiness passed"

    $archivedSourcePendingFixture = Write-FixtureFiles -Root $fixtureRoot -ArchivedSourceTask -ArchivedSourceTaskStatus pending
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_SOURCE_HISTORY_NOT_TERMINAL" -Command {
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $archivedSourcePendingFixture.ProjectStatePath `
            -QueuePath $archivedSourcePendingFixture.QueuePath `
            -MatrixPath $archivedSourcePendingFixture.MatrixPath `
            -TaskHistoryIndexPath $archivedSourcePendingFixture.TaskHistoryIndexPath
    }

    $missingGateFixture = Write-FixtureFiles -Root $fixtureRoot -MissingGate
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_IMPLEMENTATION_AUTO_SEED_GATE" -Command {
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $missingGateFixture.ProjectStatePath `
            -QueuePath $missingGateFixture.QueuePath `
            -MatrixPath $missingGateFixture.MatrixPath
    }

    $missingApprovalFixture = Write-FixtureFiles -Root $fixtureRoot -MissingApproval
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_CANDIDATE_MISSING_AUTODRIVE_APPROVAL" -Command {
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $missingApprovalFixture.ProjectStatePath `
            -QueuePath $missingApprovalFixture.QueuePath `
            -MatrixPath $missingApprovalFixture.MatrixPath
    }

    $unsafeAllowedFileFixture = Write-FixtureFiles -Root $fixtureRoot -UnsafeAllowedFile
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_CANDIDATE_ALLOWED_HIGH_RISK_FILE" -Command {
        & $scriptPath `
            -TaskId module-run-v2-ai-task-and-provider-planning `
            -CandidateTaskId module-run-v2-ai-task-local-contract-implementation `
            -ProjectStatePath $unsafeAllowedFileFixture.ProjectStatePath `
            -QueuePath $unsafeAllowedFileFixture.QueuePath `
            -MatrixPath $unsafeAllowedFileFixture.MatrixPath
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 implementation auto-seed readiness smoke passed"
