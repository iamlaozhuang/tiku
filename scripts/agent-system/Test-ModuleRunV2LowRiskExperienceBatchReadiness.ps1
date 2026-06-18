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
$findings = New-Object System.Collections.Generic.List[string]

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
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (-not [string]::IsNullOrWhiteSpace($pattern) -and (Test-PathPattern -Path $Path -Pattern $pattern)) {
            return $pattern
        }
    }

    return ""
}

function Expand-FileInputs {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Files)

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
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$ExplicitFiles)

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

function Get-TaskBlocks {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Lines)

    $blocks = New-Object System.Collections.Generic.List[object]
    $startIndex = -1
    $currentId = ""

    for ($lineIndex = 0; $lineIndex -lt $Lines.Count; $lineIndex++) {
        if ($Lines[$lineIndex] -match "^\s+- id:\s+(.+?)\s*$") {
            if ($startIndex -ge 0) {
                $blocks.Add([pscustomobject]@{
                    Id    = $currentId
                    Lines = @($Lines[$startIndex..($lineIndex - 1)])
                })
            }

            $startIndex = $lineIndex
            $currentId = $Matches[1].Trim()
        }
    }

    if ($startIndex -ge 0) {
        $blocks.Add([pscustomobject]@{
            Id    = $currentId
            Lines = @($Lines[$startIndex..($Lines.Count - 1)])
        })
    }

    return $blocks.ToArray()
}

function Get-TaskBlockById {
    param(
        [Parameter(Mandatory = $true)][object[]]$TaskBlocks,
        [Parameter(Mandatory = $true)][string]$Id
    )

    foreach ($taskBlock in $TaskBlocks) {
        if ($taskBlock.Id -eq $Id) {
            return $taskBlock
        }
    }

    return $null
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

function Get-ListValues {
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

function Get-SectionLines {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block,
        [Parameter(Mandatory = $true)][string]$SectionKey
    )

    $sectionLines = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    $sectionIndent = -1

    foreach ($line in $Block) {
        if (-not $insideSection -and $line -match "^(\s*)$([regex]::Escape($SectionKey)):\s*$") {
            $insideSection = $true
            $sectionIndent = $Matches[1].Length
            continue
        }

        if ($insideSection) {
            if ($line -match "^(\s*)\S" -and $Matches[1].Length -le $sectionIndent) {
                break
            }

            $sectionLines.Add($line)
        }
    }

    return $sectionLines.ToArray()
}

function Get-BatchScalar {
    param(
        [Parameter(Mandatory = $true)][object]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$FlatKey
    )

    $flatValue = Get-ScalarValue -Block $TaskBlock.Lines -Key $FlatKey
    if (-not [string]::IsNullOrWhiteSpace($flatValue)) {
        return $flatValue
    }

    $batchSection = @(Get-SectionLines -Block $TaskBlock.Lines -SectionKey "lowRiskExperienceBatch")
    return Get-ScalarValue -Block $batchSection -Key $Key
}

function Get-BatchList {
    param(
        [Parameter(Mandatory = $true)][object]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$Key,
        [Parameter(Mandatory = $true)][string]$FlatKey
    )

    $flatValues = @(Get-ListValues -Block $TaskBlock.Lines -Key $FlatKey)
    if ($flatValues.Count -gt 0) {
        return $flatValues
    }

    $batchSection = @(Get-SectionLines -Block $TaskBlock.Lines -SectionKey "lowRiskExperienceBatch")
    return @(Get-ListValues -Block $batchSection -Key $Key)
}

function Get-NestedBatchScalar {
    param(
        [Parameter(Mandatory = $true)][object]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$NestedSectionKey,
        [Parameter(Mandatory = $true)][string]$Key
    )

    $batchSection = @(Get-SectionLines -Block $TaskBlock.Lines -SectionKey "lowRiskExperienceBatch")
    $nestedSection = @(Get-SectionLines -Block $batchSection -SectionKey $NestedSectionKey)
    return Get-ScalarValue -Block $nestedSection -Key $Key
}

function Resolve-RepositoryPath {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return $Path
    }

    return Join-Path -Path $RepositoryRoot -ChildPath $Path
}

function Test-RequiredPath {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$MissingCode,
        [Parameter(Mandatory = $true)][string]$OkCode,
        [Parameter(Mandatory = $true)][string]$RepositoryRoot
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Finding "$MissingCode $TaskId missing_path_value"
        return $false
    }

    $resolvedPath = Resolve-RepositoryPath -RepositoryRoot $RepositoryRoot -Path $Path
    if (-not (Test-Path -LiteralPath $resolvedPath)) {
        Add-Finding "$MissingCode $TaskId $Path"
        return $false
    }

    Write-Output "$OkCode $TaskId $Path"
    return $true
}

