$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)]
        [AllowEmptyCollection()]
        [AllowEmptyString()]
        [string[]]$Output,

        [Parameter(Mandatory = $true)]
        [string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern`nActual: $($Output -join '`n')"
    }
}

function Invoke-ExpectFailure {
    param(
        [Parameter(Mandatory = $true)]
        [scriptblock]$Command,

        [Parameter(Mandatory = $true)]
        [string]$ExpectedPattern
    )

    $output = @()
    $failed = $false
    try {
        $output = @(& $Command 2>&1)
    } catch {
        $failed = $true
        $output += $_.Exception.Message
    }

    if (-not $failed -and $LASTEXITCODE -eq 0) {
        throw "Expected command to fail with pattern: $ExpectedPattern"
    }

    Assert-Contains -Output $output -Pattern $ExpectedPattern
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2PrePushReadiness.ps1"
$p1GuardPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-P1RemediationSerialProgram.ps1"
$phase11ScopeCorrectionGuardText = Get-Content -LiteralPath $scriptPath -Raw -Encoding UTF8
$phase11ScopeCorrectionPatterns = @(
    "p1F0115Phase11ScopeCorrectionBaseSha",
    "p1F0115Phase11ScopeCorrectionAuthorizationPath",
    "p1F0115Phase11ScopeCorrectionFiles",
    "Test-P1F0115Phase11TransitionTopology",
    "p1F0115Phase11TransitionTopology: exact_one_parent",
    "582c156afb0cdde8a3daa99785fda8540b56fe27"
)
$missingPhase11ScopeCorrectionPatterns = @($phase11ScopeCorrectionPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingPhase11ScopeCorrectionPatterns.Count -gt 0) {
    throw "Module pre-push is RED for the F-0115 phase-11 transition contract: $($missingPhase11ScopeCorrectionPatterns -join ', ')"
}
$modulePrecommitHotfixPatterns = @(
    "p1F0115ModulePrecommitHotfixBaseSha",
    "p1F0115ModulePrecommitHotfixAuthorizationPath",
    "p1F0115ModulePrecommitHotfixFiles",
    "Test-P1F0115ModulePrecommitHotfixTransitionTopology",
    "p1F0115ModulePrecommitHotfixTransitionTopology: exact_one_parent",
    "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
)
$missingModulePrecommitHotfixPatterns = @($modulePrecommitHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingModulePrecommitHotfixPatterns.Count -gt 0) {
    throw "Module pre-push is RED for the F-0115 Module hotfix transition contract: $($missingModulePrecommitHotfixPatterns -join ', ')"
}
$f0116DesignPathHotfixPatterns = @(
    "p1F0116DesignPathGuardHotfixBaseSha",
    "p1F0116DesignPathGuardHotfixAuthorizationPath",
    "p1F0116DesignPathGuardHotfixFiles",
    "Test-P1F0116DesignPathGuardHotfixTransitionTopology",
    "p1F0116DesignPathGuardHotfixTransitionTopology: exact_one_parent",
    "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
)
$missingF0116DesignPathHotfixPatterns = @($f0116DesignPathHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116DesignPathHotfixPatterns.Count -gt 0) {
    throw "Module pre-push is RED for the F-0116 designPath hotfix transition contract: $($missingF0116DesignPathHotfixPatterns -join ', ')"
}
$f0116ScopeCorrectionHotfixPatterns = @(
    "p1F0116ScopeCorrectionGuardHotfixBaseSha",
    "p1F0116ScopeCorrectionGuardHotfixAuthorizationPath",
    "p1F0116ScopeCorrectionGuardHotfixFiles",
    "Test-P1F0116ScopeCorrectionGuardHotfixTransitionTopology",
    "p1F0116ScopeCorrectionGuardHotfixTransitionTopology: exact_one_parent",
    "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
)
$missingF0116ScopeCorrectionHotfixPatterns = @($f0116ScopeCorrectionHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0116ScopeCorrectionHotfixPatterns.Count -gt 0) {
    throw "Module pre-push is RED for the F-0116 scope-correction hotfix transition contract: $($missingF0116ScopeCorrectionHotfixPatterns -join ', ')"
}
$f0117SpecApprovalHotfixPatterns = @(
    "p1F0117SpecApprovalTransitionHotfixBaseSha",
    "p1F0117SpecApprovalTransitionHotfixAuthorizationPath",
    "p1F0117SpecApprovalTransitionHotfixFiles",
    "Test-P1F0117SpecApprovalTransitionHotfixTransitionTopology",
    "p1F0117SpecApprovalTransitionHotfixTransitionTopology: exact_one_parent",
    "366f17446e9fc75a777ebfe5977ad72db1062eb7",
    "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_REQUIRES_TRANSITION_ONLY"
)
$missingF0117SpecApprovalHotfixPatterns = @($f0117SpecApprovalHotfixPatterns | Where-Object {
    $phase11ScopeCorrectionGuardText -notmatch [regex]::Escape($_)
})
if ($missingF0117SpecApprovalHotfixPatterns.Count -gt 0) {
    throw "Module pre-push is RED for the F-0117 spec-approval transition contract: $($missingF0117SpecApprovalHotfixPatterns -join ', ')"
}

if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing pre-push readiness script: $scriptPath"
}

$taskId = "module-run-v2-pre-push-readiness-smoke"

$existingEvidencePath = "docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"
$existingAuditPath = "docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-pre-commit-scan-hardening.md"
$baselineFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-pre-push-baseline-" + [guid]::NewGuid().ToString("N"))
$baselineProjectStatePath = Join-Path -Path $baselineFixtureRoot -ChildPath "project-state.yaml"
$baselineQueuePath = Join-Path -Path $baselineFixtureRoot -ChildPath "task-queue.yaml"
$currentMasterSha = ((& git rev-parse master) -join "").Trim()
$currentOriginMasterSha = ((& git rev-parse origin/master) -join "").Trim()
New-Item -ItemType Directory -Force -Path $baselineFixtureRoot | Out-Null

@"
schemaVersion: 1
project:
  name: tiku
repository:
  lastKnownMasterSha: $currentMasterSha
  lastKnownOriginMasterSha: $currentOriginMasterSha
currentTask:
  id: $taskId
  status: done
"@ | Set-Content -LiteralPath $baselineProjectStatePath -Encoding UTF8

@"
schemaVersion: 1
tasks:
  - id: $taskId
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    status: done
"@ | Set-Content -LiteralPath $baselineQueuePath -Encoding UTF8

$passOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck
)
Assert-Contains -Output $passOutput -Pattern "Module Run v2 Pre-Push Readiness"
Assert-Contains -Output $passOutput -Pattern "prePushMode: hard_block"
Assert-Contains -Output $passOutput -Pattern "OK_EVIDENCE_PATH"
Assert-Contains -Output $passOutput -Pattern "OK_AUDIT_PATH"
Assert-Contains -Output $passOutput -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Assert-Contains -Output $passOutput -Pattern "finalHandoffShaPolicy: final_handoff_or_project_state"
Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"

$batchShadowOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck `
        -DocsOnlyBatchId "missing-docs-only-batch-smoke" `
        -DocsOnlyBatchMode shadow
)
Assert-Contains -Output $batchShadowOutput -Pattern "Docs-Only Batch Readiness"
Assert-Contains -Output $batchShadowOutput -Pattern "docsOnlyBatchShadowDecision: would_block"
Assert-Contains -Output $batchShadowOutput -Pattern "pre-push readiness passed"

$lowRiskBatchShadowOutput = @(
    & $scriptPath `
        -TaskId $taskId `
        -ProjectStatePath $baselineProjectStatePath `
        -QueuePath $baselineQueuePath `
        -EvidencePath $existingEvidencePath `
        -AuditReviewPath $existingAuditPath `
        -SkipRemoteAheadCheck `
        -LowRiskExperienceBatchId "missing-low-risk-experience-batch-smoke" `
        -LowRiskExperienceBatchMode shadow
)
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "Low-Risk Experience Batch Readiness"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "lowRiskExperienceBatchShadowDecision: would_block"
Assert-Contains -Output $lowRiskBatchShadowOutput -Pattern "pre-push readiness passed"

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -EvidencePath "docs/05-execution-logs/evidence/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_MISSING_AUDIT" -Command {
    & $scriptPath -TaskId $taskId -ProjectStatePath $baselineProjectStatePath -QueuePath $baselineQueuePath -AuditReviewPath "docs/05-execution-logs/audits-reviews/missing-pre-push-fixture.md" -SkipRemoteAheadCheck
}

if (Test-Path -LiteralPath $baselineFixtureRoot) {
    Remove-Item -LiteralPath $baselineFixtureRoot -Recurse -Force
}

$transitionTaskId = "p1-transition-ancestor-checkpoint-smoke"
$transitionFixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-p1-transition-pre-push-" + [guid]::NewGuid().ToString("N"))
$transitionRepositoryRoot = Join-Path -Path $transitionFixtureRoot -ChildPath "repository"
$transitionRemoteRoot = Join-Path -Path $transitionFixtureRoot -ChildPath "origin.git"
$transitionProjectStatePath = Join-Path -Path $transitionFixtureRoot -ChildPath "project-state.yaml"
$transitionQueuePath = Join-Path -Path $transitionFixtureRoot -ChildPath "task-queue.yaml"
$matrixPath = (Resolve-Path (Join-Path $PSScriptRoot "..\..\docs\04-agent-system\state\advanced-edition-domain-module-run-matrix.yaml")).Path
$absoluteEvidencePath = (Resolve-Path $existingEvidencePath).Path
$absoluteAuditPath = (Resolve-Path $existingAuditPath).Path

