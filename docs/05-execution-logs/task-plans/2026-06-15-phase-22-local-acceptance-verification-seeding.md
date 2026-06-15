# Phase 22 Local Acceptance Verification Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed a docs-only Phase 22 local acceptance verification matrix that converts the six journeys and status vocabulary into future approval-ready local verification candidates.

**Architecture:** This task updates only governance state, task queue, and execution logs. It does not run local verification, start a dev server, use Browser or Playwright, read `.env.local`, modify source/tests/schema/dependencies, or grant future runtime authority.

**Tech Stack:** Markdown execution logs, YAML project state/task queue, Git, PowerShell readiness scripts, `npm.cmd run lint`, and `npm.cmd run typecheck`.

---

## Task

- Task id: `phase-22-local-acceptance-verification-seeding`
- Branch: `codex/phase-22-local-acceptance-verification-seeding`
- Date: 2026-06-15
- Task kind: docs-only local acceptance verification seeding.

## Fresh Instruction

The user authorized a docs-only task to create/claim Phase 22 local acceptance verification seeding. Scope is limited to
`project-state.yaml`, `task-queue.yaml`, and this task's task plan/evidence/audit. The instruction explicitly forbids
e2e, Browser, dev server, `.env` access, source/test/schema/dependency edits, and runtime verification.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-post-repair-local-acceptance-reaudit-planning.md`

## Start Baseline

- Branch before task claim: `master`.
- Current task branch: `codex/phase-22-local-acceptance-verification-seeding`.
- `HEAD` / `master` / `origin/master`: `f9283b599d07104e9e65bb463493850351722be0`.
- `master...origin/master`: `0 0`.
- Worktree before branch creation: clean.
- Local and remote `codex/*` residue before branch creation: none observed.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`

Blocked files and actions:

- `.env.local`, `.env.example`, `.env.*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`,
  `src/db/schema/**`, `drizzle/**`, and `scripts/**` edits.
- Dev server, Browser, Playwright, e2e, local DB access, seed/bootstrap, migration, runtime verification,
  source/test/schema/dependency implementation, provider/model calls, staging/prod/cloud/deploy, payment,
  external-service, PR, force-push, and Cost Calibration Gate.

## Execution Steps

### Task 1: Claim And Plan

**Files:**

- Create: `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Step 1: Verify live `master` and `origin/master` are aligned.
- [x] Step 2: Create branch `codex/phase-22-local-acceptance-verification-seeding`.
- [x] Step 3: Write this task plan before editing queue semantics.

### Task 2: Seed Matrix

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`

- [x] Step 1: Register this docs-only seeding task as `closed/pass`.
- [x] Step 2: Add six future approval-required Phase 22 local acceptance verification candidates.
- [x] Step 3: Encode the shared status vocabulary and blocked-gate policy in each candidate.
- [x] Step 4: Update project state handoff to point at the seeded candidate matrix without auto-claiming any candidate.

### Task 3: Evidence And Audit

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`

- [x] Step 1: Record the six-journey verification matrix.
- [x] Step 2: Record future approval boundaries and blocked runtime gates.
- [x] Step 3: Record audit verdict for docs-only scope compliance.

### Task 4: Validation And Local Commit

**Files:**

- Validate only allowed-file diff.

- [x] Step 1: Run `git diff --check`.
- [x] Step 2: Run `npm.cmd run lint`.
- [x] Step 3: Run `npm.cmd run typecheck`.
- [x] Step 4: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Step 5: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-verification-seeding`.
- [x] Step 6: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-verification-seeding`.
- [x] Step 7: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-verification-seeding` as readiness evidence only.
- [ ] Step 8: Create one local commit on the short branch. Do not merge or push without fresh approval.

## Risk Controls

- Future candidate tasks are not current runtime authorization.
- Each future candidate must receive fresh approval before Browser, Playwright, dev server, e2e, DB-through-app,
  screenshots, seed/bootstrap, migration, `.env.local`, provider, staging, deploy, source/test/e2e edits, or schema work.
- Evidence records only task ids, journey labels, route/entity labels, status vocabulary, commands, paths, SHAs, and
  redacted matrix summaries.
