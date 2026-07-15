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
    [ValidateSet("manual", "pre_commit", "pre_push")]
    [string]$Phase = "manual",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @(),

    [Parameter(Mandatory = $false)]
    [switch]$SkipGitChecks
)

$ErrorActionPreference = "Stop"

$programKey = "p0RemediationSerialProgram"
$expectedProgramId = "p0-remediation-rc-01-to-rc-08-2026-07-14"
$expectedPolicy = "wip_one_guarded_serial"
$allowedTaskStatuses = @("pending", "in_progress", "ready_for_closeout", "closed")
$activeTaskStatuses = @("in_progress", "ready_for_closeout")
$checkpointOrder = @("taskCommit", "masterMerge", "originMasterSync", "worktreeCleanup", "shortBranchCleanup")
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
    $baseIndent = -1
    foreach ($line in $Block) {
        if (-not $inside -and $line -match "^(\s+)$([regex]::Escape($Key)):\s*(?:\[\])?\s*$") {
            $inside = $true
            $baseIndent = $Matches[1].Length
            if ($line -match "\[\]") {
                break
            }
            continue
        }
        if (-not $inside) {
            continue
        }
        if (-not [string]::IsNullOrWhiteSpace($line) -and (Get-Indent -Line $line) -le $baseIndent) {
            break
        }
        if ($line -match "^\s+-\s+(.+?)\s*$") {
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

    $mapping = @{}
    $section = @(Get-SectionBlock -Block $Block -Key $Key)
    foreach ($line in $section) {
        if ($line -match "^\s+([^:#][^:]*):\s*(.*?)\s*$" -and $Matches[1].Trim() -ne $Key) {
            $mapping[$Matches[1].Trim()] = $Matches[2].Trim().Trim('"').Trim("'")
        }
    }
    return $mapping
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
    if ($normalizedPattern.Contains("*")) {
        $regex = "^" + [regex]::Escape($normalizedPattern).Replace("\*", "[^/]*") + "$"
        return $normalizedPath -match $regex
    }
    return $normalizedPath -eq $normalizedPattern
}

function Get-CanonicalTaskIds {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$PlanText)

    $ids = New-Object System.Collections.Generic.List[string]
    foreach ($line in ($PlanText -split "`r?`n")) {
        if ($line -match '^\|\s*[A-Za-z0-9-]+\s*\|\s*`([^`]+)`\s*\|') {
            $ids.Add($Matches[1])
        }
    }
    return $ids.ToArray()
}

if ([string]::IsNullOrWhiteSpace($RepositoryRoot)) {
    $RepositoryRoot = (Get-Location).Path
}
$RepositoryRoot = [System.IO.Path]::GetFullPath($RepositoryRoot)
$stateFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $ProjectStatePath
$queueFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $QueuePath
foreach ($requiredFile in @($stateFullPath, $queueFullPath)) {
    if (-not (Test-Path -LiteralPath $requiredFile -PathType Leaf)) {
        throw "P0_PROGRAM_REQUIRED_FILE_MISSING $requiredFile"
    }
}

$stateLines = @(Get-Content -LiteralPath $stateFullPath)
$queueLines = @(Get-Content -LiteralPath $queueFullPath)
$stateProgram = @(Get-TopLevelBlock -Lines $stateLines -Key $programKey)
$queueProgram = @(Get-TopLevelBlock -Lines $queueLines -Key $programKey)
if ($stateProgram.Count -eq 0 -or $queueProgram.Count -eq 0) {
    throw "P0_PROGRAM_STATE_MISSING"
}

