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
    [string]$EvidencePath = "",

    [Parameter(Mandatory = $false)]
    [string]$AuditReviewPath = "",

    [Parameter(Mandatory = $false)]
    [switch]$AllowMissingThreadRolloverDecision,

    [Parameter(Mandatory = $false)]
    [switch]$AllowMissingNextModuleRunCandidate,

    [Parameter(Mandatory = $false)]
    [string]$DocsOnlyBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$DocsOnlyBatchMode = "hard_block",

    [Parameter(Mandatory = $false)]
    [string]$LowRiskExperienceBatchId = "",

    [Parameter(Mandatory = $false)]
    [ValidateSet("shadow", "hard_block")]
    [string]$LowRiskExperienceBatchMode = "hard_block"
)

$ErrorActionPreference = "Stop"

$commonScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "ModuleRunV2.Common.ps1"
if (Test-Path -LiteralPath $commonScriptPath) {
    . $commonScriptPath
}

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

function Get-TaskBlock {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Id
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
        [Parameter(Mandatory = $true)]
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

function Get-ValidationLifecycleCommands {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Block,

        [Parameter(Mandatory = $true)]
        [string[]]$IncludedPhases
    )

    $commands = New-Object System.Collections.Generic.List[string]
    $insideSection = $false
    $currentPhase = ""

    foreach ($line in $Block) {
        if ($line -match "^\s+validationCommandLifecycle:\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^\s+-\s+phase:\s*(.+)\s*$") {
            $currentPhase = $Matches[1].Trim()
            continue
        }

        if ($line -match "^\s+command:\s*(.+)\s*$") {
            if ($IncludedPhases -contains $currentPhase) {
                $commands.Add($Matches[1].Trim())
            }
        }
    }

    return $commands.ToArray()
}

function Get-ValidationLifecyclePhases {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Block
    )

    $phases = New-Object System.Collections.Generic.List[string]
    $insideSection = $false

    foreach ($line in $Block) {
        if ($line -match "^\s+validationCommandLifecycle:\s*$") {
            $insideSection = $true
            continue
        }

        if ($insideSection -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if (-not $insideSection) {
            continue
        }

        if ($line -match "^\s+-\s+phase:\s*(.+)\s*$") {
            $phases.Add($Matches[1].Trim())
        }
    }

    return $phases.ToArray()
}

function Get-CurrentTaskId {
    param(
        [Parameter(Mandatory = $true)]
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

function Get-LowRiskExperienceBatchId {
    param([Parameter(Mandatory = $true)][string[]]$TaskBlock)

    $flatBatchId = Get-ScalarValue -Block $TaskBlock -Key "lowRiskExperienceBatchId"
    if (-not [string]::IsNullOrWhiteSpace($flatBatchId)) {
        return $flatBatchId
    }

    $insideBatch = $false
    foreach ($line in $TaskBlock) {
        if ($line -match "^\s+lowRiskExperienceBatch:\s*$") {
            $insideBatch = $true
            continue
        }

        if ($insideBatch -and $line -match "^\s{4}\S[^:]*:\s*") {
            break
        }

        if ($insideBatch -and $line -match "^\s+id:\s*(.+)\s*$") {
            return $Matches[1].Trim()
        }
    }

    return ""
}

function Test-RequiredPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,

        [Parameter(Mandatory = $true)]
        [string]$MissingCode,

        [Parameter(Mandatory = $true)]
        [string]$OkCode
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        Add-Finding "$MissingCode missing_path_value"
        return
    }

    if (-not (Test-Path -LiteralPath $Path)) {
        Add-Finding "$MissingCode $Path"
        return
    }

    Write-Output "$OkCode $Path"
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

function Test-ModuleRunV2Evidence {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Content
    )

    Test-ContentPattern -Content $Content -Pattern "(?mi)\bBatch range\b|^#{2,4}\s*Batch\s+\d+|\bBatch\s+\d+\s*:" -MissingCode "HARD_BLOCK_MISSING_BATCH_EVIDENCE" -OkCode "OK_BATCH_EVIDENCE_RECORDED"
    Test-ContentPattern -Content $Content -Pattern "(?mi)\bRED\b\s*:" -MissingCode "HARD_BLOCK_MISSING_RED_EVIDENCE" -OkCode "OK_RED_EVIDENCE_RECORDED"
    Test-ContentPattern -Content $Content -Pattern "(?mi)\bGREEN\b\s*:" -MissingCode "HARD_BLOCK_MISSING_GREEN_EVIDENCE" -OkCode "OK_GREEN_EVIDENCE_RECORDED"
    Test-ContentPattern -Content $Content -Pattern '(?mi)\bCommit:\s*`?[0-9a-f]{7,40}`?' -MissingCode "HARD_BLOCK_MISSING_BATCH_COMMIT_EVIDENCE" -OkCode "OK_BATCH_COMMIT_EVIDENCE_RECORDED"
    Test-ContentPattern -Content $Content -Pattern "localFullLoopGate" -MissingCode "HARD_BLOCK_MISSING_LOCAL_FULL_LOOP_GATE" -OkCode "OK_LOCAL_FULL_LOOP_GATE_RECORDED"
    Test-ContentPattern -Content $Content -Pattern "(?i)\bL8\b|blocked remainder|remain blocked|remains blocked" -MissingCode "HARD_BLOCK_MISSING_BLOCKED_REMAINDER" -OkCode "OK_BLOCKED_REMAINDER_RECORDED"
}

