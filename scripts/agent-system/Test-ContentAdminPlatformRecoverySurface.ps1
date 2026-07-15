param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$RepositoryRoot = "",

    [Parameter(Mandatory = $false)]
    [switch]$SkipGitChecks
)

$ErrorActionPreference = "Stop"

$expectedProgramId = "content-admin-platform-b-to-f-2026-07-13"
$expectedPolicy = "lean_v3_current_program_only"
$terminalTaskId = "content-admin-platform-f5-final-cumulative-audit-2026-07-13"
$findings = New-Object System.Collections.Generic.List[string]

function Add-Finding {
    param([Parameter(Mandatory = $true)][string]$Code)

    $script:findings.Add($Code)
}

function Get-Indent {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Line)

    if ($Line -match "^(\s*)") {
        return $Matches[1].Length
    }
    return 0
}

function Get-TopLevelBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $start = -1
    for ($index = 0; $index -lt $Lines.Count; $index++) {
        if ($Lines[$index] -match "^$([regex]::Escape($Key)):\s*$") {
            $start = $index
            break
        }
    }
    if ($start -lt 0) {
        return @()
    }

    $end = $Lines.Count
    for ($index = $start + 1; $index -lt $Lines.Count; $index++) {
        if (-not [string]::IsNullOrWhiteSpace($Lines[$index]) -and (Get-Indent -Line $Lines[$index]) -eq 0) {
            $end = $index
            break
        }
    }
    return @($Lines[$start..($end - 1)])
}

function Get-SectionBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $start = -1
    $indent = -1
    for ($index = 0; $index -lt $Block.Count; $index++) {
        if ($Block[$index] -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $start = $index
            $indent = $Matches[1].Length
            break
        }
    }
    if ($start -lt 0) {
        return @()
    }

    $end = $Block.Count
    for ($index = $start + 1; $index -lt $Block.Count; $index++) {
        if (-not [string]::IsNullOrWhiteSpace($Block[$index]) -and (Get-Indent -Line $Block[$index]) -le $indent) {
            $end = $index
            break
        }
    }
    return @($Block[$start..($end - 1)])
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return ""
}

function Get-ListItemBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    $items = New-Object System.Collections.Generic.List[object]
    $starts = New-Object System.Collections.Generic.List[int]
    $itemIndent = -1
    for ($index = 0; $index -lt $Block.Count; $index++) {
        if ($Block[$index] -match "^(\s*)-\s+id:\s+(\S+)\s*$") {
            if ($itemIndent -lt 0) {
                $itemIndent = $Matches[1].Length
            }
            if ($Matches[1].Length -eq $itemIndent) {
                $starts.Add($index)
            }
        }
    }

    for ($itemIndex = 0; $itemIndex -lt $starts.Count; $itemIndex++) {
        $start = $starts[$itemIndex]
        $end = if ($itemIndex + 1 -lt $starts.Count) { $starts[$itemIndex + 1] - 1 } else { $Block.Count - 1 }
        $itemBlock = @($Block[$start..$end])
        $id = ""
        if ($itemBlock[0] -match "-\s+id:\s+(\S+)\s*$") {
            $id = $Matches[1].Trim().Trim('"').Trim("'")
        }
        $items.Add([pscustomobject]@{ Id = $id; Block = $itemBlock })
    }
    return $items.ToArray()
}

function Get-TopLevelKeys {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    return @(
        $Lines | ForEach-Object {
            if ($_ -match "^([A-Za-z][A-Za-z0-9_-]*):") {
                $Matches[1]
            }
        }
    )
}

