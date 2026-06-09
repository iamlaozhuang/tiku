param(
    [Parameter(Mandatory = $false)]
    [string[]]$CandidateTaskIds = @(),

    [Parameter(Mandatory = $false)]
    [string]$CoordinatorTaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$ParallelReadinessOutputPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml"
)

$ErrorActionPreference = "Stop"
$agentSystemRoot = $PSScriptRoot

$expandedCandidateTaskIds = New-Object System.Collections.Generic.List[string]
foreach ($candidateTaskIdInput in $CandidateTaskIds) {
    foreach ($candidateTaskIdPart in ($candidateTaskIdInput -split ",")) {
        $trimmedCandidateTaskId = $candidateTaskIdPart.Trim()
        if (-not [string]::IsNullOrWhiteSpace($trimmedCandidateTaskId)) {
            $expandedCandidateTaskIds.Add($trimmedCandidateTaskId)
        }
    }
}
$CandidateTaskIds = $expandedCandidateTaskIds.ToArray()

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

function Write-ParallelCoordinatorResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Module Run v2 Parallel Coordinator Executor"
    Write-Output "parallelCoordinatorDecision: $Decision"
    Write-Output "parallelCoordinatorAction: $Action"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
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

function Invoke-ParallelReadiness {
    $readinessArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2ParallelReadiness.ps1"),
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath
    )

    if ($CandidateTaskIds.Count -gt 0) {
        $readinessArgs += @("-CandidateTaskIds", ($CandidateTaskIds -join ","))
    }
    if (-not [string]::IsNullOrWhiteSpace($CoordinatorTaskId)) {
        $readinessArgs += @("-CoordinatorTaskId", $CoordinatorTaskId)
    }

    return Invoke-ExternalCommand -Arguments $readinessArgs
}

function Get-FileLockRecords {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output)

    $records = New-Object System.Collections.Generic.List[object]
    foreach ($line in $Output) {
        if ($line -match "^fileLock:\s+(\S+)\s+(.+?)\s*$") {
            $records.Add([pscustomobject]@{
                TaskId = $Matches[1].Trim()
                Path = $Matches[2].Trim()
            })
        }
    }

    return $records.ToArray()
}

function Get-TaskReadinessRecords {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output)

    $records = New-Object System.Collections.Generic.List[object]
    foreach ($line in $Output) {
        if ($line -match "^taskReadiness:\s+(\S+)\s+(.+?)\s*$") {
            $records.Add([pscustomobject]@{
                TaskId = $Matches[1].Trim()
                Level = $Matches[2].Trim()
            })
        }
    }

    return $records.ToArray()
}

function Get-ManifestCandidateIds {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$ReadinessRecords,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$FileLockRecords
    )

    $ids = New-Object System.Collections.Generic.List[string]
    foreach ($candidateTaskId in $CandidateTaskIds) {
        if (-not $ids.Contains($candidateTaskId)) {
            $ids.Add($candidateTaskId)
        }
    }
    foreach ($readinessRecord in $ReadinessRecords) {
        if (-not $ids.Contains($readinessRecord.TaskId)) {
            $ids.Add($readinessRecord.TaskId)
        }
    }
    foreach ($fileLockRecord in $FileLockRecords) {
        if (-not $ids.Contains($fileLockRecord.TaskId)) {
            $ids.Add($fileLockRecord.TaskId)
        }
    }

    return $ids.ToArray()
}

function Write-WorkerAssignmentManifest {
    param(
        [Parameter(Mandatory = $true)][string]$CoordinatorId,
        [Parameter(Mandatory = $true)][string[]]$CandidateIds,
        [Parameter(Mandatory = $true)][object[]]$ReadinessRecords,
        [Parameter(Mandatory = $true)][object[]]$FileLockRecords
    )

    Write-Section -Title "Worker Assignment Manifest"
    Write-Output "workerAssignmentManifest: begin"
    Write-Output "coordinatorTaskId: $CoordinatorId"
    Write-Output "workerIsolation: manifest_only"
    Write-Output "serialIntegration: coordinator_serial_merge_required"

    $mergeOrder = 1
    foreach ($candidateId in $CandidateIds) {
        $level = "unknown"
        foreach ($readinessRecord in $ReadinessRecords) {
            if ($readinessRecord.TaskId -eq $candidateId) {
                $level = $readinessRecord.Level
                break
            }
        }

        $branchName = "codex/$candidateId"
        Write-Output "workerAssignmentManifest: task=$candidateId; level=$level; branch=$branchName; mergeOrder=$mergeOrder"
        foreach ($fileLockRecord in $FileLockRecords) {
            if ($fileLockRecord.TaskId -eq $candidateId) {
                Write-Output "fileLock: task=$candidateId; path=$($fileLockRecord.Path)"
            }
        }
        $mergeOrder += 1
    }

    Write-Output "workerAssignmentManifest: end"
}

