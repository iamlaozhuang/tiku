# Phase 22 Post Repair Local Acceptance Re-Audit Planning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Define the docs-only Phase 22 post-repair local acceptance re-audit matrix and future local-verification gates.

**Architecture:** This task creates a planning record from existing Phase 22 contract, roadmap, traceability, and closeout evidence. It does not run browser/e2e/local verification, migrations, seed/bootstrap, provider calls, deployment, source/test implementation, or dependency changes.

**Tech Stack:** Markdown execution logs, YAML project state/task queue, Git, PowerShell readiness scripts, `npm.cmd run lint`, and `npm.cmd run typecheck`.

---

## Task

- Task id: `phase-22-post-repair-local-acceptance-reaudit-planning`
- Branch: `codex/phase-22-post-repair-local-acceptance-reaudit-planning`
- Date: 2026-06-15
- Task kind: docs-only local acceptance re-audit planning.

## Fresh Instruction

The user authorized this task as the third item in a strict serial set after
`fix-student-login-session-policy-decision` closed and was pushed to `origin/master`.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-fix-student-login-session-policy-decision.md`

## Start Baseline

- Branch before task claim: `master`.
- Current task branch: `codex/phase-22-post-repair-local-acceptance-reaudit-planning`.
- `HEAD` / `master` / `origin/master`: `42cba7eca148be03637af367b40238487e8426df`.
- `master...origin/master`: `0 0`.
- Worktree before branch creation: clean.
- Local and remote `codex/*` residue before branch creation: none observed.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`

Read-only inputs:

- `AGENTS.md`
- `docs/**`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`

Blocked files and actions:

- `.env.local`, `.env.example`, `.env.*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`,
  `src/db/schema/**`, `drizzle/**`, and `scripts/**` edits.
- Source/test/runtime implementation, local browser/e2e verification, migrations, seed/bootstrap, provider/model
  requests, quota/cost measurement, env/secret/provider configuration, schema/migration, dependency/package/lockfile
  changes, staging/prod/cloud/deploy, payment/external-service, PR, force-push, and Cost Calibration Gate.

## Execution Steps

### Task 1: Claim And Plan

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/task-plans/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`

- [x] Step 1: Verify preflight Git state from the live repository.
- [x] Step 2: Create branch `codex/phase-22-post-repair-local-acceptance-reaudit-planning`.
- [x] Step 3: Mark the task as `in_progress` and write this plan.

### Task 2: Planning Inputs

**Files:**

- Read: Phase 22 contract and roadmap.
- Read: Phase 18/19 matrix sources and Phase 20/21 closeout references as needed.
- Read: local-human-verification and fresh-local-dev-db-validation playbooks.

- [x] Step 1: Confirm Phase 22 source-of-truth inputs and status vocabulary.
- [x] Step 2: Define a six-journey re-audit matrix aligned to the Phase 22 contract.
- [x] Step 3: Define future local-verification gates without executing them.
- [x] Step 4: Separate local product gaps from staging/cloud/provider/env/deploy blockers.

### Task 3: Evidence And Review

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Step 1: Write the Phase 22 planning evidence.
- [x] Step 2: Write audit/review verdict for planning-only scope compliance.
- [x] Step 3: Mark this task `closed` and set handoff to stop after the three-task serial set unless new fresh instruction exists.

### Task 4: Validation And Closeout

**Files:**

- Validate allowed-file diff only.

- [x] Step 1: Run `git diff --check`.
- [x] Step 2: Run `npm.cmd run lint`.
- [x] Step 3: Run `npm.cmd run typecheck`.
- [x] Step 4: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Step 5: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-post-repair-local-acceptance-reaudit-planning`.
- [x] Step 6: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-post-repair-local-acceptance-reaudit-planning`.
- [x] Step 7: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-post-repair-local-acceptance-reaudit-planning` before push.
- [ ] Step 8: Commit once, fast-forward merge to `master`, rerun required master-side gates, push `origin/master`, delete the merged local branch, fetch/prune, and confirm clean aligned repository state.

## Risk Controls

- This task produces a planning matrix only and does not claim local acceptance completion.
- Future local verification requires explicit approval before dev server, Browser, Playwright/e2e, seed/bootstrap, DB, screenshots, or browser observations.
- Evidence records only task ids, status labels, command names, paths, SHAs, and redacted matrix entries.