function Resolve-RepositoryPath {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }
    return [System.IO.Path]::GetFullPath((Join-Path -Path $Root -ChildPath ($Path -replace "/", "\")))
}

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

function Test-AllowedTopLevelKeys {
    param(
        [Parameter(Mandatory = $true)][string[]]$Keys,
        [Parameter(Mandatory = $true)][string[]]$Allowed,
        [Parameter(Mandatory = $false)][string[]]$Required = @(),
        [Parameter(Mandatory = $true)][string]$Label
    )

    foreach ($key in $Keys) {
        if ($Allowed -notcontains $key) {
            Add-Finding "RECOVERY_SURFACE_TOP_LEVEL_BLOAT $Label $key"
        }
    }
    foreach ($requiredKey in $Required) {
        if ($Keys -notcontains $requiredKey) {
            Add-Finding "RECOVERY_SURFACE_REQUIRED_KEY_MISSING $Label $requiredKey"
        }
    }
}

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Get-Location).Path
}
$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
$stateFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $ProjectStatePath
$queueFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $QueuePath

foreach ($requiredFile in @($stateFullPath, $queueFullPath)) {
    if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) {
        throw "RECOVERY_SURFACE_ACTIVE_FILE_MISSING $requiredFile"
    }
}

$stateLines = @(Get-Content -LiteralPath $stateFullPath)
$queueLines = @(Get-Content -LiteralPath $queueFullPath)
$stateProgram = @(Get-TopLevelBlock -Lines $stateLines -Key "contentAdminPlatformSerialProgram")
$queueProgram = @(Get-TopLevelBlock -Lines $queueLines -Key "contentAdminPlatformSerialProgram")

$requiredStateKeys = @(
    "schemaVersion",
    "project",
    "currentPhase",
    "updatedAt",
    "contentAdminPlatformSerialProgram",
    "currentTask",
    "standingAuthorization",
    "repositoryCheckpoint",
    "historyPointers"
)
Test-AllowedTopLevelKeys -Keys @(Get-TopLevelKeys -Lines $stateLines) -Allowed @(
    $requiredStateKeys
    "p0RemediationSerialProgram"
) -Required $requiredStateKeys -Label "project-state"
$requiredQueueKeys = @(
    "schemaVersion",
    "contentAdminPlatformSerialProgram",
    "activeTasks",
    "standingAuthorization",
    "historyPointers"
)
Test-AllowedTopLevelKeys -Keys @(Get-TopLevelKeys -Lines $queueLines) -Allowed @(
    $requiredQueueKeys
    "p0RemediationSerialProgram"
) -Required $requiredQueueKeys -Label "task-queue"

foreach ($programBlock in @($stateProgram, $queueProgram)) {
    if ($programBlock.Count -eq 0) {
        Add-Finding "RECOVERY_SURFACE_PROGRAM_MISSING"
        continue
    }
    if ((Get-ScalarValue -Block $programBlock -Key "programId") -ne $expectedProgramId) {
        Add-Finding "RECOVERY_SURFACE_PROGRAM_ID_INVALID"
    }
    if ((Get-ScalarValue -Block $programBlock -Key "activityStatePolicy") -ne $expectedPolicy) {
        Add-Finding "RECOVERY_SURFACE_POLICY_INVALID"
    }
    $deployment = @(Get-SectionBlock -Block $programBlock -Key "deployment")
    if ((Get-ScalarValue -Block $deployment -Key "approved") -ne "false") {
        Add-Finding "RECOVERY_SURFACE_DEPLOYMENT_AUTO_AUTHORIZED"
    }
    if ((Get-ScalarValue -Block $deployment -Key "status") -notmatch "^blocked") {
        Add-Finding "RECOVERY_SURFACE_DEPLOYMENT_NOT_BLOCKED"
    }
}

