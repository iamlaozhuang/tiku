param(
    [Parameter(Mandatory = $false)]
    [string]$BatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$Mode = "hard_block",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$ProjectStatePath = "docs\04-agent-system\state\project-state.yaml",

    [Parameter(Mandatory = $false)]
    [ValidateNotNullOrEmpty()]
    [string]$QueuePath = "docs\04-agent-system\state\task-queue.yaml",

    [Parameter(Mandatory = $false)]
    [string[]]$ChangedFiles = @()
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

function Add-Finding {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Message
    )

    $script:findings.Add($Message)
    Write-Output $Message
}

function ConvertTo-NormalizedPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    $candidatePath = $Path.Replace("\", "/")
    return $candidatePath.TrimStart(".", "/")
}

function Test-PathPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
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
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if ([string]::IsNullOrWhiteSpace($pattern)) {
            continue
        }

        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $pattern
        }
    }

    return ""
}

function Expand-FileInputs {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Files
    )

    $expandedFiles = New-Object System.Collections.Generic.List[string]
    foreach ($fileInput in $Files) {
        foreach ($filePart in ($fileInput -split ",")) {
            $trimmedFile = $filePart.Trim()
            if (-not [string]::IsNullOrWhiteSpace($trimmedFile)) {
                $expandedFiles.Add((ConvertTo-NormalizedPath -Path $trimmedFile))
            }
        }
    }

    return $expandedFiles.ToArray()
}

function Get-ChangedFiles {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$ExplicitFiles
    )

    $expandedExplicitFiles = @(Expand-FileInputs -Files $ExplicitFiles)
    if ($expandedExplicitFiles.Count -gt 0) {
        return @($expandedExplicitFiles | Sort-Object -Unique)
    }

    $files = New-Object System.Collections.Generic.List[string]
    $commands = @(
        { & git diff --cached --name-only --diff-filter=ACMR 2>$null },
        { & git diff --name-only --diff-filter=ACMR 2>$null },
        { & git ls-files --others --exclude-standard 2>$null },
        { & git diff --name-only origin/master...HEAD --diff-filter=ACMR 2>$null }
    )

    foreach ($command in $commands) {
        $commandOutput = @(& $command)
        if ($LASTEXITCODE -ne 0) {
            continue
        }

        foreach ($file in $commandOutput) {
            if (-not [string]::IsNullOrWhiteSpace($file)) {
                $files.Add((ConvertTo-NormalizedPath -Path $file))
            }
        }
    }

    return @($files.ToArray() | Sort-Object -Unique)
}

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

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

function Get-TaskBlocks {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Lines
    )

    $blocks = New-Object System.Collections.Generic.List[object]
    $startIndex = -1
    $currentId = ""

    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+(.+?)\s*$") {
            if ($startIndex -ge 0) {
                $blocks.Add([pscustomobject]@{
                    Id = $currentId
                    Lines = @($Lines[$startIndex..($lineIndex - 1)])
                })
            }

            $startIndex = $lineIndex
            $currentId = $Matches[1].Trim()
        }
    }

    if ($startIndex -ge 0) {
        $blocks.Add([pscustomobject]@{
            Id = $currentId
            Lines = @($Lines[$startIndex..($Lines.Count - 1)])
        })
    }

    return $blocks.ToArray()
}

function Get-TaskBlockById {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$TaskBlocks,

        [Parameter(Mandatory = $true)]
        [string]$Id
    )

    foreach ($taskBlock in $TaskBlocks) {
        if ($taskBlock.Id -eq $Id) {
            return $taskBlock
        }
    }

    return $null
}

function Get-ScalarValue {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Block) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.*)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Get-ListValues {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string]$Key
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

function Resolve-RepositoryPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot,

        [Parameter(Mandatory = $true)]
        [string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return Join-Path -Path $RepositoryRoot -ChildPath $Path
}

function Test-RequiredPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$MissingCode,

        [Parameter(Mandatory = $true)]
        [string]$OkCode,

        [Parameter(Mandatory = $true)]
        [string]$RepositoryRoot
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        $script:findings.Add("$MissingCode $TaskId missing_path_value") | Out-Null
        return $false
    }

    $resolvedPath = Resolve-RepositoryPath -RepositoryRoot $RepositoryRoot -Path $Path
    if (-not (Test-Path -LiteralPath $resolvedPath)) {
        $script:findings.Add("$MissingCode $TaskId $Path") | Out-Null
        return $false
    }

    return $true
}

