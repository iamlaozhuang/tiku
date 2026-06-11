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
        throw "Unexpected output pattern found: $Pattern`nMatched output:`n$($matched -join "`n")"
    }
}

function Invoke-SmokeRunnerInChild {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments,

        [Parameter(Mandatory = $false)]
        [int[]]$AllowedExitCodes = @(0)
    )

    $output = @(& powershell.exe @Arguments 2>&1)
    $exitCode = $LASTEXITCODE
    if ($AllowedExitCodes -notcontains $exitCode) {
        throw "Unexpected runner exit code: $exitCode`nActual output:`n$($output -join "`n")"
    }

    return [pscustomobject]@{
        Output = $output
        ExitCode = $exitCode
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

function Write-SmokeSeedMatrix {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    @"
schemaVersion: 2
moduleRunVersion: 2
mode:
  firstEligibleImplementationBatchNumber: 101
automationHandoffPolicy:
  runner: required
threadRolloverGate:
  enabled: true
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
"@ | Set-Content -LiteralPath $Path -Encoding UTF8
}

function Write-SmokeProjectState {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [string]$Sha,

        [Parameter(Mandatory = $false)]
        [switch]$StandingAutoSeedApproval,

        [Parameter(Mandatory = $false)]
        [string]$AutoSeedApprovalDecisionPath = ""
    )

    $standingApprovalBlock = ""
    if ($StandingAutoSeedApproval) {
        $standingApprovalBlock = @"
    standingUnattendedLocalCloseoutApproval:
      status: approved
      approvedAt: "2026-06-10T09:18:00-07:00"
      scope: low-risk Module Run v2 local implementation tasks only
      appliesTo:
        - auto-seeded implementation tasks with autoDriveLocalImplementationApproval
      allowedActions:
        - task_claim
        - task_plan_evidence_audit_creation
        - scoped_local_implementation
        - local_validation
        - local_commit
        - fast_forward_merge_to_master
        - push_origin_master
        - merged_short_branch_cleanup
        - worktree_parking
      statement: >-
        User approves Module Run v2 unattended local autodrive for low-risk local implementation tasks only, including local commit, fast-forward merge to master, push origin/master, merged short-branch cleanup, and worktree parking. High-risk capability gates remain blocked unless separately approved. autoDriveLocalImplementationApproval smoke approval.
"@
    }

    $autoSeedApprovalDecisionPathLine = ""
    if (-not [string]::IsNullOrWhiteSpace($AutoSeedApprovalDecisionPath)) {
        $autoSeedApprovalDecisionPathLine = "  autoSeedApprovalDecisionPath: $AutoSeedApprovalDecisionPath"
    }

    @"
schemaVersion: 1
automation:
$autoSeedApprovalDecisionPathLine
  unattendedControl:
    remoteAutomationApproval: lease_guarded_local_readiness_and_planning
$standingApprovalBlock
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
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $continueOutput -Pattern "runnerDecision: continue_current_task"
    Assert-Contains -Output $continueOutput -Pattern "runnerNextAction: agent_continue_current_task"
    Assert-Contains -Output $continueOutput -Pattern "stopTaxonomy:"
    Assert-Contains -Output $continueOutput -Pattern "autopilotDecision: continue_current_thread"
    Assert-Contains -Output $continueOutput -Pattern "nextActionDecision:"
    Assert-Contains -Output $continueOutput -Pattern "diagnosticOnly: true"

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
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $pendingOutput -Pattern "runnerDecision: prepare_next_task"
    Assert-Contains -Output $pendingOutput -Pattern "runnerNextTask: runner-next"
    Assert-Contains -Output $pendingOutput -Pattern "nextActionDecision:"

    $ownerRecoveryRepo = Join-Path -Path $fixtureRoot -ChildPath "owner-recovery-repo"
    $ownerRecoveryWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "owner-recovery-worktrees"
    $ownerRecoveryRunRoot = Join-Path -Path $fixtureRoot -ChildPath "owner-recovery-runs"
    New-Item -ItemType Directory -Path $ownerRecoveryWorktreeRoot, $ownerRecoveryRunRoot -Force | Out-Null
    $ownerRecoverySha = Initialize-SmokeRepo -Path $ownerRecoveryRepo
    $ownerRecoveryDirtyPath = Join-Path -Path $ownerRecoveryWorktreeRoot -ChildPath "dirty-owner"
    & git -C $ownerRecoveryRepo worktree add -b codex/runner-owner-recovery-smoke $ownerRecoveryDirtyPath $ownerRecoverySha | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create runner owner-recovery dirty worktree fixture."
    }
    Set-Content -LiteralPath (Join-Path -Path $ownerRecoveryDirtyPath -ChildPath "owner-recovery.txt") -Value "dirty owner recovery" -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path -Path $ownerRecoveryDirtyPath -ChildPath "docs/05-execution-logs/evidence"), (Join-Path -Path $ownerRecoveryDirtyPath -ChildPath "docs/05-execution-logs/audits-reviews") -Force | Out-Null
    @"