$currentTaskId = Get-ScalarValue -Block $stateProgram -Key "currentTaskId"
$queueCurrentTaskId = Get-ScalarValue -Block $queueProgram -Key "currentTaskId"
$nextTaskId = Get-ScalarValue -Block $stateProgram -Key "nextTaskId"
$queueNextTaskId = Get-ScalarValue -Block $queueProgram -Key "nextTaskId"
$stateProgramStatus = Get-ScalarValue -Block $stateProgram -Key "status"
$queueProgramStatus = Get-ScalarValue -Block $queueProgram -Key "status"
$isTerminalTask = $currentTaskId -eq $terminalTaskId
$isClosedProgram = $stateProgramStatus -eq "closed"
if ([string]::IsNullOrWhiteSpace($currentTaskId) -or $currentTaskId -ne $queueCurrentTaskId) {
    Add-Finding "RECOVERY_SURFACE_CURRENT_TASK_MISMATCH"
}
if ($nextTaskId -ne $queueNextTaskId -or ($isTerminalTask -and -not [string]::IsNullOrWhiteSpace($nextTaskId)) -or (-not $isTerminalTask -and [string]::IsNullOrWhiteSpace($nextTaskId))) {
    Add-Finding "RECOVERY_SURFACE_NEXT_TASK_MISMATCH"
}
if ($stateProgramStatus -notin @("in_progress", "closed") -or $stateProgramStatus -ne $queueProgramStatus) {
    Add-Finding "RECOVERY_SURFACE_PROGRAM_STATUS_INVALID"
}
if ($stateProgramStatus -eq "closed" -and -not $isTerminalTask) {
    Add-Finding "RECOVERY_SURFACE_TERMINAL_STATUS_INVALID"
}

$topCurrentTask = @(Get-TopLevelBlock -Lines $stateLines -Key "currentTask")
$currentStatus = Get-ScalarValue -Block $topCurrentTask -Key "status"
if (-not $isClosedProgram -and ((Get-ScalarValue -Block $topCurrentTask -Key "id") -ne $currentTaskId -or $currentStatus -notin @("in_progress", "ready_for_closeout", "closed"))) {
    Add-Finding "RECOVERY_SURFACE_CURRENT_TASK_RECORD_INVALID"
}
if (-not $isClosedProgram -and (
    ($stateProgramStatus -eq "closed" -and (-not $isTerminalTask -or $currentStatus -ne "closed")) -or
    ($stateProgramStatus -eq "in_progress" -and $currentStatus -eq "closed")
)) {
    Add-Finding "RECOVERY_SURFACE_TERMINAL_STATUS_INVALID"
}

$activeTasksBlock = @(Get-TopLevelBlock -Lines $queueLines -Key "activeTasks")
$activeTaskItems = @(Get-ListItemBlocks -Block $activeTasksBlock)
$expectedActiveTaskCount = if ($isTerminalTask) { 1 } else { 2 }
if (-not $isClosedProgram -and (
    $activeTaskItems.Count -ne $expectedActiveTaskCount -or
    $activeTaskItems[0].Id -ne $currentTaskId -or
    (-not $isTerminalTask -and $activeTaskItems[1].Id -ne $nextTaskId)
)) {
    Add-Finding "RECOVERY_SURFACE_ACTIVE_TASKS_INVALID"
} elseif (-not $isClosedProgram) {
    if ((Get-ScalarValue -Block $activeTaskItems[0].Block -Key "status") -ne $currentStatus) {
        Add-Finding "RECOVERY_SURFACE_CURRENT_TASK_STATUS_MISMATCH"
    }
    if (-not $isTerminalTask -and (Get-ScalarValue -Block $activeTaskItems[1].Block -Key "status") -ne "pending") {
        Add-Finding "RECOVERY_SURFACE_NEXT_TASK_STATUS_INVALID"
    }
}

$stateAuthorization = Get-ScalarValue -Block $stateProgram -Key "standingAuthorizationSource"
$queueAuthorization = Get-ScalarValue -Block $queueProgram -Key "standingAuthorizationSource"
$stateSerialPlan = Get-ScalarValue -Block $stateProgram -Key "serialPlanPath"
$queueSerialPlan = Get-ScalarValue -Block $queueProgram -Key "serialPlanPath"
$stateGuard = Get-ScalarValue -Block $stateProgram -Key "guardScriptPath"
$queueGuard = Get-ScalarValue -Block $queueProgram -Key "guardScriptPath"
$stateHistoryIndex = Get-ScalarValue -Block $stateProgram -Key "historyIndexPath"
$queueHistoryIndex = Get-ScalarValue -Block $queueProgram -Key "historyIndexPath"
$stateStandingAuthorization = @(Get-TopLevelBlock -Lines $stateLines -Key "standingAuthorization")
$queueStandingAuthorization = @(Get-TopLevelBlock -Lines $queueLines -Key "standingAuthorization")

