param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$RepositoryRoot = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("manual", "pre_commit", "pre_push")]
    [string]$Phase = "manual",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [switch]$SkipGitChecks
)

$ErrorActionPreference = "Stop"

$programKey = "contentAdminPlatformSerialProgram"
$expectedProgramId = "content-admin-platform-b-to-f-2026-07-13"
$allowedTaskStatuses = @("pending", "claimed", "in_progress", "ready_for_closeout", "closed")
$activeTaskStatuses = @("in_progress", "ready_for_closeout")
$fixedFullRegressionTaskIds = @(
    "content-admin-platform-b5-cumulative-audit-2026-07-13",
    "content-admin-platform-d4-cumulative-audit-2026-07-13",
    "content-admin-platform-c6-cumulative-audit-2026-07-13",
    "content-admin-platform-e6-cumulative-audit-2026-07-13",
    "content-admin-platform-f5-final-cumulative-audit-2026-07-13"
)
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
    $sectionIndent = -1
    for ($index = 0; $index -lt $Block.Count; $index++) {
        if ($Block[$index] -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $start = $index
            $sectionIndent = $Matches[1].Length
            break
        }
    }

    if ($start -lt 0) {
        return @()
    }

    $end = $Block.Count
    for ($index = $start + 1; $index -lt $Block.Count; $index++) {
        if (-not [string]::IsNullOrWhiteSpace($Block[$index]) -and (Get-Indent -Line $Block[$index]) -le $sectionIndent) {
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

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $inside = $false
    $keyIndent = -1

    foreach ($line in $Block) {
        if (-not $inside -and $line -match "^(\s+)$([regex]::Escape($Key)):\s*$") {
            $inside = $true
            $keyIndent = $Matches[1].Length
            continue
        }

        if (-not $inside) {
            continue
        }

        if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-Indent -Line $line) -le $keyIndent) {
            break
        }

        if ($line -match "^\s*-\s+(.+?)\s*$") {
            $values.Add($Matches[1].Trim().Trim('"').Trim("'"))
        }
    }

    return $values.ToArray()
}

function Get-FlatMapping {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $result = @{}
    $section = @(Get-SectionBlock -Block $Block -Key $Key)
    if ($section.Count -eq 0) {
        return $result
    }

    $sectionIndent = Get-Indent -Line $section[0]
    foreach ($line in $section | Select-Object -Skip 1) {
        if ($line -match "^(\s+)([^#][^:]+):\s*(.*?)\s*$" -and $Matches[1].Length -eq ($sectionIndent + 2)) {
            $mappingKey = $Matches[2].Trim().Trim('"').Trim("'")
            $mappingValue = $Matches[3].Trim().Trim('"').Trim("'")
            $result[$mappingKey] = $mappingValue
        }
    }

    return $result
}

function Get-ChildBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$ParentKey,
        [Parameter(Mandatory = $true)][string]$ChildKey
    )

    $parent = @(Get-SectionBlock -Block $Block -Key $ParentKey)
    if ($parent.Count -eq 0) {
        return @()
    }

    return @(Get-SectionBlock -Block $parent -Key $ChildKey)
}

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    $start = -1
    $itemIndent = -1
    for ($index = 0; $index -lt $Lines.Count; $index++) {
        if ($Lines[$index] -match "^(\s*)-\s+id:\s+$([regex]::Escape($TaskId))\s*$") {
            $start = $index
            $itemIndent = $Matches[1].Length
            break
        }
    }

    if ($start -lt 0) {
        return @()
    }

    $end = $Lines.Count
    for ($index = $start + 1; $index -lt $Lines.Count; $index++) {
        if ($Lines[$index] -match "^(\s*)-\s+id:\s+\S+" -and $Matches[1].Length -eq $itemIndent) {
            $end = $index
            break
        }

        if (-not [string]::IsNullOrWhiteSpace($Lines[$index]) -and (Get-Indent -Line $Lines[$index]) -lt $itemIndent) {
            $end = $index
            break
        }
    }

    return @($Lines[$start..($end - 1)])
}