New-Item -ItemType Directory -Force -Path $transitionRepositoryRoot | Out-Null
& git -C $transitionRepositoryRoot init -b master *> $null
& git -C $transitionRepositoryRoot config user.name "P1 Transition Module Smoke"
& git -C $transitionRepositoryRoot config user.email "p1-transition-module-smoke@example.invalid"
& git -C $transitionRepositoryRoot config core.autocrlf false
Set-Content -LiteralPath (Join-Path $transitionRepositoryRoot "checkpoint.txt") -Value "parent checkpoint" -Encoding UTF8
& git -C $transitionRepositoryRoot add checkpoint.txt
& git -C $transitionRepositoryRoot commit -m "parent checkpoint" *> $null
$transitionStateCheckpointSha = ((& git -C $transitionRepositoryRoot rev-parse HEAD) -join "").Trim()
Set-Content -LiteralPath (Join-Path $transitionRepositoryRoot "origin.txt") -Value "origin baseline after state checkpoint" -Encoding UTF8
& git -C $transitionRepositoryRoot add origin.txt
& git -C $transitionRepositoryRoot commit -m "advance origin beyond state checkpoint" *> $null
& git init --bare $transitionRemoteRoot *> $null
& git -C $transitionRepositoryRoot remote add origin $transitionRemoteRoot
& git -C $transitionRepositoryRoot push --quiet -u origin master 2>$null
$transitionOriginSha = ((& git -C $transitionRepositoryRoot rev-parse origin/master) -join "").Trim()
Set-Content -LiteralPath (Join-Path $transitionRepositoryRoot "transition.txt") -Value "governance-only transition" -Encoding UTF8
& git -C $transitionRepositoryRoot add transition.txt
& git -C $transitionRepositoryRoot commit -m "freeze successor scope" *> $null

@"
schemaVersion: 1
project:
  name: tiku
repository:
  lastKnownMasterSha: $transitionStateCheckpointSha
  lastKnownOriginMasterSha: $transitionStateCheckpointSha
currentTask:
  id: $transitionTaskId
  status: in_progress
"@ | Set-Content -LiteralPath $transitionProjectStatePath -Encoding UTF8

@"
schemaVersion: 1
tasks:
  - id: $transitionTaskId
    evidencePath: $absoluteEvidencePath
    auditReviewPath: $absoluteAuditPath
    status: in_progress
"@ | Set-Content -LiteralPath $transitionQueuePath -Encoding UTF8

Push-Location $transitionRepositoryRoot
try {
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master" -Command {
        & $scriptPath -TaskId $transitionTaskId -ProjectStatePath $transitionProjectStatePath -QueuePath $transitionQueuePath -MatrixPath $matrixPath -EvidencePath $absoluteEvidencePath -AuditReviewPath $absoluteAuditPath -SkipRemoteAheadCheck
    }

    $transitionAncestorOutput = @(
        & $scriptPath -TaskId $transitionTaskId -ProjectStatePath $transitionProjectStatePath -QueuePath $transitionQueuePath -MatrixPath $matrixPath -EvidencePath $absoluteEvidencePath -AuditReviewPath $absoluteAuditPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
    )
    Assert-Contains -Output $transitionAncestorOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
    Assert-Contains -Output $transitionAncestorOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
    Assert-Contains -Output $transitionAncestorOutput -Pattern "pre-push readiness passed"

    (Get-Content -LiteralPath $transitionProjectStatePath -Raw).Replace("lastKnownOriginMasterSha: $transitionStateCheckpointSha", "lastKnownOriginMasterSha: not-the-origin-checkpoint") | Set-Content -LiteralPath $transitionProjectStatePath -Encoding UTF8
    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
        & $scriptPath -TaskId $transitionTaskId -ProjectStatePath $transitionProjectStatePath -QueuePath $transitionQueuePath -MatrixPath $matrixPath -EvidencePath $absoluteEvidencePath -AuditReviewPath $absoluteAuditPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
    }
} finally {
    Pop-Location
    if (Test-Path -LiteralPath $transitionFixtureRoot) {
        Remove-Item -LiteralPath $transitionFixtureRoot -Recurse -Force
    }
}

$fixtureTaskId = "module-run-v2-pre-push-post-push-ancestor-smoke"
$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath "tiku-module-run-v2-pre-push-smoke"
$fixtureProjectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
$fixtureQueuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
$ancestorSha = ((& git rev-parse origin/master~1) -join "").Trim()

if ([string]::IsNullOrWhiteSpace($ancestorSha)) {
    throw "Missing master ancestor fixture SHA"
}

New-Item -ItemType Directory -Force -Path $fixtureRoot | Out-Null

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

@"
tasks:
  - id: $fixtureTaskId
    evidencePath: $existingEvidencePath
    auditReviewPath: $existingAuditPath
    status: done
"@ | Set-Content -Path $fixtureQueuePath -Encoding UTF8

$ancestorOutput = @(& $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck)
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR master"
Assert-Contains -Output $ancestorOutput -Pattern "OK_PRE_PUSH_STATE_SHA_ANCESTOR origin/master"
Assert-Contains -Output $ancestorOutput -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
Assert-Contains -Output $ancestorOutput -Pattern "pre-push readiness passed"

@"
schemaVersion: 1
project:
  name: tiku
  currentPhase: smoke
repository:
  lastKnownMasterSha: not-a-valid-ancestor
  lastKnownOriginMasterSha: not-a-valid-ancestor
currentTask:
  id: $fixtureTaskId
  status: done
"@ | Set-Content -Path $fixtureProjectStatePath -Encoding UTF8

Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT" -Command {
    & $scriptPath -TaskId $fixtureTaskId -ProjectStatePath $fixtureProjectStatePath -QueuePath $fixtureQueuePath -SkipRemoteAheadCheck
}

$f0115PrePushBaseSha = "6bde2f2aec3d71fa0ce138b26f64243861cace6f"
$f0115PrePushParentTaskId = "p1-remediation-rc-02-employee-creation-atomicity-2026-07-16"
$f0115PrePushQueuePath = "docs/04-agent-system/state/task-queue.yaml"
$f0115PrePushProjectStatePath = "docs/04-agent-system/state/project-state.yaml"
$f0115PrePushMatrixPath = "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
$f0115PrePushAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md"
$f0115PrePushEvidencePath = "docs/05-execution-logs/evidence/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$f0115PrePushAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0115-scope-correction-hotfix.md"
$f0115PrePushFiles = @(
    $f0115PrePushQueuePath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $f0115PrePushAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix.md",
    $f0115PrePushEvidencePath,
    $f0115PrePushAuditPath
)
$f0115PrePushSourceRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$f0115PrePushFixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0115-pre-push-" + [guid]::NewGuid().ToString("N"))
$f0115PrePushUtf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

function Set-F0115PrePushFixtureFile {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $fullPath = Join-Path $Root ($Path -replace "/", "\")
    $parentPath = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $parentPath)) {
        New-Item -ItemType Directory -Path $parentPath -Force | Out-Null
    }
    [System.IO.File]::WriteAllText($fullPath, ($Content -replace "`r`n?", "`n"), $f0115PrePushUtf8WithoutBom)
}

function Test-F0115PrePushReviewFailure {
    param(
        [Parameter(Mandatory = $true)][string]$ProjectStatePath,
        [Parameter(Mandatory = $true)][string]$QueuePath,
        [Parameter(Mandatory = $true)][string]$MatrixPath,
        [Parameter(Mandatory = $true)][string]$EvidencePath,
        [Parameter(Mandatory = $true)][string]$AuditReviewPath,
        [Parameter(Mandatory = $true)][string]$ExpectedPattern,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][string[]]$ForbiddenPatterns,
        [Parameter(Mandatory = $true)][string]$Label,
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.Generic.List[string]]$RedFindings
    )

    $capturedOutput = [System.Collections.Generic.List[string]]::new()
    $failed = $false
    try {
        & $scriptPath `
            -TaskId $f0115PrePushParentTaskId `
            -ProjectStatePath $ProjectStatePath `
            -QueuePath $QueuePath `
            -MatrixPath $MatrixPath `
            -EvidencePath $EvidencePath `
            -AuditReviewPath $AuditReviewPath `
            -SkipRemoteAheadCheck `
            -P1TransitionScopeMode transition_only 2>&1 | ForEach-Object {
                $capturedOutput.Add($_.ToString())
            }
    } catch {
        $failed = $true
        $capturedOutput.Add($_.Exception.Message)
    }

    $outputText = $capturedOutput -join "`n"
    if (-not $failed -and $LASTEXITCODE -eq 0) {
        $RedFindings.Add("$Label unexpectedly passed; expected $ExpectedPattern")
        return
    }
    if ($outputText -notmatch $ExpectedPattern) {
        $RedFindings.Add("$Label failed without expected marker $ExpectedPattern. Output: $outputText")
    }
    foreach ($forbiddenPattern in $ForbiddenPatterns) {
        if ($outputText -match $forbiddenPattern) {
            $RedFindings.Add("$Label leaked forbidden success marker $forbiddenPattern")
        }
    }
}

$f0115PrePushReviewerRedFindings = [System.Collections.Generic.List[string]]::new()

