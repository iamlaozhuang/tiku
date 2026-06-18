$ErrorActionPreference = "Stop"

function Assert-Contains {
    param(
        [Parameter(Mandatory = $true)][AllowEmptyCollection()][AllowEmptyString()][string[]]$Output,
        [Parameter(Mandatory = $true)][string]$Pattern
    )

    $matched = $Output | Where-Object { $_ -match $Pattern }
    if ($matched.Count -eq 0) {
        throw "Expected output pattern not found: $Pattern"
    }
}

function Initialize-FakeNodeTooling {
    param([Parameter(Mandatory = $true)][string]$Root)

    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\.bin") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\typescript") -Force | Out-Null
    New-Item -ItemType Directory -Path (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin") -Force | Out-Null
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\eslint.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\tsc.cmd") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\.bin\prettier.cmd") -Encoding ASCII
    "{}" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\typescript\package.json") -Encoding ASCII
    "fake" | Set-Content -LiteralPath (Join-Path -Path $Root -ChildPath "node_modules\prettier\bin\prettier.cjs") -Encoding ASCII

    $fakeBin = Join-Path -Path $Root -ChildPath "fake-bin"
    New-Item -ItemType Directory -Path $fakeBin -Force | Out-Null
    @"
@echo off
if "%1"=="run" if "%2"=="lint" (
  echo lint ok
  exit /b 0
)
if "%1"=="run" if "%2"=="typecheck" (
  echo typecheck ok
  exit /b 0
)
exit /b 9
"@ | Set-Content -LiteralPath (Join-Path -Path $fakeBin -ChildPath "npm.cmd") -Encoding ASCII

    return $fakeBin
}

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2ApprovedCloseout.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing approved closeout script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-approved-closeout-" + [guid]::NewGuid().ToString("N"))
$originRoot = Join-Path -Path $fixtureRoot -ChildPath "origin.git"
$repoRoot = Join-Path -Path $fixtureRoot -ChildPath "repo"
$handoffRoot = Join-Path -Path $fixtureRoot -ChildPath "handoffs"
$originalPath = $env:Path

New-Item -ItemType Directory -Path $fixtureRoot | Out-Null