try {
    Write-Section -Title "Module Run v2 Parallel Coordinator Executor Input"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "project state is missing" -ExitCode 1
    }
    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "task queue is missing" -ExitCode 1
    }

    if (-not [string]::IsNullOrWhiteSpace($ParallelReadinessOutputPath)) {
        if (-not (Test-Path -LiteralPath $ParallelReadinessOutputPath)) {
            Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "parallel readiness output path is missing" -ExitCode 1
        }
        $readinessOutput = @(Get-Content -LiteralPath $ParallelReadinessOutputPath)
        $readinessExitCode = 0
        Write-Output "parallelReadinessInput: file"
        Write-Output "parallelReadinessOutputPath: $ParallelReadinessOutputPath"
    } else {
        $readinessResult = Invoke-ParallelReadiness
        $readinessOutput = @($readinessResult.Output)
        $readinessExitCode = $readinessResult.ExitCode
        Write-Output "parallelReadinessInput: live"
    }

    $readinessOutput | ForEach-Object { Write-Output $_ }
    $parallelDecision = Get-DecisionValue -Output $readinessOutput -Key "parallelDecision"
    $parallelReason = Get-DecisionValue -Output $readinessOutput -Key "reason"
    $readinessRecords = @(Get-TaskReadinessRecords -Output $readinessOutput)
    $fileLockRecords = @(Get-FileLockRecords -Output $readinessOutput)
    $candidateIds = @(Get-ManifestCandidateIds -ReadinessRecords $readinessRecords -FileLockRecords $fileLockRecords)

    Write-Section -Title "Parallel Readiness Decision"
    Write-Output "parallelDecision: $parallelDecision"
    Write-Output "parallelReason: $parallelReason"

    if ($readinessExitCode -ne 0 -and $parallelDecision -notin @("stop_for_file_lock_conflict", "stop_for_blocked_gate", "stop_for_hard_block")) {
        Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "parallel readiness failed without a recognized stop decision" -ExitCode 1
    }

    switch ($parallelDecision) {
        "can_assign_workers" {
            if ($candidateIds.Count -eq 0) {
                Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "parallel readiness returned no candidate ids for assignment" -ExitCode 1
            }

            $coordinatorId = if ([string]::IsNullOrWhiteSpace($CoordinatorTaskId)) { "coordinator-task" } else { $CoordinatorTaskId }
            Write-WorkerAssignmentManifest -CoordinatorId $coordinatorId -CandidateIds $candidateIds -ReadinessRecords $readinessRecords -FileLockRecords $fileLockRecords
            Write-ParallelCoordinatorResult -Decision "assignment_manifest_ready" -Action "prepare_parallel_workers" -Reason "durable parallel readiness allows manifest-only worker assignment" -ExitCode 0
        }
        "use_serial_execution" {
            Write-Section -Title "Serial Fallback"
            Write-Output "workerAssignmentManifest: not_created"
            Write-Output "serialIntegration: coordinator_current_thread"
            Write-ParallelCoordinatorResult -Decision "use_serial_execution" -Action "continue_serially" -Reason $parallelReason -ExitCode 0
        }
        "stop_for_file_lock_conflict" {
            Write-ParallelCoordinatorResult -Decision "stop_for_file_lock_conflict" -Action "repair_file_locks" -Reason $parallelReason -ExitCode 1
        }
        "stop_for_blocked_gate" {
            Write-ParallelCoordinatorResult -Decision "stop_for_blocked_gate" -Action "request_manual_decision" -Reason $parallelReason -ExitCode 1
        }
        "stop_for_hard_block" {
            Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason $parallelReason -ExitCode 1
        }
        default {
            Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "unknown parallel readiness decision: $parallelDecision" -ExitCode 1
        }
    }
} catch {
    Write-Output "HARD_BLOCK_PARALLEL_COORDINATOR_EXECUTOR_EXCEPTION $($_.Exception.Message)"
    Write-ParallelCoordinatorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "parallel coordinator executor script exception" -ExitCode 1
}
