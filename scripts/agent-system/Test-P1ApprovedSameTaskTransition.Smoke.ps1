param(
    [Parameter(Mandatory = $false)]
    [ValidateSet("focused")]
    [string]$Profile = "focused"
)

$ErrorActionPreference = "Stop"
$repositoryRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\.."))
$baseSha = "61303d935e58e65103563fcb0fa865d7bfb6cf3e"
$taskId = "p1-mechanism-execution-compatibility-v2-1-2026-07-19"
$parentTaskId = "p1-remediation-rc-02-employee-personal-ai-context-2026-07-18"
$branch = "codex/p1-mechanism-execution-compatibility-v2-1"
$authorizationPath = "docs/05-execution-logs/acceptance/2026-07-19-p1-mechanism-execution-compatibility-v2-1-authorization.md"
$planPath = "docs/05-execution-logs/task-plans/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md"
$evidencePath = "docs/05-execution-logs/evidence/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md"
$auditPath = "docs/05-execution-logs/audits-reviews/2026-07-19-p1-mechanism-execution-compatibility-v2-1.md"
$guardPath = "scripts/agent-system/Test-P1RemediationSerialProgram.ps1"
$bootstrapFiles = @(
    "docs/04-agent-system/operating-manual.md",
    "docs/04-agent-system/sop/p1-approved-same-task-transition.md",
    "docs/04-agent-system/state/mechanism-source-of-truth-index.yaml",
    "docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml",
    "docs/04-agent-system/state/project-state.yaml",
    "docs/04-agent-system/state/task-queue.yaml",
    $authorizationPath,
    $planPath,
    $evidencePath,
    $auditPath,
    "scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1",
    "scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1",
    $guardPath,
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$script:caseCount = 0

function Assert-True {
    param(
        [Parameter(Mandatory = $true)][bool]$Condition,
        [Parameter(Mandatory = $true)][string]$Message
    )

    $script:caseCount++
    if (-not $Condition) { throw "$Message`ncaseCountAtFailure: $script:caseCount" }
}

function Assert-ContainsExactlyOnce {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string]$Marker,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $count = [regex]::Matches($Text, [regex]::Escape($Marker)).Count
    Assert-True -Condition ($count -eq 1) -Message "$Label expected marker exactly once, found $count`: $Marker"
}

function Get-C3Sha256Text {
    param([Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text)
    $bytes = [System.Text.UTF8Encoding]::new($false).GetBytes(($Text -replace "`r`n?", "`n"))
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($sha256.ComputeHash($bytes))).Replace("-", "").ToLowerInvariant() }
    finally { $sha256.Dispose() }
}

function Set-ExactFileText {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Text
    )

    $fullPath = Join-Path $Root ($Path -replace '/', [System.IO.Path]::DirectorySeparatorChar)
    $directory = Split-Path -Parent $fullPath
    if (-not (Test-Path -LiteralPath $directory)) { New-Item -ItemType Directory -Path $directory -Force | Out-Null }
    [System.IO.File]::WriteAllText($fullPath, ($Text -replace "`r`n?", "`n"), [System.Text.UTF8Encoding]::new($false))
}

function Replace-ExactOnce {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][string]$Anchor,
        [Parameter(Mandatory = $true)][string]$Replacement,
        [Parameter(Mandatory = $true)][string]$Label
    )

    $count = [regex]::Matches($Text, [regex]::Escape($Anchor)).Count
    if ($count -ne 1) { throw "$Label expected one projection anchor, found $count." }
    return $Text.Replace($Anchor, $Replacement)
}

