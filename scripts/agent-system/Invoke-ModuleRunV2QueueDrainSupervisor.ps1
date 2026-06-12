param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$RunnerOutputPath = "",

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxTasksPerWake = 2,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 240)]
    [int]$MaxWallClockMinutes = 90,

    [Parameter(Mandatory = $false)]
    [ValidateRange(0, 10)]
    [int]$CompletedTaskCount = 0,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxConsecutiveFailures = 1,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 10)]
    [int]$MaxConsecutiveRecoveries = 2,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 500)]
    [int]$MaxChangedFiles = 20,

    [Parameter(Mandatory = $false)]
    [ValidateRange(1, 20000)]
    [int]$MaxChangedLines = 800,

    [Parameter(Mandatory = $false)]
    [string]$RunId = "",

    [Parameter(Mandatory = $false)]
    [string]$StartedAtUtc = "",

    [Parameter(Mandatory = $false)]
    [string]$RunManifestRoot = "",

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
    [string]$SchemaPath = "docs\04-agent-system\state\autodrive-control-schema.yaml",

    [Parameter(Mandatory = $false)]
    [switch]$PlanOnly,

    [Parameter(Mandatory = $false)]
    [switch]$ExecuteCloseout,

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch,

    [Parameter(Mandatory = $false)]
    [string]$RecoveryPacketHandoffRoot = "",

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

