param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxSteps = 3,

    [Parameter(Mandatory = $false)]
    [int]$CompletedBatchCount = 0,

    [Parameter(Mandatory = $false)]
    [switch]$ModuleRunCloseout,

    [Parameter(Mandatory = $false)]
    [switch]$ExecutionModuleChanged,

    [Parameter(Mandatory = $false)]
    [switch]$ContextCompaction,

    [Parameter(Mandatory = $false)]
    [switch]$RecoveryAuditPassed,

    [Parameter(Mandatory = $false)]
    [switch]$ThreadLaunchApproved,

    [Parameter(Mandatory = $false)]
    [switch]$ThreadToolAvailable,

    [Parameter(Mandatory = $false)]
    [switch]$SkipUnattendedReadiness,

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch,

    [Parameter(Mandatory = $false)]
    [switch]$DurableHandoff,

    [Parameter(Mandatory = $false)]
    [switch]$PlanOnly,

    [Parameter(Mandatory = $false)]
    [switch]$AllowAutoSeed,

    [Parameter(Mandatory = $false)]
    [string]$AutoSeedApprovalStatement = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 8)]
    [int]$AutoSeedMaxBatchCount = 8,

    [Parameter(Mandatory = $false)]
    [switch]$ContinueAfterAutoSeed,

    [Parameter(Mandatory = $false)]
    [string[]]$ParallelCandidateTaskIds = @(),

    [Parameter(Mandatory = $false)]
    [string]$ParallelCoordinatorTaskId = "",

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
    [string]$LeasePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationWorktreeRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$HandoffRoot = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "no-executable-task-seed-or-approve-next-task",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$HandoffPath = "docs\05-execution-logs\handoffs\2026-06-09-module-run-v2-autopilot-runner-control.md",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutAuthorizationStatement = ""
)

