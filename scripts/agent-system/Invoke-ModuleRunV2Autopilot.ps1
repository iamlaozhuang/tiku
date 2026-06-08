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
    [switch]$CloseoutRecovery,

    [Parameter(Mandatory = $false)]
    [switch]$DryRunHandoff,

    [Parameter(Mandatory = $false)]
    [string[]]$ReadinessChangedFiles = @(),

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
    [string]$NextModuleRunCandidate = "ai-task-and-provider",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$HandoffPath = "docs\05-execution-logs\handoffs\2026-06-08-module-run-v2-autopilot-orchestration-control.md"
)

$ErrorActionPreference = "Stop"
$script:dryRunHandoffTempRoot = ""

function Remove-DryRunHandoffTempRoot {
    if ([string]::IsNullOrWhiteSpace($script:dryRunHandoffTempRoot)) {
        return
    }

    $resolvedTempRoot = [System.IO.Path]::GetFullPath($script:dryRunHandoffTempRoot)
    $systemTempRoot = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath())
    if ($resolvedTempRoot.StartsWith($systemTempRoot, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $resolvedTempRoot)) {
        Remove-Item -LiteralPath $resolvedTempRoot -Recurse -Force
    }
}

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
    if ($DryRunHandoff) {
        Write-Output "dryRunHandoff: enabled"
    }
    Write-Output "nextModuleRunCandidate: $NextModuleRunCandidate"
    Write-Output "Cost Calibration Gate remains blocked"
    Remove-DryRunHandoffTempRoot
    exit $ExitCode
}

if (-not $SkipUnattendedReadiness) {
    $readinessArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        ".\scripts\agent-system\Test-ModuleRunV2UnattendedReadiness.ps1",
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-MatrixPath",
        $MatrixPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $readinessArgs += @("-TaskId", $TaskId)
    }
    if ($CloseoutRecovery) {
        $readinessArgs += "-CloseoutRecovery"
    }
    if ($ReadinessChangedFiles.Count -gt 0) {
        $readinessArgs += @("-ChangedFiles", ($ReadinessChangedFiles -join ","))
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

$effectiveHandoffPath = $HandoffPath
if ($DryRunHandoff) {
    $script:dryRunHandoffTempRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autopilot-handoff-" + [guid]::NewGuid().ToString("N"))
    New-Item -ItemType Directory -Path $script:dryRunHandoffTempRoot | Out-Null
    $effectiveHandoffPath = Join-Path -Path $script:dryRunHandoffTempRoot -ChildPath "handoff.md"
    $HandoffPath = $effectiveHandoffPath
}

$handoffOutput = @(
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File ".\scripts\agent-system\New-ModuleRunV2ThreadHandoff.ps1" -OutputPath $effectiveHandoffPath -Decision $threadDecision -Reason "autopilot thread rollover decision" -NextModuleRunCandidate $NextModuleRunCandidate 2>&1
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
    $effectiveHandoffPath,
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
