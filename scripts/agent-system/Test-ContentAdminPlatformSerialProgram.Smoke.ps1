param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-ContentAdminPlatformSerialProgram.ps1"
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-content-admin-program-guard-" + [guid]::NewGuid().ToString("N"))
$authorizationPath = "authorization.md"
$taskInit = "content-admin-platform-program-init-2026-07-13"
$taskB0 = "content-admin-platform-b0-contract-code-mapping-2026-07-13"
$taskB1 = "content-admin-platform-b1-async-state-primitives-2026-07-13"
$taskX1 = "content-admin-platform-x1-valid-ai-paper-test-data-2026-07-13"
$taskX2 = "content-admin-platform-x2-fresh-baseline-defect-repair-2026-07-13"

function Write-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StateText,
        [Parameter(Mandatory = $true)][string]$QueueText,
        [Parameter(Mandatory = $true)][string]$PlanText,
        [Parameter(Mandatory = $true)][string]$EvidenceText,
        [Parameter(Mandatory = $true)][string]$AuditText
    )

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $root "state.yaml") -Value $StateText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "queue.yaml") -Value $QueueText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "plan.md") -Value $PlanText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "evidence.md") -Value $EvidenceText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "audit.md") -Value $AuditText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root $authorizationPath) -Value "Status: approved" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "serial-plan.md") -Value "$taskInit`n$taskB0`n$taskB1" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "coverage-ledger.md") -Value "PIC-01 through PIC-13" -Encoding UTF8
    return $root
}