function Get-ValidationAnchor {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Command
    )

    if ($Command -match "prettier.*--write") {
        return "prettier.*write|scoped.*prettier.*write"
    }

    if ($Command -match "prettier.*--check") {
        return "prettier.*check|scoped.*prettier.*check"
    }

    if ($Command -match "Select-String") {
        return "anchor check|required anchor check|Select-String"
    }

    if ($Command -match "Test-GitCompletionReadiness") {
        return "Test-GitCompletionReadiness|GitCompletionReadiness"
    }

    if ($Command -match "(Test|Invoke)-ModuleRunV2") {
        $scriptName = [regex]::Match($Command, "(Test|Invoke)-ModuleRunV2[A-Za-z0-9]+").Value
        if (-not [string]::IsNullOrWhiteSpace($scriptName)) {
            return [regex]::Escape($scriptName)
        }
    }

    return [regex]::Escape(($Command -split "\s+")[0])
}

function Invoke-DocsOnlyBatchReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BatchId,

        [Parameter(Mandatory = $true)]
        [string]$Mode,

        [Parameter(Mandatory = $true)]
        [string]$ProjectStatePath,

        [Parameter(Mandatory = $true)]
        [string]$QueuePath
    )

    $batchScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2DocsOnlyBatchReadiness.ps1"
    if (-not (Test-Path -LiteralPath $batchScriptPath)) {
        Add-Finding "HARD_BLOCK_DOCS_ONLY_BATCH_READINESS_SCRIPT_MISSING $batchScriptPath"
        return
    }

    $batchArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $batchScriptPath,
        "-BatchId",
        $BatchId,
        "-Mode",
        $Mode,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $batchOutput = @(& powershell.exe @batchArgs 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $batchOutput | ForEach-Object { Write-Output $_ }
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_DOCS_ONLY_BATCH_READINESS_FAILED $BatchId"
    }
}

function Invoke-LowRiskExperienceBatchReadiness {
    param(
        [Parameter(Mandatory = $true)]
        [string]$BatchId,

        [Parameter(Mandatory = $true)]
        [string]$Mode,

        [Parameter(Mandatory = $true)]
        [string]$ProjectStatePath,

        [Parameter(Mandatory = $true)]
        [string]$QueuePath
    )

    $batchScriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2LowRiskExperienceBatchReadiness.ps1"
    if (-not (Test-Path -LiteralPath $batchScriptPath)) {
        Add-Finding "HARD_BLOCK_LOW_RISK_EXPERIENCE_BATCH_READINESS_SCRIPT_MISSING $batchScriptPath"
        return
    }

    $batchArgs = @(
        "-NoProfile",
        "-ExecutionPolicy",
        "Bypass",
        "-File",
        $batchScriptPath,
        "-BatchId",
        $BatchId,
        "-Mode",
        $Mode,
        "-ProjectStatePath",
        $ProjectStatePath,
        "-QueuePath",
        $QueuePath
    )

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        $batchOutput = @(& powershell.exe @batchArgs 2>&1)
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }

    $batchOutput | ForEach-Object { Write-Output $_ }
    if ($LASTEXITCODE -ne 0) {
        Add-Finding "HARD_BLOCK_LOW_RISK_EXPERIENCE_BATCH_READINESS_FAILED $BatchId"
    }
}

$findings = New-Object System.Collections.Generic.List[string]

Write-Section -Title "Module Run v2 Module Closeout Readiness"
Write-Output "moduleCloseoutMode: hard_block"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Module Run v2 module-closeout readiness must run inside a Git worktree."
}