function Get-RequiredPathContent {
    param(
        [Parameter(Mandatory = $true)][string]$RepositoryRoot,
        [Parameter(Mandatory = $true)][string]$Path
    )

    return Get-Content -LiteralPath (Resolve-RepositoryPath -RepositoryRoot $RepositoryRoot -Path $Path) -Raw
}

function Test-ContentPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [Parameter(Mandatory = $true)][string]$MissingCode,
        [Parameter(Mandatory = $true)][string]$OkCode
    )

    if ($Content -match $Pattern) {
        Write-Output $OkCode
    } else {
        Add-Finding $MissingCode
    }
}

function Test-IsTestFile {
    param([Parameter(Mandatory = $true)][string]$Path)

    $normalizedPath = ConvertTo-NormalizedPath -Path $Path
    return $normalizedPath -match "(?i)(^|/)(src|tests)/.+\.test\.(ts|tsx|js|jsx)$"
}

function Test-StructuredCloseoutPolicy {
    param([Parameter(Mandatory = $true)][string[]]$TaskBlock)

    $taskText = ($TaskBlock -join "`n")
    $hasCloseoutPolicy = $taskText -match "(?im)^\s+closeoutPolicy:\s*$"
    $hasLocalCommit = $taskText -match "(?im)^\s+localCommit:\s*approved\s*$" -or $taskText -match "(?ims)^\s+localCommit:\s*\r?\n\s+approved:\s*true\s*$"
    $hasMerge = $taskText -match "(?im)^\s+fastForwardMerge:\s*$" -and $taskText -match "(?im)^\s+targetBranch:\s*master\s*$"
    $hasPush = $taskText -match "(?im)^\s+push:\s*$" -and $taskText -match "(?im)^\s+target:\s*origin/master\s*$"
    $hasCleanup = $taskText -match "(?im)^\s+cleanup:\s*$" `
        -and $taskText -match "(?im)^\s+deleteShortBranch:\s*true\s*$" `
        -and $taskText -match "(?im)^\s+parkWorktree:\s*true\s*$"
    $approvedCount = ([regex]::Matches($taskText, "(?im)^\s+approved:\s*true\s*$")).Count

    return $hasCloseoutPolicy -and $hasLocalCommit -and $hasMerge -and $hasPush -and $hasCleanup -and $approvedCount -ge 2
}

function Test-TaskMetadata {
    param(
        [Parameter(Mandatory = $true)][object]$TaskBlock,
        [Parameter(Mandatory = $true)][string]$ExpectedRole,
        [Parameter(Mandatory = $true)][string]$ExpectedBatchId
    )

    $taskId = $TaskBlock.Id
    $actualBatchId = Get-BatchScalar -TaskBlock $TaskBlock -Key "id" -FlatKey "lowRiskExperienceBatchId"
    $role = Get-BatchScalar -TaskBlock $TaskBlock -Key "role" -FlatKey "lowRiskExperienceBatchRole"
    $executionProfile = Get-ScalarValue -Block $TaskBlock.Lines -Key "executionProfile"
    $taskKind = Get-ScalarValue -Block $TaskBlock.Lines -Key "taskKind"
    $allowedChildKinds = @("local_experience_audit", "readiness_audit", "implementation", "implementation_tdd")

    if ($actualBatchId -ne $ExpectedBatchId) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_ID_MISMATCH $taskId expected=$ExpectedBatchId actual=$actualBatchId"
    } else {
        Write-Output "OK_LOW_RISK_BATCH_ID $taskId"
    }

    if ($role -ne $ExpectedRole) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_ROLE_MISMATCH $taskId expected=$ExpectedRole actual=$role"
    } else {
        Write-Output "OK_LOW_RISK_BATCH_ROLE $taskId $role"
    }

    if ($ExpectedRole -eq "parent") {
        if ($executionProfile -ne "local_low_risk_experience_batch") {
            Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_PROFILE_MISMATCH $taskId $executionProfile"
        } else {
            Write-Output "OK_LOW_RISK_BATCH_PROFILE $taskId"
        }

        if ($taskKind -ne "local_experience_batch") {
            Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_PARENT_KIND $taskId $taskKind"
        } else {
            Write-Output "OK_LOW_RISK_BATCH_PARENT_KIND $taskId"
        }
    } elseif ($allowedChildKinds -notcontains $taskKind) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_CHILD_KIND $taskId $taskKind"
    } else {
        Write-Output "OK_LOW_RISK_BATCH_CHILD_KIND $taskId $taskKind"
    }
}