result: pass
Batch 101:
RED: focused validator failed before implementation.
GREEN: focused unit tests passed, 2 files / 5 tests.
npm.cmd run lint: pass
npm.cmd run typecheck: pass
git diff --check: pass
npm.cmd run test -- --run focused: failed
Broad validation failed because unrelated existing failures were fresh-validation-runner timeouts and phase-8 mistake_book DATABASE_URL requirement.
localFullLoopGate: L4
blocked remainder: high-risk work remains separately gated.
threadRolloverGate: continue current thread.
nextModuleRunCandidate: batch-102.
Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath (Join-Path -Path $ownerRecoveryDirtyPath -ChildPath "docs/05-execution-logs/evidence/runner-owner-recovery.md") -Encoding UTF8
    Set-Content -LiteralPath (Join-Path -Path $ownerRecoveryDirtyPath -ChildPath "docs/05-execution-logs/audits-reviews/runner-owner-recovery.md") -Value "Review status: PENDING" -Encoding UTF8
    $ownerRecoveryProjectStatePath = Join-Path -Path $ownerRecoveryRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $ownerRecoveryQueuePath = Join-Path -Path $ownerRecoveryRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $ownerRecoveryMatrixPath = Join-Path -Path $ownerRecoveryRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeMatrix -Path $ownerRecoveryMatrixPath
    Write-SmokeProjectState -Path $ownerRecoveryProjectStatePath -TaskId "runner-owner-recovery" -Sha $ownerRecoverySha
    @"