function Resolve-RepositoryPath {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return Join-Path -Path $Root -ChildPath ($Path -replace "/", "\")
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

function Test-TextContainsAll {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string[]]$Needles,
        [Parameter(Mandatory = $true)][string]$FailurePrefix
    )

    $normalized = $Text.Replace("\", "/")
    foreach ($needle in $Needles) {
        if ($normalized -notmatch [regex]::Escape($needle)) {
            Add-Finding "$FailurePrefix $needle"
        }
    }
}

function Get-CanonicalTaskProfiles {
    param([Parameter(Mandatory = $true)][string]$PlanText)

    $profiles = New-Object System.Collections.Generic.List[object]
    foreach ($line in ($PlanText -split "`r?`n")) {
        if ($line -notmatch '^\s*\|') {
            continue
        }

        $cells = @($line.Split('|') | Select-Object -Skip 1 | Select-Object -SkipLast 1 | ForEach-Object { $_.Trim() })
        if ($cells.Count -lt 8 -or $cells[0] -in @("Order", "---") -or $cells[1] -notmatch '^`?content-admin-platform-[a-z0-9-]+-2026-07-13`?$') {
            continue
        }

        $profiles.Add([pscustomobject]@{
            Order = $cells[0]
            TaskId = $cells[1].Trim([char]96)
            ExecutionProfile = $cells[2]
            FocusedGates = @($cells[3].Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
            BuildRequired = $cells[4]
            FullRegressionPolicy = $cells[5]
            ProtectedDomains = @($cells[6].Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ })
            ReviewMode = $cells[7]
        })
    }

    return $profiles.ToArray()
}

function Test-CanonicalTaskProfile {
    param([Parameter(Mandatory = $true)][psobject]$Profile)

    $taskId = $Profile.TaskId
    if ($Profile.ExecutionProfile -notin @("R0", "R1", "R2", "R3")) {
        Add-Finding "PROGRAM_GUARD_EXECUTION_PROFILE_INVALID $taskId"
    }
    if ($Profile.BuildRequired -notin @("true", "false", "impact_triggered")) {
        Add-Finding "PROGRAM_GUARD_BUILD_REQUIRED_INVALID $taskId"
    }
    if ($Profile.FullRegressionPolicy -notin @("skip", "impact_triggered", "fixed_node")) {
        Add-Finding "PROGRAM_GUARD_FULL_REGRESSION_POLICY_INVALID $taskId"
    }
    if ($Profile.ReviewMode -notin @("evidence_two_rounds", "independent_audit")) {
        Add-Finding "PROGRAM_GUARD_REVIEW_MODE_INVALID $taskId"
    }
    if ($Profile.ProtectedDomains.Count -eq 0) {
        Add-Finding "PROGRAM_GUARD_PROTECTED_DOMAINS_MISSING $taskId"
    }

    $requiredFocusedGates = @("guard", "diff_check")
    if ($Profile.ExecutionProfile -eq "R0") {
        $requiredFocusedGates += @("scoped_format", "link_check")
    } elseif ($Profile.ExecutionProfile -eq "R1") {
        $requiredFocusedGates += @("focused_unit", "lint", "typecheck", "changed_format")
    } else {
        $hasPrimaryGate = @($Profile.FocusedGates | Where-Object { $_ -in @("focused_unit", "focused_script", "focused_acceptance", "focused_preflight", "full_unit") }).Count -gt 0
        if (-not $hasPrimaryGate) {
            Add-Finding "PROGRAM_GUARD_FOCUSED_GATES_DOWNGRADED $taskId primary_gate"
        }
        if ($Profile.FocusedGates -notcontains "scoped_format" -and $Profile.FocusedGates -notcontains "changed_format" -and $Profile.FocusedGates -notcontains "full_format") {
            Add-Finding "PROGRAM_GUARD_FOCUSED_GATES_DOWNGRADED $taskId format"
        }
    }
    foreach ($requiredGate in $requiredFocusedGates) {
        if ($Profile.FocusedGates -notcontains $requiredGate) {
            Add-Finding "PROGRAM_GUARD_FOCUSED_GATES_DOWNGRADED $taskId $requiredGate"
        }
    }

    if ($Profile.ExecutionProfile -in @("R2", "R3") -and $Profile.ReviewMode -ne "independent_audit") {
        Add-Finding "PROGRAM_GUARD_REVIEW_MODE_DOWNGRADED $taskId"
    }

    if ($fixedFullRegressionTaskIds -contains $taskId) {
        foreach ($requiredFullGate in @("full_unit", "lint", "typecheck", "full_format", "build", "guard", "diff_check")) {
            if ($Profile.FocusedGates -notcontains $requiredFullGate) {
                Add-Finding "PROGRAM_GUARD_FIXED_FULL_REGRESSION_POLICY_INVALID $taskId $requiredFullGate"
            }
        }
        if ($Profile.FullRegressionPolicy -ne "fixed_node" -or $Profile.BuildRequired -ne "true") {
            Add-Finding "PROGRAM_GUARD_FIXED_FULL_REGRESSION_POLICY_INVALID $taskId"
        }
    } elseif ($Profile.FullRegressionPolicy -eq "fixed_node") {
        Add-Finding "PROGRAM_GUARD_UNPLANNED_FULL_REGRESSION_NODE $taskId"
    }
}

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Get-Location).Path
}
$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
$projectStateFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $ProjectStatePath
$queueFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $QueuePath

if (-not (Test-Path -LiteralPath $projectStateFullPath)) {
    throw "PROGRAM_GUARD_PROJECT_STATE_MISSING $projectStateFullPath"
}
if (-not (Test-Path -LiteralPath $queueFullPath)) {
    throw "PROGRAM_GUARD_QUEUE_MISSING $queueFullPath"
}

$stateLines = @(Get-Content -LiteralPath $projectStateFullPath)
$queueLines = @(Get-Content -LiteralPath $queueFullPath)
$stateProgram = @(Get-TopLevelBlock -Lines $stateLines -Key $programKey)
$queueProgram = @(Get-TopLevelBlock -Lines $queueLines -Key $programKey)

