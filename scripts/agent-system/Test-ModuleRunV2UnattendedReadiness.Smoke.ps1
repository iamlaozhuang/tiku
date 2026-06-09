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
        throw "Expected output pattern not found: $Pattern"
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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Test-ModuleRunV2UnattendedReadiness.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing unattended readiness script: $scriptPath"
}

$currentBranch = ((& git branch --show-current) -join "").Trim()
$isProtectedBranch = $currentBranch -eq "master" -or $currentBranch -eq "main"

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-unattended-readiness-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $taskId = "module-run-v2-unattended-readiness-smoke"
    $blockedTaskId = "module-run-v2-unattended-readiness-blocked-risk"
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $runRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "runs"
    New-Item -ItemType Directory -Path $runRegistryRoot | Out-Null
    $masterSha = ((& git rev-parse master) -join "").Trim()
    $originMasterSha = ((& git rev-parse origin/master) -join "").Trim()

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $masterSha
  lastKnownOriginMasterSha: $originMasterSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
  - id: $blockedTaskId
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - provider
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    if ($isProtectedBranch) {
        Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH $currentBranch" -Command {
            & $scriptPath `
                -TaskId $taskId `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
                -SkipRemoteAheadCheck
        }
    } else {
        $passOutput = @(
            & $scriptPath `
                -TaskId $taskId `
                -ProjectStatePath $projectStatePath `
                -QueuePath $queuePath `
                -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
                -RunRegistryRoot $runRegistryRoot `
                -SkipRemoteAheadCheck
        )
        Assert-Contains -Output $passOutput -Pattern "Module Run v2 Unattended Readiness"
        Assert-Contains -Output $passOutput -Pattern "unattendedReadinessMode: hard_block"
        Assert-Contains -Output $passOutput -Pattern "runRegistryHeartbeat: wrote"
        Assert-Contains -Output $passOutput -Pattern "unattendedStopDecision: continue"
        Assert-Contains -Output $passOutput -Pattern "Cost Calibration Gate remains blocked"
        $registryFiles = @(Get-ChildItem -LiteralPath $runRegistryRoot -Filter "*.json")
        if ($registryFiles.Count -eq 0) {
            throw "Expected unattended readiness to write a run registry heartbeat."
        }
        $registryText = Get-Content -LiteralPath $registryFiles[0].FullName -Raw
        if ($registryText -notmatch '"status":\s*"active"' -or $registryText -notmatch '"taskId":\s*"module-run-v2-unattended-readiness-smoke"') {
            throw "Expected run registry heartbeat to record active task state."
        }
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_PROTECTED_BRANCH master" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -CurrentBranchOverride "master" -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_REMOTE_AHEAD" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -RemoteAheadCountOverride 1
    }

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: stale-master-sha
  lastKnownOriginMasterSha: stale-origin-sha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_REPOSITORY_SHA_DRIFT" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $masterSha
  lastKnownOriginMasterSha: $originMasterSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_OUT_OF_SCOPE" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "README.md" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_BLOCKED_FILE" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles ".env.local" -SkipRemoteAheadCheck
    }

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_RISK_GATE provider" -Command {
        & $scriptPath -TaskId $blockedTaskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $masterSha
  lastKnownOriginMasterSha: $originMasterSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: done
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
  - id: $blockedTaskId
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - provider
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_UNATTENDED_TASK_STATUS" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -SkipRemoteAheadCheck
    }

    $closeoutRecoveryOutput = @(
        & $scriptPath `
            -TaskId $taskId `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
            -CloseoutRecovery `
            -AllowProtectedBranch `
            -SkipRemoteAheadCheck
    )
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "closeoutRecovery: enabled"
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "OK_CLOSEOUT_RECOVERY_TASK_STATUS"
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "unattendedStopDecision: closeout_recovery"

    $ancestorSha = ((& git rev-parse origin/master~1) -join "").Trim()
    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    $ancestorRecoveryOutput = @(
        & $scriptPath `
            -TaskId $taskId `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
            -CloseoutRecovery `
            -AllowProtectedBranch `
            -SkipRemoteAheadCheck
    )
    Assert-Contains -Output $ancestorRecoveryOutput -Pattern "OK_CLOSEOUT_RECOVERY_SHA_ANCESTOR master"
    Assert-Contains -Output $ancestorRecoveryOutput -Pattern "OK_CLOSEOUT_RECOVERY_SHA_ANCESTOR origin/master"
    Assert-Contains -Output $ancestorRecoveryOutput -Pattern "unattendedStopDecision: closeout_recovery"

    $cleanWorktreePath = Join-Path -Path $fixtureRoot -ChildPath "clean-worktree"
    try {
        & git worktree add --detach $cleanWorktreePath HEAD | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create clean smoke worktree."
        }

        Push-Location -LiteralPath $cleanWorktreePath
        try {
            $cleanCloseoutRecoveryOutput = @(
                & $scriptPath `
                    -TaskId $taskId `
                    -ProjectStatePath $projectStatePath `
                    -QueuePath $queuePath `
                    -MatrixPath (Join-Path -Path $cleanWorktreePath -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml") `
                    -RunRegistryRoot $runRegistryRoot `
                    -CloseoutRecovery `
                    -AllowProtectedBranch `
                    -SkipRemoteAheadCheck
            )
        } finally {
            Pop-Location
        }
    } finally {
        if (Test-Path -LiteralPath $cleanWorktreePath) {
            & git worktree remove -f $cleanWorktreePath | Out-Null
        }
    }
    Assert-Contains -Output $cleanCloseoutRecoveryOutput -Pattern "filesToScan: 0"
    Assert-Contains -Output $cleanCloseoutRecoveryOutput -Pattern "runRegistryHeartbeat: wrote"
    Assert-Contains -Output $cleanCloseoutRecoveryOutput -Pattern "unattendedStopDecision: closeout_recovery"

    $candidateTaskId = "module-run-v2-ai-task-and-provider-planning"
    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: $ancestorSha
  lastKnownOriginMasterSha: $ancestorSha
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: done
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
  - id: $candidateTaskId
    status: pending
    taskKind: implementation_planning
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/task-plans/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - queue_planning
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-ai-task-and-provider-planning.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $postCloseoutHandoffOutput = @(
        & $scriptPath `
            -TaskId $candidateTaskId `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" `
            -AllowProtectedBranch `
            -SkipRemoteAheadCheck
    )
    Assert-Contains -Output $postCloseoutHandoffOutput -Pattern "OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR master"
    Assert-Contains -Output $postCloseoutHandoffOutput -Pattern "OK_POST_CLOSEOUT_HANDOFF_SHA_ANCESTOR origin/master"
    Assert-Contains -Output $postCloseoutHandoffOutput -Pattern "unattendedStopDecision: continue"

    @"
schemaVersion: 1
repository:
  lastKnownMasterSha: not-a-valid-ancestor
  lastKnownOriginMasterSha: not-a-valid-ancestor
currentTask:
  id: $taskId
"@ | Set-Content -LiteralPath $projectStatePath -Encoding UTF8

    Invoke-ExpectFailure -ExpectedPattern "HARD_BLOCK_REPOSITORY_SHA_DRIFT" -Command {
        & $scriptPath -TaskId $taskId -ProjectStatePath $projectStatePath -QueuePath $queuePath -ChangedFiles "scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1" -CloseoutRecovery -AllowProtectedBranch -SkipRemoteAheadCheck
    }

    $dirtyProbePath = Join-Path -Path $PSScriptRoot -ChildPath "module-run-v2-unattended-readiness-smoke.tmp"
    try {
        "dirty probe" | Set-Content -LiteralPath $dirtyProbePath -Encoding UTF8
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $dirtyRecoveryOutput = @(
                & powershell.exe `
                    -NoProfile `
                    -ExecutionPolicy Bypass `
                    -File $scriptPath `
                    -TaskId $taskId `
                    -ProjectStatePath $projectStatePath `
                    -QueuePath $queuePath `
                    -CloseoutRecovery `
                    -AllowProtectedBranch `
                    -SkipRemoteAheadCheck 2>&1
            )
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
    } finally {
        if (Test-Path -LiteralPath $dirtyProbePath) {
            Remove-Item -LiteralPath $dirtyProbePath -Force
        }
    }
    Assert-Contains -Output $dirtyRecoveryOutput -Pattern "HARD_BLOCK_CLOSEOUT_RECOVERY_DIRTY_WORKTREE"

    @"
