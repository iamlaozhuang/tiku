param(
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
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [string]$CurrentBranchOverride = "",

    [Parameter(Mandatory = $false)]
    [int]$RemoteAheadCountOverride = -1,

    [Parameter(Mandatory = $false)]
    [switch]$AllowRepositoryShaDrift,

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch,

    [Parameter(Mandatory = $false)]
    [switch]$CloseoutRecovery,

    [Parameter(Mandatory = $false)]
    [switch]$SkipRemoteAheadCheck
)

$ErrorActionPreference = "Stop"

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

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
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
    param([Parameter(Mandatory = $true)][string[]]$Lines)

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

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return $Path.Replace("\", "/").TrimStart(".", "/")
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

function Get-MatchingPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

function Expand-FileInputs {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$Files)

    $expandedFiles = New-Object System.Collections.Generic.List[string]
    foreach ($fileInput in $Files) {
        foreach ($filePart in ($fileInput -split ",")) {
            $trimmedFile = $filePart.Trim()
            if (-not [string]::IsNullOrWhiteSpace($trimmedFile)) {
                $expandedFiles.Add($trimmedFile)
            }
        }
    }

    return $expandedFiles.ToArray()
}

function Get-ChangedFilesForScan {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ExplicitFiles)

    $expandedExplicitFiles = @(Expand-FileInputs -Files $ExplicitFiles)
    if ($expandedExplicitFiles.Count -gt 0) {
        return $expandedExplicitFiles
    }

    $stagedFiles = @(& git diff --cached --name-only --diff-filter=ACMR)
    $workingTreeFiles = @(& git diff --name-only --diff-filter=ACMR)
    $untrackedFiles = @(& git ls-files --others --exclude-standard)
    return @($stagedFiles + $workingTreeFiles + $untrackedFiles | Sort-Object -Unique)
}

function Test-RequiredPath {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$MissingCode,
        [Parameter(Mandatory = $true)][string]$OkCode
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Finding "$MissingCode missing_path_value"
        return
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        Add-Finding "$MissingCode $Path"
        return
    }

    Write-Output "$OkCode $Path"
}