foreach ($programBlock in @($stateProgram, $queueProgram)) {
    if ((Get-ScalarValue -Block $programBlock -Key "programId") -ne $expectedProgramId) {
        Add-Finding "P0_PROGRAM_ID_INVALID"
    }
    if ((Get-ScalarValue -Block $programBlock -Key "activityStatePolicy") -ne $expectedPolicy) {
        Add-Finding "P0_PROGRAM_POLICY_INVALID"
    }
    $deployment = @(Get-SectionBlock -Block $programBlock -Key "deployment")
    if ((Get-ScalarValue -Block $deployment -Key "approved") -ne "false") {
        Add-Finding "P0_PROGRAM_DEPLOYMENT_AUTO_AUTHORIZED"
    }
    if ((Get-ScalarValue -Block $deployment -Key "status") -notmatch "^blocked") {
        Add-Finding "P0_PROGRAM_DEPLOYMENT_NOT_BLOCKED"
    }
    $runtimeAcceptance = @(Get-SectionBlock -Block $programBlock -Key "runtimeAcceptance")
    if ((Get-ScalarValue -Block $runtimeAcceptance -Key "approved") -ne "false" -or (Get-ScalarValue -Block $runtimeAcceptance -Key "status") -ne "excluded_from_program") {
        Add-Finding "P0_PROGRAM_RUNTIME_ACCEPTANCE_SCOPE_EXPANDED"
    }
    $p1P2 = @(Get-SectionBlock -Block $programBlock -Key "p1P2Remediation")
    if ((Get-ScalarValue -Block $p1P2 -Key "approved") -ne "false" -or (Get-ScalarValue -Block $p1P2 -Key "status") -ne "impact_mapping_only") {
        Add-Finding "P0_PROGRAM_P1_P2_SCOPE_EXPANDED"
    }
}

$stateStatus = Get-ScalarValue -Block $stateProgram -Key "status"
$queueStatus = Get-ScalarValue -Block $queueProgram -Key "status"
if ($stateStatus -notin @("in_progress", "closed") -or $stateStatus -ne $queueStatus) {
    Add-Finding "P0_PROGRAM_STATUS_INVALID"
}

$stateBaseline = Get-ScalarValue -Block $stateProgram -Key "baselineSha"
$queueBaseline = Get-ScalarValue -Block $queueProgram -Key "baselineSha"
if ($stateBaseline -notmatch "^[0-9a-f]{40}$" -or $stateBaseline -ne $queueBaseline) {
    Add-Finding "P0_PROGRAM_BASELINE_SHA_MISMATCH"
}

$stateCurrentTaskId = Get-ScalarValue -Block $stateProgram -Key "currentTaskId"
$queueCurrentTaskId = Get-ScalarValue -Block $queueProgram -Key "currentTaskId"
$stateNextTaskId = Get-ScalarValue -Block $stateProgram -Key "nextTaskId"
$queueNextTaskId = Get-ScalarValue -Block $queueProgram -Key "nextTaskId"
if ([string]::IsNullOrWhiteSpace($stateCurrentTaskId) -or $stateCurrentTaskId -ne $queueCurrentTaskId) {
    Add-Finding "P0_PROGRAM_CURRENT_TASK_MISMATCH"
}
if ($stateNextTaskId -ne $queueNextTaskId) {
    Add-Finding "P0_PROGRAM_NEXT_TASK_MISMATCH"
}

$programPointers = @(
    @{ Label = "authorization"; Key = "standingAuthorizationSource" },
    @{ Label = "serial_plan"; Key = "serialPlanPath" },
    @{ Label = "finding_ledger"; Key = "findingLedgerPath" },
    @{ Label = "startup_package"; Key = "startupPackagePath" },
    @{ Label = "guard"; Key = "guardScriptPath" }
)
$pointerValues = @{}
foreach ($pointer in $programPointers) {
    $stateValue = Get-ScalarValue -Block $stateProgram -Key $pointer.Key
    $queueValue = Get-ScalarValue -Block $queueProgram -Key $pointer.Key
    $pointerValues[$pointer.Key] = $stateValue
    if ([string]::IsNullOrWhiteSpace($stateValue) -or $stateValue -ne $queueValue) {
        Add-Finding "P0_PROGRAM_POINTER_MISMATCH $($pointer.Label)"
        continue
    }
    if (-not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $stateValue) -PathType Leaf)) {
        Add-Finding "P0_PROGRAM_ARTIFACT_MISSING $($pointer.Label)"
    }
}

$canonicalTaskIds = @()
$serialPlanPath = $pointerValues["serialPlanPath"]
if (-not [string]::IsNullOrWhiteSpace($serialPlanPath)) {
    $serialPlanFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $serialPlanPath
    if (Test-Path -LiteralPath $serialPlanFullPath -PathType Leaf) {
        $canonicalTaskIds = @(Get-CanonicalTaskIds -PlanText (Get-Content -LiteralPath $serialPlanFullPath -Raw))
    }
}
if ($canonicalTaskIds.Count -eq 0 -or @($canonicalTaskIds | Select-Object -Unique).Count -ne $canonicalTaskIds.Count) {
    Add-Finding "P0_PROGRAM_CANONICAL_ORDER_INVALID"
}

