param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

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
    [string]$AutomationRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$OnDemandAutomationRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationWorktreeRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$HandoffRoot = ""
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Get-OutputValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Invoke-DiagnosticScript {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][string[]]$Arguments = @()
    )

    if (-not (Test-Path -LiteralPath $ScriptPath)) {
        return [pscustomobject]@{
            Output = @("diagnosticScriptMissing: $ScriptPath")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $ScriptPath @Arguments 2>&1)
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Write-ToolSummary {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][object]$Result,
        [Parameter(Mandatory = $true)][string[]]$Keys
    )

    Write-Section -Title $Name
    Write-Output "$($Name.Replace(' ', ''))ExitCode: $($Result.ExitCode)"
    foreach ($key in $Keys) {
        $value = Get-OutputValue -Output $Result.Output -Key $key
        if ([string]::IsNullOrWhiteSpace($value)) {
            $value = "none"
        }
        Write-Output "${key}: $value"
    }
}

function Join-Arguments {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Values)

    return @($Values | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
}

$scriptRoot = $PSScriptRoot

Write-Section -Title "Tiku Project Status"
$branch = ((& git branch --show-current 2>$null) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($branch)) {
    $branch = "(detached HEAD)"
}
$head = ((& git rev-parse --short HEAD 2>$null) -join "").Trim()
$statusOutput = @(git status --porcelain=v1 -uall 2>$null)
$isDirty = $LASTEXITCODE -eq 0 -and $statusOutput.Count -gt 0
Write-Output "repository: branch=$branch; head=$head; dirty=$($isDirty.ToString().ToLowerInvariant())"

$nextActionArgs = Join-Arguments -Values @(
    "-ProjectStatePath", $ProjectStatePath,
    "-QueuePath", $QueuePath,
    "-MatrixPath", $MatrixPath
)
if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
    $nextActionArgs += @("-TaskId", $TaskId)
}
$nextActionResult = Invoke-DiagnosticScript -ScriptPath (Join-Path -Path $scriptRoot -ChildPath "Get-TikuNextAction.ps1") -Arguments $nextActionArgs
Write-ToolSummary -Name "Next Action" -Result $nextActionResult -Keys @("nextActionDecision", "nextExecutableTask", "localExperienceCandidateTask", "localExperienceSeedRequired", "localExperienceCandidateReady", "blockedWithRepairCandidate", "coverageRowsWaitingRepair", "coverageRowsWaitingClosure", "activeQueueNonTerminalCount", "guardedGoalPacketDecision", "goalPacketEligibleCount", "goalPacketSelectedCount", "goalPacketCloseoutMode", "recommendedAction", "stopReason")

