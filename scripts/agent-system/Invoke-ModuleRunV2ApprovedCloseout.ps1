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
    [ValidateNotNullOrEmpty()]
    [string]$BaseBranch = "master",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutAuthorizationStatement = ""
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
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

function Get-ChangedFiles {
    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $stagedFiles = @(& git diff --cached --name-only --diff-filter=ACMR 2>$null)
        $workingTreeFiles = @(& git diff --name-only --diff-filter=ACMR 2>$null)
        $untrackedFiles = @(& git ls-files --others --exclude-standard 2>$null)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    return @($stagedFiles + $workingTreeFiles + $untrackedFiles | Sort-Object -Unique)
}

function Invoke-GitCommand {
    param([Parameter(Mandatory = $true)][string[]]$Arguments)

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& git @Arguments 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $output | ForEach-Object { Write-Output $_ }
    if ($LASTEXITCODE -ne 0) {
        throw "Git command failed: git $($Arguments -join ' ')"
    }
}

function Get-BranchWorktreePath {
    param([Parameter(Mandatory = $true)][string]$Branch)

    $worktreeLines = @(& git worktree list --porcelain)
    $currentWorktreePath = ""
    foreach ($line in $worktreeLines) {
        if ($line -match "^worktree\s+(.+)$") {
            $currentWorktreePath = $Matches[1].Trim()
            continue
        }

        if ($line -eq "branch refs/heads/$Branch" -and -not [string]::IsNullOrWhiteSpace($currentWorktreePath)) {
            return $currentWorktreePath
        }
    }

    return ""
}

function Assert-CleanWorktree {
    param([Parameter(Mandatory = $true)][string]$Path)

    $statusOutput = @(& git -C $Path status --porcelain)
    if ($LASTEXITCODE -ne 0) {
        throw "Unable to inspect base branch worktree: $Path"
    }

    if ($statusOutput.Count -gt 0) {
        throw "Base branch worktree is dirty and cannot receive approved closeout merge: $Path"
    }
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

function Get-ApprovedCloseoutAuthorizationSource {
    param(
        [Parameter(Mandatory = $true)][string[]]$TaskBlock,
        [Parameter(Mandatory = $false)][AllowEmptyString()][string]$Statement = ""
    )

    $taskText = ($TaskBlock -join "`n")
    if ($taskText -match "(?i)humanApproval:" -and (Test-CloseoutAuthorizationText -Text $taskText)) {
        return "task"
    }

    if (Test-CloseoutAuthorizationText -Text $Statement) {
        return "statement"
    }

    return ""
}

function Update-QueueStatus {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TargetTaskId,
        [Parameter(Mandatory = $true)][string]$Status
    )

    $lines = @(Get-Content -LiteralPath $Path)
    $insideBlock = $false
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^\s+- id:\s+$([regex]::Escape($TargetTaskId))\s*$") {
            $insideBlock = $true
            continue
        }

        if ($insideBlock -and $lines[$index] -match "^\s+- id:\s+\S+") {
            break
        }

        if ($insideBlock -and $lines[$index] -match "^\s+status:\s*.+$") {
            $prefix = ($lines[$index] -replace "status:.*$", "")
            $lines[$index] = "$prefix" + "status: $Status"
            break
        }
    }

    Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