try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $f0115PrePushFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0115 Module pre-push fixture." }
    & git -C $f0115PrePushFixtureRoot config user.name "Module F-0115 Pre-Push Smoke"
    & git -C $f0115PrePushFixtureRoot config user.email "module-f0115-pre-push-smoke@example.invalid"
    & git -C $f0115PrePushFixtureRoot config core.autocrlf false
    & git -C $f0115PrePushFixtureRoot config core.longpaths true
    & git -C $f0115PrePushFixtureRoot sparse-checkout init --no-cone
    $f0115PrePushSparseFiles = @(
        $f0115PrePushFiles + @($f0115PrePushProjectStatePath, $f0115PrePushMatrixPath)
    )
    & git -C $f0115PrePushFixtureRoot sparse-checkout set --no-cone -- $f0115PrePushSparseFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to configure F-0115 Module pre-push sparse fixture." }
    & git -C $f0115PrePushFixtureRoot switch --quiet -C master $f0115PrePushBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the fixed F-0115 Module pre-push base." }
    & git -C $f0115PrePushFixtureRoot update-ref refs/remotes/origin/master $f0115PrePushBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to pin F-0115 Module pre-push origin/master." }

    $f0115QueueFullPath = Join-Path $f0115PrePushFixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $f0115BaseQueue = [System.IO.File]::ReadAllText($f0115QueueFullPath)
    Set-F0115PrePushFixtureFile -Root $f0115PrePushFixtureRoot -Path $f0115PrePushQueuePath -Content "$f0115BaseQueue`n# Exact F-0115 scope-correction queue candidate is covered independently by the Module pre-commit smoke.`n"
    Set-F0115PrePushFixtureFile -Root $f0115PrePushFixtureRoot -Path $f0115PrePushAuthorizationPath -Content @"
# P1 F-0115 Scope-Correction Authorization

Status: approved
Task ID: p1-f0115-scope-correction-hotfix-2026-07-16
Parent task: $f0115PrePushParentTaskId
Base: $f0115PrePushBaseSha
Branch: codex/p1-f0115-scope-correction-hotfix