try {
    & git init --bare $originRoot | Out-Null
    & git init $repoRoot | Out-Null

    Push-Location -LiteralPath $repoRoot
    try {
        & git config user.name "Codex"
        & git config user.email "codex@example.com"
        & git config core.autocrlf false
        & git remote add origin $originRoot

        New-Item -ItemType Directory -Path "docs/04-agent-system/state" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs/05-execution-logs/evidence" -Force | Out-Null
        New-Item -ItemType Directory -Path "docs/05-execution-logs/audits-reviews" -Force | Out-Null
        "node_modules/" | Set-Content -LiteralPath ".gitignore" -Encoding UTF8
        '{"scripts":{"lint":"eslint","typecheck":"tsc --noEmit"}}' | Set-Content -LiteralPath "package.json" -Encoding UTF8
        $fakeBin = Initialize-FakeNodeTooling -Root $repoRoot
        $env:Path = "$fakeBin;$originalPath"

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
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-closeout-continuity-hardening',
            'updatedAt: "2026-06-09T08:05:00-07:00"',
            'repository:',
            '  lastKnownMasterSha: initial',
            '  lastKnownOriginMasterSha: initial',
            'currentTask:',
            '  id: module-run-v2-closeout-smoke',
            '  status: done',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/approved-closeout-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/approved-closeout-smoke.md',
            '  branch: codex/module-run-v2-closeout-smoke',
            '  commitSha: pending-local-commit'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8

        @(
            'schemaVersion: 1',
            'tasks:',
            '  - id: module-run-v2-closeout-smoke',
            '    title: Approved Closeout Smoke',
            '    status: done',
            '    taskKind: implementation',
            '    humanApproval: User approved only the local implementation; closeout approval is supplied after status done.',
            '    allowedFiles:',
            '      - docs/04-agent-system/state/project-state.yaml',
            '      - docs/04-agent-system/state/task-queue.yaml',
            '      - docs/05-execution-logs/evidence/approved-closeout-smoke.md',
            '      - docs/05-execution-logs/audits-reviews/approved-closeout-smoke.md',
            '    blockedFiles:',
            '      - .env.local',
            '      - src/**',
            '    riskTypes:',
            '      - automation_policy',
            '    validationCommands:',
            '      - git diff --check',
            '    evidencePath: docs/05-execution-logs/evidence/approved-closeout-smoke.md',
            '    auditReviewPath: docs/05-execution-logs/audits-reviews/approved-closeout-smoke.md'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Encoding UTF8

        @(
            '# Approved Closeout Smoke Evidence',
            'result: pass',
            'RED: recorded',
            'GREEN: recorded',
            'Commit: `abcdef1`',
            'localFullLoopGate: L2',
            'blocked remainder: Cost Calibration Gate remains blocked',
            'threadRolloverGate: continue_current_thread',
            'nextModuleRunCandidate: no-executable-task-seed-or-approve-next-task',
            'git diff --check',
            'Cost Calibration Gate remains blocked'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/evidence/approved-closeout-smoke.md" -Encoding UTF8

        @(
            '# Approved Closeout Smoke Audit',
            'APPROVE'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/audits-reviews/approved-closeout-smoke.md" -Encoding UTF8

        & git add .
        & git commit -m "chore(smoke): seed approved closeout fixture" | Out-Null
        & git branch -M master
        & git push -u origin master | Out-Null

        $initialSha = ((& git rev-parse HEAD) -join "").Trim()
        (Get-Content -Raw "docs/04-agent-system/state/project-state.yaml").Replace("lastKnownMasterSha: initial", "lastKnownMasterSha: $initialSha").Replace("lastKnownOriginMasterSha: initial", "lastKnownOriginMasterSha: $initialSha") | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8
        & git add "docs/04-agent-system/state/project-state.yaml"
        & git commit -m "chore(smoke): sync fixture sha" | Out-Null
        & git push origin master | Out-Null

        & git switch -c codex/module-run-v2-closeout-smoke | Out-Null
        "closeout ready" | Set-Content -LiteralPath "docs/05-execution-logs/evidence/closeout-note.txt" -Encoding UTF8
        $queueText = Get-Content -Raw "docs/04-agent-system/state/task-queue.yaml"
        $queueText = $queueText.Replace("      - docs/05-execution-logs/evidence/approved-closeout-smoke.md", "      - docs/05-execution-logs/evidence/approved-closeout-smoke.md`r`n      - docs/05-execution-logs/evidence/closeout-note.txt")
        Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Value $queueText -Encoding UTF8

        $output = @(
            & $scriptPath `
                -TaskId "module-run-v2-closeout-smoke" `
                -ProjectStatePath "docs/04-agent-system/state/project-state.yaml" `
                -QueuePath "docs/04-agent-system/state/task-queue.yaml" `
                -MatrixPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml" `
                -CloseoutAuthorizationStatement "User approved this completed task to commit, merge into master, push origin/master, perform short-lived branch cleanup, and park the automation worktree after validation." 2>&1
        )

        Assert-Contains -Output $output -Pattern "approvedCloseoutContinuation: enabled"
        Assert-Contains -Output $output -Pattern "closeoutAuthorizationSource: statement"
        Assert-Contains -Output $output -Pattern "mergeTarget: master"
        Assert-Contains -Output $output -Pattern "pushTarget: origin/master"
        Assert-Contains -Output $output -Pattern "automationWorktreeParking: detached origin/master"
        Assert-Contains -Output $output -Pattern "branchCleanup: deleted codex/module-run-v2-closeout-smoke"
        Assert-Contains -Output $output -Pattern "postCloseoutStateCheckpoint: accepted_ancestor_checkpoint"
        Assert-Contains -Output $output -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"
        Assert-Contains -Output $output -Pattern "finalHandoffShaPolicy: final_handoff_or_project_state"

        $queueAfter = Get-Content -Raw "docs/04-agent-system/state/task-queue.yaml"
        if ($queueAfter -notmatch "status:\s*closed") {
            throw "Expected closeout script to mark task status closed."
        }

        $branchAfter = ((& git branch --show-current) -join "").Trim()
        if (-not [string]::IsNullOrWhiteSpace($branchAfter)) {
            throw "Expected approved closeout smoke worktree to be detached."
        }

        & git switch master | Out-Null

        $projectStateText = @(
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-clean-ahead-closeout-smoke',
            'updatedAt: "2026-06-09T08:45:00-07:00"',
            'repository:',
            "  lastKnownMasterSha: $initialSha",
            "  lastKnownOriginMasterSha: $initialSha",
            'currentTask:',
            '  id: module-run-v2-clean-ahead-closeout-smoke',
            '  status: ready_for_closeout',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/clean-ahead-smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/clean-ahead-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/clean-ahead-smoke.md',
            '  branch: codex/module-run-v2-clean-ahead-closeout-smoke',
            '  commitSha: pending-local-commit'
        )
        $projectStateText | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8

        $queueText = @(
            'schemaVersion: 1',
            'tasks:',
            '  - id: module-run-v2-clean-ahead-closeout-smoke',
            '    title: Approved Closeout Clean Ahead Smoke',
            '    status: ready_for_closeout',
            '    taskKind: implementation',
            '    closeoutPolicy:',
            '      localCommit:',
            '        approved: true',
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
            '      - docs/05-execution-logs/evidence/clean-ahead-smoke.md',
            '      - docs/05-execution-logs/audits-reviews/clean-ahead-smoke.md',
            '    blockedFiles:',
            '      - .env.local',
            '      - src/**',
            '    riskTypes:',
            '      - automation_policy',
            '    validationCommands:',
            '      - git diff --check',
            '    evidencePath: docs/05-execution-logs/evidence/clean-ahead-smoke.md',
            '    auditReviewPath: docs/05-execution-logs/audits-reviews/clean-ahead-smoke.md'
        )
        $queueText | Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Encoding UTF8

        @(
            '# Approved Closeout Clean Ahead Smoke Evidence',
            'result: pass',
            'RED: recorded',
            'GREEN: recorded',
            'Commit: `abcdef2`',
            'localFullLoopGate: L2',
            'blocked remainder: Cost Calibration Gate remains blocked',
            'threadRolloverGate: continue_current_thread',
            'nextModuleRunCandidate: no-executable-task-seed-or-approve-next-task',
            'git diff --check',
            'Cost Calibration Gate remains blocked'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/evidence/clean-ahead-smoke.md" -Encoding UTF8

        @(
            '# Approved Closeout Clean Ahead Smoke Audit',
            'APPROVE'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/audits-reviews/clean-ahead-smoke.md" -Encoding UTF8

        & git add .
        & git commit -m "chore(smoke): seed clean ahead closeout fixture" | Out-Null
        & git push origin master | Out-Null

        $cleanAheadBaseSha = ((& git rev-parse HEAD) -join "").Trim()
        & git switch -c codex/module-run-v2-clean-ahead-closeout-smoke | Out-Null
        Add-Content -LiteralPath "docs/05-execution-logs/evidence/clean-ahead-smoke.md" -Value "clean ahead branch work committed"
        & git add "docs/05-execution-logs/evidence/clean-ahead-smoke.md"
        & git commit -m "docs(smoke): commit clean ahead work" | Out-Null
        $cleanAheadWorkSha = ((& git rev-parse HEAD) -join "").Trim()

        $cleanStatus = @(& git status --porcelain)
        if ($cleanStatus.Count -ne 0) {
            throw "Expected clean ahead smoke branch to have no uncommitted files."
        }

        $cleanAheadOutput = @(
            & $scriptPath `
                -TaskId "module-run-v2-clean-ahead-closeout-smoke" `
                -ProjectStatePath "docs/04-agent-system/state/project-state.yaml" `
                -QueuePath "docs/04-agent-system/state/task-queue.yaml" `
                -MatrixPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml" 2>&1
        )

        Assert-Contains -Output $cleanAheadOutput -Pattern "closeoutAuthorizationSource: structuredCloseoutPolicy"
        Assert-Contains -Output $cleanAheadOutput -Pattern "cleanAheadBranch: true"
        Assert-Contains -Output $cleanAheadOutput -Pattern "branchCommitsAhead: 1"
        Assert-Contains -Output $cleanAheadOutput -Pattern "mergeTarget: master"
        Assert-Contains -Output $cleanAheadOutput -Pattern "pushTarget: origin/master"
        Assert-Contains -Output $cleanAheadOutput -Pattern "branchCleanup: deleted codex/module-run-v2-clean-ahead-closeout-smoke"
        Assert-Contains -Output $cleanAheadOutput -Pattern "postMergeEvidenceOnlyCommitPolicy: not_required_by_default"

        $cleanAheadProjectStateAfter = Get-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Raw
        if ($cleanAheadProjectStateAfter -notmatch "commitSha:\s*$([regex]::Escape($cleanAheadWorkSha))") {
            throw "Expected approved closeout to write currentTask.commitSha to the pre-closeout branch HEAD $cleanAheadWorkSha."
        }

        & git merge-base --is-ancestor $cleanAheadWorkSha master
        if ($LASTEXITCODE -ne 0) {
            throw "Expected clean ahead work SHA to be accepted as a master ancestor after approved closeout."
        }

        & git switch master | Out-Null

        @(
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-closeout-preflight-fail-smoke',
            'updatedAt: "2026-06-09T09:00:00-07:00"',
            'repository:',
            "  lastKnownMasterSha: $cleanAheadBaseSha",
            "  lastKnownOriginMasterSha: $cleanAheadBaseSha",
            'currentTask:',
            '  id: module-run-v2-closeout-preflight-fail-smoke',
            '  status: ready_for_closeout',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/preflight-fail-smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/preflight-fail-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/preflight-fail-smoke.md',
            '  branch: codex/module-run-v2-closeout-preflight-fail-smoke',
            '  commitSha: pending-local-commit'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8

        @(
            'schemaVersion: 1',
            'tasks:',
            '  - id: module-run-v2-closeout-preflight-fail-smoke',
            '    title: Approved Closeout Preflight Fail Smoke',
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
            '      - docs/05-execution-logs/evidence/preflight-fail-smoke.md',
            '      - docs/05-execution-logs/evidence/preflight-note.txt',
            '      - docs/05-execution-logs/audits-reviews/preflight-fail-smoke.md',
            '    blockedFiles:',
            '      - .env.local',
            '      - src/**',
            '    riskTypes:',
            '      - automation_policy',
            '    validationCommands:',
            '      - git diff --check',
            '    evidencePath: docs/05-execution-logs/evidence/preflight-fail-smoke.md',
            '    auditReviewPath: docs/05-execution-logs/audits-reviews/preflight-fail-smoke.md'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Encoding UTF8
        @(
            '# Approved Closeout Preflight Fail Smoke Evidence',
            'result: pass',
            'RED: recorded',
            'GREEN: recorded',
            'Commit: `abcdef3`',
            'localFullLoopGate: L2',
            'blocked remainder: Cost Calibration Gate remains blocked',
            'threadRolloverGate: continue_current_thread',
            'nextModuleRunCandidate: no-executable-task-seed-or-approve-next-task',
            'git diff --check',
            'Cost Calibration Gate remains blocked'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/evidence/preflight-fail-smoke.md" -Encoding UTF8
        @(
            '# Approved Closeout Preflight Fail Smoke Audit',
            'APPROVE'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/audits-reviews/preflight-fail-smoke.md" -Encoding UTF8
        & git add .
        & git commit -m "chore(smoke): seed preflight fail fixture" | Out-Null
        & git push origin master | Out-Null
        & git switch -c codex/module-run-v2-closeout-preflight-fail-smoke | Out-Null
        "preflight note" | Set-Content -LiteralPath "docs/05-execution-logs/evidence/preflight-note.txt" -Encoding UTF8
        Remove-Item -LiteralPath "node_modules" -Recurse -Force
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $preflightFailOutput = @(
                powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
                    -TaskId "module-run-v2-closeout-preflight-fail-smoke" `
                    -ProjectStatePath "docs/04-agent-system/state/project-state.yaml" `
                    -QueuePath "docs/04-agent-system/state/task-queue.yaml" `
                    -MatrixPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml" `
                    -RecoveryPacketHandoffRoot $handoffRoot 2>&1
            )
            $preflightFailExitCode = $LASTEXITCODE
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        if ($preflightFailExitCode -eq 0) {
            throw "Expected closeout local tooling preflight failure to exit non-zero."
        }
        Assert-Contains -Output $preflightFailOutput -Pattern "closeoutLocalToolingDecision: stop_for_hard_block"
        Assert-Contains -Output $preflightFailOutput -Pattern "recoveryPacketDecision: written"
        $preflightQueueAfter = Get-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Raw
        if ($preflightQueueAfter -notmatch "status:\s*ready_for_closeout" -or $preflightQueueAfter -match "status:\s*closed") {
            throw "Expected preflight failure to leave queue status ready_for_closeout."
        }
        $preflightProjectStateAfter = Get-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Raw
        if ($preflightProjectStateAfter -notmatch "status:\s*ready_for_closeout" -or $preflightProjectStateAfter -match "status:\s*closed") {
            throw "Expected preflight failure to leave project-state status ready_for_closeout."
        }
        & git reset --hard HEAD | Out-Null
        & git clean -fd | Out-Null
        & git switch master | Out-Null
        $fakeBin = Initialize-FakeNodeTooling -Root $repoRoot
        $env:Path = "$fakeBin;$originalPath"

        @(
            'schemaVersion: 1',
            'project:',
            '  name: tiku',
            '  currentPhase: module-run-v2-closeout-commit-fail-smoke',
            'updatedAt: "2026-06-09T09:15:00-07:00"',
            'repository:',
            "  lastKnownMasterSha: $cleanAheadBaseSha",
            "  lastKnownOriginMasterSha: $cleanAheadBaseSha",
            'currentTask:',
            '  id: module-run-v2-closeout-commit-fail-smoke',
            '  status: ready_for_closeout',
            '  sourceStory: smoke',
            '  planPath: docs/05-execution-logs/task-plans/commit-fail-smoke.md',
            '  evidencePath: docs/05-execution-logs/evidence/commit-fail-smoke.md',
            '  auditReviewPath: docs/05-execution-logs/audits-reviews/commit-fail-smoke.md',
            '  branch: codex/module-run-v2-closeout-commit-fail-smoke',
            '  commitSha: pending-local-commit'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Encoding UTF8
        @(
            'schemaVersion: 1',
            'tasks:',
            '  - id: module-run-v2-closeout-commit-fail-smoke',
            '    title: Approved Closeout Commit Fail Smoke',
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
            '      - docs/05-execution-logs/evidence/commit-fail-smoke.md',
            '      - docs/05-execution-logs/evidence/commit-fail-note.txt',
            '      - docs/05-execution-logs/audits-reviews/commit-fail-smoke.md',
            '    blockedFiles:',
            '      - .env.local',
            '      - src/**',
            '    riskTypes:',
            '      - automation_policy',
            '    validationCommands:',
            '      - git diff --check',
            '    evidencePath: docs/05-execution-logs/evidence/commit-fail-smoke.md',
            '    auditReviewPath: docs/05-execution-logs/audits-reviews/commit-fail-smoke.md'
        ) | Set-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Encoding UTF8
        @(
            '# Approved Closeout Commit Fail Smoke Evidence',
            'result: pass',
            'RED: recorded',
            'GREEN: recorded',
            'Commit: `abcdef4`',
            'localFullLoopGate: L2',
            'blocked remainder: Cost Calibration Gate remains blocked',
            'threadRolloverGate: continue_current_thread',
            'nextModuleRunCandidate: no-executable-task-seed-or-approve-next-task',
            'git diff --check',
            'Cost Calibration Gate remains blocked'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/evidence/commit-fail-smoke.md" -Encoding UTF8
        @(
            '# Approved Closeout Commit Fail Smoke Audit',
            'APPROVE'
        ) | Set-Content -LiteralPath "docs/05-execution-logs/audits-reviews/commit-fail-smoke.md" -Encoding UTF8
        & git add .
        & git commit -m "chore(smoke): seed commit fail fixture" | Out-Null
        & git push origin master | Out-Null
        & git switch -c codex/module-run-v2-closeout-commit-fail-smoke | Out-Null
        "commit fail note" | Set-Content -LiteralPath "docs/05-execution-logs/evidence/commit-fail-note.txt" -Encoding UTF8
        @"
#!/bin/sh
echo forced pre-commit failure
exit 23
"@ | Set-Content -LiteralPath ".git/hooks/pre-commit" -Encoding ASCII
        $previousErrorActionPreference = $ErrorActionPreference
        $ErrorActionPreference = "Continue"
        try {
            $commitFailOutput = @(
                powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath `
                    -TaskId "module-run-v2-closeout-commit-fail-smoke" `
                    -ProjectStatePath "docs/04-agent-system/state/project-state.yaml" `
                    -QueuePath "docs/04-agent-system/state/task-queue.yaml" `
                    -MatrixPath "docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml" `
                    -RecoveryPacketHandoffRoot $handoffRoot 2>&1
            )
            $commitFailExitCode = $LASTEXITCODE
        } finally {
            $ErrorActionPreference = $previousErrorActionPreference
        }
        if ($commitFailExitCode -eq 0) {
            throw "Expected commit failure to exit non-zero."
        }
        Assert-Contains -Output $commitFailOutput -Pattern "recoveryPacketDecision: written"
        Assert-Contains -Output $commitFailOutput -Pattern "closeoutStateRestored: true"
        $commitFailQueueAfter = Get-Content -LiteralPath "docs/04-agent-system/state/task-queue.yaml" -Raw
        if ($commitFailQueueAfter -notmatch "status:\s*ready_for_closeout" -or $commitFailQueueAfter -match "status:\s*closed") {
            throw "Expected commit failure to restore queue status ready_for_closeout."
        }
        $commitFailProjectStateAfter = Get-Content -LiteralPath "docs/04-agent-system/state/project-state.yaml" -Raw
        if ($commitFailProjectStateAfter -notmatch "status:\s*ready_for_closeout" -or $commitFailProjectStateAfter -match "status:\s*closed") {
            throw "Expected commit failure to restore project-state status ready_for_closeout."
        }
    } finally {
        Pop-Location
    }
} finally {
    $env:Path = $originalPath
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 approved closeout smoke passed"
