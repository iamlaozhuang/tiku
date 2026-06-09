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
        throw "Expected output pattern not found: $Pattern`nActual output:`n$($Output -join "`n")"
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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2Autopilot.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing autopilot orchestrator script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-autopilot-" + [guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    $handoffPath = Join-Path -Path $fixtureRoot -ChildPath "handoff.md"

    $continueOutput = @(& $scriptPath -CompletedBatchCount 2 -SkipUnattendedReadiness -HandoffPath $handoffPath -CloseoutAuthorizationStatement "User approved this completed task to commit, merge into master, push origin/master, perform short-lived branch cleanup, and park the automation worktree after validation.")
    Assert-Contains -Output $continueOutput -Pattern "autopilotDecision: continue_current_thread"

    $suggestOutput = @(& $scriptPath -CompletedBatchCount 4 -SkipUnattendedReadiness -HandoffPath $handoffPath)
    Assert-Contains -Output $suggestOutput -Pattern "autopilotDecision: prepare_handoff_then_continue"
    Assert-Contains -Output $suggestOutput -Pattern "nextModuleRunCandidate: ai-task-and-provider"

    Invoke-ExpectFailure -ExpectedPattern "autopilotDecision: stop_for_human_handoff" -Command {
        & $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath
    }

    $launchOutput = @(& $scriptPath -CompletedBatchCount 6 -SkipUnattendedReadiness -HandoffPath $handoffPath -ThreadLaunchApproved -ThreadToolAvailable)
    Assert-Contains -Output $launchOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $launchOutput -Pattern "handoffPath:"
    Assert-Contains -Output $launchOutput -Pattern "Cost Calibration Gate remains blocked"

    $taskId = "module-run-v2-autopilot-closeout-recovery-smoke"
    $projectStatePath = Join-Path -Path $fixtureRoot -ChildPath "project-state.yaml"
    $queuePath = Join-Path -Path $fixtureRoot -ChildPath "task-queue.yaml"
    $ancestorSha = ((& git rev-parse origin/master~1) -join "").Trim()

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
      - scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-08-module-run-v2-autopilot-orchestration-control.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-08-module-run-v2-autopilot-orchestration-control.md
"@ | Set-Content -LiteralPath $queuePath -Encoding UTF8

    $closeoutRecoveryOutput = @(
        & $scriptPath `
            -TaskId $taskId `
            -CompletedBatchCount 6 `
            -CloseoutRecovery `
            -ProjectStatePath $projectStatePath `
            -QueuePath $queuePath `
            -ReadinessChangedFiles "scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1" `
            -AllowProtectedBranch `
            -HandoffPath $handoffPath `
            -ThreadLaunchApproved `
            -ThreadToolAvailable
    )
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $closeoutRecoveryOutput -Pattern "nextModuleRunCandidate: ai-task-and-provider"

    $cleanWorktreePath = Join-Path -Path $fixtureRoot -ChildPath "clean-autopilot-worktree"
    try {
        & git worktree add --detach $cleanWorktreePath HEAD | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to create clean autopilot smoke worktree."
        }

        Push-Location -LiteralPath $cleanWorktreePath
        try {
            $cleanDryRunCloseoutOutput = @(
                & $scriptPath `
                    -TaskId $taskId `
                    -CompletedBatchCount 6 `
                    -CloseoutRecovery `
                    -ProjectStatePath $projectStatePath `
                    -QueuePath $queuePath `
                    -HandoffPath $handoffPath `
                    -DryRunHandoff `
                    -ThreadLaunchApproved `
                    -ThreadToolAvailable
            )
        } finally {
            Pop-Location
        }
    } finally {
        if (Test-Path -LiteralPath $cleanWorktreePath) {
            & git worktree remove -f $cleanWorktreePath | Out-Null
        }
    }
    Assert-Contains -Output $cleanDryRunCloseoutOutput -Pattern "dryRunHandoff: enabled"
    Assert-Contains -Output $cleanDryRunCloseoutOutput -Pattern "autopilotDecision: launch_new_thread"

    $repoHandoffPath = Join-Path -Path $fixtureRoot -ChildPath "repo-handoff.md"
    $dryRunLaunchOutput = @(
        & $scriptPath `
            -CompletedBatchCount 6 `
            -SkipUnattendedReadiness `
            -HandoffPath $repoHandoffPath `
            -DryRunHandoff `
            -ThreadLaunchApproved `
            -ThreadToolAvailable
    )
    Assert-Contains -Output $dryRunLaunchOutput -Pattern "autopilotDecision: launch_new_thread"
    Assert-Contains -Output $dryRunLaunchOutput -Pattern "dryRunHandoff: enabled"
    if (Test-Path -LiteralPath $repoHandoffPath) {
        throw "Dry-run autopilot handoff must not write the requested repository handoff path."
    }

    $startupRepo = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-repo"
    $startupWorktreeRoot = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-worktrees"
    $startupRunRegistryRoot = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-runs"
    $startupHandoffRoot = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-handoffs"
    New-Item -ItemType Directory -Path $startupRepo, $startupWorktreeRoot, $startupRunRegistryRoot, $startupHandoffRoot | Out-Null
    & git -C $startupRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize autopilot startup cleanup fixture repository."
    }
    Set-Content -LiteralPath (Join-Path -Path $startupRepo -ChildPath "README.md") -Value "autopilot startup baseline" -Encoding UTF8
    & git -C $startupRepo add README.md | Out-Null
    & git -C $startupRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "autopilot startup baseline" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to commit autopilot startup cleanup baseline."
    }
    $autopilotStaleWorktreePath = Join-Path -Path $startupWorktreeRoot -ChildPath "stale-clean"
    & git -C $startupRepo worktree add -b codex/autopilot-stale-clean-smoke $autopilotStaleWorktreePath HEAD | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create autopilot startup cleanup stale worktree."
    }
    Set-Content -LiteralPath (Join-Path -Path $startupRepo -ChildPath "README.md") -Value "autopilot startup advanced" -Encoding UTF8
    & git -C $startupRepo add README.md | Out-Null
    & git -C $startupRepo -c user.name="Tiku Smoke" -c user.email="tiku-smoke@example.invalid" commit -m "autopilot startup advanced" | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to advance autopilot startup cleanup fixture."
    }
    $startupOriginMasterSha = ((& git -C $startupRepo rev-parse HEAD) -join "").Trim()
    & git -C $startupRepo update-ref refs/remotes/origin/master $startupOriginMasterSha
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create autopilot startup cleanup origin/master ref."
    }

    $startupProjectStatePath = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-project-state.yaml"
    $startupQueuePath = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-task-queue.yaml"
    $startupMatrixPath = Join-Path -Path $fixtureRoot -ChildPath "startup-cleanup-matrix.yaml"
    @"