$stateOrdered = @(Get-ListValues -Block $stateProgram -Key "orderedTaskIds")
$queueOrdered = @(Get-ListValues -Block $queueProgram -Key "orderedTaskIds")
if (($stateOrdered -join "|") -ne ($queueOrdered -join "|") -or ($stateOrdered -join "|") -ne ($canonicalTaskIds -join "|")) {
    Add-Finding "P0_PROGRAM_CANONICAL_ORDER_MISMATCH"
}
if (@($stateOrdered | Select-Object -Unique).Count -ne $stateOrdered.Count) {
    Add-Finding "P0_PROGRAM_DUPLICATE_TASK_ID"
}

$stateCompleted = @(Get-ListValues -Block $stateProgram -Key "completedTaskIds")
$queueCompleted = @(Get-ListValues -Block $queueProgram -Key "completedTaskIds")
if (($stateCompleted -join "|") -ne ($queueCompleted -join "|")) {
    Add-Finding "P0_PROGRAM_COMPLETED_TASKS_MISMATCH"
}

$stateStatuses = Get-FlatMapping -Block $stateProgram -Key "taskStatusById"
$queueStatuses = Get-FlatMapping -Block $queueProgram -Key "taskStatusById"
foreach ($taskId in $stateOrdered) {
    if (-not $stateStatuses.ContainsKey($taskId) -or -not $queueStatuses.ContainsKey($taskId)) {
        Add-Finding "P0_PROGRAM_TASK_STATUS_MISSING $taskId"
        continue
    }
    if ($stateStatuses[$taskId] -notin $allowedTaskStatuses -or $stateStatuses[$taskId] -ne $queueStatuses[$taskId]) {
        Add-Finding "P0_PROGRAM_TASK_STATUS_INVALID $taskId"
    }
}

$currentIndex = [array]::IndexOf($stateOrdered, $stateCurrentTaskId)
if ($currentIndex -lt 0) {
    Add-Finding "P0_PROGRAM_CURRENT_TASK_NOT_ORDERED"
} else {
    for ($index = 0; $index -lt $currentIndex; $index++) {
        $taskId = $stateOrdered[$index]
        if ($stateStatuses[$taskId] -ne "closed" -or $stateCompleted -notcontains $taskId) {
            Add-Finding "P0_PROGRAM_SKIPPED_TASK $taskId"
        }
        $checkpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $taskId)
        foreach ($checkpointKey in $checkpointOrder) {
            if ((Get-ScalarValue -Block $checkpoint -Key $checkpointKey) -ne "pass") {
                Add-Finding "P0_PROGRAM_PREVIOUS_CLOSEOUT_INCOMPLETE $taskId $checkpointKey"
            }
        }
    }
    for ($index = $currentIndex + 1; $index -lt $stateOrdered.Count; $index++) {
        if ($stateStatuses[$stateOrdered[$index]] -ne "pending") {
            Add-Finding "P0_PROGRAM_LATER_TASK_ACTIVE $($stateOrdered[$index])"
        }
    }
    $expectedNext = if ($currentIndex + 1 -lt $stateOrdered.Count) { $stateOrdered[$currentIndex + 1] } else { "" }
    if ($stateNextTaskId -ne $expectedNext) {
        Add-Finding "P0_PROGRAM_NEXT_TASK_NOT_SEQUENTIAL"
    }
}

$activeProgramTasks = @(
    $stateOrdered | Where-Object { $stateStatuses.ContainsKey($_) -and $stateStatuses[$_] -in $activeTaskStatuses }
)
if ($activeProgramTasks.Count -gt 1) {
    Add-Finding "P0_PROGRAM_MULTIPLE_ACTIVE_TASKS"
}
if ($stateStatus -eq "in_progress" -and ($activeProgramTasks.Count -ne 1 -or $activeProgramTasks[0] -ne $stateCurrentTaskId)) {
    Add-Finding "P0_PROGRAM_ACTIVE_TASK_POINTER_MISMATCH"
}

