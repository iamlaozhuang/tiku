# Verify API List SortBy Validation Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify whether list query `sortBy` values are allowlisted before repository execution, and record any required
source/test repair as a fresh-approval follow-up without modifying source or tests in this task.

**Architecture:** This task follows ADR-002 by tracing route/validator/service/repository boundaries as static source
evidence only. The current materialization is verification-only: it may read scoped source/test files and run focused
local commands, but it may not edit `src/**` or `tests/**` unless a later task records fresh human approval.

**Tech Stack:** Next.js App Router REST route boundaries, TypeScript validators/services/repositories, Vitest static unit
tests, Markdown/YAML governance artifacts, scoped Prettier, Git diff checks, and Module Run v2 PowerShell gates.

---

- Task id: `verify-api-list-sort-by-validation-boundary-2026-06-29`
- Branch: `codex/api-sort-validation-boundary-20260629`
- Status: closed
- Planned at: `2026-06-29T09:13:26-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md`

## Predecessor Consistency Note

The predecessor traceability file still records `closed pending validation rerun` while state, queue, evidence, and
acceptance record pass. This task may correct only that predecessor traceability status to `closed`; no other predecessor
content may be changed.

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md`

## Read-Only Source Surfaces

- `src/app/api/v1/**`
- `src/server/validators/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `tests/unit/**`

## Blocked Actions

- No source or test modification in this task.
- No browser runtime, dev server, raw DOM, screenshot, trace, or HTML report.
- No DB connection, raw row access, schema, migration, seed, mutation, or direct data read/write.
- No Provider/AI call, Provider/model configuration read/write, prompt capture, raw AI input/output, or Cost
  Calibration.
- No account login, private fixture read, credential, cookie, token, session, localStorage, Authorization header, env
  file, secret, or connection-string access/evidence.
- No package or lockfile changes, dependency introduction/removal/upgrade, PR, force-push, release readiness, final Pass,
  staging/prod/cloud/deploy.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**

  Confirm current `master` and `origin/master` are aligned at `bf83a08c69931a2e7a5eb923770be121f611583f`.

- [x] **Step 2: Create short branch**

  Run: `git switch -c codex/api-sort-validation-boundary-20260629`

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, this task plan, and the traceability document.

- [x] **Step 4: Build static sort-field evidence map**

  Use `rg` and read scoped validator/service/repository files. Record only paths, control names, route categories, and
  status summaries. Do not record raw business content, DB rows, or sensitive values.

- [x] **Step 5: Classify `api-inv-001`**

  Classify the finding as one of:
  - `not_actionable`: every reviewed route has validator or repository allowlisting before query construction.
  - `needs_repair`: caller-controlled `sortBy` can reach repository query construction without an allowlist.
  - `needs_review`: static evidence is insufficient without expanding source/test scope.

  Verdict: `not_actionable_for_query_construction_with_contract_watch`. The reviewed query construction paths map
  `sortBy` to fixed columns or fallback defaults before execution. The remaining observation is low-severity pagination
  metadata consistency: generic validators can preserve unsupported `sortBy` strings that services may echo in
  pagination.

- [x] **Step 6: Run focused existing checks**

  Run safe local validation only. Prefer existing validator/service tests that do not connect to DB, Provider, browser,
  or private fixtures.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record the verdict, proof gaps, non-actions, redaction status, validation commands, and next task decision.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass,
  commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

  Local governance validation passed at `2026-06-29T09:22:51-07:00`. Commit, merge, push, and branch cleanup are the
  remaining Git closeout actions.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread goal continuation after validation passes for docs/state verification-only
  changes.
- Fast-forward merge to `master`: approved by active thread goal continuation after validation passes.
- Push `origin/master`: approved by active thread goal continuation after validation passes.
- Cleanup short branch: approved by active thread goal continuation after merge and push.
- Source/test repair: not approved in this task; requires a future fresh approval and materialized source/test
  allowedFiles.
