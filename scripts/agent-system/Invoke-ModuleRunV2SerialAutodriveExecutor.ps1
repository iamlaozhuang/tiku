param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$AgentActionOverride = "",

    [Parameter(Mandatory = $false)]
    [string]$AgentActionTaskOverride = "",

    [Parameter(Mandatory = $false)]
    [string]$DispatcherOutputPath = "",

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
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [switch]$Execute,

    [Parameter(Mandatory = $false)]
    [switch]$RunValidation,

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

function Remove-ValueQuotes {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $trimmedValue = $Value.Trim()
    if ($trimmedValue.Length -ge 2) {
        $firstChar = $trimmedValue.Substring(0, 1)
        $lastChar = $trimmedValue.Substring($trimmedValue.Length - 1, 1)
        if (($firstChar -eq '"' -and $lastChar -eq '"') -or ($firstChar -eq "'" -and $lastChar -eq "'")) {
            return $trimmedValue.Substring(1, $trimmedValue.Length - 2)
        }
    }

    return $trimmedValue
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

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $currentId = ""
    $currentLines = New-Object System.Collections.Generic.List[string]

    foreach ($line in $Lines) {
        if ($line -match "^\s+- id:\s+(.+?)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentId)) {
                $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
            }
            $currentId = Remove-ValueQuotes -Value $Matches[1]
            $currentLines = New-Object System.Collections.Generic.List[string]
            $currentLines.Add($line)
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($currentId)) {
            $currentLines.Add($line)
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentId)) {
        $blocks.Add([pscustomobject]@{ Id = $currentId; Lines = $currentLines.ToArray() })
    }

    return $blocks.ToArray()
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][object[]]$Blocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($block in $Blocks) {
        if ($block.Id -eq $Id) {
            return $block.Lines
        }
    }

    return @()
}

function Get-TaskScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s{4}$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s{6}-\s+(.+?)\s*$") {
            $values.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideList -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-TaskValidationLifecycleCommands {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$IncludedPhases
    )

    $commands = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    $currentPhase = ""

    foreach ($line in $Block) {
        if ($line -match "^\s{4}validationCommandLifecycle:\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^\s{6}-\s+phase:\s*(.+?)\s*$") {
            $currentPhase = Remove-ValueQuotes -Value $Matches[1]
            continue
        }

        if ($line -match "^\s{8}command:\s*(.+?)\s*$") {
            $command = Remove-ValueQuotes -Value $Matches[1]
            if ($IncludedPhases -contains $currentPhase) {
                $commands.Add($command)
            }
        }
    }

    return $commands.ToArray()
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

        if ($insideCurrentTask -and $line -match "^\s+id:\s*(.+)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
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

function Invoke-AgentActionDispatcher {
    $dispatcherArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        (Join-Path -Path $agentSystemRoot -ChildPath "Invoke-ModuleRunV2AgentActionDispatcher.ps1"),
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath,
        "-SchemaPath",
        $SchemaPath
    )

    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        $dispatcherArgs += @("-TaskId", $TaskId)
    }
    if ($AllowProtectedBranch) {
        $dispatcherArgs += "-AllowProtectedBranch"
    }

    return Invoke-ExternalCommand -Arguments $dispatcherArgs
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

function Write-SerialExecutorResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Action,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$TargetTaskId = ""
    )

    Write-Section -Title "Module Run v2 Serial Autodrive Executor"
    Write-Output "serialExecutorDecision: $Decision"
    Write-Output "serialExecutorAction: $Action"
    if (-not [string]::IsNullOrWhiteSpace($TargetTaskId)) {
        Write-Output "serialExecutorTask: $TargetTaskId"
    }
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Assert-SchemaReady {
    param([Parameter(Mandatory = $true)][string]$TargetTaskId)

    Write-Section -Title "Schema Readiness For $TargetTaskId"
    $schemaResult = Invoke-AutodriveSchemaReadiness -TargetTaskId $TargetTaskId
    $schemaResult.Output | ForEach-Object { Write-Output $_ }
    $schemaDecision = Get-DecisionValue -Output $schemaResult.Output -Key "autodriveSchemaDecision"

    if ($schemaResult.ExitCode -ne 0 -or [string]::IsNullOrWhiteSpace($schemaDecision)) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "autodrive schema readiness failed" -ExitCode 1 -TargetTaskId $TargetTaskId
    }

    if ($schemaDecision -eq "proposal_only") {
        Write-SerialExecutorResult -Decision "proposal_only" -Action "propose_schema_repair" -Reason "target task is not executable by unattended autodrive yet" -ExitCode 0 -TargetTaskId $TargetTaskId
    }

    if ($schemaDecision -ne "can_autodrive") {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "unknown autodrive schema decision: $schemaDecision" -ExitCode 1 -TargetTaskId $TargetTaskId
    }
}

