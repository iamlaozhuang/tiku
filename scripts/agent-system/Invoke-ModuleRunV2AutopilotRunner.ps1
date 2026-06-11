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
    [switch]$SkipPrimaryRepositoryPostureCheck,

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

function Get-YamlScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    if (-not (Test-Path -LiteralPath $Path)) {
        return ""
    }

    foreach ($line in (Get-Content -LiteralPath $Path)) {
        if ($line -match "^\s*$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            $value = $Matches[1].Trim()
            if ($value -match "^(.*?)\s+#.*$") {
                $value = $Matches[1].Trim()
            }
            if (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'"))) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            return $value
        }
    }

    return ""
}

function Resolve-RepositoryPath {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$PathValue
    )

    $trimmedPath = $PathValue.Trim()
    if ([string]::IsNullOrWhiteSpace($trimmedPath)) {
        return ""
    }

    if ([System.IO.Path]::IsPathRooted($trimmedPath)) {
        return $trimmedPath
    }

    return (Join-Path -Path (Get-Location).Path -ChildPath $trimmedPath)
}

function Get-AutoSeedApprovalDecision {
    $decisionPathValue = Get-YamlScalarValue -Path $ProjectStatePath -Key "autoSeedApprovalDecisionPath"
    if ([string]::IsNullOrWhiteSpace($decisionPathValue)) {
        return [pscustomobject]@{
            Configured = $false
            Exists = $false
            Path = ""
            Status = ""
            SeedModule = ""
        }
    }

    $resolvedDecisionPath = Resolve-RepositoryPath -PathValue $decisionPathValue
    if (-not (Test-Path -LiteralPath $resolvedDecisionPath)) {
        return [pscustomobject]@{
            Configured = $true
            Exists = $false
            Path = $resolvedDecisionPath
            Status = "missing"
            SeedModule = ""
        }
    }

    return [pscustomobject]@{
        Configured = $true
        Exists = $true
        Path = $resolvedDecisionPath
        Status = Get-YamlScalarValue -Path $resolvedDecisionPath -Key "status"
        SeedModule = Get-YamlScalarValue -Path $resolvedDecisionPath -Key "seedModule"
    }
}

function Test-AutoSeedDecisionMatchesModule {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Decision,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$SeedModule
    )

    if ([string]::IsNullOrWhiteSpace($Decision.SeedModule)) {
        return $true
    }

    return $Decision.SeedModule -eq $SeedModule
}

function Get-ControlledAutoSeedMaxTasks {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Decision
    )

    if (-not $Decision.Exists) {
        return 4
    }

    $maxTasksValue = Get-YamlScalarValue -Path $Decision.Path -Key "maxTasksPerSeed"
    if ([string]::IsNullOrWhiteSpace($maxTasksValue)) {
        return 4
    }

    $parsedMaxTasks = 0
    if ([int]::TryParse($maxTasksValue, [ref]$parsedMaxTasks) -and $parsedMaxTasks -gt 0) {
        return $parsedMaxTasks
    }

    return 4
}

function Test-ControlledAutoSeedPolicyApprovesModule {
    param(
        [Parameter(Mandatory = $true)]
        [pscustomobject]$Decision,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$SeedModule
    )

    return $Decision.Configured `
        -and $Decision.Exists `
        -and $Decision.Status -eq "approved_by_controlled_auto_seed_policy" `
        -and (Test-AutoSeedDecisionMatchesModule -Decision $Decision -SeedModule $SeedModule)
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

function Invoke-NextActionDiagnostic {
    $nextActionScriptPath = Join-Path -Path $agentSystemRoot -ChildPath "Get-TikuNextAction.ps1"
    if (-not (Test-Path -LiteralPath $nextActionScriptPath)) {
        return [pscustomobject]@{
            Output = @(
                "nextActionDecision: missing_diagnostic_script",
                "diagnosticOnly: true",
                "reason: missing Get-TikuNextAction.ps1"
            )
            ExitCode = 1
        }
    }

    $nextActionArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $nextActionScriptPath,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $nextActionArgs += @("-TaskId", $TaskId)
    }

    return Invoke-ExternalCommand -Arguments $nextActionArgs
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
    if ($SkipPrimaryRepositoryPostureCheck) {
        $startupArgs += "-SkipPrimaryRepositoryPostureCheck"
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
    param(
        [Parameter(Mandatory = $false)]
        [string]$ApprovalStatement = $AutoSeedApprovalStatement
    )

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
        $ApprovalStatement,
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

function Test-StandingAutoSeedApprovalAvailable {
    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        return $false
    }

    $projectStateContent = Get-Content -LiteralPath $ProjectStatePath -Raw
    return (
        $projectStateContent -match "standingUnattendedLocalCloseoutApproval:\s*(?s:.*?)status:\s*approved" `
            -and $projectStateContent -match "autoDriveLocalImplementationApproval" `
            -and $projectStateContent -match "low-risk Module Run v2 local implementation tasks only" `
            -and $projectStateContent -match "High-risk capability gates remain blocked"
    )
}

