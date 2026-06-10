param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$RunnerOutputPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxSteps = 3,

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
    [string]$SchemaPath = "docs\04-agent-system\state\autodrive-control-schema.yaml",

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch
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

function Get-CurrentTaskId {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Invoke-ExternalCommand {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

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

function Invoke-RunnerPlan {
    $runnerArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2AutopilotRunner.ps1"),
        "-MaxSteps",
        "$MaxSteps",
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-PlanOnly"
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $runnerArgs += @("-TaskId", $TaskId)
    }
    if ($AllowProtectedBranch) {
        $runnerArgs += "-AllowProtectedBranch"
    }
    if ($ParallelCandidateTaskIds.Count -gt 0) {
        $runnerArgs += @("-ParallelCandidateTaskIds", ($ParallelCandidateTaskIds -join ","))
    }
    if (-not [string]::IsNullOrWhiteSpace($ParallelCoordinatorTaskId)) {
        $runnerArgs += @("-ParallelCoordinatorTaskId", $ParallelCoordinatorTaskId)
    }

    return Invoke-ExternalCommand -Arguments $runnerArgs
}

function Invoke-AutodriveSchemaReadiness {
    param([Parameter(Mandatory = $true)][string]$TargetTaskId)

    $schemaArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2AutodriveSchemaReadiness.ps1"),
        "-TaskId",
        $TargetTaskId,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-SchemaPath",
        $SchemaPath
    )

    return Invoke-ExternalCommand -Arguments $schemaArgs
}

function Write-AgentActionResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$TargetTaskId = "",
        [Parameter(Mandatory = $false)][string]$SeedWorktreePath = ""
    )

    Write-Section -Title "Module Run v2 Agent Action Dispatcher"
    Write-Output "agentActionDecision: $Decision"
    Write-Output "agentAction: $Action"
    if (-not [string]::IsNullOrWhiteSpace($TargetTaskId)) {
        Write-Output "agentActionTask: $TargetTaskId"
    }
    if (-not [string]::IsNullOrWhiteSpace($SeedWorktreePath)) {
        Write-Output "agentActionSeedWorktreePath: $SeedWorktreePath"
    }
    Write-Output "reason: $Reason"
    Write-Output "active owner: leave_alone"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Resolve-SchemaControlledAction {
    param(
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][string]$Reason
    )

    if ([string]::IsNullOrWhiteSpace($TargetTaskId)) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "target task id is missing for $Action" -ExitCode 1
    }

    Write-Section -Title "Schema Readiness For $TargetTaskId"
    $schemaResult = Invoke-AutodriveSchemaReadiness -TargetTaskId $TargetTaskId
    $schemaResult.Output | ForEach-Object { Write-Output $_ }
    $schemaDecision = Get-DecisionValue -Output $schemaResult.Output -Key "autodriveSchemaDecision"

    if ($schemaResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($schemaDecision)) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "autodrive schema readiness failed" -ExitCode 1 -TargetTaskId $TargetTaskId
    }

    if ($schemaDecision -eq "proposal_only") {
        Write-AgentActionResult -Decision "proposal_only" -Action "propose_schema_repair" -Reason "target task is not yet executable by unattended autodrive" -ExitCode 0 -TargetTaskId $TargetTaskId
    }

    if ($schemaDecision -ne "can_autodrive") {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "unknown autodrive schema decision: $schemaDecision" -ExitCode 1 -TargetTaskId $TargetTaskId
    }

    Write-AgentActionResult -Decision "ready" -Action $Action -Reason $Reason -ExitCode 0 -TargetTaskId $TargetTaskId
}

