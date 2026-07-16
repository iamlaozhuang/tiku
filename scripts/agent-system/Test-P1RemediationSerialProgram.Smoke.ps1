param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-P1RemediationSerialProgram.ps1"
$repositoryRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-remediation-program-" + [guid]::NewGuid().ToString("N"))
$bootstrapTask = "p1-remediation-program-bootstrap-2026-07-16"
$authorizationPath = "authorization.md"
$candidateOrder = @(
    "P1-RC-01",
    "P1-RC-02",
    "P1-RC-03",
    "P1-RC-04",
    "P1-RC-05",
    "P1-RC-06",
    "P1-RC-07",
    "P1-RC-08",
    "P1-RC-09",
    "P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE"
)

function New-LedgerText {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('findings:')
    for ($index = 1; $index -le 125; $index++) {
        $findingId = if ($index -eq 13) { "F-0013" } else { "P1-$($index.ToString('000'))" }
        $evidenceStatus = if ($findingId -eq "F-0013") { "runtime_evidence_required" } else { "baseline_changed" }
        $disposition = if ($findingId -eq "F-0013") { "runtime_hold" } else { "pending_deep_revalidation" }
        $lines.Add("  - findingId: `"$findingId`"")
        $lines.Add('    riskLevel: "P1"')
        $lines.Add("    evidenceStatus: `"$evidenceStatus`"")
        $lines.Add("    disposition: `"$disposition`"")
        $lines.Add('    executionStatus: "pending"')
        $lines.Add('    candidateRootCauseCluster: "P1-RC-01"')
    }
    for ($index = 1; $index -le 18; $index++) {
        $lines.Add("  - findingId: `"P2-$($index.ToString('000'))`"")
        $lines.Add('    riskLevel: "P2"')
        $lines.Add('    evidenceStatus: "baseline_changed"')
        $lines.Add('    disposition: "pending_deep_revalidation"')
        $lines.Add('    executionStatus: "pending"')
    }
    return $lines -join "`n"
}

function New-RuntimeBacklogText {
    $lines = [System.Collections.Generic.List[string]]::new()
    $lines.Add('runtimeValidations:')
    for ($index = 1; $index -le 21; $index++) {
        $lines.Add("  - runtimeValidationId: RV-$($index.ToString('0000'))")
        $lines.Add('    status: pending')
        $lines.Add('    approvalRequired: true')
    }
    return $lines -join "`n"
}

function Add-IndentToBlockChildrenWithDuplicateKey {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$BlockHeader,
        [Parameter(Mandatory = $true)][string]$DuplicateKey,
        [Parameter(Mandatory = $true)][string]$DuplicateValue
    )

    $output = [System.Collections.Generic.List[string]]::new()
    $insideBlock = $false
    $duplicateAdded = $false
    $parentIndent = -1
    foreach ($line in ($Content -split "`r?`n")) {
        if (-not $insideBlock -and $line -eq $BlockHeader) {
            $insideBlock = $true
            $parentIndent = $line.Length - $line.TrimStart().Length
            $output.Add($line)
            continue
        }
        if ($insideBlock -and -not [string]::IsNullOrWhiteSpace($line) -and ($line.Length - $line.TrimStart().Length) -le $parentIndent) {
            $insideBlock = $false
        }
        if ($insideBlock) {
            $originalIndent = $line.Length - $line.TrimStart().Length
            $output.Add("  $line")
            if (-not $duplicateAdded -and $originalIndent -eq ($parentIndent + 2) -and $line -match "^\s+$([regex]::Escape($DuplicateKey)):") {
                $output.Add((' ' * ($parentIndent + 4)) + "$DuplicateKey`: $DuplicateValue")
                $duplicateAdded = $true
            }
        } else {
            $output.Add($line)
        }
    }
    if (-not $duplicateAdded) { throw "Failed to build nonstandard-indent fixture for $BlockHeader/$DuplicateKey" }
    return $output -join "`n"
}

function Add-WrapperToBlock {
    param(
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$BlockHeader
    )

    $output = [System.Collections.Generic.List[string]]::new()
    $insideBlock = $false
    $parentIndent = -1
    foreach ($line in ($Content -split "`r?`n")) {
        if (-not $insideBlock -and $line -eq $BlockHeader) {
            $insideBlock = $true
            $parentIndent = $line.Length - $line.TrimStart().Length
            $output.Add($line)
            $output.Add((' ' * ($parentIndent + 2)) + 'wrapper:')
            continue
        }
        if ($insideBlock -and -not [string]::IsNullOrWhiteSpace($line) -and ($line.Length - $line.TrimStart().Length) -le $parentIndent) {
            $insideBlock = $false
        }
        if ($insideBlock) { $output.Add("  $line") } else { $output.Add($line) }
    }
    return $output -join "`n"
}

function Get-FileFingerprint {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    try {
        $sha256 = [System.Security.Cryptography.SHA256]::Create()
        try {
            $hash = ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace("-", "")
        } finally {
            $sha256.Dispose()
        }
    } finally {
        $stream.Dispose()
    }
    $item = Get-Item -LiteralPath $Path
    return "$hash|$($item.LastWriteTimeUtc.Ticks)|$($item.Length)"
}

$candidateList = ($candidateOrder | ForEach-Object { "    - $_" }) -join "`n"
$baseState = @"
schemaVersion: 1
p1RemediationSerialProgram:
  programId: p1-remediation-2026-07-16
  status: in_progress
  activityStatePolicy: wip_one_dynamic_task_materialization
  baselineSha: 4cd2792f57d4eea3ac2770598b5490ebcfdead51
  p0ProductStaticBaselineSha: e136ca28acde82282a17c65ccfb828a01e872c0b
  auditRepositorySha: a84224fa12ec85b28e6acd945deba2afa28c6c02
  currentTaskId: $bootstrapTask
  currentCandidateClusterId: P1-RC-01
  candidateClusterOrder:
$candidateList
  materializedTaskIds:
    - $bootstrapTask
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  postP0MapPath: post-p0-map.yaml
  clusterPath: clusters.yaml
  runtimeBacklogPath: runtime-backlog.yaml
  guardScriptPath: guard.ps1
  findingCounts:
    p1: 125
    p2: 18
  runtimeValidationCount: 21
  p2Implementation:
    approved: false
    status: impact_mapping_only
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $bootstrapTask`: in_progress
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $bootstrapTask
  status: in_progress
standingAuthorization:
  source: $authorizationPath
"@

$baseQueue = @"
schemaVersion: 1
p1RemediationSerialProgram:
  programId: p1-remediation-2026-07-16
  status: in_progress
  activityStatePolicy: wip_one_dynamic_task_materialization
  baselineSha: 4cd2792f57d4eea3ac2770598b5490ebcfdead51
  p0ProductStaticBaselineSha: e136ca28acde82282a17c65ccfb828a01e872c0b
  auditRepositorySha: a84224fa12ec85b28e6acd945deba2afa28c6c02
  currentTaskId: $bootstrapTask
  currentCandidateClusterId: P1-RC-01
  candidateClusterOrder:
$candidateList
  materializedTaskIds:
    - $bootstrapTask
  completedTaskIds: []
  standingAuthorizationSource: $authorizationPath
  serialPlanPath: serial-plan.md
  findingLedgerPath: finding-ledger.yaml
  postP0MapPath: post-p0-map.yaml
  clusterPath: clusters.yaml
  runtimeBacklogPath: runtime-backlog.yaml
  guardScriptPath: guard.ps1
  findingCounts:
    p1: 125
    p2: 18
  runtimeValidationCount: 21
  p2Implementation:
    approved: false
    status: impact_mapping_only
  runtimeAcceptance:
    approved: false
    status: excluded_from_program
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
  taskStatusById:
    $bootstrapTask`: in_progress
activeTasks:
  - id: $bootstrapTask
    status: in_progress
    taskKind: mechanism_hardening
    executionStage: verification_complete
    branch: codex/bootstrap-fixture
    worktreePath: bootstrap-worktree-fixture
    executionProfile: R3
    authorizationSource: $authorizationPath
    reviewMode: evidence_two_rounds
    planPath: task-plan.md
    evidencePath: evidence.md
    auditReviewPath: audit.md
    allowedFiles:
      - state.yaml
      - queue.yaml
      - task-plan.md
      - evidence.md
      - audit.md
    blockedFiles:
      - src/**
      - tests/**
      - package.json
    capabilities:
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      browserRuntimeValidation: blocked_out_of_program
      p2Implementation: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    closeoutPolicy:
      authorizationSource: $authorizationPath
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
standingAuthorization:
  source: $authorizationPath
"@

$basePlan = @"
# P1 Serial Program

| Order | Candidate | Meaning |
| --- | --- | --- |
| 01 | ``P1-RC-01`` | identity |
| 02 | ``P1-RC-02`` | organization |
| 03 | ``P1-RC-03`` | authorization |
| 04 | ``P1-RC-04`` | API |
| 05 | ``P1-RC-05`` | content |
| 06 | ``P1-RC-06`` | knowledge |
| 07 | ``P1-RC-07`` | AI |
| 08 | ``P1-RC-08`` | learner |
| 09 | ``P1-RC-09`` | training |
| 10 | ``P1-GLOBAL-STATIC-REGRESSION-BASELINE-FREEZE`` | freeze |
"@

$baseEvidence = @"
# Evidence

- Evidence status: pass
- Result: pass

## Requirement Mapping Result

pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## Round 1 — Root cause and state machine

Result: pass

## Round 2 — Approval and recovery

Result: pass

## Validation Results

Result: pass
"@

$baseAudit = @"
# Audit

## Round 1 — Root cause and state machine

Result: pass

## Round 2 — Approval and recovery

Result: pass

## Final Disposition

Decision: APPROVE
"@

function Write-CaseFiles {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$StateText,
        [Parameter(Mandatory = $true)][string]$QueueText,
        [Parameter(Mandatory = $false)][string]$LedgerText = (New-LedgerText),
        [Parameter(Mandatory = $false)][string]$RuntimeText = (New-RuntimeBacklogText)
    )

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $root "state.yaml") -Value $StateText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "queue.yaml") -Value $QueueText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "serial-plan.md") -Value $basePlan -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "task-plan.md") -Value "## SSOT Read List`n`n- docs/01-requirements/00-index.md`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "evidence.md") -Value $baseEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "audit.md") -Value $baseAudit -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root $authorizationPath) -Value "Status: approved`nhuman approval`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "finding-ledger.yaml") -Value $LedgerText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "post-p0-map.yaml") -Value $LedgerText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "clusters.yaml") -Value "clusters: []`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "runtime-backlog.yaml") -Value $RuntimeText -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $root "guard.ps1") -Value "# fixture`n" -Encoding UTF8
    return $root
}

function Invoke-Guard {
    param([Parameter(Mandatory = $true)][string]$Root, [string[]]$ChangedFiles = @())

    return @(
        & $guardPath `
            -RepositoryRoot $Root `
            -ProjectStatePath "state.yaml" `
            -QueuePath "queue.yaml" `
            -AuditRepositoryRoot $Root `
            -Phase manual `
            -ChangedFiles $ChangedFiles `
            -SkipGitChecks `
            -SkipExternalIntegrityChecks
    )
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Pattern,
        [string[]]$ChangedFiles = @()
    )

    $failed = $false
    try {
        $output = Invoke-Guard -Root $Root -ChangedFiles $ChangedFiles
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)`n$($_.ScriptStackTrace)"
        }
    }
    if (-not $failed) {
        throw "Negative P1 Program fixture unexpectedly passed.`n$($output -join "`n")"
    }
}

function Assert-PrePushFailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$RemoteName,
        [Parameter(Mandatory = $true)][string]$RemoteUrl,
        [Parameter(Mandatory = $true)][string]$UpdateLine,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $failed = $false
    try {
        & $guardPath -RepositoryRoot $Root -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $Root -Phase pre_push -PushRemoteName $RemoteName -PushRemoteUrl $RemoteUrl -PushUpdateLines $UpdateLine -SkipExternalIntegrityChecks
    } catch {
        $failed = $true
        if ($_.Exception.Message -notmatch $Pattern) { throw "Expected '$Pattern', got:`n$($_.Exception.Message)" }
    }
    if (-not $failed) { throw "Negative pre-push fixture unexpectedly passed." }
}

try {
    $prePushHookPath = Join-Path $repositoryRoot ".husky\pre-push"
    $prePushHookText = Get-Content -LiteralPath $prePushHookPath -Raw -Encoding UTF8
    $pushUpdateCaptureIndex = $prePushHookText.IndexOf('push_updates=$(cat)')
    $p1GuardIndex = $prePushHookText.IndexOf('Test-P1RemediationSerialProgram.ps1')
    $moduleGuardIndex = $prePushHookText.IndexOf('Test-ModuleRunV2PrePushReadiness.ps1')
    if ($pushUpdateCaptureIndex -lt 0 -or $p1GuardIndex -lt 0 -or $moduleGuardIndex -lt 0 -or $pushUpdateCaptureIndex -gt $p1GuardIndex -or $p1GuardIndex -gt $moduleGuardIndex) {
        throw "Pre-push hook does not preserve stdin and run P1 transition validation before Module Run."
    }
    if ($prePushHookText -notmatch 'p1TransitionScopeMode: transition_only' -or $prePushHookText -notmatch '-P1TransitionScopeMode transition_only') {
        throw "Pre-push hook does not conditionally forward the P1 transition-only scope mode."
    }

    $positiveRoot = Write-CaseFiles -Name "positive" -StateText $baseState -QueueText $baseQueue
    $positiveOutput = Invoke-Guard -Root $positiveRoot -ChangedFiles @("state.yaml", "queue.yaml")
    if (($positiveOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") {
        throw "Positive P1 Program fixture did not report pass.`n$($positiveOutput -join "`n")"
    }

    $dotfileAliasQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - .governance-hook")
    $dotfileAliasRoot = Write-CaseFiles -Name "dotfile-alias" -StateText $baseState -QueueText $dotfileAliasQueue
    Set-Content -LiteralPath (Join-Path $dotfileAliasRoot "governance-hook") -Value "alias must not match a dotfile allowlist entry" -Encoding UTF8
    Assert-FailsWith -Root $dotfileAliasRoot -ChangedFiles @("governance-hook", "evidence.md", "audit.md") -Pattern "P1_PROGRAM_ALLOWED_FILES_VIOLATION governance-hook"

    $reorderedList = $candidateList.Replace("    - P1-RC-01`n    - P1-RC-02", "    - P1-RC-02`n    - P1-RC-01")
    $reorderedRoot = Write-CaseFiles -Name "reordered" -StateText $baseState.Replace($candidateList, $reorderedList) -QueueText $baseQueue.Replace($candidateList, $reorderedList)
    Assert-FailsWith -Root $reorderedRoot -Pattern "P1_PROGRAM_CANDIDATE_ORDER_MISMATCH"

    $duplicateProgramStateRoot = Write-CaseFiles -Name "duplicate-program-state" -StateText ($baseState + "`np1RemediationSerialProgram:`n  programId: fake-last-wins`n") -QueueText $baseQueue
    Assert-FailsWith -Root $duplicateProgramStateRoot -Pattern "P1_PROGRAM_DUPLICATE_TOP_LEVEL_KEY project-state p1RemediationSerialProgram"

    $duplicateProgramQueueRoot = Write-CaseFiles -Name "duplicate-program-queue" -StateText $baseState -QueueText ($baseQueue + "`np1RemediationSerialProgram:`n  programId: fake-last-wins`n")
    Assert-FailsWith -Root $duplicateProgramQueueRoot -Pattern "P1_PROGRAM_DUPLICATE_TOP_LEVEL_KEY task-queue p1RemediationSerialProgram"

    $quotedProgramRoot = Write-CaseFiles -Name "quoted-program-key" -StateText ($baseState + "`n`"p1RemediationSerialProgram`":`n  programId: fake-last-wins`n") -QueueText $baseQueue
    Assert-FailsWith -Root $quotedProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $spacedProgramRoot = Write-CaseFiles -Name "spaced-program-key" -StateText $baseState -QueueText ($baseQueue + "`np1RemediationSerialProgram :`n  programId: fake-last-wins`n")
    Assert-FailsWith -Root $spacedProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $mergeProgramRoot = Write-CaseFiles -Name "merge-program-key" -StateText ($baseState + "`n<<: *successor`n") -QueueText $baseQueue
    Assert-FailsWith -Root $mergeProgramRoot -Pattern "P1_PROGRAM_NONCANONICAL_YAML_KEY"

    $duplicateChildProgramIdState = $baseState.Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress", "  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins`n  status: in_progress")
    $duplicateChildProgramIdRoot = Write-CaseFiles -Name "duplicate-child-program-id" -StateText $duplicateChildProgramIdState -QueueText $baseQueue
    Assert-FailsWith -Root $duplicateChildProgramIdRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $duplicateChildStatusQueue = $baseQueue.Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress", "  programId: p1-remediation-2026-07-16`n  status: in_progress`n  status: closed")
    $duplicateChildStatusRoot = Write-CaseFiles -Name "duplicate-child-status" -StateText $baseState -QueueText $duplicateChildStatusQueue
    Assert-FailsWith -Root $duplicateChildStatusRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*status"

    $fourSpaceProgramState = Add-IndentToBlockChildrenWithDuplicateKey -Content $baseState -BlockHeader "p1RemediationSerialProgram:" -DuplicateKey "programId" -DuplicateValue "fake-last-wins"
    $fourSpaceProgramRoot = Write-CaseFiles -Name "four-space-program-duplicate" -StateText $fourSpaceProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $fourSpaceProgramRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $nonstandardCloseoutQueue = Add-IndentToBlockChildrenWithDuplicateKey -Content $baseQueue -BlockHeader "    closeoutPolicy:" -DuplicateKey "authorizationSource" -DuplicateValue "fake-last-wins"
    $nonstandardCloseoutRoot = Write-CaseFiles -Name "nonstandard-closeout-duplicate" -StateText $baseState -QueueText $nonstandardCloseoutQueue
    Assert-FailsWith -Root $nonstandardCloseoutRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*authorizationSource"

    $commentPoisonProgramState = $baseState.Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16", "p1RemediationSerialProgram:`n # ignored YAML comment`n  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins")
    $commentPoisonProgramRoot = Write-CaseFiles -Name "comment-poison-program" -StateText $commentPoisonProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $commentPoisonProgramRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*programId"

    $commentPoisonCloseoutQueue = $baseQueue.Replace("    closeoutPolicy:`n      authorizationSource:", "    closeoutPolicy:`n     # ignored YAML comment`n      authorizationSource: fake-first`n      authorizationSource:")
    $commentPoisonCloseoutRoot = Write-CaseFiles -Name "comment-poison-closeout" -StateText $baseState -QueueText $commentPoisonCloseoutQueue
    Assert-FailsWith -Root $commentPoisonCloseoutRoot -Pattern "P1_PROGRAM_DUPLICATE_MAPPING_KEY.*authorizationSource"

    $wrappedProgramState = Add-WrapperToBlock -Content $baseState -BlockHeader "p1RemediationSerialProgram:"
    $wrappedProgramRoot = Write-CaseFiles -Name "wrapped-program" -StateText $wrappedProgramState -QueueText $baseQueue
    Assert-FailsWith -Root $wrappedProgramRoot -Pattern "P1_PROGRAM_ID_INVALID"

    $wrappedCloseoutQueue = Add-WrapperToBlock -Content $baseQueue -BlockHeader "    closeoutPolicy:"
    $wrappedCloseoutRoot = Write-CaseFiles -Name "wrapped-closeout" -StateText $baseState -QueueText $wrappedCloseoutQueue
    Assert-FailsWith -Root $wrappedCloseoutRoot -Pattern "P1_PROGRAM_TASK_AUTHORIZATION_SOURCE_INVALID|P1_PROGRAM_CLOSEOUT_POLICY_INVALID"

    $secondTask = "p1-remediation-identity-phone-uniqueness-2026-07-16"
    $multiState = $baseState.Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $secondTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: in_progress`n    $secondTask`: in_progress")
    $multiQueue = $baseQueue.Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $secondTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: in_progress`n    $secondTask`: in_progress")
    $multiRoot = Write-CaseFiles -Name "multi-wip" -StateText $multiState -QueueText $multiQueue
    Assert-FailsWith -Root $multiRoot -Pattern "P1_PROGRAM_MULTIPLE_ACTIVE_TASKS"

    $p2Queue = $baseQueue.Replace("p2Implementation: blocked_out_of_program", "p2Implementation: approved")
    $p2Root = Write-CaseFiles -Name "p2" -StateText $baseState -QueueText $p2Queue
    Assert-FailsWith -Root $p2Root -Pattern "P1_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED.*p2Implementation"

    $runtimeQueue = $baseQueue.Replace("browserRuntimeValidation: blocked_out_of_program", "browserRuntimeValidation: approved")
    $runtimeRoot = Write-CaseFiles -Name "runtime" -StateText $baseState -QueueText $runtimeQueue
    Assert-FailsWith -Root $runtimeRoot -Pattern "P1_PROGRAM_BLOCKED_CAPABILITY_NOT_PRESERVED.*browserRuntimeValidation"

    $f0013Ledger = (New-LedgerText).Replace('evidenceStatus: "runtime_evidence_required"', 'evidenceStatus: "baseline_changed"')
    $f0013Root = Write-CaseFiles -Name "f0013" -StateText $baseState -QueueText $baseQueue -LedgerText $f0013Ledger
    Assert-FailsWith -Root $f0013Root -Pattern "P1_PROGRAM_F0013_RUNTIME_HOLD_CHANGED"

    $p2Ledger = (New-LedgerText).Replace(
        "findingId: `"P2-001`"`n    riskLevel: `"P2`"`n    evidenceStatus: `"baseline_changed`"`n    disposition: `"pending_deep_revalidation`"`n    executionStatus: `"pending`"",
        "findingId: `"P2-001`"`n    riskLevel: `"P2`"`n    evidenceStatus: `"baseline_changed`"`n    disposition: `"remediation_required`"`n    executionStatus: `"in_progress`""
    )
    $p2LedgerRoot = Write-CaseFiles -Name "p2-ledger" -StateText $baseState -QueueText $baseQueue -LedgerText $p2Ledger
    Assert-FailsWith -Root $p2LedgerRoot -Pattern "P1_PROGRAM_P2_EXECUTION_STARTED"

    $scopeRoot = Write-CaseFiles -Name "scope" -StateText $baseState -QueueText $baseQueue
    Assert-FailsWith -Root $scopeRoot -Pattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION" -ChangedFiles @("src/app/page.tsx")

    $pushRoot = Write-CaseFiles -Name "push" -StateText $baseState -QueueText $baseQueue.Replace("target: origin/master", "target: origin/other")
    Assert-FailsWith -Root $pushRoot -Pattern "P1_PROGRAM_CLOSEOUT_POLICY_INVALID.*push"

    $missingRoot = Write-CaseFiles -Name "missing" -StateText $baseState -QueueText $baseQueue
    Remove-Item -LiteralPath (Join-Path $missingRoot "post-p0-map.yaml")
    Assert-FailsWith -Root $missingRoot -Pattern "P1_PROGRAM_ARTIFACT_MISSING.*post_p0_map"

    $pendingReviewRoot = Write-CaseFiles -Name "pending-review" -StateText $baseState -QueueText $baseQueue
    Set-Content -LiteralPath (Join-Path $pendingReviewRoot "evidence.md") -Value $baseEvidence.Replace("Result: pass", "Pending.") -Encoding UTF8
    Assert-FailsWith -Root $pendingReviewRoot -Pattern "P1_PROGRAM_REVIEW_NOT_FINAL"

    $missingBranchRoot = Write-CaseFiles -Name "missing-branch" -StateText $baseState -QueueText $baseQueue.Replace("    branch: codex/bootstrap-fixture`n", "")
    Assert-FailsWith -Root $missingBranchRoot -Pattern "P1_PROGRAM_TASK_BOUNDARY_MISSING.*branch"

    $missingWorktreeRoot = Write-CaseFiles -Name "missing-worktree" -StateText $baseState -QueueText $baseQueue.Replace("    worktreePath: bootstrap-worktree-fixture`n", "")
    Assert-FailsWith -Root $missingWorktreeRoot -Pattern "P1_PROGRAM_TASK_BOUNDARY_MISSING.*worktreePath"

    $artifactEscapeRoot = Write-CaseFiles -Name "artifact-escape" -StateText $baseState -QueueText $baseQueue.Replace("planPath: task-plan.md", "planPath: ../task-plan.md")
    Assert-FailsWith -Root $artifactEscapeRoot -Pattern "P1_PROGRAM_TASK_ARTIFACT_OUTSIDE_REPOSITORY"

    $approvalQueue = $baseQueue.Replace("schemaMigration: blocked_without_fresh_approval", "schemaMigration: approved`n    freshApprovalSource: README.md")
    $approvalRoot = Write-CaseFiles -Name "approval-laundering" -StateText $baseState -QueueText $approvalQueue
    Set-Content -LiteralPath (Join-Path $approvalRoot "README.md") -Value "Status: approved`nhuman approval`n$bootstrapTask`nschemaMigration`n" -Encoding UTF8
    Assert-FailsWith -Root $approvalRoot -Pattern "P1_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING"

    $selfScopeQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - src/**").Replace("      - src/**`n", "")
    $selfScopeRoot = Write-CaseFiles -Name "scope-self-modification" -StateText $baseState -QueueText $selfScopeQueue
    Assert-FailsWith -Root $selfScopeRoot -Pattern "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE" -ChangedFiles @("queue.yaml", "src/app/page.tsx")

    $staleReviewQueue = $baseQueue.Replace("      - audit.md", "      - audit.md`n      - src/**").Replace("      - src/**`n      - tests/**", "      - tests/**")
    $staleReviewRoot = Write-CaseFiles -Name "stale-review" -StateText $baseState -QueueText $staleReviewQueue
    Assert-FailsWith -Root $staleReviewRoot -Pattern "P1_PROGRAM_IMPLEMENTATION_WITHOUT_FRESH_REVIEW" -ChangedFiles @("src/app/page.tsx")

    $controlPath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
    $controlRewriteQueue = $baseQueue.Replace("taskKind: mechanism_hardening", "taskKind: remediation").Replace("      - audit.md", "      - audit.md`n      - $controlPath")
    $controlRewriteRoot = Write-CaseFiles -Name "control-rewrite" -StateText $baseState -QueueText $controlRewriteQueue
    Assert-FailsWith -Root $controlRewriteRoot -Pattern "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*Test-P1RemediationSerialProgram.ps1" -ChangedFiles @($controlPath)

    $fakeLedger = (New-LedgerText).Replace('findingId: "P1-001"', 'findingId: "P1-999"')
    $fakeIdRoot = Write-CaseFiles -Name "fake-id" -StateText $baseState -QueueText $baseQueue -LedgerText $fakeLedger
    Set-Content -LiteralPath (Join-Path $fakeIdRoot "post-p0-map.yaml") -Value (New-LedgerText) -Encoding UTF8
    Assert-FailsWith -Root $fakeIdRoot -Pattern "P1_PROGRAM_FINDING_ID_SET_MISMATCH"

    $omittedTask = "p1-remediation-omitted-closeout-2026-07-16"
    $omittedState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $omittedTask").Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $omittedTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $omittedTask`: in_progress")
    $omittedQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $omittedTask").Replace("    - $bootstrapTask`n  completedTaskIds", "    - $bootstrapTask`n    - $omittedTask`n  completedTaskIds").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $omittedTask`: in_progress")
    $omittedRoot = Write-CaseFiles -Name "omitted-closeout" -StateText $omittedState -QueueText $omittedQueue
    Assert-FailsWith -Root $omittedRoot -Pattern "P1_PROGRAM_MATERIALIZED_COMPLETED_PARTITION_INVALID"

    $prePushRoot = Write-CaseFiles -Name "pre-push-contract" -StateText $baseState -QueueText $baseQueue
    $prePushRemote = Join-Path $smokeRoot "pre-push-remote.git"
    New-Item -ItemType Directory -Path (Join-Path $prePushRoot "src") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $prePushRoot "src/deleted.ts") -Value "export const deletedFixture = true;`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $prePushRoot "src/renamed.ts") -Value "export const renamedFixture = true;`n" -Encoding UTF8
    & git -C $prePushRoot init -b master *> $null
    & git -C $prePushRoot config user.name "P1 Guard Smoke"
    & git -C $prePushRoot config user.email "p1-guard-smoke@example.invalid"
    & git -C $prePushRoot config core.autocrlf false
    & git -C $prePushRoot add .
    & git -C $prePushRoot commit -m "fixture" *> $null
    & git init --bare $prePushRemote *> $null
    & git -C $prePushRoot remote add origin $prePushRemote
    & git -C $prePushRoot push --quiet -u origin master 2>$null
    $prePushHead = ((& git -C $prePushRoot rev-parse HEAD) -join "").Trim()
    $prePushOriginUrl = ((& git -C $prePushRoot remote get-url origin) -join "").Trim()
    $validUpdateLine = "refs/heads/master $prePushHead refs/heads/master $prePushHead"
    $validPrePushOutput = @(& $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $prePushOriginUrl -PushUpdateLines $validUpdateLine -SkipExternalIntegrityChecks)
    if (($validPrePushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive pre-push contract fixture failed." }
    if (($validPrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") { throw "Ordinary pre-push fixture did not preserve standard scope mode." }
    $stdinPrePushOutput = @($validUpdateLine | & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $prePushOriginUrl -SkipExternalIntegrityChecks)
    if (($stdinPrePushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive redirected-stdin pre-push fixture failed." }
    Assert-PrePushFailsWith -Root $prePushRoot -RemoteName "backup" -RemoteUrl $prePushOriginUrl -UpdateLine $validUpdateLine -Pattern "P1_PROGRAM_PRE_PUSH_REMOTE_INVALID"
    $wrongRefLine = "refs/heads/master $prePushHead refs/heads/other $prePushHead"
    Assert-PrePushFailsWith -Root $prePushRoot -RemoteName "origin" -RemoteUrl $prePushOriginUrl -UpdateLine $wrongRefLine -Pattern "P1_PROGRAM_PRE_PUSH_REF_INVALID"

    Remove-Item -LiteralPath (Join-Path $prePushRoot "src/deleted.ts")
    & git -C $prePushRoot add -A
    $deleteFailed = $false
    try {
        & $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $deleteFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*src/deleted.ts") { throw }
    }
    if (-not $deleteFailed) { throw "Staged deletion fixture unexpectedly passed." }
    & git -C $prePushRoot restore --staged src/deleted.ts
    & git -C $prePushRoot restore src/deleted.ts

    & git -C $prePushRoot mv src/renamed.ts src/renamed-new.ts
    $renameFailed = $false
    try {
        & $guardPath -RepositoryRoot $prePushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $prePushRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $renameFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_BLOCKED_FILES_VIOLATION.*src/renamed") { throw }
    }
    if (-not $renameFailed) { throw "Staged rename fixture unexpectedly passed." }

    $transitionRoot = Write-CaseFiles -Name "task-transition" -StateText $baseState -QueueText $baseQueue
    $transitionRemote = Join-Path $smokeRoot "transition-remote.git"
    & git -C $transitionRoot init -b master *> $null
    & git -C $transitionRoot config user.name "P1 Transition Smoke"
    & git -C $transitionRoot config user.email "p1-transition-smoke@example.invalid"
    & git -C $transitionRoot config core.autocrlf false
    & git -C $transitionRoot add .
    & git -C $transitionRoot commit -m "bootstrap parent" *> $null
    & git init --bare $transitionRemote *> $null
    & git -C $transitionRoot remote add origin $transitionRemote
    & git -C $transitionRoot push --quiet -u origin master 2>$null
    & git -C $transitionRoot switch --quiet -c codex/transition-scope 2>$null

    $transitionTask = "p1-remediation-transition-fixture-2026-07-16"
    $oldCheckpointBlock = @"
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $bootstrapTask
  status: in_progress
"@
    $newCheckpointBlock = @"
  closeoutCheckpoints:
    $bootstrapTask`:
      taskCommit: pass
      masterMerge: pass
      originMasterSync: pass
      worktreeCleanup: pass
      shortBranchCleanup: pass
    $transitionTask`:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
currentTask:
  id: $transitionTask
  status: in_progress
"@
    $transitionState = $baseState.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $transitionTask").Replace("    - $bootstrapTask`n  completedTaskIds: []", "    - $bootstrapTask`n    - $transitionTask`n  completedTaskIds:`n    - $bootstrapTask").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $transitionTask`: in_progress").Replace($oldCheckpointBlock, $newCheckpointBlock)

    $transitionTaskBlock = @"
  - id: $transitionTask
    status: in_progress
    taskKind: remediation
    executionStage: scope_frozen
    branch: codex/transition-scope
    worktreePath: $transitionRoot
    executionProfile: R3
    authorizationSource: $authorizationPath
    candidateRootCauseCluster: P1-RC-01
    findingIds:
      - P1-001
    authorityPath: identity writer
    businessInvariant: unique identity
    adversarialFailureMode: duplicate identity
    rollbackOrStopCondition: stop on requirement conflict
    reviewMode: evidence_two_rounds
    planPath: next-plan.md
    evidencePath: next-evidence.md
    auditReviewPath: next-audit.md
    allowedFiles:
      - state.yaml
      - queue.yaml
      - next-plan.md
      - next-evidence.md
      - next-audit.md
      - src/**
      - tests/**
    blockedFiles:
      - package.json
      - pnpm-lock.yaml
    capabilities:
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      browserRuntimeValidation: blocked_out_of_program
      p2Implementation: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    closeoutPolicy:
      authorizationSource: $authorizationPath
      localCommit:
        approved: true
      fastForwardMerge:
        approved: true
        targetBranch: master
      push:
        approved: true
        target: origin/master
      cleanup:
        deleteShortBranch: true
"@
    $transitionQueue = $baseQueue.Replace("currentTaskId: $bootstrapTask", "currentTaskId: $transitionTask").Replace("    - $bootstrapTask`n  completedTaskIds: []", "    - $bootstrapTask`n    - $transitionTask`n  completedTaskIds:`n    - $bootstrapTask").Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: closed`n    $transitionTask`: in_progress").Replace("  - id: $bootstrapTask`n    status: in_progress", "  - id: $bootstrapTask`n    status: closed").Replace("standingAuthorization:", "$transitionTaskBlock`nstandingAuthorization:")

    $scopeEvidence = @"
# Scope Evidence

- Evidence status: scope_frozen
- Result: pass

## Requirement Mapping Result

pass

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## JIT Revalidation Result

Result: pass

## Scope Freeze

Result: pass
"@
    $scopeAudit = @"
# Scope Audit

## Round 1 — JIT root cause

Result: pass

## Round 2 — Scope and approval

Result: pass

## Transition Disposition

Decision: APPROVE_SCOPE
"@
    Set-Content -LiteralPath (Join-Path $transitionRoot "state.yaml") -Value $transitionState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-plan.md") -Value "# Next plan`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-evidence.md") -Value $scopeEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $transitionRoot "next-audit.md") -Value $scopeAudit -Encoding UTF8
    & git -C $transitionRoot add state.yaml queue.yaml next-plan.md next-evidence.md next-audit.md

    $aliasTransitionQueue = $transitionQueue.Replace("evidencePath: next-evidence.md", "evidencePath: subdir/../evidence.md")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $aliasTransitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $aliasFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $aliasFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_ARTIFACT_PATH_REUSED") { throw }
    }
    if (-not $aliasFailed) { throw "Predecessor artifact alias fixture unexpectedly passed." }

    $mutatedParentQueue = $transitionQueue.Replace("      - audit.md", "      - audit.md`n      - predecessor-extra.md")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $mutatedParentQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $parentContractFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $parentContractFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PARENT_TASK_CONTRACT_CHANGED") { throw }
    }
    if (-not $parentContractFailed) { throw "Parent task contract mutation fixture unexpectedly passed." }

    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml

    $fakeBranchQueue = $transitionQueue.Replace("branch: codex/transition-scope", "branch: codex/fake-transition-scope")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $fakeBranchQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $fakeBranchFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $fakeBranchFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_BRANCH_BINDING_MISMATCH") { throw }
    }
    if (-not $fakeBranchFailed) { throw "Fake current-task branch fixture unexpectedly passed." }

    $fakeWorktreePath = Join-Path $transitionRoot "fake-worktree"
    $fakeWorktreeQueue = $transitionQueue.Replace("worktreePath: $transitionRoot", "worktreePath: $fakeWorktreePath")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $fakeWorktreeQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $fakeWorktreeFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $fakeWorktreeFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TASK_WORKTREE_BINDING_MISMATCH") { throw }
    }
    if (-not $fakeWorktreeFailed) { throw "Fake current-task worktree fixture unexpectedly passed." }

    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $transitionQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    & git -C $transitionRoot branch codex/bootstrap-fixture master
    $branchCleanupFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $branchCleanupFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_BRANCH_NOT_CLEANED") { throw }
    }
    if (-not $branchCleanupFailed) { throw "Residual predecessor branch fixture unexpectedly passed." }
    & git -C $transitionRoot branch -D codex/bootstrap-fixture *> $null

    $residualWorktreePath = Join-Path $transitionRoot "bootstrap-worktree-fixture"
    New-Item -ItemType Directory -Path $residualWorktreePath -Force | Out-Null
    $worktreeCleanupFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $worktreeCleanupFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_WORKTREE_NOT_CLEANED") { throw }
    }
    if (-not $worktreeCleanupFailed) { throw "Residual predecessor worktree fixture unexpectedly passed." }
    Remove-Item -LiteralPath $residualWorktreePath -Recurse -Force

    $transitionOutput = @(& $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($transitionOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Positive task-transition fixture failed." }
    & git -C $transitionRoot commit -m "freeze next task scope" *> $null
    $transitionHead = ((& git -C $transitionRoot rev-parse HEAD) -join "").Trim()
    $transitionOrigin = ((& git -C $transitionRoot rev-parse origin/master) -join "").Trim()
    $transitionOriginUrl = ((& git -C $transitionRoot remote get-url origin) -join "").Trim()
    $transitionUpdate = "refs/heads/master $transitionHead refs/heads/master $transitionOrigin"
    $transitionPrePushOutput = @(& $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $transitionOriginUrl -PushUpdateLines $transitionUpdate -SkipExternalIntegrityChecks)
    if (($transitionPrePushOutput -join "`n") -notmatch "p1TransitionScopeMode: transition_only") { throw "Governance-only task transition did not emit transition-only scope mode." }
    & git -C $transitionRoot push --quiet origin HEAD:master 2>$null

    $washedQueue = $transitionQueue.Replace("      - src/**", "      - src/**`n      - src/expanded/**")
    Set-Content -LiteralPath (Join-Path $transitionRoot "queue.yaml") -Value $washedQueue -Encoding UTF8
    & git -C $transitionRoot add queue.yaml
    $washFailed = $false
    try {
        & $guardPath -RepositoryRoot $transitionRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $transitionRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $washFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION") { throw }
    }
    if (-not $washFailed) { throw "Two-step scope laundering fixture unexpectedly passed." }

    $pendingParentRoot = Write-CaseFiles -Name "pending-parent-transition" -StateText $baseState -QueueText $baseQueue
    $pendingParentRemote = Join-Path $smokeRoot "pending-parent-remote.git"
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "evidence.md") -Value $baseEvidence.Replace("Result: pass", "Pending.") -Encoding UTF8
    & git -C $pendingParentRoot init -b master *> $null
    & git -C $pendingParentRoot config user.name "P1 Pending Parent Smoke"
    & git -C $pendingParentRoot config user.email "p1-pending-parent-smoke@example.invalid"
    & git -C $pendingParentRoot config core.autocrlf false
    & git -C $pendingParentRoot add .
    & git -C $pendingParentRoot commit -m "pending bootstrap parent" *> $null
    & git init --bare $pendingParentRemote *> $null
    & git -C $pendingParentRoot remote add origin $pendingParentRemote
    & git -C $pendingParentRoot push --quiet -u origin master 2>$null
    & git -C $pendingParentRoot switch --quiet -c codex/transition-scope 2>$null
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "evidence.md") -Value $baseEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "state.yaml") -Value $transitionState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "queue.yaml") -Value $transitionQueue.Replace("worktreePath: $transitionRoot", "worktreePath: $pendingParentRoot") -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-plan.md") -Value "# Next plan`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-evidence.md") -Value $scopeEvidence -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $pendingParentRoot "next-audit.md") -Value $scopeAudit -Encoding UTF8
    & git -C $pendingParentRoot add state.yaml queue.yaml next-plan.md next-evidence.md next-audit.md
    $pendingParentFailed = $false
    try {
        & $guardPath -RepositoryRoot $pendingParentRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $pendingParentRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $pendingParentFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_TRANSITION_PREDECESSOR_REVIEW_NOT_FINAL") { throw }
    }
    if (-not $pendingParentFailed) { throw "Pending parent commit laundering fixture unexpectedly passed." }

    $closeoutRoot = Write-CaseFiles -Name "same-task-closeout" -StateText $baseState -QueueText $baseQueue
    $closeoutParentQueue = $baseQueue.Replace("worktreePath: bootstrap-worktree-fixture", "worktreePath: $closeoutRoot")
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $closeoutParentQueue -Encoding UTF8
    & git -C $closeoutRoot init -b master *> $null
    & git -C $closeoutRoot config user.name "P1 Closeout Smoke"
    & git -C $closeoutRoot config user.email "p1-closeout-smoke@example.invalid"
    & git -C $closeoutRoot config core.autocrlf false
    & git -C $closeoutRoot add .
    & git -C $closeoutRoot commit -m "create active bootstrap task" *> $null
    & git -C $closeoutRoot switch --quiet -c codex/bootstrap-fixture 2>$null
    $closeoutState = $baseState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutState = [regex]::Replace($closeoutState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $closeoutQueue = $closeoutParentQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutQueue = [regex]::Replace($closeoutQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutRoot "state.yaml") -Value $closeoutState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $closeoutQueue -Encoding UTF8
    & git -C $closeoutRoot add state.yaml queue.yaml
    $closeoutOutput = @(& $guardPath -RepositoryRoot $closeoutRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutRoot -Phase pre_commit -SkipExternalIntegrityChecks)
    if (($closeoutOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Same-task closeout fixture failed." }

    $launderedCloseoutQueue = $closeoutQueue.Replace("      - audit.md", "      - audit.md`n      - expanded.md")
    Set-Content -LiteralPath (Join-Path $closeoutRoot "queue.yaml") -Value $launderedCloseoutQueue -Encoding UTF8
    & git -C $closeoutRoot add queue.yaml
    $closeoutLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutRoot -Phase pre_commit -SkipExternalIntegrityChecks
    } catch {
        $closeoutLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED") { throw }
    }
    if (-not $closeoutLaunderingFailed) { throw "Same-task closeout scope laundering fixture unexpectedly passed." }

    $closeoutPushRoot = Write-CaseFiles -Name "same-task-closeout-pre-push" -StateText $baseState -QueueText $baseQueue
    $closeoutPushRemote = Join-Path $smokeRoot "same-task-closeout-pre-push-origin.git"
    $closeoutPushParentQueue = $baseQueue.Replace("worktreePath: bootstrap-worktree-fixture", "worktreePath: $closeoutPushRoot").Replace("      - audit.md", "      - audit.md`n      - src/allowed.ts")
    $closeoutPushParentQueue = [regex]::Replace($closeoutPushParentQueue, '(?m)^      - src/\*\*\r?\n', '')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $closeoutPushParentQueue -Encoding UTF8
    & git -C $closeoutPushRoot init -b master *> $null
    & git -C $closeoutPushRoot config user.name "P1 Closeout Pre-push Smoke"
    & git -C $closeoutPushRoot config user.email "p1-closeout-pre-push-smoke@example.invalid"
    & git -C $closeoutPushRoot config core.autocrlf false
    & git -C $closeoutPushRoot add .
    & git -C $closeoutPushRoot commit -m "materialize active implementation task" *> $null
    & git init --bare $closeoutPushRemote *> $null
    & git -C $closeoutPushRoot remote add origin $closeoutPushRemote
    & git -C $closeoutPushRoot push --quiet -u origin master 2>$null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture 2>$null
    New-Item -ItemType Directory -Path (Join-Path $closeoutPushRoot "src") | Out-Null
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "src/allowed.ts") -Value "export const closeoutProbe = true;" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "evidence.md") -Value "$baseEvidence`nImplementation validation: pass`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "audit.md") -Value "$baseAudit`nImplementation review: pass`n" -Encoding UTF8
    & git -C $closeoutPushRoot add src/allowed.ts evidence.md audit.md
    & git -C $closeoutPushRoot commit -m "implement allowed task change" *> $null
    $closeoutPushImplementationHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $closeoutPushState = $baseState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutPushState = [regex]::Replace($closeoutPushState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $closeoutPushQueue = $closeoutPushParentQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $closeoutPushQueue = [regex]::Replace($closeoutPushQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $closeoutPushState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $closeoutPushQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "mark task ready for closeout" *> $null
    $closeoutPushHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $closeoutPushOrigin = ((& git -C $closeoutPushRoot rev-parse origin/master) -join "").Trim()
    $closeoutPushOriginUrl = ((& git -C $closeoutPushRoot remote get-url origin) -join "").Trim()
    $closeoutPushUpdate = "refs/heads/master $closeoutPushHead refs/heads/master $closeoutPushOrigin"
    $closeoutPushOutput = @(& $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $closeoutPushUpdate -SkipExternalIntegrityChecks)
    if (($closeoutPushOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Same-task closeout pre-push fixture failed." }
    if (($closeoutPushOutput -join "`n") -notmatch "p1TransitionScopeMode: standard") { throw "Same-task closeout fixture incorrectly emitted transition-only scope mode." }

    & git -C $closeoutPushRoot switch --quiet master 2>$null
    & git -C $closeoutPushRoot branch -D codex/bootstrap-fixture *> $null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture $closeoutPushImplementationHead 2>$null
    $launderedCloseoutPushQueue = $closeoutPushQueue.Replace("      - audit.md", "      - audit.md`n      - expanded.md")
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $closeoutPushState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $launderedCloseoutPushQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "attempt closeout scope laundering" *> $null
    $launderedCloseoutPushHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $launderedCloseoutPushUpdate = "refs/heads/master $launderedCloseoutPushHead refs/heads/master $closeoutPushOrigin"
    $closeoutPushLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $launderedCloseoutPushUpdate -SkipExternalIntegrityChecks
    } catch {
        $closeoutPushLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED") { throw }
    }
    if (-not $closeoutPushLaunderingFailed) { throw "Same-task closeout pre-push scope laundering fixture unexpectedly passed." }

    & git -C $closeoutPushRoot switch --quiet master 2>$null
    & git -C $closeoutPushRoot branch -D codex/bootstrap-fixture *> $null
    & git -C $closeoutPushRoot switch --quiet -c codex/bootstrap-fixture origin/master 2>$null
    $intermediateLaunderedState = $baseState.Replace("      taskCommit: pending", "      taskCommit: pass").Replace("standingAuthorization:", "historicalMarker: changed`nstandingAuthorization:")
    $intermediateLaunderedQueue = $closeoutPushParentQueue.Replace("      - src/allowed.ts", "      - src/allowed.ts`n      - src/expanded.ts").Replace("dependencyIntroduction: blocked_without_fresh_approval", "dependencyIntroduction: blocked_different_reason")
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $intermediateLaunderedState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $intermediateLaunderedQueue -Encoding UTF8
    New-Item -ItemType Directory -Path (Join-Path $closeoutPushRoot "src") -Force | Out-Null
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "src/expanded.ts") -Value "export const expandedScope = true;" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "evidence.md") -Value "$baseEvidence`nIntermediate implementation validation: pass`n" -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "audit.md") -Value "$baseAudit`nIntermediate implementation review: pass`n" -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml src/expanded.ts evidence.md audit.md
    & git -C $closeoutPushRoot commit -m "attempt intermediate scope laundering" *> $null
    $intermediateCloseoutState = $intermediateLaunderedState.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $intermediateCloseoutState = [regex]::Replace($intermediateCloseoutState, '(?ms)(^currentTask:\r?\n(?:^  .*\r?\n)*?^  status:)\s+in_progress\s*$', '${1} ready_for_closeout')
    $intermediateCloseoutQueue = $intermediateLaunderedQueue.Replace("    $bootstrapTask`: in_progress", "    $bootstrapTask`: ready_for_closeout")
    $intermediateCloseoutQueue = [regex]::Replace($intermediateCloseoutQueue, "(?ms)(^  - id:\s+$([regex]::Escape($bootstrapTask))\s*\r?\n(?:^    .*\r?\n)*?^    status:)\s+in_progress\s*$", '${1} ready_for_closeout')
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "state.yaml") -Value $intermediateCloseoutState -Encoding UTF8
    Set-Content -LiteralPath (Join-Path $closeoutPushRoot "queue.yaml") -Value $intermediateCloseoutQueue -Encoding UTF8
    & git -C $closeoutPushRoot add state.yaml queue.yaml
    & git -C $closeoutPushRoot commit -m "add pure closeout tip after laundering" *> $null
    $intermediateCloseoutHead = ((& git -C $closeoutPushRoot rev-parse HEAD) -join "").Trim()
    $intermediateCloseoutUpdate = "refs/heads/master $intermediateCloseoutHead refs/heads/master $closeoutPushOrigin"
    $intermediateLaunderingFailed = $false
    try {
        & $guardPath -RepositoryRoot $closeoutPushRoot -ProjectStatePath "state.yaml" -QueuePath "queue.yaml" -AuditRepositoryRoot $closeoutPushRoot -Phase pre_push -PushRemoteName origin -PushRemoteUrl $closeoutPushOriginUrl -PushUpdateLines $intermediateCloseoutUpdate -SkipExternalIntegrityChecks
    } catch {
        $intermediateLaunderingFailed = $true
        if ($_.Exception.Message -notmatch "P1_PROGRAM_CLOSEOUT_RANGE_PROJECTION_CHANGED") { throw }
    }
    if (-not $intermediateLaunderingFailed) { throw "Intermediate same-task closeout scope laundering fixture unexpectedly passed." }

    $originalGitIndexFile = [Environment]::GetEnvironmentVariable("GIT_INDEX_FILE", [EnvironmentVariableTarget]::Process)
    $activeIndexPath = $originalGitIndexFile
    if ($null -eq $activeIndexPath) {
        $activeIndexPath = ((& git -C $repositoryRoot rev-parse --git-path index) -join "").Trim()
        if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($activeIndexPath)) { throw "Unable to resolve active Git index for cross-repository isolation fixture." }
        if (-not [System.IO.Path]::IsPathRooted($activeIndexPath)) { $activeIndexPath = Join-Path $repositoryRoot $activeIndexPath }
    }
    try {
        [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $activeIndexPath, [EnvironmentVariableTarget]::Process)
        $isolatedAuditOutput = @(& $guardPath -RepositoryRoot $repositoryRoot -Phase manual)
        if (($isolatedAuditOutput -join "`n") -notmatch "p1ProgramGuardResult: pass") { throw "Cross-repository Git environment isolation fixture failed." }
    } finally {
        if ($null -ne $originalGitIndexFile) {
            [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $originalGitIndexFile, [EnvironmentVariableTarget]::Process)
        } else {
            Remove-Item -LiteralPath "Env:GIT_INDEX_FILE" -ErrorAction SilentlyContinue
        }
    }

    $readOnlyProbeRoot = Join-Path $smokeRoot "read-only-audit-probe"
    New-Item -ItemType Directory -Path $readOnlyProbeRoot | Out-Null
    Set-Content -LiteralPath (Join-Path $readOnlyProbeRoot "tracked.txt") -Value "probe" -Encoding UTF8
    & git -C $readOnlyProbeRoot init -b master *> $null
    & git -C $readOnlyProbeRoot config user.name "P1 Read-only Probe"
    & git -C $readOnlyProbeRoot config user.email "p1-read-only-probe@example.invalid"
    & git -C $readOnlyProbeRoot config core.autocrlf false
    & git -C $readOnlyProbeRoot add tracked.txt
    & git -C $readOnlyProbeRoot commit -m "create read-only probe" *> $null
    $probeIndexPath = ((& git -C $readOnlyProbeRoot rev-parse --git-path index) -join "").Trim()
    if (-not [System.IO.Path]::IsPathRooted($probeIndexPath)) { $probeIndexPath = Join-Path $readOnlyProbeRoot $probeIndexPath }
    $probeFile = Get-Item -LiteralPath (Join-Path $readOnlyProbeRoot "tracked.txt")
    $probeFile.LastWriteTimeUtc = $probeFile.LastWriteTimeUtc.AddSeconds(2)
    $indexFingerprintBefore = Get-FileFingerprint -Path $probeIndexPath
    $probeStatus = @(& git --no-optional-locks -C $readOnlyProbeRoot status --porcelain)
    if ($LASTEXITCODE -ne 0 -or $probeStatus.Count -ne 0) { throw "Read-only audit status probe failed." }
    $indexFingerprintAfter = Get-FileFingerprint -Path $probeIndexPath
    if ($indexFingerprintAfter -ne $indexFingerprintBefore) { throw "Read-only audit status changed the disposable repository index." }

    Write-Output "P1 remediation serial program guard smoke passed: 8 positive, 48 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
