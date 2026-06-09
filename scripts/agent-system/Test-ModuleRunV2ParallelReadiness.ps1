param(
    [Parameter(Mandatory = $false)]
    [string[]]$CandidateTaskIds = @(),

    [Parameter(Mandatory = $false)]
    [string]$CoordinatorTaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml"
)

$ErrorActionPreference = "Stop"

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

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Message)

    $script:findings.Add($Message)
    Write-Output $Message
}

function Write-ParallelResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "parallelDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
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

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return (Remove-ValueQuotes -Value $Matches[1])
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s+-\s+(.+?)\s*$") {
            $values.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideList -and $line -match "^\s+\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
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
            return (Remove-ValueQuotes -Value $Matches[1])
        }
    }

    return ""
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path)

    $normalizedPath = (Remove-ValueQuotes -Value $Path).Replace("\", "/").Trim()
    while ($normalizedPath.StartsWith("./")) {
        $normalizedPath = $normalizedPath.Substring(2)
    }
    return $normalizedPath.TrimStart("/")
}

function Test-PathPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $normalizedPattern = ConvertTo-NormalizedPath -Path $Pattern

    if ($normalizedPattern.EndsWith("/**")) {
        $prefix = $normalizedPattern.Substring(0, $normalizedPattern.Length - 3)
        return $normalizedPath -eq $prefix -or $normalizedPath.StartsWith("$prefix/")
    }

    return $normalizedPath -like $normalizedPattern
}

function Get-StaticPrefix {
    param([Parameter(Mandatory = $true)][string]$Pattern)

    $normalizedPattern = ConvertTo-NormalizedPath -Path $Pattern
    $wildcardIndex = $normalizedPattern.IndexOfAny([char[]]@("*", "?"))
    if ($wildcardIndex -lt 0) {
        return $normalizedPattern
    }

    $prefix = $normalizedPattern.Substring(0, $wildcardIndex)
    $lastSlash = $prefix.LastIndexOf("/")
    if ($lastSlash -ge 0) {
        return $prefix.Substring(0, $lastSlash + 1)
    }

    return $prefix
}

function Test-PatternOverlap {
    param(
        [Parameter(Mandatory = $true)][string]$FirstPattern,
        [Parameter(Mandatory = $true)][string]$SecondPattern
    )

    $first = ConvertTo-NormalizedPath -Path $FirstPattern
    $second = ConvertTo-NormalizedPath -Path $SecondPattern

    if ($first -eq $second) {
        return $true
    }

    if ($first.EndsWith("/**")) {
        $firstPrefix = $first.Substring(0, $first.Length - 3)
        if ($second -eq $firstPrefix -or $second.StartsWith("$firstPrefix/")) {
            return $true
        }
        if ($second.EndsWith("/**")) {
            $secondPrefix = $second.Substring(0, $second.Length - 3)
            return $firstPrefix.StartsWith("$secondPrefix/") -or $secondPrefix.StartsWith("$firstPrefix/")
        }
    }

    if ($second.EndsWith("/**")) {
        return Test-PatternOverlap -FirstPattern $second -SecondPattern $first
    }

    if (($first -match "[*?]") -and -not ($second -match "[*?]")) {
        return Test-PathPattern -Path $second -Pattern $first
    }

    if (($second -match "[*?]") -and -not ($first -match "[*?]")) {
        return Test-PathPattern -Path $first -Pattern $second
    }

    if (($first -match "[*?]") -and ($second -match "[*?]")) {
        $firstPrefix = Get-StaticPrefix -Pattern $first
        $secondPrefix = Get-StaticPrefix -Pattern $second
        return $firstPrefix.StartsWith($secondPrefix) -or $secondPrefix.StartsWith($firstPrefix)
    }

    return $false
}

function Get-MatchingPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

function Test-AllAllowedFilesAreDocs {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$AllowedFiles)

    if ($AllowedFiles.Count -eq 0) {
        return $false
    }

    foreach ($allowedFile in $AllowedFiles) {
        if (-not (ConvertTo-NormalizedPath -Path $allowedFile).StartsWith("docs/")) {
            return $false
        }
    }

    return $true
}

