# Test Acceptance Runtime Gate Split Review Plan

> **For agentic workers:** split runtime-labeled test and e2e surfaces into separately approvable lanes only. Do not run
> browser, Playwright, dev server, DB, Provider, dependency, release, final Pass, or Cost Calibration work.

**Goal:** Review current test/e2e labels and prior redacted acceptance evidence to split Provider, DB-backed, staging,
browser/dev-server, account/session, and evidence-capture runtime gates into separate future tasks. This task is
docs/source-read-only and does not modify source, tests, e2e specs, package manifests, lockfiles, schema, migrations, or
runtime configuration.

**Architecture:** This task follows ADR-002 for runtime boundary ownership, ADR-004/ADR-005 for environment and release
separation, ADR-006 for dependency gate separation, and ADR-007 for authorization evidence sensitivity. It is not
release readiness, final Pass, staging smoke, or Cost Calibration.

---

- Task id: `test-acceptance-runtime-gate-split-review-2026-06-29`
- Branch: `codex/test-acceptance-runtime-gate-split-20260629`
- Status: `in_progress_materialized`
- Planned at: `2026-06-29T15:19:03-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-evidence-status-reconciliation.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-evidence-status-reconciliation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-evidence-status-reconciliation.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-evidence-status-reconciliation.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-runtime-gate-split-review.md`

## Read-Only Surfaces

- `e2e/**`
- `tests/unit/**`
- `package.json` for script labels only
- Prior task plans/evidence/audits/acceptance listed above

## Blocked Actions

- No browser, Playwright, e2e execution, dev-server start, screenshot, trace, raw DOM, HTML report, or runtime evidence
  capture.
- No DB connection, DB read/write, raw row access, schema migration, seed, `drizzle-kit push`, or migration replay.
- No Provider/AI call, Provider/model configuration, prompt capture, Provider payload, raw AI input/output, or Provider
  error evidence.
- No env, secret, connection string, account credential, cookie, token, session, localStorage, Authorization header,
  private fixture, registry token, or private account file access/evidence.
- No source, test, e2e spec, package manifest, lockfile, dependency, schema, migration, seed, script, runtime
  configuration, release state, or deployment state modification.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, or force-push.
- No complete question, paper, material, resource, chunk, answer, or employee subjective answer content in evidence.

## Evidence Redaction

Allowed evidence is limited to spec path labels, runtime lane labels, gate status, counts, risk category, severity,
follow-up task ids, validation command names, branch/commit/merge/push/cleanup status, and redacted summaries.

Forbidden evidence includes credentials, secrets, connection strings, account material, cookies, tokens, sessions,
localStorage, Authorization headers, raw DOM, screenshots, traces, HTML reports, raw DB rows, internal IDs, PII, email,
phone, plaintext redeem_code, Provider payloads, prompts, raw AI input/output, raw exception payloads/stacks, private
fixtures, and complete question/paper/material/resource/chunk/answer content.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**
- [x] **Step 2: Create short branch**
- [x] **Step 3: Materialize task boundaries**
- [x] **Step 4: Build read-only runtime label index**
- [x] **Step 5: Split runtime gates into lanes**
- [x] **Step 6: Write traceability, evidence, audit review, and acceptance**
- [x] **Step 7: Validate and close out**

## Validation Commands

```powershell
rg --files e2e tests/unit
rg -n "staging|provider|ai|db|database|auth|login|storageState|screenshot|trace|localStorage|Authorization|cookie|session|process\\.env|test\\(|describe\\(" e2e package.json
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-runtime-gate-split-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-runtime-gate-split-review.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-runtime-gate-split-review.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId test-acceptance-runtime-gate-split-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId test-acceptance-runtime-gate-split-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId test-acceptance-runtime-gate-split-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Fast-forward merge to `master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Push `origin/master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Cleanup short branch: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