function Test-ContentPattern {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,

        [Parameter(Mandatory = $true)]
        [string]$Pattern,

        [Parameter(Mandatory = $true)]
        [string]$MissingCode,

        [Parameter(Mandatory = $true)]
        [string]$OkCode
    )

    if ($Content -match $Pattern) {
        Write-Output $OkCode
    } else {
        Add-Finding $MissingCode
    }
}

function Get-ContentScalar {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    $match = [regex]::Match($Content, "(?mi)^\s*(?:-\s*)?$([regex]::Escape($Key))\s*:\s*`?([^`\r\n]+)`?\s*$")
    if (-not $match.Success) {
        return ""
    }

    return $match.Groups[1].Value.Trim().Trim(".").Trim()
}

function Test-TaskExists {
    param(
        [Parameter(Mandatory = $true)]
        [object[]]$TaskBlocks,

        [Parameter(Mandatory = $true)]
        [string]$TaskId
    )

    return $null -ne (Get-TaskBlockById -TaskBlocks $TaskBlocks -Id $TaskId)
}

function Test-EvidenceAnchors {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    Test-ContentPattern -Content $Content -Pattern "(?mi)^\s*(?:-\s*)?result\s*:\s*(?!pending\b).+" -MissingCode "HARD_BLOCK_EVIDENCE_NOT_PASS $TaskId" -OkCode "OK_EVIDENCE_RESULT $TaskId"
    Test-ContentPattern -Content $Content -Pattern "(?mi)\bBatch range\b|^#{2,4}\s*Batch\s+\d+|\bBatch\s+\d+\s*:" -MissingCode "HARD_BLOCK_MISSING_BATCH_EVIDENCE $TaskId" -OkCode "OK_BATCH_EVIDENCE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "(?mi)\bRED\b\s*:" -MissingCode "HARD_BLOCK_MISSING_RED_EVIDENCE $TaskId" -OkCode "OK_RED_EVIDENCE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "(?mi)\bGREEN\b\s*:" -MissingCode "HARD_BLOCK_MISSING_GREEN_EVIDENCE $TaskId" -OkCode "OK_GREEN_EVIDENCE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern '(?mi)\bCommit:\s*`?[0-9a-f]{7,40}`?' -MissingCode "HARD_BLOCK_MISSING_BATCH_COMMIT_EVIDENCE $TaskId" -OkCode "OK_BATCH_COMMIT_EVIDENCE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "localFullLoopGate" -MissingCode "HARD_BLOCK_MISSING_LOCAL_FULL_LOOP_GATE $TaskId" -OkCode "OK_LOCAL_FULL_LOOP_GATE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "threadRolloverGate" -MissingCode "HARD_BLOCK_MISSING_THREAD_ROLLOVER_GATE $TaskId" -OkCode "OK_THREAD_ROLLOVER_GATE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "automationHandoffPolicy" -MissingCode "HARD_BLOCK_MISSING_AUTOMATION_HANDOFF_POLICY $TaskId" -OkCode "OK_AUTOMATION_HANDOFF_POLICY_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "nextModuleRunCandidate" -MissingCode "HARD_BLOCK_MISSING_NEXT_MODULE_RUN_CANDIDATE $TaskId" -OkCode "OK_NEXT_MODULE_RUN_CANDIDATE_RECORDED $TaskId"
    Test-ContentPattern -Content $Content -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_MISSING_COST_GATE_STATEMENT $TaskId" -OkCode "OK_COST_GATE_RECORDED $TaskId"
}