function Test-EvidenceAnchors {
    param(
        [Parameter(Mandatory = $true)][string]$TaskId,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][bool]$IsParent
    )

    Test-ContentPattern -Content $Content -Pattern "(?mi)^\s*(?:-\s*)?result\s*:\s*(?!pending\b).+" -MissingCode "HARD_BLOCK_EVIDENCE_NOT_PASS $TaskId" -OkCode "OK_EVIDENCE_RESULT $TaskId"
    Test-ContentPattern -Content $Content -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_MISSING_COST_GATE_STATEMENT $TaskId" -OkCode "OK_COST_GATE_RECORDED $TaskId"

    if ($IsParent) {
        Test-ContentPattern -Content $Content -Pattern "(?mi)\bBatch range\b|^#{2,4}\s*Batch\s+\d+|\bBatch\s+\d+\s*:" -MissingCode "HARD_BLOCK_MISSING_BATCH_EVIDENCE $TaskId" -OkCode "OK_BATCH_EVIDENCE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern "(?mi)\bRED\b\s*:" -MissingCode "HARD_BLOCK_MISSING_RED_EVIDENCE $TaskId" -OkCode "OK_RED_EVIDENCE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern "(?mi)\bGREEN\b\s*:" -MissingCode "HARD_BLOCK_MISSING_GREEN_EVIDENCE $TaskId" -OkCode "OK_GREEN_EVIDENCE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern '(?mi)\bCommit:\s*`?[0-9a-f]{7,40}`?' -MissingCode "HARD_BLOCK_MISSING_BATCH_COMMIT_EVIDENCE $TaskId" -OkCode "OK_BATCH_COMMIT_EVIDENCE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern "localFullLoopGate" -MissingCode "HARD_BLOCK_MISSING_LOCAL_FULL_LOOP_GATE $TaskId" -OkCode "OK_LOCAL_FULL_LOOP_GATE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern "threadRolloverGate" -MissingCode "HARD_BLOCK_MISSING_THREAD_ROLLOVER_GATE $TaskId" -OkCode "OK_THREAD_ROLLOVER_GATE_RECORDED $TaskId"
        Test-ContentPattern -Content $Content -Pattern "nextModuleRunCandidate" -MissingCode "HARD_BLOCK_MISSING_NEXT_MODULE_RUN_CANDIDATE $TaskId" -OkCode "OK_NEXT_MODULE_RUN_CANDIDATE_RECORDED $TaskId"
    } else {
        Test-ContentPattern -Content $Content -Pattern "(?i)focused unit|test:unit|keep-partial|keep_partial|RED|GREEN" -MissingCode "HARD_BLOCK_CHILD_EVIDENCE_MISSING_DECISION_OR_UNIT $TaskId" -OkCode "OK_CHILD_EVIDENCE_DECISION_OR_UNIT $TaskId"
    }
}

$globalBlockedPatterns = @(
    ".env*",
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.yaml",
    "package-lock.json",
    "src/db/schema/**",
    "drizzle/**",
    "e2e/**",
    "playwright-report/**",
    "test-results/**"
)

Write-Section -Title "Module Run v2 Low-Risk Experience Batch Readiness"
Write-Output "lowRiskExperienceBatchMode: $Mode"

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
        $BatchId = Get-BatchScalar -TaskBlock $currentTaskBlock -Key "id" -FlatKey "lowRiskExperienceBatchId"
    }
}

if ([string]::IsNullOrWhiteSpace($BatchId)) {
    throw "BatchId is required for low-risk experience batch readiness."
}

Write-Output "lowRiskExperienceBatchId: $BatchId"

Write-Section -Title "Batch Topology"
$parentBlocks = @($taskBlocks | Where-Object {
        (Get-BatchScalar -TaskBlock $_ -Key "id" -FlatKey "lowRiskExperienceBatchId") -eq $BatchId -and
        (Get-BatchScalar -TaskBlock $_ -Key "role" -FlatKey "lowRiskExperienceBatchRole") -eq "parent"
    })

