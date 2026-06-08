param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml"
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Title
    )

    Write-Output ""
    Write-Output "== $Title =="
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
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
        [string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

try {
    Write-Section -Title "Module Run v2 Post-Commit Readiness"
    Write-Output "postCommitMode: advisory"

    if (-not (Test-Path -LiteralPath $ProjectStatePath)) {
        Write-Output "ADVISORY_MISSING_PROJECT_STATE $ProjectStatePath"
        exit 0
    }

    if (-not (Test-Path -LiteralPath $QueuePath)) {
        Write-Output "ADVISORY_MISSING_QUEUE $QueuePath"
        exit 0
    }

    $projectStateLines = @(Get-Content -Path $ProjectStatePath)
    $queueLines = @(Get-Content -Path $QueuePath)

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"

    Write-Section -Title "Last Commit"
    $lastCommit = ((& git log -1 --oneline) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($lastCommit)) {
        Write-Output "lastCommit: unavailable"
    } else {
        Write-Output "lastCommit: $lastCommit"
    }

    $changedFiles = @(& git diff-tree --no-commit-id --name-only -r HEAD)
    Write-Section -Title "Changed Files In Last Commit"
    if ($changedFiles.Count -eq 0) {
        Write-Output "changedFiles: none"
    } else {
        $changedFiles | ForEach-Object { Write-Output "changedFile: $_" }
    }

    Write-Section -Title "Task Inventory"
    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Write-Output "ADVISORY_TASK_NOT_FOUND $TaskId"
        exit 0
    }

    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
    $auditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")

    Write-Output "status: $taskStatus"
    Write-Output "evidencePath: $evidencePath"
    Write-Output "auditReviewPath: $auditReviewPath"

    if (-not [string]::IsNullOrWhiteSpace($evidencePath) -and (Test-Path -LiteralPath $evidencePath)) {
        Write-Output "OK_EVIDENCE_PATH $evidencePath"
    } else {
        Write-Output "ADVISORY_MISSING_EVIDENCE $evidencePath"
    }

    if (-not [string]::IsNullOrWhiteSpace($auditReviewPath) -and (Test-Path -LiteralPath $auditReviewPath)) {
        Write-Output "OK_AUDIT_PATH $auditReviewPath"
    } else {
        Write-Output "ADVISORY_MISSING_AUDIT $auditReviewPath"
    }

    Write-Section -Title "Scope Inventory"
    foreach ($changedFile in $changedFiles) {
        $allowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $allowedFiles
        $blockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $blockedFiles

        if (-not [string]::IsNullOrWhiteSpace($allowedPattern)) {
            Write-Output "OK_SCOPE $changedFile matches $allowedPattern"
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
            Write-Output "ADVISORY_BLOCKED_SCOPE $changedFile matches $blockedPattern"
            continue
        }

        Write-Output "ADVISORY_OUT_OF_SCOPE $changedFile"
    }

    Write-Section -Title "Result"
    Write-Output "post-commit advisory completed"
    exit 0
} catch {
    Write-Output "ADVISORY_ERROR $($_.Exception.Message)"
    exit 0
}
