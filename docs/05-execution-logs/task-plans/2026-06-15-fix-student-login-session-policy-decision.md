# Fix Student Login Session Policy Decision Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a docs-only decision package that records the accepted student login session policy and prevents stale client-token expectations from driving future implementation.

**Architecture:** This task does not change auth behavior, session contracts, runtime code, or tests. It reconciles existing evidence and read-only source/test facts into a policy decision record, then updates only state/queue and this task's plan/evidence/audit files.

**Tech Stack:** Markdown execution logs, YAML project state/task queue, Git, PowerShell readiness scripts, `npm.cmd run lint`, and `npm.cmd run typecheck`.

---

## Task

- Task id: `fix-student-login-session-policy-decision`
- Branch: `codex/fix-student-login-session-policy-decision`
- Date: 2026-06-15
- Task kind: docs-only session policy decision package.

## Fresh Instruction

The user authorized this task as the second item in a strict serial set after
`unified-post-repair-master-health-gap-audit` closed and was pushed to `origin/master`.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-unified-post-repair-master-health-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-local-session-token.md`
- `docs/05-execution-logs/evidence/2026-06-14-fix-student-login-session-policy-consistency.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-fix-student-login-session-policy-consistency.md`
- `src/app/(auth)/login/page.tsx`
- `src/server/contracts/user-auth/session-boundary.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`

## Start Baseline

- Branch before task claim: `master`.
- Current task branch: `codex/fix-student-login-session-policy-decision`.
- `HEAD` / `master` / `origin/master`: `0232106827b984e86f6537902ac2d46cddd32e3d`.
- `master...origin/master`: `0 0`.
- Worktree before branch creation: clean.
- Local and remote `codex/*` residue before branch creation: none observed.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-fix-student-login-session-policy-decision.md`
- `docs/05-execution-logs/evidence/2026-06-15-fix-student-login-session-policy-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-fix-student-login-session-policy-decision.md`

Read-only inputs:

- `AGENTS.md`
- `docs/**`
- `src/app/(auth)/login/page.tsx`
- `src/server/contracts/user-auth/session-boundary.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/auth/session-personal-auth-boundary.test.ts`
- `scripts/agent-system/Test-GitCompletionReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1`

Blocked files and actions:

- `.env.local`, `.env.example`, `.env.*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`,
  `src/db/schema/**`, `drizzle/**`, and `scripts/**` edits.
- Auth/session security boundary change, runtime implementation, source/test changes, e2e/browser verification,
  provider/model requests, quota/cost measurement, env/secret/provider configuration, schema/migration,
  dependency/package/lockfile changes, staging/prod/cloud/deploy, payment/external-service, PR, force-push, and Cost
  Calibration Gate.

## Execution Steps

### Task 1: Claim And Plan

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/task-plans/2026-06-15-fix-student-login-session-policy-decision.md`

- [x] Step 1: Verify preflight Git state from the live repository.
- [x] Step 2: Create branch `codex/fix-student-login-session-policy-decision`.
- [x] Step 3: Mark the task as `in_progress` and write this plan.

### Task 2: Decision Inputs

**Files:**

- Read: prior blocked login evidence and current policy consistency evidence.
- Read: login page, session boundary contract, and related unit tests.

- [x] Step 1: Confirm the historical `fix-student-login-local-session-token` failure mode.
- [x] Step 2: Confirm the later accepted Option A evidence and current source/test alignment.
- [x] Step 3: Define the policy decision, rejected alternative, and future implementation boundary.

### Task 3: Evidence And Review

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-06-15-fix-student-login-session-policy-decision.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-15-fix-student-login-session-policy-decision.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Step 1: Write the docs-only policy decision evidence.
- [x] Step 2: Write audit/review verdict for scope and security-boundary compliance.
- [x] Step 3: Mark this task `closed` and set handoff to `phase-22-post-repair-local-acceptance-reaudit-planning`.

### Task 4: Validation And Closeout

**Files:**

- Validate allowed-file diff only.

- [x] Step 1: Run `git diff --check`.
- [x] Step 2: Run `npm.cmd run lint`.
- [x] Step 3: Run `npm.cmd run typecheck`.
- [x] Step 4: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Step 5: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-decision`.
- [x] Step 6: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-decision`.
- [x] Step 7: Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-decision` before push.
- [ ] Step 8: Commit once, fast-forward merge to `master`, rerun required master-side gates, push `origin/master`, delete the merged local branch, fetch/prune, and confirm clean aligned repository state.

## Risk Controls

- The accepted decision is documentation-only; no auth/security boundary code is changed.
- The rejected client bearer-token persistence alternative remains blocked without fresh, high-risk approval.
- Evidence records only task ids, status labels, command names, paths, SHAs, and redacted summaries.