$registrationArgs = Join-Arguments -Values @("-ProjectStatePath", $ProjectStatePath)
if (-not [string]::IsNullOrWhiteSpace($AutomationRoot)) {
    $registrationArgs += @("-AutomationRoot", $AutomationRoot)
}
if (-not [string]::IsNullOrWhiteSpace($OnDemandAutomationRoot)) {
    $registrationArgs += @("-OnDemandAutomationRoot", $OnDemandAutomationRoot)
}
$registrationResult = Invoke-DiagnosticScript -ScriptPath (Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2AutomationRegistrationReadiness.ps1") -Arguments $registrationArgs
Write-ToolSummary -Name "Automation Registration" -Result $registrationResult -Keys @("automationRegistrationDecision", "stopTaxonomy", "reason")

$hygieneArgs = @("-SummaryOnly")
if (-not [string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
    $hygieneArgs += @("-AutomationWorktreeRoot", $AutomationWorktreeRoot)
}
if (-not [string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
    $hygieneArgs += @("-RunRegistryRoot", $RunRegistryRoot)
}
if (-not [string]::IsNullOrWhiteSpace($HandoffRoot)) {
    $hygieneArgs += @("-HandoffRoot", $HandoffRoot)
}
$hygieneResult = Invoke-DiagnosticScript -ScriptPath (Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2StoppedAutomationHygiene.ps1") -Arguments $hygieneArgs
Write-ToolSummary -Name "Stopped Automation Hygiene" -Result $hygieneResult -Keys @("stoppedAutomationHygieneDecision", "reason")

$seedArgs = Join-Arguments -Values @(
    "-ProjectStatePath", $ProjectStatePath,
    "-QueuePath", $QueuePath,
    "-MatrixPath", $MatrixPath
)
$seedResult = Invoke-DiagnosticScript -ScriptPath (Join-Path -Path $scriptRoot -ChildPath "Get-ModuleRunV2ImplementationSeedProposal.ps1") -Arguments $seedArgs
Write-ToolSummary -Name "Seed Proposal" -Result $seedResult -Keys @("seedProposalDecision", "seedModule", "seedRequiredApproval")

$queueSlimmingArgs = Join-Arguments -Values @(
    "-ProjectStatePath", $ProjectStatePath,
    "-QueuePath", $QueuePath
)
$queueSlimmingResult = Invoke-DiagnosticScript -ScriptPath (Join-Path -Path $scriptRoot -ChildPath "Get-ModuleRunV2QueueSlimmingSelfRepair.ps1") -Arguments $queueSlimmingArgs
Write-ToolSummary -Name "Queue Slimming Self Repair" -Result $queueSlimmingResult -Keys @("queueSlimmingDecision", "terminalBatchArchiveThreshold", "terminalBatchArchiveThresholdExceeded", "archiveCandidateCount", "deferredArchiveCandidateCount", "archiveDeferralReason", "selfRepairCandidateCount", "highRiskRepairBlockedCount", "firstArchiveCandidates", "firstSelfRepairCandidates", "firstBlockedRepairCandidates", "applyMode")

$nextActionDecision = Get-OutputValue -Output $nextActionResult.Output -Key "nextActionDecision"
$nextExecutableTask = Get-OutputValue -Output $nextActionResult.Output -Key "nextExecutableTask"
$nextActionRecommendedAction = Get-OutputValue -Output $nextActionResult.Output -Key "recommendedAction"
$registrationDecision = Get-OutputValue -Output $registrationResult.Output -Key "automationRegistrationDecision"
$hygieneDecision = Get-OutputValue -Output $hygieneResult.Output -Key "stoppedAutomationHygieneDecision"
$seedProposalDecision = Get-OutputValue -Output $seedResult.Output -Key "seedProposalDecision"
$seedModule = Get-OutputValue -Output $seedResult.Output -Key "seedModule"

$projectStatusDecision = "idle_no_pending_task"
$projectStatusAction = "wait_for_instruction"
$projectStatusReason = "no executable task or seed candidate is available"
$requiresHuman = $true
$safeToProceed = $false
$exitCode = 0

if ($nextActionDecision -eq "planned_pause_for_tuning" -or $registrationDecision -eq "planned_pause_for_tuning") {
    $projectStatusDecision = "planned_pause_for_tuning"
    $projectStatusAction = "keep_automation_paused_for_tuning"
    $projectStatusReason = "local automation is intentionally paused for mechanism tuning"
    $requiresHuman = $false
} elseif ($registrationResult.ExitCode -ne 0 -or $registrationDecision -eq "stop_for_hard_block") {
    $projectStatusDecision = "hard_block_registration"
    $projectStatusAction = "resolve_automation_registration"
    $projectStatusReason = "automation registration readiness is blocking"
    $exitCode = 1
} elseif ($hygieneResult.ExitCode -ne 0 -or $hygieneDecision -like "stop_*") {
    $projectStatusDecision = "hard_block_hygiene"
    $projectStatusAction = "inspect_stopped_automation_hygiene"
    $projectStatusReason = "stopped automation hygiene found a blocking artifact"
    $exitCode = 1
} elseif ($nextActionDecision -eq "executable_task_found") {
    $projectStatusDecision = "can_continue"
    $projectStatusAction = "claim_or_plan_next_task:$nextExecutableTask"
    $projectStatusReason = "a pending executable task is available"
    $safeToProceed = -not $isDirty
} elseif ($nextActionDecision -eq "local_experience_task_seed_required") {
    $projectStatusDecision = "local_experience_task_seed_required"
    $projectStatusAction = if ([string]::IsNullOrWhiteSpace($nextActionRecommendedAction)) { "request_local_experience_task_seed" } else { $nextActionRecommendedAction }
    $projectStatusReason = "coverage and handoff identify a local experience repair candidate that is not seeded"
} elseif ($nextActionDecision -in @("local_experience_task_found", "local_experience_task_found_with_dirty_worktree")) {
    $projectStatusDecision = "can_continue"
    $projectStatusAction = if ([string]::IsNullOrWhiteSpace($nextActionRecommendedAction)) { "claim_or_plan_next_task:$nextExecutableTask" } else { $nextActionRecommendedAction }
    $projectStatusReason = "coverage and handoff identify a pending local experience candidate"
    $safeToProceed = -not $isDirty
} elseif ($nextActionDecision -eq "local_experience_bridge_proposal_available") {
    $projectStatusDecision = "local_experience_bridge_proposal_available"
    $projectStatusAction = if ([string]::IsNullOrWhiteSpace($nextActionRecommendedAction)) { "request_local_experience_bridge_approval" } else { $nextActionRecommendedAction }
    $projectStatusReason = "no implementation seed candidate exists and a local experience bridge proposal is available"
} elseif ($seedProposalDecision -eq "proposal_available") {
    $projectStatusDecision = "seed_proposal_available"
    $projectStatusAction = "request_auto_seed_approval:$seedModule"
    $projectStatusReason = "no pending task exists and a guarded seed proposal is available"
} elseif ($nextActionDecision -eq "current_task_active") {
    $projectStatusDecision = "current_task_active"
    $projectStatusAction = "finish_current_task"
    $projectStatusReason = "current task is not terminal"
}

Write-Section -Title "Unified Decision"
Write-Output "projectStatusDecision: $projectStatusDecision"
Write-Output "projectStatusAction: $projectStatusAction"
Write-Output "projectStatusReason: $projectStatusReason"
Write-Output "projectStatusRequiresHuman: $($requiresHuman.ToString().ToLowerInvariant())"
Write-Output "projectStatusSafeToProceed: $($safeToProceed.ToString().ToLowerInvariant())"
Write-Output "diagnosticOnly: true"
Write-Output "Cost Calibration Gate remains blocked"

exit $exitCode