function Get-QueueContext {
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    return [pscustomobject]@{
        Lines = $queueLines
        Blocks = @(Get-TaskBlocks -Lines $queueLines)
    }
}

function Get-TargetTaskBlockOrStop {
    param(
        [Parameter(Mandatory = $true)][object]$QueueContext,
        [Parameter(Mandatory = $true)][string]$TargetTaskId
    )

    $taskBlock = @(Get-TaskBlock -Blocks $QueueContext.Blocks -Id $TargetTaskId)
    if ($taskBlock.Count -eq 0) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "target task is not present in queue" -ExitCode 1 -TargetTaskId $TargetTaskId
    }

    return $taskBlock
}

function Assert-TaskDependenciesComplete {
    param(
        [Parameter(Mandatory = $true)][object]$QueueContext,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$TargetTaskId
    )

    $dependencies = @(Get-TaskListValues -Block $TaskBlock -Key "dependencies")
    $terminalStatuses = @("done", "closed", "pushed", "merged")
    $incompleteDependencies = New-Object System.Collections.Generic.List[string]
    foreach ($dependency in $dependencies) {
        $dependencyBlock = @(Get-TaskBlock -Blocks $QueueContext.Blocks -Id $dependency)
        if ($dependencyBlock.Count -eq 0) {
            $incompleteDependencies.Add("$dependency (missing)")
            continue
        }

        $dependencyStatus = Get-TaskScalarValue -Block $dependencyBlock -Key "status"
        if ($terminalStatuses -notcontains $dependencyStatus) {
            $incompleteDependencies.Add("$dependency ($dependencyStatus)")
        }
    }

    if ($incompleteDependencies.Count -gt 0) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "dependencies are not complete: $($incompleteDependencies -join ', ')" -ExitCode 1 -TargetTaskId $TargetTaskId
    }
}

function Update-QueueStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][string]$Status
    )

    $lines = @(Get-Content -LiteralPath $Path)
    $insideBlock = $false
    $hasFoundTask = $false
    $hasUpdatedStatus = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^\s+- id:\s+$([regex]::Escape($TargetTaskId))\s*$") {
            $insideBlock = $true
            $hasFoundTask = $true
            continue
        }

        if ($insideBlock -and $lines[$index] -match "^\s+- id:\s+\S+") {
            break
        }

        if ($insideBlock -and $lines[$index] -match "^\s+status:\s*.+$") {
            $prefix = ($lines[$index] -replace "status:.*$", "")
            $lines[$index] = "$prefix" + "status: $Status"
            $hasUpdatedStatus = $true
            break
        }
    }

    if (-not $hasFoundTask) {
        throw "Task id not found while updating queue: $TargetTaskId"
    }
    if (-not $hasUpdatedStatus) {
        throw "Status line not found while updating queue: $TargetTaskId"
    }

    Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

