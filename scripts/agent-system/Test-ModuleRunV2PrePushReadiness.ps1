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
    [switch]$SkipRemoteAheadCheck,

    [Parameter(Mandatory = $false)]
    [ValidateSet("standard", "transition_only")]
    [string]$P1TransitionScopeMode = "standard",

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

function Get-ProjectScalar {
    param(
        [Parameter(Mandatory = $true)]
        [string[]]$Lines,

        [Parameter(Mandatory = $true)]
        [string]$Key
    )

    foreach ($line in $Lines) {
        if ($line -match "^\s+$([regex]::Escape($Key)):\s*(.+)\s*$") {
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

function Test-GitAncestor {
    param(
        [Parameter(Mandatory = $true)][string]$AncestorSha,
        [Parameter(Mandatory = $true)][string]$DescendantSha
    )

    if ([string]::IsNullOrWhiteSpace($AncestorSha) -or [string]::IsNullOrWhiteSpace($DescendantSha)) {
        return $false
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        & git cat-file -e "$AncestorSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git cat-file -e "$DescendantSha^{commit}" 2>$null
        if ($LASTEXITCODE -ne 0) {
            return $false
        }

        & git merge-base --is-ancestor $AncestorSha $DescendantSha 2>$null
        return $LASTEXITCODE -eq 0
    } finally {
        $ErrorActionPreference = $previousErrorActionPreference
    }
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

Write-Section -Title "Module Run v2 Pre-Push Readiness"
Write-Output "prePushMode: hard_block"

foreach ($requiredPath in @($ProjectStatePath, $QueuePath, $MatrixPath)) {
    if (-not (Test-Path -LiteralPath $requiredPath)) {
        throw "Missing required file: $requiredPath"
    }
}

$insideWorkTree = (& git rev-parse --is-inside-work-tree) -join ""
if ($LASTEXITCODE -ne 0 -or $insideWorkTree.Trim() -ne "true") {
    throw "Module Run v2 pre-push readiness must run inside a Git worktree."
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

$taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
$executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"

if ($taskStatus -eq "claimed") {
    $claimTransitionScopeTaskId = Get-ScalarValue -Block $taskBlock -Key "claimTransitionScopeTaskId"
    if (-not [string]::IsNullOrWhiteSpace($claimTransitionScopeTaskId)) {
        $programCurrentTaskId = Get-ProjectScalar -Lines $projectStateLines -Key "currentTaskId"
        $programLastClosedTaskId = Get-ProjectScalar -Lines $projectStateLines -Key "lastClosedTaskId"
        $claimTransitionScopeTaskBlock = @(Get-TaskBlock -Lines $queueLines -Id $claimTransitionScopeTaskId)
        if ($TaskId -ne $programCurrentTaskId -or $claimTransitionScopeTaskId -ne $programLastClosedTaskId) {
            Add-Finding "HARD_BLOCK_CLAIM_TRANSITION_PROGRAM_POINTER_MISMATCH $TaskId $claimTransitionScopeTaskId"
        } elseif ($claimTransitionScopeTaskBlock.Count -eq 0 -or (Get-ScalarValue -Block $claimTransitionScopeTaskBlock -Key "status") -ne "closed") {
            Add-Finding "HARD_BLOCK_CLAIM_TRANSITION_SCOPE_TASK_INVALID $claimTransitionScopeTaskId"
        } else {
            Write-Output "claimTransitionTaskId: $TaskId"
            Write-Output "claimTransitionScopeTaskId: $claimTransitionScopeTaskId"
            $TaskId = $claimTransitionScopeTaskId
            $taskBlock = $claimTransitionScopeTaskBlock
            $taskStatus = Get-ScalarValue -Block $taskBlock -Key "status"
            $executionProfile = Get-ScalarValue -Block $taskBlock -Key "executionProfile"
        }
    }
}

if ([string]::IsNullOrWhiteSpace($EvidencePath)) {
    $EvidencePath = Get-ScalarValue -Block $taskBlock -Key "evidencePath"
}

if ([string]::IsNullOrWhiteSpace($AuditReviewPath)) {
    $AuditReviewPath = Get-ScalarValue -Block $taskBlock -Key "auditReviewPath"
}

if ([string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId) -and $executionProfile -eq "local_low_risk_experience_batch") {
    $LowRiskExperienceBatchId = Get-LowRiskExperienceBatchId -TaskBlock $taskBlock
}

Write-Output "taskId: $TaskId"

Write-Section -Title "Module Run v2 Anchors"
if ($matrixContent -match "moduleRunVersion:\s*2") {
    Write-Output "moduleRunVersion: 2"
} else {
    Add-Finding "HARD_BLOCK_MISSING_ANCHOR moduleRunVersion: 2"
}

if ($matrixContent -match "Cost Calibration Gate remains blocked") {
    Write-Output "Cost Calibration Gate remains blocked"
} else {
    Add-Finding "HARD_BLOCK_MISSING_ANCHOR Cost Calibration Gate remains blocked"
}

Write-Section -Title "Git Readiness"
$previousErrorActionPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
    $gitReadinessOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path -Path $PSScriptRoot -ChildPath "Test-GitCompletionReadiness.ps1") -BaseBranch master 2>&1)
} finally {
    $ErrorActionPreference = $previousErrorActionPreference
}
if ($LASTEXITCODE -ne 0) {
    Add-Finding "HARD_BLOCK_GIT_READINESS_FAILED"
} else {
    Write-Output "OK_GIT_COMPLETION_READINESS"
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
if ([string]::IsNullOrWhiteSpace($currentBranch)) {
    Add-Finding "HARD_BLOCK_DETACHED_HEAD"
} else {
    Write-Output "branch: $currentBranch"
}

if (-not $SkipRemoteAheadCheck -and -not [string]::IsNullOrWhiteSpace($currentBranch)) {
    $upstreamOutput = @(& git for-each-ref "--format=%(upstream:short)" "refs/heads/$currentBranch")
    $upstream = ($upstreamOutput -join "").Trim()
    if ([string]::IsNullOrWhiteSpace($upstream)) {
        Write-Output "remoteAheadCheck: skipped_no_upstream"
    } else {
        $aheadBehind = ((& git rev-list --left-right --count "$upstream...HEAD") -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($aheadBehind)) {
            Add-Finding "HARD_BLOCK_REMOTE_AHEAD_CHECK_FAILED $upstream"
        } else {
            $parts = $aheadBehind -split "\s+"
            $remoteAheadCount = [int]$parts[0]
            $localAheadCount = [int]$parts[1]
            Write-Output "remoteAhead: $remoteAheadCount"
            Write-Output "localAhead: $localAheadCount"
            if ($remoteAheadCount -gt 0) {
                Add-Finding "HARD_BLOCK_REMOTE_AHEAD $upstream remoteAhead=$remoteAheadCount"
            }
        }
    }
}

$masterSha = ((& git rev-parse master) -join "").Trim()
$originMasterSha = ((& git rev-parse origin/master) -join "").Trim()
$headSha = ((& git rev-parse HEAD) -join "").Trim()
$stateMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownMasterSha"
$stateOriginMasterSha = Get-ProjectScalar -Lines $projectStateLines -Key "lastKnownOriginMasterSha"
$canUseCloseoutShaAncestry = $taskStatus -in @("done", "closed", "ready_for_closeout")
$isP1TransitionScopeMode = $P1TransitionScopeMode -eq "transition_only"
$canUseP1TransitionMasterAncestry = $isP1TransitionScopeMode `
    -and $taskStatus -eq "in_progress" `
    -and $currentBranch -eq "master" `
    -and $headSha -eq $masterSha `
    -and -not [string]::IsNullOrWhiteSpace($originMasterSha) `
    -and -not [string]::IsNullOrWhiteSpace($stateMasterSha) `
    -and $stateMasterSha -eq $stateOriginMasterSha `
    -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $originMasterSha) `
    -and $originMasterSha -ne $masterSha `
    -and (Test-GitAncestor -AncestorSha $originMasterSha -DescendantSha $masterSha)

Write-Output "master: $masterSha"
Write-Output "originMaster: $originMasterSha"
Write-Output "stateMaster: $stateMasterSha"
Write-Output "stateOriginMaster: $stateOriginMasterSha"
Write-Output "p1TransitionScopeMode: $P1TransitionScopeMode"

if ($isP1TransitionScopeMode -and -not $canUseP1TransitionMasterAncestry) {
    Add-Finding "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID"
}

if ($stateMasterSha -ne $masterSha) {
    if ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateMasterSha -DescendantSha $masterSha)) {
        Write-Output "OK_PRE_PUSH_STATE_SHA_ANCESTOR master"
    } elseif ($canUseP1TransitionMasterAncestry) {
        Write-Output "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
    } else {
        Add-Finding "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master"
    }
}

if ($stateOriginMasterSha -ne $originMasterSha) {
    if ($canUseCloseoutShaAncestry -and (Test-GitAncestor -AncestorSha $stateOriginMasterSha -DescendantSha $originMasterSha)) {
        Write-Output "OK_PRE_PUSH_STATE_SHA_ANCESTOR origin/master"
    } elseif ($canUseP1TransitionMasterAncestry) {
        Write-Output "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
    } else {
        Add-Finding "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT origin/master"
    }
}

Write-Section -Title "Evidence And Audit"
Test-RequiredPath -Path $EvidencePath -MissingCode "HARD_BLOCK_MISSING_EVIDENCE" -OkCode "OK_EVIDENCE_PATH"
Test-RequiredPath -Path $AuditReviewPath -MissingCode "HARD_BLOCK_MISSING_AUDIT" -OkCode "OK_AUDIT_PATH"

if (-not [string]::IsNullOrWhiteSpace($DocsOnlyBatchId)) {
    Write-Section -Title "Docs-Only Batch Readiness"
    Invoke-DocsOnlyBatchReadiness -BatchId $DocsOnlyBatchId -Mode $DocsOnlyBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}
if (-not [string]::IsNullOrWhiteSpace($LowRiskExperienceBatchId)) {
    Write-Section -Title "Low-Risk Experience Batch Readiness"
    Invoke-LowRiskExperienceBatchReadiness -BatchId $LowRiskExperienceBatchId -Mode $LowRiskExperienceBatchMode -ProjectStatePath $ProjectStatePath -QueuePath $QueuePath
}

Write-Section -Title "Closeout Noise Policy"
Write-Output "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Write-Output "persistentPostMergeEvidenceRequiredWhen: missing_pre_merge_validation_or_state_sha_handoff_repair_or_failed_closeout_or_task_policy_requires"
Write-Output "finalHandoffShaPolicy: final_handoff_or_project_state"
Write-Output "stateShaPolicy: accepted_ancestor_checkpoint"

Write-Section -Title "Result"
if ($findings.Count -gt 0) {
    throw "Module Run v2 pre-push readiness failed with $($findings.Count) finding(s): $($findings -join '; ')"
}

Write-Output "pre-push readiness passed"