function Update-ProjectStateCloseout {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$TargetTaskId
    )

    $lines = @(Get-Content -LiteralPath $Path)
    $insideCurrentTask = $false
    $currentTaskId = ""
    for ($index = 0; $index -lt $lines.Count; $index++) {
        if ($lines[$index] -match "^updatedAt:\s*.+$") {
            $lines[$index] = "updatedAt: `"$([DateTimeOffset]::Now.ToString("yyyy-MM-ddTHH:mm:sszzz"))`""
            continue
        }

        if ($lines[$index] -match "^currentTask:\s*$") {
            $insideCurrentTask = $true
            continue
        }

        if ($insideCurrentTask -and $lines[$index] -match "^\S") {
            $insideCurrentTask = $false
        }

        if ($insideCurrentTask -and $lines[$index] -match "^\s+id:\s*(.+)\s*$") {
            $currentTaskId = $Matches[1].Trim()
            continue
        }

        if ($insideCurrentTask -and $currentTaskId -eq $TargetTaskId -and $lines[$index] -match "^\s+status:\s*.+$") {
            $lines[$index] = "  status: closed"
        }
    }

    Set-Content -LiteralPath $Path -Value $lines -Encoding UTF8
}

Write-Section -Title "Module Run v2 Approved Closeout"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Approved closeout must run inside a Git worktree."
}

$projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath | Where-Object { $_ -ne "" })
$queueLines = @(Get-Content -LiteralPath $QueuePath | Where-Object { $_ -ne "" })
if ([string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

$taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
if ($taskBlock.Count -eq 0) {
    throw "Task not found in queue: $TaskId"
}

$taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
if ($taskStatus -notin @("done", "closed")) {
    throw "Approved closeout requires task status done or closed. Actual: $taskStatus"
}

$closeoutAuthorizationSource = Get-ApprovedCloseoutAuthorizationSource -TaskBlock $taskBlock -Statement $CloseoutAuthorizationStatement
if ([string]::IsNullOrWhiteSpace($closeoutAuthorizationSource)) {
    throw "Task does not record explicit approved closeout continuation."
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch) -or $currentBranch -in @("master", "main")) {
    throw "Approved closeout requires a non-protected short-lived branch."
}

$allowedFiles = @(Get-ListValues -Block $taskBlock -Key "allowedFiles")
$blockedFiles = @(Get-ListValues -Block $taskBlock -Key "blockedFiles")
$changedFiles = @(Get-ChangedFiles)
if ($changedFiles.Count -eq 0) {
    throw "Approved closeout found no changed files."
}

foreach ($changedFile in $changedFiles) {
    $blockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $blockedFiles
    if (-not [string]::IsNullOrWhiteSpace($blockedPattern)) {
        throw "Changed file is blocked for approved closeout: $changedFile matches $blockedPattern"
    }

    $allowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $allowedFiles
    if ([string]::IsNullOrWhiteSpace($allowedPattern)) {
        throw "Changed file is out of scope for approved closeout: $changedFile"
    }
}

Write-Output "approvedCloseoutContinuation: enabled"
Write-Output "closeoutAuthorizationSource: $closeoutAuthorizationSource"
Write-Output "taskId: $TaskId"
Write-Output "branch: $currentBranch"
Write-Output "changedFiles: $($changedFiles.Count)"

$scriptRoot = $PSScriptRoot
& (Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2ModuleCloseoutReadiness.ps1") -TaskId $TaskId -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $MatrixPath
if ($LASTEXITCODE -ne 0) {
    throw "Module closeout readiness failed."
}

& (Join-Path -Path $scriptRoot -ChildPath "Test-ModuleRunV2PrePushReadiness.ps1") -TaskId $TaskId -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath -MatrixPath $MatrixPath
if ($LASTEXITCODE -ne 0) {
    throw "Pre-push readiness failed."
}

Update-QueueStatus -Path $QueuePath -TargetTaskId $TaskId -Status "closed"
Update-ProjectStateCloseout -Path $ProjectStatePath -TargetTaskId $TaskId

$postStateChangedFiles = @(Get-ChangedFiles)
foreach ($changedFile in $postStateChangedFiles) {
    Invoke-GitCommand -Arguments @("add", "--all", "--", $changedFile)
}

$commitMessage = "chore(task): close out $TaskId"
Invoke-GitCommand -Arguments @("commit", "-m", $commitMessage)

$commitSha = ((& git rev-parse HEAD) -join "").Trim()
Write-Output "commitSha: $commitSha"

$currentWorktreeRoot = ((& git rev-parse --show-toplevel) -join "").Trim()
$baseBranchWorktreePath = Get-BranchWorktreePath -Branch $BaseBranch

if (
    -not [string]::IsNullOrWhiteSpace($baseBranchWorktreePath) -and
    (Resolve-Path -LiteralPath $baseBranchWorktreePath).Path -ne (Resolve-Path -LiteralPath $currentWorktreeRoot).Path
) {
    Assert-CleanWorktree -Path $baseBranchWorktreePath
    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "merge", "--ff-only", $currentBranch)
    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "push", "origin", $BaseBranch)
    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "fetch", "origin")
    Invoke-GitCommand -Arguments @("fetch", "origin")
} else {
    Invoke-GitCommand -Arguments @("switch", $BaseBranch)

    Invoke-GitCommand -Arguments @("merge", "--ff-only", $currentBranch)

    Invoke-GitCommand -Arguments @("push", "origin", $BaseBranch)

    Invoke-GitCommand -Arguments @("fetch", "origin")
}

Invoke-GitCommand -Arguments @("switch", "--detach", "origin/$BaseBranch")

Invoke-GitCommand -Arguments @("branch", "-D", $currentBranch)

Write-Output "mergeTarget: $BaseBranch"
Write-Output "pushTarget: origin/$BaseBranch"
Write-Output "automationWorktreeParking: detached origin/$BaseBranch"
Write-Output "branchCleanup: deleted $currentBranch"
Write-Output "postCloseoutStateReconciliation: verify project-state repository SHAs and handoff commit on next startup"
Write-Output "approved closeout executed"
