param(
    [Parameter(Mandatory = $false)]
    [string]$TaskId = "",

    [Parameter(Mandatory = $false)]
    [string]$CandidateTaskId = "",

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
    [string]$EvidencePath = ""
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

function Get-BlockText {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Block)

    return ($Block -join "`n")
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

function Test-AnyPathPattern {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string[]]$Patterns
    )

    foreach ($pattern in $Patterns) {
        if (Test-PathPattern -Path $Path -Pattern $pattern) {
            return $true
        }
    }

    return $false
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

$findings = New-Object System.Collections.Generic.List[string]

Write-Section -Title "Module Run v2 Implementation Auto-Seed Readiness"
Write-Output "implementationAutoSeedMode: hard_block"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$projectStateLines = @(Get-Content -LiteralPath $ProjectStatePath)
$queueLines = @(Get-Content -LiteralPath $QueuePath)
$matrixContent = Get-Content -LiteralPath $MatrixPath -Raw
$taskBlocks = @(Get-TaskBlocks -Lines $queueLines)

if ([string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

$taskBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $TaskId)
if ($taskBlock.Count -eq 0) {
    throw "Task not found in queue: $TaskId"
}

if ([string]::IsNullOrWhiteSpace($EvidencePath)) {
    $EvidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
}

Write-Output "taskId: $TaskId"
if (-not [string]::IsNullOrWhiteSpace($CandidateTaskId)) {
    Write-Output "candidateTaskId: $CandidateTaskId"
}

Write-Section -Title "Matrix Anchors"
Test-ContentPattern -Content $matrixContent -Pattern "implementationAutoSeedGate\s*:" -MissingCode "HARD_BLOCK_MISSING_IMPLEMENTATION_AUTO_SEED_GATE" -OkCode "OK_IMPLEMENTATION_AUTO_SEED_GATE"
Test-ContentPattern -Content $matrixContent -Pattern "localExperienceClosureGate\s*:" -MissingCode "HARD_BLOCK_MISSING_LOCAL_EXPERIENCE_CLOSURE_GATE" -OkCode "OK_LOCAL_EXPERIENCE_CLOSURE_GATE"
Test-ContentPattern -Content $matrixContent -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_MISSING_COST_GATE_STATEMENT" -OkCode "OK_COST_GATE_RECORDED"

$sourceTaskKind = Get-ScalarValue -Block $taskBlock -Key "taskKind"
$sourceTaskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
$sourceBlockText = Get-BlockText -Block $taskBlock

Write-Section -Title "Source Planning Task"
Write-Output "taskKind: $sourceTaskKind"
Write-Output "status: $sourceTaskStatus"
if ($sourceTaskKind -notin @("implementation_planning", "local_verification_planning", "governance_alignment", "implementation")) {
    Add-Finding "HARD_BLOCK_SOURCE_TASK_KIND_NOT_ALLOWED $sourceTaskKind"
}

if (-not (Test-Path -LiteralPath $EvidencePath)) {
    Add-Finding "HARD_BLOCK_MISSING_SOURCE_EVIDENCE $EvidencePath"
} else {
    $evidenceContent = Get-Content -LiteralPath $EvidencePath -Raw
    Test-ContentPattern -Content $evidenceContent -Pattern "implementationAutoSeedGate" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_AUTO_SEED_GATE" -OkCode "OK_EVIDENCE_AUTO_SEED_GATE"
    Test-ContentPattern -Content $evidenceContent -Pattern "localExperienceClosureGate" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_LOCAL_EXPERIENCE_GATE" -OkCode "OK_EVIDENCE_LOCAL_EXPERIENCE_GATE"
    Test-ContentPattern -Content $evidenceContent -Pattern "seededImplementationTask|proposedImplementationTask|candidateImplementationTask" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_SEEDED_IMPLEMENTATION_TASK" -OkCode "OK_EVIDENCE_SEEDED_IMPLEMENTATION_TASK"
    Test-ContentPattern -Content $evidenceContent -Pattern "focused test|focusedTest|focused tests" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_FOCUSED_TEST_PLAN" -OkCode "OK_EVIDENCE_FOCUSED_TEST_PLAN"
    Test-ContentPattern -Content $evidenceContent -Pattern "localFullLoopGate" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_LOCAL_FULL_LOOP_GATE" -OkCode "OK_EVIDENCE_LOCAL_FULL_LOOP_GATE"
    Test-ContentPattern -Content $evidenceContent -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_EVIDENCE_MISSING_COST_GATE" -OkCode "OK_EVIDENCE_COST_GATE"
}

if ($sourceBlockText -match "autoDriveLocalImplementationApproval") {
    Write-Output "OK_SOURCE_APPROVAL_ANCHOR"
}

if (-not [string]::IsNullOrWhiteSpace($CandidateTaskId)) {
    $candidateBlock = @(Get-TaskBlock -Blocks $taskBlocks -Id $CandidateTaskId)
    if ($candidateBlock.Count -eq 0) {
        Add-Finding "HARD_BLOCK_CANDIDATE_TASK_NOT_FOUND $CandidateTaskId"
    } else {
        $candidateKind = Get-ScalarValue -Block $candidateBlock -Key "taskKind"
        $candidateStatus = Get-ScalarValue -Block $candidateBlock -Key "status"
        $candidateBlockText = Get-BlockText -Block $candidateBlock
        $allowedFiles = @(Get-ListValues -Block $candidateBlock -Key "allowedFiles")
        $blockedFiles = @(Get-ListValues -Block $candidateBlock -Key "blockedFiles")
        $riskTypes = @(Get-ListValues -Block $candidateBlock -Key "riskTypes")
        $validationCommands = @(Get-ListValues -Block $candidateBlock -Key "validationCommands")

        Write-Section -Title "Candidate Implementation Task"
        Write-Output "taskKind: $candidateKind"
        Write-Output "status: $candidateStatus"

        if ($candidateKind -ne "implementation") {
            Add-Finding "HARD_BLOCK_CANDIDATE_NOT_IMPLEMENTATION $candidateKind"
        }

        if ($candidateStatus -notin @("pending", "in_progress")) {
            Add-Finding "HARD_BLOCK_CANDIDATE_STATUS_NOT_EXECUTABLE $candidateStatus"
        }

        if ($candidateBlockText -match "autoDriveLocalImplementationApproval") {
            Write-Output "OK_CANDIDATE_APPROVAL_ANCHOR"
        } else {
            Add-Finding "HARD_BLOCK_CANDIDATE_MISSING_AUTODRIVE_APPROVAL"
        }

        $safePatterns = @(
            "src/server/models/**",
            "src/server/contracts/**",
            "src/server/validators/**",
            "src/server/services/**",
            "docs/04-agent-system/state/project-state.yaml",
            "docs/04-agent-system/state/task-queue.yaml",
            "docs/05-execution-logs/task-plans/**",
            "docs/05-execution-logs/evidence/**",
            "docs/05-execution-logs/audits-reviews/**"
        )
        $bridgePatterns = @(
            "src/server/repositories/**",
            "src/server/mappers/**",
            "src/app/api/v1/**",
            "src/app/(student)/**",
            "src/app/(admin)/**",
            "e2e/**"
        )
        $hardBlockedPatterns = @(
            ".env.local",
            ".env.example",
            "package.json",
            "pnpm-lock.yaml",
            "package-lock.yaml",
            "package-lock.json",
            "src/db/schema/**",
            "drizzle/**"
        )

        foreach ($allowedFile in $allowedFiles) {
            if (Test-AnyPathPattern -Path $allowedFile -Patterns $hardBlockedPatterns) {
                Add-Finding "HARD_BLOCK_CANDIDATE_ALLOWED_HIGH_RISK_FILE $allowedFile"
                continue
            }

            if (Test-AnyPathPattern -Path $allowedFile -Patterns $safePatterns) {
                Write-Output "OK_CANDIDATE_ALLOWED_FILE $allowedFile"
                continue
            }

            if (Test-AnyPathPattern -Path $allowedFile -Patterns $bridgePatterns) {
                if ($candidateBlockText -match "localExperienceAcceptanceBridgeApproved") {
                    Write-Output "OK_CANDIDATE_BRIDGE_FILE $allowedFile"
                } else {
                    Add-Finding "HARD_BLOCK_CANDIDATE_BRIDGE_FILE_WITHOUT_APPROVAL $allowedFile"
                }
                continue
            }

            Add-Finding "HARD_BLOCK_CANDIDATE_ALLOWED_FILE_NOT_AUTODRIVE_SAFE $allowedFile"
        }

        foreach ($requiredBlockedFile in $hardBlockedPatterns) {
            if ($blockedFiles -contains $requiredBlockedFile) {
                Write-Output "OK_CANDIDATE_BLOCKED_FILE $requiredBlockedFile"
            } else {
                Add-Finding "HARD_BLOCK_CANDIDATE_MISSING_BLOCKED_FILE $requiredBlockedFile"
            }
        }

        $blockedRiskPattern = "(?i)provider|env|secret|deploy|payment|external|schema|migration|dependency|package|lockfile|cost_calibration"
        foreach ($riskType in $riskTypes) {
            if ($riskType -match $blockedRiskPattern) {
                Add-Finding "HARD_BLOCK_CANDIDATE_BLOCKED_RISK_TYPE $riskType"
            }
        }

        $validationText = $validationCommands -join "`n"
        Test-ContentPattern -Content $validationText -Pattern "npm\.cmd run lint" -MissingCode "HARD_BLOCK_CANDIDATE_MISSING_LINT" -OkCode "OK_CANDIDATE_LINT"
        Test-ContentPattern -Content $validationText -Pattern "npm\.cmd run typecheck" -MissingCode "HARD_BLOCK_CANDIDATE_MISSING_TYPECHECK" -OkCode "OK_CANDIDATE_TYPECHECK"
        Test-ContentPattern -Content $validationText -Pattern "git diff --check" -MissingCode "HARD_BLOCK_CANDIDATE_MISSING_DIFF_CHECK" -OkCode "OK_CANDIDATE_DIFF_CHECK"
        Test-ContentPattern -Content $validationText -Pattern "vitest|\.test\.ts|focused" -MissingCode "HARD_BLOCK_CANDIDATE_MISSING_FOCUSED_TEST" -OkCode "OK_CANDIDATE_FOCUSED_TEST"
        Test-ContentPattern -Content $validationText -Pattern "Test-ModuleRunV2ModuleCloseoutReadiness" -MissingCode "HARD_BLOCK_CANDIDATE_MISSING_CLOSEOUT_GATE" -OkCode "OK_CANDIDATE_CLOSEOUT_GATE"
    }
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 implementation auto-seed readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

Write-Output "implementation auto-seed readiness passed"
