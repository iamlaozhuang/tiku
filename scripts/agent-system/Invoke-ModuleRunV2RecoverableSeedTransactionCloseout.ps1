param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SeedWorktreePath,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$BaseBranch = "master",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$Remote = "origin",

    [Parameter(Mandatory = $false)]
    [string]$CloseoutAuthorizationStatement = "",

    [Parameter(Mandatory = $false)]
    [switch]$Execute,

    [Parameter(Mandatory = $false)]
    [switch]$CleanupSeedWorktree
)

$ErrorActionPreference = "Stop"

function Write-Section {
    param([Parameter(Mandatory = $true)][string]$Title)

    Write-Output ""
    Write-Output "== $Title =="
}

function Write-CloseoutResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$Module = "",
        [Parameter(Mandatory = $false)][string]$CommitSha = ""
    )

    Write-Section -Title "Result"
    Write-Output "recoverableSeedCloseoutDecision: $Decision"
    if (-not [string]::IsNullOrWhiteSpace($Module)) {
        Write-Output "seedModule: $Module"
    }
    if (-not [string]::IsNullOrWhiteSpace($CommitSha)) {
        Write-Output "commitSha: $CommitSha"
    }
    Write-Output "executeRequested: $($Execute.ToString().ToLowerInvariant())"
    Write-Output "cleanupSeedWorktree: $($CleanupSeedWorktree.ToString().ToLowerInvariant())"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
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

function Get-OutputValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    foreach ($line in $Output) {
        if ($line -match "^$([regex]::Escape($Key)):\s*(.+?)\s*$") {
            $values.Add($Matches[1].Trim())
        }
    }

    return $values.ToArray()
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

function Invoke-CloseoutLocalToolingReadiness {
    param(
        [Parameter(Mandatory = $true)][string]$ScriptRoot,
        [Parameter(Mandatory = $true)][string]$RepositoryPath
    )

    $toolingScriptPath = Join-Path -Path $ScriptRoot -ChildPath "Test-ModuleRunV2CloseoutLocalToolingReadiness.ps1"
    if (-not (Test-Path -LiteralPath $toolingScriptPath)) {
        throw "Missing closeout local tooling readiness script: $toolingScriptPath"
    }

    $toolingOutput = @(
        powershell.exe `
            -NoProfile `
            -ExecutionPolicy Bypass `
            -File $toolingScriptPath `
            -RepositoryPath $RepositoryPath 2>&1
    )
    $toolingExitCode = $LASTEXITCODE
    $toolingOutput | ForEach-Object { Write-Output $_ }
    if ($toolingExitCode -ne 0) {
        throw "Closeout local tooling readiness failed."
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
        throw "Unable to inspect worktree: $Path"
    }
    if ($statusOutput.Count -gt 0) {
        throw "Worktree is dirty and cannot be used for seed closeout: $Path"
    }
}

function Test-CloseoutAuthorization {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)

    if ([string]::IsNullOrWhiteSpace($Text)) {
        return $false
    }

    return $Text -match "autoDriveLocalImplementationApproval" `
        -and $Text -match "(?i)\bcommit\b" `
        -and $Text -match "(?i)fast-forward|ff-only|merge" `
        -and $Text -match "(?i)\bpush\b" `
        -and $Text -match "(?i)\bcleanup\b|worktree"
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

function Get-SeedTaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $seedBlocks = New-Object System.Collections.Generic.List[object]
    foreach ($block in @(Get-TaskBlocks -Lines $Lines)) {
        $blockText = $block.Lines -join "`n"
        if ($blockText -match "(?m)^\s+seededImplementationTask:\s*true\s*$") {
            $seedBlocks.Add($block)
        }
    }

    return $seedBlocks.ToArray()
}

