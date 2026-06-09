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

$scriptPath = Join-Path -Path $PSScriptRoot -ChildPath "Invoke-ModuleRunV2ApprovedCloseout.ps1"
if (-not (Test-Path -LiteralPath $scriptPath)) {
    throw "Missing approved closeout script: $scriptPath"
}

$fixtureRoot = Join-Path -Path ([System.IO.Path]::GetTempPath()) -ChildPath ("tiku-approved-closeout-" + [guid]::NewGuid().ToString("N"))
$originRoot = Join-Path -Path $fixtureRoot -ChildPath "origin.git"
$repoRoot = Join-Path -Path $fixtureRoot -ChildPath "repo"

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
    } finally {
        Pop-Location
    }
} finally {
    if (Test-Path -LiteralPath $fixtureRoot) {
        Remove-Item -LiteralPath $fixtureRoot -Recurse -Force
    }
}

Write-Output "Module Run v2 approved closeout smoke passed"
