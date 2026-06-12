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

function Assert-NotContains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -gt 0) {
        throw "Unexpected output pattern found: $Pattern`nActual output:`n$($Output -join "`n")"
    }
}

function Initialize-SmokeRepo {
    param([Parameter(Mandatory = $true)][string]$Path)

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    & git -C $Path init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize next-action smoke repository."
    }

    & git -C $Path config user.name "Tiku Smoke"
    & git -C $Path config user.email "tiku-smoke@example.invalid"
    & git -C $Path config core.autocrlf false
    Set-Content -LiteralPath (Join-Path -Path $Path -ChildPath "README.md") -Value "next-action smoke baseline" -Encoding UTF8
    & git -C $Path add README.md | Out-Null
    & git -C $Path commit -m "chore(smoke): seed next-action fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action smoke repository baseline."
    }

    & git -C $Path branch -M master
    return ((& git -C $Path rev-parse HEAD) -join "").Trim()
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Get-TikuNextAction.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing next-action diagnostic script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-next-action-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $repoPath = Join-Path -Path $fixtureRoot -ChildPath "repo"
    $sha = Initialize-SmokeRepo -Path $repoPath
    $stateRoot = Join-Path -Path $repoPath -ChildPath "docs/04-agent-system/state"
    New-Item -ItemType Directory -Path $stateRoot -Force | Out-Null
    $projectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $stateRoot -ChildPath "task-queue.yaml"
    $matrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix.yaml"
    $taskHistoryIndexPath = Join-Path -Path $stateRoot -ChildPath "task-history-index.yaml"
    $completedEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/completed-a.md"
    $archivedEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/archived-a.md"
    New-Item -ItemType Directory -Path (Split-Path -Path $completedEvidencePath -Parent) -Force | Out-Null
    Set-Content -LiteralPath $completedEvidencePath -Value "completed-a smoke evidence" -Encoding UTF8
    Set-Content -LiteralPath $archivedEvidencePath -Value "archived-a smoke evidence" -Encoding UTF8

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: completed-a
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: completed-a
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: task-missing-status
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-missing-status.md
  - id: task-legacy-done
    status: done
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-legacy-done.md
  - id: task-a
    status: pending
    dependencies:
      - completed-a
    validationCommands:
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1
    evidencePath: docs/05-execution-logs/evidence/task-a.md
  - id: task-b
    status: pending
    dependencies:
      - missing-task
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-b.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: archived-a
    phase: archived-a
    status: done
    taskKind: implementation_planning
    evidencePath: docs/05-execution-logs/evidence/archived-a.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/archived-a.md
    archivePath: docs/04-agent-system/state/archive/task-queue-archive-smoke.yaml
    commitSha: null
    completedAt: "2026-06-11"
    archivedByTask: active-queue-slimming-smoke
"@ | Set-Content -LiteralPath $taskHistoryIndexPath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
sourcePlanningModules:
  - module: smoke-module
    sourcePlanningTask: missing-planning-task
    v2ExecutionModule: smoke-execution
    currentProgress:
      completedBatches:
        - batch-999-missing-from-queue
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add next-action state fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action smoke state fixture."
    }

    $beforeProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $beforeQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $beforeMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash

    Push-Location -LiteralPath $repoPath
    try {
        $output = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $output -Pattern '^repository:'
    Assert-Contains -Output $output -Pattern '^currentTask: completed-a\(closed\)'
    Assert-Contains -Output $output -Pattern '^queueDecision: executable_task_found$'
    Assert-Contains -Output $output -Pattern '^nextActionDecision: executable_task_found$'
    Assert-Contains -Output $output -Pattern '^nextExecutableTask: task-a$'
    Assert-Contains -Output $output -Pattern '^seedProposalDecision: not_checked$'
    Assert-Contains -Output $output -Pattern '^blockedGates:'
    Assert-Contains -Output $output -Pattern '^validationNeeded: 2 command\(s\) for task-a$'
    Assert-Contains -Output $output -Pattern '^statusFindings: .*legacy_status_missing=1; legacy_done=1; .*notBlockingCurrentRun=true$'
    Assert-Contains -Output $output -Pattern '^evidenceFindings: evidenceMissing=1; notBlockingCurrentRun=true$'
    Assert-Contains -Output $output -Pattern '^driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:1,sourcePlanningTaskMissingInQueue:1; notBlockingCurrentRun=true$'
    Assert-NotContains -Output $output -Pattern 'legacy_done_first='
    Assert-NotContains -Output $output -Pattern 'evidenceMissingFirst='
    Assert-NotContains -Output $output -Pattern 'queueMatrixDriftFirst='
    Assert-Contains -Output $output -Pattern '^recommendedAction: claim_or_plan_next_task:task-a$'
    Assert-Contains -Output $output -Pattern '^stopReason: none$'
    Assert-Contains -Output $output -Pattern '^diagnosticOnly: true$'
    Assert-Contains -Output $output -Pattern 'Cost Calibration Gate remains blocked'

    Push-Location -LiteralPath $repoPath
    try {
        $verboseOutput = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -VerboseHistory
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $verboseOutput -Pattern '^statusFindingsVerbose: .*legacy_status_missing_first=task-missing-status; legacy_done_first=task-legacy-done;'
    Assert-Contains -Output $verboseOutput -Pattern '^evidenceFindingsVerbose: evidenceMissingFirst=task-legacy-done$'
    Assert-Contains -Output $verboseOutput -Pattern '^driftFindingsVerbose: queueMatrixDriftFirst=batch-999-missing-from-queue,missing-planning-task$'

    $plannedPauseProjectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state-planned-pause.yaml"
    @"
schemaVersion: 1
automation:
  unattendedControl:
    plannedPauseStatus: active
    plannedPauseReason: user_requested_mechanism_tuning
    plannedPauseKeepsAutomationPaused: true
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: completed-a
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $plannedPauseProjectStatePath -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $plannedPauseOutput = @(
            & $scriptPath `
                -ProjectStatePath $plannedPauseProjectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $plannedPauseOutput -Pattern '^plannedPauseStatus: active$'
    Assert-Contains -Output $plannedPauseOutput -Pattern '^nextActionDecision: planned_pause_for_tuning$'
    Assert-Contains -Output $plannedPauseOutput -Pattern '^nextExecutableTask: none$'
    Assert-Contains -Output $plannedPauseOutput -Pattern '^recommendedAction: keep_automation_paused_for_tuning$'
    Assert-Contains -Output $plannedPauseOutput -Pattern '^stopReason: planned_pause_for_tuning$'

    $historyQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-history.yaml"
    @"
schemaVersion: 1
tasks:
  - id: seed-closed
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: task-archived-dependency
    status: pending
    dependencies:
      - archived-a
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-archived-dependency.md
"@ | Set-Content -LiteralPath $historyQueuePath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add archived dependency fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action archived dependency fixture."
    }

    Push-Location -LiteralPath $repoPath
    try {
        $historyOutput = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $historyQueuePath `
                -MatrixPath $matrixPath `
                -TaskHistoryIndexPath $taskHistoryIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $historyOutput -Pattern '^queueDecision: executable_task_found$'
    Assert-Contains -Output $historyOutput -Pattern '^nextExecutableTask: task-archived-dependency$'
    Assert-Contains -Output $historyOutput -Pattern '^recommendedAction: claim_or_plan_next_task:task-archived-dependency$'
    Assert-Contains -Output $historyOutput -Pattern '^stopReason: none$'

    $seedQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-seed.yaml"
    $seedMatrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix-seed.yaml"
    @"
schemaVersion: 1
tasks:
  - id: seed-closed
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/seed-closed.md
"@ | Set-Content -LiteralPath $seedQueuePath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: phase-69-advanced-authorization-context-implementation-planning
    v2ExecutionModule: authorization-and-access
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
      - personal_auth and org_auth local summaries
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $seedMatrixPath -Encoding UTF8

    $seedProjectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state-seed.yaml"
    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: seed-closed
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $seedProjectStatePath -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $seedOutput = @(
            & $scriptPath `
                -ProjectStatePath $seedProjectStatePath `
                -QueuePath $seedQueuePath `
                -MatrixPath $seedMatrixPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $seedOutput -Pattern '^nextActionDecision: seed_proposal_available$'
    Assert-Contains -Output $seedOutput -Pattern '^nextExecutableTask: none$'
    Assert-Contains -Output $seedOutput -Pattern '^seedProposalDecision: proposal_available$'
    Assert-Contains -Output $seedOutput -Pattern '^seedModule: authorization-and-access$'
    Assert-Contains -Output $seedOutput -Pattern '^recommendedHumanDecision: approve_auto_seed_or_keep_paused_or_create_manual_task$'
    Assert-Contains -Output $seedOutput -Pattern '^recommendedAction: request_auto_seed_approval:authorization-and-access$'

    $afterProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $afterQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $afterMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash
    if ($beforeProjectHash -ne $afterProjectHash -or $beforeQueueHash -ne $afterQueueHash -or $beforeMatrixHash -ne $afterMatrixHash) {
        throw "Get-TikuNextAction smoke expected read-only behavior, but one or more fixture files changed."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Tiku next-action diagnostic smoke passed"