if ($stateProgram.Count -eq 0) {
    Add-Finding "PROGRAM_GUARD_STATE_PROGRAM_MISSING"
}
if ($queueProgram.Count -eq 0) {
    Add-Finding "PROGRAM_GUARD_QUEUE_PROGRAM_MISSING"
}
if ($findings.Count -gt 0) {
    throw ($findings -join [Environment]::NewLine)
}

$stateProgramId = Get-ScalarValue -Block $stateProgram -Key "programId"
$queueProgramId = Get-ScalarValue -Block $queueProgram -Key "programId"
if ($stateProgramId -ne $expectedProgramId -or $queueProgramId -ne $expectedProgramId) {
    Add-Finding "PROGRAM_GUARD_PROGRAM_ID_MISMATCH"
}

$stateBaselineSha = Get-ScalarValue -Block $stateProgram -Key "baselineSha"
$queueBaselineSha = Get-ScalarValue -Block $queueProgram -Key "baselineSha"
if ($stateBaselineSha -notmatch "^[0-9a-f]{40}$" -or $stateBaselineSha -ne $queueBaselineSha) {
    Add-Finding "PROGRAM_GUARD_BASELINE_SHA_MISMATCH"
}

$stateStatus = Get-ScalarValue -Block $stateProgram -Key "status"
$queueStatus = Get-ScalarValue -Block $queueProgram -Key "status"
if ($stateStatus -notin @("in_progress", "closed") -or $stateStatus -ne $queueStatus) {
    Add-Finding "PROGRAM_GUARD_PROGRAM_STATUS_INVALID"
}

$stateCurrentTaskId = Get-ScalarValue -Block $stateProgram -Key "currentTaskId"
$queueCurrentTaskId = Get-ScalarValue -Block $queueProgram -Key "currentTaskId"
$stateNextTaskId = Get-ScalarValue -Block $stateProgram -Key "nextTaskId"
$queueNextTaskId = Get-ScalarValue -Block $queueProgram -Key "nextTaskId"
if ([string]::IsNullOrWhiteSpace($stateCurrentTaskId) -or $stateCurrentTaskId -ne $queueCurrentTaskId) {
    Add-Finding "PROGRAM_GUARD_CURRENT_TASK_MISMATCH"
}
if ($stateNextTaskId -ne $queueNextTaskId) {
    Add-Finding "PROGRAM_GUARD_NEXT_TASK_MISMATCH"
}

$topLevelCurrentTask = @(Get-TopLevelBlock -Lines $stateLines -Key "currentTask")
$ownsGlobalActivity = $stateStatus -eq "in_progress"
if ($ownsGlobalActivity -and (
    $topLevelCurrentTask.Count -eq 0 -or
    (Get-ScalarValue -Block $topLevelCurrentTask -Key "id") -ne $stateCurrentTaskId
)) {
    Add-Finding "PROGRAM_GUARD_TOP_LEVEL_CURRENT_TASK_MISMATCH"
}

$serialPlanPath = Get-ScalarValue -Block $stateProgram -Key "serialPlanPath"
$serialPlanText = ""
$canonicalProfiles = @()
$canonicalTaskIds = @()
if (-not [string]::IsNullOrWhiteSpace($serialPlanPath)) {
    $serialPlanFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $serialPlanPath
    if (Test-Path -LiteralPath $serialPlanFullPath) {
        $serialPlanText = Get-Content -LiteralPath $serialPlanFullPath -Raw
        $canonicalProfiles = @(Get-CanonicalTaskProfiles -PlanText $serialPlanText)
        $canonicalTaskIds = @($canonicalProfiles | ForEach-Object { $_.TaskId })
    }
}
if ($canonicalTaskIds.Count -eq 0) {
    Add-Finding "PROGRAM_GUARD_CANONICAL_ORDER_MISSING"
} elseif (($canonicalTaskIds | Select-Object -Unique).Count -ne $canonicalTaskIds.Count) {
    Add-Finding "PROGRAM_GUARD_CANONICAL_ORDER_DUPLICATE_TASK"
}
foreach ($canonicalProfile in $canonicalProfiles) {
    Test-CanonicalTaskProfile -Profile $canonicalProfile
}

$stateOrdered = @(Get-ListValues -Block $stateProgram -Key "orderedTaskIds")
$queueOrdered = @(Get-ListValues -Block $queueProgram -Key "orderedTaskIds")
if ($stateOrdered.Count -eq 0 -or ($stateOrdered -join "|") -ne ($queueOrdered -join "|")) {
    Add-Finding "PROGRAM_GUARD_ORDERED_TASKS_MISMATCH"
}
if (($stateOrdered -join "|") -ne ($canonicalTaskIds -join "|") -or ($queueOrdered -join "|") -ne ($canonicalTaskIds -join "|")) {
    Add-Finding "PROGRAM_GUARD_CANONICAL_ORDER_MISMATCH"
}
if (($stateOrdered | Select-Object -Unique).Count -ne $stateOrdered.Count) {
    Add-Finding "PROGRAM_GUARD_DUPLICATE_TASK_ID"
}