schemaVersion: 1
tasks:
  - id: runner-owner-recovery
    status: in_progress
    taskKind: implementation
    moduleRunVersion: 2
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-owner-recovery.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - npm.cmd run lint
      - npm.cmd run typecheck
      - npm.cmd run test -- --run focused # focused test anchor
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-owner-recovery.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-owner-recovery.md
"@ | Set-Content -LiteralPath $ownerRecoveryQueuePath -Encoding UTF8
    @"
{
  "runId": "runner-owner-recovery",
  "automationId": "tiku-module-run-v2-autopilot",
  "threadRole": "interactive",
  "taskId": "runner-owner-recovery",
  "branch": "codex/runner-owner-recovery-smoke",
  "worktreePath": "$($ownerRecoveryDirtyPath.Replace("\", "\\"))",
  "status": "active",
  "heartbeatAtUtc": "2026-06-09T00:00:00Z",
  "phase": "readiness",
  "changedFiles": ["owner-recovery.txt"],
  "lastSafeCheckpoint": "unattended readiness started",
  "nextRecommendedAction": "continue current task after gates pass",
  "safeToAdopt": false,
  "cleanupPolicy": "none",
  "redactedHandoffPath": null
}
"@ | Set-Content -LiteralPath (Join-Path -Path $ownerRecoveryRunRoot -ChildPath "runner-owner-recovery.json") -Encoding UTF8

    Push-Location -LiteralPath $ownerRecoveryRepo
    try {
        $ownerRecoveryOutput = @(
            & $runnerPath `
                -TaskId "runner-owner-recovery" `
                -ProjectStatePath $ownerRecoveryProjectStatePath `
                -QueuePath $ownerRecoveryQueuePath `
                -MatrixPath $ownerRecoveryMatrixPath `
                -AutomationWorktreeRoot $ownerRecoveryWorktreeRoot `
                -RunRegistryRoot $ownerRecoveryRunRoot `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "owner-recovery-handoffs") `
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "startupDecision: manual_required_owner_recovery"
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "runnerDecision: manual_required_owner_recovery"
    Assert-Contains -Output $ownerRecoveryOutput -Pattern "runnerNextAction: request_owner_recovery"

    $seedProposalRepo = Join-Path -Path $fixtureRoot -ChildPath "seed-proposal-repo"
    $seedProposalSha = Initialize-SmokeRepo -Path $seedProposalRepo
    $seedProposalProjectStatePath = Join-Path -Path $seedProposalRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $seedProposalQueuePath = Join-Path -Path $seedProposalRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $seedProposalMatrixPath = Join-Path -Path $seedProposalRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeSeedMatrix -Path $seedProposalMatrixPath
    Write-SmokeProjectState -Path $seedProposalProjectStatePath -TaskId "runner-closed" -Sha $seedProposalSha
    @"
schemaVersion: 1
tasks:
  - id: runner-closed
    status: closed
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-closed.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-closed.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-closed.md
"@ | Set-Content -LiteralPath $seedProposalQueuePath -Encoding UTF8

    Push-Location -LiteralPath $seedProposalRepo
    try {
        $seedProposalOutput = @(
            & $runnerPath `
                -TaskId "runner-closed" `
                -ProjectStatePath $seedProposalProjectStatePath `
                -QueuePath $seedProposalQueuePath `
                -MatrixPath $seedProposalMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-proposal-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-proposal-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-proposal-handoffs") `
                -SkipUnattendedReadiness `
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $seedProposalOutput -Pattern "runnerDecision: seed_proposal_available"
    Assert-Contains -Output $seedProposalOutput -Pattern "runnerNextAction: request_auto_seed_approval"
    Assert-Contains -Output $seedProposalOutput -Pattern "seedProposalDecision: proposal_available"
    Assert-Contains -Output $seedProposalOutput -Pattern "stopTaxonomy: approval_missing"
    Assert-Contains -Output $seedProposalOutput -Pattern "runnerSeverity: approval_required"
    Assert-Contains -Output $seedProposalOutput -Pattern "requiresHuman: true"
    Assert-Contains -Output $seedProposalOutput -Pattern "safeToProceed: false"
    Assert-Contains -Output $seedProposalOutput -Pattern "nextCommand: .*AutoSeedApprovalStatement"
    Assert-Contains -Output $seedProposalOutput -Pattern "stateWritten: none"
    Assert-Contains -Output $seedProposalOutput -Pattern "noWriteReason: PlanOnly or missing AllowAutoSeed prevents queue mutation"
    Assert-Contains -Output $seedProposalOutput -Pattern "Why stopped: no executable task exists and a guarded seed proposal is available"
    Assert-Contains -Output $seedProposalOutput -Pattern "Risk if auto-continued: queue mutation requires explicit autoDriveLocalImplementationApproval"
    Assert-Contains -Output $seedProposalOutput -Pattern "Next action: .*AutoSeedApprovalStatement"
    Assert-NotContains -Output $seedProposalOutput -Pattern "stopTaxonomy: hard_block"

    $pendingSeedDecisionRepo = Join-Path -Path $fixtureRoot -ChildPath "pending-seed-decision-repo"
    $pendingSeedDecisionSha = Initialize-SmokeRepo -Path $pendingSeedDecisionRepo
    $pendingSeedDecisionProjectStatePath = Join-Path -Path $pendingSeedDecisionRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $pendingSeedDecisionQueuePath = Join-Path -Path $pendingSeedDecisionRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $pendingSeedDecisionMatrixPath = Join-Path -Path $pendingSeedDecisionRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    $pendingSeedDecisionPath = Join-Path -Path $pendingSeedDecisionRepo -ChildPath "docs/04-agent-system/state/auto-seed-approval-decision.yaml"
    Write-SmokeSeedMatrix -Path $pendingSeedDecisionMatrixPath
    Write-SmokeProjectState `
        -Path $pendingSeedDecisionProjectStatePath `
        -TaskId "runner-closed" `
        -Sha $pendingSeedDecisionSha `
        -AutoSeedApprovalDecisionPath "docs/04-agent-system/state/auto-seed-approval-decision.yaml"
    @"
schemaVersion: 1
status: pending_human_decision
defaultAction: keep_automation_paused_for_tuning
proposal:
  seedModule: authorization-and-access
  seedRequiredApproval: autoDriveLocalImplementationApproval for module authorization-and-access
"@ | Set-Content -LiteralPath $pendingSeedDecisionPath -Encoding UTF8
    @"
schemaVersion: 1
tasks:
  - id: runner-closed
    status: closed
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-closed.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-closed.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-closed.md
"@ | Set-Content -LiteralPath $pendingSeedDecisionQueuePath -Encoding UTF8

    $pendingSeedDecisionQueueBefore = Get-Content -LiteralPath $pendingSeedDecisionQueuePath -Raw
    Push-Location -LiteralPath $pendingSeedDecisionRepo
    try {
        $pendingSeedDecisionResult = Invoke-SmokeRunnerInChild `
            -Arguments @(
                "-NoProfile",
                "-ExecutionPolicy",
                "Bypass",
                "-File",
                $runnerPath,
                "-TaskId",
                "runner-closed",
                "-ProjectStatePath",
                $pendingSeedDecisionProjectStatePath,
                "-QueuePath",
                $pendingSeedDecisionQueuePath,
                "-MatrixPath",
                $pendingSeedDecisionMatrixPath,
                "-AutomationWorktreeRoot",
                (Join-Path -Path $fixtureRoot -ChildPath "pending-seed-decision-no-worktrees"),
                "-RunRegistryRoot",
                (Join-Path -Path $fixtureRoot -ChildPath "pending-seed-decision-no-runs"),
                "-HandoffRoot",
                (Join-Path -Path $fixtureRoot -ChildPath "pending-seed-decision-handoffs"),
                "-SkipUnattendedReadiness",
                "-SkipPrimaryRepositoryPostureCheck",
                "-AllowAutoSeed",
                "-AutoSeedApprovalStatement",
                "autoDriveLocalImplementationApproval: smoke-approved runner auto-seed",
                "-MaxSteps",
                "2"
            ) `
            -AllowedExitCodes @(1)
    } finally {
        Pop-Location
    }
    $pendingSeedDecisionOutput = $pendingSeedDecisionResult.Output
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "seedProposalDecision: proposal_available"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "runnerDecision: stop_for_manual_decision"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "runnerNextAction: request_auto_seed_approval"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "runnerNextTask: authorization-and-access"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "reason: auto-seed approval decision is pending_human_decision"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "noWriteReason: pending_human_decision blocks seed transaction execution"
    Assert-Contains -Output $pendingSeedDecisionOutput -Pattern "Risk if auto-continued: seed transaction would bypass the durable pending_human_decision approval gate"
    Assert-NotContains -Output $pendingSeedDecisionOutput -Pattern "seedTransactionDecision: seeded"

    $pendingSeedDecisionQueueAfter = Get-Content -LiteralPath $pendingSeedDecisionQueuePath -Raw
    if ($pendingSeedDecisionQueueBefore -ne $pendingSeedDecisionQueueAfter) {
        throw "Pending seed decision gate unexpectedly changed task queue."
    }

    $standingPlanOnlyRepo = Join-Path -Path $fixtureRoot -ChildPath "standing-planonly-repo"
    $standingPlanOnlySha = Initialize-SmokeRepo -Path $standingPlanOnlyRepo
    $standingPlanOnlyProjectStatePath = Join-Path -Path $standingPlanOnlyRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $standingPlanOnlyQueuePath = Join-Path -Path $standingPlanOnlyRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $standingPlanOnlyMatrixPath = Join-Path -Path $standingPlanOnlyRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeSeedMatrix -Path $standingPlanOnlyMatrixPath
    Write-SmokeProjectState -Path $standingPlanOnlyProjectStatePath -TaskId "runner-closed" -Sha $standingPlanOnlySha -StandingAutoSeedApproval
    @"
schemaVersion: 1
tasks:
  - id: runner-closed
    status: closed
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-closed.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-closed.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-closed.md
"@ | Set-Content -LiteralPath $standingPlanOnlyQueuePath -Encoding UTF8

    $standingPlanOnlyQueueBefore = Get-Content -LiteralPath $standingPlanOnlyQueuePath -Raw
    Push-Location -LiteralPath $standingPlanOnlyRepo
    try {
        $standingPlanOnlyOutput = @(
            & $runnerPath `
                -TaskId "runner-closed" `
                -ProjectStatePath $standingPlanOnlyProjectStatePath `
                -QueuePath $standingPlanOnlyQueuePath `
                -MatrixPath $standingPlanOnlyMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-planonly-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-planonly-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-planonly-handoffs") `
                -SkipUnattendedReadiness `
                -SkipPrimaryRepositoryPostureCheck `
                -PlanOnly `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $standingPlanOnlyOutput -Pattern "runnerDecision: seed_proposal_available"
    Assert-Contains -Output $standingPlanOnlyOutput -Pattern "runnerSeverity: auto_recoverable"
    Assert-Contains -Output $standingPlanOnlyOutput -Pattern "safeToProceed: true"
    Assert-Contains -Output $standingPlanOnlyOutput -Pattern "noWriteReason: PlanOnly or missing AllowAutoSeed prevents queue mutation"
    Assert-Contains -Output $standingPlanOnlyOutput -Pattern "nextCommand: .*standingUnattendedLocalCloseoutApproval"

    $standingPlanOnlyQueueAfter = Get-Content -LiteralPath $standingPlanOnlyQueuePath -Raw
    if ($standingPlanOnlyQueueBefore -ne $standingPlanOnlyQueueAfter) {
        throw "Standing PlanOnly seed proposal unexpectedly changed task queue."
    }

    $standingSeedRepo = Join-Path -Path $fixtureRoot -ChildPath "standing-seed-repo"
    $standingSeedSha = Initialize-SmokeRepo -Path $standingSeedRepo
    $standingSeedProjectStatePath = Join-Path -Path $standingSeedRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $standingSeedQueuePath = Join-Path -Path $standingSeedRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $standingSeedMatrixPath = Join-Path -Path $standingSeedRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeSeedMatrix -Path $standingSeedMatrixPath
    Write-SmokeProjectState -Path $standingSeedProjectStatePath -TaskId "runner-closed" -Sha $standingSeedSha -StandingAutoSeedApproval
    @"
schemaVersion: 1
tasks:
  - id: runner-closed
    status: closed
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-closed.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-closed.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-closed.md
"@ | Set-Content -LiteralPath $standingSeedQueuePath -Encoding UTF8

    Push-Location -LiteralPath $standingSeedRepo
    try {
        $standingSeedOutput = @(
            & $runnerPath `
                -TaskId "runner-closed" `
                -ProjectStatePath $standingSeedProjectStatePath `
                -QueuePath $standingSeedQueuePath `
                -MatrixPath $standingSeedMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-seed-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-seed-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "standing-seed-handoffs") `
                -SkipUnattendedReadiness `
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $standingSeedOutput -Pattern "seedProposalDecision: proposal_available"
    Assert-Contains -Output $standingSeedOutput -Pattern "seedTransactionDecision: seeded"
    Assert-Contains -Output $standingSeedOutput -Pattern "standingUnattendedLocalCloseoutApproval: recorded"
    Assert-Contains -Output $standingSeedOutput -Pattern "seedSelfReviewDecision: passed"
    Assert-Contains -Output $standingSeedOutput -Pattern "runnerDecision: seed_transaction_applied"
    Assert-Contains -Output $standingSeedOutput -Pattern "runnerNextAction: closeout_auto_seed_transaction"
    Assert-Contains -Output $standingSeedOutput -Pattern "runnerSeverity: auto_recoverable"

    $standingSeedQueueAfterApply = Get-Content -LiteralPath $standingSeedQueuePath -Raw
    if ($standingSeedQueueAfterApply -notmatch "seededImplementationTask:\s*true" -or $standingSeedQueueAfterApply -notmatch "localCommit:\s*approved") {
        throw "Standing auto-seed did not write approved seeded implementation tasks."
    }

    $seedApplyRepo = Join-Path -Path $fixtureRoot -ChildPath "seed-apply-repo"
    $seedApplySha = Initialize-SmokeRepo -Path $seedApplyRepo
    $seedApplyProjectStatePath = Join-Path -Path $seedApplyRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
    $seedApplyQueuePath = Join-Path -Path $seedApplyRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
    $seedApplyMatrixPath = Join-Path -Path $seedApplyRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    Write-SmokeSeedMatrix -Path $seedApplyMatrixPath
    Write-SmokeProjectState -Path $seedApplyProjectStatePath -TaskId "runner-closed" -Sha $seedApplySha
    @"
schemaVersion: 1
tasks:
  - id: runner-closed
    status: closed
    taskKind: implementation
    allowedFiles:
      - docs/05-execution-logs/evidence/runner-closed.md
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/runner-closed.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/runner-closed.md
"@ | Set-Content -LiteralPath $seedApplyQueuePath -Encoding UTF8

    Push-Location -LiteralPath $seedApplyRepo
    try {
        $seedApplyOutput = @(
            & $runnerPath `
                -TaskId "runner-closed" `
                -ProjectStatePath $seedApplyProjectStatePath `
                -QueuePath $seedApplyQueuePath `
                -MatrixPath $seedApplyMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-apply-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-apply-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-apply-handoffs") `
                -SkipUnattendedReadiness `
                -SkipPrimaryRepositoryPostureCheck `
                -AllowAutoSeed `
                -AutoSeedApprovalStatement "autoDriveLocalImplementationApproval: smoke-approved runner auto-seed" `
                -MaxSteps 3
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $seedApplyOutput -Pattern "seedTransactionDecision: seeded"
    Assert-Contains -Output $seedApplyOutput -Pattern "seedSelfReviewDecision: passed"
    Assert-Contains -Output $seedApplyOutput -Pattern "runnerDecision: seed_transaction_applied"
    Assert-Contains -Output $seedApplyOutput -Pattern "runnerNextAction: closeout_auto_seed_transaction"

    Push-Location -LiteralPath $seedApplyRepo
    try {
        $seedApplyContinueOutput = @(
            & $runnerPath `
                -TaskId "runner-closed" `
                -ProjectStatePath $seedApplyProjectStatePath `
                -QueuePath $seedApplyQueuePath `
                -MatrixPath $seedApplyMatrixPath `
                -AutomationWorktreeRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-continue-no-worktrees") `
                -RunRegistryRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-continue-no-runs") `
                -HandoffRoot (Join-Path -Path $fixtureRoot -ChildPath "seed-continue-handoffs") `
                -SkipUnattendedReadiness `
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 2
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $seedApplyContinueOutput -Pattern "runnerDecision: prepare_next_task"
    Assert-Contains -Output $seedApplyContinueOutput -Pattern "runnerNextAction: agent_claim_next_task"

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
                -SkipPrimaryRepositoryPostureCheck `
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

    $lockedCleanupProcess = Start-Process `
        -FilePath "powershell.exe" `
        -ArgumentList @("-NoProfile", "-Command", "Start-Sleep -Seconds 20") `
        -WorkingDirectory $staleWorktreePath `
        -WindowStyle Hidden `
        -PassThru
    Start-Sleep -Milliseconds 500
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
                -SkipPrimaryRepositoryPostureCheck `
                -MaxSteps 3
        )
    } finally {
        Pop-Location
        if (-not $lockedCleanupProcess.HasExited) {
            Stop-Process -Id $lockedCleanupProcess.Id -Force
            $lockedCleanupProcess.WaitForExit()
        }
    }
    Assert-Contains -Output $cleanupOutput -Pattern "startupDecision: cleanup_stale_artifacts"
    Assert-Contains -Output $cleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_deferred"
    Assert-Contains -Output $cleanupOutput -Pattern "runnerDecision: continue_current_task"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autopilot runner smoke passed"