if ($parentBlocks.Count -ne 1) {
    Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_PARENT_COUNT batch=$BatchId count=$($parentBlocks.Count)"
    $parentBlock = $null
} else {
    $parentBlock = $parentBlocks[0]
    Write-Output "parentTaskId: $($parentBlock.Id)"
    Test-TaskMetadata -TaskBlock $parentBlock -ExpectedRole "parent" -ExpectedBatchId $BatchId
}

$childIds = @()
if ($null -ne $parentBlock) {
    $childIds = @(Get-BatchList -TaskBlock $parentBlock -Key "children" -FlatKey "lowRiskExperienceBatchChildren")
}

if ($childIds.Count -eq 0) {
    Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_NO_CHILDREN batch=$BatchId"
}

$batchTaskBlocks = New-Object System.Collections.Generic.List[object]
if ($null -ne $parentBlock) {
    $batchTaskBlocks.Add($parentBlock)
}

foreach ($childId in $childIds) {
    $childBlock = Get-TaskBlockById -TaskBlocks $taskBlocks -Id $childId
    if ($null -eq $childBlock) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_CHILD_NOT_FOUND $childId"
        continue
    }

    Write-Output "childTaskId: $childId"
    Test-TaskMetadata -TaskBlock $childBlock -ExpectedRole "child" -ExpectedBatchId $BatchId
    $batchTaskBlocks.Add($childBlock)
}

$fixtureRepairMode = ""
$e2eListOnce = "false"
$lintTypecheckOnce = "false"
$requiresRedGreen = "false"
if ($null -ne $parentBlock) {
    $fixtureRepairMode = Get-NestedBatchScalar -TaskBlock $parentBlock -NestedSectionKey "fixtureRepairAllowance" -Key "mode"
    $requiresRedGreen = (Get-NestedBatchScalar -TaskBlock $parentBlock -NestedSectionKey "fixtureRepairAllowance" -Key "requiresRedGreen").ToLowerInvariant()
    $e2eListOnce = (Get-NestedBatchScalar -TaskBlock $parentBlock -NestedSectionKey "validationDedup" -Key "e2eListOnce").ToLowerInvariant()
    $lintTypecheckOnce = (Get-NestedBatchScalar -TaskBlock $parentBlock -NestedSectionKey "validationDedup" -Key "lintTypecheckOnce").ToLowerInvariant()

    if (($parentBlock.Lines -join "`n") -match "standingLocalLowRiskExperienceAdvancementApproval") {
        if (Test-StructuredCloseoutPolicy -TaskBlock $parentBlock.Lines) {
            Write-Output "OK_STANDING_LOW_RISK_EXPERIENCE_APPROVAL_STRUCTURED_CLOSEOUT $($parentBlock.Id)"
        } else {
            Add-Finding "HARD_BLOCK_STANDING_LOW_RISK_EXPERIENCE_APPROVAL_REQUIRES_STRUCTURED_CLOSEOUT $($parentBlock.Id)"
        }
    }
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

$changedTestFiles = New-Object System.Collections.Generic.List[string]
foreach ($changedFile in $filesToScan) {
    $globalBlockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $globalBlockedPatterns
    $taskBlockedPattern = Get-MatchingPattern -Path $changedFile -Patterns $batchBlockedPatterns.ToArray()
    $taskAllowedPattern = Get-MatchingPattern -Path $changedFile -Patterns $batchAllowedPatterns.ToArray()
    $isTestFile = Test-IsTestFile -Path $changedFile
    $isProductSource = (ConvertTo-NormalizedPath -Path $changedFile) -match "^(src|tests)/" -and -not $isTestFile

    if (-not [string]::IsNullOrWhiteSpace($globalBlockedPattern)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_FORBIDDEN_CHANGED_FILE $changedFile matches $globalBlockedPattern"
        continue
    }

    if ($isProductSource) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_PRODUCT_SOURCE_CHANGED $changedFile"
        continue
    }

    if (-not [string]::IsNullOrWhiteSpace($taskBlockedPattern)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_BLOCKED_FILE $changedFile matches $taskBlockedPattern"
        continue
    }

    if ([string]::IsNullOrWhiteSpace($taskAllowedPattern)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_OUT_OF_SCOPE $changedFile"
        continue
    }

    if ($isTestFile) {
        $changedTestFiles.Add($changedFile)
        if ($fixtureRepairMode -ne "test_only_contract_fixture") {
            Add-Finding "HARD_BLOCK_LOW_RISK_BATCH_TEST_FILE_REQUIRES_FIXTURE_ALLOWANCE $changedFile"
            continue
        }
    }

    Write-Output "OK_LOW_RISK_BATCH_CHANGED_FILE $changedFile"
}