$stateCompleted = @(Get-ListValues -Block $stateProgram -Key "completedTaskIds")
$queueCompleted = @(Get-ListValues -Block $queueProgram -Key "completedTaskIds")
if (($stateCompleted -join "|") -ne ($queueCompleted -join "|")) {
    Add-Finding "PROGRAM_GUARD_COMPLETED_TASKS_MISMATCH"
}

$stateTaskStatuses = Get-FlatMapping -Block $stateProgram -Key "taskStatusById"
$queueTaskStatuses = Get-FlatMapping -Block $queueProgram -Key "taskStatusById"
foreach ($taskId in $stateTaskStatuses.Keys) {
    if ($allowedTaskStatuses -notcontains $stateTaskStatuses[$taskId]) {
        Add-Finding "PROGRAM_GUARD_UNSUPPORTED_STATUS $taskId $($stateTaskStatuses[$taskId])"
    }
    if (-not $queueTaskStatuses.ContainsKey($taskId) -or $queueTaskStatuses[$taskId] -ne $stateTaskStatuses[$taskId]) {
        Add-Finding "PROGRAM_GUARD_TASK_STATUS_MAP_MISMATCH $taskId"
    }
}
foreach ($taskId in $queueTaskStatuses.Keys) {
    if (-not $stateTaskStatuses.ContainsKey($taskId)) {
        Add-Finding "PROGRAM_GUARD_TASK_STATUS_MAP_MISMATCH $taskId"
    }
}
foreach ($taskId in $stateOrdered) {
    if (-not $stateTaskStatuses.ContainsKey($taskId) -or -not $queueTaskStatuses.ContainsKey($taskId)) {
        Add-Finding "PROGRAM_GUARD_TASK_STATUS_MISSING $taskId"
        continue
    }

    $taskStatus = $stateTaskStatuses[$taskId]
    if ($allowedTaskStatuses -notcontains $taskStatus -or $queueTaskStatuses[$taskId] -ne $taskStatus) {
        Add-Finding "PROGRAM_GUARD_UNSUPPORTED_STATUS $taskId $taskStatus"
    }
}
if (
    $ownsGlobalActivity -and
    $topLevelCurrentTask.Count -gt 0 -and
    $stateTaskStatuses.ContainsKey($stateCurrentTaskId) -and
    (Get-ScalarValue -Block $topLevelCurrentTask -Key "status") -ne $stateTaskStatuses[$stateCurrentTaskId]
) {
    Add-Finding "PROGRAM_GUARD_TOP_LEVEL_CURRENT_TASK_STATUS_MISMATCH"
}

$currentCheckpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $stateCurrentTaskId)
if ($currentCheckpoint.Count -eq 0) {
    Add-Finding "PROGRAM_GUARD_CURRENT_CHECKPOINT_MISSING $stateCurrentTaskId"
} else {
    $checkpointOrder = @("taskCommit", "masterMerge", "originMasterSync", "worktreeCleanup", "shortBranchCleanup")
    $seenPendingCheckpoint = $false
    foreach ($checkpointKey in $checkpointOrder) {
        $checkpointValue = Get-ScalarValue -Block $currentCheckpoint -Key $checkpointKey
        if ($checkpointValue -notin @("pending", "pass")) {
            Add-Finding "PROGRAM_GUARD_CHECKPOINT_STATUS_INVALID $stateCurrentTaskId $checkpointKey"
        }
        if ($checkpointValue -eq "pending") {
            $seenPendingCheckpoint = $true
        } elseif ($seenPendingCheckpoint) {
            Add-Finding "PROGRAM_GUARD_CHECKPOINT_NOT_MONOTONIC $stateCurrentTaskId $checkpointKey"
        }
        if ($stateTaskStatuses[$stateCurrentTaskId] -eq "closed" -and $checkpointValue -ne "pass") {
            Add-Finding "PROGRAM_GUARD_CLOSED_TASK_CHECKPOINT_INCOMPLETE $stateCurrentTaskId $checkpointKey"
        }
    }
}

$currentIndex = [array]::IndexOf($stateOrdered, $stateCurrentTaskId)
if ($currentIndex -lt 0) {
    Add-Finding "PROGRAM_GUARD_CURRENT_TASK_NOT_ORDERED"
} else {
    for ($index = 0; $index -lt $currentIndex; $index++) {
        $priorTaskId = $stateOrdered[$index]
        if ($stateTaskStatuses[$priorTaskId] -ne "closed") {
            Add-Finding "PROGRAM_GUARD_SKIPPED_TASK $priorTaskId"
        }

        if ($stateCompleted -notcontains $priorTaskId) {
            Add-Finding "PROGRAM_GUARD_COMPLETED_TASK_NOT_RECORDED $priorTaskId"
        }

        $checkpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $priorTaskId)
        foreach ($checkpointKey in @("taskCommit", "masterMerge", "originMasterSync", "worktreeCleanup", "shortBranchCleanup")) {
            if ((Get-ScalarValue -Block $checkpoint -Key $checkpointKey) -ne "pass") {
                Add-Finding "PROGRAM_GUARD_PREVIOUS_CLOSEOUT_INCOMPLETE $priorTaskId $checkpointKey"
            }
        }
    }

    for ($index = $currentIndex + 1; $index -lt $stateOrdered.Count; $index++) {
        $laterTaskId = $stateOrdered[$index]
        if ($stateTaskStatuses[$laterTaskId] -ne "pending") {
            Add-Finding "PROGRAM_GUARD_LATER_TASK_ACTIVE $laterTaskId"
        }
    }

    $expectedNextTaskId = ""
    if ($currentIndex + 1 -lt $stateOrdered.Count) {
        $expectedNextTaskId = $stateOrdered[$currentIndex + 1]
    }
    if ($stateNextTaskId -ne $expectedNextTaskId) {
        Add-Finding "PROGRAM_GUARD_NEXT_TASK_NOT_SEQUENTIAL"
    }
}

