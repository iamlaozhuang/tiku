param(
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
    [switch]$CurrentTaskUnclear,

    [Parameter(Mandatory = $false)]
    [switch]$GitStateAmbiguous,

    [Parameter(Mandatory = $false)]
    [switch]$BlockedGateNeeded,

    [Parameter(Mandatory = $false)]
    [switch]$HighRiskBoundary,

    [Parameter(Mandatory = $false)]
    [switch]$AllowContinuationAfterBatch6
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Set-Decision {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "threadRolloverDecision: $Decision"
    Write-Output "reason: $Reason"
    exit $ExitCode
}

Write-Section -Title "Module Run v2 Thread Rollover Readiness"
Write-Output "threadRolloverMode: hard_block_when_required"
Write-Output "completedBatchCount: $CompletedBatchCount"
Write-Output "moduleRunCloseout: $([bool]$ModuleRunCloseout)"
Write-Output "executionModuleChanged: $([bool]$ExecutionModuleChanged)"
Write-Output "contextCompaction: $([bool]$ContextCompaction)"
Write-Output "recoveryAuditPassed: $([bool]$RecoveryAuditPassed)"

if ($CurrentTaskUnclear) {
    Set-Decision -Decision "stop_for_human_handoff" -Reason "current task identity is unclear" -ExitCode 1
}

if ($GitStateAmbiguous) {
    Set-Decision -Decision "stop_for_human_handoff" -Reason "Git state is ambiguous" -ExitCode 1
}

if ($BlockedGateNeeded) {
    Set-Decision -Decision "stop_for_human_handoff" -Reason "blocked gate execution would be needed" -ExitCode 1
}

if ($HighRiskBoundary) {
    Set-Decision -Decision "require_new_thread" -Reason "high-risk boundary requires a fresh recovery surface" -ExitCode 1
}

if ($ModuleRunCloseout) {
    Set-Decision -Decision "require_new_thread" -Reason "Module Run closeout completed before the next execution module" -ExitCode 1
}

if ($ExecutionModuleChanged) {
    Set-Decision -Decision "require_new_thread" -Reason "next work enters a different execution module" -ExitCode 1
}

if ($ContextCompaction -and -not $RecoveryAuditPassed) {
    Set-Decision -Decision "require_new_thread" -Reason "context compaction requires recovery audit before continuation" -ExitCode 1
}

if ($CompletedBatchCount -ge 6) {
    if ($AllowContinuationAfterBatch6 -and $RecoveryAuditPassed) {
        Set-Decision -Decision "continue_current_thread" -Reason "Batch 6 continuation explicitly allowed after recovery audit" -ExitCode 0
    }

    Set-Decision -Decision "require_new_thread" -Reason "Batch 6 threshold reached" -ExitCode 1
}

if ($CompletedBatchCount -ge 4) {
    Set-Decision -Decision "suggest_new_thread" -Reason "Batch 4 threshold reached" -ExitCode 0
}

Set-Decision -Decision "continue_current_thread" -Reason "Batch count and recovery signals are within current-thread limits" -ExitCode 0

