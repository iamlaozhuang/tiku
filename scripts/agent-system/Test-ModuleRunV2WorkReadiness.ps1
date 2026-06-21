param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("pre-work", "pre-edit")]
    [string]$Mode = "pre-work",

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
    [AllowEmptyCollection()]
    [AllowEmptyString()]
    [string[]]$PlannedFiles = @()
)

$ErrorActionPreference = "Stop"

$expandedPlannedFiles = New-Object System.Collections.Generic.List[string]
foreach ($plannedFileInput in $PlannedFiles) {
    foreach ($plannedFilePart in ($plannedFileInput -split ",")) {
        $trimmedPlannedFile = $plannedFilePart.Trim()
        if (-not [string]::IsNullOrWhiteSpace($trimmedPlannedFile)) {
            $expandedPlannedFiles.Add($trimmedPlannedFile)
        }
    }
}
$PlannedFiles = $expandedPlannedFiles.ToArray()

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )

    Write-Output ""
    Write-Output "== $Title =="
}

function Add-Finding {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $script:findings.Add($Message)
    Write-Output $Message
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Id
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
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s+-\s+(.+)\s*$") {
            $values.Add($Matches[1].Trim())
            continue
        }

        if ($insideList -and $line -match "^\s+\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

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
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-CurrentTaskScalar {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $insideCurrentTask = $false
    foreach ($line in $Lines) {
        if ($line -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $line -match "^\S") {
            break
        }

        if ($insideCurrentTask -and $line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function ConvertTo-NormalizedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    return $Path.Replace("\", "/").TrimStart(".", "/")
}

function Test-PathPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    $normalizedPattern = ConvertTo-NormalizedPath -Path $Pattern

    if ($normalizedPattern.EndsWith("/**")) {
        $prefix = $normalizedPattern.Substring(0, $normalizedPattern.Length - 3)
        return $normalizedPath -eq $prefix -or $normalizedPath.StartsWith("$prefix/")
    }

    return $normalizedPath -like $normalizedPattern
}

function Get-MatchingPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

function Write-List {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Prefix,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Values
    )

    if ($Values.Count -eq 0) {
        Write-Output "$Prefix none"
        return
    }

    $Values | ForEach-Object { Write-Output "$Prefix $_" }
}

$findings = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Work Readiness"
    Write-Output "workReadinessMode: hard_block"
    Write-Output "checkMode: $Mode"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "Missing required file: $requiredPath"
        }
    }

    $insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
    if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
        throw "Module Run v2 work readiness must run inside a Git worktree."
    }

    $projectStateLines = @(Get-Content -Path $ProjectStatePath)
    $queueLines = @(Get-Content -Path $QueuePath)
    $matrixContent = Get-Content -Path $MatrixPath -Raw

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_ID"
    }

    Write-Output "taskId: $TaskId"

    $currentBranch = ((& git branch --show-current) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "(detached HEAD)"
    }
    $headSha = ((& git rev-parse --short HEAD) -join "").Trim()

    Write-Section -Title "Repository"
    Write-Output "branch: $currentBranch"
    Write-Output "head: $headSha"
    if ($currentBranch -eq "master" -or $currentBranch -eq "main") {
        Add-Finding "HARD_BLOCK_PROTECTED_BRANCH $currentBranch"
    }

    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Add-Finding "HARD_BLOCK_TASK_NOT_FOUND $TaskId"
    }

    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $taskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
    $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
    $auditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    $riskTypes = @(Get-ListValues -Block $taskBlock -Key "riskTypes")
    $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
    $currentTaskId = Get-CurrentTaskId -Lines $projectStateLines
    $planPath = ""
    if ($TaskId -eq $currentTaskId) {
        $planPath = Get-CurrentTaskScalar -Lines $projectStateLines -Key "planPath"
    }

    if ([string]::IsNullOrWhiteSpace($planPath)) {
        foreach ($allowedFile in $allowedFiles) {
            $normalizedAllowedFile = ConvertTo-NormalizedPath -Path $allowedFile
            if ($normalizedAllowedFile -like "docs/05-execution-logs/task-plans/*.md" -and $normalizedAllowedFile -like "*$TaskId*") {
                $planPath = $allowedFile
                break
            }
        }
    }

    Write-Section -Title "Task"
    Write-Output "status: $taskStatus"
    Write-Output "taskKind: $taskKind"
    Write-Output "planPath: $planPath"
    Write-Output "evidencePath: $evidencePath"
    Write-Output "auditReviewPath: $auditReviewPath"

    $isTerminalTask = $taskStatus -in @("done", "closed", "pushed", "merged")
    if ((-not $isTerminalTask) -and $taskStatus -notin @("pending", "in_progress")) {
        Add-Finding "HARD_BLOCK_UNSUPPORTED_TASK_STATUS $TaskId status=$taskStatus"
    }

    if ([string]::IsNullOrWhiteSpace($planPath)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_PLAN_PATH $TaskId"
    } elseif (-not (Test-Path -LiteralPath $planPath)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_PLAN_FILE $planPath"
    }

    if ([string]::IsNullOrWhiteSpace($evidencePath)) {
        Add-Finding "HARD_BLOCK_MISSING_EVIDENCE_PATH $TaskId"
    }

    if ([string]::IsNullOrWhiteSpace($auditReviewPath)) {
        Add-Finding "HARD_BLOCK_MISSING_AUDIT_PATH $TaskId"
    }

    Write-Section -Title "Allowed Files"
    Write-List -Prefix "allowed:" -Values $allowedFiles

    Write-Section -Title "Blocked Files"
    Write-List -Prefix "blocked:" -Values $blockedFiles

    Write-Section -Title "Risk Types"
    Write-List -Prefix "riskType:" -Values $riskTypes

    Write-Section -Title "Validation Commands"
    Write-List -Prefix "validation:" -Values $validationCommands

    Write-Section -Title "Module Run v2 Anchors"
    if ($matrixContent -match "moduleRunVersion:\s*2") {
        Write-Output "moduleRunVersion: 2"
    } else {
        Write-Output "moduleRunVersion: missing_or_not_v2"
    }

    foreach ($anchor in @("hookIntegrationMatrix", "automationHandoffPolicy", "threadRolloverGate")) {
        if ($matrixContent -match "$([regex]::Escape($anchor))\s*:") {
            Write-Output "$anchor`: present"
        } else {
            Write-Output "$anchor`: missing"
        }
    }

    if ($matrixContent -match "Cost Calibration Gate remains blocked") {
        Write-Output "Cost Calibration Gate remains blocked"
    } else {
        Write-Output "ADVISORY_MISSING_ANCHOR Cost Calibration Gate remains blocked"
    }

    if ($Mode -eq "pre-edit") {
        Write-Section -Title "Pre-Edit Planned Files"
        if ($PlannedFiles.Count -eq 0) {
            Add-Finding "HARD_BLOCK_MISSING_PLANNED_FILES"
        }

        foreach ($plannedFile in $PlannedFiles) {
            $blockedPattern = Get-MatchingPattern -Path $plannedFile -Patterns $blockedFiles
            if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
                Add-Finding "HARD_BLOCK_PLANNED_BLOCKED_FILE $plannedFile matches $blockedPattern"
                continue
            }

            $allowedPattern = Get-MatchingPattern -Path $plannedFile -Patterns $allowedFiles
            if (-not [string]::IsNullOrWhiteSpace($allowedPattern)) {
                Write-Output "OK_PLANNED_ALLOWED_FILE $plannedFile matches $allowedPattern"
                continue
            }

            Add-Finding "HARD_BLOCK_PLANNED_OUT_OF_SCOPE $plannedFile"
        }
    }

    Write-Section -Title "Result"
    if ($isTerminalTask) {
        Write-Output "workReadinessDecision: not_executable_closed_task"
        Write-Output "workReadinessAction: idle_no_executable_task"
        Write-Output "reason: task is terminal and should not enter pre-edit execution"
        exit 0
    }

    if ($findings.Count -gt 0) {
        Write-Output "work readiness failed with $($findings.Count) finding(s)"
        exit 1
    }

    Write-Output "work readiness passed"
    exit 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    exit 1
}