function Test-NeedsRecheckPolicy {
    param(
        [Parameter(Mandatory = $true)]
        [string]$TaskId,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$EvidenceContent,

        [Parameter(Mandatory = $true)]
        [AllowEmptyString()]
        [string]$AuditContent,

        [Parameter(Mandatory = $true)]
        [object[]]$TaskBlocks
    )

    $combinedContent = "$EvidenceContent`n$AuditContent"
    if ($combinedContent -notmatch "(?i)needs[_-]?recheck") {
        Write-Output "OK_NEEDS_RECHECK_POLICY_NOT_REQUIRED $TaskId"
        return
    }

    $nextTaskPolicy = Get-ContentScalar -Content $combinedContent -Key "nextTaskPolicy"
    if ([string]::IsNullOrWhiteSpace($nextTaskPolicy)) {
        Add-Finding "HARD_BLOCK_NEEDS_RECHECK_MISSING_NEXT_TASK_POLICY $TaskId"
        return
    }

    if ($nextTaskPolicy -eq "seeded") {
        $nextTaskId = Get-ContentScalar -Content $combinedContent -Key "nextModuleRunCandidate"
        if ([string]::IsNullOrWhiteSpace($nextTaskId) -or $nextTaskId -in @("pending", "none", "not seeded", "intentionally not seeded")) {
            Add-Finding "HARD_BLOCK_NEXT_TASK_POLICY_SEEDED_MISSING_CANDIDATE $TaskId"
            return
        }

        if (Test-TaskExists -TaskBlocks $TaskBlocks -TaskId $nextTaskId) {
            Write-Output "OK_NEXT_TASK_POLICY_SEEDED $TaskId $nextTaskId"
        } else {
            Add-Finding "HARD_BLOCK_NEXT_TASK_POLICY_SEEDED_MISSING_TASK $TaskId $nextTaskId"
        }
        return
    }

    if ($nextTaskPolicy -eq "intentionally_not_seeded") {
        $reason = Get-ContentScalar -Content $combinedContent -Key "nextTaskPolicyReason"
        if ([string]::IsNullOrWhiteSpace($reason) -or $reason -eq "pending") {
            Add-Finding "HARD_BLOCK_NEXT_TASK_POLICY_REASON_MISSING $TaskId"
        } else {
            Write-Output "OK_NEXT_TASK_POLICY_INTENTIONALLY_NOT_SEEDED $TaskId"
        }
        return
    }

    Add-Finding "HARD_BLOCK_UNKNOWN_NEXT_TASK_POLICY $TaskId $nextTaskPolicy"
}

function Test-FastLaneTaskMetadata {
    param(
        [Parameter(Mandatory = $true)]
        [object]$TaskBlock,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedRole,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedBatchId
    )

    $taskId = $TaskBlock.Id
    $eligible = Get-ScalarValue -Block $TaskBlock.Lines -Key "fastLaneEligible"
    $lane = Get-ScalarValue -Block $TaskBlock.Lines -Key "fastLaneLane"
    $batchIdValue = Get-ScalarValue -Block $TaskBlock.Lines -Key "fastLaneBatchId"
    $role = Get-ScalarValue -Block $TaskBlock.Lines -Key "fastLaneBatchRole"
    $taskKind = Get-ScalarValue -Block $TaskBlock.Lines -Key "taskKind"
    $allowedTaskKinds = @(
        "readonly_audit",
        "readonly_recheck",
        "boundary_decision",
        "queue_seeding",
        "state_evidence_repair",
        "state_sync",
        "docs_only",
        "docs_only_batch_closeout",
        "closeout_repair"
    )

    if ($eligible -ne "true") {
        Add-Finding "HARD_BLOCK_FAST_LANE_NOT_ELIGIBLE $taskId"
    } else {
        Write-Output "OK_FAST_LANE_ELIGIBLE $taskId"
    }

    if ($lane -ne "docs_only") {
        Add-Finding "HARD_BLOCK_FAST_LANE_NOT_DOCS_ONLY $taskId"
    } else {
        Write-Output "OK_FAST_LANE_LANE $taskId"
    }

    if ($batchIdValue -ne $ExpectedBatchId) {
        Add-Finding "HARD_BLOCK_FAST_LANE_BATCH_ID_MISMATCH $taskId"
    }

    if ($role -ne $ExpectedRole) {
        Add-Finding "HARD_BLOCK_FAST_LANE_ROLE_MISMATCH $taskId expected=$ExpectedRole actual=$role"
    }

    if ($allowedTaskKinds -notcontains $taskKind) {
        Add-Finding "HARD_BLOCK_FAST_LANE_UNSUPPORTED_TASK_KIND $taskId $taskKind"
    } else {
        Write-Output "OK_FAST_LANE_TASK_KIND $taskId $taskKind"
    }
}

