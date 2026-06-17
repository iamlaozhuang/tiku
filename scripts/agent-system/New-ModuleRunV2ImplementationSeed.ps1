param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 8)]
    [int]$MaxBatchCount = 8,

    [Parameter(Mandatory = $false)]
    [string]$ApprovalStatement = "",

    [Parameter(Mandatory = $false)]
    [switch]$Apply,

    [Parameter(Mandatory = $false)]
    [switch]$SkipSeedExecutionLog,

    [Parameter(Mandatory = $false)]
    [string]$SeedEvidencePath = "",

    [Parameter(Mandatory = $false)]
    [string]$SeedAuditReviewPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ExecutionProfileCatalogPath = "docs\04-agent-system\state\execution-profiles.yaml"
)

$ErrorActionPreference = "Stop"
$agentSystemRoot = $PSScriptRoot

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-SeedTransactionResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "seedTransactionDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-DecisionValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-AllValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+)\s*$") {
            $values.Add($Matches[1].Trim())
        }
    }

    return $values.ToArray()
}

function Test-QueueContainsTask {
    param(
        [Parameter(Mandatory = $true)][string]$QueueContent,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    return $QueueContent -match "(?m)^\s+- id:\s*$([regex]::Escape($TaskId))\s*$"
}

function ConvertTo-YamlScalarText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    $singleLine = ($Text -replace "\r?\n", " ").Trim()
    if ([string]::IsNullOrWhiteSpace($singleLine)) {
        return "not provided"
    }

    return $singleLine
}

function New-YamlListBlock {
    param(
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Values,
        [Parameter(Mandatory = $false)][int]$Indent = 4
    )

    $baseIndent = " " * $Indent
    $itemIndent = " " * ($Indent + 2)
    $lines = New-Object System.Collections.Generic.List[string]
    $lines.Add("${baseIndent}${Key}:")

    $safeValues = @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($safeValues.Count -eq 0) {
        $safeValues = @("not provided")
    }

    foreach ($value in $safeValues) {
        $lines.Add("$itemIndent- $(ConvertTo-YamlScalarText -Text $value)")
    }

    return ($lines.ToArray()) -join "`n"
}