Write-Section -Title "Evidence And Audit"
$combinedEvidence = ""
foreach ($taskBlock in $batchTaskBlocks.ToArray()) {
    $taskId = $taskBlock.Id
    $planPath = Get-ScalarValue -Block $taskBlock.Lines -Key "planPath"
    $evidencePath = Get-ScalarValue -Block $taskBlock.Lines -Key "evidencePath"
    $auditReviewPath = Get-ScalarValue -Block $taskBlock.Lines -Key "auditReviewPath"
    $isParent = $taskBlock.Id -eq $parentBlock.Id

    [void](Test-RequiredPath -TaskId $taskId -Path $planPath -MissingCode "HARD_BLOCK_LOW_RISK_BATCH_MISSING_TASK_PLAN" -OkCode "OK_TASK_PLAN_PATH" -RepositoryRoot $repositoryRoot)
    $hasEvidence = Test-RequiredPath -TaskId $taskId -Path $evidencePath -MissingCode "HARD_BLOCK_LOW_RISK_BATCH_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH" -RepositoryRoot $repositoryRoot
    $hasAudit = Test-RequiredPath -TaskId $taskId -Path $auditReviewPath -MissingCode "HARD_BLOCK_LOW_RISK_BATCH_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH" -RepositoryRoot $repositoryRoot

    if ($hasEvidence) {
        $evidenceContent = Get-RequiredPathContent -RepositoryRoot $repositoryRoot -Path $evidencePath
        $combinedEvidence = "$combinedEvidence`n$evidenceContent"
        Test-EvidenceAnchors -TaskId $taskId -Content $evidenceContent -IsParent $isParent
    }

    if ($hasAudit) {
        $auditContent = Get-RequiredPathContent -RepositoryRoot $repositoryRoot -Path $auditReviewPath
        Test-ContentPattern -Content $auditContent -Pattern "APPROVE|No blocking findings|Verdict" -MissingCode "HARD_BLOCK_LOW_RISK_BATCH_AUDIT_NOT_APPROVED $taskId" -OkCode "OK_AUDIT_APPROVED $taskId"
    }
}

if ($changedTestFiles.Count -gt 0 -or $fixtureRepairMode -eq "test_only_contract_fixture") {
    Test-ContentPattern -Content $combinedEvidence -Pattern "(?i)test-only fixture repair|test only fixture repair|fixture repair" -MissingCode "HARD_BLOCK_FIXTURE_REPAIR_EVIDENCE_MISSING" -OkCode "OK_FIXTURE_REPAIR_EVIDENCE_RECORDED"
    if ($requiresRedGreen -eq "true") {
        Test-ContentPattern -Content $combinedEvidence -Pattern "(?mi)\bRED\b\s*:" -MissingCode "HARD_BLOCK_FIXTURE_REPAIR_RED_MISSING" -OkCode "OK_FIXTURE_REPAIR_RED_RECORDED"
        Test-ContentPattern -Content $combinedEvidence -Pattern "(?mi)\bGREEN\b\s*:" -MissingCode "HARD_BLOCK_FIXTURE_REPAIR_GREEN_MISSING" -OkCode "OK_FIXTURE_REPAIR_GREEN_RECORDED"
    }
}

Write-Section -Title "Validation De-Dup"
if ($e2eListOnce -eq "true") {
    Test-ContentPattern -Content $combinedEvidence -Pattern "npm\.cmd run test:e2e -- --list" -MissingCode "HARD_BLOCK_VALIDATION_DEDUP_E2E_LIST_MISSING" -OkCode "OK_VALIDATION_DEDUP_E2E_LIST_ONCE"
}
if ($lintTypecheckOnce -eq "true") {
    Write-Output "OK_VALIDATION_DEDUP_LINT_TYPECHECK_ONCE"
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    foreach ($finding in $findings) {
        Write-Output "lowRiskExperienceBatchFinding: $finding"
    }

    if ($Mode -eq "shadow") {
        Write-Output "lowRiskExperienceBatchShadowDecision: would_block"
        Write-Output "lowRiskExperienceBatchFindings: $($findings.Count)"
        exit 0
    }

    Write-Output "lowRiskExperienceBatchDecision: blocked"
    throw "Module Run v2 low-risk experience batch readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

if ($Mode -eq "shadow") {
    Write-Output "lowRiskExperienceBatchShadowDecision: would_pass"
} else {
    Write-Output "lowRiskExperienceBatchDecision: pass"
}
