# Advanced Organization Analytics Gateway Query Task Seeding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the next pending organization analytics Postgres gateway query TDD task after the training answer source schema migration closed.

**Architecture:** This is a docs/state-only queue seeding task. It records a closed seeding task and one pending repository-query implementation task that may later add aggregate-only reads from `organization_training_answer` through the existing repository gateway boundary.

**Tech Stack:** YAML task state, Markdown evidence/audit, Module Run v2 governance, TypeScript repository boundary references only.

---

## Task 1: Confirm Entry Gates

**Files:**

- Read: `AGENTS.md`
- Read: `docs/03-standards/code-taste-ten-commandments.md`
- Read: `docs/02-architecture/adr/*.md`
- Read: `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`
- Read: `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- Read: `docs/04-agent-system/sop/task-lifecycle-governance.md`
- Read: `docs/04-agent-system/state/project-state.yaml`
- Read: `docs/04-agent-system/state/task-queue.yaml`
- Read: `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-training-answer-source-schema-migration.md`
- Read: `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-training-answer-source-schema-migration.md`
- Read: `src/server/repositories/organization-analytics-repository.ts`
- Read: `src/server/repositories/organization-analytics-repository.test.ts`
- Read: `src/db/schema/organization-training.ts`

- [x] **Step 1: Verify baseline before any task work**

  Run:

  ```powershell
  git switch master
  git fetch --prune origin
  git status --short --branch
  git rev-parse HEAD master origin/master
  git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex
  ```

  Expected: clean `master`, matching `HEAD/master/origin/master`, no `codex/*` refs.

- [x] **Step 2: Create an isolated short branch**

  Run:

  ```powershell
  git switch -c codex/advanced-organization-analytics-gateway-query-task-seeding
  ```

  Expected: branch switches away from `master` before docs/state edits.

- [x] **Step 3: Read required governance references**

  Expected: all required project governance files and the latest schema migration evidence/audit are read before editing queue state.

## Task 2: Seed The Queue

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Create: `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md`

- [ ] **Step 1: Append a closed docs/state seeding task**

  Add task id:

  ```yaml
  advanced-organization-analytics-gateway-query-task-seeding
  ```

  Required status and boundaries:

  ```yaml
  taskKind: implementation_queue_seeding
  status: closed
  result: pass_docs_state_seeded_gateway_query_tdd
  allowedFiles:
    - docs/04-agent-system/state/project-state.yaml
    - docs/04-agent-system/state/task-queue.yaml
    - docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md
    - docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md
    - docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md
  blockedFiles:
    - .env.local
    - .env.example
    - .env.*
    - package.json
    - pnpm-lock.yaml
    - package-lock.yaml
    - package-lock.json
    - src/**
    - e2e/**
    - src/db/schema/**
    - drizzle/**
    - scripts/**
  ```

- [ ] **Step 2: Append one pending implementation task**

  Add pending task id:

  ```yaml
  advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd
  ```

  Required scope:

  ```yaml
  taskKind: local_repository_implementation
  seededImplementationTask: true
  status: pending
  dependencies:
    - advanced-organization-analytics-gateway-query-task-seeding
    - advanced-organization-analytics-training-answer-source-schema-migration
  allowedFiles:
    - docs/04-agent-system/state/project-state.yaml
    - docs/04-agent-system/state/task-queue.yaml
    - docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd.md
    - docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd.md
    - docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd.md
    - src/server/repositories/organization-analytics-repository.ts
    - src/server/repositories/organization-analytics-repository.test.ts
  ```

  Required blocked scope: route runtime wiring, services, UI, schema/migration, DB execution, package/lockfile/dependency, provider/model, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate.

- [ ] **Step 3: Update project state**

  Record:

  ```yaml
  currentPhase: advanced-organization-analytics-gateway-query-task-seeding
  handoff.nextRecommendedAction: claim advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd after fresh baseline confirmation
  ```

  Do not claim runtime completion from docs-only work.

## Task 3: Evidence, Audit, And Validation

**Files:**

- Modify: `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md`
- Modify: `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md`

- [ ] **Step 1: Write evidence**

  Evidence must include: baseline, references read, changed files, approval boundary, validation commands, blocked gates, redaction status, and next pending task.

- [ ] **Step 2: Write audit review**

  Audit must confirm: exactly one pending implementation task was seeded; no product source/schema/migration/dependency/e2e/provider/env/deploy work occurred; allowed and blocked files are concrete.

- [ ] **Step 3: Run validation commands**

  Run:

  ```powershell
  Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-gateway-query-task-seeding","status: closed","advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd","status: pending","src/server/repositories/organization-analytics-repository.ts","src/server/repositories/organization-analytics-repository.test.ts"
  npx prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md
  npx prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-gateway-query-task-seeding.md
  git diff --check
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-gateway-query-task-seeding
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-gateway-query-task-seeding
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-gateway-query-task-seeding
  ```

  Expected: all commands pass. If validation fails because a new task needs different queue metadata, fix only docs/state within allowed files and rerun.

## Stop Conditions

- Any baseline gate fails.
- Any edit would touch `.env*`, product source, schema/migration, dependency, e2e/browser/dev-server, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force push, or Cost Calibration Gate.
- Validation requires private row data, secrets, provider payloads, raw prompts, raw answers, public identifier lists, or protected content.
- The pending task cannot be expressed with concrete allowed files, blocked files, and validation commands.