function New-SeedTaskBlock {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$ModuleId,
        [Parameter(Mandatory = $true)][string]$SourcePlanningTask,
        [Parameter(Mandatory = $true)][string]$TargetClosure,
        [Parameter(Mandatory = $true)][string]$LocalFullLoopGate,
        [Parameter(Mandatory = $true)][string]$ApprovalText,
        [Parameter(Mandatory = $true)][string]$RequirementRef,
        [Parameter(Mandatory = $true)][string]$UseCase,
        [Parameter(Mandatory = $true)][string]$AcceptanceScenario,
        [Parameter(Mandatory = $true)][string]$BehaviorBoundary,
        [Parameter(Mandatory = $true)][string]$NonGoal,
        [Parameter(Mandatory = $true)][string]$ValidationProfile,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$BlockedRemainderItems,
        [Parameter(Mandatory = $true)][string]$ExecutionProfileCatalogPath,
        [Parameter(Mandatory = $false)][bool]$StandingCloseoutApproved = $false
    )

    $safeApprovalText = ConvertTo-YamlScalarText -Text $ApprovalText
    $safeTargetClosure = ConvertTo-YamlScalarText -Text $TargetClosure
    $safeLocalFullLoopGate = if ([string]::IsNullOrWhiteSpace($LocalFullLoopGate)) { "L2" } else { $LocalFullLoopGate }
    $safeBehaviorBoundary = ConvertTo-YamlScalarText -Text $BehaviorBoundary
    $safeValidationProfile = ConvertTo-YamlScalarText -Text $ValidationProfile
    $safeExecutionProfileCatalogPath = ConvertTo-YamlScalarText -Text ($ExecutionProfileCatalogPath.Replace("\", "/"))
    $localCommitApproval = if ($StandingCloseoutApproved) { "approved" } else { "not_approved" }
    $closeoutBooleanApproval = if ($StandingCloseoutApproved) { "true" } else { "not_approved" }
    $requirementRefsBlock = New-YamlListBlock -Key "requirementRefs" -Values @($RequirementRef)
    $useCasesBlock = New-YamlListBlock -Key "useCases" -Values @($UseCase)
    $acceptanceScenariosBlock = New-YamlListBlock -Key "acceptanceScenarios" -Values @($AcceptanceScenario)
    $nonGoalsBlock = New-YamlListBlock -Key "nonGoals" -Values @($NonGoal)
    $blockedRemainderBlock = New-YamlListBlock -Key "blockedRemainder" -Values $BlockedRemainderItems

    return @"
  - id: $TaskId
    title: Module Run v2 $ModuleId implementation seed
    phase: $TaskId
    sourceStory: module-run-v2-auto-seed-bridge
    dependencies:
      - $SourcePlanningTask
    taskPlanPolicy: required_before_edit
    humanApproval: >-
      $safeApprovalText
    autoDriveLocalImplementationApproval: >-
      $safeApprovalText
    seededByTask: $SourcePlanningTask
    seededImplementationTask: true
    seededExecutionModule: $ModuleId
    targetClosureItem: $safeTargetClosure
    behaviorBoundary: $safeBehaviorBoundary
$requirementRefsBlock
$useCasesBlock
$acceptanceScenariosBlock
$nonGoalsBlock
    validationProfile: $safeValidationProfile
    profileCatalogRef: $safeExecutionProfileCatalogPath
    executionProfile: local_unit_tdd
    evidenceMode: full
    validationPolicy: local_unit
    queueSelectionMode: ready_set
    localExperienceClosureGate: planned
    localFullLoopGate: $safeLocalFullLoopGate
$blockedRemainderBlock
    closeoutPolicy:
      localCommit: $localCommitApproval
      fastForwardMerge:
        approved: $closeoutBooleanApproval
        targetBranch: master
      push:
        approved: $closeoutBooleanApproval
        target: origin/master
      cleanup:
        deleteShortBranch: $closeoutBooleanApproval
        parkWorktree: $closeoutBooleanApproval
    autodrivePolicy:
      mode: guarded_serial
      allowedAgentActions:
        - claim_task
        - continue_task
        - scaffold_task_plan
        - run_validation
        - write_evidence
      blockedAgentActions:
        - merge
        - push
        - pr
        - deploy
        - dependency_change
        - schema_migration
        - env_secret
        - provider_call
        - cost_calibration_gate
      maxAutonomousSteps: 5
      stopOn:
        - hard_block
        - blocked_gate
        - validation_failure
        - out_of_scope_change
        - dirty_unknown_worktree
        - active_owner_present
    capabilities:
      localDockerDatabase: task_approval_required
      destructiveLocalDockerDatabase: blocked_without_task_approval
      projectResourceRead: task_approval_required
      providerKey: env_destination_confirmation_required
      providerCall: blocked_without_task_approval
      schemaMigration: blocked_without_task_approval
      costCalibrationGate: blocked
    registryLifecycle:
      runStatus: active
      cleanupPolicy: none
      redactionRequired: true
    taskKind: implementation
    moduleRunVersion: 2
    allowedFiles:
      - src/server/models/**
      - src/server/contracts/**
      - src/server/validators/**
      - src/server/services/**
      - docs/04-agent-system/state/project-state.yaml
      - docs/04-agent-system/state/task-queue.yaml
      - docs/05-execution-logs/task-plans/**
      - docs/05-execution-logs/evidence/**
      - docs/05-execution-logs/audits-reviews/**
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
      - local_validation
      - evidence_redaction
      - automation_policy
    validationCommandLifecycle:
      - phase: pre_edit
        command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId $SourcePlanningTask -CandidateTaskId $TaskId
      - phase: post_edit
        command: npm.cmd run lint
      - phase: post_edit
        command: npm.cmd run typecheck
      - phase: post_edit
        command: git diff --check
      - phase: advisory_baseline
        command: npm.cmd run test -- --run focused # focused test anchor
      - phase: closeout
        command: powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId $TaskId
    validationCommands:
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId $SourcePlanningTask -CandidateTaskId $TaskId
      - npm.cmd run lint
      - npm.cmd run typecheck
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId $TaskId
    evidencePath: docs/05-execution-logs/evidence/$TaskId.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/$TaskId.md
    status: pending
    retryCount: 0
"@
}

function ConvertTo-SafeSlug {
    param([Parameter(Mandatory = $true)][string]$Text)

    $slug = ($Text.ToLowerInvariant() -replace "[^a-z0-9-]+", "-").Trim("-")
    if ([string]::IsNullOrWhiteSpace($slug)) {
        return "unknown-module"
    }

    return $slug
}

function Write-SeedExecutionLogs {
    param(
        [Parameter(Mandatory = $true)][string]$ModuleId,
        [Parameter(Mandatory = $true)][string]$SourcePlanningTask,
        [Parameter(Mandatory = $true)][string[]]$CandidateTaskIds,
        [Parameter(Mandatory = $true)][string[]]$TargetClosureItems,
        [Parameter(Mandatory = $true)][string]$ApprovalText
    )

    if ($SkipSeedExecutionLog) {
        return [pscustomobject]@{
            EvidencePath = ""
            AuditReviewPath = ""
        }
    }

    $datePrefix = Get-Date -Format "yyyy-MM-dd"
    $moduleSlug = ConvertTo-SafeSlug -Text $ModuleId
    if ([string]::IsNullOrWhiteSpace($SeedEvidencePath)) {
        $SeedEvidencePath = "docs\05-execution-logs\evidence\$datePrefix-module-run-v2-auto-seed-$moduleSlug.md"
    }
    if ([string]::IsNullOrWhiteSpace($SeedAuditReviewPath)) {
        $SeedAuditReviewPath = "docs\05-execution-logs\audits-reviews\$datePrefix-module-run-v2-auto-seed-$moduleSlug.md"
    }

    $evidenceDirectory = Split-Path -Path $SeedEvidencePath -Parent
    $auditDirectory = Split-Path -Path $SeedAuditReviewPath -Parent
    if (-not [string]::IsNullOrWhiteSpace($evidenceDirectory)) {
        New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null
    }
    if (-not [string]::IsNullOrWhiteSpace($auditDirectory)) {
        New-Item -ItemType Directory -Force -Path $auditDirectory | Out-Null
    }

    $candidateLines = New-Object System.Collections.Generic.List[string]
    for ($index = 0; $index -lt $CandidateTaskIds.Count; $index++) {
        $targetClosure = if ($index -lt $TargetClosureItems.Count) { $TargetClosureItems[$index] } else { "unspecified" }
        $candidateLines.Add("- ``$($CandidateTaskIds[$index])``: $targetClosure")
    }

    $safeApprovalText = ConvertTo-YamlScalarText -Text $ApprovalText
    $standingCloseoutApproved = $ApprovalText -match "standingUnattendedLocalCloseoutApproval" `
        -and $ApprovalText -match "low-risk local implementation tasks only" `
        -and $ApprovalText -match "High-risk capability gates remain blocked"
    $candidateText = ($candidateLines.ToArray()) -join "`n"
    $evidenceContent = @"
# Module Run v2 Auto-Seed Evidence: $ModuleId

## Summary

The auto-seed transaction appended guarded pending implementation tasks for ``$ModuleId``.

## Source

- sourcePlanningTask: ``$SourcePlanningTask``
- approvalAnchor: ``autoDriveLocalImplementationApproval``
- standingCloseoutApproval: ``$(if ($standingCloseoutApproved) { "recorded" } else { "not_recorded" })``
- approvalStatement: $safeApprovalText

## Seeded Tasks

$candidateText

## Boundary

- Cost Calibration Gate remains blocked.
- Local Docker database use remains task_approval_required.
- Project resource reads remain task_approval_required.
- Provider calls remain blocked_without_task_approval.
- Schema migration remains blocked_without_task_approval.

## Closeout Requirement

This seed transaction must be committed and integrated before any seeded implementation task is claimed.
Seeded implementation task closeout is approved only when ``standingCloseoutApproval`` is ``recorded`` and all readiness,
validation, pre-push, scope, lease, registry, hygiene, and remote-divergence gates pass.
"@

    $auditContent = @"
# Module Run v2 Auto-Seed Audit Review: $ModuleId

## Decision

Passed for guarded queue seeding.

## Checks

- ``autoDriveLocalImplementationApproval`` is recorded.
- ``standingUnattendedLocalCloseoutApproval`` is recorded only when task closeoutPolicy is generated as approved.
- Seeded tasks are pending implementation tasks.
- High-risk capabilities remain blocked or task-specific.
- Cost Calibration Gate remains blocked.
- Seed transaction must close out before seeded implementation work starts.
"@

    Set-Content -LiteralPath $SeedEvidencePath -Value $evidenceContent -Encoding UTF8
    Set-Content -LiteralPath $SeedAuditReviewPath -Value $auditContent -Encoding UTF8

    return [pscustomobject]@{
        EvidencePath = $SeedEvidencePath
        AuditReviewPath = $SeedAuditReviewPath
    }
}

function Write-SeededTaskExecutionLogTemplates {
    param(
        [Parameter(Mandatory = $true)][string]$ModuleId,
        [Parameter(Mandatory = $true)][string]$SourcePlanningTask,
        [Parameter(Mandatory = $true)][string[]]$CandidateTaskIds,
        [Parameter(Mandatory = $true)][string[]]$TargetClosureItems,
        [Parameter(Mandatory = $true)][string]$LocalFullLoopGate
    )

    for ($index = 0; $index -lt $CandidateTaskIds.Count; $index++) {
        $candidateTaskId = $CandidateTaskIds[$index]
        $targetClosure = if ($index -lt $TargetClosureItems.Count) { $TargetClosureItems[$index] } else { "unspecified" }
        $evidencePath = "docs\05-execution-logs\evidence\$candidateTaskId.md"
        $auditReviewPath = "docs\05-execution-logs\audits-reviews\$candidateTaskId.md"

        $evidenceDirectory = Split-Path -Path $evidencePath -Parent
        $auditDirectory = Split-Path -Path $auditReviewPath -Parent
        New-Item -ItemType Directory -Force -Path $evidenceDirectory | Out-Null
        New-Item -ItemType Directory -Force -Path $auditDirectory | Out-Null

        $templateLocalFullLoopGate = if ([string]::IsNullOrWhiteSpace($LocalFullLoopGate)) { "L2" } else { $LocalFullLoopGate }
        $evidenceContent = @"
# Module Run v2 Seeded Task Evidence: $candidateTaskId

result: pending

## Summary

- module: $ModuleId
- sourcePlanningTask: $SourcePlanningTask
- targetClosureItem: $targetClosure
- moduleRunVersion: 2

## Required Anchors

- Batch range: pending
- RED: pending
- GREEN: pending
- Commit: pending
- localFullLoopGate: $templateLocalFullLoopGate pending
- threadRolloverGate: pending
- nextModuleRunCandidate: pending
- blocked remainder: high-risk gates remain separately blocked.
- Cost Calibration Gate remains blocked.

## Validation

Pending implementation and local validation.
"@

        $auditContent = @"
# Module Run v2 Seeded Task Audit Review: $candidateTaskId

## Decision

Pending implementation and closeout review.

## Checks

- RED/GREEN evidence must replace pending placeholders before closeout.
- Commit evidence must replace pending placeholder before closeout.
- localFullLoopGate, threadRolloverGate, and nextModuleRunCandidate decisions are required.
- Cost Calibration Gate remains blocked.
"@

        Set-Content -LiteralPath $evidencePath -Value $evidenceContent -Encoding UTF8
        Set-Content -LiteralPath $auditReviewPath -Value $auditContent -Encoding UTF8
        Write-Output "seededTaskEvidenceTemplate: $evidencePath"
        Write-Output "seededTaskAuditTemplate: $auditReviewPath"
    }
}

try {
    Write-Section -Title "Module Run v2 Implementation Seed Transaction"
    Write-Output "seedTransactionMode: $(if ($Apply) { "apply" } else { "plan_only" })"
    Write-Output "executionProfileCatalogPath: $ExecutionProfileCatalogPath"
    Write-Output "executionProfileCatalog: $(if (Test-Path -LiteralPath $ExecutionProfileCatalogPath -PathType Leaf) { "present" } else { "missing_legacy_defaults" })"

    $proposalScriptPath = Join-Path -Path $agentSystemRoot -ChildPath "Get-ModuleRunV2ImplementationSeedProposal.ps1"
    if (-not (Test-Path -LiteralPath $proposalScriptPath)) {
        Write-Output "HARD_BLOCK_MISSING_PROPOSAL_SCRIPT $proposalScriptPath"
        Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "proposal script is missing" -ExitCode 1
    }

    $proposalOutput = @(
        & $proposalScriptPath `
            -TaskId $TaskId `
            -MaxBatchCount $MaxBatchCount `
            -ProjectStatePath $ProjectStatePath `
            -QueuePath $QueuePath `
            -MatrixPath $MatrixPath
    )
    $proposalOutput | ForEach-Object { Write-Output $_ }
    $proposalDecision = Get-DecisionValue -Output $proposalOutput -Key "seedProposalDecision"
    if ($proposalDecision -ne "proposal_available") {
        Write-SeedTransactionResult -Decision $proposalDecision -Reason "seed transaction cannot run without an available proposal" -ExitCode 0
    }

    $moduleId = Get-DecisionValue -Output $proposalOutput -Key "seedModule"
    $sourcePlanningTask = Get-DecisionValue -Output $proposalOutput -Key "seedSourcePlanningTask"
    $localFullLoopGate = Get-DecisionValue -Output $proposalOutput -Key "seedLocalFullLoopMinimum"
    $candidateTaskIds = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateTask")
    $targetClosureItems = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateTargetClosure")
    $requirementRefs = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateRequirementRef")
    $useCases = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateUseCase")
    $acceptanceScenarios = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateAcceptanceScenario")
    $behaviorBoundaries = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateBehaviorBoundary")
    $nonGoals = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateNonGoal")
    $validationProfiles = @(Get-AllValues -Output $proposalOutput -Key "seedCandidateValidationProfile")
    $blockedRemainderItems = @(Get-AllValues -Output $proposalOutput -Key "seedBlockedRemainder" | Where-Object { $_ -ne "none" })
    if ($blockedRemainderItems.Count -eq 0) {
        $blockedRemainderItems = @("none")
    }

    if ($candidateTaskIds.Count -eq 0 -or $candidateTaskIds.Count -ne $targetClosureItems.Count) {
        Write-Output "HARD_BLOCK_PROPOSAL_CANDIDATE_MISMATCH"
        Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "proposal candidate task list is inconsistent" -ExitCode 1
    }
    $metadataLists = @(
        [pscustomobject]@{ Name = "seedCandidateRequirementRef"; Values = $requirementRefs },
        [pscustomobject]@{ Name = "seedCandidateUseCase"; Values = $useCases },
        [pscustomobject]@{ Name = "seedCandidateAcceptanceScenario"; Values = $acceptanceScenarios },
        [pscustomobject]@{ Name = "seedCandidateBehaviorBoundary"; Values = $behaviorBoundaries },
        [pscustomobject]@{ Name = "seedCandidateNonGoal"; Values = $nonGoals },
        [pscustomobject]@{ Name = "seedCandidateValidationProfile"; Values = $validationProfiles }
    )
    foreach ($metadataList in $metadataLists) {
        if (@($metadataList.Values).Count -ne $candidateTaskIds.Count) {
            Write-Output "HARD_BLOCK_PROPOSAL_MECE_METADATA_MISMATCH"
            Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "$($metadataList.Name) list is inconsistent" -ExitCode 1
        }
    }

    Write-Section -Title "Transaction Candidate"
    Write-Output "seedModule: $moduleId"
    Write-Output "seedSourcePlanningTask: $sourcePlanningTask"
    Write-Output "seedCandidateTaskCount: $($candidateTaskIds.Count)"
    foreach ($candidateTaskId in $candidateTaskIds) {
        Write-Output "seedCandidateTask: $candidateTaskId"
    }

    if (-not $Apply) {
        Write-SeedTransactionResult -Decision "plan_only" -Reason "seed transaction proposal is ready but was not applied" -ExitCode 0
    }

    if ([string]::IsNullOrWhiteSpace($ApprovalStatement) -or $ApprovalStatement -notmatch "autoDriveLocalImplementationApproval") {
        Write-Output "MANUAL_DECISION_MISSING_AUTODRIVE_SEED_APPROVAL"
        Write-SeedTransactionResult -Decision "manual_required" -Reason "apply mode requires explicit autoDriveLocalImplementationApproval" -ExitCode 1
    }
    $standingCloseoutApproved = $ApprovalStatement -match "standingUnattendedLocalCloseoutApproval" `
        -and $ApprovalStatement -match "low-risk local implementation tasks only" `
        -and $ApprovalStatement -match "local commit" `
        -and $ApprovalStatement -match "fast-forward merge to master" `
        -and $ApprovalStatement -match "push origin/master" `
        -and $ApprovalStatement -match "merged short-branch cleanup" `
        -and $ApprovalStatement -match "worktree parking" `
        -and $ApprovalStatement -match "High-risk capability gates remain blocked"

    $queueContent = Get-Content -LiteralPath $QueuePath -Raw
    foreach ($candidateTaskId in $candidateTaskIds) {
        if (Test-QueueContainsTask -QueueContent $queueContent -TaskId $candidateTaskId) {
            Write-Output "HARD_BLOCK_SEED_TASK_ALREADY_EXISTS $candidateTaskId"
            Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "candidate task id already exists" -ExitCode 1
        }
    }

    $taskBlocks = New-Object System.Collections.Generic.List[string]
    for ($index = 0; $index -lt $candidateTaskIds.Count; $index++) {
        $taskBlocks.Add((New-SeedTaskBlock `
                    -TaskId $candidateTaskIds[$index] `
                    -ModuleId $moduleId `
                    -SourcePlanningTask $sourcePlanningTask `
                    -TargetClosure $targetClosureItems[$index] `
                    -LocalFullLoopGate $localFullLoopGate `
                    -ApprovalText $ApprovalStatement `
                    -RequirementRef $requirementRefs[$index] `
                    -UseCase $useCases[$index] `
                    -AcceptanceScenario $acceptanceScenarios[$index] `
                    -BehaviorBoundary $behaviorBoundaries[$index] `
                    -NonGoal $nonGoals[$index] `
                    -ValidationProfile $validationProfiles[$index] `
                    -BlockedRemainderItems $blockedRemainderItems `
                    -ExecutionProfileCatalogPath $ExecutionProfileCatalogPath `
                    -StandingCloseoutApproved $standingCloseoutApproved))
    }

    $appendText = "`n" + (($taskBlocks.ToArray()) -join "`n")
    Add-Content -LiteralPath $QueuePath -Value $appendText -Encoding UTF8
    $executionLogs = Write-SeedExecutionLogs `
        -ModuleId $moduleId `
        -SourcePlanningTask $sourcePlanningTask `
        -CandidateTaskIds $candidateTaskIds `
        -TargetClosureItems $targetClosureItems `
        -ApprovalText $ApprovalStatement
    Write-SeededTaskExecutionLogTemplates `
        -ModuleId $moduleId `
        -SourcePlanningTask $sourcePlanningTask `
        -CandidateTaskIds $candidateTaskIds `
        -TargetClosureItems $targetClosureItems `
        -LocalFullLoopGate $localFullLoopGate

    Write-Section -Title "Applied"
    foreach ($candidateTaskId in $candidateTaskIds) {
        Write-Output "seededTask: $candidateTaskId"
    }
    Write-Output "seededTaskCount: $($candidateTaskIds.Count)"
    Write-Output "autoDriveLocalImplementationApproval: recorded"
    Write-Output "standingUnattendedLocalCloseoutApproval: $(if ($standingCloseoutApproved) { "recorded" } else { "not_recorded" })"
    if (-not [string]::IsNullOrWhiteSpace($executionLogs.EvidencePath)) {
        Write-Output "seedEvidencePath: $($executionLogs.EvidencePath)"
    }
    if (-not [string]::IsNullOrWhiteSpace($executionLogs.AuditReviewPath)) {
        Write-Output "seedAuditReviewPath: $($executionLogs.AuditReviewPath)"
    }

    Write-SeedTransactionResult -Decision "seeded" -Reason "implementation tasks were appended as pending queue entries" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "seed transaction script encountered an error" -ExitCode 1
}