Every other in_progress SHA mismatch remains a hard-block.
"@
    Set-F0115PrePushFixtureFile -Root $f0115PrePushFixtureRoot -Path $f0115PrePushEvidencePath -Content "# F-0115 transition evidence`n`nstatus: complete`nResult: pass`n"
    Set-F0115PrePushFixtureFile -Root $f0115PrePushFixtureRoot -Path $f0115PrePushAuditPath -Content "# F-0115 transition audit`n`n## Round 1`nResult: pass`n`n## Round 2`nResult: pass`n`nDecision: APPROVE`n"
    foreach ($f0115Path in @($f0115PrePushFiles | Where-Object {
        $_ -notin @($f0115PrePushQueuePath, $f0115PrePushAuthorizationPath, $f0115PrePushEvidencePath, $f0115PrePushAuditPath)
    })) {
        Set-F0115PrePushFixtureFile -Root $f0115PrePushFixtureRoot -Path $f0115Path -Content "# Exact F-0115 transition fixture: $f0115Path`n"
    }

    & git -C $f0115PrePushFixtureRoot add -- $f0115PrePushFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage the exact F-0115 Module pre-push file set." }
    $f0115StagedFiles = @(& git -C $f0115PrePushFixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if (($f0115StagedFiles -join "|") -cne (@($f0115PrePushFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0115 Module pre-push fixture did not stage the exact file set.`nActual: $($f0115StagedFiles -join ', ')"
    }
    & git -C $f0115PrePushFixtureRoot commit --quiet -m "materialize exact F-0115 scope correction"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit the exact F-0115 Module pre-push fixture." }
    $f0115HotfixSha = ((& git -C $f0115PrePushFixtureRoot rev-parse HEAD) -join "").Trim()
    $f0115CommitLine = ((& git -C $f0115PrePushFixtureRoot rev-list --parents -n 1 HEAD) -join "").Trim()
    $f0115CommitParts = @($f0115CommitLine -split "\s+")
    if ($f0115CommitParts.Count -ne 2 -or $f0115CommitParts[1] -ne $f0115PrePushBaseSha) {
        throw "F-0115 Module pre-push fixture is not the exact one-parent base handoff: $f0115CommitLine"
    }
    $f0115CommittedFiles = @(& git -C $f0115PrePushFixtureRoot diff-tree --no-commit-id --name-only -r HEAD | Sort-Object -Unique)
    if (($f0115CommittedFiles -join "|") -cne (@($f0115PrePushFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0115 Module pre-push commit does not contain the exact file set.`nActual: $($f0115CommittedFiles -join ', ')"
    }

    $f0115ProjectStateFullPath = Join-Path $f0115PrePushFixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $f0115MatrixFullPath = Join-Path $f0115PrePushFixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $f0115EvidenceFullPath = Join-Path $f0115PrePushFixtureRoot ($f0115PrePushEvidencePath -replace "/", "\")
    $f0115AuditFullPath = Join-Path $f0115PrePushFixtureRoot ($f0115PrePushAuditPath -replace "/", "\")
    $f0115ProjectStateText = [System.IO.File]::ReadAllText($f0115ProjectStateFullPath)
    $f0115CheckpointMatch = [regex]::Match($f0115ProjectStateText, "(?m)^\s+lastKnownMasterSha:\s*([0-9a-f]{40})\s*$")
    if (-not $f0115CheckpointMatch.Success) { throw "F-0115 Module pre-push state checkpoint is missing." }
    $f0115StateCheckpointSha = $f0115CheckpointMatch.Groups[1].Value
    & git -C $f0115PrePushFixtureRoot merge-base --is-ancestor $f0115StateCheckpointSha $f0115PrePushBaseSha
    if ($LASTEXITCODE -ne 0) { throw "F-0115 state checkpoint is not an ancestor of the fixed base." }

    $ordinaryTaskId = "ordinary-non-f0115-in-progress-sha-drift-smoke"
    $ordinaryStatePath = Join-Path $f0115PrePushFixtureRoot "ordinary-project-state.yaml"
    $ordinaryQueuePath = Join-Path $f0115PrePushFixtureRoot "ordinary-task-queue.yaml"
    [System.IO.File]::WriteAllText($ordinaryStatePath, @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $f0115StateCheckpointSha
  lastKnownOriginMasterSha: $f0115StateCheckpointSha
currentTask:
  id: $ordinaryTaskId
  status: in_progress
"@, $f0115PrePushUtf8WithoutBom)
    [System.IO.File]::WriteAllText($ordinaryQueuePath, @"
schemaVersion: 1
tasks:
  - id: $ordinaryTaskId
    evidencePath: $f0115EvidenceFullPath
    auditReviewPath: $f0115AuditFullPath
    status: in_progress
"@, $f0115PrePushUtf8WithoutBom)

    Push-Location $f0115PrePushFixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master" -Command {
            & $scriptPath -TaskId $ordinaryTaskId -ProjectStatePath $ordinaryStatePath -QueuePath $ordinaryQueuePath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck
        }

        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115ProjectStateFullPath -QueuePath $f0115QueueFullPath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck
        }

        $f0115TransitionOutput = @(
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115ProjectStateFullPath -QueuePath $f0115QueueFullPath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        )
        Assert-Contains -Output $f0115TransitionOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
        Assert-Contains -Output $f0115TransitionOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
        Assert-Contains -Output $f0115TransitionOutput -Pattern "pre-push readiness passed"

        $missingEvidencePath = Join-Path $f0115PrePushFixtureRoot "missing-f0115-transition-evidence.md"
        Test-F0115PrePushReviewFailure `
            -ProjectStatePath $f0115ProjectStateFullPath `
            -QueuePath $f0115QueueFullPath `
            -MatrixPath $f0115MatrixFullPath `
            -EvidencePath $missingEvidencePath `
            -AuditReviewPath $f0115AuditFullPath `
            -ExpectedPattern "HARD_BLOCK_MISSING_EVIDENCE" `
            -ForbiddenPatterns @(
                "p1F0115TransitionTopology:\s*exact_one_parent",
                "p1TransitionScopeMode:\s*transition_only"
            ) `
            -Label "topology-valid transition with later evidence finding" `
            -RedFindings $f0115PrePushReviewerRedFindings

        $mismatchedStatePath = Join-Path $f0115PrePushFixtureRoot "mismatched-project-state.yaml"
        [System.IO.File]::WriteAllText($mismatchedStatePath, @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $f0115StateCheckpointSha
  lastKnownOriginMasterSha: $f0115PrePushBaseSha
currentTask:
  id: $f0115PrePushParentTaskId
  status: in_progress
"@, $f0115PrePushUtf8WithoutBom)
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $mismatchedStatePath -QueuePath $f0115QueueFullPath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }

        $f0115BaseTreeSha = ((& git rev-parse "$f0115PrePushBaseSha`^{tree}") -join "").Trim()
        $movedOriginSha = (("independent origin movement" | & git commit-tree $f0115BaseTreeSha -p $f0115PrePushBaseSha) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or $movedOriginSha -notmatch '^[0-9a-f]{40}$') { throw "Failed to synthesize F-0115 origin movement." }
        & git update-ref refs/remotes/origin/master $movedOriginSha $f0115PrePushBaseSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to move F-0115 fixture origin/master." }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115ProjectStateFullPath -QueuePath $f0115QueueFullPath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
        & git update-ref refs/remotes/origin/master $f0115PrePushBaseSha $movedOriginSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to restore F-0115 fixture origin/master." }

        & git reset --hard --quiet $f0115PrePushBaseSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to reset F-0115 fixture before deletion topology probe." }
        & git --literal-pathspecs checkout $f0115HotfixSha -- $f0115PrePushFiles
        if ($LASTEXITCODE -ne 0) { throw "Failed to restore the exact F-0115 file set for deletion topology probe." }
        $deletedPath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
        Remove-Item -LiteralPath (Join-Path $f0115PrePushFixtureRoot ($deletedPath -replace "/", "\")) -Force
        & git --literal-pathspecs add -A -- $deletedPath
        if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0115 deletion topology probe." }
        & git commit --quiet -m "destroy exact F-0115 path by deletion"
        if ($LASTEXITCODE -ne 0) { throw "Failed to commit F-0115 deletion topology probe." }
        $deletionStatusLines = @(& git diff-tree --no-commit-id --name-status --no-renames -r HEAD)
        $deletionPaths = @($deletionStatusLines | ForEach-Object { ($_ -split "`t")[-1] } | Sort-Object -Unique)
        if (($deletionPaths -join "|") -cne (@($f0115PrePushFiles | Sort-Object -Unique) -join "|")) {
            throw "F-0115 deletion topology probe must retain the exact 12-name path set.`nActual: $($deletionPaths -join ', ')"
        }
        if (-not ($deletionStatusLines -contains "D`t$deletedPath")) {
            throw "F-0115 deletion topology probe did not produce the required D status for $deletedPath."
        }
        Test-F0115PrePushReviewFailure `
            -ProjectStatePath $f0115ProjectStateFullPath `
            -QueuePath $f0115QueueFullPath `
            -MatrixPath $f0115MatrixFullPath `
            -EvidencePath $f0115EvidenceFullPath `
            -AuditReviewPath $f0115AuditFullPath `
            -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" `
            -ForbiddenPatterns @() `
            -Label "exact-12 path set with deleted expected file" `
            -RedFindings $f0115PrePushReviewerRedFindings

        & git reset --hard --quiet $f0115PrePushBaseSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to reset F-0115 fixture before type-change topology probe." }
        & git --literal-pathspecs checkout $f0115HotfixSha -- $f0115PrePushFiles
        if ($LASTEXITCODE -ne 0) { throw "Failed to restore the exact F-0115 file set for type-change topology probe." }
        $typeChangePath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
        $typeChangeBlob = (("synthetic-f0115-link-target" | & git hash-object -w --stdin) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or $typeChangeBlob -notmatch '^[0-9a-f]{40}$') {
            throw "Failed to create F-0115 type-change blob."
        }
        & git update-index --cacheinfo "120000,$typeChangeBlob,$typeChangePath"
        if ($LASTEXITCODE -ne 0) { throw "Failed to stage F-0115 type-change topology probe." }
        & git commit --quiet -m "destroy exact F-0115 path by type change"
        if ($LASTEXITCODE -ne 0) { throw "Failed to commit F-0115 type-change topology probe." }
        $typeChangeStatusLines = @(& git diff-tree --no-commit-id --name-status --no-renames -r HEAD)
        $typeChangePaths = @($typeChangeStatusLines | ForEach-Object { ($_ -split "`t")[-1] } | Sort-Object -Unique)
        if (($typeChangePaths -join "|") -cne (@($f0115PrePushFiles | Sort-Object -Unique) -join "|")) {
            throw "F-0115 type-change topology probe must retain the exact 12-name path set.`nActual: $($typeChangePaths -join ', ')"
        }
        if (-not ($typeChangeStatusLines -contains "T`t$typeChangePath")) {
            throw "F-0115 type-change topology probe did not produce the required T status for $typeChangePath."
        }
        Test-F0115PrePushReviewFailure `
            -ProjectStatePath $f0115ProjectStateFullPath `
            -QueuePath $f0115QueueFullPath `
            -MatrixPath $f0115MatrixFullPath `
            -EvidencePath $f0115EvidenceFullPath `
            -AuditReviewPath $f0115AuditFullPath `
            -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" `
            -ForbiddenPatterns @() `
            -Label "exact-12 path set with type-changed expected file" `
            -RedFindings $f0115PrePushReviewerRedFindings

        & git reset --hard --quiet $f0115HotfixSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to restore F-0115 positive transition before replay probe." }

        Add-Content -LiteralPath $f0115EvidenceFullPath -Value "Replay attempt must not reuse transition_only." -Encoding UTF8
        & git add -- $f0115PrePushEvidencePath
        & git commit --quiet -m "replay F-0115 transition"
        if ($LASTEXITCODE -ne 0) { throw "Failed to synthesize F-0115 replay commit." }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115ProjectStateFullPath -QueuePath $f0115QueueFullPath -MatrixPath $f0115MatrixFullPath -EvidencePath $f0115EvidenceFullPath -AuditReviewPath $f0115AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
        if ($f0115PrePushReviewerRedFindings.Count -gt 0) {
            throw "F-0115 Module pre-push reviewer coverage is RED:`n- $($f0115PrePushReviewerRedFindings -join "`n- ")"
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $f0115PrePushFixtureRoot) {
        Remove-Item -LiteralPath $f0115PrePushFixtureRoot -Recurse -Force
    }
}

$f0115Phase11BaseSha = "582c156afb0cdde8a3daa99785fda8540b56fe27"
$f0115Phase11AuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-authorization.md"
$f0115Phase11EvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$f0115Phase11AuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md"
$f0115Phase11Files = @(
    $f0115PrePushQueuePath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    $f0115Phase11AuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix-design.md",
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0115-phase11-scope-correction-hotfix.md",
    $f0115Phase11EvidencePath,
    $f0115Phase11AuditPath
)
$f0115Phase11FixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0115-phase11-pre-push-" + [guid]::NewGuid().ToString("N"))

try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $f0115Phase11FixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0115 phase-11 Module pre-push fixture." }
    & git -C $f0115Phase11FixtureRoot config user.name "Module F-0115 Phase-11 Pre-Push Smoke"
    & git -C $f0115Phase11FixtureRoot config user.email "module-f0115-phase11-pre-push-smoke@example.invalid"
    & git -C $f0115Phase11FixtureRoot config core.autocrlf false
    & git -C $f0115Phase11FixtureRoot config core.longpaths true
    & git -C $f0115Phase11FixtureRoot sparse-checkout init --no-cone
    & git -C $f0115Phase11FixtureRoot sparse-checkout set --no-cone -- @(
        $f0115Phase11Files + @($f0115PrePushProjectStatePath, $f0115PrePushMatrixPath)
    )
    if ($LASTEXITCODE -ne 0) { throw "Failed to configure F-0115 phase-11 sparse fixture." }
    & git -C $f0115Phase11FixtureRoot switch --quiet -C master $f0115Phase11BaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the fixed F-0115 phase-11 base." }
    & git -C $f0115Phase11FixtureRoot update-ref refs/remotes/origin/master $f0115Phase11BaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to pin F-0115 phase-11 origin/master." }

    $f0115Phase11QueueFullPath = Join-Path $f0115Phase11FixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $f0115Phase11BaseQueue = [System.IO.File]::ReadAllText($f0115Phase11QueueFullPath)
    Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path $f0115PrePushQueuePath -Content "$f0115Phase11BaseQueue`n# Exact F-0115 phase-11 queue correction fixture.`n"
    Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path $f0115Phase11AuthorizationPath -Content @"
# P1 F-0115 Phase-11 Scope Correction Hotfix Authorization

Date: 2026-07-17
Status: approved
Human approval source: current user message in the Codex conversation on 2026-07-17.
Task ID: p1-f0115-phase11-scope-correction-hotfix-2026-07-17
Parent task: $f0115PrePushParentTaskId
Base: $f0115Phase11BaseSha
Branch: codex/p1-f0115-phase11-scope-correction-hotfix

Every other in_progress SHA mismatch remains a hard-block.
"@
    Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path $f0115Phase11EvidencePath -Content "# F-0115 phase-11 transition evidence`n`nstatus: complete`nResult: pass`n"
    Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path $f0115Phase11AuditPath -Content "# F-0115 phase-11 transition audit`n`n## Round 1`nResult: pass`n`n## Round 2`nResult: pass`n`nDecision: APPROVE`n"
    foreach ($f0115Phase11Path in @($f0115Phase11Files | Where-Object {
        $_ -notin @($f0115PrePushQueuePath, $f0115Phase11AuthorizationPath, $f0115Phase11EvidencePath, $f0115Phase11AuditPath)
    })) {
        Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path $f0115Phase11Path -Content "# Exact F-0115 phase-11 transition fixture: $f0115Phase11Path`n"
    }

    & git -C $f0115Phase11FixtureRoot add -- $f0115Phase11Files
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage the exact F-0115 phase-11 file set." }
    $f0115Phase11StagedFiles = @(& git -C $f0115Phase11FixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if ($f0115Phase11StagedFiles.Count -ne 12 -or ($f0115Phase11StagedFiles -join "|") -cne (@($f0115Phase11Files | Sort-Object -Unique) -join "|")) {
        throw "F-0115 phase-11 fixture did not stage the exact 12-file set.`nActual: $($f0115Phase11StagedFiles -join ', ')"
    }
    & git -C $f0115Phase11FixtureRoot commit --quiet -m "materialize exact F-0115 phase-11 scope correction"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit the exact F-0115 phase-11 fixture." }
    $f0115Phase11HotfixSha = ((& git -C $f0115Phase11FixtureRoot rev-parse HEAD) -join "").Trim()
    $f0115Phase11CommitLine = ((& git -C $f0115Phase11FixtureRoot rev-list --parents -n 1 HEAD) -join "").Trim()
    if ($f0115Phase11CommitLine -notmatch "^[0-9a-f]{40} $f0115Phase11BaseSha$") {
        throw "F-0115 phase-11 fixture is not the exact one-parent base handoff: $f0115Phase11CommitLine"
    }
    $f0115Phase11CommittedFiles = @(& git -C $f0115Phase11FixtureRoot diff-tree --no-commit-id --name-only -r HEAD | Sort-Object -Unique)
    if (($f0115Phase11CommittedFiles -join "|") -cne (@($f0115Phase11Files | Sort-Object -Unique) -join "|")) {
        throw "F-0115 phase-11 commit does not contain the exact 12-file set.`nActual: $($f0115Phase11CommittedFiles -join ', ')"
    }
    $f0115Phase11ParentAuthorizationPath = ((& git -C $f0115Phase11FixtureRoot ls-tree -r --name-only $f0115Phase11BaseSha -- $f0115Phase11AuthorizationPath) -join "").Trim()
    if ($LASTEXITCODE -ne 0 -or -not [string]::IsNullOrWhiteSpace($f0115Phase11ParentAuthorizationPath)) {
        throw "F-0115 phase-11 authorization is not fresh relative to the fixed base."
    }
    $f0115Phase11AuthorizationText = ((& git -C $f0115Phase11FixtureRoot show "$f0115Phase11HotfixSha`:$f0115Phase11AuthorizationPath") -join "`n")
    if ($LASTEXITCODE -ne 0 -or $f0115Phase11AuthorizationText -notmatch "Human approval source: current user message") {
        throw "F-0115 phase-11 fixture is missing fresh current-user approval evidence."
    }

    $f0115Phase11ProjectStateFullPath = Join-Path $f0115Phase11FixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $f0115Phase11MatrixFullPath = Join-Path $f0115Phase11FixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $f0115Phase11EvidenceFullPath = Join-Path $f0115Phase11FixtureRoot ($f0115Phase11EvidencePath -replace "/", "\")
    $f0115Phase11AuditFullPath = Join-Path $f0115Phase11FixtureRoot ($f0115Phase11AuditPath -replace "/", "\")
    $f0115Phase11StateText = [System.IO.File]::ReadAllText($f0115Phase11ProjectStateFullPath)
    $f0115Phase11CheckpointMatch = [regex]::Match($f0115Phase11StateText, "(?m)^\s+lastKnownMasterSha:\s*([0-9a-f]{40})\s*$")
    if (-not $f0115Phase11CheckpointMatch.Success) { throw "F-0115 phase-11 state checkpoint is missing." }
    $f0115Phase11CheckpointSha = $f0115Phase11CheckpointMatch.Groups[1].Value

    Push-Location $f0115Phase11FixtureRoot
    try {
        $f0115Phase11PositiveOutput = @(
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11ProjectStateFullPath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        )
        Assert-Contains -Output $f0115Phase11PositiveOutput -Pattern "p1F0115Phase11TransitionTopology: exact_one_parent"
        Assert-Contains -Output $f0115Phase11PositiveOutput -Pattern "p1TransitionScopeMode: transition_only"
        Assert-Contains -Output $f0115Phase11PositiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"
        Assert-Contains -Output $f0115Phase11PositiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR origin/master"
        Assert-Contains -Output $f0115Phase11PositiveOutput -Pattern "pre-push readiness passed"

        $f0115Phase11BaseTreeSha = ((& git rev-parse "$f0115Phase11BaseSha`^{tree}") -join "").Trim()
        $f0115Phase11MovedOriginSha = (("move phase-11 origin" | & git commit-tree $f0115Phase11BaseTreeSha -p $f0115Phase11BaseSha) -join "").Trim()
        & git update-ref refs/remotes/origin/master $f0115Phase11MovedOriginSha $f0115Phase11BaseSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to move F-0115 phase-11 origin/master." }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11ProjectStateFullPath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
        & git update-ref refs/remotes/origin/master $f0115Phase11BaseSha $f0115Phase11MovedOriginSha
        if ($LASTEXITCODE -ne 0) { throw "Failed to restore F-0115 phase-11 origin/master." }

        $f0115Phase11NonAncestorSha = (("non-ancestor phase-11 checkpoint" | & git commit-tree $f0115Phase11BaseTreeSha) -join "").Trim()
        $f0115Phase11NonAncestorStatePath = Join-Path $f0115Phase11FixtureRoot "non-ancestor-project-state.yaml"
        [System.IO.File]::WriteAllText($f0115Phase11NonAncestorStatePath, @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $f0115Phase11NonAncestorSha
  lastKnownOriginMasterSha: $f0115Phase11NonAncestorSha
currentTask:
  id: $f0115PrePushParentTaskId
  status: in_progress
"@, $f0115PrePushUtf8WithoutBom)
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11NonAncestorStatePath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }

        $f0115Phase11HotfixTreeSha = ((& git rev-parse "$f0115Phase11HotfixSha`^{tree}") -join "").Trim()
        $f0115Phase11MergeSha = (("merge-shaped phase-11 replay" | & git commit-tree $f0115Phase11HotfixTreeSha -p $f0115Phase11BaseSha -p $f0115Phase11NonAncestorSha) -join "").Trim()
        & git reset --hard --quiet $f0115Phase11MergeSha
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11ProjectStateFullPath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }

        $f0115Phase11ReplaySha = (("extra phase-11 replay commit" | & git commit-tree $f0115Phase11HotfixTreeSha -p $f0115Phase11HotfixSha) -join "").Trim()
        & git reset --hard --quiet $f0115Phase11ReplaySha
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11ProjectStateFullPath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }

        & git reset --hard --quiet $f0115Phase11BaseSha
        Set-F0115PrePushFixtureFile -Root $f0115Phase11FixtureRoot -Path "ordinary-drift.txt" -Content "ordinary drift must remain blocked`n"
        & git add --sparse -- ordinary-drift.txt
        & git commit --quiet -m "ordinary in-progress drift"
        if ($LASTEXITCODE -ne 0) { throw "Failed to synthesize ordinary F-0115 phase-11 drift." }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0115Phase11ProjectStateFullPath -QueuePath $f0115Phase11QueueFullPath -MatrixPath $f0115Phase11MatrixFullPath -EvidencePath $f0115Phase11EvidenceFullPath -AuditReviewPath $f0115Phase11AuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $f0115Phase11FixtureRoot) {
        Remove-Item -LiteralPath $f0115Phase11FixtureRoot -Recurse -Force
    }
}

$moduleHotfixBaseSha = "529ecf24c52eb25d2097cbfdbc595b05f377e6b4"
$moduleHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-remediation-efficiency-mechanism-tuning-authorization.md"
$moduleHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
$moduleHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md"
$moduleHotfixFiles = @(
    "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md",
    $moduleHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md",
    $moduleHotfixEvidencePath,
    $moduleHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$moduleHotfixFixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0115-module-hotfix-pre-push-" + [guid]::NewGuid().ToString("N"))
try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $moduleHotfixFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0115 Module hotfix pre-push fixture." }
    & git -C $moduleHotfixFixtureRoot config user.name "Module F-0115 Hotfix Pre-Push Smoke"
    & git -C $moduleHotfixFixtureRoot config user.email "module-f0115-hotfix-pre-push-smoke@example.invalid"
    & git -C $moduleHotfixFixtureRoot config core.autocrlf false
    & git -C $moduleHotfixFixtureRoot config core.longpaths true
    & git -C $moduleHotfixFixtureRoot config core.safecrlf false
    & git -C $moduleHotfixFixtureRoot sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize F-0115 Module hotfix pre-push sparse fixture." }
    & git -C $moduleHotfixFixtureRoot sparse-checkout set --no-cone -- @(
        $moduleHotfixFiles + @($f0115PrePushProjectStatePath, $f0115PrePushQueuePath, $f0115PrePushMatrixPath)
    )
    if ($LASTEXITCODE -ne 0) { throw "Failed to configure F-0115 Module hotfix pre-push sparse fixture." }
    & git -C $moduleHotfixFixtureRoot switch --quiet -C master $moduleHotfixBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the fixed F-0115 Module hotfix base." }
    & git -C $moduleHotfixFixtureRoot update-ref refs/remotes/origin/master $moduleHotfixBaseSha
    foreach ($scriptFile in @($moduleHotfixFiles | Where-Object { $_ -like "scripts/*" })) {
        Add-Content -LiteralPath (Join-Path $moduleHotfixFixtureRoot ($scriptFile -replace "/", "\")) -Value "# F-0115 Module hotfix pre-push marker" -Encoding UTF8
    }
    Set-F0115PrePushFixtureFile -Root $moduleHotfixFixtureRoot -Path "docs/04-agent-system/sop/p1-remediation-efficiency-loop.md" -Content "# P1 Efficiency SOP`n"
    Set-F0115PrePushFixtureFile -Root $moduleHotfixFixtureRoot -Path $moduleHotfixAuthorizationPath -Content "# Authorization`n`nStatus: approved`nHuman approval source: current user message`n"
    Set-F0115PrePushFixtureFile -Root $moduleHotfixFixtureRoot -Path "docs/05-execution-logs/task-plans/2026-07-17-p1-remediation-efficiency-mechanism-tuning.md" -Content "# Plan`n"
    Set-F0115PrePushFixtureFile -Root $moduleHotfixFixtureRoot -Path $moduleHotfixEvidencePath -Content "# Evidence`n`nResult: pass`n"
    Set-F0115PrePushFixtureFile -Root $moduleHotfixFixtureRoot -Path $moduleHotfixAuditPath -Content "# Audit`n`nDecision: APPROVE`n"
    & git -C $moduleHotfixFixtureRoot add -- $moduleHotfixFiles
    & git -C $moduleHotfixFixtureRoot commit --quiet -m "materialize exact F-0115 Module hotfix"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit F-0115 Module hotfix pre-push fixture." }
    $moduleHotfixHeadSha = ((& git -C $moduleHotfixFixtureRoot rev-parse HEAD) -join "").Trim()
    $moduleHotfixCommitLine = ((& git -C $moduleHotfixFixtureRoot rev-list --parents -n 1 HEAD) -join "").Trim()
    if ($moduleHotfixCommitLine -notmatch "^[0-9a-f]{40} $moduleHotfixBaseSha$") { throw "F-0115 Module hotfix fixture is not exact one-parent topology." }
    $moduleHotfixCommittedFiles = @(& git -C $moduleHotfixFixtureRoot diff-tree --no-commit-id --name-only -r HEAD | Sort-Object -Unique)
    if (($moduleHotfixCommittedFiles -join "|") -cne (@($moduleHotfixFiles | Sort-Object -Unique) -join "|")) { throw "F-0115 Module hotfix fixture file set is not exact." }

    $moduleHotfixProjectStateFullPath = Join-Path $moduleHotfixFixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $moduleHotfixQueueFullPath = Join-Path $moduleHotfixFixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $moduleHotfixMatrixFullPath = Join-Path $moduleHotfixFixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $moduleHotfixEvidenceFullPath = Join-Path $moduleHotfixFixtureRoot ($moduleHotfixEvidencePath -replace "/", "\")
    $moduleHotfixAuditFullPath = Join-Path $moduleHotfixFixtureRoot ($moduleHotfixAuditPath -replace "/", "\")
    Push-Location $moduleHotfixFixtureRoot
    try {
        $moduleHotfixPositiveOutput = @(& $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $moduleHotfixProjectStateFullPath -QueuePath $moduleHotfixQueueFullPath -MatrixPath $moduleHotfixMatrixFullPath -EvidencePath $moduleHotfixEvidenceFullPath -AuditReviewPath $moduleHotfixAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only)
        Assert-Contains -Output $moduleHotfixPositiveOutput -Pattern "p1F0115ModulePrecommitHotfixTransitionTopology: exact_one_parent"
        Assert-Contains -Output $moduleHotfixPositiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"

        Add-Content -LiteralPath $moduleHotfixEvidenceFullPath -Value "replay" -Encoding UTF8
        & git add -- $moduleHotfixEvidencePath
        & git commit --quiet -m "attempt F-0115 Module hotfix replay"
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $moduleHotfixProjectStateFullPath -QueuePath $moduleHotfixQueueFullPath -MatrixPath $moduleHotfixMatrixFullPath -EvidencePath $moduleHotfixEvidenceFullPath -AuditReviewPath $moduleHotfixAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $moduleHotfixFixtureRoot) { Remove-Item -LiteralPath $moduleHotfixFixtureRoot -Recurse -Force }
}

$f0116DesignPathHotfixBaseSha = "ce6aef7b30c82f459ccfdc06782eda9bc720c15d"
$f0116DesignPathHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-17-p1-f0116-designpath-guard-hotfix-authorization.md"
$f0116DesignPathHotfixEvidencePath = "docs/05-execution-logs/evidence/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
$f0116DesignPathHotfixAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-17-p1-f0116-designpath-guard-hotfix.md"
$f0116DesignPathHotfixFiles = @(
    $f0116DesignPathHotfixAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md",
    $f0116DesignPathHotfixEvidencePath,
    $f0116DesignPathHotfixAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0116DesignPathHotfixFixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0116-designpath-hotfix-pre-push-" + [guid]::NewGuid().ToString("N"))
try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $f0116DesignPathHotfixFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0116 designPath hotfix pre-push fixture." }
    & git -C $f0116DesignPathHotfixFixtureRoot config user.name "Module F-0116 DesignPath Hotfix Smoke"
    & git -C $f0116DesignPathHotfixFixtureRoot config user.email "module-f0116-designpath-hotfix@example.invalid"
    & git -C $f0116DesignPathHotfixFixtureRoot config core.autocrlf false
    & git -C $f0116DesignPathHotfixFixtureRoot config core.longpaths true
    & git -C $f0116DesignPathHotfixFixtureRoot sparse-checkout init --no-cone
    & git -C $f0116DesignPathHotfixFixtureRoot sparse-checkout set --no-cone -- @(
        $f0116DesignPathHotfixFiles + @($f0115PrePushProjectStatePath, $f0115PrePushQueuePath, $f0115PrePushMatrixPath)
    )
    & git -C $f0116DesignPathHotfixFixtureRoot switch --quiet -C master $f0116DesignPathHotfixBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out F-0116 designPath hotfix base." }
    & git -C $f0116DesignPathHotfixFixtureRoot update-ref refs/remotes/origin/master $f0116DesignPathHotfixBaseSha
    foreach ($scriptFile in @($f0116DesignPathHotfixFiles | Where-Object { $_ -like "scripts/*" })) {
        Add-Content -LiteralPath (Join-Path $f0116DesignPathHotfixFixtureRoot ($scriptFile -replace "/", "\")) -Value "# F-0116 designPath hotfix marker" -Encoding UTF8
    }
    Set-F0115PrePushFixtureFile -Root $f0116DesignPathHotfixFixtureRoot -Path $f0116DesignPathHotfixAuthorizationPath -Content "# Authorization`n`nStatus: approved`nHuman approval source: current user message`n"
    Set-F0115PrePushFixtureFile -Root $f0116DesignPathHotfixFixtureRoot -Path "docs/05-execution-logs/task-plans/2026-07-17-p1-f0116-designpath-guard-hotfix.md" -Content "# Plan`n"
    Set-F0115PrePushFixtureFile -Root $f0116DesignPathHotfixFixtureRoot -Path $f0116DesignPathHotfixEvidencePath -Content "# Evidence`n`nResult: pass`n"
    Set-F0115PrePushFixtureFile -Root $f0116DesignPathHotfixFixtureRoot -Path $f0116DesignPathHotfixAuditPath -Content "# Audit`n`nDecision: APPROVE`n"
    & git -C $f0116DesignPathHotfixFixtureRoot add -- $f0116DesignPathHotfixFiles
    & git -C $f0116DesignPathHotfixFixtureRoot commit --quiet -m "materialize exact F-0116 designPath guard hotfix"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit F-0116 designPath hotfix fixture." }
    $f0116DesignPathHotfixHeadSha = ((& git -C $f0116DesignPathHotfixFixtureRoot rev-parse HEAD) -join "").Trim()
    $f0116DesignPathHotfixCommitLine = ((& git -C $f0116DesignPathHotfixFixtureRoot rev-list --parents -n 1 HEAD) -join "").Trim()
    if ($f0116DesignPathHotfixCommitLine -notmatch "^[0-9a-f]{40} $f0116DesignPathHotfixBaseSha$") { throw "F-0116 designPath hotfix fixture is not exact one-parent topology." }
    $f0116DesignPathHotfixCommittedFiles = @(& git -C $f0116DesignPathHotfixFixtureRoot diff-tree --no-commit-id --name-only -r HEAD | Sort-Object -Unique)
    if (($f0116DesignPathHotfixCommittedFiles -join "|") -cne (@($f0116DesignPathHotfixFiles | Sort-Object -Unique) -join "|")) { throw "F-0116 designPath hotfix fixture file set is not exact." }

    $f0116DesignPathHotfixProjectStateFullPath = Join-Path $f0116DesignPathHotfixFixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $f0116DesignPathHotfixQueueFullPath = Join-Path $f0116DesignPathHotfixFixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $f0116DesignPathHotfixMatrixFullPath = Join-Path $f0116DesignPathHotfixFixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $f0116DesignPathHotfixEvidenceFullPath = Join-Path $f0116DesignPathHotfixFixtureRoot ($f0116DesignPathHotfixEvidencePath -replace "/", "\")
    $f0116DesignPathHotfixAuditFullPath = Join-Path $f0116DesignPathHotfixFixtureRoot ($f0116DesignPathHotfixAuditPath -replace "/", "\")
    Push-Location $f0116DesignPathHotfixFixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0116_DESIGNPATH_HOTFIX_REQUIRES_TRANSITION_ONLY" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0116DesignPathHotfixProjectStateFullPath -QueuePath $f0116DesignPathHotfixQueueFullPath -MatrixPath $f0116DesignPathHotfixMatrixFullPath -EvidencePath $f0116DesignPathHotfixEvidenceFullPath -AuditReviewPath $f0116DesignPathHotfixAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode standard
        }
        $f0116DesignPathHotfixPositiveOutput = @(& $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0116DesignPathHotfixProjectStateFullPath -QueuePath $f0116DesignPathHotfixQueueFullPath -MatrixPath $f0116DesignPathHotfixMatrixFullPath -EvidencePath $f0116DesignPathHotfixEvidenceFullPath -AuditReviewPath $f0116DesignPathHotfixAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only)
        Assert-Contains -Output $f0116DesignPathHotfixPositiveOutput -Pattern "p1F0116DesignPathGuardHotfixTransitionTopology: exact_one_parent"
        Assert-Contains -Output $f0116DesignPathHotfixPositiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"

        Add-Content -LiteralPath $f0116DesignPathHotfixEvidenceFullPath -Value "replay" -Encoding UTF8
        & git add -- $f0116DesignPathHotfixEvidencePath
        & git commit --quiet -m "attempt F-0116 designPath hotfix replay"
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0115PrePushParentTaskId -ProjectStatePath $f0116DesignPathHotfixProjectStateFullPath -QueuePath $f0116DesignPathHotfixQueueFullPath -MatrixPath $f0116DesignPathHotfixMatrixFullPath -EvidencePath $f0116DesignPathHotfixEvidenceFullPath -AuditReviewPath $f0116DesignPathHotfixAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $f0116DesignPathHotfixFixtureRoot) { Remove-Item -LiteralPath $f0116DesignPathHotfixFixtureRoot -Recurse -Force }
}

$f0116ScopeCorrectionBaseSha = "f6b14825f41a83b3f9dd3994ec9c1936876b12ff"
$f0116ScopeCorrectionParentTaskId = "p1-remediation-rc-02-employee-import-preflight-2026-07-17"
$f0116ScopeCorrectionAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0116-scope-correction-guard-hotfix-authorization.md"
$f0116ScopeCorrectionEvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
$f0116ScopeCorrectionAuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md"
$f0116ScopeCorrectionFiles = @(
    $f0115PrePushProjectStatePath,
    $f0115PrePushQueuePath,
    $f0116ScopeCorrectionAuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0116-scope-correction-guard-hotfix.md",
    $f0116ScopeCorrectionEvidencePath,
    $f0116ScopeCorrectionAuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0116ScopeCorrectionFixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0116-scope-correction-pre-push-" + [guid]::NewGuid().ToString("N"))
try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $f0116ScopeCorrectionFixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0116 scope-correction pre-push fixture." }
    & git -C $f0116ScopeCorrectionFixtureRoot config user.name "Module F-0116 Scope Correction Smoke"
    & git -C $f0116ScopeCorrectionFixtureRoot config user.email "module-f0116-scope-correction@example.invalid"
    & git -C $f0116ScopeCorrectionFixtureRoot config core.autocrlf false
    & git -C $f0116ScopeCorrectionFixtureRoot config core.longpaths true
    & git -C $f0116ScopeCorrectionFixtureRoot config core.safecrlf false
    & git -C $f0116ScopeCorrectionFixtureRoot sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Failed to initialize F-0116 scope-correction sparse fixture." }
    & git -C $f0116ScopeCorrectionFixtureRoot sparse-checkout set --no-cone -- @($f0116ScopeCorrectionFiles + @($f0115PrePushMatrixPath))
    if ($LASTEXITCODE -ne 0) { throw "Failed to configure F-0116 scope-correction sparse fixture." }
    & git -C $f0116ScopeCorrectionFixtureRoot switch --quiet -C master $f0116ScopeCorrectionBaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out the fixed F-0116 scope-correction base." }
    & git -C $f0116ScopeCorrectionFixtureRoot update-ref refs/remotes/origin/master $f0116ScopeCorrectionBaseSha

    foreach ($candidatePath in $f0116ScopeCorrectionFiles) {
        $sourcePath = Join-Path $f0115PrePushSourceRoot ($candidatePath -replace "/", "\")
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing F-0116 scope-correction source file: $candidatePath" }
        Set-F0115PrePushFixtureFile -Root $f0116ScopeCorrectionFixtureRoot -Path $candidatePath -Content ([System.IO.File]::ReadAllText($sourcePath))
    }
    Set-F0115PrePushFixtureFile -Root $f0116ScopeCorrectionFixtureRoot -Path $f0116ScopeCorrectionEvidencePath -Content "# Evidence`n`n## Reading Evidence`nstatus: complete`nconflictsFound: false`ntargetSourceReviewed: true`ntargetTestsReviewed: true`nanalogousImplementationReviewed: true`nCost Calibration Gate remains blocked.`nResult: pass`n`n## Root-Cause Reproduction`nResult: pass`n`n## TDD Evidence`nResult: pass`n`n## Validation Results`nResult: pass`n"
    Set-F0115PrePushFixtureFile -Root $f0116ScopeCorrectionFixtureRoot -Path $f0116ScopeCorrectionAuditPath -Content "# Audit`n`n## Round 1`nResult: pass`n`n## Round 2`nResult: pass`n`n## Decision`nDecision: APPROVE`n"
    & git -C $f0116ScopeCorrectionFixtureRoot add -- $f0116ScopeCorrectionFiles
    if ($LASTEXITCODE -ne 0) { throw "Failed to stage the exact F-0116 scope-correction file set." }
    $f0116ScopeCorrectionStagedFiles = @(& git -C $f0116ScopeCorrectionFixtureRoot diff --cached --name-only --diff-filter=ACMR | Sort-Object -Unique)
    if ($f0116ScopeCorrectionStagedFiles.Count -ne 12 -or ($f0116ScopeCorrectionStagedFiles -join "|") -cne (@($f0116ScopeCorrectionFiles | Sort-Object -Unique) -join "|")) {
        throw "F-0116 scope-correction fixture did not stage the exact 12-file set.`nActual: $($f0116ScopeCorrectionStagedFiles -join ', ')"
    }
    & git -C $f0116ScopeCorrectionFixtureRoot commit --quiet -m "materialize exact F-0116 scope-correction guard hotfix"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit the exact F-0116 scope-correction fixture." }
    $f0116ScopeCorrectionParentState = ((& git -C $f0116ScopeCorrectionFixtureRoot show "${f0116ScopeCorrectionBaseSha}:$f0115PrePushProjectStatePath") -join "`n")
    $f0116ScopeCorrectionParentQueue = ((& git -C $f0116ScopeCorrectionFixtureRoot show "${f0116ScopeCorrectionBaseSha}:$f0115PrePushQueuePath") -join "`n")
    if ($LASTEXITCODE -ne 0) { throw "Failed to read F-0116 parent state/queue for pre-push context." }
    Set-F0115PrePushFixtureFile -Root $f0116ScopeCorrectionFixtureRoot -Path $f0115PrePushProjectStatePath -Content $f0116ScopeCorrectionParentState
    Set-F0115PrePushFixtureFile -Root $f0116ScopeCorrectionFixtureRoot -Path $f0115PrePushQueuePath -Content $f0116ScopeCorrectionParentQueue
    $f0116ScopeCorrectionHeadSha = ((& git -C $f0116ScopeCorrectionFixtureRoot rev-parse HEAD) -join "").Trim()
    $f0116ScopeCorrectionCommitLine = ((& git -C $f0116ScopeCorrectionFixtureRoot rev-list --parents -n 1 HEAD) -join "").Trim()
    if ($f0116ScopeCorrectionCommitLine -notmatch "^[0-9a-f]{40} $f0116ScopeCorrectionBaseSha$") { throw "F-0116 scope-correction fixture is not exact one-parent topology." }
    $f0116ScopeCorrectionCommittedFiles = @(& git -C $f0116ScopeCorrectionFixtureRoot diff-tree --no-commit-id --name-only -r HEAD | Sort-Object -Unique)
    if (($f0116ScopeCorrectionCommittedFiles -join "|") -cne (@($f0116ScopeCorrectionFiles | Sort-Object -Unique) -join "|")) { throw "F-0116 scope-correction fixture file set is not exact." }

    $f0116ScopeCorrectionProjectStateFullPath = Join-Path $f0116ScopeCorrectionFixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $f0116ScopeCorrectionQueueFullPath = Join-Path $f0116ScopeCorrectionFixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $f0116ScopeCorrectionMatrixFullPath = Join-Path $f0116ScopeCorrectionFixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $f0116ScopeCorrectionEvidenceFullPath = Join-Path $f0116ScopeCorrectionFixtureRoot ($f0116ScopeCorrectionEvidencePath -replace "/", "\")
    $f0116ScopeCorrectionAuditFullPath = Join-Path $f0116ScopeCorrectionFixtureRoot ($f0116ScopeCorrectionAuditPath -replace "/", "\")
    Push-Location $f0116ScopeCorrectionFixtureRoot
    try {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0116_SCOPE_CORRECTION_HOTFIX_REQUIRES_TRANSITION_ONLY" -Command {
            & $scriptPath -TaskId $f0116ScopeCorrectionParentTaskId -ProjectStatePath $f0116ScopeCorrectionProjectStateFullPath -QueuePath $f0116ScopeCorrectionQueueFullPath -MatrixPath $f0116ScopeCorrectionMatrixFullPath -EvidencePath $f0116ScopeCorrectionEvidenceFullPath -AuditReviewPath $f0116ScopeCorrectionAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode standard
        }
        $f0116ScopeCorrectionPositiveOutput = @(& $scriptPath -TaskId $f0116ScopeCorrectionParentTaskId -ProjectStatePath $f0116ScopeCorrectionProjectStateFullPath -QueuePath $f0116ScopeCorrectionQueueFullPath -MatrixPath $f0116ScopeCorrectionMatrixFullPath -EvidencePath $f0116ScopeCorrectionEvidenceFullPath -AuditReviewPath $f0116ScopeCorrectionAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only)
        Assert-Contains -Output $f0116ScopeCorrectionPositiveOutput -Pattern "p1F0116ScopeCorrectionGuardHotfixTransitionTopology: exact_one_parent"
        Assert-Contains -Output $f0116ScopeCorrectionPositiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"

        Add-Content -LiteralPath $f0116ScopeCorrectionEvidenceFullPath -Value "replay" -Encoding UTF8
        & git add -- $f0116ScopeCorrectionEvidencePath
        & git commit --quiet -m "attempt F-0116 scope-correction replay"
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command {
            & $scriptPath -TaskId $f0116ScopeCorrectionParentTaskId -ProjectStatePath $f0116ScopeCorrectionProjectStateFullPath -QueuePath $f0116ScopeCorrectionQueueFullPath -MatrixPath $f0116ScopeCorrectionMatrixFullPath -EvidencePath $f0116ScopeCorrectionEvidenceFullPath -AuditReviewPath $f0116ScopeCorrectionAuditFullPath -SkipRemoteAheadCheck -P1TransitionScopeMode transition_only
        }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $f0116ScopeCorrectionFixtureRoot) { Remove-Item -LiteralPath $f0116ScopeCorrectionFixtureRoot -Recurse -Force }
}

$f0117BaseSha = "366f17446e9fc75a777ebfe5977ad72db1062eb7"
$f0117ParentTaskId = "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
$f0117AuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-spec-approval-transition-hotfix-authorization.md"
$f0117EvidencePath = "docs/05-execution-logs/evidence/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
$f0117AuditPath = "docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md"
$f0117Files = @(
    $f0115PrePushProjectStatePath,
    $f0115PrePushQueuePath,
    $f0117AuthorizationPath,
    "docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-spec-approval-transition-hotfix.md",
    $f0117EvidencePath,
    $f0117AuditPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$f0117FixtureRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-module-f0117-spec-approval-pre-push-" + [guid]::NewGuid().ToString("N"))

function Invoke-F0117P1PrePushGuard {
    $headSha = ((& git -C $f0117FixtureRoot rev-parse HEAD) -join "").Trim()
    $originSha = ((& git -C $f0117FixtureRoot rev-parse origin/master) -join "").Trim()
    $originUrl = ((& git -C $f0117FixtureRoot remote get-url origin) -join "").Trim()
    $pushUpdateLine = "refs/heads/master $headSha refs/heads/master $originSha"
    & $p1GuardPath `
        -RepositoryRoot $f0117FixtureRoot `
        -Phase pre_push `
        -PushRemoteName origin `
        -PushRemoteUrl $originUrl `
        -PushUpdateLines $pushUpdateLine `
        -SkipExternalIntegrityChecks
}

try {
    & git clone --quiet --shared --no-checkout $f0115PrePushSourceRoot $f0117FixtureRoot
    if ($LASTEXITCODE -ne 0) { throw "Failed to clone F-0117 pre-push fixture." }
    & git -C $f0117FixtureRoot config user.name "Module F-0117 Spec Approval Smoke"
    & git -C $f0117FixtureRoot config user.email "module-f0117-spec-approval@example.invalid"
    & git -C $f0117FixtureRoot config core.autocrlf false
    & git -C $f0117FixtureRoot config core.longpaths true
    & git -C $f0117FixtureRoot switch --quiet -C master $f0117BaseSha
    if ($LASTEXITCODE -ne 0) { throw "Failed to check out exact F-0117 base." }
    & git -C $f0117FixtureRoot update-ref refs/remotes/origin/master $f0117BaseSha

    foreach ($candidatePath in $f0117Files) {
        $sourcePath = Join-Path $f0115PrePushSourceRoot ($candidatePath -replace "/", "\")
        if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) { throw "Missing F-0117 source file: $candidatePath" }
        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $candidatePath -Content ([System.IO.File]::ReadAllText($sourcePath))
    }
    & git -C $f0117FixtureRoot add -- $f0117Files
    & git -C $f0117FixtureRoot commit --quiet -m "materialize exact F-0117 spec approval transition"
    if ($LASTEXITCODE -ne 0) { throw "Failed to commit exact F-0117 fixture." }
    $f0117PositiveSha = ((& git -C $f0117FixtureRoot rev-parse HEAD) -join "").Trim()
    $f0117ProjectState = Join-Path $f0117FixtureRoot ($f0115PrePushProjectStatePath -replace "/", "\")
    $f0117Queue = Join-Path $f0117FixtureRoot ($f0115PrePushQueuePath -replace "/", "\")
    $f0117Matrix = Join-Path $f0117FixtureRoot ($f0115PrePushMatrixPath -replace "/", "\")
    $f0117Evidence = Join-Path $f0117FixtureRoot ($f0117EvidencePath -replace "/", "\")
    $f0117Audit = Join-Path $f0117FixtureRoot ($f0117AuditPath -replace "/", "\")

    Push-Location $f0117FixtureRoot
    try {
        $invokeF0117 = { param($Mode, $Task = $f0117ParentTaskId) & $scriptPath -TaskId $Task -ProjectStatePath $f0117ProjectState -QueuePath $f0117Queue -MatrixPath $f0117Matrix -EvidencePath $f0117Evidence -AuditReviewPath $f0117Audit -SkipRemoteAheadCheck -P1TransitionScopeMode $Mode }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_REQUIRES_TRANSITION_ONLY" -Command { & $invokeF0117 standard }
        $p1PositiveOutput = @(Invoke-F0117P1PrePushGuard)
        Assert-Contains -Output $p1PositiveOutput -Pattern "p1F0117SpecApprovalTransitionHotfixAuthorization: approved_one_time"
        Assert-Contains -Output $p1PositiveOutput -Pattern "p1TransitionScopeMode: transition_only"
        $p1TransitionScopeModeLine = @($p1PositiveOutput | Where-Object { $_ -match '^p1TransitionScopeMode:\s*(\S+)\s*$' })
        if ($p1TransitionScopeModeLine.Count -ne 1) { throw "F-0117 P1 pre-push did not emit exactly one transition scope mode." }
        $p1TransitionScopeMode = ([regex]::Match($p1TransitionScopeModeLine[0], '^p1TransitionScopeMode:\s*(\S+)\s*$')).Groups[1].Value
        $positiveOutput = @(& $invokeF0117 $p1TransitionScopeMode)
        Assert-Contains -Output $positiveOutput -Pattern "p1F0117SpecApprovalTransitionHotfixTransitionTopology: exact_one_parent"
        Assert-Contains -Output $positiveOutput -Pattern "OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master"

        $authorizationFullPath = Join-Path $f0117FixtureRoot ($f0117AuthorizationPath -replace "/", "\")
        $authorizationText = [System.IO.File]::ReadAllText($authorizationFullPath)
        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $f0117AuthorizationPath -Content $authorizationText.Replace("standardMode: hard_block", "standardMode: allow")
        & git add -- $f0117AuthorizationPath; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git reset --hard --quiet $f0117PositiveSha

        foreach ($authorizationMutation in @(
            @{ From = 'execution on 2026-07-18'; To = 'execution on 2026-07-18 rejected'; P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID' },
            @{ From = 'Branch: `codex/p1-f0117-spec-approval-transition-hotfix`'; To = 'Branch: `codex/wrong-f0117`'; P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID' },
            @{ From = '2026-07-16-p1-remediation-program-authorization.md'; To = '2026-07-16-wrong-authorization.md'; P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID' },
            @{ From = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`'; To = '12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`'; P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID' }
        )) {
            Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $f0117AuthorizationPath -Content $authorizationText.Replace($authorizationMutation.From, $authorizationMutation.To)
            & git add -- $f0117AuthorizationPath; & git commit --quiet --amend --no-edit
            Invoke-ExpectFailure -ExpectedPattern $authorizationMutation.P1Pattern -Command { Invoke-F0117P1PrePushGuard }
            Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
            & git reset --hard --quiet $f0117PositiveSha
        }

        foreach ($authorizationAppendMutation in @(
            @{ Content = ("`nstandardMode: allow`n"); P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID' },
            @{ Content = ("`nstandardMode: hard_block`n"); P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_INVALID' },
            @{ Content = ("`n" + '13. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`' + "`n"); P1Pattern = 'P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_AUTHORIZATION_FILE_SET_INVALID' }
        )) {
            Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $f0117AuthorizationPath -Content ($authorizationText.TrimEnd() + $authorizationAppendMutation.Content)
            & git add -- $f0117AuthorizationPath; & git commit --quiet --amend --no-edit
            Invoke-ExpectFailure -ExpectedPattern $authorizationAppendMutation.P1Pattern -Command { Invoke-F0117P1PrePushGuard }
            Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
            & git reset --hard --quiet $f0117PositiveSha
        }

        & git rm --quiet -- $f0117AuthorizationPath; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git reset --hard --quiet $f0117PositiveSha

        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path "f0117-extra.md" -Content "extra governance file"
        & git add --sparse -- f0117-extra.md; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git rm --quiet -f --sparse -- f0117-extra.md
        & git reset --hard --quiet $f0117PositiveSha

        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path "src/f0117-product.ts" -Content "export const forbidden = true;"
        & git add --sparse -- src/f0117-product.ts; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git rm --quiet -f --sparse -- src/f0117-product.ts
        & git reset --hard --quiet $f0117PositiveSha

        $queueText = [System.IO.File]::ReadAllText($f0117Queue)
        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $f0115PrePushQueuePath -Content "$queueText`n# forbidden gate projection delta"
        & git add -- $f0115PrePushQueuePath; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_GATE_PROJECTION_INVALID" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git reset --hard --quiet $f0117PositiveSha

        $projectStateText = [System.IO.File]::ReadAllText($f0117ProjectState)
        Set-F0115PrePushFixtureFile -Root $f0117FixtureRoot -Path $f0115PrePushProjectStatePath -Content $projectStateText.Replace("currentTaskId: $f0117ParentTaskId", "currentTaskId: p1-remediation-rc-02-employee-import-preflight-2026-07-17")
        & git add -- $f0115PrePushProjectStatePath; & git commit --quiet --amend --no-edit
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID task" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git reset --hard --quiet $f0117PositiveSha

        & git update-ref refs/remotes/origin/master 2807507cb
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALLOWLIST_MISMATCH" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git update-ref refs/remotes/origin/master $f0117BaseSha

        & git switch --quiet -c codex/wrong-f0117-prepush
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID pre_push" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        & git switch --quiet master

        Add-Content -LiteralPath $f0117Evidence -Value "ordinary unrelated in-progress SHA drift" -Encoding UTF8
        & git add -- $f0117EvidencePath; & git commit --quiet -m "ordinary unrelated in-progress SHA drift"
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_CONTEXT_INVALID pre_push" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "P1_PROGRAM_F0117_SPEC_APPROVAL_TRANSITION_HOTFIX_ALREADY_MATERIALIZED" -Command { Invoke-F0117P1PrePushGuard }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID" -Command { & $invokeF0117 transition_only }
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT" -Command { & $invokeF0117 standard }
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $f0117FixtureRoot) { Remove-Item -LiteralPath $f0117FixtureRoot -Recurse -Force }
}

Write-Output "Module Run v2 pre-push readiness smoke passed"
