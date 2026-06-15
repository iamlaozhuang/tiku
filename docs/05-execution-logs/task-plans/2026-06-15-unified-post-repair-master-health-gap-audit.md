# Unified Post Repair Master Health Gap Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the current post-repair `master` health, queue posture, blocked student-login session conflict, Phase 22 posture, and next safe serial candidates without changing runtime code.

**Architecture:** This is a docs-only/read-only audit over Git state, task queue state, prior evidence, and roadmap documents. The task may update only state/queue and this task's plan/evidence/audit files; source, tests, schema, dependency, e2e, provider, env/secret, deploy, payment, PR, force-push, and Cost Calibration surfaces remain blocked.

**Tech Stack:** Markdown execution logs, YAML project state/task queue, Git, PowerShell readiness scripts, `npm.cmd run lint`, and `npm.cmd run typecheck`.

---

## Task

- Task id: `unified-post-repair-master-health-gap-audit`
- Branch: `codex/unified-post-repair-master-health-gap-audit`
- Date: 2026-06-15
- Task kind: docs-only/read-only gap audit.

## Fresh Instruction

The user authorized the three seeded pending tasks as a strict serial set and authorized this first task to create/update
its task plan, evidence, audit/review, project state, and task queue; create one local commit; fast-forward merge to
`master`; run master-side validation; push `origin/master`; delete the merged local short branch; fetch/prune; and stop
unless the repository is clean and `master == origin/master`.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/05-execution-logs/task-plans/2026-06-15-unified-post-repair-next-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-next-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-next-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-repair-candidates-completion-state-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`

## Start Baseline

- Branch before task claim: `master`.
- Current task branch: `codex/unified-post-repair-master-health-gap-audit`.
- `HEAD` / `master` / `origin/master`: `8727b4af43ee7c5130a76bc9b929ff0a0524d632`.
- `master...origin/master`: `0 0`.
- Worktree before branch creation: clean.
- Local and remote `codex/*` residue before branch creation: none observed.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-master-health-gap-audit.md`

Read-only inputs:

- `AGENTS.md`
- `docs/**`
- `src/**`
- `tests/unit/**`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`

Blocked files and actions:

- `.env.local`, `.env.example`, `.env.*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`,
  `src/db/schema/**`, `drizzle/**`, and `scripts/**` edits.
- Runtime implementation, source/test changes, e2e/browser verification, provider/model requests, quota/cost
  measurement, env/secret/provider configuration, schema/migration, dependency/package/lockfile changes,
  staging/prod/cloud/deploy, payment/external-service, PR, force-push, and Cost Calibration Gate.

## Execution Steps

### Task 1: Claim And Plan

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/task-plans/2026-06-15-unified-post-repair-master-health-gap-audit.md`

- [x] Step 1: Verify preflight Git state from the live repository.
- [x] Step 2: Create branch `codex/unified-post-repair-master-health-gap-audit`.
- [x] Step 3: Mark the task as `in_progress` and write this plan.

### Task 2: Read-Only Audit

**Files:**

- Read: `docs/04-agent-system/state/project-state.yaml`
- Read: `docs/04-agent-system/state/task-queue.yaml`
- Read: `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- Read: prior post-repair seeding and student-login conflict evidence.

- [x] Step 1: Confirm master health and queue ordering from Git and task queue.
- [x] Step 2: Confirm the student-login conflict remains a decision-only blocker, not a docs-only implementation target.
- [x] Step 3: Confirm Phase 22 posture and identify which verification gates remain future-only.
- [x] Step 4: Record next implementation/planning candidates without claiming the next task.

### Task 3: Evidence And Review

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Step 1: Write redacted evidence with command summaries, queue facts, blocked gates, and candidate ordering.
- [x] Step 2: Write audit/review verdict for docs-only scope compliance.
- [x] Step 3: Mark this task `closed` and set handoff to `fix-student-login-session-policy-decision` only after validation passes.

### Task 4: Validation And Closeout

**Files:**

- Validate allowed-file diff only.

- [x] Step 1: Run `git diff --check`.
- [x] Step 2: Run `npm.cmd run lint`.
- [x] Step 3: Run `npm.cmd run typecheck`.
- [x] Step 4: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Step 5: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-post-repair-master-health-gap-audit`.
- [x] Step 6: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-post-repair-master-health-gap-audit`.
- [x] Step 7: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId unified-post-repair-master-health-gap-audit` before push.
- [ ] Step 8: Commit once, fast-forward merge to `master`, rerun required master-side gates, push `origin/master`, delete the merged local branch, fetch/prune, and confirm clean aligned repository state.

## Risk Controls

- The task is docs-only; no implementation attempt is allowed.
- The stale client-token vs `server_session` conflict remains for the next decision package.
- Phase 22 local browser/runtime verification is not run in this task.
- Evidence records only task ids, status labels, command names, paths, SHAs, and redacted summaries.