function Invoke-Guard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string[]]$ChangedFiles
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
        [Parameter(Mandatory = $true)][string[]]$ChangedFiles,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    try {
        $output = Invoke-Guard -Root $Root -ChangedFiles $ChangedFiles
        throw "Expected guard failure '$Pattern', but it passed.`n$($output -join "`n")"
    } catch {
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)"
        }
    }
}

$orderedList = @"
  orderedTaskIds:
    - $taskInit
    - $taskB0
    - $taskB1
"@

$baseState = @"
schemaVersion: 1
contentAdminPlatformSerialProgram:
  programId: content-admin-platform-b-to-f-2026-07-13
  status: in_progress
  baselineSha: 0123456789abcdef0123456789abcdef01234567
  currentTaskId: $taskInit
  nextTaskId: $taskB0
$orderedList
  completedTaskIds: []
  lastClosedTaskId: ""
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  coverageLedgerPath: coverage-ledger.md
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $taskInit`: in_progress
    $taskB0`: pending
    $taskB1`: pending
  closeoutCheckpoints:
    $taskInit`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
  conditionalTasks:
    x1:
      taskId: $taskX1
      conditionSatisfied: false
      status: pending
    x2:
      taskId: $taskX2
      conditionSatisfied: false
      status: pending
currentTask:
  id: $taskInit
  status: in_progress
"@

$baseQueue = @"
schemaVersion: 1
contentAdminPlatformSerialProgram:
  programId: content-admin-platform-b-to-f-2026-07-13
  status: in_progress
  baselineSha: 0123456789abcdef0123456789abcdef01234567
  currentTaskId: $taskInit
  nextTaskId: $taskB0
$orderedList
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $taskInit`: in_progress
    $taskB0`: pending
    $taskB1`: pending
  conditionalTasks:
    x1:
      taskId: $taskX1
      conditionSatisfied: false
      status: pending
    x2:
      taskId: $taskX2
      conditionSatisfied: false
      status: pending
activeTasks:
  - id: $taskInit
    status: in_progress
    planPath: plan.md
    evidencePath: evidence.md
    auditReviewPath: audit.md
    requiredReadingProfiles:
      - advanced_authorization
      - ai_generation
    allowedFiles:
      - plan.md
      - evidence.md
      - audit.md
      - state.yaml
      - queue.yaml
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
"@

$basePlan = @"
# Plan

## SSOT Read List

- AGENTS.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/03-standards/code-taste-ten-commandments.md
- docs/02-architecture/adr/
- docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md
- docs/01-requirements/00-index.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md
- docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md
- docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md
"@

$baseEvidence = @"
# Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
"@

$baseAudit = @"
# Audit

## Round 1 — State bypass

Pass.

## Round 2 — Scope drift

Pass.
"@

try {
    $positiveRoot = Write-CaseFiles -Name "positive" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    $positiveOutput = Invoke-Guard -Root $positiveRoot -ChangedFiles @("plan.md", "evidence.md")
    if (($positiveOutput -join "`n") -notmatch "programGuardResult: pass") {
        throw "Positive fixture did not report pass.`n$($positiveOutput -join "`n")"
    }

    $skipState = $baseState.Replace("currentTaskId: $taskInit", "currentTaskId: $taskB1").Replace("nextTaskId: $taskB0", "nextTaskId: ").Replace("$taskInit`: in_progress", "$taskInit`: pending").Replace("$taskB1`: pending", "$taskB1`: in_progress")
    $skipQueue = $baseQueue.Replace("currentTaskId: $taskInit", "currentTaskId: $taskB1").Replace("nextTaskId: $taskB0", "nextTaskId: ").Replace("$taskInit`: in_progress", "$taskInit`: pending").Replace("$taskB1`: pending", "$taskB1`: in_progress")
    $skipRoot = Write-CaseFiles -Name "skip-task" -StateText $skipState -QueueText $skipQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $skipRoot -ChangedFiles @("plan.md") -Pattern "PROGRAM_GUARD_SKIPPED_TASK"

    $closedCheckpoint = @"
  completedTaskIds:
    - $taskInit
  lastClosedTaskId: $taskInit
"@
    $unpublishedState = $baseState.Replace("  currentTaskId: $taskInit", "  currentTaskId: $taskB0").Replace("  nextTaskId: $taskB0", "  nextTaskId: $taskB1").Replace("  completedTaskIds: []`n  lastClosedTaskId: `"`"", $closedCheckpoint.TrimEnd()).Replace("    $taskInit`: in_progress", "    $taskInit`: closed").Replace("    $taskB0`: pending", "    $taskB0`: claimed").Replace("      taskCommit: pending", "      taskCommit: pass").Replace("      masterMerge: pending", "      masterMerge: pass")
    $unpublishedQueue = $baseQueue.Replace("  currentTaskId: $taskInit", "  currentTaskId: $taskB0").Replace("  nextTaskId: $taskB0", "  nextTaskId: $taskB1").Replace("  completedTaskIds: []", "  completedTaskIds:`n    - $taskInit").Replace("    $taskInit`: in_progress", "    $taskInit`: closed").Replace("    $taskB0`: pending", "    $taskB0`: claimed")
    $unpublishedRoot = Write-CaseFiles -Name "unpublished" -StateText $unpublishedState -QueueText $unpublishedQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $unpublishedRoot -ChangedFiles @("state.yaml") -Pattern "PROGRAM_GUARD_PREVIOUS_CLOSEOUT_INCOMPLETE.*originMasterSync"

    $missingReviewRoot = Write-CaseFiles -Name "missing-review" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText ($baseAudit -replace "(?ms)## Round 2.*$", "")
    Assert-FailsWith -Root $missingReviewRoot -ChangedFiles @("audit.md") -Pattern "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING.*round_2"

    $scopeRoot = Write-CaseFiles -Name "scope" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $scopeRoot -ChangedFiles @("src/app/page.tsx") -Pattern "PROGRAM_GUARD_ALLOWED_FILES_VIOLATION"

    $missingReadingRoot = Write-CaseFiles -Name "missing-reading" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText ($baseEvidence.Replace("targetTestsReviewed: true", "targetTestsReviewed: false")) -AuditText $baseAudit
    Assert-FailsWith -Root $missingReadingRoot -ChangedFiles @("evidence.md") -Pattern "PROGRAM_GUARD_READING_EVIDENCE_INCOMPLETE.*targetTestsReviewed: true"

    $deploymentState = $baseState.Replace("approved: false", "approved: true")
    $deploymentRoot = Write-CaseFiles -Name "deployment" -StateText $deploymentState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $deploymentRoot -ChangedFiles @("state.yaml") -Pattern "PROGRAM_GUARD_DEPLOYMENT_AUTO_AUTHORIZED"

    $x1State = $baseState.Replace("taskId: $taskX1`n      conditionSatisfied: false`n      status: pending", "taskId: $taskX1`n      conditionSatisfied: false`n      status: claimed")
    $x1Root = Write-CaseFiles -Name "x1" -StateText $x1State -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $x1Root -ChangedFiles @("state.yaml") -Pattern "PROGRAM_GUARD_CONDITIONAL_TASK_STARTED_WITHOUT_TRIGGER.*x1"

    $invalidStatusState = $baseState.Replace("$taskInit`: in_progress", "$taskInit`: running")
    $invalidStatusQueue = $baseQueue.Replace("$taskInit`: in_progress", "$taskInit`: running")
    $invalidStatusRoot = Write-CaseFiles -Name "invalid-status" -StateText $invalidStatusState -QueueText $invalidStatusQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $invalidStatusRoot -ChangedFiles @("state.yaml") -Pattern "PROGRAM_GUARD_UNSUPPORTED_STATUS"

    Write-Output "Content admin platform serial program guard smoke passed: 1 positive, 8 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