$projectStateLines = @(Get-Content -Path $ProjectStatePath | Where-Object { $_ -ne "" })
$queueLines = @(Get-Content -Path $QueuePath | Where-Object { $_ -ne "" })
$matrixContent = Get-Content -Path $MatrixPath -Raw

if ([string]::IsNullOrWhiteSpace($TaskId)) {
    $TaskId = Get-CurrentTaskId -Lines $projectStateLines
}

$taskBlock = @(Get-TaskBlock -Lines $queueLines -Id $TaskId)
if ($taskBlock.Count -eq 0) {
    throw "Task not found in queue: $TaskId"
}

if ([string]::IsNullOrWhiteSpace($EvidencePath)) {
    $EvidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
}

if ([string]::IsNullOrWhiteSpace($AuditReviewPath)) {
    $AuditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
}

$executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"
if ([string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId) -and $executionProfile -eq "local_low_risk_experience_batch") {
    $LowRiskExperienceBatchId = Get-LowRiskExperienceBatchId -TaskBlock $taskBlock
}

$validationLifecyclePhases = @(Get-ValidationLifecyclePhases -Block $taskBlock)
if ($validationLifecyclePhases.Count -gt 0) {
    $validLifecyclePhases = @("pre_edit", "post_edit", "closeout", "advisory_baseline")
    foreach ($validationLifecyclePhase in $validationLifecyclePhases) {
        if ($validationLifecyclePhase -notin $validLifecyclePhases) {
            Add-Finding "HARD_BLOCK_INVALID_VALIDATION_LIFECYCLE_PHASE $validationLifecyclePhase; use post_edit for runnable validation commands, closeout for closeout gates, pre_edit for diagnostics, or advisory_baseline for non-hard baseline commands"
        }
    }
}

$validationLifecycleCommands = @(Get-ValidationLifecycleCommands -Block $taskBlock -IncludedPhases @("post_edit", "closeout"))
$validationCommands = @()
if ($validationLifecycleCommands.Count -gt 0) {
    $validationCommands = $validationLifecycleCommands
    Write-Output "validationLifecycleMode: phase_filtered"
    Write-Output "validationLifecycleIncludedPhases: post_edit,closeout"
} else {
    $validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
    Write-Output "validationLifecycleMode: legacy_validationCommands"
}
$moduleRunVersion = Get-ScalarValue -Block $taskBlock -Key "moduleRunVersion"

Write-Output "taskId: $TaskId"
Write-Output "moduleRunVersion: $moduleRunVersion"

Write-Section -Title "Module Run v2 Anchors"
Test-ContentPattern -Content $matrixContent -Pattern "moduleRunVersion:\s*2" -MissingCode "HARD_BLOCK_MISSING_ANCHOR moduleRunVersion: 2" -OkCode "moduleRunVersion: 2"
Test-ContentPattern -Content $matrixContent -Pattern "threadRolloverGate\s*:" -MissingCode "HARD_BLOCK_MISSING_ANCHOR threadRolloverGate" -OkCode "threadRolloverGate: present"
Test-ContentPattern -Content $matrixContent -Pattern "automationHandoffPolicy\s*:" -MissingCode "HARD_BLOCK_MISSING_ANCHOR automationHandoffPolicy" -OkCode "automationHandoffPolicy: present"
Test-ContentPattern -Content $matrixContent -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_MISSING_ANCHOR Cost Calibration Gate remains blocked" -OkCode "Cost Calibration Gate remains blocked"

Write-Section -Title "Evidence And Audit"
Test-RequiredPath -Path $EvidencePath -MissingCode "HARD_BLOCK_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH"
Test-RequiredPath -Path $AuditReviewPath -MissingCode "HARD_BLOCK_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH"

$evidenceContent = ""
$auditContent = ""
if (Test-Path -LiteralPath $EvidencePath) {
    $evidenceContent = Get-Content -LiteralPath $EvidencePath -Raw
}

if (Test-Path -LiteralPath $AuditReviewPath) {
    $auditContent = Get-Content -LiteralPath $AuditReviewPath -Raw
}

