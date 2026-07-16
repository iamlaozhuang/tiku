param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-ContentAdminPlatformRecoverySurface.ps1"
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-recovery-surface-" + [guid]::NewGuid().ToString("N"))
$currentTaskId = "content-admin-platform-m2-active-state-slimming-2026-07-13"
$nextTaskId = "content-admin-platform-b0-contract-code-mapping-2026-07-13"
$terminalTaskId = "content-admin-platform-f5-final-cumulative-audit-2026-07-13"
$successorTaskId = "p0-remediation-serial-program-bootstrap-2026-07-14"
$closedStartupTaskBlock = @"
lastClosedStartupTask:
  id: p1-p2-remediation-startup-package-v1-2026-07-15
  title: P1/P2 remediation startup package v1.0
  phase: p1-p2-remediation-startup-package-v1-2026-07-15
  status: closed
  priority: governance
  taskKind: static_audit_and_planning
  branch: codex/p1-p2-remediation-startup-package-v1
  executionProfile: R2
  planPath: docs/05-execution-logs/task-plans/2026-07-15-p1-p2-remediation-startup-package-v1.md
  evidencePath: docs/05-execution-logs/evidence/2026-07-15-p1-p2-remediation-startup-package-v1.md
  auditReviewPath: docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md
  nextRequiredTaskId: ""
  startupPackage:
    status: closed
    activityStatePolicy: wip_one_governance_only
    sourceMasterSha: 0643ad4d6346453f3324d86b6e003c6726c808ef
    p0ProductStaticBaselineSha: e136ca28acde82282a17c65ccfb828a01e872c0b
    originalAuditSourceSha: 7aac83765ca4b650b73b1612013e26a0111775ae
    auditRepositorySha: a84224fa12ec85b28e6acd945deba2afa28c6c02
    findingCounts:
      total: 143
      p1: 125
      p2: 18
    revalidationPolicy:
      startupLevel: level_1_all_findings_unique
      deepAdversarialLevel: just_in_time_when_cluster_claimed
      p2BeforeP1Freeze: impact_mapping_only
    startupPackagePath: docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-startup-package-v1.md
    findingLedgerPath: docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml
    postP0MapPath: docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-post-p0-revalidation-map-v1.yaml
    clusterPath: docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-root-cause-clusters-v1.yaml
    p1SerialDraftPath: docs/05-execution-logs/task-plans/2026-07-15-p1-remediation-serial-program.md
    generatorPath: scripts/agent-system/New-P1P2RemediationStartupArtifacts.ps1
    guardScriptPath: scripts/agent-system/Test-P1P2RemediationStartupPackage.ps1
    completion:
      packageMaterialized: true
      consistencyCheck: pass
      twoRoundAdversarialReview: pass
      productZeroChange: pass
      auditRepositoryZeroChange: pass
      detachedRecoveryDrill: pass
      localCommit: finalized_by_commit_containing_this_state
      closeoutAuthorization: approved_current_user_2026_07_16
  implementationBoundary:
    p1Implementation: blocked_requires_new_goal_and_authorization
    p2Implementation: blocked_until_p1_frozen_and_new_goal
    runtimeAcceptance: blocked_requires_separate_goal_and_approval
    schemaMigration: blocked_requires_new_program_authorization
    databaseMutation: blocked_requires_fresh_user_approval
    dependencyIntroduction: blocked_requires_fresh_user_approval
    providerRuntimeBrowser: blocked_requires_fresh_user_approval
    prForcePushDeploy: blocked_requires_fresh_user_approval
    fastForwardMerge: approved_master_only_current_user_2026_07_16
    push: approved_origin_master_only_current_user_2026_07_16
    cleanup: approved_after_remote_sync_current_user_2026_07_16
  currentExecutionGate:
    status: satisfied_governance_only
    reason: user_created_goal_for_p1_p2_startup_package_only
    resumeAction: finish_143_level_1_revalidation_consistency_and_recovery_without_p1_implementation
"@