$ErrorActionPreference = "Stop"
$agentSystemRoot = $PSScriptRoot

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Get-DecisionValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-FirstValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Invoke-ExternalCommand {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Arguments
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $commandOutput = @(& powershell.exe @Arguments 2>&1)
        return [pscustomobject]@{
            Output = $commandOutput
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-StartupReadiness {
    $startupArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2AutomationStartupReadiness.ps1"),
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $startupArgs += @("-TaskId", $TaskId)
    }
    if (-not [string]::IsNullOrWhiteSpace($LeasePath)) {
        $startupArgs += @("-LeasePath", $LeasePath)
    }
    if (-not [string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
        $startupArgs += @("-AutomationWorktreeRoot", $AutomationWorktreeRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
        $startupArgs += @("-RunRegistryRoot", $RunRegistryRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($HandoffRoot)) {
        $startupArgs += @("-HandoffRoot", $HandoffRoot)
    }
    if ($AllowProtectedBranch) {
        $startupArgs += "-AllowProtectedBranch"
    }

    return Invoke-ExternalCommand -Arguments $startupArgs
}

function Invoke-StoppedAutomationCleanup {
    $cleanupArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2StoppedAutomationHygiene.ps1"),
        "-Cleanup"
    )

    if (-not [string]::IsNullOrWhiteSpace($LeasePath)) {
        $cleanupArgs += @("-LeasePath", $LeasePath)
    }
    if (-not [string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
        $cleanupArgs += @("-AutomationWorktreeRoot", $AutomationWorktreeRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
        $cleanupArgs += @("-RunRegistryRoot", $RunRegistryRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($HandoffRoot)) {
        $cleanupArgs += @("-HandoffRoot", $HandoffRoot)
    }

    return Invoke-ExternalCommand -Arguments $cleanupArgs
}

function Invoke-AutopilotControl {
    param(
        [Parameter(Mandatory = $false)]
        [switch]$UseCloseoutRecovery
    )

    $autopilotArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2Autopilot.ps1"),
        "-CompletedBatchCount",
        "$CompletedBatchCount",
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath,
        "-NextModuleRunCandidate",
        $NextModuleRunCandidate,
        "-HandoffPath",
        $HandoffPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $autopilotArgs += @("-TaskId", $TaskId)
    }
    if ($ModuleRunCloseout) {
        $autopilotArgs += "-ModuleRunCloseout"
    }
    if ($ExecutionModuleChanged) {
        $autopilotArgs += "-ExecutionModuleChanged"
    }
    if ($ContextCompaction) {
        $autopilotArgs += "-ContextCompaction"
    }
    if ($RecoveryAuditPassed) {
        $autopilotArgs += "-RecoveryAuditPassed"
    }
    if ($ThreadLaunchApproved) {
        $autopilotArgs += "-ThreadLaunchApproved"
    }
    if ($ThreadToolAvailable) {
        $autopilotArgs += "-ThreadToolAvailable"
    }
    if ($SkipUnattendedReadiness) {
        $autopilotArgs += "-SkipUnattendedReadiness"
    }
    if ($AllowProtectedBranch) {
        $autopilotArgs += "-AllowProtectedBranch"
    }
    if ($UseCloseoutRecovery) {
        $autopilotArgs += "-CloseoutRecovery"
    }
    if (-not $DurableHandoff) {
        $autopilotArgs += "-DryRunHandoff"
    }
    if (-not [string]::IsNullOrWhiteSpace($CloseoutAuthorizationStatement)) {
        $autopilotArgs += @("-CloseoutAuthorizationStatement", $CloseoutAuthorizationStatement)
    }
    if ($ParallelCandidateTaskIds.Count -gt 0) {
        $autopilotArgs += @("-ParallelCandidateTaskIds", ($ParallelCandidateTaskIds -join ","))
    }
    if (-not [string]::IsNullOrWhiteSpace($ParallelCoordinatorTaskId)) {
        $autopilotArgs += @("-ParallelCoordinatorTaskId", $ParallelCoordinatorTaskId)
    }

    return Invoke-ExternalCommand -Arguments $autopilotArgs
}

function Invoke-SeedProposal {
    $seedProposalArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Get-ModuleRunV2ImplementationSeedProposal.ps1"),
        "-MaxBatchCount",
        "$AutoSeedMaxBatchCount",
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $seedProposalArgs += @("-TaskId", $TaskId)
    }

    return Invoke-ExternalCommand -Arguments $seedProposalArgs
}

function Invoke-SeedTransaction {
    $seedTransactionArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "New-ModuleRunV2ImplementationSeed.ps1"),
        "-Apply",
        "-MaxBatchCount",
        "$AutoSeedMaxBatchCount",
        "-ApprovalStatement",
        $AutoSeedApprovalStatement,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $seedTransactionArgs += @("-TaskId", $TaskId)
    }

    return Invoke-ExternalCommand -Arguments $seedTransactionArgs
}

function Invoke-SeedSelfReview {
    param([Parameter(Mandatory = $true)][string]$ExpectedModule)

    $seedSelfReviewArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"),
        "-ExpectedModule",
        $ExpectedModule,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )

    return Invoke-ExternalCommand -Arguments $seedSelfReviewArgs
}

function Write-RunnerResult {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Decision,

        [Parameter(Mandatory = $true)]
        [string]$NextAction,

        [Parameter(Mandatory = $true)]
        [string]$Reason,

        [Parameter(Mandatory = $true)]
        [int]$StepCount,

        [Parameter(Mandatory = $true)]
        [int]$ExitCode,

        [Parameter(Mandatory = $false)]
        [string]$NextTask = ""
    )

    Write-Section -Title "Module Run v2 Autopilot Runner"
    Write-Output "runnerDecision: $Decision"
    Write-Output "runnerNextAction: $NextAction"
    if (-not [string]::IsNullOrWhiteSpace($NextTask)) {
        Write-Output "runnerNextTask: $NextTask"
    }
    Write-Output "runnerStepCount: $StepCount"
    Write-Output "reason: $Reason"
    Write-Output "local Docker database: task_approval_required"
    Write-Output "project resource read: task_approval_required"
    Write-Output "DeepSeek provider key: env_destination_confirmation_required"
    Write-Output "provider call: blocked_without_task_approval"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

for ($stepIndex = 1; $stepIndex -le $MaxSteps; $stepIndex++) {
    Write-Section -Title "Runner Step $stepIndex Startup"
    $startupResult = Invoke-StartupReadiness
    $startupResult.Output | ForEach-Object { Write-Output $_ }
    $startupDecision = Get-DecisionValue -Output $startupResult.Output -Key "startupDecision"

    if ([string]::IsNullOrWhiteSpace($startupDecision)) {
        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_startup_readiness_failure" -Reason "startup readiness decision was not readable" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "cleanup_stale_artifacts") {
        if ($PlanOnly) {
            Write-RunnerResult -Decision "cleanup_available" -NextAction "run_stopped_automation_hygiene_cleanup" -Reason "startup readiness found clean stale automation artifacts" -StepCount $stepIndex -ExitCode 0
        }

        Write-Section -Title "Runner Step $stepIndex Cleanup"
        $cleanupResult = Invoke-StoppedAutomationCleanup
        $cleanupResult.Output | ForEach-Object { Write-Output $_ }
        $cleanupDecision = Get-DecisionValue -Output $cleanupResult.Output -Key "stoppedAutomationHygieneDecision"
        if ($cleanupResult.ExitCode -ne 0) {
            Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_cleanup_failure" -Reason "stale automation artifact cleanup failed" -StepCount $stepIndex -ExitCode 1
        }

        if ($cleanupDecision -notin @("cleanup_completed", "cleanup_deferred")) {
            Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_cleanup_failure" -Reason "stale automation artifact cleanup returned unexpected decision: $cleanupDecision" -StepCount $stepIndex -ExitCode 1
        }

        continue
    }

    if ($startupDecision -eq "exit_active_owner_present" -or $startupDecision -eq "stop_existing_run_active") {
        Write-RunnerResult -Decision "exit_active_owner_present" -NextAction "leave_active_owner_alone" -Reason "another healthy run owns the lane" -StepCount $stepIndex -ExitCode 0
    }

    if ($startupDecision -eq "stop_for_hard_block") {
        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_startup_hard_block" -Reason "startup readiness found a hard block" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "stop_for_manual_decision") {
        Write-RunnerResult -Decision "stop_for_manual_decision" -NextAction "request_manual_decision" -Reason "startup readiness requires manual decision" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "no_executable_task") {
        Write-Section -Title "Runner Step $stepIndex Seed Proposal"
        $seedProposalResult = Invoke-SeedProposal
        $seedProposalResult.Output | ForEach-Object { Write-Output $_ }
        $seedProposalDecision = Get-DecisionValue -Output $seedProposalResult.Output -Key "seedProposalDecision"

        if ([string]::IsNullOrWhiteSpace($seedProposalDecision)) {
            Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_seed_proposal_failure" -Reason "seed proposal decision was not readable" -StepCount $stepIndex -ExitCode 1
        }

        if ($seedProposalDecision -eq "proposal_available") {
            $seedModule = Get-FirstValue -Output $seedProposalResult.Output -Key "seedModule"
            if ($PlanOnly -or -not $AllowAutoSeed) {
                Write-RunnerResult -Decision "seed_proposal_available" -NextAction "request_auto_seed_approval" -Reason "no executable task exists and a guarded seed proposal is available" -StepCount $stepIndex -ExitCode 0 -NextTask $seedModule
            }

            if ([string]::IsNullOrWhiteSpace($AutoSeedApprovalStatement) -or $AutoSeedApprovalStatement -notmatch "autoDriveLocalImplementationApproval") {
                Write-RunnerResult -Decision "stop_for_manual_decision" -NextAction "request_auto_seed_approval" -Reason "auto-seed apply requires explicit autoDriveLocalImplementationApproval" -StepCount $stepIndex -ExitCode 1 -NextTask $seedModule
            }

            Write-Section -Title "Runner Step $stepIndex Seed Transaction"
            $seedTransactionResult = Invoke-SeedTransaction
            $seedTransactionResult.Output | ForEach-Object { Write-Output $_ }
            $seedTransactionDecision = Get-DecisionValue -Output $seedTransactionResult.Output -Key "seedTransactionDecision"
            if ($seedTransactionDecision -ne "seeded") {
                if ($seedTransactionDecision -eq "manual_required") {
                    Write-RunnerResult -Decision "stop_for_manual_decision" -NextAction "request_auto_seed_approval" -Reason "seed transaction requires manual approval" -StepCount $stepIndex -ExitCode 1 -NextTask $seedModule
                }
                Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_seed_transaction_failure" -Reason "seed transaction did not complete" -StepCount $stepIndex -ExitCode 1 -NextTask $seedModule
            }

            Write-Section -Title "Runner Step $stepIndex Seed Self Review"
            $seedSelfReviewResult = Invoke-SeedSelfReview -ExpectedModule $seedModule
            $seedSelfReviewResult.Output | ForEach-Object { Write-Output $_ }
            $seedSelfReviewDecision = Get-DecisionValue -Output $seedSelfReviewResult.Output -Key "seedSelfReviewDecision"
            if ($seedSelfReviewDecision -ne "passed") {
                Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_seed_self_review_failure" -Reason "seeded task self-review failed" -StepCount $stepIndex -ExitCode 1 -NextTask $seedModule
            }

            if (-not $ContinueAfterAutoSeed) {
                Write-RunnerResult -Decision "seed_transaction_applied" -NextAction "closeout_auto_seed_transaction" -Reason "auto-seed transaction completed and must be closed out before claiming seeded work" -StepCount $stepIndex -ExitCode 0 -NextTask $seedModule
            }

            continue
        }

        if ($seedProposalDecision -eq "no_seed_candidate") {
            Write-RunnerResult -Decision "no_executable_task" -NextAction "idle_no_pending_task" -Reason "no executable task or seed candidate is available" -StepCount $stepIndex -ExitCode 0
        }

        if ($seedProposalDecision -eq "executable_task_exists") {
            Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_startup_seed_inventory_mismatch" -Reason "seed proposal saw executable work after startup returned no executable task" -StepCount $stepIndex -ExitCode 1
        }

        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_seed_proposal_block" -Reason "seed proposal returned a blocking or unknown decision" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "prepare_next_task") {
        $nextTask = Get-FirstValue -Output $startupResult.Output -Key "pendingTask"
        Write-RunnerResult -Decision "prepare_next_task" -NextAction "agent_claim_next_task" -Reason "startup readiness found a pending task" -StepCount $stepIndex -ExitCode 0 -NextTask $nextTask
    }

    if ($startupDecision -eq "adopt_recoverable_run") {
        Write-RunnerResult -Decision "adopt_recoverable_run" -NextAction "agent_adopt_recoverable_run" -Reason "startup readiness found an adoptable run" -StepCount $stepIndex -ExitCode 0
    }

    if ($startupDecision -eq "open_recovery_plan") {
        Write-RunnerResult -Decision "open_recovery_plan" -NextAction "agent_open_recovery_plan" -Reason "startup readiness found a recoverable run without handoff" -StepCount $stepIndex -ExitCode 0
    }

    if ($startupDecision -eq "continue_current_task" -or $startupDecision -eq "closeout_recovery") {
        if ($PlanOnly) {
            $nextAction = if ($startupDecision -eq "closeout_recovery") { "run_closeout_recovery_autopilot" } else { "run_current_task_autopilot" }
            Write-RunnerResult -Decision $startupDecision -NextAction $nextAction -Reason "startup readiness selected a runnable local control path" -StepCount $stepIndex -ExitCode 0
        }

        Write-Section -Title "Runner Step $stepIndex Autopilot"
        $autopilotResult = Invoke-AutopilotControl -UseCloseoutRecovery:($startupDecision -eq "closeout_recovery")
        $autopilotResult.Output | ForEach-Object { Write-Output $_ }
        $autopilotDecision = Get-DecisionValue -Output $autopilotResult.Output -Key "autopilotDecision"

        if ([string]::IsNullOrWhiteSpace($autopilotDecision)) {
            Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_autopilot_failure" -Reason "autopilot decision was not readable" -StepCount $stepIndex -ExitCode 1
        }

        if ($autopilotDecision -eq "closeout_executed") {
            continue
        }

        if ($autopilotDecision -eq "continue_current_thread") {
            Write-RunnerResult -Decision "continue_current_task" -NextAction "agent_continue_current_task" -Reason "autopilot allows same-thread continuation" -StepCount $stepIndex -ExitCode 0
        }

        if ($autopilotDecision -eq "prepare_parallel_workers") {
            Write-RunnerResult -Decision "prepare_parallel_workers" -NextAction "agent_prepare_parallel_workers" -Reason "parallel readiness approved candidate assignment" -StepCount $stepIndex -ExitCode 0
        }

        if ($autopilotDecision -eq "launch_new_thread") {
            Write-RunnerResult -Decision "launch_new_thread" -NextAction "agent_launch_new_thread" -Reason "thread launch policy approved handoff" -StepCount $stepIndex -ExitCode 0
        }

        if ($autopilotDecision -eq "prepare_handoff" -or $autopilotDecision -eq "prepare_handoff_then_continue") {
            Write-RunnerResult -Decision $autopilotDecision -NextAction "agent_review_or_continue_handoff" -Reason "autopilot prepared a handoff without direct thread launch" -StepCount $stepIndex -ExitCode 0
        }

        if ($autopilotDecision -eq "stop_for_human_handoff") {
            Write-RunnerResult -Decision "stop_for_human_handoff" -NextAction "request_human_handoff" -Reason "autopilot requires human handoff" -StepCount $stepIndex -ExitCode 1
        }

        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_autopilot_block" -Reason "autopilot returned a blocking or unknown decision" -StepCount $stepIndex -ExitCode 1
    }

    Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_unknown_startup_decision" -Reason "startup readiness returned an unknown decision: $startupDecision" -StepCount $stepIndex -ExitCode 1
}

Write-RunnerResult -Decision "iteration_limit_reached" -NextAction "rerun_after_review" -Reason "runner reached MaxSteps without a stable terminal decision" -StepCount $MaxSteps -ExitCode 1
