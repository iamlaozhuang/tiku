param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("continue_current_thread", "suggest_new_thread", "require_new_thread", "stop_for_human_handoff")]
    [string]$ThreadRolloverDecision,

    [Parameter(Mandatory = $false)]
    [string]$HandoffPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$ThreadLaunchApproved,

    [Parameter(Mandatory = $false)]
    [switch]$ThreadToolAvailable,

    [Parameter(Mandatory = $false)]
    [switch]$ContinueAllowedOnSuggest,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "ai-task-and-provider"
)

$ErrorActionPreference = "Stop"

function Write-Result {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Output ""
    Write-Output "== Module Run v2 Thread Launch Policy =="
    Write-Output "threadRolloverDecision: $ThreadRolloverDecision"
    Write-Output "threadLaunchDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    if (-not [string]::IsNullOrWhiteSpace($HandoffPath)) {
        Write-Output "handoffPath: $HandoffPath"
    }
    Write-Output "threadToolRequired: create_thread"
    Write-Output "threadToolOptional: send_message_to_thread"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

$handoffExists = -not [string]::IsNullOrWhiteSpace($HandoffPath) -and (Test-Path -LiteralPath $HandoffPath)

if ($ThreadRolloverDecision -eq "continue_current_thread") {
    Write-Result -Decision "continue_current_thread" -Reason "thread rollover gate allows same-thread continuation" -ExitCode 0
}

if ($ThreadRolloverDecision -eq "suggest_new_thread") {
    if ($ThreadLaunchApproved -and $ThreadToolAvailable -and $handoffExists) {
        Write-Result -Decision "launch_new_thread" -Reason "suggested rollover has approval, tool availability, and handoff" -ExitCode 0
    }

    if ($ContinueAllowedOnSuggest) {
        Write-Result -Decision "prepare_handoff_then_continue" -Reason "suggestion recorded but same-thread continuation is allowed" -ExitCode 0
    }

    Write-Result -Decision "prepare_handoff" -Reason "new thread is suggested; handoff should be prepared before continuing" -ExitCode 0
}

if ($ThreadRolloverDecision -eq "require_new_thread") {
    if ($ThreadLaunchApproved -and $ThreadToolAvailable -and $handoffExists) {
        Write-Result -Decision "launch_new_thread" -Reason "required rollover has approval, tool availability, and handoff" -ExitCode 0
    }

    Write-Result -Decision "stop_for_human_handoff" -Reason "required rollover lacks approval, thread tool availability, or handoff" -ExitCode 1
}

Write-Result -Decision "stop_for_human_handoff" -Reason "thread rollover gate requested human handoff" -ExitCode 1