$activeTasks = @(
    $stateOrdered | Where-Object {
        $stateTaskStatuses.ContainsKey($_) -and $activeTaskStatuses -contains $stateTaskStatuses[$_]
    }
)
if ($activeTasks.Count -gt 1) {
    Add-Finding "PROGRAM_GUARD_MULTIPLE_ACTIVE_TASKS"
}
if ($activeTasks.Count -eq 1 -and $activeTasks[0] -ne $stateCurrentTaskId) {
    Add-Finding "PROGRAM_GUARD_ACTIVE_TASK_POINTER_MISMATCH"
}

foreach ($completedTaskId in $stateCompleted) {
    if (-not $stateTaskStatuses.ContainsKey($completedTaskId) -or $stateTaskStatuses[$completedTaskId] -ne "closed") {
        Add-Finding "PROGRAM_GUARD_COMPLETED_TASK_NOT_CLOSED $completedTaskId"
    }
}

$stateAuthorization = Get-ScalarValue -Block $stateProgram -Key "standingAuthorizationSource"
$queueAuthorization = Get-ScalarValue -Block $queueProgram -Key "standingAuthorizationSource"
if ([string]::IsNullOrWhiteSpace($stateAuthorization) -or $stateAuthorization -ne $queueAuthorization) {
    Add-Finding "PROGRAM_GUARD_AUTHORIZATION_SOURCE_MISMATCH"
} else {
    $authorizationPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateAuthorization
    if (-not (Test-Path -LiteralPath $authorizationPath)) {
        Add-Finding "PROGRAM_GUARD_AUTHORIZATION_RECORD_MISSING"
    }
}

$coverageLedgerPath = Get-ScalarValue -Block $stateProgram -Key "coverageLedgerPath"
foreach ($programArtifact in @(
    @{ Label = "serial_plan"; Path = $serialPlanPath },
    @{ Label = "coverage_ledger"; Path = $coverageLedgerPath }
)) {
    if (
        [string]::IsNullOrWhiteSpace($programArtifact.Path) -or
        -not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $programArtifact.Path))
    ) {
        Add-Finding "PROGRAM_GUARD_PROGRAM_ARTIFACT_MISSING $($programArtifact.Label)"
    }
}
if (-not [string]::IsNullOrWhiteSpace($serialPlanText)) {
    foreach ($taskId in $stateOrdered) {
        if ($serialPlanText -notmatch [regex]::Escape($taskId)) {
            Add-Finding "PROGRAM_GUARD_SERIAL_PLAN_TASK_MISSING $taskId"
        }
    }
}

foreach ($programBlock in @($stateProgram, $queueProgram)) {
    $deployment = @(Get-SectionBlock -Block $programBlock -Key "deployment")
    if ((Get-ScalarValue -Block $deployment -Key "approved") -ne "false") {
        Add-Finding "PROGRAM_GUARD_DEPLOYMENT_AUTO_AUTHORIZED"
    }
    if ((Get-ScalarValue -Block $deployment -Key "status") -notmatch "^blocked") {
        Add-Finding "PROGRAM_GUARD_DEPLOYMENT_NOT_BLOCKED"
    }
}

foreach ($conditionalKey in @("x1", "x2")) {
    $conditional = @(Get-ChildBlock -Block $stateProgram -ParentKey "conditionalTasks" -ChildKey $conditionalKey)
    $queueConditional = @(Get-ChildBlock -Block $queueProgram -ParentKey "conditionalTasks" -ChildKey $conditionalKey)
    if ($conditional.Count -eq 0) {
        Add-Finding "PROGRAM_GUARD_CONDITIONAL_TASK_MISSING $conditionalKey"
        continue
    }
    if ($queueConditional.Count -eq 0 -or ($conditional -join "`n").Trim() -ne ($queueConditional -join "`n").Trim()) {
        Add-Finding "PROGRAM_GUARD_CONDITIONAL_TASK_MISMATCH $conditionalKey"
    }

    $conditionalTaskId = Get-ScalarValue -Block $conditional -Key "taskId"
    $conditionSatisfied = Get-ScalarValue -Block $conditional -Key "conditionSatisfied"
    $conditionalStatus = Get-ScalarValue -Block $conditional -Key "status"
    if ($conditionSatisfied -eq "false" -and ($conditionalStatus -ne "pending" -or $stateCurrentTaskId -eq $conditionalTaskId -or $stateOrdered -contains $conditionalTaskId)) {
        Add-Finding "PROGRAM_GUARD_CONDITIONAL_TASK_STARTED_WITHOUT_TRIGGER $conditionalKey"
    }
}