$findings = New-Object System.Collections.Generic.List[string]
$fastLaneAllowedPatterns = @(
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    "docs/05-execution-logs/task-plans/**",
    "docs/05-execution-logs/evidence/**",
    "docs/05-execution-logs/audits-reviews/**"
)
$fastLaneBlockedPatterns = @(
    ".env*",
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.yaml",
    "package-lock.json",
    "src/**",
    "tests/**",
    "scripts/**",
    "e2e/**",
    "src/db/schema/**",
    "drizzle/**",
    "materials/**",
    "paper_assets/**",
    "playwright-report/**",
    "test-results/**"
)

Write-Section -Title "Module Run v2 Docs-Only Batch Readiness"
Write-Output "docsOnlyBatchMode: $Mode"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$repositoryRoot = ((& git rev-parse --show-toplevel) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($repositoryRoot)) {
    $repositoryRoot = (Get-Location).Path
}

$projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
$queueLines = @(Get-Content -LiteralPath $QueuePath)
$taskBlocks = @(Get-TaskBlocks -Lines $queueLines)
$currentTaskId = Get-CurrentTaskId -Lines $projectStateLines

if ([string]::IsNullOrWhiteSpace($BatchId)) {
    $currentTaskBlock = Get-TaskBlockById -TaskBlocks $taskBlocks -Id $currentTaskId
    if ($null -ne $currentTaskBlock) {
        $BatchId = Get-ScalarValue -Block $currentTaskBlock.Lines -Key "fastLaneBatchId"
    }
}

if ([string]::IsNullOrWhiteSpace($BatchId)) {
    throw "BatchId is required for docs-only batch readiness."
}

Write-Output "docsOnlyBatchId: $BatchId"

Write-Section -Title "Batch Topology"
$parentBlocks = @($taskBlocks | Where-Object {
        (Get-ScalarValue -Block $_.Lines -Key "fastLaneBatchId") -eq $BatchId -and
        (Get-ScalarValue -Block $_.Lines -Key "fastLaneBatchRole") -eq "parent"
    })

if ($parentBlocks.Count -ne 1) {
    Add-Finding "HARD_BLOCK_FAST_LANE_PARENT_COUNT batch=$BatchId count=$($parentBlocks.Count)"
    $parentBlock = $null
} else {
    $parentBlock = $parentBlocks[0]
    Write-Output "parentTaskId: $($parentBlock.Id)"
    Test-FastLaneTaskMetadata -TaskBlock $parentBlock -ExpectedRole "parent" -ExpectedBatchId $BatchId
}

$childIds = @()
if ($null -ne $parentBlock) {
    $childIds = @(Get-ListValues -Block $parentBlock.Lines -Key "fastLaneBatchChildren")
}

if ($childIds.Count -eq 0) {
    Add-Finding "HARD_BLOCK_FAST_LANE_NO_CHILDREN batch=$BatchId"
}

$batchTaskBlocks = New-Object System.Collections.Generic.List[object]
if ($null -ne $parentBlock) {
    $batchTaskBlocks.Add($parentBlock)
}

foreach ($childId in $childIds) {
    $childBlock = Get-TaskBlockById -TaskBlocks $taskBlocks -Id $childId
    if ($null -eq $childBlock) {
        Add-Finding "HARD_BLOCK_FAST_LANE_CHILD_NOT_FOUND $childId"
        continue
    }

    Write-Output "childTaskId: $childId"
    Test-FastLaneTaskMetadata -TaskBlock $childBlock -ExpectedRole "child" -ExpectedBatchId $BatchId
    $batchTaskBlocks.Add($childBlock)
}

Write-Section -Title "Changed Files"
$filesToScan = @(Get-ChangedFiles -ExplicitFiles $ChangedFiles)
Write-Output "changedFiles: $($filesToScan.Count)"

$batchAllowedPatterns = New-Object System.Collections.Generic.List[string]
$batchBlockedPatterns = New-Object System.Collections.Generic.List[string]
foreach ($taskBlock in $batchTaskBlocks.ToArray()) {
    foreach ($allowedFile in @(Get-ListValues -Block $taskBlock.Lines -Key "allowedFiles")) {
        $batchAllowedPatterns.Add($allowedFile)
    }
    foreach ($blockedFile in @(Get-ListValues -Block $taskBlock.Lines -Key "blockedFiles")) {
        $batchBlockedPatterns.Add($blockedFile)
    }
}