$currentCheckpoint = @(Get-ChildBlock -Block $stateProgram -ParentKey "closeoutCheckpoints" -ChildKey $stateCurrentTaskId)
if ($currentCheckpoint.Count -eq 0) {
    Add-Finding "P0_PROGRAM_CURRENT_CHECKPOINT_MISSING $stateCurrentTaskId"
} else {
    $seenPending = $false
    foreach ($checkpointKey in $checkpointOrder) {
        $value = Get-ScalarValue -Block $currentCheckpoint -Key $checkpointKey
        if ($value -notin @("pending", "pass")) {
            Add-Finding "P0_PROGRAM_CHECKPOINT_STATUS_INVALID $stateCurrentTaskId $checkpointKey"
        }
        if ($value -eq "pending") {
            $seenPending = $true
        } elseif ($seenPending) {
            Add-Finding "P0_PROGRAM_CHECKPOINT_NOT_MONOTONIC $stateCurrentTaskId $checkpointKey"
        }
        if ($stateStatuses[$stateCurrentTaskId] -eq "closed" -and $value -ne "pass") {
            Add-Finding "P0_PROGRAM_CLOSED_TASK_CHECKPOINT_INCOMPLETE $stateCurrentTaskId $checkpointKey"
        }
    }
}

if ($stateStatus -eq "closed") {
    foreach ($taskId in $stateOrdered) {
        if ($stateStatuses[$taskId] -ne "closed" -or $stateCompleted -notcontains $taskId) {
            Add-Finding "P0_PROGRAM_CLOSED_WITH_OPEN_TASK $taskId"
        }
    }
    if ($findings.Count -gt 0) {
        throw ($findings -join [Environment]::NewLine)
    }
    Write-Output "p0ProgramGuardResult: pass_closed_program"
    Write-Output "programId: $expectedProgramId"
    Write-Output "phase: $Phase"
    return
}

$topCurrentTask = @(Get-TopLevelBlock -Lines $stateLines -Key "currentTask")
$topCurrentTaskId = Get-ScalarValue -Block $topCurrentTask -Key "id"
$topCurrentStatus = Get-ScalarValue -Block $topCurrentTask -Key "status"
if ($topCurrentTaskId -ne $stateCurrentTaskId -or $topCurrentStatus -ne $stateStatuses[$stateCurrentTaskId]) {
    Add-Finding "P0_PROGRAM_TOP_LEVEL_CURRENT_TASK_MISMATCH"
}

$activeTasks = @(Get-ListItemBlocks -Block (Get-TopLevelBlock -Lines $queueLines -Key "activeTasks"))
$expectedActiveCount = if ([string]::IsNullOrWhiteSpace($stateNextTaskId)) { 1 } else { 2 }
if ($activeTasks.Count -ne $expectedActiveCount -or $activeTasks[0].Id -ne $stateCurrentTaskId -or ($expectedActiveCount -eq 2 -and $activeTasks[1].Id -ne $stateNextTaskId)) {
    Add-Finding "P0_PROGRAM_ACTIVE_TASKS_INVALID"
}
if ($expectedActiveCount -eq 2 -and $activeTasks.Count -ge 2) {
    $nextTaskStatus = Get-ScalarValue -Block $activeTasks[1].Block -Key "status"
    if ($nextTaskStatus -ne "pending" -or $nextTaskStatus -ne $stateStatuses[$stateNextTaskId]) {
        Add-Finding "P0_PROGRAM_NEXT_TASK_STATUS_INVALID $stateNextTaskId"
    }
}

$stateAuthorization = Get-ScalarValue -Block (Get-TopLevelBlock -Lines $stateLines -Key "standingAuthorization") -Key "source"
$queueAuthorization = Get-ScalarValue -Block (Get-TopLevelBlock -Lines $queueLines -Key "standingAuthorization") -Key "source"
if ($stateAuthorization -ne $pointerValues["standingAuthorizationSource"] -or $queueAuthorization -ne $stateAuthorization) {
    Add-Finding "P0_PROGRAM_STANDING_AUTHORIZATION_MISMATCH"
}

