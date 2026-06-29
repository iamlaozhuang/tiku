# Security AI Provider Boundary Inventory Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to execute this plan task-by-task.

**Goal:** Produce a source-read-only inventory of AI/Provider boundary risks, with Provider budget fixed at zero, and
split any actionable findings into future scoped tasks without changing source, tests, DB, Provider configuration,
dependencies, or release state.

**Architecture:** The task follows ADR-001, ADR-002, ADR-006, and ADR-007. Installed AI SDK packages are dependency
facts only; they do not authorize real Provider calls, Provider configuration, runtime model_config reads, prompt or
payload evidence, quota decisions, release readiness, final Pass, or Cost Calibration.

**Tech Stack:** Next.js route handlers, TypeScript service-layer AI boundaries, source-read-only inventory commands,
Markdown/YAML governance artifacts, scoped Prettier, Git diff checks, and Module Run v2 PowerShell governance scripts.

---

- Task id: `security-ai-provider-boundary-inventory-2026-06-29`
- Branch: `codex/security-ai-provider-boundary-inventory-20260629`
- Status: `closed`
- Planned at: `2026-06-29T11:26:40-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-permission-role-boundary-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-api-contract-input-validation-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-ui-tab-feedback-consistency-candidates.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-provider-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-ai-provider-boundary-inventory.md`

## Read-Only Source Surfaces

- `src/ai/**`
- `src/rag/**`
- `src/server/models/ai-rag.ts`
- `src/server/contracts/ai/**`
- `src/server/services/**`
- `src/app/api/v1/**`
- `tests/unit/ai/**`

## Blocked Actions

- No source or test modification.
- No Provider/AI call, Provider/model configuration read/write, runtime model_config value read/write, prompt capture,
  Provider payload capture, raw AI input/output capture, quota decision, or Cost Calibration.
- No env, secret, connection string, account login, private fixture read, credential, cookie, token, session,
  localStorage, Authorization header, or Provider key access/evidence.
- No browser runtime, dev server, raw DOM, screenshot, trace, or HTML report.
- No DB connection, raw row access, schema, migration, seed, mutation, or direct data read/write.
- No package or lockfile changes, dependency introduction/removal/upgrade, PR, force-push, staging/prod/cloud/deploy,
  release readiness, or final Pass.

## Evidence Redaction

Allowed evidence is limited to file paths, module labels, boundary type, risk category, severity, status, counts,
follow-up task ids, validation command names, commit/branch/merge/push/cleanup status, and redacted expected/observed
summaries.

Forbidden evidence includes credentials, secrets, connection strings, cookies, tokens, sessions, localStorage,
Authorization headers, raw DB rows, internal IDs, PII, plaintext redeem_code, raw DOM, screenshots, traces, Provider
payloads, prompt text, raw AI input/output, runtime model_config values, raw Provider error messages/stacks, complete
question/paper/material/resource/chunk content, and env file contents.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**

  Confirmed `master` and `origin/master` are aligned at `58c1b63b4ba0c5e3ced5d24296535a31de0f8ad5` before branch
  creation.

- [x] **Step 2: Create short branch**

  Branch: `codex/security-ai-provider-boundary-inventory-20260629`.

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, and this task plan.

- [x] **Step 4: Build read-only AI/Provider surface index**

  Use `rg --files` and count-only commands over scoped surfaces. Record only file paths and count summaries.

- [x] **Step 5: Inspect AI/Provider boundary paths**

  Read selected source/test files after materialization. Classify risks around Provider execution gates, disabled
  contracts, prompt/payload redaction, model_config runtime boundaries, fallback/quota behavior, and error snapshot
  sanitization. Avoid printing or recording prompt text, Provider payloads, raw AI I/O, runtime configuration values, or
  raw error content.

- [x] **Step 6: Produce inventory matrix and future task split**

  Update traceability with finding rows, severity, status, owner surface, and future task candidates. Do not fix source.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record validation commands, pass/fail status, counts, non-actions, Cost Calibration blocked, next candidate, and
  redaction confirmation.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass,
  commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

  Validation evidence is recorded in the evidence file. Commit, fast-forward merge, push, and branch cleanup are
  performed after local validation passes under the materialized closeout policy.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-ai-provider-boundary-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-ai-provider-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-ai-provider-boundary-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-ai-provider-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-ai-provider-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-ai-provider-boundary-inventory-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread goal continuation after validation passes.
- Fast-forward merge to `master`: approved by active thread goal continuation after validation passes.
- Push `origin/master`: approved by active thread goal continuation after validation passes.
- Cleanup short branch: approved by active thread goal continuation after merge and push.