function Write-Utf8File {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    $directory = Split-Path -Parent $Path
    if (-not (Test-Path -LiteralPath $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8 -NoNewline
}

function Get-FileSha256 {
    param([Parameter(Mandatory = $true)][string]$Path)

    $stream = [System.IO.File]::OpenRead($Path)
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
        return ([System.BitConverter]::ToString($sha256.ComputeHash($stream))).Replace("-", "").ToLowerInvariant()
    } finally {
        $sha256.Dispose()
        $stream.Dispose()
    }
}

function New-Fixture {
    param([Parameter(Mandatory = $true)][string]$Name)

    $root = Join-Path $smokeRoot $Name
    New-Item -ItemType Directory -Path $root -Force | Out-Null
    $stateArchivePath = Join-Path $root "archive/state.yaml"
    $queueArchivePath = Join-Path $root "archive/queue.yaml"
    Write-Utf8File -Path $stateArchivePath -Content "schemaVersion: 1`nlegacyOne: true`nlegacyTwo: true`n"
    Write-Utf8File -Path $queueArchivePath -Content "schemaVersion: 1`nactiveTasks:`n  - id: old-one`n    status: closed`n  - id: old-two`n    status: ready_for_closeout`n"
    $stateHash = Get-FileSha256 -Path $stateArchivePath
    $queueHash = Get-FileSha256 -Path $queueArchivePath
    $stateBytes = (Get-Item -LiteralPath $stateArchivePath).Length
    $queueBytes = (Get-Item -LiteralPath $queueArchivePath).Length

    Write-Utf8File -Path (Join-Path $root "authorization.md") -Content "Status: approved`n"
    Write-Utf8File -Path (Join-Path $root "serial-plan.md") -Content "# Serial`n$currentTaskId`n$nextTaskId`n"
    Write-Utf8File -Path (Join-Path $root "program-guard.ps1") -Content "Write-Output 'pass'`n"
    Write-Utf8File -Path (Join-Path $root "task-history-index.yaml") -Content "schemaVersion: 1`n"
    Write-Utf8File -Path (Join-Path $root "execution-log-index.yaml") -Content "schemaVersion: 1`n"
    Write-Utf8File -Path (Join-Path $root "history-index.yaml") -Content @"
schemaVersion: 1
archives:
  - id: project-state-before-m2
    path: archive/state.yaml
    sha256: $stateHash
    bytes: $stateBytes
    topLevelKeyCount: 3
  - id: task-queue-before-m2
    path: archive/queue.yaml
    sha256: $queueHash
    bytes: $queueBytes
    activeRecordCount: 2
existingIndexes:
  taskHistoryIndexPath: task-history-index.yaml
  taskQueueArchiveMayPath: task-history-index.yaml
  taskQueueArchiveJunePath: task-history-index.yaml
  taskQueueArchiveJulyPath: task-history-index.yaml
  executionLogIndexPath: execution-log-index.yaml
"@
    Write-Utf8File -Path (Join-Path $root "state.yaml") -Content @"
schemaVersion: 1
project:
  name: tiku
currentPhase: $currentTaskId
updatedAt: "2026-07-13T16:00:00-07:00"
contentAdminPlatformSerialProgram:
  programId: content-admin-platform-b-to-f-2026-07-13
  status: in_progress
  activityStatePolicy: lean_v3_current_program_only
  currentTaskId: $currentTaskId
  nextTaskId: $nextTaskId
  standingAuthorizationSource: authorization.md
  serialPlanPath: serial-plan.md
  guardScriptPath: program-guard.ps1
  historyIndexPath: history-index.yaml
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
currentTask:
  id: $currentTaskId
  status: in_progress
standingAuthorization:
  source: authorization.md
repositoryCheckpoint:
  lastKnownMasterSha: 0123456789abcdef0123456789abcdef01234567
  lastKnownOriginMasterSha: 0123456789abcdef0123456789abcdef01234567
historyPointers:
  index: history-index.yaml
"@
    Write-Utf8File -Path (Join-Path $root "queue.yaml") -Content @"
schemaVersion: 1
contentAdminPlatformSerialProgram:
  programId: content-admin-platform-b-to-f-2026-07-13
  status: in_progress
  activityStatePolicy: lean_v3_current_program_only
  currentTaskId: $currentTaskId
  nextTaskId: $nextTaskId
  standingAuthorizationSource: authorization.md
  serialPlanPath: serial-plan.md
  guardScriptPath: program-guard.ps1
  historyIndexPath: history-index.yaml
  deployment:
    approved: false
    status: blocked_requires_fresh_user_approval
activeTasks:
  - id: $currentTaskId
    status: in_progress
  - id: $nextTaskId
    status: pending
standingAuthorization:
  source: authorization.md
historyPointers:
  index: history-index.yaml
"@

    return $root
}

function Invoke-Guard {
    param([Parameter(Mandatory = $true)][string]$Root)

    return @(
        & $guardPath `
            -RepositoryRoot $Root `
            -ProjectStatePath "state.yaml" `
            -QueuePath "queue.yaml" `
            -SkipGitChecks
    )
}

function New-TerminalFixture {
    param(
        [Parameter(Mandatory = $true)][string]$Name,
        [ValidateSet("in_progress", "closed")][string]$ProgramStatus = "in_progress",
        [ValidateSet("in_progress", "ready_for_closeout", "closed")][string]$TaskStatus = "in_progress"
    )

    $root = New-Fixture -Name $Name
    $statePath = Join-Path $root "state.yaml"
    $queuePath = Join-Path $root "queue.yaml"
    $planPath = Join-Path $root "serial-plan.md"
    $state = Get-Content -LiteralPath $statePath -Raw
    $state = $state.Replace($currentTaskId, $terminalTaskId)
    $state = $state.Replace("nextTaskId: $nextTaskId", 'nextTaskId: ""')
    $state = $state.Replace("  status: in_progress`n  activityStatePolicy:", "  status: $ProgramStatus`n  activityStatePolicy:")
    $state = $state.Replace("currentTask:`n  id: $terminalTaskId`n  status: in_progress", "currentTask:`n  id: $terminalTaskId`n  status: $TaskStatus")
    Set-Content -LiteralPath $statePath -Value $state -Encoding UTF8 -NoNewline
    $queue = Get-Content -LiteralPath $queuePath -Raw
    $queue = $queue.Replace($currentTaskId, $terminalTaskId)
    $queue = $queue.Replace("nextTaskId: $nextTaskId", 'nextTaskId: ""')
    $queue = $queue.Replace("  status: in_progress`n  activityStatePolicy:", "  status: $ProgramStatus`n  activityStatePolicy:")
    $queue = $queue.Replace("  - id: $terminalTaskId`n    status: in_progress", "  - id: $terminalTaskId`n    status: $TaskStatus")
    $queue = $queue.Replace("  - id: $nextTaskId`n    status: pending`n", "")
    Set-Content -LiteralPath $queuePath -Value $queue -Encoding UTF8 -NoNewline
    Write-Utf8File -Path $planPath -Content "# Serial`n$terminalTaskId`n"

    return $root
}

function New-P1SuccessorFixture {
    param([Parameter(Mandatory = $true)][string]$Name)

    $root = New-TerminalFixture -Name $Name -ProgramStatus "closed" -TaskStatus "closed"
    $statePath = Join-Path $root "state.yaml"
    $state = Get-Content -LiteralPath $statePath -Raw
    $state = $state.Replace("currentTask:`n  id: $terminalTaskId`n  status: closed", "p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress`n$closedStartupTaskBlock`ncurrentTask:`n  id: p1-remediation-program-bootstrap-2026-07-16`n  status: in_progress")
    Set-Content -LiteralPath $statePath -Value $state -Encoding UTF8 -NoNewline
    $queuePath = Join-Path $root "queue.yaml"
    $queue = Get-Content -LiteralPath $queuePath -Raw
    $queue = $queue.Replace("activeTasks:`n  - id: $terminalTaskId`n    status: closed", "p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress`nactiveTasks:`n  - id: p1-remediation-program-bootstrap-2026-07-16`n    status: in_progress")
    Set-Content -LiteralPath $queuePath -Value $queue -Encoding UTF8 -NoNewline
    return $root
}

function Assert-FailsWith {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $guardFailed = $false
    try {
        $output = Invoke-Guard -Root $Root
    } catch {
        $guardFailed = $true
        if ($_.Exception.Message -notmatch $Pattern) {
            throw "Expected '$Pattern', got:`n$($_.Exception.Message)"
        }
    }
    if (-not $guardFailed) {
        throw "Negative recovery fixture unexpectedly passed: $Root`n$($output -join "`n")"
    }
}

try {
    $positiveRoot = New-Fixture -Name "positive"
    $positiveOutput = Invoke-Guard -Root $positiveRoot
    if (($positiveOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "Positive fixture did not pass.`n$($positiveOutput -join "`n")"
    }

    $terminalActiveRoot = New-TerminalFixture -Name "terminal-active"
    $terminalActiveOutput = Invoke-Guard -Root $terminalActiveRoot
    if (($terminalActiveOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "Active terminal fixture did not pass.`n$($terminalActiveOutput -join "`n")"
    }

    $terminalReadyRoot = New-TerminalFixture -Name "terminal-ready" -TaskStatus "ready_for_closeout"
    $terminalReadyOutput = Invoke-Guard -Root $terminalReadyRoot
    if (($terminalReadyOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "Ready terminal fixture did not pass.`n$($terminalReadyOutput -join "`n")"
    }

    $terminalClosedRoot = New-TerminalFixture -Name "terminal-closed" -ProgramStatus "closed" -TaskStatus "closed"
    $terminalClosedOutput = Invoke-Guard -Root $terminalClosedRoot
    if (($terminalClosedOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "Closed terminal fixture did not pass.`n$($terminalClosedOutput -join "`n")"
    }

    $closedSuccessorRoot = New-TerminalFixture -Name "closed-successor" -ProgramStatus "closed" -TaskStatus "closed"
    Write-Utf8File -Path (Join-Path $closedSuccessorRoot "successor-authorization.md") -Content "Status: approved`n"
    $closedSuccessorStatePath = Join-Path $closedSuccessorRoot "state.yaml"
    $closedSuccessorState = Get-Content -LiteralPath $closedSuccessorStatePath -Raw
    $closedSuccessorState = $closedSuccessorState.Replace("currentTask:`n  id: $terminalTaskId`n  status: closed", "p0RemediationSerialProgram:`n  programId: p0-remediation-rc-01-to-rc-08-2026-07-14`n  status: in_progress`ncurrentTask:`n  id: $successorTaskId`n  status: in_progress")
    $closedSuccessorState = $closedSuccessorState.Replace("standingAuthorization:`n  source: authorization.md", "standingAuthorization:`n  source: successor-authorization.md")
    Set-Content -LiteralPath $closedSuccessorStatePath -Value $closedSuccessorState -Encoding UTF8 -NoNewline
    $closedSuccessorQueuePath = Join-Path $closedSuccessorRoot "queue.yaml"
    $closedSuccessorQueue = Get-Content -LiteralPath $closedSuccessorQueuePath -Raw
    $closedSuccessorQueue = $closedSuccessorQueue.Replace("activeTasks:`n  - id: $terminalTaskId`n    status: closed", "p0RemediationSerialProgram:`n  programId: p0-remediation-rc-01-to-rc-08-2026-07-14`n  status: in_progress`nactiveTasks:`n  - id: $successorTaskId`n    status: in_progress")
    $closedSuccessorQueue = $closedSuccessorQueue.Replace("standingAuthorization:`n  source: authorization.md", "standingAuthorization:`n  source: successor-authorization.md")
    Set-Content -LiteralPath $closedSuccessorQueuePath -Value $closedSuccessorQueue -Encoding UTF8 -NoNewline
    $closedSuccessorOutput = Invoke-Guard -Root $closedSuccessorRoot
    if (($closedSuccessorOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "Closed-program successor recovery fixture did not pass.`n$($closedSuccessorOutput -join "`n")"
    }

    $p1SuccessorRoot = New-P1SuccessorFixture -Name "p1-successor"
    $p1SuccessorOutput = Invoke-Guard -Root $p1SuccessorRoot
    if (($p1SuccessorOutput -join "`n") -notmatch "recoverySurfaceResult: pass") {
        throw "P1 successor recovery fixture did not pass.`n$($p1SuccessorOutput -join "`n")"
    }

    $activeLegacySuccessorRoot = New-Fixture -Name "active-legacy-p1-successor"
    $activeLegacyStatePath = Join-Path $activeLegacySuccessorRoot "state.yaml"
    $activeLegacyState = Get-Content -LiteralPath $activeLegacyStatePath -Raw
    $activeLegacyState = $activeLegacyState.Replace("currentTask:`n  id: $currentTaskId`n  status: in_progress", "p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress`n$closedStartupTaskBlock`ncurrentTask:`n  id: $currentTaskId`n  status: in_progress")
    Set-Content -LiteralPath $activeLegacyStatePath -Value $activeLegacyState -Encoding UTF8 -NoNewline
    $activeLegacyQueuePath = Join-Path $activeLegacySuccessorRoot "queue.yaml"
    $activeLegacyQueue = Get-Content -LiteralPath $activeLegacyQueuePath -Raw
    $activeLegacyQueue = $activeLegacyQueue.Replace("activeTasks:", "p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress`nactiveTasks:")
    Set-Content -LiteralPath $activeLegacyQueuePath -Value $activeLegacyQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $activeLegacySuccessorRoot -Pattern "RECOVERY_SURFACE_P1_SUCCESSOR_WHILE_LEGACY_ACTIVE"

    $unpairedSuccessorRoot = New-TerminalFixture -Name "unpaired-p1-successor" -ProgramStatus "closed" -TaskStatus "closed"
    $unpairedStatePath = Join-Path $unpairedSuccessorRoot "state.yaml"
    $unpairedState = Get-Content -LiteralPath $unpairedStatePath -Raw
    $unpairedState = $unpairedState.Replace("currentTask:`n  id: $terminalTaskId`n  status: closed", "p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress`ncurrentTask:`n  id: $terminalTaskId`n  status: closed")
    Set-Content -LiteralPath $unpairedStatePath -Value $unpairedState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $unpairedSuccessorRoot -Pattern "RECOVERY_SURFACE_P1_SUCCESSOR_PROJECTION_MISMATCH"

    $orphanedStartupRoot = New-TerminalFixture -Name "orphaned-startup-task" -ProgramStatus "closed" -TaskStatus "closed"
    $orphanedStartupStatePath = Join-Path $orphanedStartupRoot "state.yaml"
    $orphanedStartupState = Get-Content -LiteralPath $orphanedStartupStatePath -Raw
    $orphanedStartupState = $orphanedStartupState.Replace("currentTask:", "lastClosedStartupTask:`n  id: p1-p2-remediation-startup-package-v1-2026-07-15`n  status: closed`ncurrentTask:")
    Set-Content -LiteralPath $orphanedStartupStatePath -Value $orphanedStartupState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $orphanedStartupRoot -Pattern "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_ORPHANED"

    $truncatedStartupRoot = New-P1SuccessorFixture -Name "truncated-startup-task"
    $truncatedStartupStatePath = Join-Path $truncatedStartupRoot "state.yaml"
    $truncatedStartupState = (Get-Content -LiteralPath $truncatedStartupStatePath -Raw).Replace($closedStartupTaskBlock, "lastClosedStartupTask:`n  id: p1-p2-remediation-startup-package-v1-2026-07-15`n  status: closed")
    Set-Content -LiteralPath $truncatedStartupStatePath -Value $truncatedStartupState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $truncatedStartupRoot -Pattern "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_INVALID"

    $missingStartupPackageRoot = New-P1SuccessorFixture -Name "missing-startup-package"
    $missingStartupPackageStatePath = Join-Path $missingStartupPackageRoot "state.yaml"
    $missingStartupPackageState = Get-Content -LiteralPath $missingStartupPackageStatePath -Raw
    $missingStartupPackageState = $missingStartupPackageState -replace '(?ms)^  startupPackage:.*?(?=^  implementationBoundary:)', ''
    Set-Content -LiteralPath $missingStartupPackageStatePath -Value $missingStartupPackageState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $missingStartupPackageRoot -Pattern "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_INVALID"

    $missingBoundaryRoot = New-P1SuccessorFixture -Name "missing-implementation-boundary"
    $missingBoundaryStatePath = Join-Path $missingBoundaryRoot "state.yaml"
    $missingBoundaryState = Get-Content -LiteralPath $missingBoundaryStatePath -Raw
    $missingBoundaryState = $missingBoundaryState -replace '(?ms)^  implementationBoundary:.*?(?=^  currentExecutionGate:)', ''
    Set-Content -LiteralPath $missingBoundaryStatePath -Value $missingBoundaryState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $missingBoundaryRoot -Pattern "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_INVALID"

    $tamperedStartupRoot = New-P1SuccessorFixture -Name "tampered-startup-pointer"
    $tamperedStartupStatePath = Join-Path $tamperedStartupRoot "state.yaml"
    $tamperedStartupState = (Get-Content -LiteralPath $tamperedStartupStatePath -Raw).Replace("sourceMasterSha: 0643ad4d6346453f3324d86b6e003c6726c808ef", "sourceMasterSha: 0000000000000000000000000000000000000000")
    Set-Content -LiteralPath $tamperedStartupStatePath -Value $tamperedStartupState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $tamperedStartupRoot -Pattern "RECOVERY_SURFACE_CLOSED_STARTUP_TASK_INVALID"

    $duplicateStateP1Root = New-P1SuccessorFixture -Name "duplicate-state-p1"
    $duplicateStateP1Path = Join-Path $duplicateStateP1Root "state.yaml"
    $duplicateStateP1 = (Get-Content -LiteralPath $duplicateStateP1Path -Raw).Replace($closedStartupTaskBlock, "p1RemediationSerialProgram:`n  programId: fake-last-wins`n  status: closed`n$closedStartupTaskBlock")
    Set-Content -LiteralPath $duplicateStateP1Path -Value $duplicateStateP1 -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $duplicateStateP1Root -Pattern "RECOVERY_SURFACE_DUPLICATE_TOP_LEVEL_KEY project-state p1RemediationSerialProgram"

    $duplicateQueueP1Root = New-P1SuccessorFixture -Name "duplicate-queue-p1"
    $duplicateQueueP1Path = Join-Path $duplicateQueueP1Root "queue.yaml"
    $duplicateQueueP1 = (Get-Content -LiteralPath $duplicateQueueP1Path -Raw).Replace("activeTasks:", "p1RemediationSerialProgram:`n  programId: fake-last-wins`n  status: closed`nactiveTasks:")
    Set-Content -LiteralPath $duplicateQueueP1Path -Value $duplicateQueueP1 -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $duplicateQueueP1Root -Pattern "RECOVERY_SURFACE_DUPLICATE_TOP_LEVEL_KEY task-queue p1RemediationSerialProgram"

    $duplicateStartupRoot = New-P1SuccessorFixture -Name "duplicate-closed-startup"
    $duplicateStartupStatePath = Join-Path $duplicateStartupRoot "state.yaml"
    $duplicateStartupState = (Get-Content -LiteralPath $duplicateStartupStatePath -Raw).Replace("currentTask:", "$closedStartupTaskBlock`ncurrentTask:")
    Set-Content -LiteralPath $duplicateStartupStatePath -Value $duplicateStartupState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $duplicateStartupRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_TOP_LEVEL_KEY project-state lastClosedStartupTask"

    $wrongP1IdRoot = New-P1SuccessorFixture -Name "wrong-p1-program-id"
    $wrongP1IdStatePath = Join-Path $wrongP1IdRoot "state.yaml"
    $wrongP1IdState = (Get-Content -LiteralPath $wrongP1IdStatePath -Raw).Replace("programId: p1-remediation-2026-07-16", "programId: p1-remediation-fake")
    Set-Content -LiteralPath $wrongP1IdStatePath -Value $wrongP1IdState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $wrongP1IdRoot -Pattern "RECOVERY_SURFACE_P1_SUCCESSOR_ID_INVALID"

    $quotedP1Root = New-P1SuccessorFixture -Name "quoted-p1-key"
    $quotedP1StatePath = Join-Path $quotedP1Root "state.yaml"
    $quotedP1State = (Get-Content -LiteralPath $quotedP1StatePath -Raw).Replace($closedStartupTaskBlock, "`"p1RemediationSerialProgram`":`n  programId: fake-last-wins`n$closedStartupTaskBlock")
    Set-Content -LiteralPath $quotedP1StatePath -Value $quotedP1State -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $quotedP1Root -Pattern "RECOVERY_SURFACE_NONCANONICAL_YAML_KEY"

    $quotedStartupRoot = New-P1SuccessorFixture -Name "quoted-startup-key"
    $quotedStartupStatePath = Join-Path $quotedStartupRoot "state.yaml"
    $quotedStartupState = (Get-Content -LiteralPath $quotedStartupStatePath -Raw).Replace("currentTask:", "`"lastClosedStartupTask`":`n  id: fake-last-wins`ncurrentTask:")
    Set-Content -LiteralPath $quotedStartupStatePath -Value $quotedStartupState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $quotedStartupRoot -Pattern "RECOVERY_SURFACE_NONCANONICAL_YAML_KEY"

    $spacedKeyRoot = New-P1SuccessorFixture -Name "space-before-colon"
    $spacedKeyStatePath = Join-Path $spacedKeyRoot "state.yaml"
    $spacedKeyState = (Get-Content -LiteralPath $spacedKeyStatePath -Raw).Replace($closedStartupTaskBlock, "p1RemediationSerialProgram :`n  programId: fake-last-wins`n$closedStartupTaskBlock")
    Set-Content -LiteralPath $spacedKeyStatePath -Value $spacedKeyState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $spacedKeyRoot -Pattern "RECOVERY_SURFACE_NONCANONICAL_YAML_KEY"

    $mergeKeyRoot = New-P1SuccessorFixture -Name "merge-key"
    $mergeKeyStatePath = Join-Path $mergeKeyRoot "state.yaml"
    $mergeKeyState = (Get-Content -LiteralPath $mergeKeyStatePath -Raw).TrimEnd("`r", "`n") + "`n<<: *successor`n"
    Set-Content -LiteralPath $mergeKeyStatePath -Value $mergeKeyState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $mergeKeyRoot -Pattern "RECOVERY_SURFACE_NONCANONICAL_YAML_KEY"

    $duplicateProgramIdRoot = New-P1SuccessorFixture -Name "duplicate-child-program-id"
    $duplicateProgramIdStatePath = Join-Path $duplicateProgramIdRoot "state.yaml"
    $duplicateProgramIdState = (Get-Content -LiteralPath $duplicateProgramIdStatePath -Raw).Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress", "  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins`n  status: in_progress")
    Set-Content -LiteralPath $duplicateProgramIdStatePath -Value $duplicateProgramIdState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $duplicateProgramIdRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY.*programId"

    $duplicateStatusRoot = New-P1SuccessorFixture -Name "duplicate-child-status"
    $duplicateStatusQueuePath = Join-Path $duplicateStatusRoot "queue.yaml"
    $duplicateStatusQueue = (Get-Content -LiteralPath $duplicateStatusQueuePath -Raw).Replace("  programId: p1-remediation-2026-07-16`n  status: in_progress`nactiveTasks:", "  programId: p1-remediation-2026-07-16`n  status: in_progress`n  status: closed`nactiveTasks:")
    Set-Content -LiteralPath $duplicateStatusQueuePath -Value $duplicateStatusQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $duplicateStatusRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY.*status"

    $fourSpaceChildRoot = New-P1SuccessorFixture -Name "four-space-child-duplicate"
    $fourSpaceChildStatePath = Join-Path $fourSpaceChildRoot "state.yaml"
    $fourSpaceChildState = (Get-Content -LiteralPath $fourSpaceChildStatePath -Raw).Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress", "p1RemediationSerialProgram:`n    programId: p1-remediation-2026-07-16`n    programId: fake-last-wins`n    status: in_progress")
    Set-Content -LiteralPath $fourSpaceChildStatePath -Value $fourSpaceChildState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $fourSpaceChildRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY.*programId"

    $oneSpaceChildRoot = New-P1SuccessorFixture -Name "one-space-child-duplicate"
    $oneSpaceChildQueuePath = Join-Path $oneSpaceChildRoot "queue.yaml"
    $oneSpaceChildQueue = (Get-Content -LiteralPath $oneSpaceChildQueuePath -Raw).Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress", "p1RemediationSerialProgram:`n programId: p1-remediation-2026-07-16`n programId: fake-last-wins`n status: in_progress")
    Set-Content -LiteralPath $oneSpaceChildQueuePath -Value $oneSpaceChildQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $oneSpaceChildRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY.*programId"

    $commentPoisonRoot = New-P1SuccessorFixture -Name "comment-indent-poison"
    $commentPoisonStatePath = Join-Path $commentPoisonRoot "state.yaml"
    $commentPoisonState = (Get-Content -LiteralPath $commentPoisonStatePath -Raw).Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16", "p1RemediationSerialProgram:`n # ignored YAML comment`n  programId: p1-remediation-2026-07-16`n  programId: fake-last-wins")
    Set-Content -LiteralPath $commentPoisonStatePath -Value $commentPoisonState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $commentPoisonRoot -Pattern "RECOVERY_SURFACE_DUPLICATE_MAPPING_KEY.*programId"

    $wrappedProgramRoot = New-P1SuccessorFixture -Name "wrapped-p1-program"
    $wrappedProgramStatePath = Join-Path $wrappedProgramRoot "state.yaml"
    $wrappedProgramState = (Get-Content -LiteralPath $wrappedProgramStatePath -Raw).Replace("p1RemediationSerialProgram:`n  programId: p1-remediation-2026-07-16`n  status: in_progress", "p1RemediationSerialProgram:`n  wrapper:`n    programId: p1-remediation-2026-07-16`n    status: in_progress")
    Set-Content -LiteralPath $wrappedProgramStatePath -Value $wrappedProgramState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $wrappedProgramRoot -Pattern "RECOVERY_SURFACE_P1_SUCCESSOR_ID_INVALID"

    $extraRoot = New-Fixture -Name "extra-active"
    $extraQueue = Get-Content -LiteralPath (Join-Path $extraRoot "queue.yaml") -Raw
    $extraQueue = $extraQueue.Replace("  - id: $nextTaskId`n    status: pending`nstandingAuthorization:", "  - id: $nextTaskId`n    status: pending`n  - id: unexpected`n    status: pending`nstandingAuthorization:")
    Set-Content -LiteralPath (Join-Path $extraRoot "queue.yaml") -Value $extraQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $extraRoot -Pattern "RECOVERY_SURFACE_ACTIVE_TASKS_INVALID"

    $brokenLinkRoot = New-Fixture -Name "broken-link"
    (Get-Content -LiteralPath (Join-Path $brokenLinkRoot "history-index.yaml") -Raw).Replace("archive/state.yaml", "archive/missing.yaml") | Set-Content -LiteralPath (Join-Path $brokenLinkRoot "history-index.yaml") -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $brokenLinkRoot -Pattern "RECOVERY_SURFACE_ARCHIVE_MISSING"

    $hashRoot = New-Fixture -Name "hash-drift"
    Add-Content -LiteralPath (Join-Path $hashRoot "archive/state.yaml") -Value "drift: true"
    Assert-FailsWith -Root $hashRoot -Pattern "RECOVERY_SURFACE_ARCHIVE_(HASH|BYTES)_MISMATCH"

    $deploymentRoot = New-Fixture -Name "deployment"
    (Get-Content -LiteralPath (Join-Path $deploymentRoot "state.yaml") -Raw).Replace("approved: false", "approved: true") | Set-Content -LiteralPath (Join-Path $deploymentRoot "state.yaml") -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $deploymentRoot -Pattern "RECOVERY_SURFACE_DEPLOYMENT_AUTO_AUTHORIZED"

    $nextRoot = New-Fixture -Name "next-mismatch"
    (Get-Content -LiteralPath (Join-Path $nextRoot "queue.yaml") -Raw).Replace("nextTaskId: $nextTaskId", "nextTaskId: content-admin-platform-b1-async-state-primitives-2026-07-13") | Set-Content -LiteralPath (Join-Path $nextRoot "queue.yaml") -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $nextRoot -Pattern "RECOVERY_SURFACE_NEXT_TASK_MISMATCH"

    $nonTerminalEmptyRoot = New-Fixture -Name "non-terminal-empty-next"
    $nonTerminalStatePath = Join-Path $nonTerminalEmptyRoot "state.yaml"
    $nonTerminalQueuePath = Join-Path $nonTerminalEmptyRoot "queue.yaml"
    (Get-Content -LiteralPath $nonTerminalStatePath -Raw).Replace("nextTaskId: $nextTaskId", 'nextTaskId: ""') | Set-Content -LiteralPath $nonTerminalStatePath -Encoding UTF8 -NoNewline
    $nonTerminalQueue = (Get-Content -LiteralPath $nonTerminalQueuePath -Raw).Replace("nextTaskId: $nextTaskId", 'nextTaskId: ""')
    $nonTerminalQueue = $nonTerminalQueue.Replace("  - id: $nextTaskId`n    status: pending`n", "")
    Set-Content -LiteralPath $nonTerminalQueuePath -Value $nonTerminalQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $nonTerminalEmptyRoot -Pattern "RECOVERY_SURFACE_NEXT_TASK_MISMATCH"

    $authorizationRoot = New-Fixture -Name "authorization-mismatch"
    Write-Utf8File -Path (Join-Path $authorizationRoot "other-authorization.md") -Content "Status: approved`n"
    $authorizationState = Get-Content -LiteralPath (Join-Path $authorizationRoot "state.yaml") -Raw
    $authorizationState = $authorizationState.Replace("standingAuthorization:`n  source: authorization.md", "standingAuthorization:`n  source: other-authorization.md")
    Set-Content -LiteralPath (Join-Path $authorizationRoot "state.yaml") -Value $authorizationState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $authorizationRoot -Pattern "RECOVERY_SURFACE_STANDING_AUTHORIZATION_MISMATCH"

    Write-Output "Content admin platform recovery surface smoke passed: 6 positive, 28 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
