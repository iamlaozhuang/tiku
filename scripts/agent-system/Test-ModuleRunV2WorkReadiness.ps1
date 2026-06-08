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

function Write-List {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Prefix,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]]$Values
    )

    if ($Values.Count -eq 0) {
        Write-Output "$Prefix none"
        return
    }

    $Values | ForEach-Object { Write-Output "$Prefix $_" }
}

try {
    Write-Section -Title "Module Run v2 Work Readiness"
    Write-Output "advisoryMode: $Mode"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Write-Output "ADVISORY_ERROR missing file: $requiredPath"
            exit 0
        }
    }

    $insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
    if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
        Write-Output "ADVISORY_ERROR not inside a Git worktree"
        exit 0
    }

    $projectStateLines = @(Get-Content -Path $ProjectStatePath)
    $queueLines = @(Get-Content -Path $QueuePath)
    $matrixContent = Get-Content -Path $MatrixPath -Raw

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
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
        Write-Output "ADVISORY_PROTECTED_BRANCH $currentBranch"
    }

    $taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        Write-Output "ADVISORY_ERROR task not found in queue: $TaskId"
        exit 0
    }

    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $taskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
    $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    $riskTypes = @(Get-ListValues -Block $taskBlock -Key "riskTypes")
    $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")

    Write-Section -Title "Task"
    Write-Output "status: $taskStatus"
    Write-Output "taskKind: $taskKind"
    Write-Output "evidencePath: $evidencePath"

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
            Write-Output "plannedFiles: none"
        }

        foreach ($plannedFile in $PlannedFiles) {
            $blockedPattern = Get-MatchingPattern -Path $plannedFile -Patterns $blockedFiles
            if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
                Write-Output "ADVISORY_BLOCKED_FILE $plannedFile matches $blockedPattern"
                continue
            }

            $allowedPattern = Get-MatchingPattern -Path $plannedFile -Patterns $allowedFiles
            if (-not [string]::IsNullOrWhiteSpace($allowedPattern)) {
                Write-Output "ADVISORY_ALLOWED_FILE $plannedFile matches $allowedPattern"
                continue
            }

            Write-Output "ADVISORY_OUT_OF_SCOPE $plannedFile"
        }
    }

    Write-Section -Title "Result"
    Write-Output "advisory result: report_only"
    exit 0
} catch {
    Write-Output "ADVISORY_ERROR $($_.Exception.Message)"
    exit 0
}
