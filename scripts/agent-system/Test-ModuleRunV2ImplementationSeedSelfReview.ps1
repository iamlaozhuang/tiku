param(
    [Parameter(Mandatory = $false)]
    [string[]]$SeedTaskIds = @(),

    [Parameter(Mandatory = $false)]
    [string]$ExpectedModule = "",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

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

function Write-SeedSelfReviewResult {
    param(
        [Parameter(Mandatory = $true)][string]$Decision,
        [Parameter(Mandatory = $true)][string]$Reason,
        [Parameter(Mandatory = $true)][int]$ExitCode
    )

    Write-Section -Title "Result"
    Write-Output "seedSelfReviewDecision: $Decision"
    Write-Output "reason: $Reason"
    Write-Output "Cost Calibration Gate remains blocked"
    exit $ExitCode
}

function Remove-ValueQuotes {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)

    $trimmedValue = $Value.Trim()
    if ($trimmedValue.Length -ge 2) {
        $firstChar = $trimmedValue.Substring(0, 1)
        $lastChar = $trimmedValue.Substring($trimmedValue.Length - 1, 1)
        if (($firstChar -eq '"' -and $lastChar -eq '"') -or ($firstChar -eq "'" -and $lastChar -eq "'")) {
            return $trimmedValue.Substring(1, $trimmedValue.Length - 2)
        }
    }

    return $trimmedValue
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
            $currentId = Remove-ValueQuotes -Value $Matches[1]
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

function Get-TaskScalarValue {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return Remove-ValueQuotes -Value $Matches[1]
        }
    }

    return ""
}

function Get-TaskListValues {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $values = New-Object System.Collections.Generic.List[string]
    $insideList = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*$") {
            $insideList = $true
            continue
        }

        if ($insideList -and $line -match "^\s+-\s+(.+?)\s*$") {
            $values.Add((Remove-ValueQuotes -Value $Matches[1]))
            continue
        }

        if ($insideList -and $line -match "^\s+\S[^:]*:\s*") {
            break
        }
    }

    return $values.ToArray()
}

function Get-TargetClosureItems {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines,
        [Parameter(Mandatory = $true)][string]$ModuleId
    )

    $items = New-Object System.Collections.Generic.List[string]
    $insideExecutionModules = $false
    $insideSelectedModule = $false
    $insideTargetClosure = $false

    foreach ($line in $Lines) {
        if ($line -match "^executionModules:\s*$") {
            $insideExecutionModules = $true
            continue
        }

        if (-not $insideExecutionModules) {
            continue
        }

        if ($line -match "^\S" -and $line -notmatch "^executionModules:\s*$") {
            break
        }

        if ($line -match "^\s{2}- module:\s*(.+?)\s*$") {
            $insideSelectedModule = (Remove-ValueQuotes -Value $Matches[1]) -eq $ModuleId
            $insideTargetClosure = $false
            continue
        }

        if (-not $insideSelectedModule) {
            continue
        }

        if ($line -match "^\s{4}targetLocalClosure:\s*$") {
            $insideTargetClosure = $true
            continue
        }

        if ($insideTargetClosure -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if ($insideTargetClosure -and $line -match "^\s{6}-\s+(.+?)\s*$") {
            $items.Add((Remove-ValueQuotes -Value $Matches[1]))
        }
    }

    return $items.ToArray()
}

