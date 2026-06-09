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
    [switch]$AllowMissingNextModuleRunCandidate
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

    if ($Command -match "Test-ModuleRunV2") {
        $scriptName = [regex]::Match($Command, "Test-ModuleRunV2[A-Za-z0-9]+").Value
        if (-not [string]::IsNullOrWhiteSpace($scriptName)) {
            return [regex]::Escape($scriptName)
        }
    }

    return [regex]::Escape(($Command -split "\s+")[0])
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

$validationCommands = @(Get-ListValues -Block $taskBlock -Key "validationCommands")
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
    Test-ContentPattern -Content $evidenceContent -Pattern "(?m)result:\s*pass|Passed:" -MissingCode "HARD_BLOCK_EVIDENCE_NOT_PASS" -OkCode "OK_EVIDENCE_PASS_RECORDED"
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
        Test-ModuleRunV2Evidence -Content $evidenceContent
    }
}

if (-not [string]::IsNullOrWhiteSpace($auditContent)) {
    Test-ContentPattern -Content $auditContent -Pattern "APPROVE|No blocking findings" -MissingCode "HARD_BLOCK_AUDIT_NOT_APPROVED" -OkCode "OK_AUDIT_APPROVED"
}

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 module-closeout readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

Write-Output "module-closeout readiness passed"
