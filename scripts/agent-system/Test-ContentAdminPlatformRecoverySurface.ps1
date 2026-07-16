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
$expectedP1SuccessorProgramId = "p1-remediation-2026-07-16"
$expectedClosedStartupTaskId = "p1-p2-remediation-startup-package-v1-2026-07-15"
$expectedClosedStartupTaskSha256 = "1716f09b643c530a6ab6cef3bb089ac0a6896d9a37861c6f5f04c4274eb24a83"
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

function Get-DirectChildIndent {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    if ($Block.Count -eq 0) { return -1 }
    $parentIndent = Get-Indent -Line $Block[0]
    $childIndents = @(
        for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
            if (-not [string]::IsNullOrWhiteSpace($Block[$lineIndex]) -and $Block[$lineIndex] -notmatch '^\s*#') {
                $lineIndent = Get-Indent -Line $Block[$lineIndex]
                if ($lineIndent -gt $parentIndent) { $lineIndent }
            }
        }
    )
    if ($childIndents.Count -eq 0) { return -1 }
    return ($childIndents | Measure-Object -Minimum).Minimum
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
    $directIndent = Get-DirectChildIndent -Block $Block
    for ($index = 1; $index -lt $Block.Count; $index++) {
        if ($directIndent -ge 0 -and (Get-Indent -Line $Block[$index]) -eq $directIndent -and $Block[$index] -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
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

    $directIndent = Get-DirectChildIndent -Block $Block
    for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
        $line = $Block[$lineIndex]
        if ($directIndent -ge 0 -and (Get-Indent -Line $line) -eq $directIndent -and $line -match "^\s+$([regex]::Escape($Key)):\s*(.*?)\s*$") {
            return $Matches[1].Trim().Trim('"').Trim("'")
        }
    }
    return ""
}