foreach ($pairedSource in @(
    @{ Label = "authorization"; State = $stateAuthorization; Queue = $queueAuthorization },
    @{ Label = "serial-plan"; State = $stateSerialPlan; Queue = $queueSerialPlan },
    @{ Label = "guard"; State = $stateGuard; Queue = $queueGuard },
    @{ Label = "history-index"; State = $stateHistoryIndex; Queue = $queueHistoryIndex }
)) {
    if ([string]::IsNullOrWhiteSpace($pairedSource.State) -or $pairedSource.State -ne $pairedSource.Queue) {
        Add-Finding "RECOVERY_SURFACE_POINTER_MISMATCH $($pairedSource.Label)"
    } elseif (-not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $pairedSource.State) -PathType Leaf)) {
        Add-Finding "RECOVERY_SURFACE_POINTER_MISSING $($pairedSource.Label)"
    }
}

if (-not $isClosedProgram -and (
    (Get-ScalarValue -Block $stateStandingAuthorization -Key "source") -ne $stateAuthorization -or
    (Get-ScalarValue -Block $queueStandingAuthorization -Key "source") -ne $stateAuthorization
)) {
    Add-Finding "RECOVERY_SURFACE_STANDING_AUTHORIZATION_MISMATCH"
}

if (-not [string]::IsNullOrWhiteSpace($stateSerialPlan)) {
    $serialPlanFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateSerialPlan
    if (Test-Path -LiteralPath $serialPlanFullPath) {
        $serialPlanText = Get-Content -LiteralPath $serialPlanFullPath -Raw
        foreach ($taskId in @($currentTaskId, $nextTaskId) | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }) {
            if ($serialPlanText -notmatch [regex]::Escape($taskId)) {
                Add-Finding "RECOVERY_SURFACE_SERIAL_PLAN_TASK_MISSING $taskId"
            }
        }
    }
}