function Test-PathPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $normalizedPath = $Path.Replace("\", "/").TrimStart(".", "/")
    $normalizedPattern = $Pattern.Replace("\", "/").TrimStart(".", "/")

    if ($normalizedPattern.EndsWith("/**")) {
        $prefix = $normalizedPattern.Substring(0, $normalizedPattern.Length - 3)
        return $normalizedPath -eq $prefix -or $normalizedPath.StartsWith("$prefix/")
    }

    return $normalizedPath -like $normalizedPattern
}

$findings = New-Object System.Collections.Generic.List[string]

try {
    Write-Section -Title "Module Run v2 Implementation Seed Self Review"
    Write-Output "seedSelfReviewMode: hard_block"

    foreach ($requiredPath in @($QueuePath, $MatrixPath)) {
        if (-not (Test-Path -LiteralPath $requiredPath)) {
            Add-Finding "HARD_BLOCK_MISSING_FILE $requiredPath"
        }
    }
    if ($findings.Count -gt 0) {
        Write-SeedSelfReviewResult -Decision "stop_for_hard_block" -Reason "required files are missing" -ExitCode 1
    }

    $queueLines = @(Get-Content -LiteralPath $QueuePath)
    $matrixLines = @(Get-Content -LiteralPath $MatrixPath)
    $matrixContent = $matrixLines -join "`n"
    if ($matrixContent -notmatch "implementationAutoSeedGate\s*:" -or $matrixContent -notmatch "Cost Calibration Gate remains blocked") {
        Add-Finding "HARD_BLOCK_MATRIX_AUTO_SEED_ANCHOR_MISSING"
    }

    $taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
    if ($SeedTaskIds.Count -eq 0) {
        foreach ($block in $taskBlocks) {
            $blockText = $block.Lines -join "`n"
            if ($blockText -match "(?m)^\s+seededImplementationTask:\s*true\s*$") {
                $SeedTaskIds += $block.Id
            }
        }
    }

    Write-Output "seedTaskCount: $($SeedTaskIds.Count)"
    if ($SeedTaskIds.Count -eq 0) {
        Add-Finding "HARD_BLOCK_NO_SEEDED_TASKS"
    }

    $moduleTargets = @{}
    $highRiskAllowedPatterns = @(
        ".env.local",
        ".env.example",
        "package.json",
        "pnpm-lock.yaml",
        "package-lock.yaml",
        "package-lock.json",
        "src/db/schema/**",
        "drizzle/**"
    )
    $requiredBlockedFiles = $highRiskAllowedPatterns
    $blockedRiskPattern = "(?i)provider|env|secret|deploy|payment|external|schema|migration|dependency|package|lockfile|cost_calibration"

    foreach ($seedTaskId in $SeedTaskIds) {
        $taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $seedTaskId)
        if ($taskBlock.Count -eq 0) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_NOT_FOUND $seedTaskId"
            continue
        }

        $blockText = $taskBlock -join "`n"
        $status = Get-TaskScalarValue -Block $taskBlock -Key "status"
        $taskKind = Get-TaskScalarValue -Block $taskBlock -Key "taskKind"
        $moduleId = Get-TaskScalarValue -Block $taskBlock -Key "seededExecutionModule"
        $targetClosure = Get-TaskScalarValue -Block $taskBlock -Key "targetClosureItem"
        $evidencePath = Get-TaskScalarValue -Block $taskBlock -Key "evidencePath"
        $auditReviewPath = Get-TaskScalarValue -Block $taskBlock -Key "auditReviewPath"
        $allowedFiles = @(Get-TaskListValues -Block $taskBlock -Key "allowedFiles")
        $blockedFiles = @(Get-TaskListValues -Block $taskBlock -Key "blockedFiles")
        $riskTypes = @(Get-TaskListValues -Block $taskBlock -Key "riskTypes")
        $validationCommands = @(Get-TaskListValues -Block $taskBlock -Key "validationCommands")

        Write-Section -Title "Seed Task $seedTaskId"
        Write-Output "status: $status"
        Write-Output "taskKind: $taskKind"
        Write-Output "seededExecutionModule: $moduleId"
        Write-Output "targetClosureItem: $targetClosure"

        if ($status -notin @("pending", "in_progress")) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_NOT_EXECUTABLE $seedTaskId status=$status"
        }
        if ($taskKind -ne "implementation") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_KIND $seedTaskId kind=$taskKind"
        }
        if ([string]::IsNullOrWhiteSpace($moduleId)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_MODULE $seedTaskId"
        }
        if (-not [string]::IsNullOrWhiteSpace($ExpectedModule) -and $moduleId -ne $ExpectedModule) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_WRONG_MODULE $seedTaskId expected=$ExpectedModule actual=$moduleId"
        }
        if ([string]::IsNullOrWhiteSpace($targetClosure)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_TARGET_CLOSURE $seedTaskId"
        }
        if ([string]::IsNullOrWhiteSpace($evidencePath)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_EVIDENCE $seedTaskId"
        } elseif (-not (Test-Path -LiteralPath $evidencePath)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_EVIDENCE_TEMPLATE $seedTaskId $evidencePath"
        } else {
            $seedEvidenceContent = Get-Content -LiteralPath $evidencePath -Raw
            foreach ($requiredAnchor in @("RED:", "GREEN:", "Commit:", "localFullLoopGate", "threadRolloverGate", "nextModuleRunCandidate", "Cost Calibration Gate remains blocked")) {
                if ($seedEvidenceContent -notmatch [regex]::Escape($requiredAnchor)) {
                    Add-Finding "HARD_BLOCK_SEEDED_TASK_EVIDENCE_TEMPLATE_MISSING_ANCHOR $seedTaskId $requiredAnchor"
                }
            }
        }
        if ([string]::IsNullOrWhiteSpace($auditReviewPath)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_AUDIT $seedTaskId"
        } elseif (-not (Test-Path -LiteralPath $auditReviewPath)) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_AUDIT_TEMPLATE $seedTaskId $auditReviewPath"
        } else {
            $seedAuditContent = Get-Content -LiteralPath $auditReviewPath -Raw
            if ($seedAuditContent -notmatch "Cost Calibration Gate remains blocked") {
                Add-Finding "HARD_BLOCK_SEEDED_TASK_AUDIT_TEMPLATE_MISSING_COST_GATE $seedTaskId"
            }
        }
        if ($blockText -notmatch "autoDriveLocalImplementationApproval") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_AUTODRIVE_APPROVAL $seedTaskId"
        }
        $hasStandingCloseoutApproval = $blockText -match "standingUnattendedLocalCloseoutApproval" `
            -and $blockText -match "low-risk local implementation tasks only" `
            -and $blockText -match "High-risk capability gates remain blocked"
        $hasApprovedCloseoutPolicy = $blockText -match "(?im)^\s+localCommit:\s*approved\s*$" `
            -and $blockText -match "(?im)^\s+fastForwardMerge:\s*$" `
            -and $blockText -match "(?im)^\s+approved:\s*true\s*$" `
            -and $blockText -match "(?im)^\s+targetBranch:\s*master\s*$" `
            -and $blockText -match "(?im)^\s+push:\s*$" `
            -and $blockText -match "(?im)^\s+target:\s*origin/master\s*$" `
            -and $blockText -match "(?im)^\s+deleteShortBranch:\s*true\s*$" `
            -and $blockText -match "(?im)^\s+parkWorktree:\s*true\s*$"
        if ($hasApprovedCloseoutPolicy -and -not $hasStandingCloseoutApproval) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_CLOSEOUT_WITHOUT_STANDING_APPROVAL $seedTaskId"
        }
        if ($hasStandingCloseoutApproval -and -not $hasApprovedCloseoutPolicy) {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_STANDING_CLOSEOUT_POLICY $seedTaskId"
        }
        if ($blockText -notmatch "localExperienceClosureGate") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_LOCAL_EXPERIENCE_GATE $seedTaskId"
        }
        if ($blockText -notmatch "localFullLoopGate") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_LOCAL_FULL_LOOP_GATE $seedTaskId"
        }
        if ($blockText -notmatch "blockedRemainder") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_BLOCKED_REMAINDER $seedTaskId"
        }
        if ($blockText -notmatch "redactionRequired:\s*true") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_REDACTION $seedTaskId"
        }

        foreach ($allowedFile in $allowedFiles) {
            foreach ($blockedPattern in $highRiskAllowedPatterns) {
                if (Test-PathPattern -Path $allowedFile -Pattern $blockedPattern) {
                    Add-Finding "HARD_BLOCK_SEEDED_TASK_ALLOWED_HIGH_RISK_FILE $seedTaskId $allowedFile"
                }
            }
        }

        foreach ($requiredBlockedFile in $requiredBlockedFiles) {
            if ($blockedFiles -notcontains $requiredBlockedFile) {
                Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_BLOCKED_FILE $seedTaskId $requiredBlockedFile"
            }
        }

        foreach ($riskType in $riskTypes) {
            if ($riskType -match $blockedRiskPattern) {
                Add-Finding "HARD_BLOCK_SEEDED_TASK_BLOCKED_RISK $seedTaskId $riskType"
            }
        }

        $validationText = if ($blockText -match "validationCommandLifecycle") { $blockText } else { $validationCommands -join "`n" }
        if ($blockText -notmatch "validationCommandLifecycle") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_VALIDATION_LIFECYCLE $seedTaskId"
        }
        if ($blockText -notmatch "phase:\s*advisory_baseline") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_ADVISORY_BASELINE $seedTaskId"
        }
        if ($blockText -match "phase:\s*post_edit\s+command:\s*npm\.cmd run test -- --run focused") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_BROAD_BASELINE_AS_POST_EDIT $seedTaskId"
        }
        if ($validationText -notmatch "npm\.cmd run lint") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_LINT $seedTaskId"
        }
        if ($validationText -notmatch "npm\.cmd run typecheck") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_TYPECHECK $seedTaskId"
        }
        if ($validationText -notmatch "git diff --check") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_DIFF_CHECK $seedTaskId"
        }
        if ($validationText -notmatch "focused|vitest|\.test\.ts") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_FOCUSED_TEST $seedTaskId"
        }
        if ($validationText -notmatch "Test-ModuleRunV2ModuleCloseoutReadiness") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_CLOSEOUT_GATE $seedTaskId"
        }
        if ($validationText -notmatch "Test-ModuleRunV2ImplementationAutoSeedReadiness") {
            Add-Finding "HARD_BLOCK_SEEDED_TASK_MISSING_AUTO_SEED_GATE $seedTaskId"
        }

        if (-not [string]::IsNullOrWhiteSpace($moduleId) -and -not [string]::IsNullOrWhiteSpace($targetClosure)) {
            if (-not $moduleTargets.ContainsKey($moduleId)) {
                $moduleTargets[$moduleId] = New-Object System.Collections.Generic.List[string]
            }
            $moduleTargets[$moduleId].Add($targetClosure)
        }
    }

    foreach ($moduleId in $moduleTargets.Keys) {
        $expectedTargets = @(Get-TargetClosureItems -Lines $matrixLines -ModuleId $moduleId)
        $actualTargets = @($moduleTargets[$moduleId].ToArray())
        Write-Section -Title "Coverage $moduleId"
        Write-Output "expectedTargetCount: $($expectedTargets.Count)"
        Write-Output "actualTargetCount: $($actualTargets.Count)"

        foreach ($expectedTarget in $expectedTargets) {
            if ($actualTargets -notcontains $expectedTarget) {
                Add-Finding "HARD_BLOCK_SEED_COVERAGE_MISSING_TARGET $moduleId $expectedTarget"
            }
        }
    }

    if ($findings.Count -gt 0) {
        Write-SeedSelfReviewResult -Decision "stop_for_hard_block" -Reason "seed self-review found $($findings.Count) issue(s)" -ExitCode 1
    }

    Write-SeedSelfReviewResult -Decision "passed" -Reason "seeded implementation tasks passed coverage and safety review" -ExitCode 0
} catch {
    Write-Output "HARD_BLOCK_ERROR $($_.Exception.Message)"
    Write-SeedSelfReviewResult -Decision "stop_for_hard_block" -Reason "seed self-review script encountered an error" -ExitCode 1
}
