param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml",

    [Parameter(Mandatory = $false)]
    [string]$LeasePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationWorktreeRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$RunRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$HandoffRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$AutomationRegistryRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$OnDemandAutomationRoot = "",

    [Parameter(Mandatory = $false)]
    [string]$PrimaryAutomationRepositoryPath = "D:\tiku",

    [Parameter(Mandatory = $false)]
    [int]$ActiveRunHeartbeatMinutes = 120,

    [Parameter(Mandatory = $false)]
    [switch]$SkipLeaseCheck,

    [Parameter(Mandatory = $false)]
    [switch]$SkipWorktreeHygieneCheck,

    [Parameter(Mandatory = $false)]
    [switch]$SkipAutomationRegistrationCheck,

    [Parameter(Mandatory = $false)]
    [switch]$SkipPrimaryRepositoryPostureCheck,

    [Parameter(Mandatory = $false)]
    [switch]$AllowProtectedBranch
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

function Add-RecoverableFinding {
    param([Parameter(Mandatory = $true)][string]$Message)

    $script:recoverableFindings.Add($Message)
    Write-Output $Message
}

function Write-StartupResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$StopTaxonomy = ""
    )

    if ([string]::IsNullOrWhiteSpace($StopTaxonomy)) {
        $StopTaxonomy = Get-StartupStopTaxonomy -Decision $Decision -Reason $Reason
    }

    Write-Section -Title "Result"
    Write-Output "startupDecision: $Decision"
    Write-Output "stopTaxonomy: $StopTaxonomy"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Get-StartupStopTaxonomy {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Reason
    )

    if (-not [string]::IsNullOrWhiteSpace($script:startupStopTaxonomyOverride)) {
        return $script:startupStopTaxonomyOverride
    }
    if ($Reason -match "registration") { return "registration_mismatch" }
    if ($Reason -match "lease|owner|heartbeat|active run") { return "active_owner" }
    if ($Reason -match "cleanup|hygiene|stale") { return "hygiene_deferred" }
    if ($Reason -match "remote") { return "remote_divergence" }
    if ($Reason -match "validation|dirty primary automation repository") { return "validation_failed" }

    switch ($Decision) {
        "no_executable_task" { return "no_task" }
        "exit_active_owner_present" { return "active_owner" }
        "stop_existing_run_active" { return "active_owner" }
        "cleanup_stale_artifacts" { return "hygiene_deferred" }
        "closeout_recovery" { return "closeout_pending" }
        "manual_required_owner_recovery" { return "active_owner" }
        default { return "hard_block" }
    }
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
            $currentId = $Matches[1].Trim()
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
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Test-StructuredCloseoutPolicy {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$TaskBlock)

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
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-PendingTaskIds {
    param([Parameter(Mandatory = $true)][object[]]$Blocks)

    $pending = New-Object System.Collections.Generic.List[string]
    foreach ($block in $Blocks) {
        $status = Get-ScalarValue -Block $block.Lines -Key "status"
        if ($status -eq "pending") {
            $pending.Add($block.Id)
        }
    }

    return $pending.ToArray()
}

function ConvertTo-FullPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return [System.IO.Path]::GetFullPath($Path)
}

function Test-GitDirty {
    param([Parameter(Mandatory = $true)][string]$Path)

    $status = @(& git -C $Path status --porcelain 2>$null)
    if ($LASTEXITCODE -ne 0) {
        return $true
    }

    return $status.Count -gt 0
}

