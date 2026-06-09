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
    [string]$RunRegistryRoot = "",

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
    [switch]$SkipRemoteAheadCheck,

    [Parameter(Mandatory = $false)]
    [string]$CloseoutAuthorizationStatement = ""
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

function Get-ScalarValueFromText {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string]$Key
    )

    if ($Text -match "(?ms)^\s+$([regex]::Escape($Key)):\s*(.+?)\s*(?:^\s+\S[^:]*:\s*|$)") {
        return $Matches[1].Trim()
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

function Test-StructuredCloseoutPolicy {
    param([Parameter(Mandatory = $true)][string[]]$TaskBlock)

    $taskText = ($TaskBlock -join "`n")
    if ($taskText -notmatch "(?im)^\s+closeoutPolicy:\s*$") {
        return $false
    }

    $hasLocalCommit = $taskText -match "(?im)^\s+localCommit:\s*approved\s*$"
    $hasMergeTarget = $taskText -match "(?im)^\s+fastForwardMerge:\s*$" -and $taskText -match "(?im)^\s+targetBranch:\s*master\s*$"
    $hasPushTarget = $taskText -match "(?im)^\s+push:\s*$" -and $taskText -match "(?im)^\s+target:\s*origin/master\s*$"
    $hasCleanup = $taskText -match "(?im)^\s+cleanup:\s*$" `
        -and $taskText -match "(?im)^\s+deleteShortBranch:\s*true\s*$" `
        -and $taskText -match "(?im)^\s+parkWorktree:\s*true\s*$"
    $approvedCount = ([regex]::Matches($taskText, "(?im)^\s+approved:\s*true\s*$")).Count

    return $hasLocalCommit -and $hasMergeTarget -and $hasPushTarget -and $hasCleanup -and $approvedCount -ge 2
}

function Test-ApprovedCloseoutContinuation {
    param(
        [Parameter(Mandatory = $true)][string[]]$TaskBlock,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$Statement = ""
    )

    $taskText = ($TaskBlock -join "`n")
    if (Test-StructuredCloseoutPolicy -TaskBlock $TaskBlock) {
        return $true
    }

    if ($taskText -match "(?i)humanApproval:" -and (Test-CloseoutAuthorizationText -Text $taskText)) {
        return $true
    }

    return Test-CloseoutAuthorizationText -Text $Statement
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

function Test-GitAncestor {
    param(
        [Parameter(Mandatory = $true)][string]$AncestorSha,
        [Parameter(Mandatory = $true)][string]$DescendantSha
    )

    if ([string]::IsNullOrWhiteSpace($AncestorSha) -or [string]::IsNullOrWhiteSpace($DescendantSha)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & git cat-file -e "$AncestorSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git cat-file -e "$DescendantSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git merge-base --is-ancestor $AncestorSha $DescendantSha 2>$null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Get-StablePathHash {
    param([Parameter(Mandatory = $true)][string]$Value)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($Value.ToLowerInvariant())
        $hashBytes = $sha256.ComputeHash($bytes)
        return ([System.BitConverter]::ToString($hashBytes)).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
    }
}

function Write-RunRegistryHeartbeat {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$Branch,
        [Parameter(Mandatory = $true)][string]$WorktreePath,
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]]$FilesToScan
    )

    if ([string]::IsNullOrWhiteSpace($Root)) {
        return
    }

    if (-not (Test-Path -LiteralPath $Root)) {
        New-Item -ItemType Directory -Path $Root -Force | Out-Null
    }

    $worktreeHash = Get-StablePathHash -Value $WorktreePath
    $registryPath = Join-Path -Path $Root -ChildPath "$worktreeHash.json"
    $runRegistry = [ordered]@{
        runId = $worktreeHash
        automationId = "tiku-module-run-v2-autopilot"
        threadRole = "interactive"
        taskId = $TaskId
        branch = $Branch
        worktreePath = $WorktreePath
        status = "active"
        heartbeatAtUtc = ([DateTimeOffset]::UtcNow.ToString("o"))
        phase = "readiness"
        changedFiles = @($FilesToScan)
        lastSafeCheckpoint = "unattended readiness started"
        nextRecommendedAction = "continue current task after gates pass"
        safeToAdopt = $false
        cleanupPolicy = "none"
        redactedHandoffPath = $null
    }

    $runRegistry | ConvertTo-Json -Depth 8 | Set-Content -LiteralPath $registryPath -Encoding UTF8
    Write-Output "runRegistryHeartbeat: wrote"
    Write-Output "runRegistryPath: $registryPath"
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
    if ([string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
        $RunRegistryRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-runs"
    }
    Write-Output "runRegistryRoot: $RunRegistryRoot"

    $projectCurrentTaskId = Get-CurrentTaskId -Lines $projectStateLines
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = $projectCurrentTaskId
    }

    Write-Output "taskId: $TaskId"
    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        Add-Finding "HARD_BLOCK_MISSING_TASK_ID"
    }

    $taskBlockForRecovery = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
    $taskStatusForRecovery = Get-ScalarValue -Block $taskBlockForRecovery -Key "status"
    $taskHasStructuredCloseoutPolicyForRecovery = Test-StructuredCloseoutPolicy -TaskBlock $taskBlockForRecovery
    $canUseCloseoutShaAncestry = $CloseoutRecovery -and ($taskStatusForRecovery -in @("done", "closed") -or ($taskStatusForRecovery -eq "ready_for_closeout" -and $taskHasStructuredCloseoutPolicyForRecovery))
    $projectCurrentTaskBlock = @(Get-TaskBlock -Lines $queueLines -Id $projectCurrentTaskId)
    $projectCurrentTaskStatus = Get-ScalarValue -Block $projectCurrentTaskBlock -Key "status"
    $projectCurrentTaskEvidencePath = Get-ScalarValue -Block $projectCurrentTaskBlock -Key "evidencePath"
    $projectCurrentTaskAuditReviewPath = Get-ScalarValue -Block $projectCurrentTaskBlock -Key "auditReviewPath"

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
    $canUsePostCloseoutHandoffShaAncestry = (-not [string]::IsNullOrWhiteSpace($projectCurrentTaskId)) `
        -and $projectCurrentTaskId -ne $TaskId `
        -and $projectCurrentTaskStatus -in @("done", "closed") `
        -and $taskStatusForRecovery -in @("pending", "in_progress") `
        -and $masterSha -eq $originMasterSha `
        -and (-not [string]::IsNullOrWhiteSpace($projectCurrentTaskEvidencePath)) `
        -and (-not [string]::IsNullOrWhiteSpace($projectCurrentTaskAuditReviewPath)) `
        -and (Test-Path -LiteralPath $projectCurrentTaskEvidencePath) `
        -and (Test-Path -LiteralPath $projectCurrentTaskAuditReviewPath)
    Write-Output "master: $masterSha"
    Write-Output "originMaster: $originMasterSha"
    Write-Output "stateMaster: $stateMasterSha"
    Write-Output "stateOriginMaster: $stateOriginMasterSha"

    if (-not $AllowRepositoryShaDrift) {
        if ($stateMasterSha -ne $masterSha) {
            if ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $masterSha)) {
                Write-Output "OK_CLOSEOUT_RECOVERY_SHA_ANCESTOR master"
            } elseif ($canUsePostCloseoutHandoffShaAncestry -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $masterSha)) {
                Write-Output "OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR master"
            } else {
                Add-Finding "HARD_BLOCK_REPOSITORY_SHA_DRIFT master"
            }
        }
        if ($stateOriginMasterSha -ne $originMasterSha) {
            if ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateOriginMasterSha -DescendantSha $originMasterSha)) {
                Write-Output "OK_CLOSEOUT_RECOVERY_SHA_ANCESTOR origin/master"
            } elseif ($canUsePostCloseoutHandoffShaAncestry -and (Test-GitAncestor -AncestorSha $stateOriginMasterSha -DescendantSha $originMasterSha)) {
                Write-Output "OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR origin/master"
            } else {
                Add-Finding "HARD_BLOCK_REPOSITORY_SHA_DRIFT origin/master"
            }
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

    $hasStructuredCloseoutPolicy = Test-StructuredCloseoutPolicy -TaskBlock $taskBlock
    if ($hasStructuredCloseoutPolicy) {
        Write-Output "structuredCloseoutPolicy: approved"
    }

    if ($CloseoutRecovery -and ($taskStatus -in @("done", "closed") -or ($taskStatus -eq "ready_for_closeout" -and $hasStructuredCloseoutPolicy))) {
        Write-Output "OK_CLOSEOUT_RECOVERY_TASK_STATUS $TaskId status=$taskStatus"
    } elseif ($taskStatus -eq "ready_for_closeout" -and -not $hasStructuredCloseoutPolicy) {
        Add-Finding "HARD_BLOCK_CLOSEOUT_POLICY_INCOMPLETE $TaskId status=$taskStatus"
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
    $currentWorktreePath = ((& git rev-parse --show-toplevel) -join "").Trim()
    Write-RunRegistryHeartbeat -Root $RunRegistryRoot -TaskId $TaskId -Branch $currentBranch -WorktreePath $currentWorktreePath -FilesToScan $filesToScan
    $explicitFilesToScan = @(Expand-FileInputs -Files $ChangedFiles)
    if ($CloseoutRecovery -and $explicitFilesToScan.Count -eq 0 -and $filesToScan.Count -gt 0) {
        if (Test-ApprovedCloseoutContinuation -TaskBlock $taskBlock -Statement $CloseoutAuthorizationStatement) {
            Write-Output "OK_APPROVED_CLOSEOUT_DIRTY_WORKTREE files=$($filesToScan.Count)"
            Write-Output "approvedCloseoutContinuation: enabled"
        } else {
            Add-Finding "HARD_BLOCK_CLOSEOUT_RECOVERY_DIRTY_WORKTREE files=$($filesToScan.Count)"
        }
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

    if ($CloseoutRecovery -and ($taskStatus -in @("done", "closed") -or ($taskStatus -eq "ready_for_closeout" -and $hasStructuredCloseoutPolicy))) {
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