function Invoke-ExternalPowerShellScript {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][string[]]$Arguments = @()
    )

    if (-not (Test-Path -LiteralPath $ScriptPath)) {
        return [pscustomobject]@{
            Output = @("missingScript: $ScriptPath")
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

function Resolve-ManifestRoot {
    if (-not [string]::IsNullOrWhiteSpace($RunManifestRoot)) {
        return [System.IO.Path]::GetFullPath($RunManifestRoot)
    }

    return [System.IO.Path]::GetFullPath((Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\drain-runs"))
}

function Test-PathInsideRepository {
    param([Parameter(Mandatory = $true)][string]$Path)

    $repoRoot = ((& git rev-parse --show-toplevel 2>$null) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($repoRoot)) {
        return $false
    }

    $directorySeparator = [System.IO.Path]::DirectorySeparatorChar
    $alternateSeparator = [System.IO.Path]::AltDirectorySeparatorChar
    $repoFullPath = [System.IO.Path]::GetFullPath($repoRoot).TrimEnd($directorySeparator, $alternateSeparator)
    $targetFullPath = [System.IO.Path]::GetFullPath($Path).TrimEnd($directorySeparator, $alternateSeparator)
    if ($targetFullPath.Equals($repoFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
        return $true
    }

    $repoPathPrefix = $repoFullPath + $directorySeparator
    return $targetFullPath.StartsWith($repoPathPrefix, [System.StringComparison]::OrdinalIgnoreCase)
}

function New-DrainManifest {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$NextAction,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$NextTask = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$RunnerDecision = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$BlockerFingerprint = "",
        [Parameter(Mandatory = $true)][bool]$SafeToContinue,
        [Parameter(Mandatory = $true)][string]$Reason
    )

    $manifestRoot = Resolve-ManifestRoot
    if (Test-PathInsideRepository -Path $manifestRoot) {
        throw "drain manifest root must be outside the repository: $manifestRoot"
    }

    New-Item -ItemType Directory -Path $manifestRoot -Force | Out-Null
    $manifestPath = Join-Path -Path $manifestRoot -ChildPath "$RunId.json"
    $manifest = [ordered]@{
        schemaVersion = 1
        queueDrainRunId = $RunId
        createdAtUtc = (Get-Date).ToUniversalTime().ToString("o")
        decision = $Decision
        nextAction = $NextAction
        nextTask = $NextTask
        runnerDecision = $RunnerDecision
        completedTaskCount = $CompletedTaskCount
        maxTasksPerWake = $MaxTasksPerWake
        maxWallClockMinutes = $MaxWallClockMinutes
        maxConsecutiveFailures = $MaxConsecutiveFailures
        maxConsecutiveRecoveries = $MaxConsecutiveRecoveries
        maxChangedFiles = $MaxChangedFiles
        maxChangedLines = $MaxChangedLines
        blockerFingerprint = $BlockerFingerprint
        safeToContinueDrain = $SafeToContinue
        reason = $Reason
        forbiddenEvidence = @(
            "secrets",
            "provider payloads",
            "raw prompts",
            "raw answers",
            "database URLs",
            "Authorization headers",
            "full paper or material content"
        )
        costCalibrationGate = "blocked"
    }

    $manifest | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $manifestPath -Encoding UTF8
    return $manifestPath
}

function Test-RepeatedBlockerFingerprint {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$BlockerFingerprint)

    if ([string]::IsNullOrWhiteSpace($BlockerFingerprint)) {
        return $false
    }

    $manifestRoot = Resolve-ManifestRoot
    if (-not (Test-Path -LiteralPath $manifestRoot)) {
        return $false
    }

    $escapedFingerprint = [regex]::Escape($BlockerFingerprint)
    $matches = @(Get-ChildItem -LiteralPath $manifestRoot -Filter "*.json" -File -ErrorAction SilentlyContinue | Where-Object {
        (Get-Content -LiteralPath $_.FullName -Raw) -match $escapedFingerprint
    })

    return $matches.Count -gt 0
}

function Test-WallClockBudgetExceeded {
    if ([string]::IsNullOrWhiteSpace($StartedAtUtc)) {
        return $false
    }

    $started = [datetime]::MinValue
    if (-not [datetime]::TryParse($StartedAtUtc, [ref]$started)) {
        return $false
    }

    $elapsed = (Get-Date).ToUniversalTime() - $started.ToUniversalTime()
    return $elapsed.TotalMinutes -ge $MaxWallClockMinutes
}

function Get-NumstatChangedLineCount {
    param([Parameter(Mandatory = $true)][string[]]$GitArguments)

    $changedLines = 0
    $numstatRows = @(& git @GitArguments 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return 0
    }

    foreach ($row in $numstatRows) {
        if ($row -match "^(\d+|-)\s+(\d+|-)\s+") {
            $added = if ($Matches[1] -eq "-") { 0 } else { [int]$Matches[1] }
            $removed = if ($Matches[2] -eq "-") { 0 } else { [int]$Matches[2] }
            $changedLines += $added + $removed
        }
    }

    return $changedLines
}

function Get-FileLineCount {
    param([Parameter(Mandatory = $true)][string]$Path)

    try {
        if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) {
            return 0
        }

        $lineCount = 0
        foreach ($line in [System.IO.File]::ReadLines($Path)) {
            $lineCount++
        }
        return $lineCount
    } catch {
        return [int]::MaxValue
    }
}

function Get-ChangedFileSummary {
    $changedFiles = New-Object System.Collections.Generic.HashSet[string]
    $changedLines = 0
    $repoRoot = ((& git rev-parse --show-toplevel 2>$null) -join "").Trim()

    $diffFiles = @(& git diff --name-only 2>$null)
    if ($LASTEXITCODE -eq 0) {
        foreach ($diffFile in $diffFiles) {
            if (-not [string]::IsNullOrWhiteSpace($diffFile)) {
                [void]$changedFiles.Add($diffFile.Trim())
            }
        }
    }

    $cachedFiles = @(& git diff --cached --name-only 2>$null)
    if ($LASTEXITCODE -eq 0) {
        foreach ($cachedFile in $cachedFiles) {
            if (-not [string]::IsNullOrWhiteSpace($cachedFile)) {
                [void]$changedFiles.Add($cachedFile.Trim())
            }
        }
    }

    $untrackedFiles = @(& git ls-files --others --exclude-standard 2>$null)
    if ($LASTEXITCODE -eq 0) {
        foreach ($untrackedFile in $untrackedFiles) {
            if (-not [string]::IsNullOrWhiteSpace($untrackedFile)) {
                $trimmedUntrackedFile = $untrackedFile.Trim()
                [void]$changedFiles.Add($trimmedUntrackedFile)
                if (-not [string]::IsNullOrWhiteSpace($repoRoot)) {
                    $changedLines += Get-FileLineCount -Path (Join-Path -Path $repoRoot -ChildPath $trimmedUntrackedFile)
                }
            }
        }
    }

    $changedLines += Get-NumstatChangedLineCount -GitArguments @("diff", "--numstat")
    $changedLines += Get-NumstatChangedLineCount -GitArguments @("diff", "--cached", "--numstat")

    return [pscustomobject]@{
        ChangedFileCount = $changedFiles.Count
        ChangedLineCount = $changedLines
    }
}

function Invoke-Runner {
    if (-not [string]::IsNullOrWhiteSpace($RunnerOutputPath)) {
        if (-not (Test-Path -LiteralPath $RunnerOutputPath)) {
            return [pscustomobject]@{
                Output = @("runnerOutputPathMissing: $RunnerOutputPath")
                ExitCode = 1
            }
        }

        return [pscustomobject]@{
            Output = @(Get-Content -LiteralPath $RunnerOutputPath)
            ExitCode = 0
        }
    }

    $arguments = @(
        "-MaxSteps", "3",
        "-ProjectStatePath", $ProjectStatePath,
        "-QueuePath", $QueuePath,
        "-MatrixPath", $MatrixPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $arguments += @("-TaskId", $TaskId)
    }
    if ($PlanOnly) {
        $arguments += "-PlanOnly"
    }
    if ($AllowProtectedBranch) {
        $arguments += "-AllowProtectedBranch"
    }

    return Invoke-ExternalPowerShellScript -ScriptPath (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2AutopilotRunner.ps1") -Arguments $arguments
}

function Invoke-Dispatcher {
    param([Parameter(Mandatory = $true)][string]$RunnerOutputFile)

    $arguments = @(
        "-RunnerOutputPath", $RunnerOutputFile,
        "-ProjectStatePath", $ProjectStatePath,
        "-QueuePath", $QueuePath,
        "-SchemaPath", $SchemaPath
    )
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $arguments += @("-TaskId", $TaskId)
    }
    if ($AllowProtectedBranch) {
        $arguments += "-AllowProtectedBranch"
    }

    return Invoke-ExternalPowerShellScript -ScriptPath (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2AgentActionDispatcher.ps1") -Arguments $arguments
}

function Invoke-Eligibility {
    param([Parameter(Mandatory = $true)][string]$TargetTaskId)

    $arguments = @(
        "-TaskId", $TargetTaskId,
        "-ProjectStatePath", $ProjectStatePath,
        "-QueuePath", $QueuePath,
        "-MaxTasksPerWake", "$MaxTasksPerWake"
    )

    return Invoke-ExternalPowerShellScript -ScriptPath (Join-Path -Path $agentSystemRoot -ChildPath "Test-ModuleRunV2QueueDrainEligibility.ps1") -Arguments $arguments
}

function Invoke-ApprovedCloseout {
    param([Parameter(Mandatory = $true)][string]$TargetTaskId)

    $arguments = @(
        "-TaskId", $TargetTaskId,
        "-ProjectStatePath", $ProjectStatePath,
        "-QueuePath", $QueuePath,
        "-MatrixPath", $MatrixPath
    )
    if (-not [string]::IsNullOrWhiteSpace($RecoveryPacketHandoffRoot)) {
        $arguments += @("-RecoveryPacketHandoffRoot", $RecoveryPacketHandoffRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($CloseoutAuthorizationStatement)) {
        $arguments += @("-CloseoutAuthorizationStatement", $CloseoutAuthorizationStatement)
    }

    return Invoke-ExternalPowerShellScript -ScriptPath (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2ApprovedCloseout.ps1") -Arguments $arguments
}

function Write-QueueDrainResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$NextAction,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][bool]$SafeToContinue,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$NextTask = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$RunnerDecision = "",
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$BlockerFingerprint = ""
    )

    $manifestPath = "not_written"
    try {
        $manifestPath = New-DrainManifest -Decision $Decision -NextAction $NextAction -NextTask $NextTask -RunnerDecision $RunnerDecision -BlockerFingerprint $BlockerFingerprint -SafeToContinue $SafeToContinue -Reason $Reason
    } catch {
        $Decision = "hard_block"
        $NextAction = "stop_and_report"
        $Reason = "drain manifest write failed: $($_.Exception.Message)"
        $SafeToContinue = $false
        $ExitCode = 1
    }

    Write-Section -Title "Module Run v2 Queue Drain Supervisor"
    Write-Output "queueDrainDecision: $Decision"
    Write-Output "queueDrainRunId: $RunId"
    Write-Output "queueDrainCompletedTaskCount: $CompletedTaskCount"
    if (-not [string]::IsNullOrWhiteSpace($NextTask)) {
        Write-Output "queueDrainNextTask: $NextTask"
    }
    Write-Output "queueDrainNextAction: $NextAction"
    Write-Output "queueDrainManifestPath: $manifestPath"
    Write-Output "safeToContinueDrain: $($SafeToContinue.ToString().ToLowerInvariant())"
    if (-not [string]::IsNullOrWhiteSpace($BlockerFingerprint)) {
        Write-Output "blockerFingerprint: $BlockerFingerprint"
    }
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

try {
    Write-Section -Title "Module Run v2 Queue Drain Supervisor Input"
    Write-Output "queueDrainMode: bounded"

    if ([string]::IsNullOrWhiteSpace($RunId)) {
        $RunId = "drain-" + [guid]::NewGuid().ToString("N")
    }
    if ([string]::IsNullOrWhiteSpace($StartedAtUtc)) {
        $StartedAtUtc = (Get-Date).ToUniversalTime().ToString("o")
    }

    Write-Output "queueDrainRunId: $RunId"
    Write-Output "completedTaskCount: $CompletedTaskCount"
    Write-Output "maxTasksPerWake: $MaxTasksPerWake"

    if ($CompletedTaskCount -ge $MaxTasksPerWake) {
        Write-QueueDrainResult -Decision "budget_exhausted" -NextAction "stop_and_report" -Reason "MaxTasksPerWake budget exhausted" -SafeToContinue $false -ExitCode 0
    }
    if (Test-WallClockBudgetExceeded) {
        Write-QueueDrainResult -Decision "budget_exhausted" -NextAction "stop_and_report" -Reason "MaxWallClockMinutes budget exhausted" -SafeToContinue $false -ExitCode 0
    }

    if (-not $PlanOnly) {
        $changedFileSummary = Get-ChangedFileSummary
        Write-Output "changedFileCount: $($changedFileSummary.ChangedFileCount)"
        Write-Output "changedLineCount: $($changedFileSummary.ChangedLineCount)"
        if ($changedFileSummary.ChangedFileCount -gt $MaxChangedFiles) {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "changed file count exceeds queue drain budget" -SafeToContinue $false -ExitCode 1
        }
        if ($changedFileSummary.ChangedLineCount -gt $MaxChangedLines) {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "changed line count exceeds queue drain budget" -SafeToContinue $false -ExitCode 1
        }
    }

    $runnerResult = Invoke-Runner
    Write-Section -Title "Runner Output"
    $runnerResult.Output | ForEach-Object { Write-Output $_ }

    $runnerDecision = Get-DecisionValue -Output $runnerResult.Output -Key "runnerDecision"
    $runnerNextAction = Get-DecisionValue -Output $runnerResult.Output -Key "runnerNextAction"
    $runnerNextTask = Get-DecisionValue -Output $runnerResult.Output -Key "runnerNextTask"
    $blockerFingerprint = Get-DecisionValue -Output $runnerResult.Output -Key "blockerFingerprint"
    if ([string]::IsNullOrWhiteSpace($runnerDecision)) {
        Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "runner decision was not readable" -SafeToContinue $false -ExitCode 1
    }

    if ($runnerResult.ExitCode -ne 0 -or $runnerDecision -in @("stop_for_hard_block", "validation_failed", "iteration_limit_reached")) {
        Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "runner returned blocking decision: $runnerDecision" -SafeToContinue $false -ExitCode 1 -RunnerDecision $runnerDecision -BlockerFingerprint $blockerFingerprint
    }

    if ($runnerDecision -eq "no_executable_task" -or $runnerDecision -eq "exit_active_owner_present" -or $runnerDecision -eq "planned_pause_for_tuning") {
        Write-QueueDrainResult -Decision "idle" -NextAction "stop_and_report" -Reason "runner returned quiet terminal decision: $runnerDecision" -SafeToContinue $false -ExitCode 0 -RunnerDecision $runnerDecision
    }

    if ($runnerDecision -eq "open_recovery_plan" -or $runnerDecision -eq "adopt_recoverable_run" -or $runnerDecision -eq "manual_required_owner_recovery") {
        if (Test-RepeatedBlockerFingerprint -BlockerFingerprint $blockerFingerprint) {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "repeated blockerFingerprint; do not generate duplicate recovery work" -SafeToContinue $false -ExitCode 1 -RunnerDecision $runnerDecision -BlockerFingerprint $blockerFingerprint
        }

        Write-QueueDrainResult -Decision "approval_required" -NextAction "stop_and_report" -Reason "recovery or owner decision must be handled outside queue drain" -SafeToContinue $false -ExitCode 0 -RunnerDecision $runnerDecision -BlockerFingerprint $blockerFingerprint
    }

    if ($runnerDecision -eq "seed_proposal_available" -or $runnerDecision -eq "stop_for_manual_decision" -or $runnerDecision -eq "stop_for_human_handoff") {
        Write-QueueDrainResult -Decision "approval_required" -NextAction "stop_and_report" -Reason "runner requires approval or handoff: $runnerDecision" -SafeToContinue $false -ExitCode 0 -RunnerDecision $runnerDecision
    }

    if ($runnerDecision -eq "prepare_next_task") {
        if ([string]::IsNullOrWhiteSpace($runnerNextTask)) {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "runner omitted runnerNextTask for prepare_next_task" -SafeToContinue $false -ExitCode 1 -RunnerDecision $runnerDecision
        }

        $eligibilityResult = Invoke-Eligibility -TargetTaskId $runnerNextTask
        Write-Section -Title "Queue Drain Eligibility"
        $eligibilityResult.Output | ForEach-Object { Write-Output $_ }
        $eligibilityDecision = Get-DecisionValue -Output $eligibilityResult.Output -Key "queueDrainEligibilityDecision"
        if ($eligibilityResult.ExitCode -ne 0 -or $eligibilityDecision -eq "stop_for_hard_block") {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "queue drain eligibility hard-blocked task $runnerNextTask" -SafeToContinue $false -ExitCode 1 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
        }
        if ($eligibilityDecision -eq "single_task_only" -or $eligibilityDecision -eq "not_eligible") {
            Write-QueueDrainResult -Decision "approval_required" -NextAction "stop_and_report" -Reason "task is not eligible for multi-task queue drain: $eligibilityDecision" -SafeToContinue $false -ExitCode 0 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
        }
        if ($eligibilityDecision -ne "eligible") {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "unknown eligibility decision: $eligibilityDecision" -SafeToContinue $false -ExitCode 1 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
        }

        if (-not $PlanOnly -and [string]::IsNullOrWhiteSpace($RunnerOutputPath)) {
            $temporaryRunnerOutputPath = Join-Path -Path (Resolve-ManifestRoot) -ChildPath "$RunId-runner-output.txt"
            New-Item -ItemType Directory -Path (Split-Path -Parent $temporaryRunnerOutputPath) -Force | Out-Null
            $runnerResult.Output | Set-Content -LiteralPath $temporaryRunnerOutputPath -Encoding UTF8
            $dispatcherResult = Invoke-Dispatcher -RunnerOutputFile $temporaryRunnerOutputPath
            Write-Section -Title "Agent Action Dispatcher"
            $dispatcherResult.Output | ForEach-Object { Write-Output $_ }
            $agentAction = Get-DecisionValue -Output $dispatcherResult.Output -Key "agentAction"
            if ($dispatcherResult.ExitCode -ne 0 -or $agentAction -ne "claim_task") {
                Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "dispatcher did not approve claim_task for $runnerNextTask" -SafeToContinue $false -ExitCode 1 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
            }
        }

        Write-QueueDrainResult -Decision "ready_for_agent_task" -NextAction "agent_execute_task" -Reason "eligible low-risk task is ready for agent-layer execution" -SafeToContinue $true -ExitCode 0 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
    }

    if ($runnerDecision -eq "closeout_recovery") {
        $targetTask = if ([string]::IsNullOrWhiteSpace($TaskId)) { $runnerNextTask } else { $TaskId }
        if ([string]::IsNullOrWhiteSpace($targetTask)) {
            $targetTask = Get-DecisionValue -Output $runnerResult.Output -Key "runnerNextTask"
        }
        if ([string]::IsNullOrWhiteSpace($targetTask) -and (Test-Path -LiteralPath $ProjectStatePath)) {
            $targetTask = Get-CurrentTaskId -Lines @(Get-Content -LiteralPath $ProjectStatePath)
        }

        if ($PlanOnly -or -not $ExecuteCloseout) {
            Write-QueueDrainResult -Decision "ready_for_agent_task" -NextAction "run_approved_closeout" -Reason "closeout is ready but ExecuteCloseout was not requested" -SafeToContinue $true -ExitCode 0 -NextTask $targetTask -RunnerDecision $runnerDecision
        }

        $closeoutResult = Invoke-ApprovedCloseout -TargetTaskId $targetTask
        Write-Section -Title "Approved Closeout"
        $closeoutResult.Output | ForEach-Object { Write-Output $_ }
        if ($closeoutResult.ExitCode -ne 0) {
            Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "approved closeout failed for $targetTask" -SafeToContinue $false -ExitCode 1 -NextTask $targetTask -RunnerDecision $runnerDecision
        }

        Write-QueueDrainResult -Decision "closeout_executed_continue" -NextAction "rerun_startup_for_next_task" -Reason "approved closeout executed; queue drain may rerun startup within budget" -SafeToContinue $true -ExitCode 0 -NextTask $targetTask -RunnerDecision $runnerDecision
    }

    if ($runnerDecision -eq "continue_current_task" -or $runnerDecision -eq "prepare_parallel_workers" -or $runnerDecision -eq "launch_new_thread" -or $runnerDecision -like "prepare_handoff*") {
        Write-QueueDrainResult -Decision "ready_for_agent_task" -NextAction $runnerNextAction -Reason "runner selected agent-layer action $runnerNextAction" -SafeToContinue $true -ExitCode 0 -NextTask $runnerNextTask -RunnerDecision $runnerDecision
    }

    Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "unknown runner decision: $runnerDecision" -SafeToContinue $false -ExitCode 1 -RunnerDecision $runnerDecision
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-QueueDrainResult -Decision "hard_block" -NextAction "stop_and_report" -Reason "queue drain supervisor encountered an error" -SafeToContinue $false -ExitCode 1
}
