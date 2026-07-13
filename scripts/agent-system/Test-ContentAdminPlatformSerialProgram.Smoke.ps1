param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-ContentAdminPlatformSerialProgram.ps1"
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-content-admin-program-guard-" + [guid]::NewGuid().ToString("N"))
$authorizationPath = "authorization.md"
$taskInit = "content-admin-platform-program-init-2026-07-13"
$taskB0 = "content-admin-platform-b0-contract-code-mapping-2026-07-13"
$taskB1 = "content-admin-platform-b1-async-state-primitives-2026-07-13"
$taskB5 = "content-admin-platform-b5-cumulative-audit-2026-07-13"
$taskX1 = "content-admin-platform-x1-valid-ai-paper-test-data-2026-07-13"
$taskX2 = "content-admin-platform-x2-fresh-baseline-defect-repair-2026-07-13"

function Write-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StateText,
        [Parameter(Mandatory = $true)][string]$QueueText,
        [Parameter(Mandatory = $true)][string]$PlanText,
        [Parameter(Mandatory = $true)][string]$EvidenceText,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$AuditText
    )

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $root "state.yaml") -Value $StateText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "queue.yaml") -Value $QueueText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "plan.md") -Value $PlanText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "evidence.md") -Value $EvidenceText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "audit.md") -Value $AuditText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root $authorizationPath) -Value "Status: approved" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "serial-plan.md") -Value $script:baseSerialPlan -Encoding UTF8
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

    $guardFailed = $false
    try {
        $output = Invoke-Guard -Root $Root -ChangedFiles $ChangedFiles
    } catch {
        $guardFailed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)"
        }
    }

    if (-not $guardFailed) {
        throw "Negative guard fixture unexpectedly passed.`n$($output -join "`n")"
    }
}

$orderedList = @"
  orderedTaskIds:
    - $taskInit
    - $taskB0
    - $taskB1
    - $taskB5
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
    $taskB5`: pending
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
    $taskB5`: pending
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
    executionProfile: R3
    focusedGates:
      - focused_script
      - guard
      - scoped_format
      - diff_check
      - module_closeout
      - pre_push
    buildRequired: false
    fullRegressionPolicy: impact_triggered
    protectedDomains:
      - program_order
      - deployment
    reviewMode: independent_audit
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
      - serial-plan.md
      - state.yaml
      - queue.yaml
    blockedFiles:
      - src/**
    capabilities:
      stagingProdDeploy: blocked_requires_fresh_user_approval
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

$baseSerialPlan = @"
# Serial Plan

## Canonical Task Order And Lean v3 Profiles

| Order | Task ID | executionProfile | focusedGates | buildRequired | fullRegressionPolicy | protectedDomains | reviewMode |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 00 | ``$taskInit`` | R3 | focused_script,guard,scoped_format,diff_check,module_closeout,pre_push | false | impact_triggered | program_order,deployment | independent_audit |
| B0 | ``$taskB0`` | R0 | guard,scoped_format,diff_check,link_check | false | skip | program_order,deployment | evidence_two_rounds |
| B1 | ``$taskB1`` | R2 | focused_unit,lint,typecheck,changed_format,diff_check,guard | impact_triggered | impact_triggered | content_lifecycle,a01_a30 | independent_audit |
| B5 | ``$taskB5`` | R2 | full_unit,lint,typecheck,full_format,build,diff_check,guard | true | fixed_node | content_lifecycle,a01_a30 | independent_audit |
"@

try {
    $positiveRoot = Write-CaseFiles -Name "positive" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    $positiveOutput = Invoke-Guard -Root $positiveRoot -ChangedFiles @("plan.md", "evidence.md")
    if (($positiveOutput -join "`n") -notmatch "programGuardResult: pass") {
        throw "Positive fixture did not report pass.`n$($positiveOutput -join "`n")"
    }

    $evidenceReviewFocusedGates = @"
    focusedGates:
      - focused_unit
      - lint
      - typecheck
      - changed_format
      - diff_check
      - guard
"@
    $independentFocusedGates = @"
    focusedGates:
      - focused_script
      - guard
      - scoped_format
      - diff_check
      - module_closeout
      - pre_push
"@
    $evidenceReviewQueue = $baseQueue.Replace("executionProfile: R3", "executionProfile: R1").Replace($independentFocusedGates.TrimEnd(), $evidenceReviewFocusedGates.TrimEnd()).Replace("reviewMode: independent_audit", "reviewMode: evidence_two_rounds")
    $evidenceReviewText = $baseEvidence + @"

## Round 1 — Contract correctness

Pass.

## Round 2 — Regression attack

Pass.
"@
    $evidenceReviewRoot = Write-CaseFiles -Name "evidence-review-positive" -StateText $baseState -QueueText $evidenceReviewQueue -PlanText $basePlan -EvidenceText $evidenceReviewText -AuditText ""
    $evidenceReviewSerialPlan = $baseSerialPlan.Replace("| 00 | ``$taskInit`` | R3 | focused_script,guard,scoped_format,diff_check,module_closeout,pre_push | false | impact_triggered | program_order,deployment | independent_audit |", "| 00 | ``$taskInit`` | R1 | focused_unit,lint,typecheck,changed_format,diff_check,guard | false | impact_triggered | program_order,deployment | evidence_two_rounds |")
    Set-Content -LiteralPath (Join-Path $evidenceReviewRoot "serial-plan.md") -Value $evidenceReviewSerialPlan -Encoding UTF8
    $evidenceReviewOutput = Invoke-Guard -Root $evidenceReviewRoot -ChangedFiles @("plan.md", "evidence.md")
    if (($evidenceReviewOutput -join "`n") -notmatch "programGuardResult: pass") {
        throw "Evidence-review fixture did not report pass.`n$($evidenceReviewOutput -join "`n")"
    }

    $missingEvidenceReviewRoot = Write-CaseFiles -Name "missing-evidence-review" -StateText $baseState -QueueText $evidenceReviewQueue -PlanText $basePlan -EvidenceText ($evidenceReviewText -replace "(?ms)## Round 2.*$", "") -AuditText ""
    Set-Content -LiteralPath (Join-Path $missingEvidenceReviewRoot "serial-plan.md") -Value $evidenceReviewSerialPlan -Encoding UTF8
    Assert-FailsWith -Root $missingEvidenceReviewRoot -ChangedFiles @("evidence.md") -Pattern "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING.*round_2"

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
    Assert-FailsWith -Root $scopeRoot -ChangedFiles @("src/app/page.tsx") -Pattern "PROGRAM_GUARD_BLOCKED_FILES_VIOLATION"

    $sensitiveRoot = Write-CaseFiles -Name "sensitive-content" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Set-Content -LiteralPath (Join-Path $sensitiveRoot "evidence.md") -Value ($baseEvidence + "`nsyntheticToken: " + "sk-" + ("a" * 24)) -Encoding UTF8
    Assert-FailsWith -Root $sensitiveRoot -ChangedFiles @("evidence.md") -Pattern "PROGRAM_GUARD_SENSITIVE_CONTENT_DETECTED"

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

    $reorderedList = @"
  orderedTaskIds:
    - $taskInit
    - $taskB1
    - $taskB0
    - $taskB5
"@
    $reorderedState = $baseState.Replace($orderedList, $reorderedList).Replace("nextTaskId: $taskB0", "nextTaskId: $taskB1")
    $reorderedQueue = $baseQueue.Replace($orderedList, $reorderedList).Replace("nextTaskId: $taskB0", "nextTaskId: $taskB1")
    $reorderedRoot = Write-CaseFiles -Name "silent-reorder" -StateText $reorderedState -QueueText $reorderedQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Assert-FailsWith -Root $reorderedRoot -ChangedFiles @("state.yaml", "queue.yaml") -Pattern "PROGRAM_GUARD_CANONICAL_ORDER_MISMATCH"

    $downgradedFullRoot = Write-CaseFiles -Name "downgraded-full-regression" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Set-Content -LiteralPath (Join-Path $downgradedFullRoot "serial-plan.md") -Value ($baseSerialPlan.Replace("| B5 | ``$taskB5`` | R2 | full_unit,lint,typecheck,full_format,build,diff_check,guard | true | fixed_node |", "| B5 | ``$taskB5`` | R2 | focused_unit,lint,typecheck,changed_format,diff_check,guard | false | impact_triggered |")) -Encoding UTF8
    Assert-FailsWith -Root $downgradedFullRoot -ChangedFiles @("serial-plan.md") -Pattern "PROGRAM_GUARD_FIXED_FULL_REGRESSION_POLICY_INVALID"

    $downgradedFocusedRoot = Write-CaseFiles -Name "downgraded-focused-gates" -StateText $baseState -QueueText $baseQueue -PlanText $basePlan -EvidenceText $baseEvidence -AuditText $baseAudit
    Set-Content -LiteralPath (Join-Path $downgradedFocusedRoot "serial-plan.md") -Value ($baseSerialPlan.Replace("focused_unit,lint,typecheck,changed_format,diff_check,guard", "focused_unit")) -Encoding UTF8
    Assert-FailsWith -Root $downgradedFocusedRoot -ChangedFiles @("serial-plan.md") -Pattern "PROGRAM_GUARD_FOCUSED_GATES_DOWNGRADED"

    Write-Output "Content admin platform serial program guard smoke passed: 2 positive, 13 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
