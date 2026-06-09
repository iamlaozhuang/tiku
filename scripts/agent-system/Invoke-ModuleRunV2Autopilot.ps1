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
    [switch]$AllowProtectedBranch,

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
    [string]$HandoffPath = "docs\05-execution-logs\handoffs\2026-06-08-module-run-v2-autopilot-orchestration-control.md",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutAuthorizationStatement = ""
)

$ErrorActionPreference = "Stop"
$script:dryRunHandoffTempRoot = ""
$agentSystemRoot = $PSScriptRoot

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

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Id
    )

    $startIndex = -1
    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+$([regex]::Escape($Id))\s*$") {
            $startIndex = $lineIndex
            break
        }
    }

    if ($startIndex -lt 0) {
        return @()
    }

    $endIndex = $Lines.Count
    for ($lineIndex = $startIndex + 1; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+\S+") {
            $endIndex = $lineIndex
            break
        }
    }

    return $Lines[$startIndex..($endIndex - 1)]
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Test-CloseoutAuthorizationText {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return $false
    }

    $hasCommit = $Text -match "(?i)\bcommit\b"
    $hasMerge = $Text -match "(?i)\bmerge\b"
    $hasPush = $Text -match "(?i)\bpush\b"
    $hasCleanup = $Text -match "(?i)\bcleanup\b|short-?lived branch cleanup|park the automation worktree"
    return $hasCommit -and $hasMerge -and $hasPush -and $hasCleanup
}

function Test-ApprovedCloseoutContinuation {
    param(
        [Parameter(Mandatory = $true)][string[]]$TaskBlock,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$Statement = ""
    )

    $taskText = ($TaskBlock -join "`n")
    if ($taskText -match "(?i)humanApproval:" -and (Test-CloseoutAuthorizationText -Text $taskText)) {
        return $true
    }

    return Test-CloseoutAuthorizationText -Text $Statement
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
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2UnattendedReadiness.ps1"),
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
    if (-not [string]::IsNullOrWhiteSpace($CloseoutAuthorizationStatement)) {
        $readinessArgs += @("-CloseoutAuthorizationStatement", $CloseoutAuthorizationStatement)
    }
    if ($AllowProtectedBranch) {
        $readinessArgs += "-AllowProtectedBranch"
    }
    if ($ReadinessChangedFiles.Count -gt 0) {
        $readinessArgs += @("-ChangedFiles", ($ReadinessChangedFiles -join ","))
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $readinessOutput = @(& powershell.exe @readinessArgs 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
    if ($LASTEXITCODE -ne 0) {
        $readinessOutput | ForEach-Object { Write-Output $_ }
        Write-AutopilotResult -Decision "stop_for_hard_block" -Reason "unattended readiness failed" -ExitCode 1
    }
}

if ($CloseoutRecovery -and -not [string]::IsNullOrWhiteSpace($TaskId)) {
    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $dirtyFiles = @(& git status --porcelain)
    if ($taskStatus -in @("done", "closed") -and $dirtyFiles.Count -gt 0 -and (Test-ApprovedCloseoutContinuation -TaskBlock $taskBlock -Statement $CloseoutAuthorizationStatement)) {
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $closeoutOutput = @(
                & (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2ApprovedCloseout.ps1") -TaskId $TaskId -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $MatrixPath -CloseoutAuthorizationStatement $CloseoutAuthorizationStatement 2>&1
            )
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        if ($LASTEXITCODE -ne 0) {
            $closeoutOutput | ForEach-Object { Write-Output $_ }
            Write-AutopilotResult -Decision "stop_for_hard_block" -Reason "approved closeout execution failed" -ExitCode 1
        }

        $closeoutOutput | ForEach-Object { Write-Output $_ }
        Write-AutopilotResult -Decision "closeout_executed" -Reason "approved closeout executed; rerun startup readiness for the next task" -ExitCode 0
    }
}

$threadArgs = @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2ThreadRolloverReadiness.ps1"),
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
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path -Path $agentSystemRoot -ChildPath "New-ModuleRunV2ThreadHandoff.ps1") -OutputPath $effectiveHandoffPath -Decision $threadDecision -Reason "autopilot thread rollover decision" -NextModuleRunCandidate $NextModuleRunCandidate 2>&1
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
    (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2ThreadLaunchPolicy.ps1"),
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
