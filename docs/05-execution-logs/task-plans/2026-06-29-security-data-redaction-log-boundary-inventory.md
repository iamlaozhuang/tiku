# Security Data Redaction Log Boundary Inventory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Inventory data redaction and logging boundary risks in scoped source/test/docs surfaces and split any confirmed findings into executable follow-up tasks without making implementation changes.

**Architecture:** This is a source-read-only security inventory under Module Run v2 governance. The task reads selected services, repositories, mappers, contracts, API route handlers, unit tests, and existing redacted evidence/audit docs; it writes only governance, traceability, evidence, audit, and acceptance files.

**Tech Stack:** Next.js/TypeScript monolith, Drizzle boundaries by ADR, Markdown/YAML governance docs, scoped Prettier, Git diff checks, and local Module Run v2 PowerShell gates.

---

- Task id: `security-data-redaction-log-boundary-inventory-2026-06-29`
- Branch: `codex/security-redaction-log-inventory-20260629`
- Status: closed
- Planned at: `2026-06-29T07:25:03-07:00`
- Closed at: `2026-06-29T07:32:49-07:00`

## Objective

Produce a redacted inventory of logging and evidence redaction risks. The inventory must identify file paths, risk
families, severity, status, and follow-up task split only. It must not quote source snippets containing sensitive terms
or record raw secrets, rows, prompts, payloads, generated content, DOM, screenshots, traces, emails, phones, plaintext
`redeem_code`, internal IDs, or complete business content.

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/evidence/2026-06-29-detail-optimization-security-review-kickoff.md`
- `docs/05-execution-logs/acceptance/2026-06-29-detail-optimization-security-review-kickoff.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-data-redaction-log-boundary-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-data-redaction-log-boundary-inventory.md`

## Read-Only Allowed Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/**`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/**`
- `docs/04-agent-system/sop/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/acceptance/**`
- `docs/01-requirements/traceability/**`
- `package.json`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/mappers/**`
- `src/server/contracts/**`
- `src/app/api/v1/**`
- `tests/unit/**`

## Blocked Files And Actions

- `.env*`, package files, lockfiles, `src/**`, `tests/**`, schema/migration/seed/script/e2e/runtime output paths, and
  private local fixture paths are blocked for writes.
- No source/test edits.
- No browser, dev-server, e2e, DB connection, migration, seed, Provider execution/configuration, env/secret read,
  dependency change, staging/prod/deploy, PR, force-push, release readiness, final Pass, or Cost Calibration.

## Inventory Method

- [x] **Step 1: Read mandatory governance and kickoff inputs**

- [x] **Step 2: Create short branch**

  Run: `git switch -c codex/security-redaction-log-inventory-20260629`

- [x] **Step 3: Materialize task boundaries**

  Update project state, task queue, current task pointer, and this task plan before source-content review.

- [x] **Step 4: Build scoped file inventory**

  Use `rg --files` on allowed source/test surfaces and record counts only.

- [x] **Step 5: Search for redaction/logging risk patterns**

  Search only allowed surfaces for logging, audit, error, stack, request/response, credential, session, token, provider,
  prompt, payload, raw AI IO, DB row, internal ID, PII, and full-content evidence patterns. Do not write raw matches to
  evidence; record only file paths, counts, risk families, and redacted summaries.

- [x] **Step 6: Inspect high-risk files read-only**

  Read enough context to classify each candidate as `finding`, `watch`, or `not_applicable`. Do not copy sensitive
  source snippets into docs.

- [x] **Step 7: Create traceability, evidence, audit, and acceptance outputs**

  Write the inventory matrix, redacted evidence, review decision, acceptance summary, and follow-up fix task split.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push readiness. If validation
  passes, commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Redacted Outcome

- Source/test read-only file count: 683.
- Redacted findings: 4 total; 3 split into follow-up tasks, 1 covered watch item.
- Next recommended task: `fix-route-error-envelope-question-paper-student-experience-2026-06-29`.
- No source/test fixes, browser/dev-server, DB, Provider/AI call, dependency, schema/migration/seed, deploy, release
  readiness, final Pass, or Cost Calibration action was performed in this task.

## Validation Commands

```text
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-data-redaction-log-boundary-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/task-plans/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/evidence/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-security-data-redaction-log-boundary-inventory.md docs/05-execution-logs/acceptance/2026-06-29-security-data-redaction-log-boundary-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId security-data-redaction-log-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId security-data-redaction-log-boundary-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId security-data-redaction-log-boundary-inventory-2026-06-29 -SkipRemoteAheadCheck
```