function Test-QueueContainsTask {
    param(
        [Parameter(Mandatory = $true)][string]$QueueContent,
        [Parameter(Mandatory = $true)][string]$TaskId
    )

    return $QueueContent -match "(?m)^\s+- id:\s+$([regex]::Escape($TaskId))\s*$"
}

function Append-SeedTaskBlocks {
    param(
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][object[]]$SeedBlocks
    )

    $queueContent = Get-Content -LiteralPath $QueuePath -Raw
    $blocksToAppend = New-Object System.Collections.Generic.List[string]
    foreach ($seedBlock in $SeedBlocks) {
        if (-not (Test-QueueContainsTask -QueueContent $queueContent -TaskId $seedBlock.Id)) {
            $blocksToAppend.Add(($seedBlock.Lines -join "`n"))
        }
    }

    if ($blocksToAppend.Count -eq 0) {
        return 0
    }

    $appendText = "`n" + (($blocksToAppend.ToArray()) -join "`n")
    Add-Content -LiteralPath $QueuePath -Value $appendText -Encoding UTF8
    return $blocksToAppend.Count
}

function Copy-SeedLogFile {
    param(
        [Parameter(Mandatory = $true)][string]$SeedRoot,
        [Parameter(Mandatory = $true)][string]$CurrentRoot,
        [Parameter(Mandatory = $true)][string]$RelativePath
    )

    $sourcePath = Join-Path -Path $SeedRoot -ChildPath ($RelativePath.Replace("/", "\"))
    $targetPath = Join-Path -Path $CurrentRoot -ChildPath ($RelativePath.Replace("/", "\"))
    $targetDirectory = Split-Path -Path $targetPath -Parent
    if (-not (Test-Path -LiteralPath $targetDirectory)) {
        New-Item -ItemType Directory -Path $targetDirectory -Force | Out-Null
    }
    Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
}

function Copy-SeedTransactionFiles {
    param(
        [Parameter(Mandatory = $true)][string]$SeedRoot,
        [Parameter(Mandatory = $true)][string]$CurrentRoot,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$RelativePaths
    )

    $copiedFiles = New-Object System.Collections.Generic.List[string]
    foreach ($relativePath in @($RelativePaths)) {
        $normalizedPath = $relativePath.Replace("\", "/").TrimStart(".", "/")
        if ([string]::IsNullOrWhiteSpace($normalizedPath) -or $normalizedPath -eq "docs/04-agent-system/state/task-queue.yaml") {
            continue
        }

        Copy-SeedLogFile -SeedRoot $SeedRoot -CurrentRoot $CurrentRoot -RelativePath $normalizedPath
        $copiedFiles.Add($normalizedPath)
    }

    return $copiedFiles.ToArray()
}

function Assert-CleanupPathAllowed {
    param([Parameter(Mandatory = $true)][string]$Path)

    $resolvedPath = (Resolve-Path -LiteralPath $Path).Path
    $allowedRoot = Join-Path -Path $env:USERPROFILE -ChildPath ".codex\worktrees"
    if (-not (Test-Path -LiteralPath $allowedRoot)) {
        throw "Automation worktree root is missing; refusing cleanup: $allowedRoot"
    }
    $resolvedAllowedRoot = (Resolve-Path -LiteralPath $allowedRoot).Path
    if (-not $resolvedAllowedRoot.EndsWith([System.IO.Path]::DirectorySeparatorChar)) {
        $resolvedAllowedRoot = $resolvedAllowedRoot + [System.IO.Path]::DirectorySeparatorChar
    }
    if (-not $resolvedPath.StartsWith($resolvedAllowedRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "Seed worktree cleanup path is outside the Codex automation worktree root: $resolvedPath"
    }
}

try {
    Write-Section -Title "Module Run v2 Recoverable Seed Transaction Closeout"
    Write-Output "seedWorktreePath: $SeedWorktreePath"

    $currentRoot = ((& git rev-parse --show-toplevel) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($currentRoot)) {
        throw "Recoverable seed closeout must run inside a Git worktree."
    }

    $seedRoot = ((& git -C $SeedWorktreePath rev-parse --show-toplevel) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($seedRoot)) {
        throw "Seed worktree is not readable as a Git worktree."
    }

    $recoveryScript = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2SeedTransactionRecoveryReadiness.ps1"
    $currentMatrixPath = Join-Path -Path $currentRoot -ChildPath "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
    $recoveryOutput = @(
        & $recoveryScript `
            -SeedWorktreePath $seedRoot `
            -MatrixPath $currentMatrixPath 2>&1
    )
    $recoveryOutput | ForEach-Object { Write-Output $_ }
    $recoveryDecision = Get-OutputValue -Output $recoveryOutput -Key "seedRecoveryDecision"
    if ($LASTEXITCODE -ne 0 -or $recoveryDecision -ne "recoverable_seed_transaction") {
        Write-CloseoutResult -Decision "stop_for_hard_block" -Reason "seed transaction recovery readiness did not pass" -ExitCode 1
    }

    $seedModule = Get-OutputValue -Output $recoveryOutput -Key "seedModule"
    $seedEvidencePath = Get-OutputValue -Output $recoveryOutput -Key "seedEvidencePath"
    $seedAuditReviewPath = Get-OutputValue -Output $recoveryOutput -Key "seedAuditReviewPath"
    $seedTaskIds = @(Get-OutputValues -Output $recoveryOutput -Key "seedTaskId")
    $seedTransactionFiles = @(Get-OutputValues -Output $recoveryOutput -Key "seedTransactionFile")
    if ($seedTransactionFiles.Count -eq 0) {
        $seedTransactionFiles = @(
            "docs/04-agent-system/state/task-queue.yaml",
            $seedEvidencePath,
            $seedAuditReviewPath
        )
    }
    $seedQueuePath = Join-Path -Path $seedRoot -ChildPath "docs\04-agent-system\state\task-queue.yaml"
    $currentQueuePath = Join-Path -Path $currentRoot -ChildPath "docs\04-agent-system\state\task-queue.yaml"
    $seedBlocks = @(Get-SeedTaskBlocks -Lines @(Get-Content -LiteralPath $seedQueuePath))
    if ($seedTaskIds.Count -gt 0) {
        $seedBlocks = @($seedBlocks | Where-Object { $seedTaskIds -contains $_.Id })
    }
    if ($seedBlocks.Count -eq 0) {
        Write-CloseoutResult -Decision "stop_for_hard_block" -Reason "recoverable seed transaction has no seed task blocks" -ExitCode 1 -Module $seedModule
    }

    Write-Output "seedTaskBlockCount: $($seedBlocks.Count)"
    foreach ($seedBlock in $seedBlocks) {
        Write-Output "seedTask: $($seedBlock.Id)"
    }

    if (-not $Execute) {
        Write-CloseoutResult -Decision "ready_to_execute" -Reason "seed transaction can be replayed into the current queue and closed out" -ExitCode 0 -Module $seedModule
    }

    if (-not (Test-CloseoutAuthorization -Text $CloseoutAuthorizationStatement)) {
        Write-CloseoutResult -Decision "manual_required" -Reason "closeout authorization must name autoDriveLocalImplementationApproval, commit, fast-forward merge, push, and cleanup" -ExitCode 1 -Module $seedModule
    }

    Assert-CleanWorktree -Path $currentRoot
    $currentBranch = ((& git branch --show-current) -join "").Trim()
    if ($currentBranch -in @("master", "main")) {
        throw "Recoverable seed closeout requires a non-protected current worktree."
    }
    if ([string]::IsNullOrWhiteSpace($currentBranch)) {
        $timestamp = Get-Date -Format "yyyyMMddHHmmss"
        $currentBranch = "codex/recoverable-auto-seed-$seedModule-$timestamp"
        Invoke-GitCommand -Arguments @("switch", "-c", $currentBranch)
    }

    Invoke-CloseoutLocalToolingReadiness -ScriptRoot $PSScriptRoot -RepositoryPath $currentRoot

    $appendedCount = Append-SeedTaskBlocks -QueuePath $currentQueuePath -SeedBlocks $seedBlocks
    Write-Output "seedTaskBlocksAppended: $appendedCount"
    if ($appendedCount -eq 0) {
        Write-CloseoutResult -Decision "already_replayed" -Reason "current queue already contains the recoverable seed task blocks" -ExitCode 0 -Module $seedModule
    }

    $copiedSeedTransactionFiles = @(Copy-SeedTransactionFiles -SeedRoot $seedRoot -CurrentRoot $currentRoot -RelativePaths $seedTransactionFiles)
    foreach ($copiedSeedTransactionFile in $copiedSeedTransactionFiles) {
        Write-Output "seedTransactionFileCopied: $copiedSeedTransactionFile"
    }

    $selfReviewScript = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"
    & $selfReviewScript -ExpectedModule $seedModule -SeedTaskIds $seedTaskIds -QueuePath $currentQueuePath -MatrixPath $currentMatrixPath
    if ($LASTEXITCODE -ne 0) {
        throw "Seed self-review failed after replay."
    }

    $stagedSeedFiles = @("docs/04-agent-system/state/task-queue.yaml") + $copiedSeedTransactionFiles
    Invoke-GitCommand -Arguments (@("add", "--") + $stagedSeedFiles)
    Invoke-GitCommand -Arguments @("diff", "--cached", "--check")

    $baseBranchWorktreePath = Get-BranchWorktreePath -Branch $BaseBranch
    if ([string]::IsNullOrWhiteSpace($baseBranchWorktreePath)) {
        throw "Base branch worktree not found for $BaseBranch."
    }
    Assert-CleanWorktree -Path $baseBranchWorktreePath

    $baseNodeBin = Join-Path -Path $baseBranchWorktreePath -ChildPath "node_modules\.bin"
    if (Test-Path -LiteralPath $baseNodeBin) {
        $env:PATH = "$baseNodeBin;$env:PATH"
        Write-Output "validationToolingPath: $baseNodeBin"
    }

    $commitMessage = "chore(agent-system): auto-seed module run v2 implementation tasks"
    Invoke-GitCommand -Arguments @("commit", "-m", $commitMessage)
    $commitSha = ((& git rev-parse HEAD) -join "").Trim()

    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "merge", "--ff-only", $currentBranch)
    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "push", $Remote, $BaseBranch)
    Invoke-GitCommand -Arguments @("-C", $baseBranchWorktreePath, "fetch", $Remote)
    Invoke-GitCommand -Arguments @("fetch", $Remote)
    Invoke-GitCommand -Arguments @("switch", "--detach", "$Remote/$BaseBranch")
    Invoke-GitCommand -Arguments @("branch", "-D", $currentBranch)
    Write-Output "recoverableSeedBranchCleanup: deleted $currentBranch"
    Write-Output "recoverableSeedWorktreeParking: detached $Remote/$BaseBranch"

    if ($CleanupSeedWorktree) {
        Assert-CleanupPathAllowed -Path $seedRoot
        Invoke-GitCommand -Arguments @("worktree", "remove", "--force", $seedRoot)
        Write-Output "seedWorktreeCleanup: removed $seedRoot"
    }

    Write-CloseoutResult -Decision "closeout_executed" -Reason "recoverable seed transaction was replayed, committed, merged, and pushed" -ExitCode 0 -Module $seedModule -CommitSha $commitSha
} catch {
    Write-Output "HARD_BLOCK_RECOVERABLE_SEED_CLOSEOUT_EXCEPTION $($_.Exception.Message)"
    Write-CloseoutResult -Decision "stop_for_hard_block" -Reason "recoverable seed closeout script exception" -ExitCode 1
}