function Get-StandingAutoSeedApprovalStatement {
    if (-not (Test-StandingAutoSeedApprovalAvailable)) {
        return ""
    }

    return "standingUnattendedLocalCloseoutApproval: User approves Module Run v2 unattended local autodrive for low-risk local implementation tasks only, including task claim, task plan/evidence/audit creation, scoped local implementation, local validation, local commit, fast-forward merge to master, push origin/master, merged short-branch cleanup, and worktree parking, when repository readiness, validation surface, module closeout readiness, pre-push readiness, allowedFiles/blockedFiles, active-owner, lease, registry, hygiene, and remote-divergence gates all pass. High-risk capability gates remain blocked unless separately approved. autoDriveLocalImplementationApproval: state-approved low-risk local implementation seed"
}

function Get-RunnerSeverity {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$NextAction,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$StopTaxonomy,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$SeverityOverride
    )

    if (-not [string]::IsNullOrWhiteSpace($SeverityOverride)) {
        return $SeverityOverride
    }

    switch ($Decision) {
        "no_executable_task" { return "idle" }
        "planned_pause_for_tuning" { return "idle" }
        "exit_active_owner_present" { return "idle" }
        "cleanup_available" { return "auto_recoverable" }
        "seed_proposal_available" { return "approval_required" }
        "seed_transaction_applied" { return "auto_recoverable" }
        "stop_for_manual_decision" { return "approval_required" }
        "manual_required_owner_recovery" { return "approval_required" }
        "stop_for_human_handoff" { return "approval_required" }
        "prepare_next_task" { return "auto_recoverable" }
        "continue_current_task" { return "auto_recoverable" }
        "closeout_recovery" { return "auto_recoverable" }
        "adopt_recoverable_run" { return "auto_recoverable" }
        "open_recovery_plan" { return "auto_recoverable" }
        "prepare_parallel_workers" { return "auto_recoverable" }
        "launch_new_thread" { return "auto_recoverable" }
        "prepare_handoff" { return "auto_recoverable" }
        "prepare_handoff_then_continue" { return "auto_recoverable" }
        default {
            if ($StopTaxonomy -eq "hard_block" -or $Decision -eq "stop_for_hard_block" -or $Decision -eq "iteration_limit_reached") {
                return "hard_block"
            }
            return "advisory"
        }
    }
}

function Get-RunnerHumanRequired {
    param([Parameter(Mandatory = $true)][string]$Severity)

    return ($Severity -in @("approval_required", "hard_block")).ToString().ToLowerInvariant()
}

function Get-RunnerSafeToProceed {
    param([Parameter(Mandatory = $true)][string]$Severity)

    return ($Severity -in @("advisory", "auto_recoverable")).ToString().ToLowerInvariant()
}