function Get-TaskReadiness {
    param(
        [Parameter(Mandatory = $true)][string]$TaskKind,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$AllowedFiles,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$RiskTypes
    )

    $blockedRiskTypes = @(
        "provider",
        "env",
        "secret",
        "deploy",
        "cloud",
        "payment",
        "external_service",
        "external-service",
        "dependency",
        "schema",
        "migration",
        "e2e",
        "cost_calibration",
        "cost-calibration",
        "cost calibration gate"
    )
    foreach ($riskType in $RiskTypes) {
        if ($blockedRiskTypes -contains $riskType.ToLowerInvariant()) {
            return [pscustomobject]@{
                Level = "blocked_gate"
                Reason = "blocked risk gate: $riskType"
            }
        }
    }

    $blockedFilePatterns = @(
        ".env*",
        "package.json",
        "package-lock.json",
        "pnpm-lock.yaml",
        "yarn.lock",
        "bun.lockb",
        "src/db/schema/**",
        "drizzle/**",
        "migrations/**",
        "e2e/**"
    )
    foreach ($allowedFile in $AllowedFiles) {
        $blockedFilePattern = Get-MatchingPattern -Path $allowedFile -Patterns $blockedFilePatterns
        if (-not [string]::IsNullOrWhiteSpace($blockedFilePattern)) {
            return [pscustomobject]@{
                Level = "blocked_gate"
                Reason = "blocked file scope: $blockedFilePattern"
            }
        }
    }

    if (@("blocked_gate", "dependency", "deploy", "external_service") -contains $TaskKind.ToLowerInvariant()) {
        return [pscustomobject]@{
            Level = "blocked_gate"
            Reason = "blocked task kind: $TaskKind"
        }
    }

    $serialPatterns = @(
        "docs/04-agent-system/state/**",
        "scripts/**",
        "docs/04-agent-system/sop/automated-advancement-governance.md",
        "docs/04-agent-system/sop/parallel-work-governance.md",
        "docs/04-agent-system/sop/task-lifecycle-governance.md",
        "docs/04-agent-system/sop/skill-dispatch-*"
    )
    foreach ($allowedFile in $AllowedFiles) {
        $serialPattern = Get-MatchingPattern -Path $allowedFile -Patterns $serialPatterns
        if (-not [string]::IsNullOrWhiteSpace($serialPattern)) {
            return [pscustomobject]@{
                Level = "serial_only"
                Reason = "shared coordinator-owned scope: $serialPattern"
            }
        }
    }

    if ($TaskKind -eq "read_only") {
        return [pscustomobject]@{
            Level = "read_only"
            Reason = "read-only inspection task"
        }
    }

    if ($TaskKind -eq "docs_only" -and (Test-AllAllowedFilesAreDocs -AllowedFiles $AllowedFiles)) {
        return [pscustomobject]@{
            Level = "docs_isolated"
            Reason = "docs-only isolated write scope"
        }
    }

    if (@("implementation", "local_verification") -contains $TaskKind) {
        return [pscustomobject]@{
            Level = "code_isolated"
            Reason = "non-shared local implementation scope"
        }
    }

    return [pscustomobject]@{
        Level = "serial_only"
        Reason = "unclassified task kind requires serial coordinator review"
    }
}