$findings = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Unattended Readiness"
    Write-Output "unattendedReadinessMode: hard_block"
    if ($CloseoutRecovery) {
        Write-Output "closeoutRecovery: enabled"
    }

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "Missing required file: $requiredPath"
        }
    }

    $insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
    if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
        throw "Unattended readiness must run inside a Git worktree."
    }

    $projectStateLines = @(Get-Content -Path $ProjectStatePath)
    $queueLines = @(Get-Content -Path $QueuePath)
    $matrixContent = Get-Content -Path $MatrixPath -Raw

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_ID"
    }

    $currentBranch = $CurrentBranchOverride.Trim()
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = ((& git branch --show-current) -join "").Trim()
    }
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "(detached HEAD)"
    }

    Write-Section -Title "Repository"
    Write-Output "branch: $currentBranch"
    if (-not $AllowProtectedBranch -and ($currentBranch -eq "master" -or $currentBranch -eq "main")) {
        Add-Finding "HARD_BLOCK_PROTECTED_BRANCH $currentBranch"
    }

    $masterSha = ((& git rev-parse master) -join "").Trim()
    $originMasterSha = ((& git rev-parse origin/master) -join "").Trim()
    $stateMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownMasterSha"
    $stateOriginMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownOriginMasterSha"
    Write-Output "master: $masterSha"
    Write-Output "originMaster: $originMasterSha"
    Write-Output "stateMaster: $stateMasterSha"
    Write-Output "stateOriginMaster: $stateOriginMasterSha"

    if (-not $AllowRepositoryShaDrift) {
        if ($stateMasterSha -ne $masterSha) {
            Add-Finding "HARD_BLOCK_REPOSITORY_SHA_DRIFT master"
        }
        if ($stateOriginMasterSha -ne $originMasterSha) {
            Add-Finding "HARD_BLOCK_REPOSITORY_SHA_DRIFT origin/master"
        }
    }

    if (-not $SkipRemoteAheadCheck) {
        $remoteAheadCount = $RemoteAheadCountOverride
        if ($remoteAheadCount -lt 0) {
            $aheadBehind = ((& git rev-list --left-right --count "origin/master...HEAD") -join "").Trim()
            if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($aheadBehind)) {
                Add-Finding "HARD_BLOCK_REMOTE_AHEAD_CHECK_FAILED"
            } else {
                $parts = $aheadBehind -split "\s+"
                $remoteAheadCount = [int]$parts[0]
            }
        }

        Write-Output "remoteAhead: $remoteAheadCount"
        if ($remoteAheadCount -gt 0) {
            Add-Finding "HARD_BLOCK_REMOTE_AHEAD origin/master remoteAhead=$remoteAheadCount"
        }
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

    Write-Section -Title "Task"
    Write-Output "status: $taskStatus"
    Write-Output "taskKind: $taskKind"
    Write-Output "evidencePath: $evidencePath"
    Write-Output "auditReviewPath: $auditReviewPath"

    if ($CloseoutRecovery -and $taskStatus -in @("done", "closed")) {
        Write-Output "OK_CLOSEOUT_RECOVERY_TASK_STATUS $TaskId status=$taskStatus"
    } elseif ($taskStatus -notin @("pending", "in_progress")) {
        Add-Finding "HARD_BLOCK_UNATTENDED_TASK_STATUS $TaskId status=$taskStatus"
    }

    Test-RequiredPath -Path $evidencePath -MissingCode "HARD_BLOCK_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH"
    Test-RequiredPath -Path $auditReviewPath -MissingCode "HARD_BLOCK_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH"

    if ($validationCommands.Count -eq 0) {
        Add-Finding "HARD_BLOCK_MISSING_VALIDATION_COMMANDS"
    }

    $blockedRiskTypes = @(
        "add_dependency",
        "dependency",
        "schema",
        "migration",
        "secret_or_env_change",
        "env_secret",
        "provider",
        "deploy",
        "payment",
        "external_service",
        "external-service"
    )
    foreach ($riskType in $riskTypes) {
        if ($blockedRiskTypes -contains $riskType) {
            Add-Finding "HARD_BLOCK_RISK_GATE $riskType"
        }
    }

    Write-Section -Title "Scope Scan"
    $filesToScan = @(Get-ChangedFilesForScan -ExplicitFiles $ChangedFiles)
    Write-Output "filesToScan: $($filesToScan.Count)"
    $explicitFilesToScan = @(Expand-FileInputs -Files $ChangedFiles)
    if ($CloseoutRecovery -and $explicitFilesToScan.Count -eq 0 -and $filesToScan.Count -gt 0) {
        Add-Finding "HARD_BLOCK_CLOSEOUT_RECOVERY_DIRTY_WORKTREE files=$($filesToScan.Count)"
    }
    foreach ($changedFile in $filesToScan) {
        $blockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $blockedFiles
        if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
            Add-Finding "HARD_BLOCK_BLOCKED_FILE $changedFile matches $blockedPattern"
            continue
        }

        $allowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $allowedFiles
        if (-not [string]::IsNullOrWhiteSpace($allowedPattern)) {
            Write-Output "OK_SCOPE $changedFile matches $allowedPattern"
            continue
        }

        Add-Finding "HARD_BLOCK_OUT_OF_SCOPE $changedFile"
    }

    Write-Section -Title "Module Run v2 Anchors"
    if ($matrixContent -match "moduleRunVersion:\s*2") {
        Write-Output "moduleRunVersion: 2"
    } else {
        Add-Finding "HARD_BLOCK_MISSING_ANCHOR moduleRunVersion: 2"
    }

    if ($matrixContent -match "threadRolloverGate\s*:") {
        Write-Output "threadRolloverGate: present"
    } else {
        Add-Finding "HARD_BLOCK_MISSING_ANCHOR threadRolloverGate"
    }

    if ($matrixContent -match "Cost Calibration Gate remains blocked") {
        Write-Output "Cost Calibration Gate remains blocked"
    } else {
        Add-Finding "HARD_BLOCK_MISSING_ANCHOR Cost Calibration Gate remains blocked"
    }

    Write-Section -Title "Result"
    if ($findings.Count -gt 0) {
        Write-Output "unattendedStopDecision: stop_for_hard_block"
        Write-Output "unattended readiness failed with $($findings.Count) finding(s)"
        exit 1
    }

    if ($CloseoutRecovery -and $taskStatus -in @("done", "closed")) {
        Write-Output "unattendedStopDecision: closeout_recovery"
    } else {
        Write-Output "unattendedStopDecision: continue"
    }
    Write-Output "unattended readiness passed"
    exit 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-Output "unattendedStopDecision: stop_for_hard_block"
    exit 1
}
