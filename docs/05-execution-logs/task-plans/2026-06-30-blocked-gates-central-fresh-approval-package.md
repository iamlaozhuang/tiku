# Blocked Gates Central Fresh Approval Package Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materialize centralized fresh approval and serial execution order for the remaining blocked pre-release gates without executing any gate.

**Architecture:** This is a docs/state-only governance package. It records the user's centralized fresh approval, completes missing Module Run v2 packet metadata for the five high-risk blocked gate records, and preserves per-gate serial materialization before execution.

**Tech Stack:** Tiku governance YAML, Markdown execution logs, PowerShell Module Run v2 validation scripts, Prettier.

---

## Task

- Task ID: `blocked-gates-central-fresh-approval-package-2026-06-30`
- Branch: `codex/blocked-gates-central-fresh-approval-20260630`
- Scope: docs/state-only centralized fresh approval package for the remaining blocked pre-release gates.
- Expected implementation: record centralized approval, serial order, per-gate boundaries, evidence redaction, and closeout rules; repair missing packet metadata for the five high-risk blocked gate records.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest task plan, evidence, audit, and acceptance for `blocked-gates-serial-approval-package-2026-06-30`
- Latest task plan, evidence, audit, and acceptance for `post-blocked-gates-closed-task-archive-index-cleanup-2026-06-30`

## Writable Scope

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-30-blocked-gates-central-fresh-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-30-blocked-gates-central-fresh-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-30-blocked-gates-central-fresh-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-30-blocked-gates-central-fresh-approval-package.md`

## Gate Scope

1. `security-dependency-deprecated-transitive-remediation-gate-2026-06-29`
2. `security-dependency-script-binary-policy-gate-2026-06-29`
3. `test-acceptance-db-backed-e2e-runtime-boundary-approval-package-2026-06-29`
4. `test-acceptance-provider-ai-e2e-runtime-boundary-approval-package-2026-06-29`
5. `test-acceptance-staging-e2e-runtime-boundary-approval-package-2026-06-29`
6. `layer-3-staging-pre-release-redacted-execution-after-target-materialization-2026-06-27`

## Serial Order

1. Dependency deprecated transitive remediation gate.
2. Dependency script/binary policy gate.
3. DB-backed E2E runtime boundary approval package.
4. Provider/AI E2E runtime boundary approval package.
5. Staging E2E runtime boundary approval package.
6. Layer 3 staging pre-release redacted execution only after a concrete isolated staging target is registered.

## Forbidden Actions

- No gate execution in this package.
- No release readiness, final Pass, Cost Calibration, prod deploy, PR, or force push.
- No staging/prod/cloud connection.
- No package, lockfile, dependency command, source, test, DB, migration, seed, Provider/AI, browser, dev server, or E2E runtime execution.
- No env, secret, connection string, credential, cookie, token, session, `localStorage`, or Authorization header access.
- No raw DB row, internal ID, PII, email, phone, plaintext `redeem_code`, raw DOM, screenshot, trace, Provider payload, prompt, raw AI I/O, or full question/paper/material/resource/chunk evidence.

## Implementation Steps

- [ ] **Step 1: Materialize package state and queue records**

  Add the task packet to `project-state.yaml` and `task-queue.yaml`, with exact allowed files, blocked files, boundaries, validation commands, evidence redaction, and closeout policy.

- [ ] **Step 2: Record centralized approval**

  Add a standing approval record naming the current user request as centralized fresh approval for serial gate advancement, while preserving per-gate task materialization before execution.

- [ ] **Step 3: Complete five high-risk gate metadata packets**

  Add missing `validationPolicy`, `planPath`, `evidencePath`, `auditReviewPath`, `allowedFiles`, `blockedFiles`, `validationCommands`, and `closeoutPolicy` fields to the five high-risk blocked gate records.

- [ ] **Step 4: Preserve runtime boundaries**

  Keep this package docs/state-only. Runtime gate execution remains forbidden here and must occur only in later serial task branches.

- [ ] **Step 5: Validate and close**

  Run scoped formatting, queue diagnostics, project status, diff checks, and Module Run v2 gates before commit, merge, push, and branch cleanup.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2QueueSlimmingSelfRepair.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/evidence/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/acceptance/2026-06-30-blocked-gates-central-fresh-approval-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/evidence/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-30-blocked-gates-central-fresh-approval-package.md docs/05-execution-logs/acceptance/2026-06-30-blocked-gates-central-fresh-approval-package.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.yaml package-lock.json src tests scripts src/db drizzle migrations seed e2e playwright-report test-results .next .env docs/04-agent-system/state/archive docs/04-agent-system/state/task-history-index.yaml
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId blocked-gates-central-fresh-approval-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId blocked-gates-central-fresh-approval-package-2026-06-30
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId blocked-gates-central-fresh-approval-package-2026-06-30 -SkipRemoteAheadCheck
```

## Closeout

Local commit, fast-forward merge to `master`, push to `origin/master`, and merged short-branch cleanup are approved only after the declared local governance validation passes. This package does not execute any gate.