function Get-ListItemBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    $items = New-Object System.Collections.Generic.List[object]
    $starts = New-Object System.Collections.Generic.List[int]
    $itemIndent = Get-DirectChildIndent -Block $Block
    for ($index = 0; $index -lt $Block.Count; $index++) {
        if ($Block[$index] -match "^(\s*)-\s+id:\s+(\S+)\s*$") {
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

function Get-LinesSha256 {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        $bytes = [System.Text.Encoding]::UTF8.GetBytes(($Lines -join "`n"))
        return ([System.BitConverter]::ToString($sha256.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
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

function Test-UniqueTopLevelKeys {
    param(
        [Parameter(Mandatory = $true)][string[]]$Keys,
        [Parameter(Mandatory = $true)][string]$Label
    )

    foreach ($duplicateKey in @($Keys | Group-Object | Where-Object { $_.Count -gt 1 })) {
        Add-Finding "RECOVERY_SURFACE_DUPLICATE_TOP_LEVEL_KEY $Label $($duplicateKey.Name)"
    }
}

function Test-CanonicalYamlSurfaceSyntax {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Label
    )

    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        $line = $Lines[$lineIndex]
        if ([string]::IsNullOrWhiteSpace($line) -or $line -match '^\s*#') { continue }
        if ($line -match "`t" -or $line -match '^\s*(?:-\s+)?<<\s*:' -or $line -match '^\s*(?:-\s+)?(?:"[^"]+"|''[^'']+'')\s*:' -or $line -match '^\s*(?:-\s+)?[A-Za-z][A-Za-z0-9_-]*\s+:') {
            Add-Finding "RECOVERY_SURFACE_NONCANONICAL_YAML_KEY $Label line=$($lineIndex + 1)"
            continue
        }
        if ((Get-Indent -Line $line) -eq 0 -and $line -notmatch '^[A-Za-z][A-Za-z0-9_-]*:(?:\s.*)?$') {
            Add-Finding "RECOVERY_SURFACE_NONCANONICAL_TOP_LEVEL $Label line=$($lineIndex + 1)"
        }
    }
}

function Test-DirectMappingKeysUnique {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Label
    )

    if ($Block.Count -eq 0) { return }
    $directIndent = Get-DirectChildIndent -Block $Block
    $keys = [System.Collections.Generic.List[string]]::new()
    if ($Block[0] -match '^\s*-\s+([A-Za-z][A-Za-z0-9_-]*):') { $keys.Add($Matches[1]) }
    for ($lineIndex = 1; $lineIndex -lt $Block.Count; $lineIndex++) {
        if ($directIndent -ge 0 -and (Get-Indent -Line $Block[$lineIndex]) -eq $directIndent -and $Block[$lineIndex] -match '^\s*([A-Za-z][A-Za-z0-9_-]*):') {
            $keys.Add($Matches[1])
        }
    }
    foreach ($duplicateKey in @($keys | Group-Object | Where-Object { $_.Count -gt 1 })) {
        Add-Finding "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY $Label $($duplicateKey.Name)"
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
Test-CanonicalYamlSurfaceSyntax -Lines $stateLines -Label "project-state"
Test-CanonicalYamlSurfaceSyntax -Lines $queueLines -Label "task-queue"
$stateProgram = @(Get-TopLevelBlock -Lines $stateLines -Key "contentAdminPlatformSerialProgram")
$queueProgram = @(Get-TopLevelBlock -Lines $queueLines -Key "contentAdminPlatformSerialProgram")
$stateP1SuccessorProgram = @(Get-TopLevelBlock -Lines $stateLines -Key "p1RemediationSerialProgram")
$queueP1SuccessorProgram = @(Get-TopLevelBlock -Lines $queueLines -Key "p1RemediationSerialProgram")
$closedStartupTask = @(Get-TopLevelBlock -Lines $stateLines -Key "lastClosedStartupTask")
$hasStateP1Successor = $stateP1SuccessorProgram.Count -gt 0
$hasQueueP1Successor = $queueP1SuccessorProgram.Count -gt 0
$hasP1Successor = $hasStateP1Successor -and $hasQueueP1Successor

Test-DirectMappingKeysUnique -Block $stateProgram -Label "project-state contentAdminPlatformSerialProgram"
Test-DirectMappingKeysUnique -Block $queueProgram -Label "task-queue contentAdminPlatformSerialProgram"
Test-DirectMappingKeysUnique -Block $stateP1SuccessorProgram -Label "project-state p1RemediationSerialProgram"
Test-DirectMappingKeysUnique -Block $queueP1SuccessorProgram -Label "task-queue p1RemediationSerialProgram"

if ($hasStateP1Successor -ne $hasQueueP1Successor) {
    Add-Finding "RECOVERY_SURFACE_P1_SUCCESSOR_PROJECTION_MISMATCH"
}
if ($hasP1Successor) {
    if ((Get-ScalarValue -Block $stateProgram -Key "status") -ne "closed" -or (Get-ScalarValue -Block $queueProgram -Key "status") -ne "closed") {
        Add-Finding "RECOVERY_SURFACE_P1_SUCCESSOR_WHILE_LEGACY_ACTIVE"
    }
    if ((Get-ScalarValue -Block $stateP1SuccessorProgram -Key "programId") -ne $expectedP1SuccessorProgramId -or (Get-ScalarValue -Block $queueP1SuccessorProgram -Key "programId") -ne $expectedP1SuccessorProgramId) {
        Add-Finding "RECOVERY_SURFACE_P1_SUCCESSOR_ID_INVALID"
    }
    if ($closedStartupTask.Count -eq 0 -or (Get-ScalarValue -Block $closedStartupTask -Key "id") -ne $expectedClosedStartupTaskId -or (Get-ScalarValue -Block $closedStartupTask -Key "status") -ne "closed" -or (Get-LinesSha256 -Lines $closedStartupTask) -ne $expectedClosedStartupTaskSha256) {
        Add-Finding "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_INVALID"
    }
} elseif ($closedStartupTask.Count -gt 0) {
    Add-Finding "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_ORPHANED"
}

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
$stateTopLevelKeys = @(Get-TopLevelKeys -Lines $stateLines)
Test-UniqueTopLevelKeys -Keys $stateTopLevelKeys -Label "project-state"
Test-AllowedTopLevelKeys -Keys $stateTopLevelKeys -Allowed @(
    $requiredStateKeys
    "p0RemediationSerialProgram"
    $(if ($hasP1Successor) { "p1RemediationSerialProgram" })
    $(if ($hasP1Successor) { "lastClosedStartupTask" })
) -Required $requiredStateKeys -Label "project-state"
$requiredQueueKeys = @(
    "schemaVersion",
    "contentAdminPlatformSerialProgram",
    "activeTasks",
    "standingAuthorization",
    "historyPointers"
)
$queueTopLevelKeys = @(Get-TopLevelKeys -Lines $queueLines)
Test-UniqueTopLevelKeys -Keys $queueTopLevelKeys -Label "task-queue"
Test-AllowedTopLevelKeys -Keys $queueTopLevelKeys -Allowed @(
    $requiredQueueKeys
    "p0RemediationSerialProgram"
    $(if ($hasP1Successor) { "p1RemediationSerialProgram" })
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