function Set-ProjectStateCurrentTask {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock
    )

    $lines = @(Get-Content -LiteralPath $Path)
    $phase = Get-TaskScalarValue -Block $TaskBlock -Key "phase"
    $sourceStory = Get-TaskScalarValue -Block $TaskBlock -Key "sourceStory"
    $evidencePath = Get-TaskScalarValue -Block $TaskBlock -Key "evidencePath"
    $auditReviewPath = Get-TaskScalarValue -Block $TaskBlock -Key "auditReviewPath"
    $retryCount = Get-TaskScalarValue -Block $TaskBlock -Key "retryCount"
    if ([string]::IsNullOrWhiteSpace($retryCount)) {
        $retryCount = "0"
    }

    $planPath = ""
    foreach ($candidatePath in @(Get-TaskListValues -Block $TaskBlock -Key "allowedFiles")) {
        if ($candidatePath -match "^docs/05-execution-logs/task-plans/.+\.md$") {
            $planPath = $candidatePath
            break
        }
    }

    if ([string]::IsNullOrWhiteSpace($phase)) {
        $phase = $TargetTaskId
    }
    if ([string]::IsNullOrWhiteSpace($sourceStory)) {
        $sourceStory = "autodrive-serial-executor"
    }
    if ([string]::IsNullOrWhiteSpace($planPath)) {
        $planPath = "pending-task-plan"
    }
    if ([string]::IsNullOrWhiteSpace($evidencePath)) {
        $evidencePath = "pending-evidence"
    }
    if ([string]::IsNullOrWhiteSpace($auditReviewPath)) {
        $auditReviewPath = "pending-audit-review"
    }

    $currentBranch = ((& git branch --show-current) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "(detached HEAD)"
    }

    $currentTaskLines = @(
        "currentTask:",
        "  id: $TargetTaskId",
        "  status: in_progress",
        "  sourceStory: $sourceStory",
        "  planPath: $planPath",
        "  evidencePath: $evidencePath",
        "  auditReviewPath: $auditReviewPath",
        "  branch: $currentBranch",
        "  commitSha: pending-local-commit",
        "  prUrl: null",
        "  retryCount: $retryCount",
        "  lastFailurePath: null"
    )

    $updatedLines = New-Object System.Collections.Generic.List[string]
    $insideCurrentTask = $false
    $hasReplacedCurrentTask = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        $line = $lines[$index]

        if ($line -match "^updatedAt:\s*.+$") {
            $updatedLines.Add("updatedAt: `"$([DateTimeOffset]::Now.ToString("yyyy-MM-ddTHH:mm:sszzz"))`"")
            continue
        }

        if ($line -match "^\s+currentPhase:\s*.+$") {
            $prefix = ($line -replace "currentPhase:.*$", "")
            $updatedLines.Add("$prefix" + "currentPhase: $phase")
            continue
        }

        if ($line -match "^currentTask:\s*$") {
            $currentTaskLines | ForEach-Object { $updatedLines.Add($_) }
            $insideCurrentTask = $true
            $hasReplacedCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            $insideCurrentTask = $false
        }

        if ($insideCurrentTask) {
            continue
        }

        $updatedLines.Add($line)
    }

    if (-not $hasReplacedCurrentTask) {
        $currentTaskLines | ForEach-Object { $updatedLines.Add($_) }
    }

    Set-Content -LiteralPath $Path -Value $updatedLines -Encoding UTF8
}

function Test-ValidationCommandSafe {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Command)

    $blockedPatterns = @(
        "(?i)\.env(\.|$|\\|/)",
        "(?i)\bsecret\b|\btoken\b|\bpassword\b|\bapi[_-]?key\b|\bDATABASE_URL\b",
        "(?i)\bcurl\b|\bInvoke-WebRequest\b|\bInvoke-RestMethod\b",
        "(?i)\bprovider\b|\bpayment\b|\bexternal-service\b|\bexternal_service\b",
        "(?i)\bdrizzle-kit\s+push\b|\bdrizzle-kit\s+migrate\b|\bdrizzle-kit\s+generate\b",
        "(?i)\bmigrate\b|\bmigration\b|src[\\/]+db[\\/]+schema|^drizzle[\\/]",
        "(?i)\bdocker\b|\bdocker-compose\b|\bpsql\b|\bcreatedb\b|\bdropdb\b",
        "(?i)\bdeploy\b|\bvercel\b|\bwrangler\b",
        "(?i)\bgit\s+push\b|\bgit\s+merge\b|\bgit\s+reset\b|\bgit\s+clean\b|\bgit\s+branch\s+-d\b",
        "(?i)\bgh\s+pr\b|\bforce-with-lease\b",
        "(?i)\bRemove-Item\b|\brmdir\b|\bdel\b"
    )

    foreach ($pattern in $blockedPatterns) {
        if ($Command -match $pattern) {
            return [pscustomobject]@{
                IsSafe = $false
                Pattern = $pattern
            }
        }
    }

    return [pscustomobject]@{
        IsSafe = $true
        Pattern = ""
    }
}

function Invoke-ValidationCommand {
    param([Parameter(Mandatory = $true)][string]$Command)

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -Command $Command 2>&1)
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-RunRegistryFinalizer {
    param(
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$Phase,
        [Parameter(Mandatory = $true)][string]$BlockerKind,
        [Parameter(Mandatory = $true)][string]$CloseoutTransactionState,
        [Parameter(Mandatory = $true)][string]$NextRecommendedAction
    )

    $finalizerPath = Join-Path -Path $agentSystemRoot -ChildPath "Set-ModuleRunV2RunRegistryFinalizer.ps1"
    if (-not (Test-Path -LiteralPath $finalizerPath)) {
        Write-Output "runRegistryFinalizer: missing"
        return
    }

    $evidencePath = Get-TaskScalarValue -Block $TaskBlock -Key "evidencePath"
    $auditReviewPath = Get-TaskScalarValue -Block $TaskBlock -Key "auditReviewPath"
    $finalizerArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $finalizerPath,
        "-TaskId",
        $TargetTaskId,
        "-Status",
        "stopped",
        "-Phase",
        $Phase,
        "-BlockerKind",
        $BlockerKind,
        "-EvidencePath",
        $evidencePath,
        "-AuditReviewPath",
        $auditReviewPath,
        "-CloseoutTransactionState",
        $CloseoutTransactionState,
        "-CleanupPolicy",
        "none",
        "-NextRecommendedAction",
        $NextRecommendedAction
    )
    if (-not [string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
        $finalizerArgs += @("-RunRegistryRoot", $RunRegistryRoot)
    }

    $finalizerOutput = @(
        & powershell.exe @finalizerArgs 2>&1
    )
    foreach ($line in $finalizerOutput) {
        Write-Output "runRegistryFinalizerOutput: $line"
    }
}

function Get-ResolvedTargetTaskId {
    param([Parameter(Mandatory = $false)][AllowEmptyString()][string]$CandidateTaskId)

    if (-not [string]::IsNullOrWhiteSpace($AgentActionTaskOverride)) {
        return $AgentActionTaskOverride
    }
    if (-not [string]::IsNullOrWhiteSpace($CandidateTaskId)) {
        return $CandidateTaskId
    }
    if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
        return $TaskId
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    return Get-CurrentTaskId -Lines $projectStateLines
}

try {
    Write-Section -Title "Module Run v2 Serial Autodrive Executor Input"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "project state is missing" -ExitCode 1
    }
    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "task queue is missing" -ExitCode 1
    }
    if (-not (Test-Path -LiteralPath $SchemaPath)) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "autodrive schema contract is missing" -ExitCode 1
    }

    if (-not [string]::IsNullOrWhiteSpace($AgentActionOverride)) {
        $agentAction = $AgentActionOverride
        $agentActionTask = $AgentActionTaskOverride
        $dispatcherExitCode = 0
        Write-Output "agentInput: override"
    } else {
        if (-not [string]::IsNullOrWhiteSpace($DispatcherOutputPath)) {
            if (-not (Test-Path -LiteralPath $DispatcherOutputPath)) {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "dispatcher output path is missing" -ExitCode 1
            }
            $dispatcherOutput = @(Get-Content -LiteralPath $DispatcherOutputPath)
            $dispatcherExitCode = 0
            Write-Output "agentInput: dispatcher_file"
            Write-Output "dispatcherOutputPath: $DispatcherOutputPath"
        } else {
            $dispatcherResult = Invoke-AgentActionDispatcher
            $dispatcherOutput = @($dispatcherResult.Output)
            $dispatcherExitCode = $dispatcherResult.ExitCode
            Write-Output "agentInput: live_dispatcher"
        }

        $dispatcherOutput | ForEach-Object { Write-Output $_ }
        $agentAction = Get-DecisionValue -Output $dispatcherOutput -Key "agentAction"
        $agentActionTask = Get-DecisionValue -Output $dispatcherOutput -Key "agentActionTask"
    }

    Write-Section -Title "Agent Action"
    Write-Output "agentAction: $agentAction"
    if (-not [string]::IsNullOrWhiteSpace($agentActionTask)) {
        Write-Output "agentActionTask: $agentActionTask"
    }

    if ($dispatcherExitCode -ne 0 -and $agentAction -notin @("request_manual_decision", "request_human_handoff", "stop_for_hard_block")) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "dispatcher failed without a recognized stop action" -ExitCode 1
    }

    if ([string]::IsNullOrWhiteSpace($agentAction)) {
        Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "agent action is missing" -ExitCode 1
    }

    switch ($agentAction) {
        "idle_active_owner_present" {
            Write-SerialExecutorResult -Decision "idle" -Action "idle_active_owner_present" -Reason "active owner present, guardian leaves the lane alone" -ExitCode 0
        }
        "idle_no_executable_task" {
            Write-SerialExecutorResult -Decision "idle" -Action "idle_no_executable_task" -Reason "no executable task is available" -ExitCode 0
        }
        "propose_schema_repair" {
            Write-SerialExecutorResult -Decision "proposal_only" -Action "propose_schema_repair" -Reason "schema repair proposal required before execution" -ExitCode 0 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "continue_task" {
            $targetTask = Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask
            if ([string]::IsNullOrWhiteSpace($targetTask)) {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "target task is missing for continue_task" -ExitCode 1
            }

            Assert-SchemaReady -TargetTaskId $targetTask
            $queueContext = Get-QueueContext
            $taskBlock = @(Get-TargetTaskBlockOrStop -QueueContext $queueContext -TargetTaskId $targetTask)
            $status = Get-TaskScalarValue -Block $taskBlock -Key "status"
            if ($status -ne "in_progress") {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "continue_task requires in_progress status, actual: $status" -ExitCode 1 -TargetTaskId $targetTask
            }

            Write-SerialExecutorResult -Decision "ready_to_continue" -Action "continue_task" -Reason "schema and status allow same-thread continuation" -ExitCode 0 -TargetTaskId $targetTask
        }
        "claim_task" {
            $targetTask = Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask
            if ([string]::IsNullOrWhiteSpace($targetTask)) {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "target task is missing for claim_task" -ExitCode 1
            }

            Assert-SchemaReady -TargetTaskId $targetTask
            $queueContext = Get-QueueContext
            $taskBlock = @(Get-TargetTaskBlockOrStop -QueueContext $queueContext -TargetTaskId $targetTask)
            $status = Get-TaskScalarValue -Block $taskBlock -Key "status"
            if ($status -ne "pending") {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "claim_task requires pending status, actual: $status" -ExitCode 1 -TargetTaskId $targetTask
            }
            Assert-TaskDependenciesComplete -QueueContext $queueContext -TaskBlock $taskBlock -TargetTaskId $targetTask

            if (-not $Execute) {
                Write-SerialExecutorResult -Decision "ready_to_claim" -Action "claim_task" -Reason "claim transaction is ready; rerun with -Execute to write queue and project state" -ExitCode 0 -TargetTaskId $targetTask
            }

            Update-QueueStatus -Path $QueuePath -TargetTaskId $targetTask -Status "in_progress"
            Set-ProjectStateCurrentTask -Path $ProjectStatePath -TargetTaskId $targetTask -TaskBlock $taskBlock
            Write-SerialExecutorResult -Decision "task_claimed" -Action "claim_task" -Reason "queue and project state were updated for the claimed task" -ExitCode 0 -TargetTaskId $targetTask
        }
        "run_validation" {
            $targetTask = Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask
            if ([string]::IsNullOrWhiteSpace($targetTask)) {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "target task is missing for run_validation" -ExitCode 1
            }

            Assert-SchemaReady -TargetTaskId $targetTask
            $queueContext = Get-QueueContext
            $taskBlock = @(Get-TargetTaskBlockOrStop -QueueContext $queueContext -TargetTaskId $targetTask)
            $validationLifecycleCommands = @(Get-TaskValidationLifecycleCommands -Block $taskBlock -IncludedPhases @("post_edit", "closeout"))
            $validationCommands = @()
            if ($validationLifecycleCommands.Count -gt 0) {
                $validationCommands = $validationLifecycleCommands
                Write-Output "validationLifecycleMode: phase_filtered"
                Write-Output "validationLifecycleIncludedPhases: post_edit,closeout"
            } else {
                $validationCommands = @(Get-TaskListValues -Block $taskBlock -Key "validationCommands")
                Write-Output "validationLifecycleMode: legacy_validationCommands"
            }
            if ($validationCommands.Count -eq 0) {
                Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "task has no validation commands" -ExitCode 1 -TargetTaskId $targetTask
            }

            Write-Section -Title "Validation Command Safety"
            foreach ($validationCommand in $validationCommands) {
                $safety = Test-ValidationCommandSafe -Command $validationCommand
                if (-not $safety.IsSafe) {
                    Write-Output "blocked command: $validationCommand"
                    Write-Output "blockedPattern: $($safety.Pattern)"
                    Invoke-RunRegistryFinalizer -TargetTaskId $targetTask -TaskBlock $taskBlock -Phase "validation_safety" -BlockerKind "blocked_validation_command" -CloseoutTransactionState "unknown" -NextRecommendedAction "manual_required_owner_recovery"
                    Write-SerialExecutorResult -Decision "blocked_command" -Action "run_validation" -Reason "validation command is outside the local safe command allowlist" -ExitCode 1 -TargetTaskId $targetTask
                }

                Write-Output "safe command: $validationCommand"
            }

            if (-not $RunValidation) {
                Write-SerialExecutorResult -Decision "validation_ready" -Action "run_validation" -Reason "validation commands passed the safety filter; rerun with -RunValidation to execute" -ExitCode 0 -TargetTaskId $targetTask
            }

            Write-Section -Title "Validation Execution"
            foreach ($validationCommand in $validationCommands) {
                Write-Output "running command: $validationCommand"
                $validationResult = Invoke-ValidationCommand -Command $validationCommand
                $validationResult.Output | ForEach-Object { Write-Output "validationOutput: $_" }
                if ($validationResult.ExitCode -ne 0) {
                    Invoke-RunRegistryFinalizer -TargetTaskId $targetTask -TaskBlock $taskBlock -Phase "validation_failed" -BlockerKind "validation_command_failed" -CloseoutTransactionState "closeout_pending_evidence" -NextRecommendedAction "manual_required_owner_recovery"
                    Write-SerialExecutorResult -Decision "validation_failed" -Action "run_validation" -Reason "validation command failed: $validationCommand" -ExitCode 1 -TargetTaskId $targetTask
                }
            }

            Write-SerialExecutorResult -Decision "validation_passed" -Action "run_validation" -Reason "all safe validation commands passed" -ExitCode 0 -TargetTaskId $targetTask
        }
        "run_hygiene_cleanup" {
            Write-SerialExecutorResult -Decision "handoff_to_hygiene_gate" -Action "run_hygiene_cleanup" -Reason "serial executor does not broaden cleanup; use the stopped-automation hygiene gate" -ExitCode 0
        }
        "run_closeout_recovery" {
            Write-SerialExecutorResult -Decision "handoff_to_closeout_recovery" -Action "run_closeout_recovery" -Reason "closeout recovery remains bounded by unattended readiness, approved closeout, and post-closeout state reconcile gates" -ExitCode 0 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "adopt_recoverable_run" {
            Write-SerialExecutorResult -Decision "handoff_to_recovery" -Action "adopt_recoverable_run" -Reason "recovery adoption is handled by the startup and handoff gates" -ExitCode 0
        }
        "open_recovery_plan" {
            Write-SerialExecutorResult -Decision "handoff_to_recovery" -Action "open_recovery_plan" -Reason "recovery planning requires the startup recovery path" -ExitCode 0
        }
        "review_handoff" {
            Write-SerialExecutorResult -Decision "handoff_review_required" -Action "review_handoff" -Reason "handoff review is advisory in the serial executor" -ExitCode 0 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "launch_new_thread" {
            Write-SerialExecutorResult -Decision "defer_to_thread_phase" -Action "launch_new_thread" -Reason "thread launch remains an agent-layer action with separate policy approval" -ExitCode 0 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "prepare_parallel_workers" {
            Write-SerialExecutorResult -Decision "defer_to_parallel_phase" -Action "prepare_parallel_workers" -Reason "parallel worker assignment is handled by the parallel coordinator phase" -ExitCode 0 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "request_manual_decision" {
            Write-SerialExecutorResult -Decision "manual_required" -Action "request_manual_decision" -Reason "agent action requires a manual decision" -ExitCode 1 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "request_human_handoff" {
            Write-SerialExecutorResult -Decision "manual_required" -Action "request_human_handoff" -Reason "agent action requires human handoff" -ExitCode 1 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        "stop_for_hard_block" {
            Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "agent action reported a hard block" -ExitCode 1 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
        default {
            Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "unknown agent action: $agentAction" -ExitCode 1 -TargetTaskId (Get-ResolvedTargetTaskId -CandidateTaskId $agentActionTask)
        }
    }
} catch {
    Write-Output "HARD_BLOCK_SERIAL_AUTODRIVE_EXECUTOR_EXCEPTION $($_.Exception.Message)"
    Write-SerialExecutorResult -Decision "stop_for_hard_block" -Action "stop_for_hard_block" -Reason "serial executor script exception" -ExitCode 1
}
