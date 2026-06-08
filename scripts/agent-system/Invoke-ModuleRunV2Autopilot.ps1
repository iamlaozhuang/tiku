param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

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
    [ValidateNotNullOrEmpty()]
    [string]$NextModuleRunCandidate = "ai-task-and-provider",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$HandoffPath = "docs\05-execution-logs\handoffs\2026-06-08-module-run-v2-autopilot-orchestration-control.md"
)

$ErrorActionPreference = "Stop"

function Get-DecisionValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Write-AutopilotResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Output ""
    Write-Output "== Module Run v2 Autopilot =="
    Write-Output "autopilotDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "handoffPath: $HandoffPath"
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

if (-not $SkipUnattendedReadiness) {
    $readinessArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        ".\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1"
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $readinessArgs += @("-TaskId", $TaskId)
    }

    $readinessOutput = @(& powershell.exe @readinessArgs 2>&1)
    if ($LASTEXITCODE -ne 0) {
        $readinessOutput | ForEach-Object { Write-Output $_ }
        Write-AutopilotResult -Decision "stop_for_hard_block" -Reason "unattended readiness failed" -ExitCode 1
    }
}

$threadArgs = @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    ".\scripts\agent-system\Test-ModuleRunV2ThreadRolloverReadiness.ps1",
    "-CompletedBatchCount",
    "$CompletedBatchCount"
)
if ($ModuleRunCloseout) {
    $threadArgs += "-ModuleRunCloseout"
}
if ($ExecutionModuleChanged) {
    $threadArgs += "-ExecutionModuleChanged"
}
if ($ContextCompaction) {
    $threadArgs += "-ContextCompaction"
}
if ($RecoveryAuditPassed) {
    $threadArgs += "-RecoveryAuditPassed"
}

$threadOutput = @(& powershell.exe @threadArgs 2>&1)
$threadDecision = Get-DecisionValue -Output $threadOutput -Key "threadRolloverDecision"
if ([string]::IsNullOrWhiteSpace($threadDecision)) {
    $threadOutput | ForEach-Object { Write-Output $_ }
    Write-AutopilotResult -Decision "stop_for_human_handoff" -Reason "thread rollover decision was not readable" -ExitCode 1
}

if ($threadDecision -eq "continue_current_thread") {
    Write-AutopilotResult -Decision "continue_current_thread" -Reason "thread rollover gate allows continuation" -ExitCode 0
}

$handoffOutput = @(
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\agent-system\New-ModuleRunV2ThreadHandoff.ps1" -OutputPath $HandoffPath -Decision $threadDecision -Reason "autopilot thread rollover decision" -NextModuleRunCandidate $NextModuleRunCandidate 2>&1
)
if ($LASTEXITCODE -ne 0) {
    $handoffOutput | ForEach-Object { Write-Output $_ }
    Write-AutopilotResult -Decision "stop_for_human_handoff" -Reason "handoff generation failed" -ExitCode 1
}

$policyArgs = @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    ".\scripts\agent-system\Test-ModuleRunV2ThreadLaunchPolicy.ps1",
    "-ThreadRolloverDecision",
    $threadDecision,
    "-HandoffPath",
    $HandoffPath,
    "-NextModuleRunCandidate",
    $NextModuleRunCandidate
)
if ($ThreadLaunchApproved) {
    $policyArgs += "-ThreadLaunchApproved"
}
if ($ThreadToolAvailable) {
    $policyArgs += "-ThreadToolAvailable"
}
if ($threadDecision -eq "suggest_new_thread") {
    $policyArgs += "-ContinueAllowedOnSuggest"
}

$policyOutput = @(& powershell.exe @policyArgs 2>&1)
$launchDecision = Get-DecisionValue -Output $policyOutput -Key "threadLaunchDecision"
if ([string]::IsNullOrWhiteSpace($launchDecision)) {
    $policyOutput | ForEach-Object { Write-Output $_ }
    Write-AutopilotResult -Decision "stop_for_human_handoff" -Reason "thread launch decision was not readable" -ExitCode 1
}

if ($launchDecision -eq "launch_new_thread") {
    Write-AutopilotResult -Decision "launch_new_thread" -Reason "thread launch policy approved create_thread handoff" -ExitCode 0
}

if ($launchDecision -eq "prepare_handoff" -or $launchDecision -eq "prepare_handoff_then_continue") {
    Write-AutopilotResult -Decision $launchDecision -Reason "handoff prepared and same-thread continuation remains controlled" -ExitCode 0
}

Write-AutopilotResult -Decision "stop_for_human_handoff" -Reason "thread launch policy requires human handoff" -ExitCode 1