if ($stateStatus -eq "closed") {
    foreach ($taskId in $stateOrdered) {
        if ($stateTaskStatuses[$taskId] -ne "closed" -or $stateCompleted -notcontains $taskId) {
            Add-Finding "PROGRAM_GUARD_PROGRAM_CLOSED_WITH_OPEN_TASK $taskId"
        }
    }
    if ($findings.Count -gt 0) {
        throw ($findings -join [Environment]::NewLine)
    }

    Write-Output "programGuardResult: pass_closed_program"
    Write-Output "programId: $expectedProgramId"
    Write-Output "phase: $Phase"
    return
}

$currentTaskStatus = ""
if ($stateTaskStatuses.ContainsKey($stateCurrentTaskId)) {
    $currentTaskStatus = $stateTaskStatuses[$stateCurrentTaskId]
}
$scopeTaskId = $stateCurrentTaskId
if ($Phase -eq "pre_push" -and $currentTaskStatus -eq "claimed") {
    $lastClosedTaskId = Get-ScalarValue -Block $stateProgram -Key "lastClosedTaskId"
    if (-not [string]::IsNullOrWhiteSpace($lastClosedTaskId)) {
        $scopeTaskId = $lastClosedTaskId
    }
}

$taskBlock = @(Get-TaskBlock -Lines $queueLines -TaskId $scopeTaskId)
if ($taskBlock.Count -eq 0) {
    Add-Finding "PROGRAM_GUARD_ACTIVE_TASK_RECORD_MISSING $scopeTaskId"
} else {
    $recordedTaskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    if ($stateTaskStatuses.ContainsKey($scopeTaskId) -and $recordedTaskStatus -ne $stateTaskStatuses[$scopeTaskId]) {
        Add-Finding "PROGRAM_GUARD_ACTIVE_TASK_STATUS_MISMATCH $scopeTaskId"
    }
    $canonicalTaskProfile = @($canonicalProfiles | Where-Object { $_.TaskId -eq $scopeTaskId } | Select-Object -First 1)
    $taskReviewMode = ""
    if ($canonicalTaskProfile.Count -eq 0) {
        Add-Finding "PROGRAM_GUARD_TASK_PROFILE_MISSING $scopeTaskId"
    } else {
        $canonicalTaskProfile = $canonicalTaskProfile[0]
        $taskReviewMode = $canonicalTaskProfile.ReviewMode
        foreach ($profileScalar in @(
            @{ Key = "executionProfile"; Expected = $canonicalTaskProfile.ExecutionProfile },
            @{ Key = "buildRequired"; Expected = $canonicalTaskProfile.BuildRequired },
            @{ Key = "fullRegressionPolicy"; Expected = $canonicalTaskProfile.FullRegressionPolicy },
            @{ Key = "reviewMode"; Expected = $canonicalTaskProfile.ReviewMode }
        )) {
            if ((Get-ScalarValue -Block $taskBlock -Key $profileScalar.Key) -ne $profileScalar.Expected) {
                Add-Finding "PROGRAM_GUARD_TASK_PROFILE_MISMATCH $scopeTaskId $($profileScalar.Key)"
            }
        }
        foreach ($profileList in @(
            @{ Key = "focusedGates"; Expected = @($canonicalTaskProfile.FocusedGates) },
            @{ Key = "protectedDomains"; Expected = @($canonicalTaskProfile.ProtectedDomains) }
        )) {
            $recordedValues = @(Get-ListValues -Block $taskBlock -Key $profileList.Key)
            if (($recordedValues -join "|") -ne ($profileList.Expected -join "|")) {
                Add-Finding "PROGRAM_GUARD_TASK_PROFILE_MISMATCH $scopeTaskId $($profileList.Key)"
            }
        }
    }
    $taskAuthorization = (($taskBlock -join "`n").Replace("\", "/"))
    if ($taskAuthorization -notmatch [regex]::Escape((ConvertTo-NormalizedPath -Path $stateAuthorization))) {
        Add-Finding "PROGRAM_GUARD_TASK_AUTHORIZATION_NOT_MATERIALIZED $scopeTaskId"
    }
    $closeoutPolicy = @(Get-SectionBlock -Block $taskBlock -Key "closeoutPolicy")
    $localCommitPolicy = @(Get-SectionBlock -Block $closeoutPolicy -Key "localCommit")
    $mergePolicy = @(Get-SectionBlock -Block $closeoutPolicy -Key "fastForwardMerge")
    $pushPolicy = @(Get-SectionBlock -Block $closeoutPolicy -Key "push")
    $cleanupPolicy = @(Get-SectionBlock -Block $closeoutPolicy -Key "cleanup")
    if ((Get-ScalarValue -Block $localCommitPolicy -Key "approved") -ne "true") {
        Add-Finding "PROGRAM_GUARD_CLOSEOUT_POLICY_INVALID $scopeTaskId localCommit"
    }
    if ((Get-ScalarValue -Block $mergePolicy -Key "approved") -ne "true" -or (Get-ScalarValue -Block $mergePolicy -Key "targetBranch") -ne "master") {
        Add-Finding "PROGRAM_GUARD_CLOSEOUT_POLICY_INVALID $scopeTaskId fastForwardMerge"
    }
    if ((Get-ScalarValue -Block $pushPolicy -Key "approved") -ne "true" -or (Get-ScalarValue -Block $pushPolicy -Key "target") -ne "origin/master") {
        Add-Finding "PROGRAM_GUARD_CLOSEOUT_POLICY_INVALID $scopeTaskId push"
    }
    if ((Get-ScalarValue -Block $cleanupPolicy -Key "deleteShortBranch") -ne "true") {
        Add-Finding "PROGRAM_GUARD_CLOSEOUT_POLICY_INVALID $scopeTaskId cleanup"
    }
    $taskCapabilities = @(Get-SectionBlock -Block $taskBlock -Key "capabilities")
    foreach ($blockedCapability in @("stagingProdDeploy", "costCalibrationGate")) {
        if ((Get-ScalarValue -Block $taskCapabilities -Key $blockedCapability) -notmatch "^blocked") {
            Add-Finding "PROGRAM_GUARD_BLOCKED_CAPABILITY_NOT_PRESERVED $scopeTaskId $blockedCapability"
        }
    }

    if ($currentTaskStatus -in @("in_progress", "ready_for_closeout")) {
        $planPath = Get-ScalarValue -Block $taskBlock -Key "planPath"
        $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
        $auditPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
        $requiredArtifacts = @(
            @{ Label = "plan"; Path = $planPath },
            @{ Label = "evidence"; Path = $evidencePath }
        )
        if ($taskReviewMode -eq "independent_audit") {
            $requiredArtifacts += @{ Label = "audit"; Path = $auditPath }
        }
        foreach ($artifact in $requiredArtifacts) {
            if ([string]::IsNullOrWhiteSpace($artifact.Path) -or -not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $artifact.Path))) {
                Add-Finding "PROGRAM_GUARD_TASK_ARTIFACT_MISSING $scopeTaskId $($artifact.Label)"
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($planPath) -and (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $planPath))) {
            $planText = Get-Content -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $planPath) -Raw
            if ($planText -notmatch "(?m)^##\s+(SSOT Read List|Required Reading)\s*$") {
                Add-Finding "PROGRAM_GUARD_REQUIRED_READING_LIST_MISSING $scopeTaskId"
            }
            Test-TextContainsAll -Text $planText -FailurePrefix "PROGRAM_GUARD_REQUIRED_READING_SOURCE_MISSING" -Needles @(
                "AGENTS.md",
                "docs/04-agent-system/state/project-state.yaml",
                "docs/04-agent-system/state/task-queue.yaml",
                "docs/03-standards/code-taste-ten-commandments.md",
                "docs/02-architecture/adr/",
                "docs/01-requirements/00-index.md"
            )

            $readingProfiles = @(Get-ListValues -Block $taskBlock -Key "requiredReadingProfiles")
            if ($readingProfiles -contains "advanced_authorization") {
                Test-TextContainsAll -Text $planText -FailurePrefix "PROGRAM_GUARD_REQUIRED_READING_SOURCE_MISSING" -Needles @(
                    "docs/01-requirements/advanced-edition/00-index.md",
                    "docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md",
                    "docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md"
                )
            }
            if ($readingProfiles -contains "ai_generation") {
                Test-TextContainsAll -Text $planText -FailurePrefix "PROGRAM_GUARD_REQUIRED_READING_SOURCE_MISSING" -Needles @(
                    "docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md",
                    "docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md",
                    "docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md"
                )
            }
        }

        if (-not [string]::IsNullOrWhiteSpace($evidencePath) -and (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $evidencePath))) {
            $evidenceText = Get-Content -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $evidencePath) -Raw
            if ($evidenceText -notmatch "(?m)^##\s+Reading Evidence\s*$") {
                Add-Finding "PROGRAM_GUARD_READING_EVIDENCE_MISSING $scopeTaskId"
            }
            foreach ($readingMarker in @(
                "status: complete",
                "conflictsFound: false",
                "targetSourceReviewed: true",
                "targetTestsReviewed: true",
                "analogousImplementationReviewed: true"
            )) {
                if ($evidenceText -notmatch [regex]::Escape($readingMarker)) {
                    Add-Finding "PROGRAM_GUARD_READING_EVIDENCE_INCOMPLETE $scopeTaskId $readingMarker"
                }
            }
            if ($taskReviewMode -eq "evidence_two_rounds") {
                if ($evidenceText -notmatch "(?m)^##\s+Round 1\b") {
                    Add-Finding "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING $scopeTaskId round_1"
                }
                if ($evidenceText -notmatch "(?m)^##\s+Round 2\b") {
                    Add-Finding "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING $scopeTaskId round_2"
                }
            }
            if ($Phase -eq "pre_push") {
                foreach ($closeoutMarker in @("validationStatus: pass", "reviewStatus: pass", "deploymentExecuted: false")) {
                    if ($evidenceText -notmatch [regex]::Escape($closeoutMarker)) {
                        Add-Finding "PROGRAM_GUARD_PRE_PUSH_EVIDENCE_INCOMPLETE $scopeTaskId $closeoutMarker"
                    }
                }
            }
        }

        if ($taskReviewMode -eq "independent_audit" -and -not [string]::IsNullOrWhiteSpace($auditPath) -and (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $auditPath))) {
            $auditText = Get-Content -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $auditPath) -Raw
            if ($auditText -notmatch "(?m)^##\s+Round 1\b") {
                Add-Finding "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING $scopeTaskId round_1"
            }
            if ($auditText -notmatch "(?m)^##\s+Round 2\b") {
                Add-Finding "PROGRAM_GUARD_ADVERSARIAL_REVIEW_MISSING $scopeTaskId round_2"
            }
        }
    }

    $filesToCheck = @($ChangedFiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($filesToCheck.Count -eq 0 -and -not $SkipGitChecks) {
        if ($Phase -eq "pre_commit") {
            $filesToCheck = @(& git -C $RepositoryRoot diff --cached --name-only --diff-filter=ACMR)
        } elseif ($Phase -eq "pre_push") {
            $filesToCheck = @(& git -C $RepositoryRoot diff --name-only origin/master..HEAD)
        }
    }

    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    foreach ($changedFile in $filesToCheck) {
        foreach ($blockedPattern in $blockedFiles) {
            if (Test-PathPattern -Path $changedFile -Pattern $blockedPattern) {
                Add-Finding "PROGRAM_GUARD_BLOCKED_FILES_VIOLATION $changedFile"
                break
            }
        }

        $isAllowed = $false
        foreach ($allowedPattern in $allowedFiles) {
            if (Test-PathPattern -Path $changedFile -Pattern $allowedPattern) {
                $isAllowed = $true
                break
            }
        }

        if (-not $isAllowed) {
            Add-Finding "PROGRAM_GUARD_ALLOWED_FILES_VIOLATION $changedFile"
        }

        $changedFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $changedFile
        if (Test-Path -LiteralPath $changedFullPath -PathType Leaf) {
            $changedExtension = [System.IO.Path]::GetExtension($changedFullPath).ToLowerInvariant()
            if ($changedExtension -in @(".md", ".yaml", ".yml", ".json", ".ps1", ".sh", ".ts", ".tsx", ".js", ".jsx")) {
                $changedText = Get-Content -LiteralPath $changedFullPath -Raw
                foreach ($sensitivePattern in @(
                    "-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----",
                    "(?i)Authorization:\s*Bearer\s+[A-Za-z0-9._~+/=-]{12,}",
                    "(?i)postgres(?:ql)?://[^\s<]+",
                    "(?i)\bsk-[A-Za-z0-9_-]{20,}\b"
                )) {
                    if ($changedText -match $sensitivePattern) {
                        Add-Finding "PROGRAM_GUARD_SENSITIVE_CONTENT_DETECTED $changedFile"
                        break
                    }
                }
            }
        }
    }
}