function Get-DefaultNextCommand {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$NextAction
    )

    switch ($NextAction) {
        "run_stopped_automation_hygiene_cleanup" { return ".\scripts\agent-system\Test-ModuleRunV2StoppedAutomationHygiene.ps1 -Cleanup" }
        "request_auto_seed_approval" { return ".\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps 1 -AllowAutoSeed -AutoSeedApprovalStatement <autoDriveLocalImplementationApproval statement>" }
        "idle_no_pending_task" { return "none" }
        "leave_active_owner_alone" { return "none" }
        default {
            if ($Decision -eq "stop_for_hard_block") {
                return "inspect runner reason and resolve the hard block before rerun"
            }
            return $NextAction
        }
    }
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
        [string]$NextTask = "",

        [Parameter(Mandatory = $false)]
        [string]$SeverityOverride = "",

        [Parameter(Mandatory = $false)]
        [string]$NextCommandOverride = "",

        [Parameter(Mandatory = $false)]
        [string]$RiskIfAutoContinued = "",

        [Parameter(Mandatory = $false)]
        [string]$StateWritten = "none",

        [Parameter(Mandatory = $false)]
        [string]$NoWriteReason = "runner terminal envelope is stdout-only",

        [Parameter(Mandatory = $false)]
        [string]$ResumePointer = ""
    )

    $stopTaxonomy = Get-RunnerStopTaxonomy -Decision $Decision -NextAction $NextAction -Reason $Reason
    $runnerSeverity = Get-RunnerSeverity -Decision $Decision -NextAction $NextAction -StopTaxonomy $stopTaxonomy -SeverityOverride $SeverityOverride
    $requiresHuman = Get-RunnerHumanRequired -Severity $runnerSeverity
    $safeToProceed = Get-RunnerSafeToProceed -Severity $runnerSeverity
    $nextCommand = if ([string]::IsNullOrWhiteSpace($NextCommandOverride)) {
        Get-DefaultNextCommand -Decision $Decision -NextAction $NextAction
    } else {
        $NextCommandOverride
    }
    $risk = if ([string]::IsNullOrWhiteSpace($RiskIfAutoContinued)) {
        if ($runnerSeverity -eq "hard_block") { "unsafe or impossible to continue until the hard block is resolved" } else { "none" }
    } else {
        $RiskIfAutoContinued
    }
    $resume = if ([string]::IsNullOrWhiteSpace($ResumePointer)) {
        "projectState=$ProjectStatePath; queue=$QueuePath"
    } else {
        $ResumePointer
    }

    Write-Section -Title "Module Run v2 Autopilot Runner"
    Write-Output "runnerDecision: $Decision"
    Write-Output "runnerNextAction: $NextAction"
    if (-not [string]::IsNullOrWhiteSpace($NextTask)) {
        Write-Output "runnerNextTask: $NextTask"
    }
    Write-Output "runnerStepCount: $StepCount"
    Write-Output "stopTaxonomy: $stopTaxonomy"
    Write-Output "runnerSeverity: $runnerSeverity"
    Write-Output "requiresHuman: $requiresHuman"
    Write-Output "safeToProceed: $safeToProceed"
    Write-Output "nextCommand: $nextCommand"
    Write-Output "stateWritten: $StateWritten"
    Write-Output "noWriteReason: $NoWriteReason"
    Write-Output "resumePointer: $resume"
    Write-Output "reason: $Reason"
    Write-Output "Why stopped: $Reason"
    Write-Output "Risk if auto-continued: $risk"
    Write-Output "Next action: $nextCommand"
    Write-Output "local Docker database: task_approval_required"
    Write-Output "project resource read: task_approval_required"
    Write-Output "DeepSeek provider key: env_destination_confirmation_required"
    Write-Output "provider call: blocked_without_task_approval"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-RunnerStopTaxonomy {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$NextAction,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Reason
    )

    if ($Reason -match "registration") { return "registration_mismatch" }
    if ($Reason -match "owner|lease|heartbeat|active run") { return "active_owner" }
    if ($Reason -match "cleanup|hygiene|stale automation artifact") { return "hygiene_deferred" }
    if ($Reason -match "remote") { return "remote_divergence" }
    if ($Reason -match "validation|self-review|autopilot failure|seed transaction did not complete") { return "validation_failed" }
    if ($NextAction -match "closeout") { return "closeout_pending" }

    switch ($Decision) {
        "no_executable_task" { return "no_task" }
        "planned_pause_for_tuning" { return "planned_pause" }
        "exit_active_owner_present" { return "active_owner" }
        "cleanup_available" { return "hygiene_deferred" }
        "seed_proposal_available" { return "approval_missing" }
        "stop_for_manual_decision" { return "approval_missing" }
        "manual_required_owner_recovery" { return "active_owner" }
        "closeout_recovery" { return "closeout_pending" }
        default { return "hard_block" }
    }
}

