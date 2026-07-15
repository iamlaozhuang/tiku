param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-P0RemediationSerialProgram.ps1"
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p0-remediation-program-" + [guid]::NewGuid().ToString("N"))
$bootstrapTask = "p0-remediation-serial-program-bootstrap-2026-07-14"
$rc01Task = "p0-remediation-rc-01-identity-session-admin-account-2026-07-14"
$freezeTask = "p0-remediation-global-static-regression-baseline-freeze-2026-07-14"
$authorizationPath = "authorization.md"

function Write-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StateText,
        [Parameter(Mandatory = $true)][string]$QueueText,
        [Parameter(Mandatory = $false)][string]$PlanText = $script:basePlan,
        [Parameter(Mandatory = $false)][string]$EvidenceText = $script:baseEvidence,
        [Parameter(Mandatory = $false)][string]$AuditText = $script:baseAudit
    )

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $root "state.yaml") -Value $StateText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "queue.yaml") -Value $QueueText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "serial-plan.md") -Value $PlanText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "task-plan.md") -Value "## SSOT Read List`n`n- docs/01-requirements/00-index.md`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "evidence.md") -Value $EvidenceText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "audit.md") -Value $AuditText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root $authorizationPath) -Value "Status: approved`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "finding-ledger.yaml") -Value "summary:`n  p0Count: 35`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "startup-package.md") -Value "35 P0`n" -Encoding UTF8
    return $root
}