try {
    Write-Section -Title "Module Run v2 Agent Action Dispatcher Input"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "project state is missing" -ExitCode 1
    }
    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "task queue is missing" -ExitCode 1
    }
    if (-not (Test-Path -LiteralPath $SchemaPath)) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "autodrive schema contract is missing" -ExitCode 1
    }

    if (-not [string]::IsNullOrWhiteSpace($RunnerOutputPath)) {
        if (-not (Test-Path -LiteralPath $RunnerOutputPath)) {
            Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "runner output path is missing" -ExitCode 1
        }

        $runnerOutput = @(Get-Content -LiteralPath $RunnerOutputPath)
        $runnerExitCode = 0
        Write-Output "runnerInput: file"
        Write-Output "runnerOutputPath: $RunnerOutputPath"
    } else {
        $runnerResult = Invoke-RunnerPlan
        $runnerOutput = @($runnerResult.Output)
        $runnerExitCode = $runnerResult.ExitCode
        Write-Output "runnerInput: live_plan_only"
    }

    $runnerOutput | ForEach-Object { Write-Output $_ }

    $runnerDecision = Get-DecisionValue -Output $runnerOutput -Key "runnerDecision"
    $runnerNextAction = Get-DecisionValue -Output $runnerOutput -Key "runnerNextAction"
    $runnerNextTask = Get-DecisionValue -Output $runnerOutput -Key "runnerNextTask"
    $seedTransactionRecovery = Get-DecisionValue -Output $runnerOutput -Key "seedTransactionRecovery"
    $seedTransactionWorktreePath = Get-DecisionValue -Output $runnerOutput -Key "seedTransactionWorktreePath"

    Write-Section -Title "Runner Decision"
    Write-Output "runnerDecision: $runnerDecision"
    Write-Output "runnerNextAction: $runnerNextAction"

    if ($runnerExitCode -ne 0 -and $runnerDecision -notin @("stop_for_hard_block", "stop_for_manual_decision", "stop_for_human_handoff", "manual_required_owner_recovery", "iteration_limit_reached")) {
        Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "runner failed without a recognized stop decision" -ExitCode 1
    }

    switch ($runnerDecision) {
        "exit_active_owner_present" {
            Write-AgentActionResult -Decision "idle" -Action "idle_active_owner_present" -Reason "active owner present, guardian should not interfere" -ExitCode 0
        }
        "no_executable_task" {
            Write-AgentActionResult -Decision "idle" -Action "idle_no_executable_task" -Reason "no executable task is available" -ExitCode 0
        }
        "cleanup_available" {
            Write-AgentActionResult -Decision "ready" -Action "run_hygiene_cleanup" -Reason "safe cleanup is available through hygiene gate" -ExitCode 0
        }
        "adopt_recoverable_run" {
            if ($seedTransactionRecovery -eq "ready" -and -not [string]::IsNullOrWhiteSpace($seedTransactionWorktreePath)) {
                Write-AgentActionResult -Decision "ready" -Action "closeout_recoverable_auto_seed_transaction" -Reason "startup found a recoverable auto-seed transaction" -ExitCode 0 -SeedWorktreePath $seedTransactionWorktreePath
            }
            Write-AgentActionResult -Decision "ready" -Action "adopt_recoverable_run" -Reason "startup found an adoptable run" -ExitCode 0
        }
        "open_recovery_plan" {
            Write-AgentActionResult -Decision "ready" -Action "open_recovery_plan" -Reason "startup found a recoverable run without handoff" -ExitCode 0
        }
        "prepare_handoff" {
            Write-AgentActionResult -Decision "ready" -Action "review_handoff" -Reason "handoff is prepared but direct launch is not required" -ExitCode 0
        }
        "prepare_handoff_then_continue" {
            Write-AgentActionResult -Decision "ready" -Action "review_handoff" -Reason "handoff is prepared and continuation remains controlled" -ExitCode 0
        }
        "launch_new_thread" {
            Write-AgentActionResult -Decision "ready" -Action "launch_new_thread" -Reason "thread launch policy approved agent-layer launch" -ExitCode 0
        }
        "prepare_next_task" {
            Resolve-SchemaControlledAction -Action "claim_task" -TargetTaskId $runnerNextTask -Reason "runner found a pending task that is schema-ready"
        }
        "seed_transaction_applied" {
            Write-AgentActionResult -Decision "ready" -Action "closeout_auto_seed_transaction" -Reason "runner applied a seed transaction that must be committed before seeded work is claimed" -ExitCode 0 -TargetTaskId $runnerNextTask
        }
        "continue_current_task" {
            $targetTask = if ([string]::IsNullOrWhiteSpace($TaskId)) { $runnerNextTask } else { $TaskId }
            Resolve-SchemaControlledAction -Action "continue_task" -TargetTaskId $targetTask -Reason "runner allows same-thread continuation and schema is ready"
        }
        "closeout_recovery" {
            $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
            $targetTask = if ([string]::IsNullOrWhiteSpace($TaskId)) { Get-CurrentTaskId -Lines $projectStateLines } else { $TaskId }
            Write-AgentActionResult -Decision "ready" -Action "run_closeout_recovery" -Reason "runner selected bounded closeout recovery before next-task selection" -ExitCode 0 -TargetTaskId $targetTask
        }
        "prepare_parallel_workers" {
            $targetTask = if ([string]::IsNullOrWhiteSpace($ParallelCoordinatorTaskId)) { $TaskId } else { $ParallelCoordinatorTaskId }
            Resolve-SchemaControlledAction -Action "prepare_parallel_workers" -TargetTaskId $targetTask -Reason "runner found parallel candidates and coordinator schema is ready"
        }
        "stop_for_manual_decision" {
            Write-AgentActionResult -Decision "manual_required" -Action "request_manual_decision" -Reason "runner requires a manual decision" -ExitCode 1
        }
        "manual_required_owner_recovery" {
            Write-AgentActionResult -Decision "manual_required" -Action "request_manual_decision" -Reason "runner requires explicit owner recovery before the automation lane can continue" -ExitCode 1
        }
        "stop_for_human_handoff" {
            Write-AgentActionResult -Decision "manual_required" -Action "request_human_handoff" -Reason "runner requires human handoff" -ExitCode 1
        }
        "stop_for_hard_block" {
            Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "runner reported a hard block" -ExitCode 1
        }
        "iteration_limit_reached" {
            Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "runner reached iteration limit" -ExitCode 1
        }
        default {
            Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "unknown runner decision: $runnerDecision" -ExitCode 1
        }
    }
} catch {
    Write-Output "HARD_BLOCK_AGENT_ACTION_DISPATCHER_EXCEPTION $($_.Exception.Message)"
    Write-AgentActionResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "agent action dispatcher script exception" -ExitCode 1
}