schemaVersion: 2
moduleRunVersion: 2
automationHandoffPolicy:
  startupReadiness: required
threadRolloverGate:
  enabled: true
terminologyAnchors:
  - Cost Calibration Gate remains blocked
"@ | Set-Content -LiteralPath $startupMatrixPath -Encoding UTF8

    @"
schemaVersion: 1
automation:
  unattendedControl:
    remoteAutomationApproval: lease_guarded_local_readiness_and_planning
repository:
  lastKnownMasterSha: $startupOriginMasterSha
  lastKnownOriginMasterSha: $startupOriginMasterSha
currentTask:
  id: module-run-v2-autopilot-startup-cleanup-smoke
  commitSha: $startupOriginMasterSha
"@ | Set-Content -LiteralPath $startupProjectStatePath -Encoding UTF8

    @"
schemaVersion: 1
tasks:
  - id: module-run-v2-autopilot-startup-cleanup-smoke
    status: in_progress
    taskKind: implementation
    allowedFiles:
      - scripts/agent-system/Invoke-ModuleRunV2Autopilot.ps1
    blockedFiles:
      - .env.local
    riskTypes:
      - automation_policy
    validationCommands:
      - git diff --check
    evidencePath: docs/05-execution-logs/evidence/2026-06-09-module-run-v2-autopilot-startup-cleanup-smoke.md
    auditReviewPath: docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-autopilot-startup-cleanup-smoke.md