function Get-MechanismTaskBlock {
    return @"
  - id: $taskId
    title: P1 mechanism execution compatibility v2.1
    phase: $taskId
    status: in_progress
    priority: governance
    sequenceOrder: 12
    taskKind: mechanism_hardening
    productClosureContribution: none
    moduleRunVersion: 3
    executionStage: scope_frozen
    branch: $branch
    worktreePath: D:/tiku/.worktrees/p1-mechanism-execution-compatibility-v2-1
    dependsOn:
      - $parentTaskId
    approvalSource: current-user-approved-p1-mechanism-execution-compatibility-v2-1-bootstrap-2026-07-19
    authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
    freshApprovalSource: $authorizationPath
    executionProfile: R3
    candidateRootCauseCluster: P1-RC-02
    findingIds: []
    authorityPath: p1_mechanism_execution_compatibility_v2_1_charter_and_bootstrap_authorization
    businessInvariant: p1_wip_remains_one_while_f0143_closes_and_the_non_product_mechanism_successor_is_materialized
    adversarialFailureMode: generic_or_historical_fallback_can_accept_wrong_context_files_topology_or_ordinary_sha_drift
    rollbackOrStopCondition: stop_if_focused_green_requires_scope_expansion_blocked_files_hook_bypass_or_quality_gate_reduction
    focusedGates:
      - historical_exact_path_and_finding_code_characterization
      - one_time_non_finding_specific_bootstrap
      - empty_finding_mechanism_successor_only
      - exact_am_file_set
      - ordinary_drift_and_standard_ancestor_hard_block
    buildRequired: false
    fullRegressionPolicy: focused_then_single_fresh_full_mechanism_matrix
    protectedDomains:
      - p1_finding_identity
      - p1_wip_one
      - p0_and_module_quality_gates
      - approval_and_evidence_boundaries
      - git_closeout_topology
    reviewMode: checkpoint_main_thread_review_then_one_independent_final_review
    planPath: $planPath
    evidencePath: $evidencePath
    auditReviewPath: $auditPath
    allowedFiles:
$(@($bootstrapFiles | ForEach-Object { "      - $_" }) -join "`n")
    blockedFiles:
      - AGENTS.md
      - .husky/**
      - package.json
      - package-lock.json
      - pnpm-lock.yaml
      - pnpm-workspace.yaml
      - yarn.lock
      - src/**
      - tests/**
      - e2e/**
      - drizzle/**
      - migrations/**
      - seed/**
      - src/db/**
      - .env*
      - D:/tiku-readonly-audit/**
    capabilities:
      docsStateEvidenceAudit: approved
      governanceRecoveryScriptChange: approved_task_allowlist
      productRuntimeSourceChange: blocked
      productTestSourceChange: blocked
      dependencyIntroduction: blocked_without_fresh_approval
      schemaMigration: blocked_without_fresh_approval
      databaseMutation: blocked_without_fresh_user_approval
      providerCall: blocked_without_fresh_approval
      runtimeAcceptance: blocked_out_of_program
      browserRuntimeValidation: blocked_out_of_program
      p2Implementation: blocked_out_of_program
      stagingProdDeploy: blocked_requires_fresh_user_approval
      forcePush: blocked
      pr: blocked
      costCalibrationGate: blocked
    currentExecutionGate:
      status: satisfied
      reason: current_user_approved_one_time_non_finding_specific_bootstrap_2026_07_19
      approvalRequestPath: $authorizationPath
      resumeAction: execute_c1_to_c5_then_full_review_and_closeout_without_product_red
    acceptanceStandards:
      - F-0143 closes atomically while exactly one findingless mechanism successor becomes active.
      - The successor contributes no product closure and never adds a completed finding identity.
      - Historical paths, finding codes, ordinary drift, standard mode, topology and exact file negatives remain hard-blocked.
    validationCommands:
      - powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1 -Profile focused
      - git diff --check
    closeoutPolicy:
      authorizationSource: docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md
      localCommit:
        approved: true
        approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
      fastForwardMerge:
        approved: true
        targetBranch: master
        approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
      push:
        approved: true
        target: origin/master
        approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
      cleanup:
        deleteShortBranch: true
        approvalSource: current-user-approved-p1-remediation-goal-2026-07-16
"@
}

function Get-ProjectedStateText {
    param([Parameter(Mandatory = $true)][string]$ParentText)

    $text = $ParentText -replace "`r`n?", "`n"
    $text = Replace-ExactOnce $text 'updatedAt: "2026-07-18T22:50:00-07:00"' 'updatedAt: "2026-07-19T06:47:14-07:00"' "state transition timestamp"
    $text = Replace-ExactOnce $text "currentPhase: $parentTaskId" "currentPhase: $taskId" "state currentPhase"
    $text = $text.Replace("  currentTaskId: $parentTaskId", "  currentTaskId: $taskId")
    if ([regex]::Matches($text, [regex]::Escape("  currentTaskId: $taskId")).Count -ne 1) { throw "state currentTaskId projection is not exact." }
    $text = Replace-ExactOnce $text "    - $parentTaskId`n  completedTaskIds:" "    - $parentTaskId`n    - $taskId`n  completedTaskIds:" "state materialized successor"
    $text = Replace-ExactOnce $text "    - p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`n  standingAuthorizationSource:" "    - p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`n    - $parentTaskId`n  standingAuthorizationSource:" "state completed predecessor"
    $text = Replace-ExactOnce $text "    ${parentTaskId}: ready_for_closeout`n  closeoutCheckpoints:" "    ${parentTaskId}: closed`n    ${taskId}: in_progress`n  closeoutCheckpoints:" "state status transition"
    $oldCheckpoint = @"
    ${parentTaskId}:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
"@
    $newCheckpoint = @"
    ${parentTaskId}:
      taskCommit: pass
      masterMerge: pass
      originMasterSync: pass
      worktreeCleanup: pass
      shortBranchCleanup: pass
    ${taskId}:
      taskCommit: pending
      masterMerge: pending
      originMasterSync: pending
      worktreeCleanup: pending
      shortBranchCleanup: pending
"@
    $text = Replace-ExactOnce $text $oldCheckpoint $newCheckpoint "state checkpoint transition"
    $currentTaskStart = $text.IndexOf("`ncurrentTask:`n", [System.StringComparison]::Ordinal)
    if ($currentTaskStart -ge 0) { $currentTaskStart++ }
    $standingAuthorizationStart = $text.IndexOf("`nstandingAuthorization:`n", $currentTaskStart, [System.StringComparison]::Ordinal)
    if ($standingAuthorizationStart -ge 0) { $standingAuthorizationStart++ }
    if ($currentTaskStart -lt 0 -or $standingAuthorizationStart -lt 0) { throw "state top-level currentTask projection anchors are missing." }
    $currentTask = @"
currentTask:
  id: $taskId
  title: P1 mechanism execution compatibility v2.1
  phase: $taskId
  status: in_progress
  priority: governance
  taskKind: mechanism_hardening
  productClosureContribution: none
  branch: $branch
  executionProfile: R3
  planPath: $planPath
  evidencePath: $evidencePath
  auditReviewPath: $auditPath
  nextRequiredTaskId: c2-strict-contract-red
  currentExecutionGate:
    status: satisfied
    reason: current_user_approved_one_time_non_finding_specific_bootstrap_2026_07_19
    approvalRequestPath: $authorizationPath
    resumeAction: execute_c1_to_c5_without_starting_next_product_red
"@
    $text = $text.Substring(0, $currentTaskStart) + $currentTask + "`n" + $text.Substring($standingAuthorizationStart)
    $text = $text.Replace("  lastKnownMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983", "  lastKnownMasterSha: $baseSha")
    $text = $text.Replace("  lastKnownOriginMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983", "  lastKnownOriginMasterSha: $baseSha")
    $text = $text.Replace("  lastKnownRemoteMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983", "  lastKnownRemoteMasterSha: $baseSha")
    return $text
}

function Get-ProjectedQueueText {
    param([Parameter(Mandatory = $true)][string]$ParentText)

    $text = $ParentText -replace "`r`n?", "`n"
    $text = Replace-ExactOnce $text "  currentTaskId: $parentTaskId" "  currentTaskId: $taskId" "queue currentTaskId"
    $text = Replace-ExactOnce $text "    - $parentTaskId`n  completedTaskIds:" "    - $parentTaskId`n    - $taskId`n  completedTaskIds:" "queue materialized successor"
    $text = Replace-ExactOnce $text "    - p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`n  standingAuthorizationSource:" "    - p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`n    - $parentTaskId`n  standingAuthorizationSource:" "queue completed predecessor"
    $text = Replace-ExactOnce $text "    ${parentTaskId}: ready_for_closeout`nactiveTasks:" "    ${parentTaskId}: closed`n    ${taskId}: in_progress`nactiveTasks:`n$(Get-MechanismTaskBlock)" "queue status and successor"
    $text = Replace-ExactOnce $text "  - id: $parentTaskId`n    title: P1 RC-02 employee personal AI selected authorization context`n    phase: $parentTaskId`n    status: ready_for_closeout" "  - id: $parentTaskId`n    title: P1 RC-02 employee personal AI selected authorization context`n    phase: $parentTaskId`n    status: closed" "queue predecessor close"
    return $text
}

function Invoke-Guard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $false)][ValidateSet("pre_commit", "pre_push")][string]$Phase = "pre_commit"
    )

    $priorErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    $output = if ($Phase -ceq "pre_push") {
        $originUrl = ((& git -C $Root remote get-url origin) -join "").Trim()
        $headSha = ((& git -C $Root rev-parse HEAD) -join "").Trim()
        $originMasterSha = ((& git -C $Root rev-parse origin/master) -join "").Trim()
        $updateLine = "refs/heads/master $headSha refs/heads/master $originMasterSha"
        @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root $guardPath) -RepositoryRoot $Root -Phase $Phase -PushRemoteName origin -PushRemoteUrl $originUrl -PushUpdateLines $updateLine -SkipExternalIntegrityChecks 2>&1 | ForEach-Object { $_.ToString() })
    } else {
        @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root $guardPath) -RepositoryRoot $Root -Phase $Phase -SkipExternalIntegrityChecks 2>&1 | ForEach-Object { $_.ToString() })
    }
    $exitCode = $LASTEXITCODE
    $ErrorActionPreference = $priorErrorActionPreference
    return [pscustomobject]@{ ExitCode = $exitCode; OutputText = ($output -join "`n") }
}

function Invoke-C4ModuleGuard {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$ScriptPath,
        [Parameter(Mandatory = $false)][AllowEmptyCollection()][string[]]$Arguments = @()
    )

    $priorErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    Push-Location $Root
    try {
        $output = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root $ScriptPath) @Arguments 2>&1 | ForEach-Object { $_.ToString() })
        $exitCode = $LASTEXITCODE
    } finally {
        Pop-Location
        $ErrorActionPreference = $priorErrorActionPreference
    }
    return [pscustomobject]@{ ExitCode = $exitCode; OutputText = ($output -join "`n") }
}

function New-BootstrapFixtureRoot {
    param([Parameter(Mandatory = $true)][string]$Name)

    $root = Join-Path ([System.IO.Path]::GetTempPath()) "tiku-p1-v21-$Name-$([guid]::NewGuid().ToString('N'))"
    & git -c core.longpaths=true clone --quiet --shared --no-checkout $repositoryRoot $root
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone bootstrap fixture $Name." }
    & git -C $root config core.longpaths true
    & git -C $root sparse-checkout init --no-cone
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize bootstrap fixture sparse checkout $Name." }
    $fixtureSparsePaths = @($bootstrapFiles + @(
        "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
        "docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-serial-program.md",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml",
        "docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml"
    ) | Sort-Object -Unique)
    & git -C $root sparse-checkout set --no-cone -- $fixtureSparsePaths
    if ($LASTEXITCODE -ne 0) { throw "Unable to configure bootstrap fixture sparse checkout $Name." }
    & git -C $root config user.name "Tiku P1 Mechanism Smoke"
    & git -C $root config user.email "p1-mechanism-smoke@example.invalid"
    return $root
}

function Set-BootstrapFixtureCandidate {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $false)][string]$Mutation = ""
    )

    & git -C $Root checkout --quiet -B $branch $baseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to create bootstrap fixture branch $Name." }
    & git -C $Root reset --hard --quiet $baseSha
    if ($LASTEXITCODE -ne 0) { throw "Unable to reset bootstrap fixture $Name." }
    & git -C $Root clean -fdx --quiet
    if ($LASTEXITCODE -ne 0) { throw "Unable to clean bootstrap fixture $Name." }
    if ($Mutation -eq "wrong_base") {
        & git -C $Root commit --quiet --allow-empty -m "advance bootstrap fixture base"
        if ($LASTEXITCODE -ne 0) { throw "Unable to advance wrong-base bootstrap fixture." }
    }

    $parentState = (& git -C $Root show "${baseSha}:docs/04-agent-system/state/project-state.yaml") -join "`n"
    $parentQueue = (& git -C $Root show "${baseSha}:docs/04-agent-system/state/task-queue.yaml") -join "`n"
    Set-ExactFileText $Root "docs/04-agent-system/state/project-state.yaml" (Get-ProjectedStateText $parentState)
    Set-ExactFileText $Root "docs/04-agent-system/state/task-queue.yaml" (Get-ProjectedQueueText $parentQueue)

    foreach ($path in $bootstrapFiles) {
        if ($path -in @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml")) { continue }
        $sourcePath = Join-Path $repositoryRoot ($path -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        $text = if (Test-Path -LiteralPath $sourcePath -PathType Leaf) { Get-Content -LiteralPath $sourcePath -Raw -Encoding UTF8 } else { "# C1 synthetic future-file fixture: $path`n" }
        if ($path -eq $evidencePath) {
            $text += "`n## JIT Revalidation Result`n`nResult: pass`n`n## Scope Freeze`n`nResult: pass`n"
        } elseif ($path -eq $auditPath) {
            $text += "`n## Round 1`n`nResult: pass`n`n## Round 2`n`nResult: pass`n`n## Transition Disposition`n`nDecision: APPROVE_SCOPE`n"
        } elseif ($path -notin @($authorizationPath, $planPath, "scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1")) {
            $text += "`n# C1 exact bootstrap fixture marker`n"
        }
        Set-ExactFileText $Root $path $text
    }

    if ($Mutation -eq "wrong_task_kind") {
        $queuePath = Join-Path $Root "docs/04-agent-system/state/task-queue.yaml"
        (Get-Content -LiteralPath $queuePath -Raw).Replace("    taskKind: mechanism_hardening`n    productClosureContribution: none", "    taskKind: product_remediation`n    productClosureContribution: none") | Set-Content -LiteralPath $queuePath -Encoding UTF8
    } elseif ($Mutation -eq "wrong_contribution") {
        $queuePath = Join-Path $Root "docs/04-agent-system/state/task-queue.yaml"
        (Get-Content -LiteralPath $queuePath -Raw).Replace("    productClosureContribution: none", "    productClosureContribution: finding") | Set-Content -LiteralPath $queuePath -Encoding UTF8
    } elseif ($Mutation -eq "missing_finding_ids") {
        $queuePath = Join-Path $Root "docs/04-agent-system/state/task-queue.yaml"
        $queueText = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8
        $missingFindingIdsAnchor = "    candidateRootCauseCluster: P1-RC-02`n    findingIds: []`n    authorityPath: p1_mechanism_execution_compatibility_v2_1_charter_and_bootstrap_authorization"
        $missingFindingIdsReplacement = "    candidateRootCauseCluster: P1-RC-02`n    authorityPath: p1_mechanism_execution_compatibility_v2_1_charter_and_bootstrap_authorization"
        Set-ExactFileText $Root "docs/04-agent-system/state/task-queue.yaml" (Replace-ExactOnce $queueText $missingFindingIdsAnchor $missingFindingIdsReplacement "missing findingIds")
    } elseif ($Mutation -eq "missing_file") {
        Remove-Item -LiteralPath (Join-Path $Root "docs/04-agent-system/operating-manual.md")
    } elseif ($Mutation -eq "extra_file") {
        Set-ExactFileText $Root "mechanism-extra.md" "# forbidden extra bootstrap path`n"
    } elseif ($Mutation -eq "wrong_authorization") {
        $authorizationFullPath = Join-Path $Root ($authorizationPath -replace '/', [System.IO.Path]::DirectorySeparatorChar)
        $authorizationText = Get-Content -LiteralPath $authorizationFullPath -Raw -Encoding UTF8
        Set-ExactFileText $Root $authorizationPath ($authorizationText.Replace("Hook bypass: prohibited.", "Hook bypass: permitted."))
    } elseif ($Mutation -eq "wrong_state_projection") {
        $statePath = Join-Path $Root "docs/04-agent-system/state/project-state.yaml"
        $stateText = Get-Content -LiteralPath $statePath -Raw -Encoding UTF8
        Set-ExactFileText $Root "docs/04-agent-system/state/project-state.yaml" (Replace-ExactOnce $stateText "  name: tiku`n" "  name: tiku-projection-tamper`n" "wrong state projection")
    } elseif ($Mutation -eq "wrong_queue_projection") {
        $queuePath = Join-Path $Root "docs/04-agent-system/state/task-queue.yaml"
        $queueText = Get-Content -LiteralPath $queuePath -Raw -Encoding UTF8
        Set-ExactFileText $Root "docs/04-agent-system/state/task-queue.yaml" (Replace-ExactOnce $queueText "    title: P1 RC-02 employee personal AI selected authorization context`n" "    title: tampered predecessor contract`n" "wrong queue projection")
    } elseif ($Mutation -eq "wrong_branch") {
        & git -C $Root checkout --quiet -b codex/wrong-p1-mechanism-bootstrap
        if ($LASTEXITCODE -ne 0) { throw "Unable to create wrong-branch bootstrap fixture." }
    }

    & git -C $Root add --sparse --all
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage bootstrap fixture $Name." }
    return $Root
}

function New-BootstrapFixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $false)][string]$Mutation = ""
    )

    $root = New-BootstrapFixtureRoot -Name $Name
    return Set-BootstrapFixtureCandidate -Root $root -Name $Name -Mutation $Mutation
}

function New-C4GenericGuardFixture {
    param([Parameter(Mandatory = $true)][string]$Name)

    $root = Join-Path ([System.IO.Path]::GetTempPath()) "tiku-p1-v21-c4-$Name-$([guid]::NewGuid().ToString('N'))"
    & git -c core.longpaths=true clone --quiet --shared --no-checkout $repositoryRoot $root
    if ($LASTEXITCODE -ne 0) { throw "Unable to clone C4 generic fixture $Name." }
    & git -C $root config core.longpaths true
    & git -C $root config core.autocrlf false
    & git -C $root checkout --quiet -B $branch $baseSha
    & git -C $root config user.name "Tiku C4 Generic Smoke"
    & git -C $root config user.email "p1-c4-generic-smoke@example.invalid"

    foreach ($path in @($bootstrapFiles | Where-Object { $_ -notin @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml") })) {
        $sourcePath = Join-Path $repositoryRoot ($path -replace '/', [IO.Path]::DirectorySeparatorChar)
        if (Test-Path -LiteralPath $sourcePath -PathType Leaf) { Set-ExactFileText $root $path (Get-Content -LiteralPath $sourcePath -Raw -Encoding UTF8) }
    }
    Set-ExactFileText $root $evidencePath @"
## Requirement Mapping Result

status: complete

## Reading Evidence

conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

## JIT Revalidation Result

Result: pass

## Scope Freeze

Result: pass
"@
    Set-ExactFileText $root $auditPath @"
## Round 1

Result: pass

## Round 2

Result: pass

## Transition Disposition

Decision: APPROVE_SCOPE
"@
    $contractPath = "docs/05-execution-logs/transitions/p1-ast-generic-guard-transition-001.md"
    $baseQueuePath = Join-Path $root "docs/04-agent-system/state/task-queue.yaml"
    $baseQueueText = Get-Content -LiteralPath $baseQueuePath -Raw -Encoding UTF8
    $baseQueueText = Replace-ExactOnce $baseQueueText `
        "      - docs/04-agent-system/state/task-queue.yaml`n      - docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md" `
        "      - docs/04-agent-system/state/task-queue.yaml`n      - $contractPath`n      - docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md" `
        "C4 base-authorized contract path"
    Set-ExactFileText $root "docs/04-agent-system/state/task-queue.yaml" $baseQueueText
    & git -C $root add --all
    & git -C $root commit --quiet -m "C4 synthetic deployed mechanism base"
    if ($LASTEXITCODE -ne 0) { throw "Unable to create C4 generic synthetic base." }
    $syntheticBaseSha = ((& git -C $root rev-parse HEAD) -join "").Trim()
    & git -C $root update-ref refs/remotes/origin/master $syntheticBaseSha

    $baseStateText = Get-P1AstGitText -RepositoryRoot $root -Reference $syntheticBaseSha -Path "docs/04-agent-system/state/project-state.yaml"
    $baseQueueText = Get-P1AstGitText -RepositoryRoot $root -Reference $syntheticBaseSha -Path "docs/04-agent-system/state/task-queue.yaml"
    $candidateStateText = (Get-ProjectedStateText $baseStateText).Replace($baseSha, $syntheticBaseSha)
    $candidateQueueText = Get-ProjectedQueueText $baseQueueText
    $candidateQueueText = Replace-ExactOnce $candidateQueueText `
        "    allowedFiles:`n      - docs/04-agent-system/operating-manual.md" `
        "    allowedFiles:`n      - $contractPath`n      - docs/04-agent-system/operating-manual.md" `
        "C4 successor contract allowlist"
    $candidateQueueText = Replace-ExactOnce $candidateQueueText `
        "    worktreePath: D:/tiku/.worktrees/p1-mechanism-execution-compatibility-v2-1" `
        "    worktreePath: $($root.Replace('\', '/'))" `
        "C4 disposable worktree binding"
    Set-ExactFileText $root "docs/04-agent-system/state/project-state.yaml" $candidateStateText
    Set-ExactFileText $root "docs/04-agent-system/state/task-queue.yaml" $candidateQueueText

    $fence = ([string][char]96) * 3
    $contractText = @(
        "${fence}tiku-approved-same-task-transition-v1",
        "schemaVersion=1",
        "transitionType=approved_same_task_transition",
        "transitionId=p1-ast-generic-guard-transition-001",
        "taskId=$taskId",
        "parentTaskId=$parentTaskId",
        "baseSha=$syntheticBaseSha",
        "branch=$branch",
        "authorizationId=current-user-approved-f0143-design-option-a-2026-07-18",
        "authorizationSource=docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-employee-personal-ai-context-authorization.md",
        "standingAuthorizationSource=docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
        "statePath=docs/04-agent-system/state/project-state.yaml",
        "stateFromSha256=$(Get-P1AstSha256Text $baseStateText)",
        "stateToSha256=$(Get-P1AstSha256Text $candidateStateText)",
        "queuePath=docs/04-agent-system/state/task-queue.yaml",
        "queueFromSha256=$(Get-P1AstSha256Text $baseQueueText)",
        "queueToSha256=$(Get-P1AstSha256Text $candidateQueueText)",
        "fileCount=3",
        "singleParent=true",
        "singleCommit=true",
        "oneTime=true",
        "ancestorCheckpointPolicy=transition_only_exact_one_parent",
        "ordinaryDriftPolicy=hard_block",
        "standardModePolicy=hard_block",
        "databaseExecutionPolicy=blocked",
        "permissionExpansionPolicy=blocked",
        "file.001.path=docs/04-agent-system/state/project-state.yaml",
        "file.001.status=M",
        "file.002.path=docs/04-agent-system/state/task-queue.yaml",
        "file.002.status=M",
        "file.003.path=$contractPath",
        "file.003.status=A",
        $fence
    ) -join "`n"
    Set-ExactFileText $root $contractPath $contractText
    & git -C $root add --all
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage C4 generic candidate." }
    $nameStatusRecords = @(& git -C $root diff --cached --name-status --no-renames HEAD)
    $stageInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $root -Phase pre_commit -NameStatusRecords $nameStatusRecords -BaseReference origin/master -CandidateReference ":" -Branch $branch
    return [pscustomobject]@{ Root = $root; ContractPath = $contractPath; SyntheticBaseSha = $syntheticBaseSha; StageInputs = $stageInputs }
}

function Remove-Fixture {
    param([Parameter(Mandatory = $true)][string]$Root)
    $resolvedRoot = [System.IO.Path]::GetFullPath($Root)
    $resolvedTemp = [System.IO.Path]::GetFullPath([System.IO.Path]::GetTempPath()).TrimEnd([System.IO.Path]::DirectorySeparatorChar) + [System.IO.Path]::DirectorySeparatorChar
    if (-not $resolvedRoot.StartsWith($resolvedTemp, [System.StringComparison]::OrdinalIgnoreCase) -or [System.IO.Path]::GetFileName($resolvedRoot) -notlike "tiku-p1-v21-*") {
        throw "Refusing to remove fixture outside the exact temporary fixture boundary: $resolvedRoot"
    }
    if (Test-Path -LiteralPath $resolvedRoot) {
        $longRoot = "\\?\$resolvedRoot"
        foreach ($fixtureFile in [System.IO.Directory]::EnumerateFiles($longRoot, "*", [System.IO.SearchOption]::AllDirectories)) {
            [System.IO.File]::SetAttributes($fixtureFile, [System.IO.FileAttributes]::Normal)
        }
        [System.IO.Directory]::Delete($longRoot, $true)
    }
}

if ($Profile -ne "focused") { throw "Unsupported profile: $Profile" }

. (Join-Path $repositoryRoot "scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1")

$productionFiles = @(
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1"
)
$smokeFiles = @(
    "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
$historicalBaselineFiles = @($productionFiles[1..2] + $smokeFiles)
foreach ($historicalBaselineFile in $historicalBaselineFiles) {
    $baselineText = @(& git -C $repositoryRoot show "${baseSha}:$historicalBaselineFile") -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "Unable to read historical baseline file: $historicalBaselineFile" }
    $currentText = (Get-Content -LiteralPath (Join-Path $repositoryRoot $historicalBaselineFile) -Raw -Encoding UTF8) -replace "`r`n?", "`n"
    $currentText = [regex]::Replace($currentText, '(?ms)^[ \t]*# C4-ADAPTER-(?:PARAMS|IMPLEMENTATION|ROUTING|CONSISTENCY)-BEGIN\n.*?^[ \t]*# C4-ADAPTER-(?:PARAMS|IMPLEMENTATION|ROUTING|CONSISTENCY)-END\n?', '')
    if ($historicalBaselineFile -ceq "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1") {
        $c6FixtureStartMarker = "    # C6-FIXTURE-HERMETICITY-BEGIN`n"
        $c6FixtureEndAnchor = '    $f0116HotfixRoot = Join-Path $smokeRoot "f0116-designpath-guard-hotfix"'
        $historicalFixtureStartAnchor = '    $originalGitIndexFile = [Environment]::GetEnvironmentVariable("GIT_INDEX_FILE", [EnvironmentVariableTarget]::Process)'
        $currentFixtureStartIndex = $currentText.IndexOf($c6FixtureStartMarker, [System.StringComparison]::Ordinal)
        $currentFixtureEndIndex = $currentText.IndexOf($c6FixtureEndAnchor, $currentFixtureStartIndex, [System.StringComparison]::Ordinal)
        $historicalFixtureStartIndex = $baselineText.IndexOf($historicalFixtureStartAnchor, [System.StringComparison]::Ordinal)
        $historicalFixtureEndIndex = $baselineText.IndexOf($c6FixtureEndAnchor, $historicalFixtureStartIndex, [System.StringComparison]::Ordinal)
        if ($currentFixtureStartIndex -lt 0 -or $currentFixtureEndIndex -lt 0 -or $historicalFixtureStartIndex -lt 0 -or $historicalFixtureEndIndex -lt 0) {
            throw "Unable to isolate the authorized C6 full-smoke fixture correction from the historical baseline."
        }
        $historicalFixtureText = $baselineText.Substring($historicalFixtureStartIndex, $historicalFixtureEndIndex - $historicalFixtureStartIndex)
        $currentText = $currentText.Substring(0, $currentFixtureStartIndex) + $historicalFixtureText + $currentText.Substring($currentFixtureEndIndex)

        $nestedModuleFullPattern = '(?ms)^    \$f0117PreCommitBehaviorOutput = @\(& \(Join-Path \$PSScriptRoot "Test-ModuleRunV2PreCommitHardening\.Smoke\.ps1"\)\)\n    if \(\(\$f0117PreCommitBehaviorOutput -join "`n"\) -notmatch "F-0117 smoke scope-correction P1 and Module pre-commit behavior smoke passed"\) \{\n        throw "P1 smoke did not execute the shared F-0117 smoke scope-correction pre-commit behavior fixture\."\n    \}\n'
        if ([regex]::Matches($baselineText, $nestedModuleFullPattern).Count -ne 1 -or [regex]::Matches($currentText, $nestedModuleFullPattern).Count -gt 1) {
            throw "Unable to isolate the obsolete nested Module full invocation from the P1 historical baseline."
        }
        $baselineText = [regex]::Replace($baselineText, $nestedModuleFullPattern, '')
        $currentText = [regex]::Replace($currentText, $nestedModuleFullPattern, '')
    }
    if ($historicalBaselineFile -ceq "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1" -and $currentText.Contains("# C6-F0143-FIXTURE-PROJECTION-BEGIN")) {
        $currentProjectionStart = $currentText.IndexOf("# C6-F0143-FIXTURE-PROJECTION-BEGIN", [System.StringComparison]::Ordinal)
        $currentProjectionEnd = $currentText.IndexOf("# C6-F0143-FIXTURE-PROJECTION-END", $currentProjectionStart, [System.StringComparison]::Ordinal)
        $historicalProjectionStart = $baselineText.IndexOf('$f0143BehaviorFiles = @(', [System.StringComparison]::Ordinal)
        $historicalProjectionEnd = $baselineText.IndexOf('function Assert-F0143PreCommitBehaviorFailure', $historicalProjectionStart, [System.StringComparison]::Ordinal)
        if ($currentProjectionStart -lt 0 -or $currentProjectionEnd -lt 0 -or $historicalProjectionStart -lt 0 -or $historicalProjectionEnd -lt 0) {
            throw "Unable to isolate the authorized C6 F-0143 fixture projection correction from the historical baseline."
        }
        $currentProjectionEnd = $currentText.IndexOf('function Assert-F0143PreCommitBehaviorFailure', $currentProjectionEnd, [System.StringComparison]::Ordinal)
        $historicalProjectionText = $baselineText.Substring($historicalProjectionStart, $historicalProjectionEnd - $historicalProjectionStart)
        $currentText = $currentText.Substring(0, $currentProjectionStart) + $historicalProjectionText + $currentText.Substring($currentProjectionEnd)
    }
    if ($historicalBaselineFile -ceq "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1" -and $currentText.Contains("# C6-F0143-PREPUSH-FIXTURE-PROJECTION-BEGIN")) {
        $currentProjectionStart = $currentText.IndexOf("# C6-F0143-PREPUSH-FIXTURE-PROJECTION-BEGIN", [System.StringComparison]::Ordinal)
        $currentProjectionEnd = $currentText.IndexOf("# C6-F0143-PREPUSH-FIXTURE-PROJECTION-END", $currentProjectionStart, [System.StringComparison]::Ordinal)
        $historicalProjectionStart = $baselineText.IndexOf('    foreach ($candidatePath in $f0143Files) {', [System.StringComparison]::Ordinal)
        $projectionEndAnchor = '    Set-F0115PrePushFixtureFile -Root $f0143FixtureRoot -Path $f0143EvidencePath -Content'
        $historicalProjectionEnd = $baselineText.IndexOf($projectionEndAnchor, $historicalProjectionStart, [System.StringComparison]::Ordinal)
        if ($currentProjectionStart -lt 0 -or $currentProjectionEnd -lt 0 -or $historicalProjectionStart -lt 0 -or $historicalProjectionEnd -lt 0) {
            throw "Unable to isolate the authorized C6 F-0143 pre-push fixture projection correction from the historical baseline."
        }
        $currentProjectionEnd = $currentText.IndexOf($projectionEndAnchor, $currentProjectionEnd, [System.StringComparison]::Ordinal)
        if ($currentProjectionEnd -lt 0) { throw "Unable to locate the end of the authorized C6 F-0143 pre-push fixture projection correction." }
        $historicalProjectionText = $baselineText.Substring($historicalProjectionStart, $historicalProjectionEnd - $historicalProjectionStart)
        $currentText = $currentText.Substring(0, $currentProjectionStart) + $historicalProjectionText + $currentText.Substring($currentProjectionEnd)
    }
    $currentText = $currentText.Replace('[switch]$SkipScopeScan,', '[switch]$SkipScopeScan')
    $currentText = $currentText.Replace('[switch]$SkipScopeScan' + "`n`n)", '[switch]$SkipScopeScan' + "`n)")
    if ($historicalBaselineFile -like '*PrePushReadiness.ps1') {
        $currentText = $currentText.Replace('[string]$LowRiskExperienceBatchMode = "hard_block",', '[string]$LowRiskExperienceBatchMode = "hard_block"')
        $currentText = $currentText.Replace('[string]$LowRiskExperienceBatchMode = "hard_block"' + "`n`n)", '[string]$LowRiskExperienceBatchMode = "hard_block"' + "`n)")
    }
    if ($historicalBaselineFile -notlike '*.Smoke.ps1') {
        $currentText = $currentText.Replace('$ErrorActionPreference = "Stop"' + "`n`n", '$ErrorActionPreference = "Stop"' + "`n")
    }
    $normalizedHistoricalMatch = $currentText.TrimEnd("`n") -ceq $baselineText.TrimEnd("`n")
    $historicalMismatchDetail = ""
    if (-not $normalizedHistoricalMatch) {
        $baselineLines = @($baselineText.TrimEnd("`n") -split "`n")
        $currentLines = @($currentText.TrimEnd("`n") -split "`n")
        for ($lineIndex = 0; $lineIndex -lt [math]::Max($baselineLines.Count, $currentLines.Count); $lineIndex++) {
            if ($baselineLines[$lineIndex] -cne $currentLines[$lineIndex]) { $historicalMismatchDetail = " line=$($lineIndex + 1) base=<$($baselineLines[$lineIndex])> current=<$($currentLines[$lineIndex])>"; break }
        }
    }
    Assert-True $normalizedHistoricalMatch "Historical exact paths, routes, codes or negative cases drifted outside the P1 guard: $historicalBaselineFile$historicalMismatchDetail"
}
$allHistoricalText = @($productionFiles + $smokeFiles | ForEach-Object { Get-Content -LiteralPath (Join-Path $repositoryRoot $_) -Raw -Encoding UTF8 }) -join "`n"
foreach ($identity in @(
    "p1-f0115-scope-correction-hotfix-2026-07-16",
    "6bde2f2aec3d71fa0ce138b26f64243861cace6f",
    "p1-f0115-phase11-scope-correction-hotfix-2026-07-17",
    "582c156afb0cdde8a3daa99785fda8540b56fe27",
    "p1-f0116-designpath-guard-hotfix-2026-07-17",
    "ce6aef7b30c82f459ccfdc06782eda9bc720c15d",
    "p1-f0116-scope-correction-guard-hotfix-2026-07-18",
    "f6b14825f41a83b3f9dd3994ec9c1936876b12ff",
    "p1-f0117-spec-approval-transition-hotfix-2026-07-18",
    "366f17446e9fc75a777ebfe5977ad72db1062eb7",
    "p1-f0143-spec-approval-transition-hotfix-2026-07-18",
    "0fe8edae7a7efc00154f5c54227623be55796983"
)) {
    Assert-True ($allHistoricalText.Contains($identity)) "Historical exact identity disappeared: $identity"
}
foreach ($findingCode in @(
    "P1_PROGRAM_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID",
    "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_FILE_SET_INVALID",
    "HARD_BLOCK_P1_F0143_SPEC_APPROVAL_TRANSITION_HOTFIX_REQUIRES_TRANSITION_ONLY",
    "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID",
    "P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION",
    "P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE"
)) {
    Assert-True ($allHistoricalText.Contains($findingCode)) "Historical finding code disappeared: $findingCode"
}
foreach ($negativeMarker in @(
    "Same-task closeout fixture incorrectly emitted transition-only scope mode.",
    "ordinary unrelated in-progress SHA drift",
    "case-duplicate safe",
    "wrong-status",
    "multi-commit",
    "replay"
)) {
    Assert-True ($allHistoricalText.IndexOf($negativeMarker, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) "Historical negative marker disappeared: $negativeMarker"
}

$historicalExactRoutesByAdapter = [ordered]@{
    $productionFiles[0] = @(
        "p1_transition_hotfix", "p1_f0132_scope_correction", "p1_f0115_phase11_scope_correction",
        "p1_f0115_module_precommit_hotfix", "p1_f0116_designpath_guard_hotfix", "p1_f0116_scope_correction_guard_hotfix",
        "p1_f0117_spec_approval_transition_hotfix", "p1_f0143_spec_approval_transition_hotfix",
        "p1_f0117_smoke_scope_correction", "p1_f0117_smoke_scope_closeout_lifecycle_hotfix", "p1_f0115_scope_correction"
    )
    $productionFiles[1] = @(
        "p1_transition_hotfix", "p1_f0132_scope_correction", "p1_f0115_phase11_scope_correction",
        "p1_f0115_module_precommit_hotfix", "p1_f0116_designpath_guard_hotfix", "p1_f0116_scope_correction_guard_hotfix",
        "p1_f0117_spec_approval_transition_hotfix", "p1_f0143_spec_approval_transition_hotfix",
        "p1_f0117_smoke_scope_correction", "p1_f0117_smoke_scope_closeout_lifecycle_hotfix", "p1_f0115_scope_correction"
    )
    $productionFiles[2] = @(
        "p1_f0115_scope_correction", "p1_f0115_phase11_scope_correction", "p1_f0115_module_precommit_hotfix",
        "p1_f0116_designpath_guard_hotfix", "p1_f0116_scope_correction_guard_hotfix",
        "p1_f0117_spec_approval_transition_hotfix", "p1_f0143_spec_approval_transition_hotfix",
        "p1_f0117_smoke_scope_correction", "p1_f0117_smoke_scope_closeout_lifecycle_hotfix"
    )
}
$historicalExactSyntheticRoutes = [ordered]@{}
foreach ($historicalExactRouteName in @($historicalExactRoutesByAdapter[$productionFiles[0]])) {
    $historicalExactSyntheticRoutes[$historicalExactRouteName] = @(
        "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
        "docs/05-execution-logs/acceptance/$historicalExactRouteName.md"
    )
}
foreach ($historicalExactRouteName in @($historicalExactSyntheticRoutes.Keys)) {
    $historicalExactFiles = @($historicalExactSyntheticRoutes[$historicalExactRouteName])
    $historicalExactNameStatus = @("M`t$($historicalExactFiles[0])", "A`t$($historicalExactFiles[1])")
    $historicalExactClaim = Select-P1ApprovedSameTaskTransitionHistoricalExactRoute -NameStatusRecords $historicalExactNameStatus -HistoricalRoutes $historicalExactSyntheticRoutes
    Assert-True ($historicalExactClaim.Claimed -and $historicalExactClaim.Name -ceq $historicalExactRouteName) "Historical exact route '$historicalExactRouteName' was not claimed before generic recognition."
    foreach ($historicalRawNegative in @(
        @{ Name = "delete"; Records = @("D`t$($historicalExactFiles[0])", "A`t$($historicalExactFiles[1])") },
        @{ Name = "rename"; Records = @("R100`t$($historicalExactFiles[0])`tdocs/renamed.md", "A`t$($historicalExactFiles[1])") },
        @{ Name = "copy"; Records = @("C100`t$($historicalExactFiles[0])`tdocs/copied.md", "A`t$($historicalExactFiles[1])") },
        @{ Name = "unknown-status"; Records = @("X`t$($historicalExactFiles[0])", "A`t$($historicalExactFiles[1])") },
        @{ Name = "malformed"; Records = @("M $($historicalExactFiles[0])", "A`t$($historicalExactFiles[1])") },
        @{ Name = "duplicate"; Records = @("M`t$($historicalExactFiles[0])", "A`t$($historicalExactFiles[0])") },
        @{ Name = "case-variant"; Records = @("M`t$($historicalExactFiles[0].Replace('scripts/', 'Scripts/'))", "A`t$($historicalExactFiles[1])") },
        @{ Name = "extra"; Records = @($historicalExactNameStatus + "A`tdocs/extra.md") },
        @{ Name = "missing"; Records = @($historicalExactNameStatus | Select-Object -Skip 1) }
    )) {
        $historicalRawNegativeClaim = Select-P1ApprovedSameTaskTransitionHistoricalExactRoute -NameStatusRecords $historicalRawNegative.Records -HistoricalRoutes $historicalExactSyntheticRoutes
        Assert-True (-not $historicalRawNegativeClaim.Claimed) "Historical route '$historicalExactRouteName' claimed raw negative '$($historicalRawNegative.Name)' instead of leaving it to hard-blocking."
    }
}
$historicalMarkerSourceText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1") -Raw -Encoding UTF8
Assert-True ($historicalMarkerSourceText -match 'approved_same_task_transition|p1ApprovedSameTaskTransitionAutomatic') "Historical implementation source no longer characterizes the generic-marker collision."
foreach ($historicalAdapterEntry in $historicalExactRoutesByAdapter.GetEnumerator()) {
    $historicalAdapterText = Get-Content -LiteralPath (Join-Path $repositoryRoot $historicalAdapterEntry.Key) -Raw -Encoding UTF8
    $historicalRoutingBlock = [regex]::Match($historicalAdapterText, '(?ms)^# C4-ADAPTER-ROUTING-BEGIN\s*$.*?^# C4-ADAPTER-ROUTING-END\s*$').Value
    $historicalClaimOffset = $historicalRoutingBlock.IndexOf('Select-P1ApprovedSameTaskTransitionHistoricalExactRoute', [System.StringComparison]::Ordinal)
    $genericStageOffset = $historicalRoutingBlock.IndexOf('Get-P1ApprovedSameTaskTransitionStageInputs', [System.StringComparison]::Ordinal)
    Assert-True ($historicalClaimOffset -ge 0 -and $historicalClaimOffset -lt $genericStageOffset) "Historical route priority is not before generic recognition in $($historicalAdapterEntry.Key)."
    Assert-True ($historicalRoutingBlock -match '(?s)\$p1ApprovedSameTaskTransitionNameStatus\s*=\s*@\(.*?(?:Get-P1ApprovedSameTaskTransitionPreCommitNameStatus|--name-status).*?Select-P1ApprovedSameTaskTransitionHistoricalExactRoute\s+`?\s*-NameStatusRecords\s+\$p1ApprovedSameTaskTransitionNameStatus') "Historical claim does not consume complete raw name-status in $($historicalAdapterEntry.Key)."
    Assert-True ($historicalRoutingBlock -match '(?s)-not\s+\$p1ApprovedSameTaskTransitionHistoricalExactRoute\.Claimed.*?Get-P1ApprovedSameTaskTransitionStageInputs') "Exact historical claim does not suppress generic recognition in $($historicalAdapterEntry.Key)."
    foreach ($historicalRouteName in @($historicalAdapterEntry.Value)) {
        Assert-ContainsExactlyOnce -Text $historicalRoutingBlock -Marker "`"$historicalRouteName`"" -Label "Historical route registration in $($historicalAdapterEntry.Key)"
    }
}

$p1Text = Get-Content -LiteralPath (Join-Path $repositoryRoot $productionFiles[0]) -Raw -Encoding UTF8
$preCommitText = Get-Content -LiteralPath (Join-Path $repositoryRoot $productionFiles[1]) -Raw -Encoding UTF8
$prePushText = Get-Content -LiteralPath (Join-Path $repositoryRoot $productionFiles[2]) -Raw -Encoding UTF8
foreach ($marker in @("P1_PROGRAM_MULTIPLE_ACTIVE_TASKS", "P1_PROGRAM_FINDING_IDENTITY_COUNT_INVALID", "P1_PROGRAM_TASK_FINDING_SET_INVALID", "p1TransitionScopeMode")) {
    Assert-True ($p1Text.Contains($marker)) "P1 stage responsibility marker disappeared: $marker"
}
foreach ($marker in @("HARD_BLOCK_OUT_OF_SCOPE", "HARD_BLOCK_SENSITIVE_EVIDENCE", "requirementSsotReadiness", "terminology")) {
    Assert-True ($preCommitText.IndexOf($marker, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) "Module pre-commit responsibility marker disappeared: $marker"
}
foreach ($marker in @("HARD_BLOCK_GIT_READINESS_FAILED", "HARD_BLOCK_REMOTE_AHEAD", "HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT", "HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID")) {
    Assert-True ($prePushText.Contains($marker)) "Module pre-push responsibility marker disappeared: $marker"
}
foreach ($duplicateContract in @(
    @{ Label = "authorization"; Pattern = "(?i)authorization"; MinimumStages = 3 },
    @{ Label = "exact_files"; Pattern = "(?i)(?:fileset|file_set)"; MinimumStages = 3 },
    @{ Label = "task_base_branch_context"; Pattern = "(?i)context"; MinimumStages = 3 },
    @{ Label = "topology"; Pattern = "(?i)(?:topology|headparents|headparentparts|rev-list --parents)"; MinimumStages = 2 },
    @{ Label = "replay"; Pattern = "(?i)(?:replay|already_materialized)"; MinimumStages = 2 }
)) {
    $stageCount = @($p1Text, $preCommitText, $prePushText | Where-Object { $_ -match $duplicateContract.Pattern }).Count
    Assert-True ($stageCount -ge $duplicateContract.MinimumStages) "Duplicate-logic inventory lost a stage for $($duplicateContract.Label); expected at least $($duplicateContract.MinimumStages)."
}

function New-C2ContractRedCase {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][ValidateSet("raw_parser", "authorization", "context", "projection", "file_set", "topology", "replay", "fallback")][string]$Category,
        [Parameter(Mandatory = $true)][string]$Mutation,
        [Parameter(Mandatory = $true)][string]$ExpectedFindingCode
    )

    return [pscustomobject]@{
        Name = $Name
        Category = $Category
        Mutation = $Mutation
        ExpectedFindingCode = $ExpectedFindingCode
        ExpectedRecognized = $true
        ExpectedValid = $false
        ExpectedMode = "invalid"
    }
}

$c2Fence = ([string][char]96) * 3
$c2ExactPositiveContract = @(
    "${c2Fence}tiku-approved-same-task-transition-v1",
    "schemaVersion=1",
    "transitionType=approved_same_task_transition",
    "transitionId=p1-ast-future-product-transition-001",
    "taskId=p1-remediation-future-product-task-001",
    "parentTaskId=p1-remediation-future-product-task-000",
    "baseSha=61303d935e58e65103563fcb0fa865d7bfb6cf3e",
    "branch=codex/p1-remediation-future-product-task-001",
    "authorizationId=p1-ast-authorization-001",
    "authorizationSource=docs/05-execution-logs/acceptance/p1-ast-authorization-001.md",
    "standingAuthorizationSource=docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md",
    "statePath=docs/04-agent-system/state/project-state.yaml",
    "stateFromSha256=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
    "stateToSha256=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    "queuePath=docs/04-agent-system/state/task-queue.yaml",
    "queueFromSha256=cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
    "queueToSha256=dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd",
    "fileCount=3",
    "singleParent=true",
    "singleCommit=true",
    "oneTime=true",
    "ancestorCheckpointPolicy=transition_only_exact_one_parent",
    "ordinaryDriftPolicy=hard_block",
    "standardModePolicy=hard_block",
    "databaseExecutionPolicy=blocked",
    "permissionExpansionPolicy=blocked",
    "file.001.path=docs/04-agent-system/state/project-state.yaml",
    "file.001.status=M",
    "file.002.path=docs/04-agent-system/state/task-queue.yaml",
    "file.002.status=M",
    "file.003.path=docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md",
    "file.003.status=A",
    $c2Fence
) -join "`n"
$c2ExactPositiveContractSha256 = Get-C3Sha256Text $c2ExactPositiveContract
$c2ExactPositiveFacts = [ordered]@{
    SourcePath = "docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"
    BaseAuthorizationId = "p1-ast-authorization-001"
    BaseAuthorizationSource = "docs/05-execution-logs/acceptance/p1-ast-authorization-001.md"
    BaseStandingAuthorizationSource = "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
    Phase = "pre_commit"
    TransitionId = "p1-ast-future-product-transition-001"
    TaskId = "p1-remediation-future-product-task-001"
    ParentTaskId = "p1-remediation-future-product-task-000"
    BaseSha = "61303d935e58e65103563fcb0fa865d7bfb6cf3e"
    Branch = "codex/p1-remediation-future-product-task-001"
    StatePath = "docs/04-agent-system/state/project-state.yaml"
    StateFromSha256 = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
    StateToSha256 = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
    QueuePath = "docs/04-agent-system/state/task-queue.yaml"
    QueueFromSha256 = "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc"
    QueueToSha256 = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
    BaseAuthorizationPresent = $true
    StandingAuthorizationPresent = $true
    StateProjectionMatches = $true
    QueueProjectionMatches = $true
    NameStatusRecords = @("M`tdocs/04-agent-system/state/project-state.yaml", "M`tdocs/04-agent-system/state/task-queue.yaml", "A`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md")
    ExpectedNameStatusRecords = @("M`tdocs/04-agent-system/state/project-state.yaml", "M`tdocs/04-agent-system/state/task-queue.yaml", "A`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md")
    CandidateFileSha256ByPath = [ordered]@{
        "docs/04-agent-system/state/project-state.yaml" = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb"
        "docs/04-agent-system/state/task-queue.yaml" = "dddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd"
        "docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md" = $c2ExactPositiveContractSha256
    }
    SchemaVersion = "1"
    CommonSha256 = "1111111111111111111111111111111111111111111111111111111111111111"
    P1AdapterSha256 = "2222222222222222222222222222222222222222222222222222222222222222"
    PreCommitAdapterSha256 = "3333333333333333333333333333333333333333333333333333333333333333"
    PrePushAdapterSha256 = "4444444444444444444444444444444444444444444444444444444444444444"
    FixtureSha256 = "5555555555555555555555555555555555555555555555555555555555555555"
    StateProjectionSha256 = "6666666666666666666666666666666666666666666666666666666666666666"
    QueueProjectionSha256 = "7777777777777777777777777777777777777777777777777777777777777777"
    SingleParent = $true
    SingleCommit = $true
    ParentCount = 1
    CommitCount = 1
    AncestorMatches = $true
    RemoteBaselineMatches = $true
    AncestorCheckpointAuthorized = $true
    TransitionConsumed = $false
    OrdinaryDrift = $false
    StandardMode = $false
    CandidateAuthorizationPresent = $false
    CandidateStatusApproved = $false
    CandidateCloseoutPolicyAuthorization = $false
    CandidateProjectionPresent = $false
    ReservedMarkerPresent = $false
}

$c2ContractRedCases = @(
    New-C2ContractRedCase "raw-missing-field" "raw_parser" "remove required scalar schemaVersion" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-duplicate-same-field" "raw_parser" "append schemaVersion=1" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-duplicate-conflicting-field" "raw_parser" "append schemaVersion=2" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-case-variant-key" "raw_parser" "replace taskId with TaskId" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-case-variant-value" "raw_parser" "uppercase approved_same_task_transition" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-duplicate-machine-block" "raw_parser" "duplicate fenced machine block" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "raw-extra-machine-block" "raw_parser" "append unrelated fenced block" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "raw-unknown-field" "raw_parser" "append unknownKey=value" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-type-error" "raw_parser" "set fileCount=three" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-utf8-bom" "raw_parser" "prefix U+FEFF BOM" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "raw-invalid-encoding" "raw_parser" "inject U+FFFD replacement character" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "raw-blank-line" "raw_parser" "insert blank contract line" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-comment" "raw_parser" "insert comment line" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-leading-whitespace" "raw_parser" "prefix scalar line with space" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-trailing-whitespace" "raw_parser" "suffix scalar line with space" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "raw-damaged-fence" "raw_parser" "remove closing fence" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "enum-wrong-schema-version" "raw_parser" "set schemaVersion=2" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "enum-one-time-false" "raw_parser" "set oneTime=false" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "enum-wrong-ancestor-policy" "topology" "set ancestorCheckpointPolicy=standard" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "enum-ordinary-drift-policy" "topology" "set ordinaryDriftPolicy=allow" "P1_AST_ORDINARY_DRIFT_BLOCKED"
    New-C2ContractRedCase "enum-standard-mode-policy" "topology" "set standardModePolicy=allow" "P1_AST_STANDARD_MODE_BLOCKED"
    New-C2ContractRedCase "enum-database-execution-policy" "raw_parser" "set databaseExecutionPolicy=allowed" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "enum-permission-expansion-policy" "raw_parser" "set permissionExpansionPolicy=allowed" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "auth-wrong-id" "authorization" "contract authorizationId differs from base approval" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "auth-wrong-source" "authorization" "contract authorizationSource differs from base approval" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "auth-wrong-standing-source" "authorization" "standingAuthorizationSource differs from base task closeoutPolicy" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "auth-candidate-only" "authorization" "authorization exists only in candidate snapshot" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "auth-self-status-approved" "authorization" "candidate writes Status approved for itself" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "auth-candidate-closeout-policy" "authorization" "candidate adds its own closeoutPolicy authorization" "P1_AST_AUTHORIZATION_INVALID"
    New-C2ContractRedCase "context-wrong-transition-type" "context" "set transitionType=ordinary_transition" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "context-wrong-transition-id" "context" "transitionId differs from task authorization" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "context-wrong-task" "context" "taskId differs from active task" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "context-wrong-parent" "context" "parentTaskId differs from ready predecessor" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "context-wrong-base" "context" "baseSha differs from Git parent" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "context-wrong-branch" "context" "branch differs from phase branch" "P1_AST_CONTEXT_INVALID"
    New-C2ContractRedCase "projection-wrong-state-path" "projection" "statePath differs from SSOT" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "projection-wrong-state-from" "projection" "stateFromSha256 differs from base" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "projection-wrong-state-to" "projection" "stateToSha256 differs from candidate" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "projection-wrong-queue-path" "projection" "queuePath differs from SSOT" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "projection-wrong-queue-from" "projection" "queueFromSha256 differs from base" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "projection-wrong-queue-to" "projection" "queueToSha256 differs from candidate" "P1_AST_PROJECTION_INVALID"
    New-C2ContractRedCase "files-missing" "file_set" "remove expected name-status record" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-extra" "file_set" "append governance file" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-duplicate" "file_set" "duplicate exact path and status" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-reordered" "file_set" "swap file.001 and file.002" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-case-variant" "file_set" "uppercase one path segment" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-raw-count-mismatch" "file_set" "raw record count differs from fileCount" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-unique-count-mismatch" "file_set" "case-sensitive unique count differs" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-expected-count-mismatch" "file_set" "fileCount differs from indexed entries" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-status-delete" "file_set" "set status D" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-status-rename" "file_set" "set status R" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-status-copy" "file_set" "set status C" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-status-unknown" "file_set" "set status X" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "files-product-path" "file_set" "append src product path" "P1_AST_FILE_SET_INVALID"
    New-C2ContractRedCase "topology-standard-mode" "topology" "set standard mode" "P1_AST_STANDARD_MODE_BLOCKED"
    New-C2ContractRedCase "topology-ordinary-drift" "topology" "set ordinary in_progress SHA drift" "P1_AST_ORDINARY_DRIFT_BLOCKED"
    New-C2ContractRedCase "topology-multi-parent" "topology" "set two Git parents" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-multi-commit" "topology" "set candidate commit count greater than one" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-wrong-ancestor" "topology" "candidate parent differs from baseSha" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-remote-baseline" "topology" "origin master differs from baseSha" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-unauthorized-ancestor" "topology" "request ancestor checkpoint without valid transition" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-single-parent-false" "topology" "set singleParent=false" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "topology-single-commit-false" "topology" "set singleCommit=false" "P1_AST_TOPOLOGY_INVALID"
    New-C2ContractRedCase "replay-consumed-transition" "replay" "transitionId already exists at base" "P1_AST_REPLAY_BLOCKED"
    New-C2ContractRedCase "fallback-reserved-marker" "fallback" "reserved transitionType marker with damaged block" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "fallback-contract-path" "fallback" "contract source path with missing block" "P1_AST_CONTRACT_BLOCK_INVALID"
    New-C2ContractRedCase "fallback-candidate-projection" "fallback" "candidate state projection references transitionId but contract is partial" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "fallback-case-variant-marker" "fallback" "case-variant reserved marker" "P1_AST_FIELD_INVALID"
    New-C2ContractRedCase "fallback-half-built" "fallback" "state queue and authorization contract are incomplete" "P1_AST_FIELD_INVALID"
)

$c2RequiredCategories = @("raw_parser", "authorization", "context", "projection", "file_set", "topology", "replay", "fallback")
$c2RequiredFindingCodes = @("P1_AST_CONTRACT_BLOCK_INVALID", "P1_AST_FIELD_INVALID", "P1_AST_AUTHORIZATION_INVALID", "P1_AST_CONTEXT_INVALID", "P1_AST_PROJECTION_INVALID", "P1_AST_FILE_SET_INVALID", "P1_AST_TOPOLOGY_INVALID", "P1_AST_REPLAY_BLOCKED", "P1_AST_ORDINARY_DRIFT_BLOCKED", "P1_AST_STANDARD_MODE_BLOCKED")
Assert-True (-not [string]::IsNullOrWhiteSpace($c2ExactPositiveContract) -and $c2ExactPositiveFacts.Count -gt 0) "C2 exact positive contract/facts fixture is incomplete."
Assert-True (@($c2ContractRedCases.Name | Sort-Object -CaseSensitive -Unique).Count -eq $c2ContractRedCases.Count) "C2 RED matrix contains duplicate case names."
Assert-True (@($c2RequiredCategories | Where-Object { $_ -notin $c2ContractRedCases.Category }).Count -eq 0) "C2 RED matrix is missing a required category."
Assert-True (@($c2RequiredFindingCodes | Where-Object { $_ -notin $c2ContractRedCases.ExpectedFindingCode }).Count -eq 0) "C2 RED matrix is missing a stable core finding code."
Assert-True (@($c2ContractRedCases | Where-Object { -not $_.ExpectedRecognized -or $_.ExpectedValid -or $_.ExpectedMode -cne "invalid" -or [string]::IsNullOrWhiteSpace($_.Mutation) }).Count -eq 0) "C2 RED matrix contains an invalid fail-closed expectation."

function Copy-C3Facts {
    param([Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts)
    $copy = [ordered]@{}
    foreach ($key in $Facts.Keys) {
        $value = $Facts[$key]
        $copy[$key] = if ($value -is [array]) { @($value) } else { $value }
    }
    return $copy
}

function Set-C3ContractValue {
    param([string]$Text, [string]$Key, [string]$Value)
    $pattern = "(?m)^$([regex]::Escape($Key))=.*$"
    if ([regex]::Matches($Text, $pattern).Count -ne 1) { throw "C3 fixture key is not unique: $Key" }
    return [regex]::Replace($Text, $pattern, "$Key=$Value")
}

function Add-C3ContractLine {
    param([string]$Text, [string]$Line)
    $closingFence = "`n$c2Fence"
    $index = $Text.LastIndexOf($closingFence, [System.StringComparison]::Ordinal)
    if ($index -lt 0) { throw "C3 fixture closing fence is missing." }
    return $Text.Substring(0, $index) + "`n$Line" + $Text.Substring($index)
}

function Set-C3ContractFiles {
    param([Parameter(Mandatory = $true)][AllowEmptyCollection()][object[]]$Files)
    $text = [regex]::Replace($c2ExactPositiveContract, '(?m)^file\.[0-9]{3}\.(path|status)=.*\n?', '')
    $text = Set-C3ContractValue $text "fileCount" ([string]$Files.Count)
    for ($index = 0; $index -lt $Files.Count; $index++) {
        $indexText = ($index + 1).ToString("000")
        $text = Add-C3ContractLine $text "file.$indexText.path=$($Files[$index].Path)"
        $text = Add-C3ContractLine $text "file.$indexText.status=$($Files[$index].Status)"
    }
    return $text
}

function Get-C3ContractCaseInput {
    param([Parameter(Mandatory = $true)]$Case)
    $text = $c2ExactPositiveContract
    $facts = Copy-C3Facts $c2ExactPositiveFacts
    switch ($Case.Name) {
        "raw-missing-field" { $text = [regex]::Replace($text, '(?m)^schemaVersion=1\n', ''); break }
        "raw-duplicate-same-field" { $text = Add-C3ContractLine $text "schemaVersion=1"; break }
        "raw-duplicate-conflicting-field" { $text = Add-C3ContractLine $text "schemaVersion=2"; break }
        "raw-case-variant-key" { $text = $text.Replace("taskId=", "TaskId="); break }
        "raw-case-variant-value" { $text = Set-C3ContractValue $text "transitionType" "APPROVED_SAME_TASK_TRANSITION"; break }
        "raw-duplicate-machine-block" { $text = "$text`n$text"; break }
        "raw-extra-machine-block" { $text = "$text`n${c2Fence}other-block`nx=y`n$c2Fence"; break }
        "raw-unknown-field" { $text = Add-C3ContractLine $text "unknownKey=value"; break }
        "raw-type-error" { $text = Set-C3ContractValue $text "fileCount" "three"; break }
        "raw-utf8-bom" { $text = ([string][char]0xFEFF) + $text; break }
        "raw-invalid-encoding" { $text = $text.Replace("taskId=", "taskId=$([char]0xFFFD)"); break }
        "raw-blank-line" { $text = $text.Replace("schemaVersion=1`n", "schemaVersion=1`n`n"); break }
        "raw-comment" { $text = $text.Replace("schemaVersion=1`n", "schemaVersion=1`n# forbidden`n"); break }
        "raw-leading-whitespace" { $text = $text.Replace("schemaVersion=1", " schemaVersion=1"); break }
        "raw-trailing-whitespace" { $text = $text.Replace("schemaVersion=1", "schemaVersion=1 "); break }
        "raw-damaged-fence" { $text = $text.Substring(0, $text.LastIndexOf("`n$c2Fence", [StringComparison]::Ordinal)); break }
        "enum-wrong-schema-version" { $text = Set-C3ContractValue $text "schemaVersion" "2"; break }
        "enum-one-time-false" { $text = Set-C3ContractValue $text "oneTime" "false"; break }
        "enum-wrong-ancestor-policy" { $text = Set-C3ContractValue $text "ancestorCheckpointPolicy" "standard"; break }
        "enum-ordinary-drift-policy" { $text = Set-C3ContractValue $text "ordinaryDriftPolicy" "allow"; break }
        "enum-standard-mode-policy" { $text = Set-C3ContractValue $text "standardModePolicy" "allow"; break }
        "enum-database-execution-policy" { $text = Set-C3ContractValue $text "databaseExecutionPolicy" "allowed"; break }
        "enum-permission-expansion-policy" { $text = Set-C3ContractValue $text "permissionExpansionPolicy" "allowed"; break }
        "auth-wrong-id" { $text = Set-C3ContractValue $text "authorizationId" "wrong"; break }
        "auth-wrong-source" { $text = Set-C3ContractValue $text "authorizationSource" "docs/wrong.md"; break }
        "auth-wrong-standing-source" { $text = Set-C3ContractValue $text "standingAuthorizationSource" "docs/wrong.md"; break }
        "auth-candidate-only" { $facts.BaseAuthorizationPresent = $false; $facts.CandidateAuthorizationPresent = $true; break }
        "auth-self-status-approved" { $facts.CandidateStatusApproved = $true; break }
        "auth-candidate-closeout-policy" { $facts.CandidateCloseoutPolicyAuthorization = $true; break }
        "context-wrong-transition-type" { $text = Set-C3ContractValue $text "transitionType" "ordinary_transition"; break }
        "context-wrong-transition-id" { $text = Set-C3ContractValue $text "transitionId" "wrong"; break }
        "context-wrong-task" { $text = Set-C3ContractValue $text "taskId" "wrong"; break }
        "context-wrong-parent" { $text = Set-C3ContractValue $text "parentTaskId" "wrong"; break }
        "context-wrong-base" { $text = Set-C3ContractValue $text "baseSha" ("0" * 40); break }
        "context-wrong-branch" { $text = Set-C3ContractValue $text "branch" "codex/wrong"; break }
        "projection-wrong-state-path" { $text = Set-C3ContractValue $text "statePath" "docs/wrong.yaml"; break }
        "projection-wrong-state-from" { $text = Set-C3ContractValue $text "stateFromSha256" ("0" * 64); break }
        "projection-wrong-state-to" { $text = Set-C3ContractValue $text "stateToSha256" ("0" * 64); break }
        "projection-wrong-queue-path" { $text = Set-C3ContractValue $text "queuePath" "docs/wrong.yaml"; break }
        "projection-wrong-queue-from" { $text = Set-C3ContractValue $text "queueFromSha256" ("0" * 64); break }
        "projection-wrong-queue-to" { $text = Set-C3ContractValue $text "queueToSha256" ("0" * 64); break }
        "files-missing" { $facts.NameStatusRecords = @($facts.NameStatusRecords[0..1]); break }
        "files-extra" { $facts.NameStatusRecords = @($facts.NameStatusRecords + "M`tdocs/extra.md"); break }
        "files-duplicate" { $facts.NameStatusRecords = @($facts.NameStatusRecords + $facts.NameStatusRecords[2]); break }
        "files-reordered" { $facts.NameStatusRecords = @($facts.NameStatusRecords[1], $facts.NameStatusRecords[0], $facts.NameStatusRecords[2]); break }
        "files-case-variant" { $facts.NameStatusRecords[2] = $facts.NameStatusRecords[2].Replace("transitions", "Transitions"); break }
        "files-raw-count-mismatch" { $facts.NameStatusRecords = @($facts.NameStatusRecords + $facts.NameStatusRecords[0]); break }
        "files-unique-count-mismatch" { $facts.NameStatusRecords = @($facts.NameStatusRecords + $facts.NameStatusRecords[0].ToUpperInvariant()); break }
        "files-expected-count-mismatch" { $text = Set-C3ContractValue $text "fileCount" "4"; break }
        "files-status-delete" { $text = Set-C3ContractValue $text "file.003.status" "D"; $facts.NameStatusRecords[2] = "D`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; break }
        "files-status-rename" { $text = Set-C3ContractValue $text "file.003.status" "R"; $facts.NameStatusRecords[2] = "R`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; break }
        "files-status-copy" { $text = Set-C3ContractValue $text "file.003.status" "C"; $facts.NameStatusRecords[2] = "C`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; break }
        "files-status-unknown" { $text = Set-C3ContractValue $text "file.003.status" "X"; $facts.NameStatusRecords[2] = "X`tdocs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; break }
        "files-product-path" { $text = Set-C3ContractValue $text "file.003.path" "src/product.ts"; $facts.NameStatusRecords[2] = "A`tsrc/product.ts"; break }
        "topology-standard-mode" { $facts.StandardMode = $true; break }
        "topology-ordinary-drift" { $facts.OrdinaryDrift = $true; break }
        "topology-multi-parent" { $facts.ParentCount = 2; break }
        "topology-multi-commit" { $facts.CommitCount = 2; break }
        "topology-wrong-ancestor" { $facts.AncestorMatches = $false; break }
        "topology-remote-baseline" { $facts.RemoteBaselineMatches = $false; break }
        "topology-unauthorized-ancestor" { $facts.AncestorCheckpointAuthorized = $false; break }
        "topology-single-parent-false" { $text = Set-C3ContractValue $text "singleParent" "false"; break }
        "topology-single-commit-false" { $text = Set-C3ContractValue $text "singleCommit" "false"; break }
        "replay-consumed-transition" { $facts.TransitionConsumed = $true; break }
        "fallback-reserved-marker" { $text = "transitionType=approved_same_task_transition"; $facts.ReservedMarkerPresent = $true; break }
        "fallback-contract-path" { $text = ""; break }
        "fallback-candidate-projection" { $text = "${c2Fence}tiku-approved-same-task-transition-v1`ntransitionId=partial`n$c2Fence"; $facts.CandidateProjectionPresent = $true; break }
        "fallback-case-variant-marker" { $text = "transitionType=Approved_Same_Task_Transition"; $facts.ReservedMarkerPresent = $true; break }
        "fallback-half-built" { $text = "${c2Fence}tiku-approved-same-task-transition-v1`nschemaVersion=1`n$c2Fence"; $facts.CandidateProjectionPresent = $true; break }
        default { throw "C3 matrix mutation is not implemented: $($Case.Name)" }
    }
    return [pscustomobject]@{ Text = $text; Facts = $facts }
}

$c2SharedPath = Join-Path $repositoryRoot "scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1"
$c3SchemaPath = Join-Path $repositoryRoot "docs/04-agent-system/state/p1-approved-same-task-transition-schema-v1.yaml"
$c3SopPath = Join-Path $repositoryRoot "docs/04-agent-system/sop/p1-approved-same-task-transition.md"
Assert-True ((Test-Path -LiteralPath $c3SchemaPath -PathType Leaf) -and (Test-Path -LiteralPath $c3SopPath -PathType Leaf)) "C3 schema/SOP RED: strict contract schema and operating procedure are absent."
$c3SchemaText = Get-Content -LiteralPath $c3SchemaPath -Raw -Encoding UTF8
$c3SopText = Get-Content -LiteralPath $c3SopPath -Raw -Encoding UTF8
foreach ($c3ContractMarker in @(
    "tiku-approved-same-task-transition-v1",
    "rawFirst: true",
    "ordinalCaseSensitive: true",
    "ordinalSorted: true",
    "fileCountFormat: positive_decimal",
    "maximum: 999",
    "baseShaPattern: lowercase_hex_40",
    "sha256Pattern: lowercase_hex_64",
    "baseAnchoredExpectedNameStatusRecords: true",
    "candidateFileSha256ByPath:",
    "requiredFileRoles:",
    "contractRawHashBinding: true",
    "projectionToHashBinding: true",
    "requiredBooleanFacts:",
    "strictIntegerFacts:",
    "allowedStatuses:",
    "P1_AST_REPLAY_BLOCKED"
)) {
    Assert-True ($c3SchemaText.Contains($c3ContractMarker)) "C3 schema is missing marker: $c3ContractMarker"
}
foreach ($c3SopMarker in @("Base authorization anchor", "Wide recognition", "A/M-only", "C3 provides the stage-free contract parser")) {
    Assert-True ($c3SopText.Contains($c3SopMarker)) "C3 SOP is missing marker: $c3SopMarker"
}
$c4AdapterBodies = @()
foreach ($c4GuardRelativePath in @(
    "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
    "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
    "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1"
)) {
    $c4GuardText = Get-Content -LiteralPath (Join-Path $repositoryRoot $c4GuardRelativePath) -Raw -Encoding UTF8
    foreach ($c4Marker in @(
        "P1ApprovedSameTaskTransition.Common.ps1",
        "Get-P1ApprovedSameTaskTransitionStageInputs",
        "p1ApprovedSameTaskTransitionAutomatic",
        "function Invoke-P1ApprovedSameTaskTransitionAdapter",
        "Read-P1ApprovedSameTaskTransitionContract",
        "Test-P1ApprovedSameTaskTransition",
        "p1ApprovedSameTaskTransitionCoreFinding"
    )) {
        Assert-True ($c4GuardText.Contains($c4Marker)) "C4 adapter consistency RED: $c4GuardRelativePath is missing $c4Marker"
    }
    $c4AdapterBody = [regex]::Match($c4GuardText, '(?ms)^function Invoke-P1ApprovedSameTaskTransitionAdapter\s*\{.*?(?=^# C4-ADAPTER-IMPLEMENTATION-END)').Value
    Assert-True (-not [string]::IsNullOrWhiteSpace($c4AdapterBody)) "C4 adapter consistency RED: $c4GuardRelativePath has no extractable shared adapter."
    $c4AdapterBodies += $c4AdapterBody
}
Assert-True (@($c4AdapterBodies | Sort-Object -Unique).Count -eq 1) "C4 adapters do not use one identical parser/validator delegation body."
if (Test-Path -LiteralPath $c2SharedPath -PathType Leaf) { . $c2SharedPath }
foreach ($c3SharedFunction in @(
    "Read-P1ApprovedSameTaskTransitionContract",
    "Get-P1ApprovedSameTaskTransitionCanonicalFiles",
    "Get-P1ApprovedSameTaskTransitionCandidateTreeHash",
    "Get-P1ApprovedSameTaskTransitionFreshnessKey",
    "Test-P1ApprovedSameTaskTransition",
    "Read-P1TransitionMachineEvidence"
)) {
    Assert-True ($null -ne (Get-Command $c3SharedFunction -CommandType Function -ErrorAction SilentlyContinue)) "C3 shared interface is missing: $c3SharedFunction"
}

$c6P1GuardText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-P1RemediationSerialProgram.ps1") -Raw -Encoding UTF8
$c6P1FullSmokeText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1") -Raw -Encoding UTF8
$c6FocusedSmokeText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1") -Raw -Encoding UTF8
$c6ModulePreCommitGuardText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1") -Raw -Encoding UTF8
$c6ModulePreCommitFullSmokeText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1") -Raw -Encoding UTF8
$c6ModulePrePushGuardText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1") -Raw -Encoding UTF8
$c6ModulePrePushFullSmokeText = Get-Content -LiteralPath (Join-Path $repositoryRoot "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1") -Raw -Encoding UTF8
$c6P1FullSmokeTokens = $null
$c6P1FullSmokeParseErrors = $null
$c6P1FullSmokeAst = [System.Management.Automation.Language.Parser]::ParseInput($c6P1FullSmokeText, [ref]$c6P1FullSmokeTokens, [ref]$c6P1FullSmokeParseErrors)
Assert-True ($c6P1FullSmokeParseErrors.Count -eq 0) "C6 P1 full orchestration RED: P1 smoke source does not parse."
$c6NestedModuleFullCommands = @($c6P1FullSmokeAst.FindAll({
            param($node)
            $node -is [System.Management.Automation.Language.CommandAst] -and $node.Extent.Text -match 'Test-ModuleRunV2PreCommitHardening\.Smoke\.ps1'
        }, $true))
Assert-True ($c6NestedModuleFullCommands.Count -eq 0) "C6 P1 full orchestration RED: P1 full still invokes the complete Module pre-commit full smoke."
foreach ($c6P1OwnedF0117Marker in @(
        'Test-P1F0117SpecApprovalTransitionHotfixFileSet',
        'Test-P1F0117SmokeScopeCorrectionFileSet',
        'Test-P1F0117SmokeScopeCloseoutLifecycleHotfixFileSet'
    )) {
    Assert-True $c6P1FullSmokeText.Contains($c6P1OwnedF0117Marker) "C6 P1 full orchestration RED: P1-owned F-0117 contract/source check disappeared: $c6P1OwnedF0117Marker"
}
$c6F0143ProjectionBlock = [regex]::Match($c6ModulePreCommitFullSmokeText, '(?ms)^# C6-F0143-FIXTURE-PROJECTION-BEGIN\r?\n.*?^# C6-F0143-FIXTURE-PROJECTION-END\r?$').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6F0143ProjectionBlock)) "C6 F-0143 fixture RED: fixed-base projection block is missing."
$c6F0143CurrentCandidateBlock = [regex]::Match($c6F0143ProjectionBlock, '(?ms)^\$f0143BehaviorCurrentCandidateFiles = @\(\r?\n.*?^\)\r?$').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6F0143CurrentCandidateBlock)) "C6 F-0143 fixture RED: current-candidate file list is missing."
foreach ($c6F0143HistoricalProjectionPath in @('docs/04-agent-system/state/project-state.yaml', 'docs/04-agent-system/state/task-queue.yaml')) {
    Assert-True (-not $c6F0143CurrentCandidateBlock.Contains($c6F0143HistoricalProjectionPath)) "C6 F-0143 fixture RED: fixed-base state/queue still comes from the current mechanism worktree: $c6F0143HistoricalProjectionPath"
}
foreach ($c6F0143ProjectionMarker in @(
        'git -C $f0143BehaviorRoot show "${f0143BehaviorBaseSha}:$f0143BehaviorStatePath"',
        'git -C $f0143BehaviorRoot show "${f0143BehaviorBaseSha}:$f0143BehaviorQueuePath"',
        'current_user_approved_f0143_option_a_but_written_spec_review_is_required',
        'current_user_approved_written_f0143_spec_2026_07_18',
        'lastKnownMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b',
        'lastKnownMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983'
    )) {
    Assert-True $c6F0143ProjectionBlock.Contains($c6F0143ProjectionMarker) "C6 F-0143 fixture RED: exact fixed-base projection marker is missing: $c6F0143ProjectionMarker"
}
$c6F0143PrePushProjectionBlock = [regex]::Match($c6ModulePrePushFullSmokeText, '(?ms)^# C6-F0143-PREPUSH-FIXTURE-PROJECTION-BEGIN\r?\n.*?^# C6-F0143-PREPUSH-FIXTURE-PROJECTION-END\r?$').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6F0143PrePushProjectionBlock)) "C6 F-0143 pre-push fixture RED: fixed-base projection block is missing."
foreach ($c6F0143PrePushCurrentCopyMarker in @(
        '$f0143CurrentCandidateFiles = @($f0143Files | Where-Object { $_ -notin @($f0115PrePushProjectStatePath, $f0115PrePushQueuePath) })',
        'foreach ($candidatePath in $f0143CurrentCandidateFiles)'
    )) {
    Assert-True $c6F0143PrePushProjectionBlock.Contains($c6F0143PrePushCurrentCopyMarker) "C6 F-0143 pre-push fixture RED: current state/queue exclusion is missing: $c6F0143PrePushCurrentCopyMarker"
}
Assert-True (-not $c6F0143PrePushProjectionBlock.Contains('foreach ($candidatePath in $f0143Files)')) "C6 F-0143 pre-push fixture RED: current state/queue are still copied through the complete candidate list."
foreach ($c6F0143PrePushProjectionMarker in @(
        'git -C $f0143FixtureRoot show "${f0143BaseSha}:$f0115PrePushProjectStatePath"',
        'git -C $f0143FixtureRoot show "${f0143BaseSha}:$f0115PrePushQueuePath"',
        'current_user_approved_f0143_option_a_but_written_spec_review_is_required',
        'current_user_approved_written_f0143_spec_2026_07_18',
        'lastKnownMasterSha: 4f63c3c17731cbc686bb234b89a64c31f36ab03b',
        'lastKnownMasterSha: $f0143BaseSha'
    )) {
    Assert-True $c6F0143PrePushProjectionBlock.Contains($c6F0143PrePushProjectionMarker) "C6 F-0143 pre-push fixture RED: exact fixed-base projection marker is missing: $c6F0143PrePushProjectionMarker"
}
$c6ManualMechanismBlock = [regex]::Match($c6P1GuardText, '(?ms)^# C6-MANUAL-MECHANISM-BOOTSTRAP-BEGIN\r?\n.*?^# C6-MANUAL-MECHANISM-BOOTSTRAP-END\r?$').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6ManualMechanismBlock)) "C6 manual mechanism RED: exact manual bootstrap compatibility block is missing."
foreach ($c6ManualMechanismMarker in @(
        '$Phase -ceq "manual"',
        'p1-mechanism-execution-compatibility-v2-1-2026-07-19',
        'taskKind',
        'mechanism_hardening',
        'productClosureContribution',
        'findingIds',
        'P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID manual',
        'P1_PROGRAM_MECHANISM_BOOTSTRAP_FILE_SET_INVALID'
    )) {
    Assert-True $c6ManualMechanismBlock.Contains($c6ManualMechanismMarker) "C6 manual mechanism RED: required fail-closed marker is missing: $c6ManualMechanismMarker"
}
$c6FindinglessMechanismPredicate = [regex]::Match($c6P1GuardText, '(?ms)^\s*\$isApprovedFindinglessMechanismBootstrapTask\s*=.*?(?=^\s*if \(\$taskCandidate)').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6FindinglessMechanismPredicate)) "C6 findingless mechanism negative-boundary RED: approval predicate is missing."
Assert-True $c6FindinglessMechanismPredicate.Contains('$taskFindingIds.Count -eq 0') "C6 findingless mechanism negative-boundary RED: approval predicate does not require an empty findingIds list."
Assert-True $c6FindinglessMechanismPredicate.Contains('(Get-ScalarValue -Block $materializedTaskBlock -Key "findingIds") -ceq "[]"') "C6 missing findingIds key RED: materialized-task exemption does not require explicit findingIds: []."
Assert-True $c6ManualMechanismBlock.Contains('(Get-ScalarValue -Block $taskBlock -Key "findingIds") -ceq "[]"') "C6 missing findingIds key RED: manual context does not require explicit findingIds: []."
$c6MechanismAnchorBlock = [regex]::Match($c6P1GuardText, '(?ms)^function Test-P1MechanismBootstrapAnchors\s*\{.*?(?=^function |^\$programText)').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6MechanismAnchorBlock)) "C6 missing findingIds key RED: mechanism anchor function is missing."
Assert-True $c6MechanismAnchorBlock.Contains('(Get-ScalarValue -Block $CurrentTaskBlock -Key "findingIds") -cne "[]"') "C6 missing findingIds key RED: anchor validation does not reject a missing findingIds key."
$c6FocusedSmokeTokens = $null
$c6FocusedSmokeParseErrors = $null
$c6FocusedSmokeAst = [System.Management.Automation.Language.Parser]::ParseInput($c6FocusedSmokeText, [ref]$c6FocusedSmokeTokens, [ref]$c6FocusedSmokeParseErrors)
Assert-True ($c6FocusedSmokeParseErrors.Count -eq 0) "C6 focused performance RED: focused smoke source does not parse."
$c6BootstrapResetFunctions = @($c6FocusedSmokeAst.FindAll({
            param($node)
            $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -ceq "Set-BootstrapFixtureCandidate"
        }, $true))
Assert-True ($c6BootstrapResetFunctions.Count -eq 1) "C6 focused performance RED: reusable bootstrap candidate reset is missing."
$c6BootstrapResetText = if ($c6BootstrapResetFunctions.Count -eq 1) { $c6BootstrapResetFunctions[0].Extent.Text } else { "" }
foreach ($c6BootstrapIsolationMarker in @(
        'checkout --quiet -B $branch $baseSha',
        'reset --hard --quiet $baseSha',
        'clean -fdx --quiet'
    )) {
    Assert-True $c6BootstrapResetText.Contains($c6BootstrapIsolationMarker) "C6 focused performance RED: reusable bootstrap reset is missing isolation marker: $c6BootstrapIsolationMarker"
}
$c6BootstrapNegativeLoops = @($c6FocusedSmokeAst.FindAll({
            param($node)
            $node -is [System.Management.Automation.Language.ForEachStatementAst] `
                -and $node.Extent.Text.Contains('Name = "wrong-task-kind"') `
                -and $node.Extent.Text.Contains('$negativeResult = Invoke-Guard $negativeRoot')
        }, $true))
Assert-True ($c6BootstrapNegativeLoops.Count -eq 1) "C6 focused performance RED: bootstrap negative matrix is missing or duplicated."
$c6BootstrapNegativeLoopText = if ($c6BootstrapNegativeLoops.Count -eq 1) { $c6BootstrapNegativeLoops[0].Extent.Text } else { "" }
Assert-True ([regex]::Matches($c6BootstrapNegativeLoopText, 'Name\s*=\s*"').Count -eq 10) "C6 focused performance RED: bootstrap negative matrix no longer contains all ten cases."
Assert-True ($c6BootstrapNegativeLoopText -notmatch 'New-BootstrapFixture(?:Root)?') "C6 focused performance RED: bootstrap negative loop still creates a clone per case."
Assert-True ([regex]::Matches($c6BootstrapNegativeLoopText, 'Set-BootstrapFixtureCandidate').Count -eq 1) "C6 focused performance RED: bootstrap negative loop does not rebuild one reusable fixture per case."
Assert-True ($c6FocusedSmokeText.Contains('$negativeRoot = New-BootstrapFixtureRoot -Name "negative-reusable"')) "C6 focused performance RED: reusable bootstrap negative root is not initialized exactly once outside the loop."
Assert-True ($null -ne (Get-Command Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -CommandType Function -ErrorAction SilentlyContinue)) "C6 unborn pre-commit RED: shared strict raw loader is missing."
foreach ($c6UnbornAdapterCase in @(
        @{ Name = "P1"; Text = $c6P1GuardText; Root = '$RepositoryRoot' },
        @{ Name = "Module pre-commit"; Text = $c6ModulePreCommitGuardText; Root = '$repositoryRoot' }
    )) {
    $c6UnbornRoutingBlock = [regex]::Match($c6UnbornAdapterCase.Text, '(?ms)^# C4-ADAPTER-ROUTING-BEGIN\r?\n.*?^# C4-ADAPTER-ROUTING-END\r?$').Value
    Assert-True (-not [string]::IsNullOrWhiteSpace($c6UnbornRoutingBlock)) "C6 unborn pre-commit RED: $($c6UnbornAdapterCase.Name) routing block is missing."
    Assert-True ($c6UnbornRoutingBlock.Contains("Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -RepositoryRoot $($c6UnbornAdapterCase.Root)")) "C6 unborn pre-commit RED: $($c6UnbornAdapterCase.Name) does not use the shared strict raw loader."
    Assert-True ($c6UnbornRoutingBlock -notmatch 'git\s+-C\s+\$[^\s]+\s+diff\s+--cached\s+--name-status\s+--no-renames\s+HEAD') "C6 unborn pre-commit RED: $($c6UnbornAdapterCase.Name) still diffs an unconditional HEAD."
}
Assert-True $c6ModulePrePushGuardText.Contains('$p1ApprovedSameTaskTransitionNameStatus = @(& git diff --name-status --no-renames $originMasterSha $masterSha)') "C6 empty name-status RED: Module pre-push does not preserve an empty array."

$c6UnbornRawRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-v21-unborn-raw-" + [guid]::NewGuid().ToString("N"))
try {
    [void](New-Item -ItemType Directory -Path (Join-Path $c6UnbornRawRoot "docs/one") -Force)
    [void](New-Item -ItemType Directory -Path (Join-Path $c6UnbornRawRoot "scripts/two") -Force)
    [IO.File]::WriteAllText((Join-Path $c6UnbornRawRoot "docs/one/alpha.md"), "alpha`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText((Join-Path $c6UnbornRawRoot "scripts/two/beta.ps1"), "beta`n", [Text.UTF8Encoding]::new($false))
    & git -C $c6UnbornRawRoot init --quiet
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize C6 unborn raw-loader fixture." }
    & git -C $c6UnbornRawRoot config user.name "Tiku C6 Unborn Smoke"
    & git -C $c6UnbornRawRoot config user.email "c6-unborn-smoke@example.invalid"
    & git -C $c6UnbornRawRoot add --all
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage C6 unborn raw-loader fixture." }
    $null = @(& git -C $c6UnbornRawRoot rev-parse --verify --quiet HEAD)
    Assert-True ($LASTEXITCODE -ne 0) "C6 unborn pre-commit RED: fixture unexpectedly has HEAD."
    $c6UnbornRawRecords = @(Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -RepositoryRoot $c6UnbornRawRoot)
    $c6UnbornCanonicalRecords = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $c6UnbornRawRecords | ForEach-Object { "$($_.Status)`t$($_.Path)" })
    Assert-True (($c6UnbornCanonicalRecords -join "|") -ceq ("A`tdocs/one/alpha.md|A`tscripts/two/beta.ps1")) "C6 unborn pre-commit RED: empty-tree comparison did not return complete A records: $($c6UnbornRawRecords -join ',')"

    $c6InvalidIndexPath = Join-Path $c6UnbornRawRoot "invalid-index"
    [IO.File]::WriteAllText($c6InvalidIndexPath, "not-a-git-index", [Text.UTF8Encoding]::new($false))
    $c6OriginalIndexFile = [Environment]::GetEnvironmentVariable("GIT_INDEX_FILE", [EnvironmentVariableTarget]::Process)
    $c6InvalidIndexOutput = [System.Collections.Generic.List[string]]::new()
    $c6InvalidIndexFailed = $false
    $c6PriorErrorActionPreference = $ErrorActionPreference
    try {
        [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $c6InvalidIndexPath, [EnvironmentVariableTarget]::Process)
        $ErrorActionPreference = "Continue"
        try {
            @(Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -RepositoryRoot $c6UnbornRawRoot 2>&1) | ForEach-Object { $c6InvalidIndexOutput.Add($_.ToString()) }
        } catch {
            $c6InvalidIndexFailed = $true
            $c6InvalidIndexOutput.Add($_.Exception.Message)
        }
    } finally {
        $ErrorActionPreference = $c6PriorErrorActionPreference
        [Environment]::SetEnvironmentVariable("GIT_INDEX_FILE", $c6OriginalIndexFile, [EnvironmentVariableTarget]::Process)
    }
    Assert-True $c6InvalidIndexFailed "C6 unborn pre-commit RED: failed Git index inspection returned a fake empty result."
    Assert-True (($c6InvalidIndexOutput -join "`n") -match 'fatal:.*index|P1_AST_PRE_COMMIT_NAME_STATUS_GIT_FAILED') "C6 unborn pre-commit RED: Git failure stderr/stable finding was swallowed: $($c6InvalidIndexOutput -join ' | ')"
    Remove-Item -LiteralPath $c6InvalidIndexPath

    & git -C $c6UnbornRawRoot commit --quiet -m "base"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit C6 existing-HEAD raw-loader fixture." }
    [IO.File]::WriteAllText((Join-Path $c6UnbornRawRoot "docs/one/alpha.md"), "changed`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText((Join-Path $c6UnbornRawRoot "docs/one/gamma.md"), "gamma`n", [Text.UTF8Encoding]::new($false))
    & git -C $c6UnbornRawRoot add --all
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage C6 existing-HEAD raw-loader fixture." }
    $c6HeadRawRecords = @(Get-P1ApprovedSameTaskTransitionPreCommitNameStatus -RepositoryRoot $c6UnbornRawRoot)
    $c6HeadCanonicalRecords = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $c6HeadRawRecords | ForEach-Object { "$($_.Status)`t$($_.Path)" })
    Assert-True (($c6HeadCanonicalRecords -join "|") -ceq ("M`tdocs/one/alpha.md|A`tdocs/one/gamma.md")) "C6 existing-HEAD pre-commit RED: HEAD comparison drifted: $($c6HeadRawRecords -join ',')"
} finally {
    if (Test-Path -LiteralPath $c6UnbornRawRoot) { Remove-Fixture -Root $c6UnbornRawRoot }
}

$c6UnbornModuleRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-v21-unborn-module-" + [guid]::NewGuid().ToString("N"))
try {
    foreach ($c6UnbornModuleDirectory in @("docs/04-agent-system/state", "src/app/api/v1/employee-import-commands/[other]")) {
        [void](New-Item -ItemType Directory -Path (Join-Path $c6UnbornModuleRoot $c6UnbornModuleDirectory) -Force)
    }
    $c6UnbornModuleStatePath = Join-Path $c6UnbornModuleRoot "docs/04-agent-system/state/project-state.yaml"
    $c6UnbornModuleQueuePath = Join-Path $c6UnbornModuleRoot "docs/04-agent-system/state/task-queue.yaml"
    $c6UnbornModuleMatrixPath = Join-Path $c6UnbornModuleRoot "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
    $c6UnbornModuleRoute = "src/app/api/v1/employee-import-commands/[other]/route.ts"
    [IO.File]::WriteAllText($c6UnbornModuleStatePath, "schemaVersion: 1`ncurrentTask:`n  id: c6-unborn-module`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($c6UnbornModuleQueuePath, "schemaVersion: 1`ntasks:`n  - id: c6-unborn-module`n    taskKind: read_only`n    allowedFiles:`n      - src/app/api/v1/employee-import-commands/[publicId]/route.ts`n    blockedFiles:`n      - src/**`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText($c6UnbornModuleMatrixPath, "moduleRunVersion: 2`nCost Calibration Gate remains blocked`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText((Join-Path $c6UnbornModuleRoot $c6UnbornModuleRoute), "export const runtime = 'nodejs';`n", [Text.UTF8Encoding]::new($false))
    & git -C $c6UnbornModuleRoot init --quiet
    if ($LASTEXITCODE -ne 0) { throw "Unable to initialize C6 unborn Module fixture." }
    & git -C $c6UnbornModuleRoot add --all
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage C6 unborn Module fixture." }
    $c6PriorErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    Push-Location $c6UnbornModuleRoot
    try {
        $c6UnbornModuleOutput = @(& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $repositoryRoot "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1") -ProjectStatePath $c6UnbornModuleStatePath -QueuePath $c6UnbornModuleQueuePath -MatrixPath $c6UnbornModuleMatrixPath -TaskId "c6-unborn-module" -ChangedFiles $c6UnbornModuleRoute 2>&1 | ForEach-Object { $_.ToString() })
        $c6UnbornModuleExitCode = $LASTEXITCODE
    } finally {
        Pop-Location
        $ErrorActionPreference = $c6PriorErrorActionPreference
    }
    $c6UnbornModuleText = $c6UnbornModuleOutput -join "`n"
    Assert-True ($c6UnbornModuleExitCode -ne 0) "C6 unborn Module pre-commit RED: explicit out-of-scope path unexpectedly passed."
    Assert-True ($c6UnbornModuleText -notmatch "fatal:.*HEAD|ambiguous argument 'HEAD'") "C6 unborn Module pre-commit RED: missing HEAD escaped as a fatal diagnostic.`n$c6UnbornModuleText"
    Assert-True ($c6UnbornModuleText -match 'HARD_BLOCK_(?:OUT_OF_SCOPE|BLOCKED_FILE) src/app/api/v1/employee-import-commands/\[other\]/route.ts') "C6 unborn Module pre-commit RED: explicit ChangedFiles scope hard-block was masked.`n$c6UnbornModuleText"
    Assert-True ($c6UnbornModuleText -notmatch 'p1ApprovedSameTaskTransitionMode:\s*transition_only') "C6 unborn Module pre-commit RED: missing HEAD became transition authorization."
} finally {
    if (Test-Path -LiteralPath $c6UnbornModuleRoot) { Remove-Fixture -Root $c6UnbornModuleRoot }
}
Assert-True (-not $c6P1FullSmokeText.Contains('$isolatedAuditOutput = @(& $guardPath -RepositoryRoot $repositoryRoot -Phase manual)')) "C6 Git-index isolation RED: the manual fixture still audits the dirty source worktree."
$c6GitIndexIsolationBlock = [regex]::Match($c6P1FullSmokeText, '(?ms)^    # C6-FIXTURE-HERMETICITY-BEGIN\r?\n.*?^    # C6-FIXTURE-HERMETICITY-END\r?$').Value
Assert-True (-not [string]::IsNullOrWhiteSpace($c6GitIndexIsolationBlock)) "C6 committed-baseline runtime RED: the hermetic fixture block is missing."
Assert-True (-not $c6GitIndexIsolationBlock.Contains('$transitionRemote')) "C6 committed-baseline runtime RED: the manual fixture still clones the minimal transition remote."
foreach ($c6GitIndexIsolationMarker in @(
        '$isolatedManualAuditRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6m-" + [guid]::NewGuid().ToString("N"))',
        '$foreignIndexRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6i-" + [guid]::NewGuid().ToString("N"))',
        '$committedBaselineSha = "61303d935e58e65103563fcb0fa865d7bfb6cf3e"',
        '& git -c core.longpaths=true -c core.fsmonitor=false -c maintenance.auto=false -c gc.auto=0 clone --quiet --no-local --no-checkout $repositoryRoot $isolatedManualAuditRoot',
        '$isolatedAlternatesPath = Join-Path $isolatedManualAuditRoot ".git/objects/info/alternates"',
        '& git -C $isolatedManualAuditRoot config maintenance.auto false',
        '& git -C $isolatedManualAuditRoot config gc.auto 0',
        '& git -C $isolatedManualAuditRoot config core.fsmonitor false',
        '& git -C $isolatedManualAuditRoot -c core.longpaths=true -c core.fsmonitor=false checkout --quiet --detach $committedBaselineSha',
        '$foreignIndexPath = ((& git -C $foreignIndexRoot rev-parse --git-path index) -join "").Trim()',
        '-RepositoryRoot $isolatedManualAuditRoot',
        '-ProjectStatePath "docs/04-agent-system/state/project-state.yaml"',
        '-QueuePath "docs/04-agent-system/state/task-queue.yaml"',
        'p1TransitionScopeMode: standard'
    )) {
    Assert-True $c6P1FullSmokeText.Contains($c6GitIndexIsolationMarker) "C6 Git-index isolation RED: missing hermetic fixture marker $c6GitIndexIsolationMarker"
}
Assert-True (-not $c6GitIndexIsolationBlock.Contains('Join-Path $smokeRoot "cross-repository-')) "C6 cleanup RED: the complete clone is still nested under the long outer smoke root."
Assert-True $c6GitIndexIsolationBlock.Contains('Remove-C6ShortTempRoot -Root $isolatedFixtureRoot') "C6 cleanup RED: the inner finally does not clean both short sibling roots."

$c6CleanupTokens = $null
$c6CleanupParseErrors = $null
$c6CleanupAst = [System.Management.Automation.Language.Parser]::ParseInput($c6P1FullSmokeText, [ref]$c6CleanupTokens, [ref]$c6CleanupParseErrors)
Assert-True ($c6CleanupParseErrors.Count -eq 0) "C6 cleanup RED: the full smoke source does not parse."
$c6CleanupFunctions = @($c6CleanupAst.FindAll({
            param($node)
            $node -is [System.Management.Automation.Language.FunctionDefinitionAst] -and $node.Name -ceq "Remove-C6ShortTempRoot"
        }, $true))
Assert-True ($c6CleanupFunctions.Count -eq 1) "C6 cleanup RED: the dedicated short-temp cleanup helper is missing or duplicated."
. ([scriptblock]::Create($c6CleanupFunctions[0].Extent.Text))
$c6CleanupSafeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6m-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path (Join-Path $c6CleanupSafeRoot "child") -Force | Out-Null
Set-Content -LiteralPath (Join-Path $c6CleanupSafeRoot "child\fixture.txt") -Value "cleanup" -Encoding UTF8
Remove-C6ShortTempRoot -Root $c6CleanupSafeRoot
Assert-True (-not (Test-Path -LiteralPath $c6CleanupSafeRoot)) "C6 cleanup RED: the allowed short sibling root survived cleanup."
$c6UnsafeCleanupFailed = $false
try {
    Remove-C6ShortTempRoot -Root (Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-c6x-" + [guid]::NewGuid().ToString("N")))
} catch {
    $c6UnsafeCleanupFailed = $true
    Assert-True ($_.Exception.Message -match "P1_C6_TEMP_CLEANUP_BOUNDARY_INVALID") "C6 cleanup RED: unsafe-path rejection did not emit the stable boundary finding."
}
Assert-True $c6UnsafeCleanupFailed "C6 cleanup RED: a root outside the fixed short-prefix allowlist was accepted."

$c6EmptyNameStatusCases = @(
    @{ Name = "p1-pre-commit"; Phase = "pre_commit"; BaseReference = "HEAD"; CandidateReference = ":" },
    @{ Name = "p1-pre-push"; Phase = "pre_push"; BaseReference = "origin/master"; CandidateReference = "HEAD" },
    @{ Name = "module-pre-commit"; Phase = "pre_commit"; BaseReference = "HEAD"; CandidateReference = ":" },
    @{ Name = "module-pre-push"; Phase = "pre_push"; BaseReference = "origin/master"; CandidateReference = "HEAD" }
)
foreach ($c6EmptyNameStatusCase in $c6EmptyNameStatusCases) {
    [object[]]$c6EmptyNameStatusRecords = @()
    $c6EmptyNameStatusInputs = Get-P1ApprovedSameTaskTransitionStageInputs `
        -RepositoryRoot $repositoryRoot `
        -Phase $c6EmptyNameStatusCase.Phase `
        -NameStatusRecords $c6EmptyNameStatusRecords `
        -BaseReference $c6EmptyNameStatusCase.BaseReference `
        -CandidateReference $c6EmptyNameStatusCase.CandidateReference `
        -Branch "codex/p1-mechanism-execution-compatibility-v2-1"
    Assert-True (-not $c6EmptyNameStatusInputs.Requested `
            -and [string]::IsNullOrEmpty([string]$c6EmptyNameStatusInputs.ContractText) `
            -and [string]::IsNullOrEmpty([string]$c6EmptyNameStatusInputs.SourcePath) `
            -and $c6EmptyNameStatusInputs.Facts.Count -eq 0) "C6 empty name-status RED: $($c6EmptyNameStatusCase.Name) did not remain Requested=false standard mode."
}

function Copy-C5EvidenceFacts {
    param([Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts)
    $copy = [ordered]@{}
    foreach ($key in $Facts.Keys) {
        $value = $Facts[$key]
        if ($value -is [System.Collections.IDictionary]) {
            $dictionaryCopy = [ordered]@{}
            foreach ($dictionaryKey in $value.Keys) { $dictionaryCopy[$dictionaryKey] = $value[$dictionaryKey] }
            $copy[$key] = $dictionaryCopy
        } elseif ($value -is [array]) {
            $copy[$key] = @($value)
        } else {
            $copy[$key] = $value
        }
    }
    return $copy
}

function Set-C5EvidenceValue {
    param([Parameter(Mandatory = $true)][string]$Text, [Parameter(Mandatory = $true)][string]$Key, [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Value)
    $pattern = "(?m)^$([regex]::Escape($Key))=.*$"
    if ([regex]::Matches($Text, $pattern).Count -ne 1) { throw "C5 fixture key is not unique: $Key" }
    return [regex]::Replace($Text, $pattern, "$Key=$Value")
}

function Add-C5EvidenceLine {
    param([Parameter(Mandatory = $true)][string]$Text, [Parameter(Mandatory = $true)][string]$Line)
    $closingFence = "`n$c2Fence"
    $index = $Text.LastIndexOf($closingFence, [StringComparison]::Ordinal)
    if ($index -lt 0) { throw "C5 fixture closing fence is missing." }
    return $Text.Substring(0, $index) + "`n$Line" + $Text.Substring($index)
}

function New-C5EvidenceFixture {
    $evidencePath = "docs/05-execution-logs/evidence/synthetic-c5-evidence.md"
    $planPath = "docs/05-execution-logs/task-plans/synthetic-c5-plan.md"
    $command = "powershell.exe -NoProfile -File synthetic-c5.ps1 -Profile focused"
    $emptySha = "0000000000000000000000000000000000000000000000000000000000000000"
    $evidenceText = @(
        "# Synthetic C5 Review Input",
        "",
        "${c2Fence}tiku-transition-evidence-v1",
        "schemaVersion=1",
        "recordType=transition_evidence",
        "taskId=p1-c5-synthetic-task",
        "transitionId=p1-c5-synthetic-transition-001",
        "authorizationId=p1-c5-synthetic-authorization",
        "authorizationSource=docs/05-execution-logs/acceptance/synthetic-c5.md",
        "baseSha=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
        "candidateIdentityType=normalized_tree_hash",
        "candidateIdentity=$emptySha",
        "branch=codex/p1-c5-synthetic",
        "stateFromSha256=1111111111111111111111111111111111111111111111111111111111111111",
        "stateToSha256=2222222222222222222222222222222222222222222222222222222222222222",
        "queueFromSha256=3333333333333333333333333333333333333333333333333333333333333333",
        "queueToSha256=4444444444444444444444444444444444444444444444444444444444444444",
        "reviewDecision=APPROVE",
        "validationProfile=focused",
        "freshnessKey=$emptySha",
        "commandCount=1",
        "positiveCount=1",
        "negativeCount=1",
        "validatorSha256=5555555555555555555555555555555555555555555555555555555555555555",
        "p1AdapterSha256=6666666666666666666666666666666666666666666666666666666666666666",
        "preCommitAdapterSha256=7777777777777777777777777777777777777777777777777777777777777777",
        "prePushAdapterSha256=8888888888888888888888888888888888888888888888888888888888888888",
        "fixtureSha256=9999999999999999999999999999999999999999999999999999999999999999",
        "fileCount=2",
        "command.001.name=$command",
        "command.001.exitCode=0",
        "command.001.durationMs=100",
        "file.001.path=$evidencePath",
        "file.001.status=M",
        "file.002.path=$planPath",
        "file.002.status=M",
        $c2Fence,
        "",
        "Synthetic review text only; the repository audit is not modified to APPROVE."
    ) -join "`n"
    $planText = "synthetic C5 plan input`n"
    $facts = [ordered]@{
        NameStatusRecords = @("M`t$evidencePath", "M`t$planPath")
        CandidateFileSha256ByPath = [ordered]@{
            $evidencePath = Get-P1AstSha256Text $evidenceText
            $planPath = Get-P1AstSha256Text $planText
        }
        CandidateFileTextByPath = [ordered]@{ $evidencePath = $evidenceText; $planPath = $planText }
        MachineEvidenceSourcePath = $evidencePath
        TaskId = "p1-c5-synthetic-task"
        TransitionId = "p1-c5-synthetic-transition-001"
        AuthorizationId = "p1-c5-synthetic-authorization"
        AuthorizationSource = "docs/05-execution-logs/acceptance/synthetic-c5.md"
        BaseSha = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
        CandidateIdentityType = "normalized_tree_hash"
        Branch = "codex/p1-c5-synthetic"
        SchemaVersion = "1"
        StateFromSha256 = "1111111111111111111111111111111111111111111111111111111111111111"
        QueueFromSha256 = "3333333333333333333333333333333333333333333333333333333333333333"
        ReviewDecision = "APPROVE"
        ReviewInputKind = "synthetic"
        ValidationProfile = "focused"
        CommonSha256 = "5555555555555555555555555555555555555555555555555555555555555555"
        P1AdapterSha256 = "6666666666666666666666666666666666666666666666666666666666666666"
        PreCommitAdapterSha256 = "7777777777777777777777777777777777777777777777777777777777777777"
        PrePushAdapterSha256 = "8888888888888888888888888888888888888888888888888888888888888888"
        FixtureSha256 = "9999999999999999999999999999999999999999999999999999999999999999"
        StateProjectionSha256 = "2222222222222222222222222222222222222222222222222222222222222222"
        QueueProjectionSha256 = "4444444444444444444444444444444444444444444444444444444444444444"
    }
    $candidateIdentity = Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $facts
    $evidenceText = Set-C5EvidenceValue $evidenceText "candidateIdentity" $candidateIdentity
    $facts.CandidateFileTextByPath[$evidencePath] = $evidenceText
    $freshnessKey = Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $facts -Profile "focused" -Command $command
    $evidenceText = Set-C5EvidenceValue $evidenceText "freshnessKey" $freshnessKey
    $facts.CandidateFileTextByPath[$evidencePath] = $evidenceText
    return [pscustomobject]@{ Text = $evidenceText; SourcePath = $evidencePath; Command = $command; Facts = $facts; CandidateIdentity = $candidateIdentity; FreshnessKey = $freshnessKey }
}

function Update-C5EvidenceFixtureBinding {
    param(
        [Parameter(Mandatory = $true)][string]$Text,
        [Parameter(Mandatory = $true)][System.Collections.IDictionary]$Facts,
        [Parameter(Mandatory = $true)][string]$SourcePath,
        [Parameter(Mandatory = $true)][string]$Command
    )
    $Facts.CandidateFileTextByPath[$SourcePath] = $Text
    $candidateIdentity = Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $Facts
    $Text = Set-C5EvidenceValue $Text "candidateIdentity" $candidateIdentity
    $Facts.CandidateFileTextByPath[$SourcePath] = $Text
    $freshnessKey = Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $Facts -Profile ([string]$Facts.ValidationProfile) -Command $Command
    $Text = Set-C5EvidenceValue $Text "freshnessKey" $freshnessKey
    $Facts.CandidateFileTextByPath[$SourcePath] = $Text
    return [pscustomobject]@{ Text = $Text; Facts = $Facts; CandidateIdentity = $candidateIdentity; FreshnessKey = $freshnessKey }
}

$c5Fixture = New-C5EvidenceFixture
$c5PositiveEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5Fixture.Facts -Command $c5Fixture.Command
Assert-True ($c5PositiveEvidence.Recognized -and $c5PositiveEvidence.ParserValid -and $c5PositiveEvidence.Valid) "C5 machine evidence exact positive RED: strict machine evidence is not accepted. $(@($c5PositiveEvidence.FindingCodes) -join ',')"

$c5ReviewMismatchFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5ReviewMismatchFacts.ReviewDecision = "PENDING"
$c5ReviewMismatchEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5ReviewMismatchFacts -Command $c5Fixture.Command
Assert-True (-not $c5ReviewMismatchEvidence.Valid -and @($c5ReviewMismatchEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_REVIEW_PENDING") "C5 review fact binding RED: an APPROVE machine block overrode external PENDING review truth."
foreach ($c5MissingReviewFact in @("ReviewDecision", "ReviewInputKind")) {
    $c5MissingReviewFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5MissingReviewFacts.Remove($c5MissingReviewFact)
    $c5MissingReviewEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5MissingReviewFacts -Command $c5Fixture.Command
    Assert-True (-not $c5MissingReviewEvidence.Valid -and @($c5MissingReviewEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_CONTEXT_INVALID") "C5 review fact binding RED: missing $c5MissingReviewFact did not fail closed."
}
$c5ForgedReviewKindFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5ForgedReviewKindFacts.Remove("ReviewInputKind")
$c5ForgedReviewKindText = Add-C5EvidenceLine $c5Fixture.Text "reviewInputKind=synthetic"
$c5ForgedReviewKindEvidence = Read-P1TransitionMachineEvidence -Text $c5ForgedReviewKindText -SourcePath $c5Fixture.SourcePath -Facts $c5ForgedReviewKindFacts -Command $c5Fixture.Command
Assert-True (-not $c5ForgedReviewKindEvidence.Valid -and @($c5ForgedReviewKindEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_FIELD_INVALID") "C5 review fact binding RED: a machine-block string forged the missing external synthetic review kind."
$c5PendingFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5PendingFacts.ReviewDecision = "PENDING"
$c5PendingFacts.ReviewInputKind = "production"
$c5PendingFixture = Update-C5EvidenceFixtureBinding -Text (Set-C5EvidenceValue $c5Fixture.Text "reviewDecision" "PENDING") -Facts $c5PendingFacts -SourcePath $c5Fixture.SourcePath -Command $c5Fixture.Command
$c5PendingEvidence = Read-P1TransitionMachineEvidence -Text $c5PendingFixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5PendingFixture.Facts -Command $c5Fixture.Command
Assert-True (-not $c5PendingEvidence.Valid -and @($c5PendingEvidence.FindingCodes).Count -eq 1 -and @($c5PendingEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_REVIEW_PENDING") "C5 production review boundary RED: matching real PENDING facts did not preserve review-pending as the only finding. Actual: $(@($c5PendingEvidence.FindingCodes) -join ',')"

$c5ContextBindings = @(
    @{ Evidence = "schemaVersion"; Fact = "SchemaVersion"; Wrong = "2" },
    @{ Evidence = "taskId"; Fact = "TaskId"; Wrong = "p1-c5-wrong-task" },
    @{ Evidence = "transitionId"; Fact = "TransitionId"; Wrong = "p1-c5-wrong-transition" },
    @{ Evidence = "authorizationId"; Fact = "AuthorizationId"; Wrong = "p1-c5-wrong-authorization" },
    @{ Evidence = "authorizationSource"; Fact = "AuthorizationSource"; Wrong = "docs/05-execution-logs/acceptance/wrong-c5.md" },
    @{ Evidence = "baseSha"; Fact = "BaseSha"; Wrong = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" },
    @{ Evidence = "candidateIdentityType"; Fact = "CandidateIdentityType"; Wrong = "commit_sha" },
    @{ Evidence = "branch"; Fact = "Branch"; Wrong = "codex/p1-c5-wrong" },
    @{ Evidence = "stateFromSha256"; Fact = "StateFromSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "stateToSha256"; Fact = "StateProjectionSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "queueFromSha256"; Fact = "QueueFromSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "queueToSha256"; Fact = "QueueProjectionSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "validationProfile"; Fact = "ValidationProfile"; Wrong = "full" },
    @{ Evidence = "validatorSha256"; Fact = "CommonSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "p1AdapterSha256"; Fact = "P1AdapterSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "preCommitAdapterSha256"; Fact = "PreCommitAdapterSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "prePushAdapterSha256"; Fact = "PrePushAdapterSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    @{ Evidence = "fixtureSha256"; Fact = "FixtureSha256"; Wrong = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
)
foreach ($c5ContextBinding in $c5ContextBindings) {
    $c5WrongContextFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5WrongContextFacts[$c5ContextBinding.Fact] = $c5ContextBinding.Wrong
    $c5WrongContextEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5WrongContextFacts -Command $c5Fixture.Command
    Assert-True (-not $c5WrongContextEvidence.Valid -and @($c5WrongContextEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_CONTEXT_INVALID") "C5 exact context binding RED: wrong $($c5ContextBinding.Fact) did not fail closed. Actual: $(@($c5WrongContextEvidence.FindingCodes) -join ',')"

    $c5MissingContextFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5MissingContextFacts.Remove($c5ContextBinding.Fact)
    $c5MissingContextEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5MissingContextFacts -Command $c5Fixture.Command
    Assert-True (-not $c5MissingContextEvidence.Valid -and @($c5MissingContextEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_CONTEXT_INVALID") "C5 exact context binding RED: missing $($c5ContextBinding.Fact) did not fail closed."

    $c5TypedContextFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5TypedContextFacts[$c5ContextBinding.Fact] = 1
    $c5TypedContextEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5TypedContextFacts -Command $c5Fixture.Command
    Assert-True (-not $c5TypedContextEvidence.Valid -and @($c5TypedContextEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_CONTEXT_INVALID") "C5 exact context binding RED: non-string $($c5ContextBinding.Fact) did not fail closed."
}

$c5FileBindingCases = @(
    @{ Name = "machine-missing"; MutateText = {
            param($text)
            $text = [regex]::Replace($text, '(?m)^file\.002\.(?:path|status)=.*\n?', '')
            Set-C5EvidenceValue $text "fileCount" "1"
        } },
    @{ Name = "machine-extra"; MutateText = {
            param($text)
            $text = Set-C5EvidenceValue $text "fileCount" "3"
            $text = Add-C5EvidenceLine $text "file.003.path=docs/zz-synthetic-c5-extra.md"
            Add-C5EvidenceLine $text "file.003.status=M"
        } },
    @{ Name = "machine-case-variant"; MutateText = {
            param($text)
            $text.Replace("file.001.path=docs/", "file.001.path=Docs/")
        } },
    @{ Name = "machine-status"; MutateText = {
            param($text)
            Set-C5EvidenceValue $text "file.002.status" "A"
        } }
)
foreach ($c5FileBindingCase in $c5FileBindingCases) {
    $c5FileBindingFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5FileBindingFixture = Update-C5EvidenceFixtureBinding -Text (& $c5FileBindingCase.MutateText $c5Fixture.Text) -Facts $c5FileBindingFacts -SourcePath $c5Fixture.SourcePath -Command $c5Fixture.Command
    $c5FileBindingEvidence = Read-P1TransitionMachineEvidence -Text $c5FileBindingFixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5FileBindingFixture.Facts -Command $c5Fixture.Command
    Assert-True (-not $c5FileBindingEvidence.Valid -and @($c5FileBindingEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_FILE_SET_INVALID") "C5 exact file binding RED: $($c5FileBindingCase.Name) was accepted. Actual: $(@($c5FileBindingEvidence.FindingCodes) -join ',')"
}
$c5FactFileBindingCases = @(
    @{ Name = "facts-missing"; Records = @("M`tdocs/05-execution-logs/evidence/synthetic-c5-evidence.md") },
    @{ Name = "facts-extra"; Records = @("M`tdocs/05-execution-logs/evidence/synthetic-c5-evidence.md", "M`tdocs/05-execution-logs/task-plans/synthetic-c5-plan.md", "M`tdocs/zz-synthetic-c5-extra.md") },
    @{ Name = "facts-reordered"; Records = @("M`tdocs/05-execution-logs/task-plans/synthetic-c5-plan.md", "M`tdocs/05-execution-logs/evidence/synthetic-c5-evidence.md") },
    @{ Name = "facts-case-variant"; Records = @("M`tDocs/05-execution-logs/evidence/synthetic-c5-evidence.md", "M`tdocs/05-execution-logs/task-plans/synthetic-c5-plan.md") },
    @{ Name = "facts-status"; Records = @("M`tdocs/05-execution-logs/evidence/synthetic-c5-evidence.md", "A`tdocs/05-execution-logs/task-plans/synthetic-c5-plan.md") }
)
foreach ($c5FactFileBindingCase in $c5FactFileBindingCases) {
    $c5FactFileBindingFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5FactFileBindingFacts.NameStatusRecords = @($c5FactFileBindingCase.Records)
    $c5FactFileBindingFixture = Update-C5EvidenceFixtureBinding -Text $c5Fixture.Text -Facts $c5FactFileBindingFacts -SourcePath $c5Fixture.SourcePath -Command $c5Fixture.Command
    $c5FactFileBindingEvidence = Read-P1TransitionMachineEvidence -Text $c5FactFileBindingFixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5FactFileBindingFixture.Facts -Command $c5Fixture.Command
    Assert-True (-not $c5FactFileBindingEvidence.Valid -and @($c5FactFileBindingEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_FILE_SET_INVALID") "C5 exact file binding RED: $($c5FactFileBindingCase.Name) was accepted. Actual: $(@($c5FactFileBindingEvidence.FindingCodes) -join ',')"
}
$c5MissingFileFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5MissingFileFacts.Remove("NameStatusRecords")
$c5MissingFileEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5MissingFileFacts -Command $c5Fixture.Command
Assert-True (-not $c5MissingFileEvidence.Valid -and @($c5MissingFileEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_FILE_SET_INVALID") "C5 exact file binding RED: missing NameStatusRecords did not fail closed."
$c5TypedFileFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5TypedFileFacts.NameStatusRecords = "M`tdocs/05-execution-logs/evidence/synthetic-c5-evidence.md"
$c5TypedFileEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath -Facts $c5TypedFileFacts -Command $c5Fixture.Command
Assert-True (-not $c5TypedFileEvidence.Valid -and @($c5TypedFileEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_FILE_SET_INVALID") "C5 exact file binding RED: scalar NameStatusRecords did not fail closed."

$c5EvidenceNegativeCases = @(
    @{ Name = "duplicate-exact-key"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "case-conflicting-key"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "duplicate-block"; Code = "P1_AST_EVIDENCE_BLOCK_INVALID" },
    @{ Name = "unknown-field"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "missing-field"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "type-error"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "damaged-encoding"; Code = "P1_AST_EVIDENCE_BLOCK_INVALID" },
    @{ Name = "noncontiguous-command"; Code = "P1_AST_EVIDENCE_COMMAND_SET_INVALID" },
    @{ Name = "noncontiguous-file"; Code = "P1_AST_EVIDENCE_FILE_SET_INVALID" },
    @{ Name = "command-count-mismatch"; Code = "P1_AST_EVIDENCE_COMMAND_SET_INVALID" },
    @{ Name = "file-count-mismatch"; Code = "P1_AST_EVIDENCE_FILE_SET_INVALID" },
    @{ Name = "negative-duration"; Code = "P1_AST_EVIDENCE_COMMAND_SET_INVALID" },
    @{ Name = "negative-exit"; Code = "P1_AST_EVIDENCE_COMMAND_SET_INVALID" },
    @{ Name = "negative-count"; Code = "P1_AST_EVIDENCE_FIELD_INVALID" },
    @{ Name = "review-pending"; Code = "P1_AST_EVIDENCE_REVIEW_PENDING" },
    @{ Name = "candidate-self-reference"; Code = "P1_AST_EVIDENCE_CANDIDATE_INVALID" },
    @{ Name = "freshness-self-reference"; Code = "P1_AST_EVIDENCE_FRESHNESS_INVALID" }
)
foreach ($c5EvidenceCase in $c5EvidenceNegativeCases) {
    $c5EvidenceText = $c5Fixture.Text
    switch ($c5EvidenceCase.Name) {
        "duplicate-exact-key" { $c5EvidenceText = Add-C5EvidenceLine $c5EvidenceText "taskId=p1-c5-synthetic-task"; break }
        "case-conflicting-key" { $c5EvidenceText = Add-C5EvidenceLine $c5EvidenceText "TaskId=p1-c5-synthetic-task"; break }
        "duplicate-block" { $c5EvidenceText = $c5EvidenceText + "`n" + $c5Fixture.Text; break }
        "unknown-field" { $c5EvidenceText = Add-C5EvidenceLine $c5EvidenceText "unknownField=blocked"; break }
        "missing-field" { $c5EvidenceText = [regex]::Replace($c5EvidenceText, '(?m)^authorizationId=.*\n', ''); break }
        "type-error" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "commandCount" "one"; break }
        "damaged-encoding" { $c5EvidenceText = ([string][char]0xFEFF) + $c5EvidenceText; break }
        "noncontiguous-command" { $c5EvidenceText = $c5EvidenceText.Replace("command.001.name=", "command.002.name="); break }
        "noncontiguous-file" { $c5EvidenceText = $c5EvidenceText.Replace("file.002.path=", "file.003.path=").Replace("file.002.status=", "file.003.status="); break }
        "command-count-mismatch" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "commandCount" "2"; break }
        "file-count-mismatch" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "fileCount" "3"; break }
        "negative-duration" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "command.001.durationMs" "-1"; break }
        "negative-exit" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "command.001.exitCode" "-1"; break }
        "negative-count" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "negativeCount" "-1"; break }
        "review-pending" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "reviewDecision" "PENDING"; break }
        "candidate-self-reference" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "candidateIdentity" "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"; break }
        "freshness-self-reference" { $c5EvidenceText = Set-C5EvidenceValue $c5EvidenceText "freshnessKey" "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; break }
    }
    $c5EvidenceResult = Read-P1TransitionMachineEvidence -Text $c5EvidenceText -SourcePath $c5Fixture.SourcePath -Facts $c5Fixture.Facts -Command $c5Fixture.Command
    Assert-True ($c5EvidenceResult.Recognized -and -not $c5EvidenceResult.Valid -and @($c5EvidenceResult.FindingCodes) -ccontains $c5EvidenceCase.Code) "C5 machine evidence negative '$($c5EvidenceCase.Name)' missed $($c5EvidenceCase.Code). Actual: $(@($c5EvidenceResult.FindingCodes) -join ',')"
}

$c5MissingFactsEvidence = Read-P1TransitionMachineEvidence -Text $c5Fixture.Text -SourcePath $c5Fixture.SourcePath
Assert-True (-not $c5MissingFactsEvidence.Valid -and @($c5MissingFactsEvidence.FindingCodes) -ccontains "P1_AST_EVIDENCE_CONTEXT_INVALID") "C5 machine evidence accepted without candidate/freshness facts."
$c5SelfFieldFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5SelfFieldFacts.CandidateFileTextByPath[$c5Fixture.SourcePath] = (Set-C5EvidenceValue (Set-C5EvidenceValue $c5Fixture.Text "candidateIdentity" "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb") "freshnessKey" "cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc")
Assert-True ((Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c5SelfFieldFacts) -ceq $c5Fixture.CandidateIdentity) "C5 normalized candidate identity did not clear candidateIdentity/freshnessKey self-fields."
$c5ChangedContentFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
$c5ChangedContentFacts.CandidateFileTextByPath["docs/05-execution-logs/task-plans/synthetic-c5-plan.md"] = "changed synthetic C5 plan input`n"
Assert-True ((Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c5ChangedContentFacts) -cne $c5Fixture.CandidateIdentity) "C5 normalized candidate identity ignored affected file content."
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c5Fixture.Facts -Profile "focused" -Command $c5Fixture.Command) -ceq $c5Fixture.FreshnessKey) "C5 identical freshness inputs did not produce the same key."
foreach ($c5FreshnessField in @("BaseSha", "SchemaVersion", "CommonSha256", "P1AdapterSha256", "PreCommitAdapterSha256", "PrePushAdapterSha256", "FixtureSha256", "StateProjectionSha256", "QueueProjectionSha256")) {
    $c5ChangedFreshnessFacts = Copy-C5EvidenceFacts $c5Fixture.Facts
    $c5ChangedFreshnessFacts[$c5FreshnessField] = if ($c5FreshnessField -ceq "BaseSha") { "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb" } elseif ($c5FreshnessField -ceq "SchemaVersion") { "2" } else { "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
    Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c5ChangedFreshnessFacts -Profile "focused" -Command $c5Fixture.Command) -cne $c5Fixture.FreshnessKey) "C5 freshness key ignored affected input $c5FreshnessField."
}
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c5ChangedContentFacts -Profile "focused" -Command $c5Fixture.Command) -cne $c5Fixture.FreshnessKey) "C5 freshness key ignored normalized candidate content."
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c5Fixture.Facts -Profile "full" -Command $c5Fixture.Command) -cne $c5Fixture.FreshnessKey) "C5 freshness key ignored validation profile."
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c5Fixture.Facts -Profile "focused" -Command ($c5Fixture.Command + " -Changed")) -cne $c5Fixture.FreshnessKey) "C5 freshness key ignored exact command."

Assert-True ($null -ne (Get-Command Select-P1ApprovedSameTaskTransitionValidationProfile -CommandType Function -ErrorAction SilentlyContinue)) "C5 profile selector RED: Select-P1ApprovedSameTaskTransitionValidationProfile is absent."
$c5BehaviorFiles = @("scripts/agent-system/P1ApprovedSameTaskTransition.Common.ps1", "scripts/agent-system/Test-P1ApprovedSameTaskTransition.Smoke.ps1")
Assert-True ((Select-P1ApprovedSameTaskTransitionValidationProfile -ChangedFiles $c5BehaviorFiles -CodeFrozen $false) -ceq "focused") "C5 profile selector did not choose focused for the behavior development loop."
Assert-True ((Select-P1ApprovedSameTaskTransitionValidationProfile -ChangedFiles $c5BehaviorFiles -CodeFrozen $true) -ceq "full") "C5 profile selector did not choose full for frozen behavior changes."
Assert-True ((Select-P1ApprovedSameTaskTransitionValidationProfile -ChangedFiles @("docs/04-agent-system/state/project-state.yaml", "docs/04-agent-system/state/task-queue.yaml", "docs/05-execution-logs/transitions/synthetic.md") -CodeFrozen $true) -ceq "contract-instance-only") "C5 profile selector did not choose contract-instance-only for an exact contract projection."
Assert-True ((Select-P1ApprovedSameTaskTransitionValidationProfile -ChangedFiles @("docs/04-agent-system/operating-manual.md", "docs/05-execution-logs/evidence/synthetic.md") -CodeFrozen $true) -ceq "docs-only") "C5 profile selector did not choose docs-only for governance prose/evidence changes."

$c5SchemaText = Get-Content -LiteralPath $c3SchemaPath -Raw -Encoding UTF8
$c5SopText = Get-Content -LiteralPath $c3SopPath -Raw -Encoding UTF8
$c5OperatingManualText = Get-Content -LiteralPath (Join-Path $repositoryRoot "docs/04-agent-system/operating-manual.md") -Raw -Encoding UTF8
$c5MechanismIndexText = Get-Content -LiteralPath (Join-Path $repositoryRoot "docs/04-agent-system/state/mechanism-source-of-truth-index.yaml") -Raw -Encoding UTF8
foreach ($c5SchemaMarker in @("tiku-transition-evidence-v1", "machineDecisionMustMatchExternalFact: true", "trustedContextBindings:", "exactTrustedCountOrderPathAndStatus: true", "candidateIdentityNormalization: clear_machine_self_fields", "freshnessFieldOrder:", "validationProfiles:", "P1_AST_EVIDENCE_FRESHNESS_INVALID")) {
    Assert-True $c5SchemaText.Contains($c5SchemaMarker) "C5 schema RED: missing $c5SchemaMarker"
}
foreach ($c5SopMarker in @("## Machine evidence", "ReviewInputKind=production", 'trusted `NameStatusRecords`', "## Validation profiles", "## P1 Mechanism Efficiency Observation", "mechanismOverheadMs=", "three-task observation entry")) {
    Assert-True $c5SopText.Contains($c5SopMarker) "C5 SOP RED: missing $c5SopMarker"
}
foreach ($c5ManualMarker in @("Approved same-task transition profiles", "contract-instance-only", "docs-only", "P1 Mechanism Efficiency Observation")) {
    Assert-True $c5OperatingManualText.Contains($c5ManualMarker) "C5 operating manual RED: missing $c5ManualMarker"
}
foreach ($c5IndexMarker in @("p1-approved-same-task-transition-schema-v1", "p1-approved-same-task-transition-sop", "normalized candidate identity and freshness")) {
    Assert-True $c5MechanismIndexText.Contains($c5IndexMarker) "C5 mechanism index RED: missing $c5IndexMarker"
}

$c4WideRouteRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-ast-wide-route-" + [guid]::NewGuid().ToString("N"))
try {
    [void](New-Item -ItemType Directory -Path (Join-Path $c4WideRouteRoot "docs/04-agent-system/state") -Force)
    [void](New-Item -ItemType Directory -Path (Join-Path $c4WideRouteRoot "docs/governance") -Force)
    [IO.File]::WriteAllText((Join-Path $c4WideRouteRoot "docs/04-agent-system/state/project-state.yaml"), "p1RemediationSerialProgram:`n  currentTaskId: parent-task`n", [Text.UTF8Encoding]::new($false))
    [IO.File]::WriteAllText((Join-Path $c4WideRouteRoot "docs/04-agent-system/state/task-queue.yaml"), "p1RemediationSerialProgram:`n  currentTaskId: parent-task`n", [Text.UTF8Encoding]::new($false))
    & git -C $c4WideRouteRoot init --quiet
    & git -C $c4WideRouteRoot config user.email "p1-ast-smoke@example.invalid"
    & git -C $c4WideRouteRoot config user.name "P1 AST Smoke"
    & git -C $c4WideRouteRoot add --all
    & git -C $c4WideRouteRoot commit --quiet -m "base"
    [IO.File]::WriteAllText((Join-Path $c4WideRouteRoot "docs/governance/marker.md"), "transitionType=approved_same_task_transition`n", [Text.UTF8Encoding]::new($false))
    $c4Utf8Text = ([string][char]0x9898) + ([string][char]0x5E93) + "-" + [char]::ConvertFromUtf32(0x1F4DA) + "`n"
    $c4Utf8Path = "docs/governance/utf8-roundtrip.md"
    [IO.File]::WriteAllText((Join-Path $c4WideRouteRoot $c4Utf8Path), $c4Utf8Text, [Text.UTF8Encoding]::new($false))
    & git -C $c4WideRouteRoot add --all
    $c4Utf8Loaded = Get-P1AstGitText -RepositoryRoot $c4WideRouteRoot -Reference ":" -Path $c4Utf8Path
    Assert-True ($c4Utf8Loaded -ceq $c4Utf8Text) "C4 redirected Git stdout did not preserve exact non-ASCII UTF-8 text."
    Assert-True ((Get-P1AstSha256Text $c4Utf8Loaded) -ceq (Get-P1AstSha256Text $c4Utf8Text)) "C4 redirected Git stdout changed the non-ASCII fixture hash."
    $c4WideRouteRecords = @(& git -C $c4WideRouteRoot diff --cached --name-status --no-renames HEAD)
    $c4WideRouteInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4WideRouteRoot -Phase pre_commit -NameStatusRecords $c4WideRouteRecords -BaseReference HEAD -CandidateReference ":" -Branch "codex/wide-route"
    Assert-True $c4WideRouteInputs.Requested "C4 wide recognition RED: a reserved marker outside /transitions and state/queue fell back instead of entering the strict route."
    $c4DeleteRouteInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4WideRouteRoot -Phase pre_commit -NameStatusRecords @("D`tdocs/05-execution-logs/transitions/deleted.md") -BaseReference HEAD -CandidateReference ":" -Branch "codex/wide-route"
    Assert-True $c4DeleteRouteInputs.Requested "C4 wide recognition RED: a deleted reserved transition path fell back instead of entering the strict route."
    $c4RenameRouteInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4WideRouteRoot -Phase pre_commit -NameStatusRecords @("R100`tdocs/05-execution-logs/transitions/renamed.md`tdocs/governance/renamed.txt") -BaseReference HEAD -CandidateReference ":" -Branch "codex/wide-route"
    Assert-True $c4RenameRouteInputs.Requested "C4 wide recognition RED: a raw rename containing a reserved transition path fell back instead of entering the strict route."
} finally {
    if (Test-Path -LiteralPath $c4WideRouteRoot) { Remove-Item -LiteralPath $c4WideRouteRoot -Recurse -Force }
}
$c4AutomaticPositiveRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-ast-auto-positive-" + [guid]::NewGuid().ToString("N"))
try {
    foreach ($relativeDirectory in @("docs/04-agent-system/state", "docs/05-execution-logs/acceptance", "docs/05-execution-logs/transitions")) {
        [void](New-Item -ItemType Directory -Path (Join-Path $c4AutomaticPositiveRoot $relativeDirectory) -Force)
    }
    $c4AutoTransitionId = "p1-ast-auto-transition-001"
    $c4AutoParentTaskId = "p1-auto-parent"
    $c4AutoTaskId = "p1-auto-child"
    $c4AutoContractPath = "docs/05-execution-logs/transitions/$c4AutoTransitionId.md"
    $c4AutoReplayContractPath = "docs/05-execution-logs/transitions/replayed/$c4AutoTransitionId.md"
    $c4AutoAuthorizationPath = "docs/05-execution-logs/acceptance/p1-ast-auto-authorization.md"
    $c4AutoStandingPath = "docs/05-execution-logs/acceptance/p1-ast-standing-authorization.md"
    $c4AutoStatePath = "docs/04-agent-system/state/project-state.yaml"
    $c4AutoQueuePath = "docs/04-agent-system/state/task-queue.yaml"
    $c4AutoBaseState = "p1RemediationSerialProgram:`n  currentTaskId: $c4AutoParentTaskId`n  taskStatusById:`n    ${c4AutoParentTaskId}: ready_for_closeout`n"
    $c4AutoBaseQueue = @"
p1RemediationSerialProgram:
  currentTaskId: $c4AutoParentTaskId
  standingAuthorizationSource: $c4AutoStandingPath
  taskStatusById:
    ${c4AutoParentTaskId}: ready_for_closeout
activeTasks:
  - id: $c4AutoParentTaskId
    status: ready_for_closeout
    approvalSource: p1-ast-auto-authorization-001
    freshApprovalSource: $c4AutoAuthorizationPath
    allowedFiles:
      - $c4AutoStatePath
      - $c4AutoQueuePath
      - $c4AutoContractPath
      - $c4AutoReplayContractPath
    closeoutPolicy:
      localCommit:
        approved: true
"@ -replace "`r`n?", "`n"
    foreach ($c4AutoBaseFile in @(
        @{ Path = $c4AutoStatePath; Text = $c4AutoBaseState },
        @{ Path = $c4AutoQueuePath; Text = $c4AutoBaseQueue },
        @{ Path = $c4AutoAuthorizationPath; Text = "Status: approved`n" },
        @{ Path = $c4AutoStandingPath; Text = "Status: approved`n" }
    )) { [IO.File]::WriteAllText((Join-Path $c4AutomaticPositiveRoot $c4AutoBaseFile.Path), $c4AutoBaseFile.Text, [Text.UTF8Encoding]::new($false)) }
    & git -C $c4AutomaticPositiveRoot init --quiet
    & git -C $c4AutomaticPositiveRoot config core.autocrlf false
    & git -C $c4AutomaticPositiveRoot config user.email "p1-ast-smoke@example.invalid"
    & git -C $c4AutomaticPositiveRoot config user.name "P1 AST Smoke"
    & git -C $c4AutomaticPositiveRoot add --all
    & git -C $c4AutomaticPositiveRoot commit --quiet -m "base"
    & git -C $c4AutomaticPositiveRoot branch -M master
    & git -C $c4AutomaticPositiveRoot update-ref refs/remotes/origin/master HEAD
    $c4AutoBaseSha = ((& git -C $c4AutomaticPositiveRoot rev-parse HEAD) -join "").Trim()
    $c4AutoCandidateState = "p1RemediationSerialProgram:`n  currentTaskId: $c4AutoTaskId`n  taskStatusById:`n    ${c4AutoParentTaskId}: closed`n    ${c4AutoTaskId}: in_progress`ncurrentTask:`n  id: $c4AutoTaskId`n  branch: master`n"
    $c4AutoCandidateQueue = @"
p1RemediationSerialProgram:
  currentTaskId: $c4AutoTaskId
  standingAuthorizationSource: $c4AutoStandingPath
  taskStatusById:
    ${c4AutoParentTaskId}: closed
    ${c4AutoTaskId}: in_progress
activeTasks:
  - id: $c4AutoTaskId
    status: in_progress
    branch: master
    approvalSource: p1-ast-auto-authorization-001
    freshApprovalSource: $c4AutoAuthorizationPath
    allowedFiles:
      - $c4AutoStatePath
      - $c4AutoQueuePath
      - $c4AutoContractPath
      - $c4AutoReplayContractPath
    closeoutPolicy:
      localCommit:
        approved: true
"@ -replace "`r`n?", "`n"
    $c4AutoFence = ([string][char]96) * 3
    $c4AutoContract = @(
        "${c4AutoFence}tiku-approved-same-task-transition-v1", "schemaVersion=1", "transitionType=approved_same_task_transition", "transitionId=$c4AutoTransitionId",
        "taskId=$c4AutoTaskId", "parentTaskId=$c4AutoParentTaskId", "baseSha=$c4AutoBaseSha", "branch=master", "authorizationId=p1-ast-auto-authorization-001",
        "authorizationSource=$c4AutoAuthorizationPath", "standingAuthorizationSource=$c4AutoStandingPath", "statePath=$c4AutoStatePath",
        "stateFromSha256=$(Get-P1AstSha256Text $c4AutoBaseState)", "stateToSha256=$(Get-P1AstSha256Text $c4AutoCandidateState)", "queuePath=$c4AutoQueuePath",
        "queueFromSha256=$(Get-P1AstSha256Text $c4AutoBaseQueue)", "queueToSha256=$(Get-P1AstSha256Text $c4AutoCandidateQueue)", "fileCount=3", "singleParent=true", "singleCommit=true",
        "oneTime=true", "ancestorCheckpointPolicy=transition_only_exact_one_parent", "ordinaryDriftPolicy=hard_block", "standardModePolicy=hard_block",
        "databaseExecutionPolicy=blocked", "permissionExpansionPolicy=blocked", "file.001.path=$c4AutoStatePath", "file.001.status=M",
        "file.002.path=$c4AutoQueuePath", "file.002.status=M", "file.003.path=$c4AutoContractPath", "file.003.status=A", $c4AutoFence
    ) -join "`n"
    foreach ($c4AutoCandidateFile in @(
        @{ Path = $c4AutoStatePath; Text = $c4AutoCandidateState }, @{ Path = $c4AutoQueuePath; Text = $c4AutoCandidateQueue }, @{ Path = $c4AutoContractPath; Text = $c4AutoContract }
    )) { [IO.File]::WriteAllText((Join-Path $c4AutomaticPositiveRoot $c4AutoCandidateFile.Path), $c4AutoCandidateFile.Text, [Text.UTF8Encoding]::new($false)) }
    & git -C $c4AutomaticPositiveRoot add --all
    $c4AutoRecords = @(& git -C $c4AutomaticPositiveRoot diff --cached --name-status --no-renames HEAD)
    $c4AutoInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4AutomaticPositiveRoot -Phase pre_commit -NameStatusRecords $c4AutoRecords -BaseReference HEAD -CandidateReference ":" -Branch master
    Invoke-Expression $c4AdapterBodies[0]
    $c4AutoDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c4AutoInputs.ContractText -SourcePath $c4AutoInputs.SourcePath -Facts $c4AutoInputs.Facts
    Assert-True ($c4AutoInputs.Requested -and $c4AutoDecision.Recognized -and $c4AutoDecision.Valid -and $c4AutoDecision.Mode -ceq "transition_only") "C4 automatic production-stage positive did not load base-anchored facts and return transition_only: $(@($c4AutoDecision.FindingCodes) -join ',')"
    $c4AutoMasterStageInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4AutomaticPositiveRoot -Phase pre_commit -NameStatusRecords $c4AutoRecords -BaseReference HEAD -CandidateReference ":" -Branch "master-stage-check-is-separate"
    $c4AutoMasterStageDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c4AutoMasterStageInputs.ContractText -SourcePath $c4AutoMasterStageInputs.SourcePath -Facts $c4AutoMasterStageInputs.Facts
    Assert-True ($c4AutoMasterStageInputs.Facts.Branch -ceq "master") "C4 branch context did not bind the candidate task branch."
    Assert-True $c4AutoMasterStageDecision.Valid "C4 candidate task branch was not stable when the actual stage branch changed: $(@($c4AutoMasterStageDecision.FindingCodes) -join ',')"
    $c4WrongContractBranch = $c4AutoContract.Replace("branch=master", "branch=codex/wrong-contract-branch")
    $c4WrongContractBranchDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c4WrongContractBranch -SourcePath $c4AutoInputs.SourcePath -Facts $c4AutoInputs.Facts
    Assert-True (-not $c4WrongContractBranchDecision.Valid -and @($c4WrongContractBranchDecision.FindingCodes) -ccontains "P1_AST_CONTEXT_INVALID") "C4 contract branch drift did not fail closed."

    & git -C $c4AutomaticPositiveRoot commit --quiet -m "first approved same-task transition"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit the first automatic transition fixture." }
    & git -C $c4AutomaticPositiveRoot update-ref refs/remotes/origin/master HEAD
    $c4ReplayTaskId = "p1-auto-replay-child"
    $c4ReplayBaseSha = ((& git -C $c4AutomaticPositiveRoot rev-parse HEAD) -join "").Trim()
    $c4ReplayBaseState = Get-P1AstGitText -RepositoryRoot $c4AutomaticPositiveRoot -Reference HEAD -Path $c4AutoStatePath
    $c4ReplayBaseQueue = Get-P1AstGitText -RepositoryRoot $c4AutomaticPositiveRoot -Reference HEAD -Path $c4AutoQueuePath
    $c4ReplayCandidateState = "p1RemediationSerialProgram:`n  currentTaskId: $c4ReplayTaskId`n  taskStatusById:`n    ${c4AutoTaskId}: closed`n    ${c4ReplayTaskId}: in_progress`ncurrentTask:`n  id: $c4ReplayTaskId`n  branch: master`n"
    $c4ReplayCandidateQueue = @"
p1RemediationSerialProgram:
  currentTaskId: $c4ReplayTaskId
  standingAuthorizationSource: $c4AutoStandingPath
  taskStatusById:
    ${c4AutoTaskId}: closed
    ${c4ReplayTaskId}: in_progress
activeTasks:
  - id: $c4ReplayTaskId
    status: in_progress
    branch: master
"@ -replace "`r`n?", "`n"
    $c4ReplayContract = @(
        "${c4AutoFence}tiku-approved-same-task-transition-v1", "schemaVersion=1", "transitionType=approved_same_task_transition", "transitionId=$c4AutoTransitionId",
        "taskId=$c4ReplayTaskId", "parentTaskId=$c4AutoTaskId", "baseSha=$c4ReplayBaseSha", "branch=master", "authorizationId=p1-ast-auto-authorization-001",
        "authorizationSource=$c4AutoAuthorizationPath", "standingAuthorizationSource=$c4AutoStandingPath", "statePath=$c4AutoStatePath",
        "stateFromSha256=$(Get-P1AstSha256Text $c4ReplayBaseState)", "stateToSha256=$(Get-P1AstSha256Text $c4ReplayCandidateState)", "queuePath=$c4AutoQueuePath",
        "queueFromSha256=$(Get-P1AstSha256Text $c4ReplayBaseQueue)", "queueToSha256=$(Get-P1AstSha256Text $c4ReplayCandidateQueue)", "fileCount=3", "singleParent=true", "singleCommit=true",
        "oneTime=true", "ancestorCheckpointPolicy=transition_only_exact_one_parent", "ordinaryDriftPolicy=hard_block", "standardModePolicy=hard_block",
        "databaseExecutionPolicy=blocked", "permissionExpansionPolicy=blocked", "file.001.path=$c4AutoStatePath", "file.001.status=M",
        "file.002.path=$c4AutoQueuePath", "file.002.status=M", "file.003.path=$c4AutoContractPath", "file.003.status=M", $c4AutoFence
    ) -join "`n"
    foreach ($c4ReplayCandidateFile in @(
        @{ Path = $c4AutoStatePath; Text = $c4ReplayCandidateState }, @{ Path = $c4AutoQueuePath; Text = $c4ReplayCandidateQueue }, @{ Path = $c4AutoContractPath; Text = $c4ReplayContract }
    )) { [IO.File]::WriteAllText((Join-Path $c4AutomaticPositiveRoot $c4ReplayCandidateFile.Path), $c4ReplayCandidateFile.Text, [Text.UTF8Encoding]::new($false)) }
    & git -C $c4AutomaticPositiveRoot add --all
    $c4ReplayRecords = @(& git -C $c4AutomaticPositiveRoot diff --cached --name-status --no-renames HEAD)
    $c4ReplayInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4AutomaticPositiveRoot -Phase pre_commit -NameStatusRecords $c4ReplayRecords -BaseReference HEAD -CandidateReference ":" -Branch master
    $c4ReplayDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c4ReplayInputs.ContractText -SourcePath $c4ReplayInputs.SourcePath -Facts $c4ReplayInputs.Facts
    Assert-True $c4ReplayInputs.Facts.TransitionConsumed "C4 replay RED: a base-tree contract source path with the same transition identity was not marked consumed."
    Assert-True (-not $c4ReplayDecision.Valid -and @($c4ReplayDecision.FindingCodes) -ccontains "P1_AST_REPLAY_BLOCKED") "C4 replay RED: the shared decision did not hard-block the base-tree replay."
    Assert-True ($c4ReplayDecision.Mode -cne "transition_only") "C4 replay RED: the consumed base-tree transition leaked transition_only."

    & git -C $c4AutomaticPositiveRoot reset --hard --quiet HEAD
    $c4AlternateReplayContract = $c4ReplayContract.Replace("file.003.path=$c4AutoContractPath", "file.003.path=$c4AutoReplayContractPath").Replace("file.003.status=M", "file.003.status=A")
    Set-ExactFileText $c4AutomaticPositiveRoot $c4AutoStatePath $c4ReplayCandidateState
    Set-ExactFileText $c4AutomaticPositiveRoot $c4AutoQueuePath $c4ReplayCandidateQueue
    Set-ExactFileText $c4AutomaticPositiveRoot $c4AutoReplayContractPath $c4AlternateReplayContract
    & git -C $c4AutomaticPositiveRoot add --all
    $c4AlternateReplayRecords = @(& git -C $c4AutomaticPositiveRoot diff --cached --name-status --no-renames HEAD)
    $c4AlternateReplayInputs = Get-P1ApprovedSameTaskTransitionStageInputs -RepositoryRoot $c4AutomaticPositiveRoot -Phase pre_commit -NameStatusRecords $c4AlternateReplayRecords -BaseReference HEAD -CandidateReference ":" -Branch master
    $c4AlternateReplayDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c4AlternateReplayInputs.ContractText -SourcePath $c4AlternateReplayInputs.SourcePath -Facts $c4AlternateReplayInputs.Facts
    Assert-True $c4AlternateReplayInputs.Facts.TransitionConsumed "C4 alternate-path replay RED: a transitionId committed at another base-tree path was not marked consumed."
    Assert-True (-not $c4AlternateReplayDecision.Valid -and (@($c4AlternateReplayDecision.FindingCodes) -join ',') -ceq "P1_AST_REPLAY_BLOCKED") "C4 alternate-path replay RED: the otherwise-valid shared decision did not hard-block only the consumed transitionId."
    Assert-True ($c4AlternateReplayDecision.Mode -cne "transition_only") "C4 alternate-path replay RED: the consumed transitionId leaked transition_only."
} finally {
    if (Test-Path -LiteralPath $c4AutomaticPositiveRoot) { Remove-Item -LiteralPath $c4AutomaticPositiveRoot -Recurse -Force }
}
$c4GenericGuardFixture = $null
try {
    $c4GenericGuardFixture = New-C4GenericGuardFixture -Name "p1-precommit-red"
    Assert-True ($c4GenericGuardFixture.StageInputs.Facts.StateProjectionMatches -and $c4GenericGuardFixture.StageInputs.Facts.QueueProjectionMatches) "C4 complete guard fixture projection is invalid: state=$($c4GenericGuardFixture.StageInputs.Facts.StateProjectionMatches) queue=$($c4GenericGuardFixture.StageInputs.Facts.QueueProjectionMatches) task=$($c4GenericGuardFixture.StageInputs.Facts.TaskId) parent=$($c4GenericGuardFixture.StageInputs.Facts.ParentTaskId)"
    Assert-True ($c4GenericGuardFixture.StageInputs.Facts.Branch -ceq $branch) "C4 complete guard fixture did not bind the identical candidate state/queue task branch."
    $c4GenericP1PreCommit = Invoke-Guard -Root $c4GenericGuardFixture.Root -Phase pre_commit
    Assert-True ($c4GenericP1PreCommit.ExitCode -eq 0) "C4 complete P1 pre-commit generic transition RED.`n$($c4GenericP1PreCommit.OutputText)"
    Assert-True ($c4GenericP1PreCommit.OutputText -match 'p1ApprovedSameTaskTransitionMode:\s*transition_only') "C4 complete P1 pre-commit did not emit the shared transition-only decision."
    Write-Output "C4_STAGE_PASS complete_p1_pre_commit"

    $c4GenericModulePreCommit = Invoke-C4ModuleGuard -Root $c4GenericGuardFixture.Root -ScriptPath "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1" -Arguments @("-TaskId", $taskId)
    Assert-True ($c4GenericModulePreCommit.ExitCode -eq 0) "C4 complete Module pre-commit generic transition failed.`n$($c4GenericModulePreCommit.OutputText)"
    Assert-True ($c4GenericModulePreCommit.OutputText -match 'p1ApprovedSameTaskTransitionMode:\s*transition_only') "C4 complete Module pre-commit did not emit the shared transition-only decision."
    Write-Output "C4_STAGE_PASS complete_module_pre_commit"

    $c4GenericContractFullPath = Join-Path $c4GenericGuardFixture.Root ($c4GenericGuardFixture.ContractPath -replace '/', [IO.Path]::DirectorySeparatorChar)
    $c4GenericContractOriginal = Get-Content -LiteralPath $c4GenericContractFullPath -Raw -Encoding UTF8
    Set-ExactFileText $c4GenericGuardFixture.Root $c4GenericGuardFixture.ContractPath ($c4GenericContractOriginal.Replace("transitionType=approved_same_task_transition", "transitionType=APPROVED_SAME_TASK_TRANSITION"))
    & git -C $c4GenericGuardFixture.Root add -- $c4GenericGuardFixture.ContractPath
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage the damaged C4 generic contract." }
    $c4DamagedGenericP1PreCommit = Invoke-Guard -Root $c4GenericGuardFixture.Root -Phase pre_commit
    Assert-True ($c4DamagedGenericP1PreCommit.ExitCode -ne 0) "C4 damaged generic contract unexpectedly passed the complete P1 pre-commit guard."
    Assert-True ($c4DamagedGenericP1PreCommit.OutputText -match 'p1ApprovedSameTaskTransitionCoreFinding:\s*P1_AST_FIELD_INVALID') "C4 damaged generic contract missed its shared core field code.`n$($c4DamagedGenericP1PreCommit.OutputText)"
    Assert-True ($c4DamagedGenericP1PreCommit.OutputText -match 'P1_PROGRAM_APPROVED_SAME_TASK_TRANSITION_INVALID') "C4 damaged generic contract missed the P1 stage hard-block."
    Assert-True ($c4DamagedGenericP1PreCommit.OutputText -notmatch 'p1ApprovedSameTaskTransitionMode:\s*transition_only|p1TransitionScopeMode:\s*transition_only') "C4 damaged generic contract leaked transition_only."
    Write-Output "C4_STAGE_PASS damaged_generic_complete_guard_hard_block"
    Set-ExactFileText $c4GenericGuardFixture.Root $c4GenericGuardFixture.ContractPath $c4GenericContractOriginal
    & git -C $c4GenericGuardFixture.Root add -- $c4GenericGuardFixture.ContractPath
    if ($LASTEXITCODE -ne 0) { throw "Unable to restore the valid C4 generic contract." }

    & git -C $c4GenericGuardFixture.Root commit --quiet -m "test: generic approved same-task transition"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit the C4 generic guard fixture." }

    & git -C $c4GenericGuardFixture.Root branch --force master HEAD
    if ($LASTEXITCODE -ne 0) { throw "Unable to project the C4 generic guard fixture onto master." }
    & git -C $c4GenericGuardFixture.Root checkout --quiet master
    if ($LASTEXITCODE -ne 0) { throw "Unable to check out the C4 generic guard fixture master branch." }
    $c4GenericP1PrePushBranch = ((& git -C $c4GenericGuardFixture.Root branch --show-current) -join "").Trim()
    Assert-True ($c4GenericP1PrePushBranch -ceq "master") "C4 complete P1 pre-push did not run from master."

    $c4GenericP1PrePush = Invoke-Guard -Root $c4GenericGuardFixture.Root -Phase pre_push
    Assert-True ($c4GenericP1PrePush.ExitCode -eq 0) "C4 complete P1 pre-push generic transition failed.`n$($c4GenericP1PrePush.OutputText)"
    Assert-True ($c4GenericP1PrePush.OutputText -match 'p1ApprovedSameTaskTransitionMode:\s*transition_only') "C4 complete P1 pre-push did not emit the shared transition-only decision."
    Assert-True ($c4GenericP1PrePush.OutputText -match 'p1TransitionScopeMode:\s*transition_only') "C4 complete P1 pre-push did not propagate transition_only."
    Write-Output "C4_STAGE_PASS complete_p1_pre_push"

    $c4GenericModulePrePushBranch = ((& git -C $c4GenericGuardFixture.Root branch --show-current) -join "").Trim()
    Assert-True ($c4GenericModulePrePushBranch -ceq "master") "C4 complete Module pre-push did not run from master."
    $c4GenericModulePrePush = Invoke-C4ModuleGuard -Root $c4GenericGuardFixture.Root -ScriptPath "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1" -Arguments @("-TaskId", $taskId, "-P1TransitionScopeMode", "transition_only", "-SkipRemoteAheadCheck")
    Assert-True ($c4GenericModulePrePush.ExitCode -eq 0) "C4 complete Module pre-push generic transition failed.`n$($c4GenericModulePrePush.OutputText)"
    Assert-True ($c4GenericModulePrePush.OutputText -match 'p1ApprovedSameTaskTransitionMode:\s*transition_only') "C4 complete Module pre-push did not emit the shared transition-only decision."
    Assert-True ($c4GenericModulePrePush.OutputText -match 'p1TransitionScopeMode:\s*transition_only') "C4 complete Module pre-push did not retain P1 transition_only."
    Write-Output "C4_STAGE_PASS complete_module_pre_push"
} finally {
    if ($null -ne $c4GenericGuardFixture) { Remove-Fixture -Root $c4GenericGuardFixture.Root }
}
$c3OversizedRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-p1-ast-dos-" + [guid]::NewGuid().ToString("N"))
$c3OversizedProcess = $null
try {
    [void](New-Item -ItemType Directory -Path $c3OversizedRoot -Force)
    $c3OversizedContractPath = Join-Path $c3OversizedRoot "contract.txt"
    $c3OversizedRunnerPath = Join-Path $c3OversizedRoot "runner.ps1"
    [System.IO.File]::WriteAllText($c3OversizedContractPath, (Set-C3ContractValue $c2ExactPositiveContract "fileCount" "2147483647"), [System.Text.UTF8Encoding]::new($false))
    $c3OversizedRunner = @'
param([string]$CommonPath, [string]$ContractPath)
$ErrorActionPreference = "Stop"
. $CommonPath
$contract = Read-P1ApprovedSameTaskTransitionContract -Text ([IO.File]::ReadAllText($ContractPath)) -SourcePath "docs/05-execution-logs/transitions/dos.md"
if ($contract.ParserValid -or @($contract.FindingCodes) -cnotcontains "P1_AST_FIELD_INVALID") { exit 1 }
exit 0
'@
    [System.IO.File]::WriteAllText($c3OversizedRunnerPath, $c3OversizedRunner, [System.Text.UTF8Encoding]::new($false))
    $c3OversizedStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $c3OversizedProcess = Start-Process powershell.exe -ArgumentList @("-NoLogo", "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $c3OversizedRunnerPath, $c2SharedPath, $c3OversizedContractPath) -WindowStyle Hidden -PassThru
    $c3OversizedCompleted = $c3OversizedProcess.WaitForExit(3000)
    $c3OversizedStopwatch.Stop()
    if (-not $c3OversizedCompleted) { $c3OversizedProcess.Kill(); $c3OversizedProcess.WaitForExit() }
    Assert-True ($c3OversizedCompleted -and $c3OversizedProcess.ExitCode -eq 0 -and $c3OversizedStopwatch.Elapsed.TotalSeconds -lt 3) "C3 oversized fileCount did not fail closed before entering the indexed-file loop."
} finally {
    if ($null -ne $c3OversizedProcess -and -not $c3OversizedProcess.HasExited) { $c3OversizedProcess.Kill(); $c3OversizedProcess.WaitForExit() }
    if (Test-Path -LiteralPath $c3OversizedRoot) { Remove-Item -LiteralPath $c3OversizedRoot -Recurse -Force }
}
$c3OversizedRecords = @()
$c3OversizedHashMap = [ordered]@{}
for ($c3OversizedIndex = 1000; $c3OversizedIndex -ge 1; $c3OversizedIndex--) {
    $c3OversizedPath = "docs/05-execution-logs/transitions/oversized-$($c3OversizedIndex.ToString('0000')).md"
    $c3OversizedRecords += "M`t$c3OversizedPath"
    $c3OversizedHashMap[$c3OversizedPath] = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
}
$c3CanonicalizerThrew = $false
$c3CanonicalizerStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try { Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $c3OversizedRecords | Out-Null }
catch { $c3CanonicalizerThrew = $_.Exception.Message -match 'maximum 999' }
$c3CanonicalizerStopwatch.Stop()
Assert-True ($c3CanonicalizerThrew -and $c3CanonicalizerStopwatch.Elapsed.TotalSeconds -lt 2) "C3 canonicalizer did not reject more than 999 raw records before sorting."
$c3OversizedFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3OversizedFacts.NameStatusRecords = $c3OversizedRecords
$c3OversizedFacts.ExpectedNameStatusRecords = @($c3OversizedRecords)
$c3OversizedFacts.CandidateFileSha256ByPath = $c3OversizedHashMap
$c3CandidateTreeThrew = $false
$c3CandidateTreeStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try { Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c3OversizedFacts | Out-Null }
catch { $c3CandidateTreeThrew = $_.Exception.Message -match 'maximum 999' }
$c3CandidateTreeStopwatch.Stop()
Assert-True ($c3CandidateTreeThrew -and $c3CandidateTreeStopwatch.Elapsed.TotalSeconds -lt 2) "C3 candidate tree hash did not reject more than 999 records before canonicalization."
$c3OversizedDecisionStopwatch = [System.Diagnostics.Stopwatch]::StartNew()
$c3OversizedDecision = Test-P1ApprovedSameTaskTransition -Contract (Read-P1ApprovedSameTaskTransitionContract -Text $c2ExactPositiveContract -SourcePath $c2ExactPositiveFacts.SourcePath) -Facts $c3OversizedFacts
$c3OversizedDecisionStopwatch.Stop()
Assert-True (-not $c3OversizedDecision.Valid -and @($c3OversizedDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID" -and $c3OversizedDecisionStopwatch.Elapsed.TotalSeconds -lt 2) "C3 validator did not fail closed on oversized raw facts before canonicalization."
$c3PositiveContract = Read-P1ApprovedSameTaskTransitionContract -Text $c2ExactPositiveContract -SourcePath $c2ExactPositiveFacts.SourcePath
$c3PositiveDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c2ExactPositiveFacts
Assert-True ($c3PositiveDecision.Recognized -and $c3PositiveDecision.Valid -and $c3PositiveDecision.Mode -ceq "transition_only") "C3 exact positive shared decision is not valid."
$c4PositiveCoreSignatures = @()
foreach ($c4AdapterBody in $c4AdapterBodies) {
    Invoke-Expression $c4AdapterBody
    $c4AdapterDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c2ExactPositiveContract -SourcePath $c2ExactPositiveFacts.SourcePath -Facts $c2ExactPositiveFacts
    $c4PositiveCoreSignatures += "$($c4AdapterDecision.Recognized)|$($c4AdapterDecision.Valid)|$($c4AdapterDecision.Mode)|$(@($c4AdapterDecision.FindingCodes) -join ',')"
}
Assert-True (@($c4PositiveCoreSignatures | Sort-Object -Unique).Count -eq 1 -and $c4PositiveCoreSignatures[0] -ceq "True|True|transition_only|") "C4 adapters do not return one runtime positive core decision."
$c3CanonicalFiles = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $c2ExactPositiveFacts.NameStatusRecords)
Assert-True ($c3CanonicalFiles.Count -eq 3 -and $c3CanonicalFiles[0].Path -ceq "docs/04-agent-system/state/project-state.yaml" -and $c3CanonicalFiles[2].Status -ceq "A") "C3 canonical file normalization is invalid."
$c3CandidateHash = Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c2ExactPositiveFacts
$c3FreshnessKey = Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c2ExactPositiveFacts -Profile "focused" -Command "c3-shared-matrix"
Assert-True ($c3CandidateHash -match '^[0-9a-f]{64}$' -and $c3FreshnessKey -match '^[0-9a-f]{64}$') "C3 deterministic hashes are invalid."
Assert-True ((Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c2ExactPositiveFacts) -ceq $c3CandidateHash) "C3 candidate hash is not deterministic."
$c3ChangedHashFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3ChangedHashFacts.CandidateFileSha256ByPath = [ordered]@{}
foreach ($c3Path in $c2ExactPositiveFacts.CandidateFileSha256ByPath.Keys) { $c3ChangedHashFacts.CandidateFileSha256ByPath[$c3Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3Path] }
$c3ChangedHashFacts.CandidateFileSha256ByPath["docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"] = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
Assert-True ((Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c3ChangedHashFacts) -cne $c3CandidateHash) "C3 candidate hash ignored changed candidate content."
$c3ChangedContextFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3ChangedContextFacts.Branch = "codex/context-only-change"
Assert-True ((Get-P1ApprovedSameTaskTransitionCandidateTreeHash -Facts $c3ChangedContextFacts) -ceq $c3CandidateHash) "C3 candidate tree identity incorrectly depends on validation context."
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c2ExactPositiveFacts -Profile "full" -Command "c3-shared-matrix") -cne $c3FreshnessKey) "C3 freshness key ignored the profile."
$c3ChangedFreshnessFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3ChangedFreshnessFacts.CommonSha256 = "8888888888888888888888888888888888888888888888888888888888888888"
Assert-True ((Get-P1ApprovedSameTaskTransitionFreshnessKey -Facts $c3ChangedFreshnessFacts -Profile "focused" -Command "c3-shared-matrix") -cne $c3FreshnessKey) "C3 freshness key ignored a shared-validator change."
foreach ($c3InvalidHashMutation in @("missing", "extra", "malformed")) {
    $c3HashFacts = Copy-C3Facts $c2ExactPositiveFacts
    $c3HashFacts.CandidateFileSha256ByPath = [ordered]@{}
    foreach ($c3Path in $c2ExactPositiveFacts.CandidateFileSha256ByPath.Keys) { $c3HashFacts.CandidateFileSha256ByPath[$c3Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3Path] }
    switch ($c3InvalidHashMutation) {
        "missing" { $c3HashFacts.CandidateFileSha256ByPath.Remove("docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md") }
        "extra" { $c3HashFacts.CandidateFileSha256ByPath["docs/extra.md"] = "9999999999999999999999999999999999999999999999999999999999999999" }
        "malformed" { $c3HashFacts.CandidateFileSha256ByPath["docs/04-agent-system/state/project-state.yaml"] = "NOT_A_SHA256" }
    }
    $c3InvalidHashDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3HashFacts
    Assert-True (-not $c3InvalidHashDecision.Valid -and @($c3InvalidHashDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 candidate hash map mutation '$c3InvalidHashMutation' did not fail closed."
}
$c3CaseVariantHashFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3CaseVariantHashFacts.Remove("CandidateFileSha256ByPath")
$c3CaseVariantHashFacts["candidateFileSha256ByPath"] = $c2ExactPositiveFacts.CandidateFileSha256ByPath
$c3CaseVariantHashDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3CaseVariantHashFacts
Assert-True (-not $c3CaseVariantHashDecision.Valid -and @($c3CaseVariantHashDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 case-variant candidate file hash fact key bypassed ordinal fact lookup."
$c3ContractHashFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3ContractHashFacts.CandidateFileSha256ByPath = [ordered]@{}
foreach ($c3Path in $c2ExactPositiveFacts.CandidateFileSha256ByPath.Keys) { $c3ContractHashFacts.CandidateFileSha256ByPath[$c3Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3Path] }
$c3ContractHashFacts.CandidateFileSha256ByPath[$c2ExactPositiveFacts.SourcePath] = "eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
$c3ContractHashDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3ContractHashFacts
Assert-True (-not $c3ContractHashDecision.Valid -and @($c3ContractHashDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 parsed contract raw text was not bound to its candidate source-path SHA."
foreach ($c3ProjectionHashCase in @(
    @{ Name = "state"; Path = $c2ExactPositiveFacts.StatePath; Hash = "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
    @{ Name = "queue"; Path = $c2ExactPositiveFacts.QueuePath; Hash = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" }
)) {
    $c3ProjectionHashFacts = Copy-C3Facts $c2ExactPositiveFacts
    $c3ProjectionHashFacts.CandidateFileSha256ByPath = [ordered]@{}
    foreach ($c3Path in $c2ExactPositiveFacts.CandidateFileSha256ByPath.Keys) { $c3ProjectionHashFacts.CandidateFileSha256ByPath[$c3Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3Path] }
    $c3ProjectionHashFacts.CandidateFileSha256ByPath[$c3ProjectionHashCase.Path] = $c3ProjectionHashCase.Hash
    $c3ProjectionHashDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3ProjectionHashFacts
    Assert-True (-not $c3ProjectionHashDecision.Valid -and @($c3ProjectionHashDecision.FindingCodes) -ccontains "P1_AST_PROJECTION_INVALID") "C3 $($c3ProjectionHashCase.Name) candidate file hash was not bound to its to-projection SHA."
}
foreach ($c3UnauthorizedPath in @("docs/05-execution-logs/transitions/unauthorized-extra.md", "package.json")) {
    $c3UnauthorizedText = Set-C3ContractValue $c2ExactPositiveContract "fileCount" "4"
    $c3UnauthorizedText = Add-C3ContractLine $c3UnauthorizedText "file.004.path=$c3UnauthorizedPath"
    $c3UnauthorizedText = Add-C3ContractLine $c3UnauthorizedText "file.004.status=A"
    $c3UnauthorizedFacts = Copy-C3Facts $c2ExactPositiveFacts
    $c3UnauthorizedFacts.NameStatusRecords = @($c3UnauthorizedFacts.NameStatusRecords + "A`t$c3UnauthorizedPath")
    $c3UnauthorizedFacts.CandidateFileSha256ByPath = [ordered]@{}
    foreach ($c3Path in $c2ExactPositiveFacts.CandidateFileSha256ByPath.Keys) { $c3UnauthorizedFacts.CandidateFileSha256ByPath[$c3Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3Path] }
    $c3UnauthorizedFacts.CandidateFileSha256ByPath[$c3UnauthorizedPath] = "9999999999999999999999999999999999999999999999999999999999999999"
    $c3UnauthorizedContract = Read-P1ApprovedSameTaskTransitionContract -Text $c3UnauthorizedText -SourcePath $c3UnauthorizedFacts.SourcePath
    $c3UnauthorizedDecision = Test-P1ApprovedSameTaskTransition -Contract $c3UnauthorizedContract -Facts $c3UnauthorizedFacts
    Assert-True (-not $c3UnauthorizedDecision.Valid -and @($c3UnauthorizedDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 candidate contract self-authorized path '$c3UnauthorizedPath' outside the base expected file set."
}
$c3MissingExpectedFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3MissingExpectedFacts.Remove("ExpectedNameStatusRecords")
$c3MissingExpectedDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3MissingExpectedFacts
Assert-True (-not $c3MissingExpectedDecision.Valid -and @($c3MissingExpectedDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 missing base-anchored expected name-status facts did not fail closed."
$c3RequiredRoleCases = @(
    @{ Name = "zero-file"; Files = @() },
    @{ Name = "missing-state"; Files = @(
            [pscustomobject]@{ Path = "docs/04-agent-system/state/task-queue.yaml"; Status = "M" },
            [pscustomobject]@{ Path = "docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; Status = "A" }
        ) },
    @{ Name = "missing-queue"; Files = @(
            [pscustomobject]@{ Path = "docs/04-agent-system/state/project-state.yaml"; Status = "M" },
            [pscustomobject]@{ Path = "docs/05-execution-logs/transitions/p1-ast-future-product-transition-001.md"; Status = "A" }
        ) },
    @{ Name = "missing-contract-source"; Files = @(
            [pscustomobject]@{ Path = "docs/04-agent-system/state/project-state.yaml"; Status = "M" },
            [pscustomobject]@{ Path = "docs/04-agent-system/state/task-queue.yaml"; Status = "M" }
        ) }
)
foreach ($c3RequiredRoleCase in $c3RequiredRoleCases) {
    $c3RequiredRoleText = Set-C3ContractFiles -Files @($c3RequiredRoleCase.Files)
    $c3RequiredRoleFacts = Copy-C3Facts $c2ExactPositiveFacts
    $c3RequiredRoleFacts.NameStatusRecords = @($c3RequiredRoleCase.Files | ForEach-Object { "$($_.Status)`t$($_.Path)" })
    $c3RequiredRoleFacts.ExpectedNameStatusRecords = @($c3RequiredRoleFacts.NameStatusRecords)
    $c3RequiredRoleFacts.CandidateFileSha256ByPath = [ordered]@{}
    foreach ($c3RequiredRoleFile in $c3RequiredRoleCase.Files) {
        $c3RequiredRoleFacts.CandidateFileSha256ByPath[$c3RequiredRoleFile.Path] = $c2ExactPositiveFacts.CandidateFileSha256ByPath[$c3RequiredRoleFile.Path]
    }
    $c3RequiredRoleContract = Read-P1ApprovedSameTaskTransitionContract -Text $c3RequiredRoleText -SourcePath $c3RequiredRoleFacts.SourcePath
    $c3RequiredRoleDecision = Test-P1ApprovedSameTaskTransition -Contract $c3RequiredRoleContract -Facts $c3RequiredRoleFacts
    Assert-True (-not $c3RequiredRoleDecision.Valid -and @($c3RequiredRoleDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 required file role case '$($c3RequiredRoleCase.Name)' did not fail closed."
}
$c3ReorderedText = Set-C3ContractValue $c2ExactPositiveContract "file.001.path" "docs/04-agent-system/state/task-queue.yaml"
$c3ReorderedText = Set-C3ContractValue $c3ReorderedText "file.002.path" "docs/04-agent-system/state/project-state.yaml"
$c3ReorderedFacts = Copy-C3Facts $c2ExactPositiveFacts
$c3ReorderedFacts.NameStatusRecords = @($c2ExactPositiveFacts.NameStatusRecords[1], $c2ExactPositiveFacts.NameStatusRecords[0], $c2ExactPositiveFacts.NameStatusRecords[2])
$c3ReorderedFacts.ExpectedNameStatusRecords = @($c2ExactPositiveFacts.ExpectedNameStatusRecords[1], $c2ExactPositiveFacts.ExpectedNameStatusRecords[0], $c2ExactPositiveFacts.ExpectedNameStatusRecords[2])
$c3ReorderedContract = Read-P1ApprovedSameTaskTransitionContract -Text $c3ReorderedText -SourcePath $c3ReorderedFacts.SourcePath
$c3ReorderedDecision = Test-P1ApprovedSameTaskTransition -Contract $c3ReorderedContract -Facts $c3ReorderedFacts
Assert-True (-not $c3ReorderedDecision.Valid -and @($c3ReorderedDecision.FindingCodes) -ccontains "P1_AST_FILE_SET_INVALID") "C3 jointly reordered contract/actual/expected files bypassed ordinal ordering."
$c3SortedProjection = @(Get-P1ApprovedSameTaskTransitionCanonicalFiles -NameStatusRecords $c3ReorderedFacts.NameStatusRecords)
Assert-True ($c3SortedProjection[0].Path -ceq "docs/04-agent-system/state/project-state.yaml" -and $c3SortedProjection[1].Path -ceq "docs/04-agent-system/state/task-queue.yaml") "C3 canonicalizer did not produce ordinal file order."

$c3RequiredBooleanFacts = @(
    @{ Key = "BaseAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
    @{ Key = "StandingAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
    @{ Key = "StateProjectionMatches"; Code = "P1_AST_PROJECTION_INVALID" },
    @{ Key = "QueueProjectionMatches"; Code = "P1_AST_PROJECTION_INVALID" },
    @{ Key = "SingleParent"; Code = "P1_AST_TOPOLOGY_INVALID" },
    @{ Key = "SingleCommit"; Code = "P1_AST_TOPOLOGY_INVALID" },
    @{ Key = "AncestorMatches"; Code = "P1_AST_TOPOLOGY_INVALID" },
    @{ Key = "RemoteBaselineMatches"; Code = "P1_AST_TOPOLOGY_INVALID" },
    @{ Key = "AncestorCheckpointAuthorized"; Code = "P1_AST_TOPOLOGY_INVALID" },
    @{ Key = "TransitionConsumed"; Code = "P1_AST_REPLAY_BLOCKED" },
    @{ Key = "OrdinaryDrift"; Code = "P1_AST_ORDINARY_DRIFT_BLOCKED" },
    @{ Key = "StandardMode"; Code = "P1_AST_STANDARD_MODE_BLOCKED" },
    @{ Key = "CandidateAuthorizationPresent"; Code = "P1_AST_AUTHORIZATION_INVALID" },
    @{ Key = "CandidateStatusApproved"; Code = "P1_AST_AUTHORIZATION_INVALID" },
    @{ Key = "CandidateCloseoutPolicyAuthorization"; Code = "P1_AST_AUTHORIZATION_INVALID" },
    @{ Key = "CandidateProjectionPresent"; Code = "P1_AST_PROJECTION_INVALID" },
    @{ Key = "ReservedMarkerPresent"; Code = "P1_AST_CONTEXT_INVALID" }
)
foreach ($c3BooleanFact in $c3RequiredBooleanFacts) {
    foreach ($c3FactMutation in @("missing", "string")) {
        $c3InvalidFactSet = Copy-C3Facts $c2ExactPositiveFacts
        if ($c3FactMutation -ceq "missing") { $c3InvalidFactSet.Remove($c3BooleanFact.Key) }
        else { $c3InvalidFactSet[$c3BooleanFact.Key] = ([string]$c2ExactPositiveFacts[$c3BooleanFact.Key]).ToLowerInvariant() }
        $c3InvalidFactDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3InvalidFactSet
        Assert-True (-not $c3InvalidFactDecision.Valid -and @($c3InvalidFactDecision.FindingCodes) -ccontains $c3BooleanFact.Code) "C3 boolean fact '$($c3BooleanFact.Key)' mutation '$c3FactMutation' did not fail closed with $($c3BooleanFact.Code)."
    }
}
foreach ($c3IntegerFact in @("ParentCount", "CommitCount")) {
    foreach ($c3FactMutation in @("missing", "string")) {
        $c3InvalidFactSet = Copy-C3Facts $c2ExactPositiveFacts
        if ($c3FactMutation -ceq "missing") { $c3InvalidFactSet.Remove($c3IntegerFact) }
        else { $c3InvalidFactSet[$c3IntegerFact] = "1" }
        $c3InvalidFactDecision = Test-P1ApprovedSameTaskTransition -Contract $c3PositiveContract -Facts $c3InvalidFactSet
        Assert-True (-not $c3InvalidFactDecision.Valid -and @($c3InvalidFactDecision.FindingCodes) -ccontains "P1_AST_TOPOLOGY_INVALID") "C3 integer fact '$c3IntegerFact' mutation '$c3FactMutation' did not fail closed."
    }
}
foreach ($c3MalformedScalar in @(
    @{ Key = "baseSha"; Value = "not-a-git-sha"; Fact = "BaseSha" },
    @{ Key = "stateToSha256"; Value = "NOT_A_SHA256"; Fact = "StateToSha256" },
    @{ Key = "queueToSha256"; Value = "short"; Fact = "QueueToSha256" },
    @{ Key = "fileCount"; Value = "03"; Fact = $null }
)) {
    $c3MalformedText = Set-C3ContractValue $c2ExactPositiveContract $c3MalformedScalar.Key $c3MalformedScalar.Value
    $c3MalformedFacts = Copy-C3Facts $c2ExactPositiveFacts
    if ($null -ne $c3MalformedScalar.Fact) { $c3MalformedFacts[$c3MalformedScalar.Fact] = $c3MalformedScalar.Value }
    $c3MalformedContract = Read-P1ApprovedSameTaskTransitionContract -Text $c3MalformedText -SourcePath $c3MalformedFacts.SourcePath
    $c3MalformedDecision = Test-P1ApprovedSameTaskTransition -Contract $c3MalformedContract -Facts $c3MalformedFacts
    Assert-True (-not $c3MalformedDecision.Valid -and @($c3MalformedDecision.FindingCodes) -ccontains "P1_AST_FIELD_INVALID") "C3 malformed scalar '$($c3MalformedScalar.Key)' did not fail closed."
}
foreach ($c3Case in $c2ContractRedCases) {
    $c3Input = Get-C3ContractCaseInput $c3Case
    $c3Contract = Read-P1ApprovedSameTaskTransitionContract -Text $c3Input.Text -SourcePath $c3Input.Facts.SourcePath
    $c3Decision = Test-P1ApprovedSameTaskTransition -Contract $c3Contract -Facts $c3Input.Facts
    Assert-True ($c3Decision.Recognized -and -not $c3Decision.Valid -and $c3Decision.Mode -ceq "invalid") "C3 negative '$($c3Case.Name)' did not fail closed."
    Assert-True (@($c3Decision.FindingCodes) -ccontains $c3Case.ExpectedFindingCode) "C3 negative '$($c3Case.Name)' missed $($c3Case.ExpectedFindingCode). Actual: $(@($c3Decision.FindingCodes) -join ',')"
    $c4ExpectedCoreSignature = "$($c3Decision.Recognized)|$($c3Decision.Valid)|$($c3Decision.Mode)|$(@($c3Decision.FindingCodes) -join ',')"
    foreach ($c4AdapterBody in $c4AdapterBodies) {
        Invoke-Expression $c4AdapterBody
        $c4AdapterDecision = Invoke-P1ApprovedSameTaskTransitionAdapter -ContractText $c3Input.Text -SourcePath $c3Input.Facts.SourcePath -Facts $c3Input.Facts
        $c4ActualCoreSignature = "$($c4AdapterDecision.Recognized)|$($c4AdapterDecision.Valid)|$($c4AdapterDecision.Mode)|$(@($c4AdapterDecision.FindingCodes) -join ',')"
        Assert-True ($c4ActualCoreSignature -ceq $c4ExpectedCoreSignature) "C4 adapter runtime core decision drifted for '$($c3Case.Name)'."
    }
}

$fixtureRoots = [System.Collections.Generic.List[string]]::new()
try {
    $positiveRoot = New-BootstrapFixture "positive"
    $fixtureRoots.Add($positiveRoot)
    $positiveResult = Invoke-Guard $positiveRoot
    Assert-True ($positiveResult.ExitCode -eq 0) "Exact bootstrap candidate did not pass.`n$($positiveResult.OutputText)"
    Assert-True ($positiveResult.OutputText -match 'p1MechanismBootstrapAuthorization:\s*approved_one_time') "Exact bootstrap did not emit its one-time authorization marker."
    Assert-True ($positiveResult.OutputText -match "currentTaskId:\s*$([regex]::Escape($taskId))") "Exact bootstrap did not materialize the unique mechanism successor."
    & git -C $positiveRoot commit --quiet -m "test: materialize exact mechanism bootstrap"
    if ($LASTEXITCODE -ne 0) { throw "Unable to commit exact pre-push bootstrap fixture." }
    & git -C $positiveRoot branch -M master
    if ($LASTEXITCODE -ne 0) { throw "Unable to project exact bootstrap fixture onto master." }
    $positivePrePushResult = Invoke-Guard $positiveRoot -Phase pre_push
    Assert-True ($positivePrePushResult.ExitCode -eq 0) "Exact bootstrap pre-push candidate did not pass.`n$($positivePrePushResult.OutputText)"
    Assert-True ($positivePrePushResult.OutputText -match 'p1MechanismBootstrapAuthorization:\s*approved_one_time') "Exact bootstrap pre-push did not emit its one-time authorization marker."

    $ordinaryDriftRoot = New-BootstrapFixture "ordinary-drift"
    $fixtureRoots.Add($ordinaryDriftRoot)
    & git -C $ordinaryDriftRoot reset --hard --quiet HEAD
    $ordinaryDriftStatePath = Join-Path $ordinaryDriftRoot "docs/04-agent-system/state/project-state.yaml"
    $ordinaryDriftStateText = Get-Content -LiteralPath $ordinaryDriftStatePath -Raw -Encoding UTF8
    Set-ExactFileText $ordinaryDriftRoot "docs/04-agent-system/state/project-state.yaml" ($ordinaryDriftStateText.Replace("  lastKnownMasterSha: 0fe8edae7a7efc00154f5c54227623be55796983", "  lastKnownMasterSha: $baseSha"))
    & git -C $ordinaryDriftRoot add -- "docs/04-agent-system/state/project-state.yaml"
    if ($LASTEXITCODE -ne 0) { throw "Unable to stage ordinary drift fixture." }
    $ordinaryDriftResult = Invoke-Guard $ordinaryDriftRoot
    Assert-True ($ordinaryDriftResult.ExitCode -ne 0) "Ordinary in-progress SHA drift unexpectedly passed."
    Assert-True ($ordinaryDriftResult.OutputText -match 'P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION') "Ordinary in-progress SHA drift missed its historical hard-block.`n$($ordinaryDriftResult.OutputText)"
    Assert-True ($ordinaryDriftResult.OutputText -notmatch 'p1MechanismBootstrapAuthorization:\s*approved_one_time') "Ordinary drift leaked bootstrap authorization."

    $negativeRoot = New-BootstrapFixtureRoot -Name "negative-reusable"
    $fixtureRoots.Add($negativeRoot)
    foreach ($negative in @(
        @{ Name = "wrong-task-kind"; Mutation = "wrong_task_kind"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID|P1_PROGRAM_TASK_FINDING_SET_INVALID" },
        @{ Name = "wrong-contribution"; Mutation = "wrong_contribution"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID|P1_PROGRAM_TASK_FINDING_SET_INVALID" },
        @{ Name = "missing-finding-ids"; Mutation = "missing_finding_ids"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID|P1_PROGRAM_TASK_FINDING_SET_INVALID" },
        @{ Name = "missing-file"; Mutation = "missing_file"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_FILE_SET_INVALID|P1_PROGRAM_MECHANISM_BOOTSTRAP_ALLOWLIST_MISMATCH" },
        @{ Name = "extra-file"; Mutation = "extra_file"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_FILE_SET_INVALID|P1_PROGRAM_MECHANISM_BOOTSTRAP_ALLOWLIST_MISMATCH" },
        @{ Name = "wrong-base"; Mutation = "wrong_base"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID pre_commit" },
        @{ Name = "wrong-branch"; Mutation = "wrong_branch"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_CONTEXT_INVALID pre_commit" },
        @{ Name = "wrong-authorization"; Mutation = "wrong_authorization"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_AUTHORIZATION_INVALID" },
        @{ Name = "wrong-queue-projection"; Mutation = "wrong_queue_projection"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_PROJECTION_INVALID" },
        @{ Name = "wrong-state-projection"; Mutation = "wrong_state_projection"; Pattern = "P1_PROGRAM_MECHANISM_BOOTSTRAP_PROJECTION_INVALID" }
    )) {
        Set-BootstrapFixtureCandidate -Root $negativeRoot -Name $negative.Name -Mutation $negative.Mutation | Out-Null
        $negativeResult = Invoke-Guard $negativeRoot
        Assert-True ($negativeResult.ExitCode -ne 0) "Bootstrap negative '$($negative.Name)' unexpectedly passed."
        Assert-True ($negativeResult.OutputText -match $negative.Pattern) "Bootstrap negative '$($negative.Name)' missed expected finding.`n$($negativeResult.OutputText)"
        Assert-True ($negativeResult.OutputText -notmatch 'p1MechanismBootstrapAuthorization:\s*approved_one_time') "Bootstrap negative '$($negative.Name)' leaked authorization."
    }
} finally {
    foreach ($fixtureRoot in $fixtureRoots) { Remove-Fixture $fixtureRoot }
}

Write-Output "P1 approved same-task transition focused characterization passed"
Write-Output "profile: $Profile"
Write-Output "caseCount: $script:caseCount"
Write-Output "duplicateLogicInventory: contract_parsing,authorization,exact_files,task_base_branch_projection,topology,replay,ordinary_drift"
Write-Output "stageResponsibilities: p1_program_state_queue_wip_findings;module_pre_commit_scope_ssot_sensitive_terminology_staged_status;module_pre_push_remote_clean_tree_update_topology_readiness"