for ($stepIndex = 1; $stepIndex -le $MaxSteps; $stepIndex++) {
    Write-Section -Title "Runner Step $stepIndex Next Action Diagnostic"
    $nextActionResult = Invoke-NextActionDiagnostic
    $nextActionResult.Output | ForEach-Object { Write-Output $_ }
    $nextActionDecision = Get-DecisionValue -Output $nextActionResult.Output -Key "nextActionDecision"

    if ($nextActionResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($nextActionDecision)) {
        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_next_action_diagnostic_failure" -Reason "next-action diagnostic failed or omitted nextActionDecision" -StepCount $stepIndex -ExitCode 1
    }

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

    if ($startupDecision -eq "planned_pause_for_tuning") {
        Write-RunnerResult -Decision "planned_pause_for_tuning" -NextAction "keep_automation_paused_for_tuning" -Reason "local automation is intentionally paused for mechanism tuning" -StepCount $stepIndex -ExitCode 0
    }

    if ($startupDecision -eq "stop_for_hard_block") {
        Write-RunnerResult -Decision "stop_for_hard_block" -NextAction "report_startup_hard_block" -Reason "startup readiness found a hard block" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "stop_for_manual_decision") {
        Write-RunnerResult -Decision "stop_for_manual_decision" -NextAction "request_manual_decision" -Reason "startup readiness requires manual decision" -StepCount $stepIndex -ExitCode 1
    }

    if ($startupDecision -eq "manual_required_owner_recovery") {
        Write-RunnerResult -Decision "manual_required_owner_recovery" -NextAction "request_owner_recovery" -Reason "startup readiness found a stale dirty owner that requires explicit recovery" -StepCount $stepIndex -ExitCode 1
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
            $autoSeedApprovalDecision = Get-AutoSeedApprovalDecision
            if ($autoSeedApprovalDecision.Configured -and -not $autoSeedApprovalDecision.Exists) {
                Write-RunnerResult `
                    -Decision "stop_for_hard_block" `
                    -NextAction "request_auto_seed_approval" `
                    -Reason "auto-seed approval decision file is configured but missing" `
                    -StepCount $stepIndex `
                    -ExitCode 1 `
                    -NextTask $seedModule `
                    -NextCommandOverride "restore the configured auto-seed approval decision file or record a fresh human decision before rerunning auto-seed" `
                    -RiskIfAutoContinued "seed transaction would run without the configured durable auto-seed approval decision file" `
                    -NoWriteReason "configured auto-seed approval decision file is missing" `
                    -ResumePointer "decisionPath=$($autoSeedApprovalDecision.Path); seedModule=$seedModule; projectState=$ProjectStatePath; queue=$QueuePath"
            }

            if (
                $autoSeedApprovalDecision.Configured -and
                $autoSeedApprovalDecision.Exists -and
                $autoSeedApprovalDecision.Status -eq "pending_human_decision" -and
                (Test-AutoSeedDecisionMatchesModule -Decision $autoSeedApprovalDecision -SeedModule $seedModule)
            ) {
                Write-RunnerResult `
                    -Decision "stop_for_manual_decision" `
                    -NextAction "request_auto_seed_approval" `
                    -Reason "auto-seed approval decision is pending_human_decision for module $seedModule" `
                    -StepCount $stepIndex `
                    -ExitCode 1 `
                    -NextTask $seedModule `
                    -NextCommandOverride "record an approved auto-seed decision or keep automation paused; do not rerun with AllowAutoSeed while status=pending_human_decision" `
                    -RiskIfAutoContinued "seed transaction would bypass the durable pending_human_decision approval gate" `
                    -NoWriteReason "pending_human_decision blocks seed transaction execution" `
                    -ResumePointer "decisionPath=$($autoSeedApprovalDecision.Path); seedModule=$seedModule; projectState=$ProjectStatePath; queue=$QueuePath"
            }

            $controlledAutoSeedPolicyApproved = Test-ControlledAutoSeedPolicyApprovesModule -Decision $autoSeedApprovalDecision -SeedModule $seedModule
            if ($controlledAutoSeedPolicyApproved) {
                $seedCandidateTaskCount = Get-FirstValue -Output $seedProposalResult.Output -Key "seedCandidateTaskCount"
                $maxTasksPerSeed = Get-ControlledAutoSeedMaxTasks -Decision $autoSeedApprovalDecision
                $parsedSeedCandidateTaskCount = 0
                if (-not [int]::TryParse($seedCandidateTaskCount, [ref]$parsedSeedCandidateTaskCount)) {
                    Write-RunnerResult `
                        -Decision "stop_for_hard_block" `
                        -NextAction "report_seed_proposal_failure" `
                        -Reason "controlled auto-seed policy could not read seedCandidateTaskCount" `
                        -StepCount $stepIndex `
                        -ExitCode 1 `
                        -NextTask $seedModule `
                        -RiskIfAutoContinued "seed task limit could not be enforced" `
                        -NoWriteReason "controlled auto-seed policy task-count guard failed" `
                        -ResumePointer "decisionPath=$($autoSeedApprovalDecision.Path); seedModule=$seedModule; projectState=$ProjectStatePath; queue=$QueuePath"
                }
                if ($parsedSeedCandidateTaskCount -gt $maxTasksPerSeed) {
                    Write-RunnerResult `
                        -Decision "stop_for_manual_decision" `
                        -NextAction "request_auto_seed_approval" `
                        -Reason "controlled auto-seed policy allows at most $maxTasksPerSeed task(s), proposal has $parsedSeedCandidateTaskCount" `
                        -StepCount $stepIndex `
                        -ExitCode 1 `
                        -NextTask $seedModule `
                        -NextCommandOverride "record explicit autoDriveLocalImplementationApproval or reduce seed batch size before rerunning" `
                        -RiskIfAutoContinued "seed transaction would exceed controlled auto-seed task limit" `
                        -NoWriteReason "controlled auto-seed maxTasksPerSeed blocks seed transaction execution" `
                        -ResumePointer "decisionPath=$($autoSeedApprovalDecision.Path); seedModule=$seedModule; projectState=$ProjectStatePath; queue=$QueuePath"
                }
                Write-Output "controlledAutoSeedPolicyApproval: recorded"
                Write-Output "controlledAutoSeedPolicy: controlled_auto_seed"
                Write-Output "controlledAutoSeedMaxTasksPerSeed: $maxTasksPerSeed"
            }

            $standingAutoSeedApprovalStatement = Get-StandingAutoSeedApprovalStatement
            $standingAutoSeedAvailable = -not [string]::IsNullOrWhiteSpace($standingAutoSeedApprovalStatement)
            $effectiveAutoSeedApprovalStatement = if (-not [string]::IsNullOrWhiteSpace($AutoSeedApprovalStatement)) {
                $AutoSeedApprovalStatement
            } elseif ($standingAutoSeedAvailable) {
                $standingAutoSeedApprovalStatement
            } elseif ($controlledAutoSeedPolicyApproved) {
                "autoDriveLocalImplementationApproval: controlled_auto_seed policy approved for module $seedModule"
            } else {
                ""
            }
            $effectiveAllowAutoSeed = $AllowAutoSeed -or ($standingAutoSeedAvailable -and -not $PlanOnly) -or ($controlledAutoSeedPolicyApproved -and -not $PlanOnly)

            if ($PlanOnly -or -not $effectiveAllowAutoSeed) {
                $seedProposalSeverity = if (($standingAutoSeedAvailable -or $controlledAutoSeedPolicyApproved) -and $PlanOnly) { "auto_recoverable" } else { "approval_required" }
                $seedProposalNextCommand = if ($controlledAutoSeedPolicyApproved) {
                    ".\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps $MaxSteps"
                } elseif ($standingAutoSeedAvailable) {
                    ".\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps $MaxSteps -AllowAutoSeed -AutoSeedApprovalStatement <standingUnattendedLocalCloseoutApproval statement>"
                } else {
                    ".\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.ps1 -MaxSteps $MaxSteps -AllowAutoSeed -AutoSeedApprovalStatement <autoDriveLocalImplementationApproval statement>"
                }
                $seedProposalRisk = if ($controlledAutoSeedPolicyApproved) {
                    "none for PlanOnly; controlled auto-seed policy allows apply only when the runner is not PlanOnly and guarded checks pass"
                } elseif ($standingAutoSeedAvailable) {
                    "none for PlanOnly; applying the seed writes task-queue and seed evidence only after guarded approval checks pass"
                } else {
                    "queue mutation requires explicit autoDriveLocalImplementationApproval"
                }
                Write-RunnerResult -Decision "seed_proposal_available" -NextAction "request_auto_seed_approval" -Reason "no executable task exists and a guarded seed proposal is available" -StepCount $stepIndex -ExitCode 0 -NextTask $seedModule -SeverityOverride $seedProposalSeverity -NextCommandOverride $seedProposalNextCommand -RiskIfAutoContinued $seedProposalRisk -NoWriteReason "PlanOnly or missing AllowAutoSeed prevents queue mutation" -ResumePointer "seedModule=$seedModule; projectState=$ProjectStatePath; queue=$QueuePath"
            }

            if ([string]::IsNullOrWhiteSpace($effectiveAutoSeedApprovalStatement) -or $effectiveAutoSeedApprovalStatement -notmatch "autoDriveLocalImplementationApproval") {
                Write-RunnerResult -Decision "stop_for_manual_decision" -NextAction "request_auto_seed_approval" -Reason "auto-seed apply requires explicit autoDriveLocalImplementationApproval" -StepCount $stepIndex -ExitCode 1 -NextTask $seedModule
            }

            Write-Section -Title "Runner Step $stepIndex Seed Transaction"
            $seedTransactionResult = Invoke-SeedTransaction -ApprovalStatement $effectiveAutoSeedApprovalStatement
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