$findings = New-Object System.Collections.Generic.List[string]
$taskRecords = New-Object System.Collections.Generic.List[object]
$fileLocks = New-Object System.Collections.Generic.List[object]
$conflicts = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Parallel Readiness"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Add-Finding -Message "HARD_BLOCK_MISSING_PROJECT_STATE $ProjectStatePath"
    }

    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Add-Finding -Message "HARD_BLOCK_MISSING_TASK_QUEUE $QueuePath"
    }

    if ($findings.Count -gt 0) {
        Write-ParallelResult -Decision "stop_for_hard_block" -Reason "missing durable state files" -ExitCode 1
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

    if ([string]::IsNullOrWhiteSpace($CoordinatorTaskId)) {
        $CoordinatorTaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    if ($CandidateTaskIds.Count -eq 0) {
        $currentTaskId = Get-CurrentTaskId -Lines $projectStateLines
        if (-not [string]::IsNullOrWhiteSpace($currentTaskId)) {
            $CandidateTaskIds = @($currentTaskId)
        }
    }

    Write-Output "candidateTaskCount: $($CandidateTaskIds.Count)"
    Write-Output "coordinator: required"
    Write-Output "coordinatorTaskId: $CoordinatorTaskId"
    Write-Output "workerIsolation: required"
    Write-Output "serialIntegration: required"

    if ($CandidateTaskIds.Count -eq 0) {
        Add-Finding -Message "HARD_BLOCK_NO_CANDIDATE_TASKS"
        Write-ParallelResult -Decision "stop_for_hard_block" -Reason "no candidate task ids were provided or recoverable" -ExitCode 1
    }

    foreach ($candidateTaskId in $CandidateTaskIds) {
        $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $candidateTaskId)
        if ($taskBlock.Count -eq 0) {
            Add-Finding -Message "HARD_BLOCK_CANDIDATE_TASK_NOT_FOUND $candidateTaskId"
            continue
        }

        $status = Get-ScalarValue -Block $taskBlock -Key "status"
        $taskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
        $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
        $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
        $riskTypes = @(Get-ListValues -Block $taskBlock -Key "riskTypes")
        $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
        $dependencies = @(Get-ListValues -Block $taskBlock -Key "dependencies")

        if ([string]::IsNullOrWhiteSpace($status)) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_STATUS $candidateTaskId"
        } elseif (@("pending", "in_progress") -notcontains $status) {
            Add-Finding -Message "HARD_BLOCK_TASK_STATUS $candidateTaskId $status"
        }

        if ([string]::IsNullOrWhiteSpace($taskKind)) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_TASK_KIND $candidateTaskId"
        }

        if ($allowedFiles.Count -eq 0) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_ALLOWED_FILES $candidateTaskId"
        }

        if ($blockedFiles.Count -eq 0) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_BLOCKED_FILES $candidateTaskId"
        }

        if ($riskTypes.Count -eq 0) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_RISK_TYPES $candidateTaskId"
        }

        if ($validationCommands.Count -eq 0) {
            Add-Finding -Message "HARD_BLOCK_TASK_MISSING_VALIDATION_COMMANDS $candidateTaskId"
        }

        foreach ($dependencyId in $dependencies) {
            $dependencyBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $dependencyId)
            if ($dependencyBlock.Count -eq 0) {
                Add-Finding -Message "HARD_BLOCK_DEPENDENCY_NOT_FOUND $candidateTaskId $dependencyId"
                continue
            }

            $dependencyStatus = Get-ScalarValue -Block $dependencyBlock -Key "status"
            if (@("done", "closed", "pushed") -notcontains $dependencyStatus) {
                Add-Finding -Message "HARD_BLOCK_DEPENDENCY_NOT_TERMINAL $candidateTaskId $dependencyId $dependencyStatus"
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($taskKind) -and $allowedFiles.Count -gt 0 -and $riskTypes.Count -gt 0) {
            $readiness = Get-TaskReadiness -TaskKind $taskKind -AllowedFiles $allowedFiles -RiskTypes $riskTypes
        } else {
            $readiness = [pscustomobject]@{
                Level = "blocked_gate"
                Reason = "missing required task metadata"
            }
        }

        $taskRecords.Add([pscustomobject]@{
            Id = $candidateTaskId
            Status = $status
            TaskKind = $taskKind
            Level = $readiness.Level
            Reason = $readiness.Reason
            AllowedFiles = $allowedFiles
            BlockedFiles = $blockedFiles
            RiskTypes = $riskTypes
            ValidationCommands = $validationCommands
        })

        if ($readiness.Level -ne "read_only") {
            foreach ($allowedFile in $allowedFiles) {
                $fileLocks.Add([pscustomobject]@{
                    TaskId = $candidateTaskId
                    Path = (ConvertTo-NormalizedPath -Path $allowedFile)
                    Level = $readiness.Level
                })
            }
        }
    }

    Write-Section -Title "Task Readiness"
    foreach ($taskRecord in $taskRecords) {
        Write-Output "taskReadiness: $($taskRecord.Id) $($taskRecord.Level)"
        Write-Output "taskReason: $($taskRecord.Id) $($taskRecord.Reason)"
    }

    Write-Section -Title "File Locks"
    Write-Output "fileLockCount: $($fileLocks.Count)"
    foreach ($fileLock in $fileLocks) {
        Write-Output "fileLock: $($fileLock.TaskId) $($fileLock.Path)"
    }

    for ($firstIndex = 0; $firstIndex -lt $fileLocks.Count; $firstIndex++) {
        for ($secondIndex = $firstIndex + 1; $secondIndex -lt $fileLocks.Count; $secondIndex++) {
            $firstLock = $fileLocks[$firstIndex]
            $secondLock = $fileLocks[$secondIndex]
            if ($firstLock.TaskId -eq $secondLock.TaskId) {
                continue
            }

            if (Test-PatternOverlap -FirstPattern $firstLock.Path -SecondPattern $secondLock.Path) {
                $conflicts.Add("FILE_LOCK_CONFLICT $($firstLock.TaskId) $($firstLock.Path) $($secondLock.TaskId) $($secondLock.Path)")
            }
        }
    }

    foreach ($conflict in $conflicts) {
        Write-Output $conflict
    }

    if ($findings.Count -gt 0) {
        Write-ParallelResult -Decision "stop_for_hard_block" -Reason "candidate metadata or dependency hard block" -ExitCode 1
    }

    $blockedTaskRecords = @($taskRecords | Where-Object { $_.Level -eq "blocked_gate" })
    if ($blockedTaskRecords.Count -gt 0) {
        foreach ($blockedTaskRecord in $blockedTaskRecords) {
            Write-Output "BLOCKED_GATE_TASK $($blockedTaskRecord.Id) $($blockedTaskRecord.Reason)"
        }
        Write-ParallelResult -Decision "stop_for_blocked_gate" -Reason "candidate task requires a blocked gate" -ExitCode 1
    }

    if ($conflicts.Count -gt 0) {
        Write-ParallelResult -Decision "stop_for_file_lock_conflict" -Reason "candidate file locks overlap" -ExitCode 1
    }

    $serialOnlyTaskRecords = @($taskRecords | Where-Object { $_.Level -eq "serial_only" })
    if ($serialOnlyTaskRecords.Count -gt 0) {
        Write-ParallelResult -Decision "use_serial_execution" -Reason "one or more candidates need coordinator-owned serial scope" -ExitCode 0
    }

    Write-ParallelResult -Decision "can_assign_workers" -Reason "candidate tasks are isolated and file locks do not overlap" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_PARALLEL_READINESS_EXCEPTION $($_.Exception.Message)"
    Write-ParallelResult -Decision "stop_for_hard_block" -Reason "parallel readiness script exception" -ExitCode 1
}