$taskBlock = if ($activeTasks.Count -gt 0) { @($activeTasks[0].Block) } else { @() }
if ($taskBlock.Count -eq 0) {
    Add-Finding "P0_PROGRAM_ACTIVE_TASK_RECORD_MISSING $stateCurrentTaskId"
} else {
    if ((Get-ScalarValue -Block $taskBlock -Key "status") -ne $stateStatuses[$stateCurrentTaskId]) {
        Add-Finding "P0_PROGRAM_ACTIVE_TASK_STATUS_MISMATCH"
    }

    foreach ($artifact in @(
        @{ Label = "plan"; Key = "planPath" },
        @{ Label = "evidence"; Key = "evidencePath" },
        @{ Label = "audit"; Key = "auditReviewPath" }
    )) {
        $path = Get-ScalarValue -Block $taskBlock -Key $artifact.Key
        if ([string]::IsNullOrWhiteSpace($path) -or -not (Test-Path -LiteralPath (Resolve-RepositoryPath -Root $RepositoryRoot -Path $path) -PathType Leaf)) {
            Add-Finding "P0_PROGRAM_TASK_ARTIFACT_MISSING $stateCurrentTaskId $($artifact.Label)"
        }
    }

    $evidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
    $auditPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
    $reviewText = ""
    foreach ($path in @($evidencePath, $auditPath)) {
        if (-not [string]::IsNullOrWhiteSpace($path)) {
            $fullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $path
            if (Test-Path -LiteralPath $fullPath -PathType Leaf) {
                $reviewText += "`n" + (Get-Content -LiteralPath $fullPath -Raw)
            }
        }
    }
    foreach ($requiredMarker in @("## Reading Evidence", "status: complete", "conflictsFound: false", "targetSourceReviewed: true", "targetTestsReviewed: true", "analogousImplementationReviewed: true", "## Requirement Mapping Result")) {
        if ($reviewText -notmatch [regex]::Escape($requiredMarker)) {
            Add-Finding "P0_PROGRAM_EVIDENCE_INCOMPLETE $stateCurrentTaskId $requiredMarker"
        }
    }
    if ($reviewText -notmatch "(?m)^##\s+Round 1\b") {
        Add-Finding "P0_PROGRAM_ADVERSARIAL_REVIEW_MISSING $stateCurrentTaskId round_1"
    }
    if ($reviewText -notmatch "(?m)^##\s+Round 2\b") {
        Add-Finding "P0_PROGRAM_ADVERSARIAL_REVIEW_MISSING $stateCurrentTaskId round_2"
    }

    $closeoutPolicy = @(Get-SectionBlock -Block $taskBlock -Key "closeoutPolicy")
    $localCommit = @(Get-SectionBlock -Block $closeoutPolicy -Key "localCommit")
    $merge = @(Get-SectionBlock -Block $closeoutPolicy -Key "fastForwardMerge")
    $push = @(Get-SectionBlock -Block $closeoutPolicy -Key "push")
    $cleanup = @(Get-SectionBlock -Block $closeoutPolicy -Key "cleanup")
    if ((Get-ScalarValue -Block $localCommit -Key "approved") -ne "true") {
        Add-Finding "P0_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId localCommit"
    }
    if ((Get-ScalarValue -Block $merge -Key "approved") -ne "true" -or (Get-ScalarValue -Block $merge -Key "targetBranch") -ne "master") {
        Add-Finding "P0_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId fastForwardMerge"
    }
    if ((Get-ScalarValue -Block $push -Key "approved") -ne "true" -or (Get-ScalarValue -Block $push -Key "target") -ne "origin/master") {
        Add-Finding "P0_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId push"
    }
    if ((Get-ScalarValue -Block $cleanup -Key "deleteShortBranch") -ne "true") {
        Add-Finding "P0_PROGRAM_CLOSEOUT_POLICY_INVALID $stateCurrentTaskId cleanup"
    }

    $capabilities = @(Get-SectionBlock -Block $taskBlock -Key "capabilities")
    foreach ($blockedCapability in @("runtimeAcceptance", "stagingProdDeploy", "forcePush", "pr", "costCalibrationGate")) {
        if ((Get-ScalarValue -Block $capabilities -Key $blockedCapability) -notmatch "^blocked") {
            Add-Finding "P0_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED $stateCurrentTaskId $blockedCapability"
        }
    }
    foreach ($approvalGatedCapability in @("dependencyIntroduction", "schemaMigration", "databaseMutation", "providerCall")) {
        $capabilityValue = Get-ScalarValue -Block $capabilities -Key $approvalGatedCapability
        if ([string]::IsNullOrWhiteSpace($capabilityValue)) {
            Add-Finding "P0_PROGRAM_APPROVAL_GATED_CAPABILITY_MISSING $stateCurrentTaskId $approvalGatedCapability"
            continue
        }
        if ($capabilityValue -notmatch "^blocked") {
            $freshApprovalSource = Get-ScalarValue -Block $taskBlock -Key "freshApprovalSource"
            if ([string]::IsNullOrWhiteSpace($freshApprovalSource)) {
                Add-Finding "P0_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING $stateCurrentTaskId $approvalGatedCapability"
                continue
            }
            $freshApprovalFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $freshApprovalSource
            if (-not (Test-Path -LiteralPath $freshApprovalFullPath -PathType Leaf)) {
                Add-Finding "P0_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING $stateCurrentTaskId $approvalGatedCapability"
                continue
            }
            $freshApprovalText = Get-Content -LiteralPath $freshApprovalFullPath -Raw
            if ($freshApprovalText -notmatch "(?i)human approval|用户.{0,20}批准|Status:\s*approved") {
                Add-Finding "P0_PROGRAM_FRESH_APPROVAL_EVIDENCE_INVALID $stateCurrentTaskId $approvalGatedCapability"
            }
        }
    }

    $allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
    $blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
    $filesToCheck = @($ChangedFiles | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    if ($filesToCheck.Count -eq 0 -and -not $SkipGitChecks) {
        if ($Phase -eq "pre_commit") {
            $filesToCheck = @(& git -C $RepositoryRoot diff --cached --name-only --diff-filter=ACMR)
        } elseif ($Phase -eq "pre_push") {
            $filesToCheck = @(& git -C $RepositoryRoot diff --name-only origin/master..HEAD)
        }
    }
    foreach ($changedFile in $filesToCheck) {
        $blockedMatch = @($blockedFiles | Where-Object { Test-PathPattern -Path $changedFile -Pattern $_ })
        if ($blockedMatch.Count -gt 0) {
            Add-Finding "P0_PROGRAM_BLOCKED_FILES_VIOLATION $changedFile"
            continue
        }
        $allowedMatch = @($allowedFiles | Where-Object { Test-PathPattern -Path $changedFile -Pattern $_ })
        if ($allowedMatch.Count -eq 0) {
            Add-Finding "P0_PROGRAM_ALLOWED_FILES_VIOLATION $changedFile"
        }

        $changedFullPath = Resolve-RepositoryPath -Root $RepositoryRoot -Path $changedFile
        if (Test-Path -LiteralPath $changedFullPath -PathType Leaf) {
            $changedText = Get-Content -LiteralPath $changedFullPath -Raw
            foreach ($pattern in @(
                "-----BEGIN(?: [A-Z]+)? PRIVATE KEY-----",
                "(?i)Authorization:\s*Bearer\s+[A-Za-z0-9._~+/=-]{12,}",
                "(?i)postgres(?:ql)?://[^\s<]+",
                "(?i)\bsk-[A-Za-z0-9_-]{20,}\b"
            )) {
                if ($changedText -match $pattern) {
                    Add-Finding "P0_PROGRAM_SENSITIVE_CONTENT_DETECTED $changedFile"
                    break
                }
            }
        }
    }
}

if (-not $SkipGitChecks) {
    $insideWorktree = ((& git -C $RepositoryRoot rev-parse --is-inside-work-tree) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        Add-Finding "P0_PROGRAM_NOT_IN_GIT_WORKTREE"
    } else {
        $unmerged = @(& git -C $RepositoryRoot diff --name-only --diff-filter=U)
        if ($unmerged.Count -gt 0) {
            Add-Finding "P0_PROGRAM_UNMERGED_PATHS"
        }
        $branch = ((& git -C $RepositoryRoot branch --show-current) -join "").Trim()
        if ($Phase -eq "pre_commit" -and $branch -in @("master", "main")) {
            Add-Finding "P0_PROGRAM_PROTECTED_BRANCH_COMMIT"
        }
        if ($Phase -eq "pre_push") {
            & git -C $RepositoryRoot merge-base --is-ancestor origin/master HEAD
            if ($LASTEXITCODE -ne 0) {
                Add-Finding "P0_PROGRAM_NON_FAST_FORWARD_PUSH"
            }
            if (@(& git -C $RepositoryRoot status --porcelain).Count -gt 0) {
                Add-Finding "P0_PROGRAM_PRE_PUSH_WORKTREE_NOT_CLEAN"
            }
        }
    }
}

if ($findings.Count -gt 0) {
    throw ($findings -join [Environment]::NewLine)
}

Write-Output "p0ProgramGuardResult: pass"
Write-Output "programId: $expectedProgramId"
Write-Output "currentTaskId: $stateCurrentTaskId"
Write-Output "nextTaskId: $stateNextTaskId"
Write-Output "phase: $Phase"
Write-Output "deploymentStatus: blocked_requires_fresh_user_approval"
Write-Output "runtimeAcceptanceStatus: excluded_from_program"