if (-not $SkipGitChecks) {
    $insideWorktree = ((& git -C $RepositoryRoot rev-parse --is-inside-work-tree) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        Add-Finding "PROGRAM_GUARD_NOT_IN_GIT_WORKTREE"
    } else {
        $unmerged = @(& git -C $RepositoryRoot diff --name-only --diff-filter=U)
        if ($unmerged.Count -gt 0) {
            Add-Finding "PROGRAM_GUARD_UNMERGED_PATHS"
        }

        $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
        if ($Phase -eq "pre_commit" -and $branch -in @("master", "main")) {
            Add-Finding "PROGRAM_GUARD_PROTECTED_BRANCH_COMMIT"
        }

        if ($Phase -eq "pre_push") {
            if (-not [string]::IsNullOrWhiteSpace($stateBaselineSha)) {
                & git -C $RepositoryRoot merge-base --is-ancestor $stateBaselineSha HEAD
                if ($LASTEXITCODE -ne 0) {
                    Add-Finding "PROGRAM_GUARD_BASELINE_NOT_ANCESTOR"
                }
            }
            & git -C $RepositoryRoot merge-base --is-ancestor origin/master HEAD
            if ($LASTEXITCODE -ne 0) {
                Add-Finding "PROGRAM_GUARD_NON_FAST_FORWARD_PUSH"
            }
            $worktreeStatus = @(& git -C $RepositoryRoot status --porcelain)
            if ($worktreeStatus.Count -gt 0) {
                Add-Finding "PROGRAM_GUARD_PRE_PUSH_WORKTREE_NOT_CLEAN"
            }
        }
    }
}

if ($findings.Count -gt 0) {
    throw ($findings -join [Environment]::NewLine)
}

Write-Output "programGuardResult: pass"
Write-Output "programId: $expectedProgramId"
Write-Output "currentTaskId: $stateCurrentTaskId"
Write-Output "scopeTaskId: $scopeTaskId"
Write-Output "phase: $Phase"