foreach ($changedFile in $filesToScan) {
    $globalBlockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $fastLaneBlockedPatterns
    $taskBlockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $batchBlockedPatterns.ToArray()
    $globalAllowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $fastLaneAllowedPatterns
    $taskAllowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $batchAllowedPatterns.ToArray()

    if (-not [string]::IsNullOrWhiteSpace($globalBlockedPattern)) {
        Add-Finding "HARD_BLOCK_FORBIDDEN_CHANGED_FILE $changedFile matches $globalBlockedPattern"
        continue
    }

    if (-not [string]::IsNullOrWhiteSpace($taskBlockedPattern)) {
        Add-Finding "HARD_BLOCK_FORBIDDEN_CHANGED_FILE $changedFile matches $taskBlockedPattern"
        continue
    }

    if ([string]::IsNullOrWhiteSpace($globalAllowedPattern)) {
        Add-Finding "HARD_BLOCK_OUT_OF_DOCS_ONLY_FAST_LANE_SCOPE $changedFile"
        continue
    }

    if ([string]::IsNullOrWhiteSpace($taskAllowedPattern)) {
        Add-Finding "HARD_BLOCK_OUT_OF_BATCH_ALLOWED_FILES $changedFile"
        continue
    }

    Write-Output "OK_DOCS_ONLY_CHANGED_FILE $changedFile"
}

Write-Section -Title "Evidence And Audit"
foreach ($taskBlock in $batchTaskBlocks.ToArray()) {
    $taskId = $taskBlock.Id
    $planPath = Get-ScalarValue -Block $taskBlock.Lines -Key "planPath"
    $evidencePath = Get-ScalarValue -Block $taskBlock.Lines -Key "evidencePath"
    $auditReviewPath = Get-ScalarValue -Block $taskBlock.Lines -Key "auditReviewPath"

    [void](Test-RequiredPath -TaskId $taskId -Path $planPath -MissingCode "HARD_BLOCK_MISSING_TASK_PLAN" -OkCode "OK_TASK_PLAN_PATH" -RepositoryRoot $repositoryRoot)
    $hasEvidence = Test-RequiredPath -TaskId $taskId -Path $evidencePath -MissingCode "HARD_BLOCK_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH" -RepositoryRoot $repositoryRoot
    $hasAudit = Test-RequiredPath -TaskId $taskId -Path $auditReviewPath -MissingCode "HARD_BLOCK_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH" -RepositoryRoot $repositoryRoot

    $evidenceContent = ""
    $auditContent = ""
    if ($hasEvidence) {
        $evidenceContent = Get-Content -LiteralPath (Resolve-RepositoryPath -RepositoryRoot $repositoryRoot -Path $evidencePath) -Raw
        Test-EvidenceAnchors -TaskId $taskId -Content $evidenceContent
    }

    if ($hasAudit) {
        $auditContent = Get-Content -LiteralPath (Resolve-RepositoryPath -RepositoryRoot $repositoryRoot -Path $auditReviewPath) -Raw
        Test-ContentPattern -Content $auditContent -Pattern "APPROVE|No blocking findings|Verdict" -MissingCode "HARD_BLOCK_AUDIT_NOT_APPROVED $taskId" -OkCode "OK_AUDIT_APPROVED $taskId"
    }

    if ($hasEvidence -or $hasAudit) {
        Test-NeedsRecheckPolicy -TaskId $taskId -EvidenceContent $evidenceContent -AuditContent $auditContent -TaskBlocks $taskBlocks
    }
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    foreach ($finding in $findings) {
        Write-Output "docsOnlyBatchFinding: $finding"
    }

    if ($Mode -eq "shadow") {
        Write-Output "docsOnlyBatchShadowDecision: would_block"
        Write-Output "docsOnlyBatchFindings: $($findings.Count)"
        exit 0
    }

    Write-Output "docsOnlyBatchDecision: blocked"
    throw "Module Run v2 docs-only batch readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

if ($Mode -eq "shadow") {
    Write-Output "docsOnlyBatchShadowDecision: would_pass"
} else {
    Write-Output "docsOnlyBatchDecision: pass"
}