$historyIndexFullPath = if ([string]::IsNullOrWhiteSpace($stateHistoryIndex)) { "" } else { Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateHistoryIndex }
if (-not [string]::IsNullOrWhiteSpace($historyIndexFullPath) -and (Test-Path -LiteralPath $historyIndexFullPath)) {
    $historyLines = @(Get-Content -LiteralPath $historyIndexFullPath)
    $archivesBlock = @(Get-TopLevelBlock -Lines $historyLines -Key "archives")
    $archiveItems = @(Get-ListItemBlocks -Block $archivesBlock)
    if ($archiveItems.Count -ne 2) {
        Add-Finding "RECOVERY_SURFACE_ARCHIVE_INVENTORY_INVALID"
    }
    foreach ($archiveItem in $archiveItems) {
        $archivePath = Get-ScalarValue -Block $archiveItem.Block -Key "path"
        $expectedHash = Get-ScalarValue -Block $archiveItem.Block -Key "sha256"
        $expectedBytes = Get-ScalarValue -Block $archiveItem.Block -Key "bytes"
        $archiveFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $archivePath
        if (-not (Test-Path -LiteralPath $archiveFullPath -PathType Leaf)) {
            Add-Finding "RECOVERY_SURFACE_ARCHIVE_MISSING $($archiveItem.Id)"
            continue
        }
        $actualBytes = (Get-Item -LiteralPath $archiveFullPath).Length.ToString()
        $actualHash = Get-FileSha256 -Path $archiveFullPath
        if ($actualBytes -ne $expectedBytes) {
            Add-Finding "RECOVERY_SURFACE_ARCHIVE_BYTES_MISMATCH $($archiveItem.Id)"
        }
        if ($actualHash -ne $expectedHash.ToLowerInvariant()) {
            Add-Finding "RECOVERY_SURFACE_ARCHIVE_HASH_MISMATCH $($archiveItem.Id)"
        }
        $archiveLines = @(Get-Content -LiteralPath $archiveFullPath)
        $expectedTopLevelCount = Get-ScalarValue -Block $archiveItem.Block -Key "topLevelKeyCount"
        if (-not [string]::IsNullOrWhiteSpace($expectedTopLevelCount) -and @(Get-TopLevelKeys -Lines $archiveLines).Count.ToString() -ne $expectedTopLevelCount) {
            Add-Finding "RECOVERY_SURFACE_ARCHIVE_INVENTORY_MISMATCH $($archiveItem.Id) topLevelKeyCount"
        }
        $expectedActiveCount = Get-ScalarValue -Block $archiveItem.Block -Key "activeRecordCount"
        if (-not [string]::IsNullOrWhiteSpace($expectedActiveCount)) {
            $archivedActiveBlock = @(Get-TopLevelBlock -Lines $archiveLines -Key "activeTasks")
            if (@(Get-ListItemBlocks -Block $archivedActiveBlock).Count.ToString() -ne $expectedActiveCount) {
                Add-Finding "RECOVERY_SURFACE_ARCHIVE_INVENTORY_MISMATCH $($archiveItem.Id) activeRecordCount"
            }
        }
    }

    $existingIndexes = @(Get-TopLevelBlock -Lines $historyLines -Key "existingIndexes")
    foreach ($indexKey in @(
        "taskHistoryIndexPath",
        "taskQueueArchiveMayPath",
        "taskQueueArchiveJunePath",
        "taskQueueArchiveJulyPath",
        "executionLogIndexPath"
    )) {
        $indexPath = Get-ScalarValue -Block $existingIndexes -Key $indexKey
        if ([string]::IsNullOrWhiteSpace($indexPath) -or -not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $indexPath) -PathType Leaf)) {
            Add-Finding "RECOVERY_SURFACE_EXISTING_INDEX_MISSING $indexKey"
        }
    }
}


if (-not $SkipGitChecks) {
    $repositoryCheckpoint = @(Get-TopLevelBlock -Lines $stateLines -Key "repositoryCheckpoint")
    $recordedMaster = Get-ScalarValue -Block $repositoryCheckpoint -Key "lastKnownMasterSha"
    $recordedOriginMaster = Get-ScalarValue -Block $repositoryCheckpoint -Key "lastKnownOriginMasterSha"
    foreach ($checkpoint in @(
        @{ Label = "master"; Recorded = $recordedMaster },
        @{ Label = "origin/master"; Recorded = $recordedOriginMaster }
    )) {
        if ($checkpoint.Recorded -notmatch "^[0-9a-f]{40}$") {
            Add-Finding "RECOVERY_SURFACE_REPOSITORY_CHECKPOINT_INVALID $($checkpoint.Label)"
            continue
        }
        $actual = ((& git -C $RepositoryRoot rev-parse $checkpoint.Label) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or $actual -notmatch "^[0-9a-f]{40}$") {
            Add-Finding "RECOVERY_SURFACE_GIT_REFERENCE_MISSING $($checkpoint.Label)"
            continue
        }
        & git -C $RepositoryRoot merge-base --is-ancestor $checkpoint.Recorded $actual
        if ($LASTEXITCODE -ne 0) {
            Add-Finding "RECOVERY_SURFACE_REPOSITORY_CHECKPOINT_DIVERGED $($checkpoint.Label)"
        }
    }
}

if ($findings.Count -gt 0) {
    throw ($findings -join [Environment]::NewLine)
}

Write-Output "recoverySurfaceResult: pass"
Write-Output "programId: $expectedProgramId"
Write-Output "currentTaskId: $currentTaskId"
Write-Output "nextTaskId: $nextTaskId"
Write-Output "standingAuthorizationSource: $stateAuthorization"
Write-Output "serialPlanPath: $stateSerialPlan"
Write-Output "historyIndexPath: $stateHistoryIndex"
Write-Output "deploymentStatus: blocked_requires_fresh_user_approval"
