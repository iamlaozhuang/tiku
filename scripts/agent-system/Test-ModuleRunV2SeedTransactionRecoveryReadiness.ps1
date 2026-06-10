param(
    [Parameter(Mandatory = $true)]
    [ValidateNotNullOrEmpty()]
    [string]$SeedWorktreePath,

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$MatrixPath = "docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml"
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

function Write-RecoveryResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode,
        [Parameter(Mandatory = $false)][string]$Module = "",
        [Parameter(Mandatory = $false)][string]$EvidencePath = "",
        [Parameter(Mandatory = $false)][string]$AuditReviewPath = "",
        [Parameter(Mandatory = $false)][int]$SeedTaskCount = 0
    )

    Write-Section -Title "Result"
    Write-Output "seedRecoveryDecision: $Decision"
    if (-not [string]::IsNullOrWhiteSpace($Module)) {
        Write-Output "seedModule: $Module"
    }
    if ($SeedTaskCount -gt 0) {
        Write-Output "seedTaskCount: $SeedTaskCount"
    }
    if (-not [string]::IsNullOrWhiteSpace($EvidencePath)) {
        Write-Output "seedEvidencePath: $EvidencePath"
    }
    if (-not [string]::IsNullOrWhiteSpace($AuditReviewPath)) {
        Write-Output "seedAuditReviewPath: $AuditReviewPath"
    }
    Write-Output "seedRecoveryAction: closeout_recoverable_auto_seed_transaction"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function ConvertTo-NormalizedPath {
    param([Parameter(Mandatory = $true)][string]$Path)

    return $Path.Replace("\", "/").TrimStart(".", "/")
}

function Get-GitOutput {
    param(
        [Parameter(Mandatory = $true)][string]$WorktreePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $output = @(& git -C $WorktreePath @Arguments 2>&1)
        return [pscustomobject]@{
            Output = $output
            ExitCode = $LASTEXITCODE
        }
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
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

function Get-TaskScalarValue {
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

function Test-SeedTransactionFileSet {
    param([Parameter(Mandatory = $true)][string[]]$Files)

    if ($Files.Count -ne 3) {
        return $false
    }

    $normalizedFiles = @($Files | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $hasQueue = $normalizedFiles -contains "docs/04-agent-system/state/task-queue.yaml"
    $evidenceFiles = @($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/evidence/\d{4}-\d{2}-\d{2}-module-run-v2-auto-seed-[a-z0-9-]+\.md$" })
    $auditFiles = @($normalizedFiles | Where-Object { $_ -match "^docs/05-execution-logs/audits-reviews/\d{4}-\d{2}-\d{2}-module-run-v2-auto-seed-[a-z0-9-]+\.md$" })

    return $hasQueue -and $evidenceFiles.Count -eq 1 -and $auditFiles.Count -eq 1
}

try {
    Write-Section -Title "Module Run v2 Seed Transaction Recovery Readiness"
    Write-Output "seedRecoveryMode: hard_block"
    Write-Output "seedWorktreePath: $SeedWorktreePath"

    $findings = New-Object System.Collections.Generic.List[string]
    if (-not (Test-Path -LiteralPath $SeedWorktreePath)) {
        Add-Finding "HARD_BLOCK_SEED_WORKTREE_MISSING $SeedWorktreePath"
        Write-RecoveryResult -Decision "stop_for_hard_block" -Reason "seed worktree is missing" -ExitCode 1
    }

    $seedRootResult = Get-GitOutput -WorktreePath $SeedWorktreePath -Arguments @("rev-parse", "--show-toplevel")
    if ($seedRootResult.ExitCode -ne 0) {
        Add-Finding "HARD_BLOCK_SEED_WORKTREE_NOT_GIT"
        Write-RecoveryResult -Decision "stop_for_hard_block" -Reason "seed worktree is not a Git worktree" -ExitCode 1
    }

    $seedRoot = ($seedRootResult.Output -join "").Trim()
    Write-Output "seedWorktreeRoot: $seedRoot"

    $stagedResult = Get-GitOutput -WorktreePath $seedRoot -Arguments @("diff", "--cached", "--name-only", "--diff-filter=ACMR")
    $unstagedResult = Get-GitOutput -WorktreePath $seedRoot -Arguments @("diff", "--name-only", "--diff-filter=ACMR")
    $untrackedResult = Get-GitOutput -WorktreePath $seedRoot -Arguments @("ls-files", "--others", "--exclude-standard")
    if ($stagedResult.ExitCode -ne 0 -or $unstagedResult.ExitCode -ne 0 -or $untrackedResult.ExitCode -ne 0) {
        Add-Finding "HARD_BLOCK_SEED_RECOVERY_GIT_STATUS_UNREADABLE"
    }

    $stagedFiles = @($stagedResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $unstagedFiles = @($unstagedResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
    $untrackedFiles = @($untrackedResult.Output | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })

    Write-Output "stagedFileCount: $($stagedFiles.Count)"
    foreach ($stagedFile in $stagedFiles) {
        Write-Output "stagedFile: $(ConvertTo-NormalizedPath -Path $stagedFile)"
    }

    if ($unstagedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_SEED_RECOVERY_UNSTAGED"
    }
    if ($untrackedFiles.Count -gt 0) {
        Add-Finding "HARD_BLOCK_SEED_RECOVERY_UNTRACKED"
    }
    if (-not (Test-SeedTransactionFileSet -Files $stagedFiles)) {
        Add-Finding "HARD_BLOCK_SEED_RECOVERY_FILE_SET"
    }

    $normalizedFiles = @($stagedFiles | ForEach-Object { ConvertTo-NormalizedPath -Path $_ })
    $queueRelativePath = "docs/04-agent-system/state/task-queue.yaml"
    $evidenceRelativePath = [string]($normalizedFiles | Where-Object { $_ -like "docs/05-execution-logs/evidence/*-module-run-v2-auto-seed-*.md" } | Select-Object -First 1)
    $auditRelativePath = [string]($normalizedFiles | Where-Object { $_ -like "docs/05-execution-logs/audits-reviews/*-module-run-v2-auto-seed-*.md" } | Select-Object -First 1)
    $queuePath = Join-Path -Path $seedRoot -ChildPath ($queueRelativePath.Replace("/", "\"))
    $evidencePath = if (-not [string]::IsNullOrWhiteSpace($evidenceRelativePath)) { Join-Path -Path $seedRoot -ChildPath ($evidenceRelativePath.Replace("/", "\")) } else { "" }
    $auditReviewPath = if (-not [string]::IsNullOrWhiteSpace($auditRelativePath)) { Join-Path -Path $seedRoot -ChildPath ($auditRelativePath.Replace("/", "\")) } else { "" }

    foreach ($requiredFile in @($queuePath, $evidencePath, $auditReviewPath)) {
        if ([string]::IsNullOrWhiteSpace($requiredFile) -or -not (Test-Path -LiteralPath $requiredFile)) {
            Add-Finding "HARD_BLOCK_SEED_RECOVERY_REQUIRED_FILE_MISSING $requiredFile"
        }
    }

    $seedModule = ""
    $seedTaskCount = 0
    if (Test-Path -LiteralPath $queuePath) {
        $queueLines = @(Get-Content -LiteralPath $queuePath)
        $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
        $seededModules = New-Object System.Collections.Generic.List[string]
        foreach ($block in $taskBlocks) {
            $blockText = $block.Lines -join "`n"
            if ($blockText -match "(?m)^\s+seededImplementationTask:\s*true\s*$") {
                $seedTaskCount += 1
                $moduleId = Get-TaskScalarValue -Block $block.Lines -Key "seededExecutionModule"
                if (-not [string]::IsNullOrWhiteSpace($moduleId) -and -not $seededModules.Contains($moduleId)) {
                    $seededModules.Add($moduleId)
                }
            }
        }
        if ($seededModules.Count -eq 1) {
            $seedModule = $seededModules[0]
        } else {
            Add-Finding "HARD_BLOCK_SEED_RECOVERY_MODULE_COUNT $($seededModules.Count)"
        }
        if ($seedTaskCount -eq 0) {
            Add-Finding "HARD_BLOCK_SEED_RECOVERY_NO_SEEDED_TASKS"
        }
    }

    foreach ($anchorFile in @($evidencePath, $auditReviewPath)) {
        if (-not [string]::IsNullOrWhiteSpace($anchorFile) -and (Test-Path -LiteralPath $anchorFile)) {
            $anchorContent = Get-Content -LiteralPath $anchorFile -Raw
            if ($anchorContent -notmatch "autoDriveLocalImplementationApproval") {
                Add-Finding "HARD_BLOCK_SEED_RECOVERY_MISSING_APPROVAL_ANCHOR $anchorFile"
            }
            if ($anchorContent -notmatch "Cost Calibration Gate remains blocked") {
                Add-Finding "HARD_BLOCK_SEED_RECOVERY_MISSING_COST_GATE_ANCHOR $anchorFile"
            }
        }
    }

    $diffCheckResult = Get-GitOutput -WorktreePath $seedRoot -Arguments @("diff", "--cached", "--check")
    $diffCheckResult.Output | ForEach-Object { Write-Output $_ }
    if ($diffCheckResult.ExitCode -ne 0) {
        Add-Finding "HARD_BLOCK_SEED_RECOVERY_DIFF_CHECK"
    }

    if ($findings.Count -eq 0) {
        $selfReviewScript = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2ImplementationSeedSelfReview.ps1"
        $selfReviewOutput = @(
            & $selfReviewScript `
                -ExpectedModule $seedModule `
                -QueuePath $queuePath `
                -MatrixPath $MatrixPath 2>&1
        )
        $selfReviewOutput | ForEach-Object { Write-Output $_ }
        $selfReviewDecision = ""
        foreach ($line in $selfReviewOutput) {
            if ($line -match "^seedSelfReviewDecision:\s*(.+?)\s*$") {
                $selfReviewDecision = $Matches[1].Trim()
            }
        }
        if ($LASTEXITCODE -ne 0 -or $selfReviewDecision -ne "passed") {
            Add-Finding "HARD_BLOCK_SEED_RECOVERY_SELF_REVIEW"
        }
    }

    if ($findings.Count -gt 0) {
        Write-RecoveryResult -Decision "stop_for_hard_block" -Reason "seed recovery readiness found $($findings.Count) issue(s)" -ExitCode 1
    }

    Write-RecoveryResult `
        -Decision "recoverable_seed_transaction" `
        -Reason "dirty worktree contains only a staged auto-seed transaction" `
        -ExitCode 0 `
        -Module $seedModule `
        -EvidencePath (ConvertTo-NormalizedPath -Path $evidenceRelativePath) `
        -AuditReviewPath (ConvertTo-NormalizedPath -Path $auditRelativePath) `
        -SeedTaskCount $seedTaskCount
} catch {
    Write-Output "HARD_BLOCK_SEED_RECOVERY_EXCEPTION $($_.Exception.Message)"
    Write-RecoveryResult -Decision "stop_for_hard_block" -Reason "seed recovery readiness script exception" -ExitCode 1
}
