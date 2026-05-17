param(
    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$BaseBranch = "master"
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

function Write-CommandOutput {
    param(
        [Parameter(Mandatory = $true)]
        [string]$EmptyMessage,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [string[]]$Output
    )

    if ($Output.Count -eq 0) {
        Write-Output $EmptyMessage
        return
    }

    $Output | ForEach-Object { Write-Output $_ }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Git completion readiness must be run inside a Git worktree."
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    $currentBranch = "(detached HEAD)"
}

$gitDir = ((& git rev-parse --git-dir) -join "").Trim()
$gitCommonDir = ((& git rev-parse --git-common-dir) -join "").Trim()
$headSha = ((& git rev-parse --short HEAD) -join "").Trim()

Write-Section -Title "Repository"
Write-Output "branch: $currentBranch"
Write-Output "head: $headSha"
Write-Output "gitDir: $gitDir"
Write-Output "gitCommonDir: $gitCommonDir"

Write-Section -Title "Status"
$statusOutput = @(& git status --short --branch)
Write-CommandOutput -EmptyMessage "clean" -Output $statusOutput

Write-Section -Title "Tracked Changes"
$trackedChanges = @(& git diff --name-status)
Write-CommandOutput -EmptyMessage "none" -Output $trackedChanges

Write-Section -Title "Staged Changes"
$stagedChanges = @(& git diff --cached --name-status)
Write-CommandOutput -EmptyMessage "none" -Output $stagedChanges

Write-Section -Title "Untracked Files"
$untrackedFiles = @(& git ls-files --others --exclude-standard)
Write-CommandOutput -EmptyMessage "none" -Output $untrackedFiles

Write-Section -Title "Upstream"
$upstream = $null
if ($currentBranch -ne "(detached HEAD)") {
    $upstreamOutput = @(& git for-each-ref "--format=%(upstream:short)" "refs/heads/$currentBranch")
} else {
    $upstreamOutput = @()
}

if ($LASTEXITCODE -eq 0 -and $upstreamOutput.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace(($upstreamOutput -join "").Trim())) {
    $upstream = ($upstreamOutput -join "").Trim()
    Write-Output "upstream: $upstream"
    $aheadBehind = @(& git rev-list --left-right --count "$upstream...HEAD")
    if ($LASTEXITCODE -eq 0 -and $aheadBehind.Count -gt 0) {
        Write-Output "leftRightCount($upstream...HEAD): $($aheadBehind[0])"
    }
} else {
    Write-Output "upstream: none"
}

Write-Section -Title "Base Compare"
$baseCandidates = @("origin/$BaseBranch", $BaseBranch)
$baseRef = $null
foreach ($baseCandidate in $baseCandidates) {
    & git rev-parse --verify --quiet $baseCandidate *> $null
    if ($LASTEXITCODE -eq 0) {
        $baseRef = $baseCandidate
        break
    }
}

if ([string]::IsNullOrWhiteSpace($baseRef)) {
    Write-Output "base: missing ($BaseBranch)"
} else {
    Write-Output "base: $baseRef"
    $baseAheadCommits = @(& git log --oneline "$baseRef..HEAD")
    Write-Output "commitsAhead:"
    Write-CommandOutput -EmptyMessage "none" -Output $baseAheadCommits

    $baseChangedFiles = @(& git diff --name-only "$baseRef..HEAD")
    Write-Output "filesChangedAgainstBase:"
    Write-CommandOutput -EmptyMessage "none" -Output $baseChangedFiles
}

Write-Section -Title "Result"
Write-Output "git completion readiness inventory completed"
