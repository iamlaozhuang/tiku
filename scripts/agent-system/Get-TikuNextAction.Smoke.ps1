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
    $executionProfileCatalogPath = Join-Path -Path $stateRoot -ChildPath "execution-profiles.yaml"
    $historicalEvidenceDebtPath = Join-Path -Path $stateRoot -ChildPath "historical-evidence-debt.yaml"
    $executionLogIndexPath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/execution-log-index.yaml"
    $completedEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/completed-a.md"
    $archivedEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/archived-a.md"
    $closureEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/closure-evidence.md"
    $archivedOriginalEvidencePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/evidence/archived-original.md"
    $archivedEvidenceArchivePath = Join-Path -Path $repoPath -ChildPath "docs/05-execution-logs/archive/2026-05/evidence/archived-original.md"
    New-Item -ItemType Directory -Path (Split-Path -Path $completedEvidencePath -Parent) -Force | Out-Null
    New-Item -ItemType Directory -Path (Split-Path -Path $archivedEvidenceArchivePath -Parent) -Force | Out-Null
    Set-Content -LiteralPath $completedEvidencePath -Value "completed-a smoke evidence" -Encoding UTF8
    Set-Content -LiteralPath $archivedEvidencePath -Value "archived-a smoke evidence" -Encoding UTF8
    Set-Content -LiteralPath $closureEvidencePath -Value "closure smoke evidence" -Encoding UTF8
    Set-Content -LiteralPath $archivedEvidenceArchivePath -Value "archived original smoke evidence" -Encoding UTF8

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
workPacket:
  maxTasksPerPacket:
    docs_state_lite: 3
    local_full_flow: 1
"@ | Set-Content -LiteralPath $executionProfileCatalogPath -Encoding UTF8

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
  - id: task-closure-evidence
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-closure-evidence.md
    closureEvidencePath: docs/05-execution-logs/evidence/closure-evidence.md
  - id: task-archived-evidence
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/archived-original.md
  - id: task-unregistered-debt
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-unregistered-debt.md
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
  - id: task-known-blocked
    status: blocked_validation_failure
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/task-known-blocked.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    @"
schemaVersion: 1
entries:
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
  - id: missing-planning-task
    phase: missing-planning-task
    status: done
    taskKind: implementation_planning
    evidencePath: docs/05-execution-logs/evidence/archived-a.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/archived-a.md
    archivePath: docs/04-agent-system/state/archive/task-queue-archive-smoke.yaml
    commitSha: null
    completedAt: "2026-06-11"
    archivedByTask: active-queue-slimming-smoke
  - id: batch-999-missing-from-queue
    phase: batch-999-missing-from-queue
    status: closed
    taskKind: implementation
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
        - batch-1000-really-missing
  - module: smoke-module-b
    sourcePlanningTask: missing-planning-task-b
    v2ExecutionModule: smoke-execution
    currentProgress:
      completedBatches: []
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $matrixPath -Encoding UTF8

    @"
schemaVersion: 1
generatedByTask: smoke
generatedAt: "2026-06-17T00:00:00-07:00"
entries:
  - id: task-legacy-done
    originalEvidencePath: docs/05-execution-logs/evidence/task-legacy-done.md
    decision: registered_legacy_unavailable
    rationale: smoke fixture for registered historical evidence debt
    replacementEvidencePath: null
    notDependencyEvidence: true
"@ | Set-Content -LiteralPath $historicalEvidenceDebtPath -Encoding UTF8

    @"
schemaVersion: 1
entries:
  - path: docs/05-execution-logs/evidence/archived-original.md
    archivePath: docs/05-execution-logs/archive/2026-05/evidence/archived-original.md
    kind: evidence
    taskId: task-archived-evidence
    status: archived