function Invoke-Guard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ChangedFiles
    )

    return @(
        & $guardPath `
            -RepositoryRoot $Root `
            -ProjectStatePath "state.yaml" `
            -QueuePath "queue.yaml" `
            -Phase manual `
            -ChangedFiles $ChangedFiles `
            -SkipGitChecks
    )
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ChangedFiles,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $failed = $false
    try {
        $output = Invoke-Guard -Root $Root -ChangedFiles $ChangedFiles
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)"
        }
    }
    if (-not $failed) {
        throw "Negative P0 Program fixture unexpectedly passed.`n$($output -join "`n")"
    }
}

$orderedList = @"
  orderedTaskIds:
    - $bootstrapTask
    - $rc01Task
    - $freezeTask
"@

$baseState = @"
schemaVersion: 1
p0RemediationSerialProgram:
  programId: p0-remediation-rc-01-to-rc-08-2026-07-14
  status: in_progress
  activityStatePolicy: wip_one_guarded_serial
  baselineSha: 0123456789abcdef0123456789abcdef01234567
  currentTaskId: $bootstrapTask
  nextTaskId: $rc01Task
$orderedList
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  startupPackagePath: startup-package.md
  guardScriptPath: guard.ps1
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  p1P2Remediation:
    approved: false
    status: impact_mapping_only
  taskStatusById:
    $bootstrapTask`: in_progress
    $rc01Task`: pending
    $freezeTask`: pending
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $bootstrapTask
  status: in_progress
standingAuthorization:
  source: $authorizationPath
"@

$baseQueue = @"
schemaVersion: 1
p0RemediationSerialProgram:
  programId: p0-remediation-rc-01-to-rc-08-2026-07-14
  status: in_progress
  activityStatePolicy: wip_one_guarded_serial
  baselineSha: 0123456789abcdef0123456789abcdef01234567
  currentTaskId: $bootstrapTask
  nextTaskId: $rc01Task
$orderedList
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  startupPackagePath: startup-package.md
  guardScriptPath: guard.ps1
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  p1P2Remediation:
    approved: false
    status: impact_mapping_only
  taskStatusById:
    $bootstrapTask`: in_progress
    $rc01Task`: pending
    $freezeTask`: pending
activeTasks:
  - id: $bootstrapTask
    status: in_progress
    taskKind: mechanism_hardening
    executionProfile: R3
    reviewMode: evidence_two_rounds
    planPath: task-plan.md
    evidencePath: evidence.md
    auditReviewPath: audit.md
    allowedFiles:
      - state.yaml
      - queue.yaml
      - task-plan.md
      - evidence.md
      - audit.md
    blockedFiles:
      - src/**
      - tests/**
      - package.json
    capabilities:
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    closeoutPolicy:
      authorizationSource: $authorizationPath
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
  - id: $rc01Task
    status: pending
standingAuthorization:
  source: $authorizationPath
"@

$basePlan = @"
# P0 Serial Plan

| Order | Task ID | Content |
| --- | --- | --- |
| 00 | ``$bootstrapTask`` | bootstrap |
| 01 | ``$rc01Task`` | identity and session |
| 09 | ``$freezeTask`` | static regression and freeze |
"@

$baseEvidence = @"
# Evidence

## Requirement Mapping Result

pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## Round 1 — Root cause and state machine

Pass.

## Round 2 — Approval and recovery

Pass.
"@

$baseAudit = @"
# Audit

## Round 1 — Root cause and state machine

Pass.

## Round 2 — Approval and recovery

Pass.
"@

try {
    New-Item -ItemType File -Path (Join-Path $smokeRoot "guard.ps1") -Force | Out-Null

    $positiveRoot = Write-CaseFiles -Name "positive" -StateText $baseState -QueueText $baseQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $positiveRoot "guard.ps1") -Force
    $positiveOutput = Invoke-Guard -Root $positiveRoot -ChangedFiles @("state.yaml", "queue.yaml")
    if (($positiveOutput -join "`n") -notmatch "p0ProgramGuardResult: pass") {
        throw "Positive P0 Program fixture did not report pass.`n$($positiveOutput -join "`n")"
    }

    $readyState = $baseState.Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: ready_for_closeout").Replace("status: in_progress`nstandingAuthorization:", "status: ready_for_closeout`nstandingAuthorization:")
    $readyQueue = $baseQueue.Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: ready_for_closeout").Replace("  - id: $bootstrapTask`n    status: in_progress", "  - id: $bootstrapTask`n    status: ready_for_closeout")
    $readyRoot = Write-CaseFiles -Name "ready-positive" -StateText $readyState -QueueText $readyQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $readyRoot "guard.ps1") -Force
    $readyOutput = Invoke-Guard -Root $readyRoot -ChangedFiles @("evidence.md")
    if (($readyOutput -join "`n") -notmatch "p0ProgramGuardResult: pass") {
        throw "Ready-for-closeout P0 fixture did not report pass.`n$($readyOutput -join "`n")"
    }

    $reordered = @"
  orderedTaskIds:
    - $bootstrapTask
    - $freezeTask
    - $rc01Task
"@
    $reorderedState = $baseState.Replace($orderedList, $reordered).Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask")
    $reorderedQueue = $baseQueue.Replace($orderedList, $reordered).Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask")
    $reorderedRoot = Write-CaseFiles -Name "reordered" -StateText $reorderedState -QueueText $reorderedQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $reorderedRoot "guard.ps1") -Force
    Assert-FailsWith -Root $reorderedRoot -ChangedFiles @("state.yaml", "queue.yaml") -Pattern "P0_PROGRAM_CANONICAL_ORDER_MISMATCH"

    $multiState = $baseState.Replace("$rc01Task`: pending", "$rc01Task`: in_progress")
    $multiQueue = $baseQueue.Replace("$rc01Task`: pending", "$rc01Task`: in_progress").Replace("  - id: $rc01Task`n    status: pending", "  - id: $rc01Task`n    status: in_progress")
    $multiRoot = Write-CaseFiles -Name "multi-wip" -StateText $multiState -QueueText $multiQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $multiRoot "guard.ps1") -Force
    Assert-FailsWith -Root $multiRoot -ChangedFiles @("state.yaml") -Pattern "P0_PROGRAM_MULTIPLE_ACTIVE_TASKS"

    $queueOnlyWip = $baseQueue.Replace("  - id: $rc01Task`n    status: pending", "  - id: $rc01Task`n    status: in_progress")
    $queueOnlyWipRoot = Write-CaseFiles -Name "queue-only-wip" -StateText $baseState -QueueText $queueOnlyWip
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $queueOnlyWipRoot "guard.ps1") -Force
    Assert-FailsWith -Root $queueOnlyWipRoot -ChangedFiles @("queue.yaml") -Pattern "P0_PROGRAM_NEXT_TASK_STATUS_INVALID"

    $skipState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $rc01Task").Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask").Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: pending").Replace("$rc01Task`: pending", "$rc01Task`: in_progress").Replace("  id: $bootstrapTask", "  id: $rc01Task")
    $skipQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $rc01Task").Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask").Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: pending").Replace("$rc01Task`: pending", "$rc01Task`: in_progress").Replace("  - id: $bootstrapTask", "  - id: $rc01Task")
    $skipRoot = Write-CaseFiles -Name "skip" -StateText $skipState -QueueText $skipQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $skipRoot "guard.ps1") -Force
    Assert-FailsWith -Root $skipRoot -ChangedFiles @("state.yaml") -Pattern "P0_PROGRAM_SKIPPED_TASK"

    $closedBootstrap = @"
  completedTaskIds:
    - $bootstrapTask
"@
    $checkpointState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $rc01Task").Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask").Replace("  completedTaskIds: []", $closedBootstrap.TrimEnd()).Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: closed").Replace("$rc01Task`: pending", "$rc01Task`: in_progress").Replace("  id: $bootstrapTask", "  id: $rc01Task")
    $checkpointQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $rc01Task").Replace("nextTaskId: $rc01Task", "nextTaskId: $freezeTask").Replace("  completedTaskIds: []", $closedBootstrap.TrimEnd()).Replace("$bootstrapTask`: in_progress", "$bootstrapTask`: closed").Replace("$rc01Task`: pending", "$rc01Task`: in_progress").Replace("  - id: $bootstrapTask", "  - id: $rc01Task")
    $checkpointRoot = Write-CaseFiles -Name "checkpoint" -StateText $checkpointState -QueueText $checkpointQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $checkpointRoot "guard.ps1") -Force
    Assert-FailsWith -Root $checkpointRoot -ChangedFiles @("state.yaml") -Pattern "P0_PROGRAM_PREVIOUS_CLOSEOUT_INCOMPLETE"

    $scopeRoot = Write-CaseFiles -Name "scope" -StateText $baseState -QueueText $baseQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $scopeRoot "guard.ps1") -Force
    Assert-FailsWith -Root $scopeRoot -ChangedFiles @("src/app/page.tsx") -Pattern "P0_PROGRAM_BLOCKED_FILES_VIOLATION"

    $deploymentState = $baseState.Replace("approved: false", "approved: true")
    $deploymentRoot = Write-CaseFiles -Name "deployment" -StateText $deploymentState -QueueText $baseQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $deploymentRoot "guard.ps1") -Force
    Assert-FailsWith -Root $deploymentRoot -ChangedFiles @("state.yaml") -Pattern "P0_PROGRAM_DEPLOYMENT_AUTO_AUTHORIZED"

    $approvalQueue = $baseQueue.Replace("target: origin/master", "target: origin/other")
    $approvalRoot = Write-CaseFiles -Name "approval" -StateText $baseState -QueueText $approvalQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $approvalRoot "guard.ps1") -Force
    Assert-FailsWith -Root $approvalRoot -ChangedFiles @("queue.yaml") -Pattern "P0_PROGRAM_CLOSEOUT_POLICY_INVALID.*push"

    $schemaApprovalQueue = $baseQueue.Replace("schemaMigration: blocked_without_fresh_approval", "schemaMigration: approved_local_dev")
    $schemaApprovalRoot = Write-CaseFiles -Name "schema-approval" -StateText $baseState -QueueText $schemaApprovalQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $schemaApprovalRoot "guard.ps1") -Force
    Assert-FailsWith -Root $schemaApprovalRoot -ChangedFiles @("queue.yaml") -Pattern "P0_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING.*schemaMigration"

    $missingArtifactRoot = Write-CaseFiles -Name "missing-artifact" -StateText $baseState -QueueText $baseQueue
    Copy-Item -LiteralPath (Join-Path $smokeRoot "guard.ps1") -Destination (Join-Path $missingArtifactRoot "guard.ps1") -Force
    Remove-Item -LiteralPath (Join-Path $missingArtifactRoot "finding-ledger.yaml")
    Assert-FailsWith -Root $missingArtifactRoot -ChangedFiles @("state.yaml") -Pattern "P0_PROGRAM_ARTIFACT_MISSING.*finding_ledger"

    Write-Output "P0 remediation serial program guard smoke passed: 2 positive, 9 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
