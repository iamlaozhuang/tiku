# Security Permission Role Boundary Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a source-read-only authorization and role-boundary inventory, then split any actionable risks into
future scoped tasks without changing source, tests, DB, Provider configuration, dependencies, or release state.

**Architecture:** The task follows ADR-002 layering by tracing route handlers, auth/session helpers, services,
repositories, contracts, validators, mappers, and unit coverage as read-only surfaces. Findings are recorded as
redacted file-path and risk-category rows, not raw data or runtime output.

**Tech Stack:** Next.js route handlers, TypeScript service/repository layers, Markdown/YAML governance artifacts,
scoped Prettier, Git diff checks, and Module Run v2 PowerShell governance scripts.

---

- Task id: `security-permission-role-boundary-inventory-2026-06-29`
- Branch: `codex/security-role-boundary-inventory-20260629`
- Status: closed
- Planned at: `2026-06-29T08:36:41-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/task-plans/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/evidence/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-verify-local-acceptance-session-boundary.md`
- `docs/05-execution-logs/acceptance/2026-06-29-verify-local-acceptance-session-boundary.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-permission-role-boundary-inventory.md`

## Read-Only Source Surfaces

- `src/server/auth/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/mappers/**`
- `src/app/api/v1/**`
- `tests/unit/auth/**`
- `tests/unit/*authorization*`
- `tests/unit/*session*`

## Blocked Actions

- No source or test modification.
- No browser runtime, dev server, raw DOM, screenshot, trace, or HTML report.
- No DB connection, raw row access, schema, migration, seed, mutation, or direct data read/write.
- No Provider/AI call, Provider/model configuration read/write, prompt capture, raw AI input/output, or Cost
  Calibration.
- No account login, private fixture read, credential, cookie, token, session, localStorage, Authorization header, env
  file, secret, or connection-string access/evidence.
- No package or lockfile changes, dependency introduction/removal/upgrade, PR, force-push, release readiness, final Pass,
  staging/prod/cloud/deploy.

## Execution Steps

- [x] **Step 1: Read mandatory governance and latest predecessor evidence**

  Expected: current `master` and `origin/master` are aligned at `cddf8ad05`.

- [x] **Step 2: Create short branch**

  Run: `git switch -c codex/security-role-boundary-inventory-20260629`

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, this task plan, and the traceability document.

- [x] **Step 4: Build read-only surface index**

  Use `rg --files` over the read-only source surfaces. Record only file paths and count summaries.

- [x] **Step 5: Inspect role and authorization boundary code paths**

  Read selected auth/session, route, service, repository, contract, validator, mapper, and unit-test files. Record
  redacted summaries only.

- [x] **Step 6: Produce inventory matrix and future task split**

  Update traceability with risk rows, severity, status, owner surface, and future task candidates. Do not fix source.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record validation commands, pass/fail status, counts, non-actions, Cost Calibration blocked, next candidate, and
  redaction confirmation.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass, commit,
  fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-permission-role-boundary-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-permission-role-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-permission-role-boundary-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-permission-role-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-permission-role-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-permission-role-boundary-inventory-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread task materialization after validation passes.
- Fast-forward merge to `master`: approved by active thread task materialization after validation passes.
- Push `origin/master`: approved by active thread task materialization after validation passes.
- Cleanup short branch: approved by active thread task materialization after merge and push.