if (-not [string]::IsNullOrWhiteSpace($evidenceContent)) {
    $evidenceResultClass = if (Get-Command -Name Get-ModuleRunV2EvidenceResultClass -ErrorAction SilentlyContinue) {
        Get-ModuleRunV2EvidenceResultClass -Content $evidenceContent
    } else {
        if ($evidenceContent -match "(?m)result:\s*pass|Passed:") { "pass" } elseif ($evidenceContent -match "(?im)result:\s*blocked|blocked_validation_failure") { "blocked" } else { "unknown" }
    }
    $blockedEvidenceCloseoutApproved = $evidenceResultClass -eq "blocked" -and $auditContent -match "APPROVE_BLOCKED_EVIDENCE_CLOSEOUT"
    Write-Output "evidenceResultClass: $evidenceResultClass"

    if ($evidenceResultClass -eq "pass") {
        Write-Output "OK_EVIDENCE_PASS_RECORDED"
    } elseif ($blockedEvidenceCloseoutApproved) {
        Write-Output "OK_BLOCKED_EVIDENCE_CLOSEOUT_APPROVED"
        Test-ContentPattern -Content $evidenceContent -Pattern "(?is)Runtime Failure Summary|Blocking Findings|failed|failure" -MissingCode "HARD_BLOCK_BLOCKED_EVIDENCE_MISSING_FAILURE_SUMMARY" -OkCode "OK_BLOCKED_FAILURE_SUMMARY_RECORDED"
        Test-ContentPattern -Content $evidenceContent -Pattern "(?is)nextModuleRunCandidate|Recommended smallest follow-up repair task|Recommended smallest follow-up task" -MissingCode "HARD_BLOCK_BLOCKED_EVIDENCE_MISSING_NEXT_REPAIR" -OkCode "OK_BLOCKED_NEXT_REPAIR_RECORDED"
    } else {
        Add-Finding "HARD_BLOCK_EVIDENCE_NOT_PASS"
    }
    Test-ContentPattern -Content $evidenceContent -Pattern "Cost Calibration Gate remains blocked" -MissingCode "HARD_BLOCK_MISSING_COST_GATE_STATEMENT" -OkCode "OK_COST_GATE_RECORDED"

    foreach ($validationCommand in $validationCommands) {
        if ([string]::IsNullOrWhiteSpace($validationCommand)) {
            continue
        }

        $commandAnchor = Get-ValidationAnchor -Command $validationCommand
        if ($evidenceContent -match $commandAnchor) {
            Write-Output "OK_VALIDATION_RECORDED $commandAnchor"
        } else {
            Add-Finding "HARD_BLOCK_VALIDATION_NOT_RECORDED $validationCommand"
        }
    }

    if ($evidenceContent -match "threadRolloverGate|thread rollover|Thread Rollover") {
        Write-Output "OK_THREAD_ROLLOVER_DECISION"
    } elseif ($AllowMissingThreadRolloverDecision) {
        Write-Output "WARN_THREAD_ROLLOVER_DECISION_ALLOWED_MISSING"
    } else {
        Add-Finding "HARD_BLOCK_MISSING_THREAD_ROLLOVER_DECISION"
    }

    if ($evidenceContent -match "nextModuleRunCandidate|next Module Run|Next Module Run") {
        Write-Output "OK_NEXT_MODULE_RUN_CANDIDATE"
    } elseif ($AllowMissingNextModuleRunCandidate) {
        Write-Output "WARN_NEXT_MODULE_RUN_CANDIDATE_ALLOWED_MISSING"
    } else {
        Add-Finding "HARD_BLOCK_MISSING_NEXT_MODULE_RUN_CANDIDATE"
    }

    if ($moduleRunVersion -eq "2") {
        Write-Section -Title "Module Run v2 Strict Evidence"
        if ($evidenceContent -match "(?mi)^\s*(?:-\s*)?GREEN\s*:\s*pending\b") {
            Add-Finding "HARD_BLOCK_PENDING_GREEN_EVIDENCE"
        }
        if ($evidenceContent -match "(?mi)^\s*(?:-\s*)?Commit\s*:\s*pending\b") {
            Add-Finding "HARD_BLOCK_PENDING_COMMIT_EVIDENCE"
        }
        Test-ModuleRunV2Evidence -Content $evidenceContent
    }
}

if (-not [string]::IsNullOrWhiteSpace($auditContent)) {
    Test-ContentPattern -Content $auditContent -Pattern "APPROVE|No blocking findings" -MissingCode "HARD_BLOCK_AUDIT_NOT_APPROVED" -OkCode "OK_AUDIT_APPROVED"
}

if (-not [string]::IsNullOrWhiteSpace($DocsOnlyBatchId)) {
    Write-Section -Title "Docs-Only Batch Readiness"
    Invoke-DocsOnlyBatchReadiness -BatchId $DocsOnlyBatchId -Mode $DocsOnlyBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}
if (-not [string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId)) {
    Write-Section -Title "Low-Risk Experience Batch Readiness"
    Invoke-LowRiskExperienceBatchReadiness -BatchId $LowRiskExperienceBatchId -Mode $LowRiskExperienceBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 module-closeout readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

Write-Output "module-closeout readiness passed"
