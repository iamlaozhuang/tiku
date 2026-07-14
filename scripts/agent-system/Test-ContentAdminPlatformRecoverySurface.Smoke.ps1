param()

$ErrorActionPreference = "Stop"

$guardPath = Join-Path $PSScriptRoot "Test-ContentAdminPlatformRecoverySurface.ps1"
$smokeRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("tiku-recovery-surface-" + [guid]::NewGuid().ToString("N"))
$currentTaskId = "content-admin-platform-m2-active-state-slimming-2026-07-13"
$nextTaskId = "content-admin-platform-b0-contract-code-mapping-2026-07-13"
$terminalTaskId = "content-admin-platform-f5-final-cumulative-audit-2026-07-13"

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
        throw "Negative recovery fixture unexpectedly passed.`n$($output -join "`n")"
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

    $terminalExtraRoot = New-TerminalFixture -Name "terminal-extra-active"
    $terminalExtraQueuePath = Join-Path $terminalExtraRoot "queue.yaml"
    $terminalExtraQueue = Get-Content -LiteralPath $terminalExtraQueuePath -Raw
    $terminalExtraQueue = $terminalExtraQueue.Replace("standingAuthorization:", "  - id: unexpected`n    status: pending`nstandingAuthorization:")
    Set-Content -LiteralPath $terminalExtraQueuePath -Value $terminalExtraQueue -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $terminalExtraRoot -Pattern "RECOVERY_SURFACE_ACTIVE_TASKS_INVALID"

    $terminalStatusRoot = New-TerminalFixture -Name "terminal-status-mismatch" -ProgramStatus "closed" -TaskStatus "closed"
    $terminalStatusStatePath = Join-Path $terminalStatusRoot "state.yaml"
    $terminalStatusState = Get-Content -LiteralPath $terminalStatusStatePath -Raw
    $terminalStatusState = $terminalStatusState.Replace("currentTask:`n  id: $terminalTaskId`n  status: closed", "currentTask:`n  id: $terminalTaskId`n  status: in_progress")
    Set-Content -LiteralPath $terminalStatusStatePath -Value $terminalStatusState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $terminalStatusRoot -Pattern "RECOVERY_SURFACE_TERMINAL_STATUS_INVALID"

    $authorizationRoot = New-Fixture -Name "authorization-mismatch"
    Write-Utf8File -Path (Join-Path $authorizationRoot "other-authorization.md") -Content "Status: approved`n"
    $authorizationState = Get-Content -LiteralPath (Join-Path $authorizationRoot "state.yaml") -Raw
    $authorizationState = $authorizationState.Replace("standingAuthorization:`n  source: authorization.md", "standingAuthorization:`n  source: other-authorization.md")
    Set-Content -LiteralPath (Join-Path $authorizationRoot "state.yaml") -Value $authorizationState -Encoding UTF8 -NoNewline
    Assert-FailsWith -Root $authorizationRoot -Pattern "RECOVERY_SURFACE_STANDING_AUTHORIZATION_MISMATCH"

    Write-Output "Content admin platform recovery surface smoke passed: 4 positive, 9 negative"
} finally {
    if (Test-Path -LiteralPath $smokeRoot) {
        Remove-Item -LiteralPath $smokeRoot -Recurse -Force
    }
}