"@ | Set-Content -LiteralPath $executionLogIndexPath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add next-action state fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit next-action smoke state fixture."
    }

    $beforeProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $beforeQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $beforeMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash
    $beforeHistoricalEvidenceDebtHash = (Get-FileHash -LiteralPath $historicalEvidenceDebtPath -Algorithm SHA256).Hash
    $beforeExecutionLogIndexHash = (Get-FileHash -LiteralPath $executionLogIndexPath -Algorithm SHA256).Hash

    Push-Location -LiteralPath $repoPath
    try {
        $output = @(
            & $scriptPath `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -MatrixPath $matrixPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
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
    Assert-Contains -Output $output -Pattern '^guardedGoalPacketDecision: not_eligible$'
    Assert-Contains -Output $output -Pattern '^goalPacketEligibleCount: 0$'
    Assert-Contains -Output $output -Pattern '^blockedGates:'
    Assert-Contains -Output $output -Pattern '^validationNeeded: 2 command\(s\) for task-a$'
    Assert-Contains -Output $output -Pattern '^historicalQueueFindings: .*legacy_status_missing=1; legacy_terminal=1; knownBlockedValidation=1; unsupportedStatus=0; notBlockingCurrentRun=true$'
    Assert-Contains -Output $output -Pattern '^historicalEvidenceFindings: missingHistoricalEvidence=1; closureEvidenceRecovered=1; archivedEvidenceRecovered=1; registeredLegacyUnavailableEvidence=1; unregisteredLegacyUnavailableEvidence=1; notBlockingCurrentRun=true$'
    Assert-Contains -Output $output -Pattern '^driftFindings: queueMatrixDrift=matrixBatchMissingInQueue:1,sourcePlanningTaskMissingInQueue:1; notBlockingCurrentRun=true$'
    Assert-NotContains -Output $output -Pattern 'legacy_terminal_first='
    Assert-NotContains -Output $output -Pattern 'missingHistoricalEvidenceFirst='
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
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath `
                -VerboseHistory
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $verboseOutput -Pattern '^historicalQueueFindingsVerbose: .*legacy_status_missing_first=task-missing-status; legacy_terminal_first=task-legacy-done; knownBlockedValidationFirst=task-known-blocked:blocked_validation_failure; unsupportedStatusFirst=none$'
    Assert-Contains -Output $verboseOutput -Pattern '^historicalEvidenceFindingsVerbose: missingHistoricalEvidenceFirst=task-unregistered-debt; closureEvidenceRecoveredFirst=task-closure-evidence; archivedEvidenceRecoveredFirst=task-archived-evidence; registeredLegacyUnavailableEvidenceFirst=task-legacy-done; unregisteredLegacyUnavailableEvidenceFirst=task-unregistered-debt$'
    Assert-Contains -Output $verboseOutput -Pattern '^driftFindingsVerbose: queueMatrixDriftFirst=batch-1000-really-missing,missing-planning-task-b$'

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
                -MatrixPath $matrixPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
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
                -TaskHistoryIndexPath $taskHistoryIndexPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $historyOutput -Pattern '^queueDecision: executable_task_found$'
    Assert-Contains -Output $historyOutput -Pattern '^nextExecutableTask: task-archived-dependency$'
    Assert-Contains -Output $historyOutput -Pattern '^recommendedAction: claim_or_plan_next_task:task-archived-dependency$'
    Assert-Contains -Output $historyOutput -Pattern '^stopReason: none$'

    $localExperienceMatrixPath = Join-Path -Path $stateRoot -ChildPath "local-experience-coverage-matrix.yaml"
    $localExperienceProjectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state-local-experience.yaml"
    $blockedLocalExperienceQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-local-experience-blocked.yaml"
    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: local-experience-closed
  status: closed
  commitSha: $sha
handoff:
  nextRecommendedTask: standard-core-student-local-full-flow-contract-repair
"@ | Set-Content -LiteralPath $localExperienceProjectStatePath -Encoding UTF8

    @"
schemaVersion: 1
rows:
  - useCaseId: UC-STD-ACCOUNT-SESSION
    status: local_experience_ready
    nextTask: standard-core-student-local-full-flow-contract-repair
  - useCaseId: UC-STD-PRACTICE
    status: partial
    nextTask: standard-core-student-local-full-flow-contract-repair
"@ | Set-Content -LiteralPath $localExperienceMatrixPath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: local-experience-closed
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: standard-core-student-local-full-flow-contract-repair
    status: pending
    dependencies:
      - missing-local-experience-dependency
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/student-repair.md
  - id: unrelated-ready-task
    status: pending
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/unrelated-ready-task.md
"@ | Set-Content -LiteralPath $blockedLocalExperienceQueuePath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add blocked local experience fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit blocked local experience fixture."
    }

    Push-Location -LiteralPath $repoPath
    try {
        $blockedLocalExperienceOutput = @(
            & $scriptPath `
                -ProjectStatePath $localExperienceProjectStatePath `
                -QueuePath $blockedLocalExperienceQueuePath `
                -MatrixPath $matrixPath `
                -LocalExperienceMatrixPath $localExperienceMatrixPath `
                -TaskHistoryIndexPath $taskHistoryIndexPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^localExperienceNextTaskDecision: existing_task_available$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^localExperienceCandidateTask: standard-core-student-local-full-flow-contract-repair$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^localExperienceCandidateReady: false$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^localExperienceCandidateBlockedReasons: dependency_missing:missing-local-experience-dependency$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^nextActionDecision: local_experience_task_blocked$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^nextExecutableTask: none$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^recommendedAction: resolve_dependency_or_status_block:standard-core-student-local-full-flow-contract-repair$'
    Assert-Contains -Output $blockedLocalExperienceOutput -Pattern '^stopReason: local_experience_candidate_blocked:dependency_missing:missing-local-experience-dependency$'

    $readyLocalExperienceQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-local-experience-ready.yaml"
    @"
schemaVersion: 1
tasks:
  - id: local-experience-closed
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/completed-a.md
  - id: standard-core-student-local-full-flow-contract-repair
    status: pending
    dependencies: []
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/student-repair.md
"@ | Set-Content -LiteralPath $readyLocalExperienceQueuePath -Encoding UTF8

    & git -C $repoPath add docs | Out-Null
    & git -C $repoPath commit -m "chore(smoke): add ready local experience fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit ready local experience fixture."
    }

    Push-Location -LiteralPath $repoPath
    try {
        $readyLocalExperienceOutput = @(
            & $scriptPath `
                -ProjectStatePath $localExperienceProjectStatePath `
                -QueuePath $readyLocalExperienceQueuePath `
                -MatrixPath $matrixPath `
                -LocalExperienceMatrixPath $localExperienceMatrixPath `
                -TaskHistoryIndexPath $taskHistoryIndexPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $readyLocalExperienceOutput -Pattern '^localExperienceCandidateReady: true$'
    Assert-Contains -Output $readyLocalExperienceOutput -Pattern '^nextActionDecision: local_experience_task_found$'
    Assert-Contains -Output $readyLocalExperienceOutput -Pattern '^nextExecutableTask: standard-core-student-local-full-flow-contract-repair$'
    Assert-Contains -Output $readyLocalExperienceOutput -Pattern '^recommendedAction: claim_or_plan_next_task:standard-core-student-local-full-flow-contract-repair$'

    $missingLocalExperienceMatrixPath = Join-Path -Path $stateRoot -ChildPath "missing-local-experience-coverage-matrix.yaml"
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
                -MatrixPath $seedMatrixPath `
                -LocalExperienceMatrixPath $missingLocalExperienceMatrixPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
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

    $seedHistoryMatrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix-seed-history.yaml"
    $seedHistoryIndexPath = Join-Path -Path $stateRoot -ChildPath "task-history-index-seed-history.yaml"
    @"
schemaVersion: 2
moduleRunVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
sourcePlanningModules:
  - module: authorization-context
    sourcePlanningTask: phase-69-advanced-authorization-context-implementation-planning
    v2ExecutionModule: authorization-and-access
    currentProgress:
      completedBatches:
        - batch-101-authorization-and-access-authorization-read-model-and-display-contrac
        - batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries
  - module: ai-task-domain
    sourcePlanningTask: phase-70-advanced-ai-task-domain-implementation-planning
    v2ExecutionModule: ai-task-and-provider
executionModules:
  - module: authorization-and-access
    sourceModules:
      - authorization-context
    localFullLoopMinimum: L4
    targetLocalClosure:
      - authorization read-model and display contracts
      - personal_auth and org_auth local summaries
  - module: ai-task-and-provider
    sourceModules:
      - ai-task-domain
    dependsOnExecutionModules:
      - authorization-and-access
    localFullLoopMinimum: L2
    targetLocalClosure:
      - provider-agnostic AI task lifecycle contracts
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $seedHistoryMatrixPath -Encoding UTF8

    @"
schemaVersion: 1
entries:
  - id: batch-101-authorization-and-access-authorization-read-model-and-display-contrac
    status: done
    evidencePath: docs/05-execution-logs/evidence/archived-a.md
  - id: batch-102-authorization-and-access-personal-auth-and-org-auth-local-summaries
    status: closed
    evidencePath: docs/05-execution-logs/evidence/archived-a.md
"@ | Set-Content -LiteralPath $seedHistoryIndexPath -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $seedHistoryOutput = @(
            & $scriptPath `
                -ProjectStatePath $seedProjectStatePath `
                -QueuePath $seedQueuePath `
                -MatrixPath $seedHistoryMatrixPath `
                -TaskHistoryIndexPath $seedHistoryIndexPath `
                -LocalExperienceMatrixPath $missingLocalExperienceMatrixPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $seedHistoryOutput -Pattern '^nextActionDecision: seed_proposal_available$'
    Assert-Contains -Output $seedHistoryOutput -Pattern '^seedModule: ai-task-and-provider$'
    Assert-NotContains -Output $seedHistoryOutput -Pattern '^seedModule: authorization-and-access$'

    $bridgeQueuePath = Join-Path -Path $stateRoot -ChildPath "task-queue-bridge.yaml"
    $bridgeMatrixPath = Join-Path -Path $stateRoot -ChildPath "advanced-edition-domain-module-run-matrix-bridge.yaml"
    $bridgeProjectStatePath = Join-Path -Path $stateRoot -ChildPath "project-state-bridge.yaml"
    @"
schemaVersion: 1
tasks:
  - id: bridge-closed
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/bridge-closed.md
  - id: batch-101-smoke-execution-target
    status: closed
    seededExecutionModule: smoke-execution
    targetClosureItem: smoke target
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/bridge-closed.md
  - id: module-run-v2-personal-ai-local-transport-contract-planning
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/bridge-closed.md
  - id: module-run-v2-personal-ai-local-ui-browser-planning
    status: closed
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/bridge-closed.md
"@ | Set-Content -LiteralPath $bridgeQueuePath -Encoding UTF8

    @"
schemaVersion: 2
moduleRunVersion: 2
sourcePlanningModules:
  - module: smoke-source
    sourcePlanningTask: phase-smoke-planning
    v2ExecutionModule: smoke-execution
executionModules:
  - module: smoke-execution
    sourceModules:
      - smoke-source
    localFullLoopMinimum: L2
    targetLocalClosure:
      - smoke target
implementationAutoSeedGate:
  enabled: true
localExperienceClosureGate:
  acceptanceBridgePlan:
    status: proposal_only
    currentPriorityChain: personal-learning-ai-experience
    bridgeSequence:
      - step: local_api_or_server_action_contract
        targetLocalFullLoopGate: L4
        candidateTask: module-run-v2-personal-ai-local-transport-contract-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - src/app/api/v1/**
      - step: local_ui_browser_entry
        targetLocalFullLoopGate: L5
        candidateTask: module-run-v2-personal-ai-local-ui-browser-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - src/app/(student)/**
      - step: local_role_flow_and_e2e_readiness
        targetLocalFullLoopGate: L6
        candidateTask: module-run-v2-cross-role-local-flow-planning
        approvalRequired: localExperienceAcceptanceBridgeApproved
        blockedUntilApproved:
          - role-flow verification
          - e2e/**
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $bridgeMatrixPath -Encoding UTF8

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $sha
  lastKnownOriginMasterSha: $sha
currentTask:
  id: bridge-closed
  status: closed
  commitSha: $sha
"@ | Set-Content -LiteralPath $bridgeProjectStatePath -Encoding UTF8

    Push-Location -LiteralPath $repoPath
    try {
        $bridgeOutput = @(
            & $scriptPath `
                -ProjectStatePath $bridgeProjectStatePath `
                -QueuePath $bridgeQueuePath `
                -MatrixPath $bridgeMatrixPath `
                -LocalExperienceMatrixPath $missingLocalExperienceMatrixPath `
                -ExecutionProfileCatalogPath $executionProfileCatalogPath `
                -HistoricalEvidenceDebtPath $historicalEvidenceDebtPath `
                -ExecutionLogIndexPath $executionLogIndexPath
        )
    } finally {
        Pop-Location
    }

    Assert-Contains -Output $bridgeOutput -Pattern '^nextActionDecision: local_experience_bridge_proposal_available$'
    Assert-Contains -Output $bridgeOutput -Pattern '^seedProposalDecision: no_seed_candidate$'
    Assert-Contains -Output $bridgeOutput -Pattern '^bridgeProposalDecision: proposal_available$'
    Assert-Contains -Output $bridgeOutput -Pattern '^bridgeCandidateTask: module-run-v2-cross-role-local-flow-planning$'
    Assert-Contains -Output $bridgeOutput -Pattern '^bridgeRequiredApproval: localExperienceAcceptanceBridgeApproved$'
    Assert-Contains -Output $bridgeOutput -Pattern '^recommendedHumanDecision: approve_local_experience_bridge_or_keep_paused_or_create_manual_task$'
    Assert-Contains -Output $bridgeOutput -Pattern '^recommendedAction: request_local_experience_bridge_approval:module-run-v2-cross-role-local-flow-planning$'

    $afterProjectHash = (Get-FileHash -LiteralPath $projectStatePath -Algorithm SHA256).Hash
    $afterQueueHash = (Get-FileHash -LiteralPath $queuePath -Algorithm SHA256).Hash
    $afterMatrixHash = (Get-FileHash -LiteralPath $matrixPath -Algorithm SHA256).Hash
    $afterHistoricalEvidenceDebtHash = (Get-FileHash -LiteralPath $historicalEvidenceDebtPath -Algorithm SHA256).Hash
    $afterExecutionLogIndexHash = (Get-FileHash -LiteralPath $executionLogIndexPath -Algorithm SHA256).Hash
    if ($beforeProjectHash -ne $afterProjectHash -or $beforeQueueHash -ne $afterQueueHash -or $beforeMatrixHash -ne $afterMatrixHash -or $beforeHistoricalEvidenceDebtHash -ne $afterHistoricalEvidenceDebtHash -or $beforeExecutionLogIndexHash -ne $afterExecutionLogIndexHash) {
        throw "Get-TikuNextAction smoke expected read-only behavior, but one or more fixture files changed."
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Tiku next-action diagnostic smoke passed"
