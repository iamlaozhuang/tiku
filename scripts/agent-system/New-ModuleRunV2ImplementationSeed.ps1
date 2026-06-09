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
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
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

function New-SeedTaskBlock {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$ModuleId,
        [Parameter(Mandatory = $true)][string]$SourcePlanningTask,
        [Parameter(Mandatory = $true)][string]$TargetClosure,
        [Parameter(Mandatory = $true)][string]$LocalFullLoopGate,
        [Parameter(Mandatory = $true)][string]$ApprovalText
    )

    $safeApprovalText = ConvertTo-YamlScalarText -Text $ApprovalText
    $safeTargetClosure = ConvertTo-YamlScalarText -Text $TargetClosure
    $safeLocalFullLoopGate = if ([string]::IsNullOrWhiteSpace($LocalFullLoopGate)) { "L2" } else { $LocalFullLoopGate }

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
    localExperienceClosureGate: planned
    localFullLoopGate: $safeLocalFullLoopGate
    blockedRemainder: high-risk work remains separately gated
    closeoutPolicy:
      localCommit: not_approved
      fastForwardMerge:
        approved: not_approved
        targetBranch: master
      push:
        approved: not_approved
        target: origin/master
      cleanup:
        deleteShortBranch: not_approved
        parkWorktree: not_approved
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
    validationCommands:
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1 -TaskId $SourcePlanningTask -CandidateTaskId $TaskId
      - npm.cmd run lint
      - npm.cmd run typecheck
      - npm.cmd run test -- --run focused # focused test anchor
      - git diff --check
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId $TaskId
    evidencePath: docs/05-execution-logs/evidence/$TaskId.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/$TaskId.md
    status: pending
    retryCount: 0
"@
}

try {
    Write-Section -Title "Module Run v2 Implementation Seed Transaction"
    Write-Output "seedTransactionMode: $(if ($Apply) { "apply" } else { "plan_only" })"

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

    if ($candidateTaskIds.Count -eq 0 -or $candidateTaskIds.Count -ne $targetClosureItems.Count) {
        Write-Output "HARD_BLOCK_PROPOSAL_CANDIDATE_MISMATCH"
        Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "proposal candidate task list is inconsistent" -ExitCode 1
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
                    -ApprovalText $ApprovalStatement))
    }

    $appendText = "`n" + (($taskBlocks.ToArray()) -join "`n")
    Add-Content -LiteralPath $QueuePath -Value $appendText -Encoding UTF8

    Write-Section -Title "Applied"
    foreach ($candidateTaskId in $candidateTaskIds) {
        Write-Output "seededTask: $candidateTaskId"
    }
    Write-Output "seededTaskCount: $($candidateTaskIds.Count)"
    Write-Output "autoDriveLocalImplementationApproval: recorded"

    Write-SeedTransactionResult -Decision "seeded" -Reason "implementation tasks were appended as pending queue entries" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-SeedTransactionResult -Decision "stop_for_hard_block" -Reason "seed transaction script encountered an error" -ExitCode 1
}