"@ | Set-Content -LiteralPath $startupQueuePath -Encoding UTF8

    Push-Location -LiteralPath $startupRepo
    try {
        $startupCleanupOutput = @(
            & $scriptPath `
                -RunStartupReadiness `
                -StartupProjectStatePath $startupProjectStatePath `
                -StartupQueuePath $startupQueuePath `
                -StartupMatrixPath $startupMatrixPath `
                -StartupAutomationWorktreeRoot $startupWorktreeRoot `
                -StartupRunRegistryRoot $startupRunRegistryRoot `
                -StartupHandoffRoot $startupHandoffRoot `
                -AllowProtectedBranch `
                -SkipUnattendedReadiness `
                -CompletedBatchCount 2 `
                -HandoffPath $handoffPath
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $startupCleanupOutput -Pattern "startupDecision: cleanup_stale_artifacts"
    Assert-Contains -Output $startupCleanupOutput -Pattern "stoppedAutomationHygieneDecision: cleanup_completed"
    Assert-Contains -Output $startupCleanupOutput -Pattern "autopilotDecision: continue_current_thread"

    $policyRepo = Join-Path -Path $fixtureRoot -ChildPath "policy-closeout-repo"
    $policyOriginRoot = Join-Path -Path $fixtureRoot -ChildPath "policy-closeout-origin.git"
    New-Item -ItemType Directory -Path $policyRepo | Out-Null
    & git init --bare $policyOriginRoot | Out-Null
    & git -C $policyRepo init | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to initialize autopilot policy closeout fixture repository."
    }

    Push-Location -LiteralPath $policyRepo
    try {
        & git config user.name "Codex"
        & git config user.email "codex@example.com"
        & git config core.autocrlf false
        & git remote add origin $policyOriginRoot

        New-Item -ItemType Directory -Path "docs/04-agent-system/state" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs/05-execution-logs/evidence" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs/05-execution-logs/audits-reviews" -Force | Out-Null

        @(
            "schemaVersion: 2",
            "moduleRunVersion: 2",
            "automationHandoffPolicy:",
            "  autopilotDecisionLabels:",
            "    closeout_executed: approved closeout executed",
            "threadRolloverGate:",
            "  purpose: smoke",
            "terminologyAnchors:",
            "  - Cost Calibration Gate remains blocked",
            "Cost Calibration Gate remains blocked"
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml" -Encoding UTF8

        @(
            '# Autopilot Policy Closeout Smoke Evidence',
            'result: pass',
            'RED: recorded',
            'GREEN: recorded',
            'Commit: `abcdef3`',
            'localFullLoopGate: L2',
            'blocked remainder: Cost Calibration Gate remains blocked',
            'threadRolloverGate: continue_current_thread',
            'nextModuleRunCandidate: ai-task-and-provider',
            'git diff --check',
            'Cost Calibration Gate remains blocked'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/evidence/policy-closeout-smoke.md" -Encoding UTF8

        @(
            '# Autopilot Policy Closeout Smoke Audit',
            'APPROVE'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/audits-reviews/policy-closeout-smoke.md" -Encoding UTF8

        @(
            'schemaVersion: 1',
            'tasks:',
            '  - id: module-run-v2-autopilot-policy-closeout-smoke',
            '    title: Autopilot Policy Closeout Smoke',
            '    status: ready_for_closeout',
            '    taskKind: implementation',
            '    closeoutPolicy:',
            '      localCommit: approved',
            '      fastForwardMerge:',
            '        approved: true',
            '        targetBranch: master',
            '      push:',
            '        approved: true',
            '        target: origin/master',
            '      cleanup:',
            '        deleteShortBranch: true',
            '        parkWorktree: true',
            '    allowedFiles:',
            '      - docs/04-agent-system/state/project-state.yaml',
            '      - docs/04-agent-system/state/task-queue.yaml',
            '      - docs/05-execution-logs/evidence/policy-closeout-smoke.md',
            '      - docs/05-execution-logs/audits-reviews/policy-closeout-smoke.md',
            '    blockedFiles:',
            '      - .env.local',
            '      - src/**',
            '    riskTypes:',
            '      - automation_policy',
            '    validationCommands:',
            '      - git diff --check',
            '    evidencePath: docs/05-execution-logs/evidence/policy-closeout-smoke.md',
            '    auditReviewPath: docs/05-execution-logs/audits-reviews/policy-closeout-smoke.md'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Encoding UTF8

        @(
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-autopilot-policy-closeout-smoke',
            'updatedAt: "2026-06-09T09:20:00-07:00"',
            'repository:',
            '  lastKnownMasterSha: initial',
            '  lastKnownOriginMasterSha: initial',
            'currentTask:',
            '  id: module-run-v2-autopilot-policy-closeout-smoke',
            '  status: ready_for_closeout',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/policy-closeout-smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/policy-closeout-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/policy-closeout-smoke.md',
            '  branch: codex/module-run-v2-autopilot-policy-closeout-smoke',
            '  commitSha: pending-local-commit'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8

        & git add .
        & git commit -m "chore(smoke): seed autopilot policy closeout fixture" | Out-Null
        & git branch -M master
        & git push -u origin master | Out-Null
        if ($LASTEXITCODE -ne 0) {
            throw "Failed to push autopilot policy closeout baseline."
        }

        $policyInitialSha = ((& git rev-parse HEAD) -join "").Trim()
        @(
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-autopilot-policy-closeout-smoke',
            'updatedAt: "2026-06-09T09:20:00-07:00"',
            'repository:',
            "  lastKnownMasterSha: $policyInitialSha",
            "  lastKnownOriginMasterSha: $policyInitialSha",
            'currentTask:',
            '  id: module-run-v2-autopilot-policy-closeout-smoke',
            '  status: ready_for_closeout',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/policy-closeout-smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/policy-closeout-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/policy-closeout-smoke.md',
            '  branch: codex/module-run-v2-autopilot-policy-closeout-smoke',
            '  commitSha: pending-local-commit'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8
        & git add "docs/04-agent-system/state/project-state.yaml"
        & git commit -m "chore(smoke): sync autopilot policy closeout sha" | Out-Null
        & git push origin master | Out-Null

        & git switch -c codex/module-run-v2-autopilot-policy-closeout-smoke | Out-Null
        Add-Content -LiteralPath "docs/05-execution-logs/evidence/policy-closeout-smoke.md" -Value "dirty policy closeout work"

        $policyProjectStatePath = Join-Path -Path $policyRepo -ChildPath "docs/04-agent-system/state/project-state.yaml"
        $policyQueuePath = Join-Path -Path $policyRepo -ChildPath "docs/04-agent-system/state/task-queue.yaml"
        $policyMatrixPath = Join-Path -Path $policyRepo -ChildPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml"
        $policyCloseoutOutput = @(
            & $scriptPath `
                -TaskId "module-run-v2-autopilot-policy-closeout-smoke" `
                -CompletedBatchCount 2 `
                -CloseoutRecovery `
                -ProjectStatePath $policyProjectStatePath `
                -QueuePath $policyQueuePath `
                -MatrixPath $policyMatrixPath 2>&1
        )
    } finally {
        Pop-Location
    }
    Assert-Contains -Output $policyCloseoutOutput -Pattern "closeoutAuthorizationSource: structuredCloseoutPolicy"
    Assert-Contains -Output $policyCloseoutOutput -Pattern "autopilotDecision: closeout_executed"
    Assert-Contains -Output $policyCloseoutOutput -Pattern "automationWorktreeParking: detached origin/master"

} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 autopilot smoke passed"