schemaVersion: 1
tasks:
  - id: $taskId
    status: done
    taskKind: implementation
    humanApproval: User approved only the local implementation; closeout approval is supplied after status done.
    allowedFiles:
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.ps1
      - scripts/agent-system/Test-ModuleRunV2UnattendedReadiness.Smoke.ps1
      - docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    blockedFiles:
      - .env.local
      - package.json
      - src/**
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-unattended-automation-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-unattended-automation-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $approvedDirtyProbePath = Join-Path -Path $PSScriptRoot -ChildPath "module-run-v2-unattended-readiness-approved-closeout.tmp"
    try {
        "approved dirty probe" | Set-Content -LiteralPath $approvedDirtyProbePath -Encoding UTF8
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $approvedDirtyRecoveryOutput = @(
                & powershell.exe `
                    -NoProfile `
                    -ExecutionPolicy Bypass `
                    -File $scriptPath `
                    -TaskId $taskId `
                    -ProjectStatePath $projectStatePath `
                    -QueuePath $queuePath `
                    -CloseoutRecovery `
                    -CloseoutAuthorizationStatement "User approved this completed task to commit, merge into master, push origin/master, perform short-lived branch cleanup, and park the automation worktree after validation." `
                    -AllowProtectedBranch `
                    -SkipRemoteAheadCheck 2>&1
            )
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
    } finally {
        if (Test-Path -LiteralPath $approvedDirtyProbePath) {
            Remove-Item -LiteralPath $approvedDirtyProbePath -Force
        }
    }
    Assert-Contains -Output $approvedDirtyRecoveryOutput -Pattern "OK_APPROVED_CLOSEOUT_DIRTY_WORKTREE"
    Assert-Contains -Output $approvedDirtyRecoveryOutput -Pattern "approvedCloseoutContinuation: enabled"
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 unattended readiness smoke passed"
