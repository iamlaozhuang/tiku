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

function Initialize-SmokeRepo {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    New-Item -ItemType Directory -Path $Path -Force | Out-Null
    & git -C $Path init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize smoke repository."
    }

    & git -C $Path config user.name "Tiku Smoke"
    & git -C $Path config user.email "tiku-smoke@example.invalid"
    & git -C $Path config core.autocrlf false
    Set-Content -LiteralPath (Join-Path -Path $Path -ChildPath "README.md") -Value "runner smoke baseline" -Encoding UTF8
    & git -C $Path add README.md | Out-Null
    & git -C $Path commit -m "chore(smoke): seed runner fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit smoke repository baseline."
    }

    & git -C $Path branch -M master
    $masterSha = ((& git -C $Path rev-parse HEAD) -join "").Trim()
    & git -C $Path update-ref refs/remotes/origin/master $masterSha
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create smoke origin/master ref."
    }

    & git -C $Path switch -c codex/runner-smoke | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create smoke runner branch."
    }

    New-Item -ItemType Directory -Path (Join-Path -Path $Path -ChildPath "docs/04-agent-system/state") -Force | Out-Null
    return $masterSha
}

function Write-SmokeMatrix {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    @"
schemaVersion: 2
moduleRunVersion: 2
automationHandoffPolicy:
  runner: required
threadRolloverGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-SmokeProjectState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [string]$Sha
    )

    @"
schemaVersion: 1
automation:
  unattendedControl:
    remoteAutomationApproval: lease_guarded_local_readiness_and_planning
repository:
  lastKnownMasterSha: $Sha
  lastKnownOriginMasterSha: $Sha
currentTask:
  id: $TaskId
  commitSha: $Sha
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

$runnerPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2AutopilotRunner.ps1"
if (-not (Test-Path -LiteralPath $runnerPath)) {
    throw "Missing autopilot runner script: $runnerPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autopilot-runner-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $continueRepo = Join-Path -Path $fixtureRoot -ChildPath "continue-repo"
    $continueSha = Initialize-SmokeRepo -Path $continueRepo
    $continueProjectStatePath = Join-Path -Path $continueRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $continueQueuePath = Join-Path -Path $continueRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $continueMatrixPath = Join-Path -Path $continueRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeMatrix -Path $continueMatrixPath
    Write-SmokeProjectState -Path $continueProjectStatePath -TaskId "runner-current" -Sha $continueSha
    @"
schemaVersion: 1
tasks:
  - id: runner-current
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-current.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-current.md
"@ | Set-Content -LiteralPath $continueQueuePath -Encoding UTF8

    Push-Location -LiteralPath $continueRepo
    try {
        $continueOutput = @(
            & $runnerPath `
                -TaskId "runner-current" `
                -ProjectStatePath $continueProjectStatePath `
                -QueuePath $continueQueuePath `
                -MatrixPath $continueMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "handoffs") `
                -SkipUnattendedReadiness `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $continueOutput -Pattern "runnerDecision: continue_current_task"
    Assert-Contains -Output $continueOutput -Pattern "runnerNextAction: agent_continue_current_task"
    Assert-Contains -Output $continueOutput -Pattern "autopilotDecision: continue_current_thread"

    $pendingRepo = Join-Path -Path $fixtureRoot -ChildPath "pending-repo"
    $pendingSha = Initialize-SmokeRepo -Path $pendingRepo
    $pendingProjectStatePath = Join-Path -Path $pendingRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $pendingQueuePath = Join-Path -Path $pendingRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $pendingMatrixPath = Join-Path -Path $pendingRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeMatrix -Path $pendingMatrixPath
    Write-SmokeProjectState -Path $pendingProjectStatePath -TaskId "runner-done" -Sha $pendingSha
    @"
schemaVersion: 1
tasks:
  - id: runner-done
    status: done
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-done.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-done.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-done.md
  - id: runner-next
    status: pending
    taskKind: docs_only
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-next.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-next.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-next.md
"@ | Set-Content -LiteralPath $pendingQueuePath -Encoding UTF8

    Push-Location -LiteralPath $pendingRepo
    try {
        $pendingOutput = @(
            & $runnerPath `
                -TaskId "runner-done" `
                -ProjectStatePath $pendingProjectStatePath `
                -QueuePath $pendingQueuePath `
                -MatrixPath $pendingMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "pending-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "pending-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "pending-handoffs") `
                -SkipUnattendedReadiness `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $pendingOutput -Pattern "runnerDecision: prepare_next_task"
    Assert-Contains -Output $pendingOutput -Pattern "runnerNextTask: runner-next"

    $parallelRepo = Join-Path -Path $fixtureRoot -ChildPath "parallel-repo"
    $parallelSha = Initialize-SmokeRepo -Path $parallelRepo
    $parallelProjectStatePath = Join-Path -Path $parallelRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $parallelQueuePath = Join-Path -Path $parallelRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $parallelMatrixPath = Join-Path -Path $parallelRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeMatrix -Path $parallelMatrixPath
    Write-SmokeProjectState -Path $parallelProjectStatePath -TaskId "coordinator-task" -Sha $parallelSha
    @"
schemaVersion: 1
parallelBatchId: runner-parallel-batch
coordinatorTaskId: coordinator-task
candidateTaskIds:
  - docs-worker-a
  - docs-worker-b
baseSha: $parallelSha
allowedParallelActions:
  - classify_candidates
  - assign_workers
blockedParallelActions:
  - create_thread
  - create_worktree
  - merge
  - push
workerIsolation: required
serialIntegration: required
fileLocks:
  - taskId: docs-worker-a
    branch: codex/docs-worker-a
    allowedFiles:
      - docs/04-agent-system/sop/worker-a.md
    blockedFiles:
      - package.json
    evidencePath: docs/05-execution-logs/evidence/worker-a.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/worker-a.md
  - taskId: docs-worker-b
    branch: codex/docs-worker-b
    allowedFiles:
      - docs/04-agent-system/sop/worker-b.md
    blockedFiles:
      - package.json
    evidencePath: docs/05-execution-logs/evidence/worker-b.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/worker-b.md
mergeOrder:
  - docs-worker-a
  - docs-worker-b
tasks:
  - id: coordinator-task
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/coordinator.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/coordinator.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/coordinator.md
  - id: docs-worker-a
    status: pending
    taskKind: docs_only
    allowedFiles:
      - docs/04-agent-system/sop/worker-a.md
    blockedFiles:
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
  - id: docs-worker-b
    status: pending
    taskKind: docs_only
    allowedFiles:
      - docs/04-agent-system/sop/worker-b.md
    blockedFiles:
      - package.json
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
"@ | Set-Content -LiteralPath $parallelQueuePath -Encoding UTF8

    Push-Location -LiteralPath $parallelRepo
    try {
        $parallelOutput = @(
            & $runnerPath `
                -TaskId "coordinator-task" `
                -ProjectStatePath $parallelProjectStatePath `
                -QueuePath $parallelQueuePath `
                -MatrixPath $parallelMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "parallel-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "parallel-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "parallel-handoffs") `
                -ParallelCandidateTaskIds "docs-worker-a,docs-worker-b" `
                -ParallelCoordinatorTaskId "coordinator-task" `
                -SkipUnattendedReadiness `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $parallelOutput -Pattern "runnerDecision: prepare_parallel_workers"
    Assert-Contains -Output $parallelOutput -Pattern "runnerNextAction: agent_prepare_parallel_workers"
    Assert-Contains -Output $parallelOutput -Pattern "autopilotDecision: prepare_parallel_workers"

    $cleanupRepo = Join-Path -Path $fixtureRoot -ChildPath "cleanup-repo"
    $cleanupWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "cleanup-worktrees"
    $cleanupSha = Initialize-SmokeRepo -Path $cleanupRepo
    New-Item -ItemType Directory -Path $cleanupWorktreeRoot -Force | Out-Null
    $staleWorktreePath = Join-Path -Path $cleanupWorktreeRoot -ChildPath "stale-clean"
    & git -C $cleanupRepo worktree add -b codex/runner-stale-smoke $staleWorktreePath $cleanupSha | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create runner stale worktree fixture."
    }
    Set-Content -LiteralPath (Join-Path -Path $cleanupRepo -ChildPath "README.md") -Value "runner smoke advanced" -Encoding UTF8
    & git -C $cleanupRepo add README.md | Out-Null
    & git -C $cleanupRepo commit -m "chore(smoke): advance runner fixture" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to advance cleanup smoke repository."
    }
    $cleanupHeadSha = ((& git -C $cleanupRepo rev-parse HEAD) -join "").Trim()
    & git -C $cleanupRepo update-ref refs/remotes/origin/master $cleanupHeadSha
    $cleanupProjectStatePath = Join-Path -Path $cleanupRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $cleanupQueuePath = Join-Path -Path $cleanupRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $cleanupMatrixPath = Join-Path -Path $cleanupRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeMatrix -Path $cleanupMatrixPath
    Write-SmokeProjectState -Path $cleanupProjectStatePath -TaskId "cleanup-current" -Sha $cleanupHeadSha
    @"
schemaVersion: 1
tasks:
  - id: cleanup-current
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/cleanup-current.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/cleanup-current.md
"@ | Set-Content -LiteralPath $cleanupQueuePath -Encoding UTF8

    Push-Location -LiteralPath $cleanupRepo
    try {
        $cleanupOutput = @(
            & $runnerPath `
                -TaskId "cleanup-current" `
                -ProjectStatePath $cleanupProjectStatePath `
                -QueuePath $cleanupQueuePath `
                -MatrixPath $cleanupMatrixPath `
                -AutomationWorktreeRoot $cleanupWorktreeRoot `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "cleanup-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "cleanup-handoffs") `
                -SkipUnattendedReadiness `
                -MaxSteps 3
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $cleanupOutput -Pattern "startupDecision: cleanup_stale_artifacts"
    Assert-Contains -Output $cleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    Assert-Contains -Output $cleanupOutput -Pattern "runnerDecision: continue_current_task"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autopilot runner smoke passed"
