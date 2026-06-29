# Test Acceptance Regression Risk Inventory Plan

> **For agentic workers:** execute this plan under Module Run v2 queue discipline. This task is read-only for tests,
> e2e specs, and existing acceptance/evidence documents. Do not run browser, e2e, dev server, DB, Provider, dependency,
> source, or test mutation work from this task.

**Goal:** Produce a redacted test and acceptance regression risk inventory from the current repository test/e2e
structure and existing acceptance/evidence records. Split executable follow-up tasks without modifying source, tests,
package manifests, lockfiles, schema, migration, Provider configuration, runtime state, release state, or deployment
state.

**Architecture:** This task follows ADR-002 for runtime boundaries, ADR-004 and ADR-005 for environment and release
gates, ADR-006 for dependency gate separation, and ADR-007 for edition-aware authorization acceptance context. Existing
acceptance records are evidence inputs only and do not authorize release readiness, final Pass, staging smoke, DB,
Provider, browser, or Cost Calibration work.

**Tech Stack:** YAML governance artifacts, Markdown execution logs, read-only test/e2e path inventory, scoped Prettier,
Git diff checks, and Module Run v2 PowerShell governance scripts.

---

- Task id: `test-acceptance-regression-risk-inventory-2026-06-29`
- Branch: `codex/test-acceptance-regression-inventory-20260629`
- Status: `closed`
- Planned at: `2026-06-29T12:12:14-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-security-dependency-supply-chain-inventory.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- Latest redacted acceptance/evidence summaries relevant to full unit baseline and acceptance matrix closure.

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-regression-risk-inventory.md`

## Read-Only Surfaces

- `tests/unit/**`
- `e2e/**`
- `docs/01-requirements/traceability/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/acceptance/**`
- `docs/05-execution-logs/audits-reviews/**`
- `docs/05-execution-logs/task-plans/**`
- `package.json` for script names only

## Blocked Actions

- No source, test, e2e spec, package manifest, lockfile, dependency, schema, migration, seed, script, runtime
  configuration, Provider configuration, release state, or deployment state modification.
- No browser runtime, Playwright execution, e2e execution, dev-server start, screenshot, trace, raw DOM, HTML report, or
  `playwright-report` / `test-results` evidence read.
- No DB connection, DB read/write, raw row access, schema migration, seed, `drizzle-kit push`, or migration replay.
- No Provider/AI call, Provider/model configuration, prompt capture, raw AI input/output, Provider payload, or Provider
  error evidence.
- No env, secret, connection string, account credential, cookie, token, session, localStorage, Authorization header,
  private fixture, registry token, or private account file access/evidence.
- No dependency install/update/remove/audit-fix, package download, lockfile regeneration, PR, force-push,
  staging/prod/cloud/deploy, release readiness, final Pass, or Cost Calibration.
- No complete question, paper, material, resource, chunk, answer, or employee subjective answer content in evidence.

## Evidence Redaction

Allowed evidence is limited to test/e2e path labels, workflow labels, role labels, acceptance document labels,
script/validation command names, counts, risk category, severity, status, follow-up task ids, commit/branch/merge/push
status, and redacted summaries.

Forbidden evidence includes credentials, secrets, connection strings, account material, cookies, tokens, sessions,
localStorage, Authorization headers, raw DOM, screenshots, traces, HTML reports, raw DB rows, internal IDs, PII, email,
phone, plaintext redeem_code, Provider payloads, prompts, raw AI input/output, raw exception payloads/stacks, and
complete question/paper/material/resource/chunk/answer content.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**

  Confirmed `master` and `origin/master` are aligned at `d64e81879dbcc313a3da5929e5876bd2a0db6345` before branch
  creation.

- [x] **Step 2: Create short branch**

  Branch: `codex/test-acceptance-regression-inventory-20260629`.

- [x] **Step 3: Materialize current task boundaries**

  Files: `project-state.yaml`, `task-queue.yaml`, and this task plan.

- [x] **Step 4: Build read-only test and acceptance surface index**

  Inventory test/e2e path counts, script names, acceptance/evidence document counts, and redacted workflow labels only.

- [x] **Step 5: Classify regression and acceptance risks**

  Classify unit coverage, e2e coverage, browser/runtime gate, redaction/evidence drift, DB/Provider/browser blocked
  lanes, and future validation split.

- [x] **Step 6: Produce matrix and follow-up task split**

  Update traceability with risk rows, severity, status, owner surface, and future task candidates. Do not run or edit
  tests.

- [x] **Step 7: Write evidence, audit review, and acceptance**

  Record validation commands, pass/fail status, counts, non-actions, Cost Calibration blocked, next candidate, and
  redaction confirmation.

- [x] **Step 8: Validate and close out**

  Run scoped Prettier, `git diff --check`, Module Run v2 pre-commit, closeout, and pre-push checks. If they pass,
  commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Validation Commands

```powershell
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-regression-risk-inventory.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-regression-risk-inventory.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-regression-risk-inventory.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId test-acceptance-regression-risk-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId test-acceptance-regression-risk-inventory-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId test-acceptance-regression-risk-inventory-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by active thread goal continuation after validation passes.
- Fast-forward merge to `master`: approved by active thread goal continuation after validation passes.
- Push `origin/master`: approved by active thread goal continuation after validation passes.
- Cleanup short branch: approved by active thread goal continuation after merge and push.