function Get-OutputValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Invoke-SeedTransactionRecoveryReadiness {
    param([Parameter(Mandatory = $true)][string]$WorktreePath)

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("seedRecoveryDecision: stop_for_hard_block", "reason: seed transaction recovery readiness script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -SeedWorktreePath $WorktreePath `
                -MatrixPath $MatrixPath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-ValidationSurfaceReadiness {
    param(
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][string]$WorktreePath
    )

    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ValidationSurfaceReadiness.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("validationSurfaceDecision: stop_for_hard_block", "reason: validation surface readiness script is missing")
            ExitCode = 1
        }
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    Push-Location -LiteralPath $WorktreePath
    try {
        $output = @(
            & powershell.exe `
                -NoProfile `
                -ExecutionPolicy Bypass `
                -File $scriptPath `
                -TaskId $TargetTaskId `
                -QueuePath $QueuePath 2>&1
        )
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        Pop-Location
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Invoke-AutomationRegistrationReadiness {
    $scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationRegistrationReadiness.ps1"
    if (-not (Test-Path -LiteralPath $scriptPath)) {
        return [pscustomobject]@{
            Output = @("automationRegistrationDecision: stop_for_hard_block", "stopTaxonomy: registration_mismatch", "reason: automation registration readiness script is missing")
            ExitCode = 1
        }
    }

    $registrationArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $scriptPath,
        "-ProjectStatePath",
        $ProjectStatePath
    )
    if (-not [string]::IsNullOrWhiteSpace($AutomationRegistryRoot)) {
        $registrationArgs += @("-AutomationRoot", $AutomationRegistryRoot)
    }
    if (-not [string]::IsNullOrWhiteSpace($OnDemandAutomationRoot)) {
        $registrationArgs += @("-OnDemandAutomationRoot", $OnDemandAutomationRoot)
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& powershell.exe @registrationArgs 2>&1)
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Test-PrimaryAutomationRepositoryPosture {
    param([Parameter(Mandatory = $true)][string]$Path)

    Write-Section -Title "Primary Automation Repository Posture"
    Write-Output "primaryAutomationRepositoryPath: $Path"

    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path -LiteralPath $Path)) {
        Write-Output "primaryAutomationRepositoryPosture: not_present"
        return
    }

    $insideWorktree = ((& git -C $Path rev-parse --is-inside-work-tree 2>$null) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or $insideWorktree -ne "true") {
        Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_REPOSITORY_NOT_GIT $Path"
        return
    }

    $status = @(& git -C $Path status --porcelain=v1 -uall 2>$null)
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_REPOSITORY_STATUS_FAILED $Path"
        return
    }
    if ($status.Count -gt 0) {
        Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_REPOSITORY_DIRTY $Path"
        $script:startupStopTaxonomyOverride = "active_owner"
        return
    }

    $branch = ((& git -C $Path branch --show-current 2>$null) -join "").Trim()
    $headSha = ((& git -C $Path rev-parse HEAD 2>$null) -join "").Trim()
    $originMasterSha = ((& git -C $Path rev-parse origin/master 2>$null) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($branch)) {
        $branch = "(detached HEAD)"
    }

    Write-Output "primaryAutomationRepositoryBranch: $branch"
    Write-Output "primaryAutomationRepositoryHead: $headSha"
    Write-Output "primaryAutomationRepositoryOriginMaster: $originMasterSha"

    if ($branch -eq "(detached HEAD)") {
        if (-not [string]::IsNullOrWhiteSpace($originMasterSha) -and $headSha -ne $originMasterSha) {
            Write-Output "primaryAutomationRepositoryPosture: warning_clean_detached_stale"
        } else {
            Write-Output "primaryAutomationRepositoryPosture: pass_clean_detached_aligned"
        }
        return
    }

    if ($branch -eq "master" -or $branch -eq "main") {
        if (-not [string]::IsNullOrWhiteSpace($originMasterSha) -and $headSha -ne $originMasterSha) {
            Write-Output "primaryAutomationRepositoryPosture: warning_clean_protected_branch_stale"
        } else {
            Write-Output "primaryAutomationRepositoryPosture: pass_clean_protected_branch_aligned"
        }
        return
    }

    if ($branch -like "codex/*") {
        & git -C $Path merge-base --is-ancestor HEAD origin/master 2>$null
        if ($LASTEXITCODE -eq 0) {
            Add-RecoverableFinding "RECOVERABLE_PRIMARY_AUTOMATION_REPOSITORY_MERGED_CODEX_BRANCH $Path branch=$branch"
        } else {
            Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_REPOSITORY_UNMERGED_CODEX_BRANCH $Path branch=$branch"
        }
        return
    }

    Add-Finding "HARD_BLOCK_PRIMARY_AUTOMATION_REPOSITORY_UNEXPECTED_BRANCH $Path branch=$branch"
}

function Test-LocalToolingReady {
    if (-not (Test-Path -LiteralPath "package.json")) {
        Write-Output "localToolingReadiness: not_applicable"
        return
    }

    if (-not (Test-Path -LiteralPath "node_modules")) {
        Write-Output "localToolingReadiness: missing_node_modules"
        Write-Output "startupStateWarning: local JS tooling is unavailable in this worktree"
        return
    }

    $requiredToolingPaths = @(
        "node_modules\.bin\eslint.cmd",
        "node_modules\.bin\tsc.cmd",
        "node_modules\.bin\prettier.cmd",
        "node_modules\typescript\package.json",
        "node_modules\prettier\bin\prettier.cjs"
    )

    $missingToolingPaths = @($requiredToolingPaths | Where-Object { -not (Test-Path -LiteralPath $_) })
    if ($missingToolingPaths.Count -eq 0) {
        Write-Output "localToolingReadiness: ready"
        return
    }

    Write-Output "localToolingReadiness: degraded"
    foreach ($missingToolingPath in $missingToolingPaths) {
        Write-Output "localToolingMissing: $missingToolingPath"
    }
    Write-Output "startupStateWarning: local JS tooling is partially unavailable in this worktree"
}

function Write-BranchHygieneAdvisory {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$CurrentBranch)

    $mergedBranches = @(& git branch --merged master --list "codex/*" --format="%(refname:short)" 2>$null)
    if ($LASTEXITCODE -ne 0) {
        Write-Output "startupBranchHygieneDecision: advisory_unavailable"
        return
    }

    $unmergedBranches = @(& git branch --no-merged master --list "codex/*" --format="%(refname:short)" 2>$null)
    if ($LASTEXITCODE -ne 0) {
        Write-Output "startupBranchHygieneDecision: advisory_unavailable"
        return
    }

    $mergedCandidates = @($mergedBranches | Where-Object {
        -not [string]::IsNullOrWhiteSpace($_) -and $_.Trim() -ne $CurrentBranch
    })
    $unmergedReview = @($unmergedBranches | Where-Object {
        -not [string]::IsNullOrWhiteSpace($_) -and $_.Trim() -ne $CurrentBranch
    })

    Write-Output "startupBranchHygieneMergedCandidateCount: $($mergedCandidates.Count)"
    Write-Output "startupBranchHygieneUnmergedReviewCount: $($unmergedReview.Count)"
    if ($mergedCandidates.Count -gt 0) {
        Write-Output "startupBranchHygieneDecision: cleanup_available"
        Write-Output "startupBranchHygieneAction: run Test-ModuleRunV2BranchHygiene.ps1 -SummaryOnly before optional merged-only cleanup"
        return
    }
    if ($unmergedReview.Count -gt 0) {
        Write-Output "startupBranchHygieneDecision: manual_review_available"
        return
    }

    Write-Output "startupBranchHygieneDecision: clean"
}

function Get-RunRegistryEntries {
    param([Parameter(Mandatory = $true)][string]$Root)

    if (-not (Test-Path -LiteralPath $Root)) {
        return @()
    }

    $entries = New-Object System.Collections.Generic.List[object]
    $registryFiles = @(Get-ChildItem -LiteralPath $Root -Filter "*.json" -File -ErrorAction SilentlyContinue)
    foreach ($registryFile in $registryFiles) {
        try {
            $registryJson = Get-Content -LiteralPath $registryFile.FullName -Raw | ConvertFrom-Json
            $entries.Add([pscustomobject]@{ Path = $registryFile.FullName; Value = $registryJson })
        } catch {
            Write-Output "runRegistryInvalid: $($registryFile.FullName)"
        }
    }

    return $entries.ToArray()
}

function Find-RunRegistryByWorktree {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Entries,
        [Parameter(Mandatory = $true)][string]$WorktreePath
    )

    $worktreeFullPath = ConvertTo-FullPath -Path $WorktreePath
    foreach ($entry in $Entries) {
        $entryWorktreePath = [string]$entry.Value.worktreePath
        if ([string]::IsNullOrWhiteSpace($entryWorktreePath)) {
            continue
        }

        if ((ConvertTo-FullPath -Path $entryWorktreePath) -eq $worktreeFullPath) {
            return $entry
        }
    }

    return $null
}

function Test-RunHeartbeatActive {
    param(
        [Parameter(Mandatory = $true)][object]$Run,
        [Parameter(Mandatory = $true)][int]$HeartbeatMinutes
    )

    $heartbeatAtText = [string]$Run.heartbeatAtUtc
    if ([string]::IsNullOrWhiteSpace($heartbeatAtText)) {
        return $false
    }

    try {
        $heartbeatAt = [DateTimeOffset]::Parse($heartbeatAtText).ToUniversalTime()
        return $heartbeatAt.AddMinutes($HeartbeatMinutes) -gt [DateTimeOffset]::UtcNow
    } catch {
        return $false
    }
}

function Test-RedactedHandoffReady {
    param(
        [Parameter(Mandatory = $true)][object]$Run,
        [Parameter(Mandatory = $true)][string]$AllowedRoot
    )

    $handoffPath = [string]$Run.redactedHandoffPath
    if ([string]::IsNullOrWhiteSpace($handoffPath) -or -not (Test-Path -LiteralPath $handoffPath)) {
        return $false
    }

    if ([string]::IsNullOrWhiteSpace($AllowedRoot) -or -not (Test-Path -LiteralPath $AllowedRoot)) {
        return $true
    }

    $handoffFullPath = ConvertTo-FullPath -Path $handoffPath
    $allowedRootFullPath = ConvertTo-FullPath -Path $AllowedRoot
    if (-not $allowedRootFullPath.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $allowedRootFullPath = $allowedRootFullPath + [System.IO.Path]::DirectorySeparatorChar
    }

    return $handoffFullPath.StartsWith($allowedRootFullPath, [System.StringComparison]::OrdinalIgnoreCase)
}

function Resolve-WorktreeLocalPath {
    param(
        [Parameter(Mandatory = $true)][string]$WorktreePath,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return ""
    }

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return (Join-Path -Path $WorktreePath -ChildPath $Path)
}

function Test-TaskEvidenceAuditPresent {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$WorktreePath
    )

    if ($null -eq $script:startupTaskBlocks) {
        return $false
    }

    $taskBlock = @(Get-TaskBlock -Blocks $script:startupTaskBlocks -Id $TaskId)
    if ($taskBlock.Count -eq 0) {
        return $false
    }

    $evidencePath = Resolve-WorktreeLocalPath -WorktreePath $WorktreePath -Path (Get-ScalarValue -Block $taskBlock -Key "evidencePath")
    $auditReviewPath = Resolve-WorktreeLocalPath -WorktreePath $WorktreePath -Path (Get-ScalarValue -Block $taskBlock -Key "auditReviewPath")

    return -not [string]::IsNullOrWhiteSpace($evidencePath) -and
        -not [string]::IsNullOrWhiteSpace($auditReviewPath) -and
        (Test-Path -LiteralPath $evidencePath) -and
        (Test-Path -LiteralPath $auditReviewPath)
}

function Test-PlaceholderCommitSha {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    return [string]::IsNullOrWhiteSpace($Value) -or
        $Value -eq "null" -or
        $Value -eq "pending-local-commit" -or
        $Value -eq "pending-closeout-commit" -or
        $Value -match "^pending-"
}

function Test-GitAncestor {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Ancestor,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Descendant
    )

    if ([string]::IsNullOrWhiteSpace($Ancestor) -or [string]::IsNullOrWhiteSpace($Descendant)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & git merge-base --is-ancestor $Ancestor $Descendant 2>$null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
}

function Test-AutomationWorktreeHygiene {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$CurrentWorktree,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$RunRegistryEntries,
        [Parameter(Mandatory = $true)][string]$AllowedHandoffRoot,
        [Parameter(Mandatory = $true)][int]$HeartbeatMinutes
    )

    if (-not (Test-Path -LiteralPath $Root)) {
        Write-Output "worktreeHygiene: no_automation_worktree_root"
        return
    }

    $rootFullPath = ConvertTo-FullPath -Path $Root
    $currentFullPath = ConvertTo-FullPath -Path $CurrentWorktree
    $originMasterSha = ((& git rev-parse origin/master) -join "").Trim()
    $worktreeOutput = @(& git worktree list --porcelain)
    $worktrees = New-Object System.Collections.Generic.List[object]
    $currentPath = ""
    $currentHead = ""

    foreach ($line in $worktreeOutput) {
        if ($line -match "^worktree\s+(.+)\s*$") {
            if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
                $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
            }
            $currentPath = $Matches[1].Trim()
            $currentHead = ""
            continue
        }

        if ($line -match "^HEAD\s+([0-9a-f]+)\s*$") {
            $currentHead = $Matches[1].Trim()
        }
    }

    if (-not [string]::IsNullOrWhiteSpace($currentPath)) {
        $worktrees.Add([pscustomobject]@{ Path = $currentPath; Head = $currentHead })
    }

    foreach ($worktree in $worktrees) {
        $worktreeFullPath = ConvertTo-FullPath -Path $worktree.Path
        if (-not $worktreeFullPath.StartsWith($rootFullPath, [System.StringComparison]::OrdinalIgnoreCase)) {
            continue
        }

        if ($worktreeFullPath -eq $currentFullPath) {
            continue
        }

        Write-Output "automationWorktree: $worktreeFullPath"
        Write-Output "automationWorktreeHead: $($worktree.Head)"
        $runRegistryEntry = Find-RunRegistryByWorktree -Entries $RunRegistryEntries -WorktreePath $worktreeFullPath
        $runRegistry = $null
        if ($null -ne $runRegistryEntry) {
            $runRegistry = $runRegistryEntry.Value
            Write-Output "runRegistryPath: $($runRegistryEntry.Path)"
            Write-Output "runRegistryStatus: $([string]$runRegistry.status)"
            Write-Output "runRegistryTaskId: $([string]$runRegistry.taskId)"
        }

        if (Test-GitDirty -Path $worktreeFullPath) {
            if ($null -eq $runRegistry) {
                $seedRecoveryResult = Invoke-SeedTransactionRecoveryReadiness -WorktreePath $worktreeFullPath
                $seedRecoveryResult.Output | ForEach-Object { Write-Output $_ }
                $seedRecoveryDecision = Get-OutputValue -Output $seedRecoveryResult.Output -Key "seedRecoveryDecision"
                if ($seedRecoveryResult.ExitCode -eq 0 -and $seedRecoveryDecision -eq "recoverable_seed_transaction") {
                    $script:startupOverrideDecision = "adopt_recoverable_run"
                    $script:startupOverrideReason = "dirty automation worktree has a recoverable auto-seed transaction"
                    $script:startupOverrideExitCode = 0
                    Write-Output "RECOVERABLE_SEED_TRANSACTION_WORKTREE $worktreeFullPath"
                    Write-Output "seedTransactionRecovery: ready"
                    Write-Output "seedTransactionWorktreePath: $worktreeFullPath"
                    return
                }

                $script:startupOverrideDecision = "stop_for_manual_decision"
                $script:startupOverrideReason = "dirty automation worktree has no run registry handoff"
                $script:startupOverrideExitCode = 1
                Write-Output "MANUAL_DECISION_DIRTY_WORKTREE_NO_REGISTRY $worktreeFullPath"
                return
            }

            $runStatus = [string]$runRegistry.status
            $safeToAdopt = [bool]$runRegistry.safeToAdopt
            $hasReadyHandoff = Test-RedactedHandoffReady -Run $runRegistry -AllowedRoot $AllowedHandoffRoot

            $hasEvidenceAudit = Test-TaskEvidenceAuditPresent -TaskId ([string]$runRegistry.taskId) -WorktreePath $worktreeFullPath
            if ($runStatus -eq "active" -and -not $safeToAdopt -and $hasEvidenceAudit) {
                Write-Output "validationSurfacePreHeartbeat: evidence_audit_present"
                $validationSurfaceResult = Invoke-ValidationSurfaceReadiness -TargetTaskId ([string]$runRegistry.taskId) -WorktreePath $worktreeFullPath
                $validationSurfaceResult.Output | ForEach-Object { Write-Output $_ }
                $ownerRecoveryDecision = Get-OutputValue -Output $validationSurfaceResult.Output -Key "ownerRecoveryDecision"
                $validationSurfaceDecision = Get-OutputValue -Output $validationSurfaceResult.Output -Key "validationSurfaceDecision"
                $closeoutTransactionState = Get-OutputValue -Output $validationSurfaceResult.Output -Key "closeoutTransactionState"
                $nextAutopilotExpectedAction = Get-OutputValue -Output $validationSurfaceResult.Output -Key "nextAutopilotExpectedAction"
                if ($validationSurfaceResult.ExitCode -eq 0 -and $ownerRecoveryDecision -eq "manual_required_owner_recovery") {
                    $script:startupOverrideDecision = "manual_required_owner_recovery"
                    $script:startupOverrideReason = "dirty active run requires owner recovery after validation-surface classification; validation=$validationSurfaceDecision; closeout=$closeoutTransactionState"
                    $script:startupOverrideExitCode = 1
                    Write-Output "MANUAL_REQUIRED_OWNER_RECOVERY $worktreeFullPath"
                    Write-Output "validationSurfaceDecision: $validationSurfaceDecision"
                    Write-Output "closeoutTransactionState: $closeoutTransactionState"
                    return
                }

                if ($validationSurfaceResult.ExitCode -eq 0 -and $nextAutopilotExpectedAction -eq "closeout_recovery") {
                    $script:startupOverrideDecision = "closeout_recovery"
                    $script:startupOverrideReason = "dirty active run has closeout-ready evidence after validation-surface classification"
                    $script:startupOverrideExitCode = 0
                    Write-Output "CLOSEOUT_RECOVERY_READY $worktreeFullPath"
                    Write-Output "validationSurfaceDecision: $validationSurfaceDecision"
                    Write-Output "closeoutTransactionState: $closeoutTransactionState"
                    return
                }
            } elseif ($runStatus -eq "active" -and -not $safeToAdopt) {
                Write-Output "validationSurfacePreHeartbeat: skipped_missing_evidence_or_audit"
            }

            if ($runStatus -eq "active" -and (Test-RunHeartbeatActive -Run $runRegistry -HeartbeatMinutes $HeartbeatMinutes)) {
                $script:startupOverrideDecision = "exit_active_owner_present"
                $script:startupOverrideReason = "active run registry owner has a fresh heartbeat"
                $script:startupOverrideExitCode = 1
                Write-Output "ACTIVE_OWNER_PRESENT $worktreeFullPath"
                Write-Output "heartbeatAtUtc: $([string]$runRegistry.heartbeatAtUtc)"
                return
            }

            if ($safeToAdopt -and $hasReadyHandoff -and $runStatus -in @("recoverable", "stopped", "abandoned")) {
                $script:startupOverrideDecision = "adopt_recoverable_run"
                $script:startupOverrideReason = "dirty automation worktree has an adoptable redacted handoff"
                $script:startupOverrideExitCode = 0
                Write-Output "ADOPT_RECOVERABLE_RUN $worktreeFullPath"
                Write-Output "redactedHandoffPath: $([string]$runRegistry.redactedHandoffPath)"
                return
            }

            if ($runStatus -in @("recoverable", "stopped", "abandoned")) {
                $script:startupOverrideDecision = "open_recovery_plan"
                $script:startupOverrideReason = "dirty automation worktree has registry but no adoptable redacted handoff"
                $script:startupOverrideExitCode = 0
                Write-Output "OPEN_RECOVERY_PLAN $worktreeFullPath"
                return
            }

            Add-Finding "HARD_BLOCK_AUTOMATION_WORKTREE_DIRTY $worktreeFullPath"
            continue
        }

        if ($null -ne $runRegistry -and [string]$runRegistry.status -eq "cleanup_ready" -and [string]$runRegistry.cleanupPolicy -eq "cleanup_ready") {
            $script:startupOverrideDecision = "cleanup_stale_artifacts"
            $script:startupOverrideReason = "clean automation worktree is marked cleanup_ready in run registry"
            $script:startupOverrideExitCode = 0
            Write-Output "CLEANUP_STALE_ARTIFACTS $worktreeFullPath"
            return
        }

        if (-not [string]::IsNullOrWhiteSpace($originMasterSha) -and $worktree.Head -ne $originMasterSha) {
            Add-RecoverableFinding "RECOVERABLE_AUTOMATION_WORKTREE_STALE_CLEAN $worktreeFullPath"
        }
    }
}

$findings = New-Object System.Collections.Generic.List[string]
$recoverableFindings = New-Object System.Collections.Generic.List[string]
$startupOverrideDecision = ""
$startupOverrideReason = ""
$startupOverrideExitCode = 1
$startupStopTaxonomyOverride = ""

try {
    Write-Section -Title "Module Run v2 Automation Startup Readiness"
    Write-Output "automationStartupMode: hard_block"

    foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            throw "Missing required file: $requiredPath"
        }
    }

    if ([string]::IsNullOrWhiteSpace($AutomationWorktreeRoot)) {
        $AutomationWorktreeRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\worktrees"
    }
    if ([string]::IsNullOrWhiteSpace($RunRegistryRoot)) {
        $RunRegistryRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\automation-runs"
    }
    if ([string]::IsNullOrWhiteSpace($HandoffRoot)) {
        $HandoffRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\tiku\handoffs"
    }

    $projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
    $script:startupTaskBlocks = $taskBlocks

    if ([string]::IsNullOrWhiteSpace($TaskId)) {
        $TaskId = Get-CurrentTaskId -Lines $projectStateLines
    }

    Write-Output "taskId: $TaskId"
    Write-Output "automationWorktreeRoot: $AutomationWorktreeRoot"
    Write-Output "runRegistryRoot: $RunRegistryRoot"
    Write-Output "handoffRoot: $HandoffRoot"

    if (-not $SkipAutomationRegistrationCheck) {
        Write-Section -Title "Automation Registration"
        $registrationResult = Invoke-AutomationRegistrationReadiness
        $registrationResult.Output | ForEach-Object { Write-Output $_ }
        $registrationDecision = Get-OutputValue -Output $registrationResult.Output -Key "automationRegistrationDecision"
        $registrationTaxonomy = Get-OutputValue -Output $registrationResult.Output -Key "stopTaxonomy"
        if ($registrationResult.ExitCode -ne 0 -or $registrationDecision -eq "stop_for_hard_block") {
            Write-StartupResult -Decision "stop_for_hard_block" -Reason "automation registration readiness failed" -ExitCode 1 -StopTaxonomy $(if ([string]::IsNullOrWhiteSpace($registrationTaxonomy)) { "registration_mismatch" } else { $registrationTaxonomy })
        }
        if ($registrationDecision -eq "planned_pause_for_tuning") {
            Write-StartupResult -Decision "planned_pause_for_tuning" -Reason "local automation is intentionally paused for mechanism tuning" -ExitCode 0 -StopTaxonomy "planned_pause"
        }
    }

    if (-not $SkipPrimaryRepositoryPostureCheck) {
        Test-PrimaryAutomationRepositoryPosture -Path $PrimaryAutomationRepositoryPath
    }

    $currentBranch = ((& git branch --show-current) -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $currentBranch = "(detached HEAD)"
    }

    Write-Section -Title "Repository"
    Write-Output "branch: $currentBranch"
    if (-not $AllowProtectedBranch -and $currentBranch -in @("master", "main")) {
        Add-Finding "HARD_BLOCK_PROTECTED_BRANCH $currentBranch"
    }

    Test-LocalToolingReady
    Write-BranchHygieneAdvisory -CurrentBranch $currentBranch

    if (-not $SkipLeaseCheck) {
        $leaseArgs = @(
            "-NoProfile",
            "-ExecutionPolicy",
            "Bypass",
            "-File",
            (Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2AutomationLeaseReadiness.ps1")
        )
        if (-not [string]::IsNullOrWhiteSpace($LeasePath)) {
            $leaseArgs += @("-LeasePath", $LeasePath)
        }
        if (-not [string]::IsNullOrWhiteSpace($TaskId)) {
            $leaseArgs += @("-CurrentTaskId", $TaskId)
        }

        $leaseOutput = @(& powershell.exe @leaseArgs 2>&1)
        $leaseOutput | ForEach-Object { Write-Output $_ }
        if ($LASTEXITCODE -ne 0) {
            if (($leaseOutput -join "`n") -match "automationLeaseDecision:\s*stop_existing_run_active") {
                Write-StartupResult -Decision "stop_existing_run_active" -Reason "automation lease is active" -ExitCode 1
            }
            Write-StartupResult -Decision "stop_for_hard_block" -Reason "automation lease readiness failed" -ExitCode 1
        }
    }

    if (-not $SkipWorktreeHygieneCheck) {
        Write-Section -Title "Worktree Hygiene"
        $currentWorktree = ((& git rev-parse --show-toplevel) -join "").Trim()
        $runRegistryEntries = @(Get-RunRegistryEntries -Root $RunRegistryRoot)
        Write-Output "runRegistryCount: $($runRegistryEntries.Count)"
        Test-AutomationWorktreeHygiene -Root $AutomationWorktreeRoot -CurrentWorktree $currentWorktree -RunRegistryEntries $runRegistryEntries -AllowedHandoffRoot $HandoffRoot -HeartbeatMinutes $ActiveRunHeartbeatMinutes
        if (-not [string]::IsNullOrWhiteSpace($startupOverrideDecision)) {
            Write-StartupResult -Decision $startupOverrideDecision -Reason $startupOverrideReason -ExitCode $startupOverrideExitCode
        }
    }

    $remoteAutomationApproval = Get-ProjectScalar -Lines $projectStateLines -Key "remoteAutomationApproval"
    Write-Section -Title "Project State"
    Write-Output "remoteAutomationApproval: $remoteAutomationApproval"
    if ($remoteAutomationApproval -eq "not_granted" -or [string]::IsNullOrWhiteSpace($remoteAutomationApproval)) {
        Add-Finding "HARD_BLOCK_AUTOMATION_APPROVAL_NOT_GRANTED"
    }

    $stateMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownMasterSha"
    $stateOriginMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownOriginMasterSha"
    $actualMasterSha = ((& git rev-parse master 2>$null) -join "").Trim()
    $actualOriginMasterSha = ((& git rev-parse origin/master 2>$null) -join "").Trim()
    if ($stateMasterSha -ne $actualMasterSha -and (Test-GitAncestor -Ancestor $stateMasterSha -Descendant $actualMasterSha)) {
        Write-Output "startupStateWarning: lastKnownMasterSha is an accepted ancestor of master"
        Write-Output "startupStateCheckpoint: accepted_ancestor_checkpoint master"
    }
    if ($stateOriginMasterSha -ne $actualOriginMasterSha -and (Test-GitAncestor -Ancestor $stateOriginMasterSha -Descendant $actualOriginMasterSha)) {
        Write-Output "startupStateWarning: lastKnownOriginMasterSha is an accepted ancestor of origin/master"
        Write-Output "startupStateCheckpoint: accepted_ancestor_checkpoint origin/master"
    }

    $currentTaskCommitSha = Get-ProjectScalar -Lines $projectStateLines -Key "commitSha"
    if (Test-PlaceholderCommitSha -Value $currentTaskCommitSha) {
        Write-Output "startupStateWarning: currentTask.commitSha is a placeholder"
        Write-Output "startupStateCheckpoint: accepted_ancestor_checkpoint currentTask.commitSha"
    }

    if ($matrixContent -notmatch "Cost Calibration Gate remains blocked") {
        Add-Finding "HARD_BLOCK_MISSING_COST_CALIBRATION_ANCHOR"
    }

    if ($findings.Count -gt 0) {
        Write-StartupResult -Decision "stop_for_hard_block" -Reason "startup readiness failed with $($findings.Count) finding(s)" -ExitCode 1
    }

    if ($recoverableFindings.Count -gt 0) {
        Write-Output "recoverableAutomationWorktreeCount: $($recoverableFindings.Count)"
        Write-StartupResult -Decision "cleanup_stale_artifacts" -Reason "clean stale automation worktree cleanup is available" -ExitCode 0
    }

    $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
    $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
    $pendingTaskIds = @(Get-PendingTaskIds -Blocks $taskBlocks)

    Write-Section -Title "Queue"
    Write-Output "currentTaskStatus: $taskStatus"
    Write-Output "pendingTaskCount: $($pendingTaskIds.Count)"
    foreach ($pendingTaskId in $pendingTaskIds) {
        Write-Output "pendingTask: $pendingTaskId"
    }

    if ($taskStatus -eq "in_progress") {
        Write-StartupResult -Decision "continue_current_task" -Reason "current task is in progress and startup gates passed" -ExitCode 0
    }

    if ($taskStatus -eq "ready_for_closeout") {
        if (Test-StructuredCloseoutPolicy -TaskBlock $taskBlock) {
            Write-Output "startupCloseoutPolicy: structured"
            Write-StartupResult -Decision "closeout_recovery" -Reason "current task is ready for approved closeout" -ExitCode 0
        }

        Write-StartupResult -Decision "stop_for_manual_decision" -Reason "current task is ready_for_closeout but lacks structured closeoutPolicy" -ExitCode 1 -StopTaxonomy "approval_missing"
    }

    if ($pendingTaskIds.Count -gt 0) {
        Write-StartupResult -Decision "prepare_next_task" -Reason "pending task is available after startup gates passed" -ExitCode 0
    }

    if ($taskStatus -in @("done", "closed")) {
        Write-StartupResult -Decision "no_executable_task" -Reason "current task is already closed and no pending task is available" -ExitCode 0
    }

    Write-StartupResult -Decision "no_executable_task" -Reason "no in-progress or pending task is available" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-StartupResult -Decision "stop_for_hard_block" -Reason "startup readiness encountered an error" -ExitCode 1
}
