# Test Acceptance Redacted E2E Evidence Policy Review Plan

> **For agentic workers:** define evidence policy only. Do not run browser, Playwright, dev server, DB, Provider,
> dependency, release, final Pass, or Cost Calibration work.

**Goal:** Define the redacted browser/e2e evidence policy required before any future runtime task can safely record
evidence. This task is docs/state-only and does not modify source, tests, e2e specs, package manifests, lockfiles,
schema, migrations, scripts, runtime configuration, or evidence attachments.

**Architecture:** This task follows ADR-002 for runtime boundaries, ADR-004/ADR-005 for environment and release
separation, ADR-006 for dependency and Provider gate separation, and ADR-007 for authorization and credential evidence
sensitivity. It is not release readiness, final Pass, staging smoke, e2e validation, Provider readiness, DB readiness, or
Cost Calibration.

---

- Task id: `test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29`
- Branch: `codex/test-acceptance-e2e-evidence-policy-20260629`
- Status: `closed`
- Planned at: `2026-06-29T15:39:56-07:00`

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
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-runtime-gate-split-review.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`

## Read-Only Surfaces

- `e2e/**` for path labels and non-sensitive evidence-capture keywords only.
- `package.json` for script labels only.
- `playwright.config.*` for evidence attachment mode labels only.
- Prior task plans, evidence, audit reviews, acceptance docs, and traceability files listed above.

## Blocked Actions

- No browser, Playwright, e2e execution, dev-server start, screenshot, trace, video, raw DOM, HTML report, storage state,
  or test artifact capture.
- No DB connection, DB read/write, raw row access, schema migration, seed, `drizzle-kit push`, or migration replay.
- No Provider/AI call, Provider/model configuration, prompt capture, Provider payload, raw AI input/output, or Provider
  error evidence.
- No env, secret, connection string, account credential, cookie, token, session, localStorage, Authorization header,
  private fixture, registry token, or private account file access/evidence.
- No source, test, e2e spec, package manifest, lockfile, dependency, schema, migration, seed, script, runtime
  configuration, release state, or deployment state modification.
- No staging/prod/cloud/deploy, release readiness, final Pass, Cost Calibration, PR, or force-push.
- No complete question, paper, material, resource, chunk, answer, employee subjective answer, raw exception stack, or
  private content in evidence.

## Evidence Policy Draft

Allowed future browser/e2e evidence must be limited to:

- task id, branch, commit, command label, exit status, and timing summary;
- path labels and runtime lane labels without raw DOM or fixture content;
- redacted counts, status families, risk categories, and severity;
- pass/fail class summaries without private account data or content payloads;
- artifact policy status, such as `artifact_capture_disabled` or `artifact_not_recorded`;
- closeout status for local commit, fast-forward merge, push target, and branch cleanup.

Forbidden future browser/e2e evidence includes:

- raw DOM, screenshots, traces, videos, HTML reports, Playwright reports, test-results attachments, page content, locator
  text dumps, or request/response bodies;
- cookies, tokens, sessions, storageState, localStorage, Authorization headers, private account material, credentials,
  env values, secrets, or connection strings;
- raw DB rows, internal IDs, PII, email, phone, plaintext `redeem_code`, or private fixture content;
- Provider payloads, prompts, raw AI input/output, model configuration values, or raw Provider errors;
- complete question, paper, material, resource, chunk, answer, or employee subjective answer content.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**
- [x] **Step 2: Create short branch**
- [x] **Step 3: Materialize task boundaries in state, queue, and plan**
- [x] **Step 4: Read evidence-capture keyword labels without runtime execution**
- [x] **Step 5: Write traceability, evidence, audit review, and acceptance**
- [x] **Step 6: Validate and close out**

## Validation Commands

```powershell
(rg -l "screenshot|trace|video|storageState|localStorage|Authorization|cookie|session|test-results|playwright-report|attach|page\\.content|locator\\(|getBy|request\\.|APIRequestContext" e2e package.json playwright.config.ts | Measure-Object).Count
(rg -l "screenshot|trace|raw DOM|HTML report|cookie|token|session|localStorage|Authorization|Provider payload|prompt|raw AI|raw DB|redeem_code|complete question|complete paper" docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/01-requirements/traceability/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md | Measure-Object).Count
git diff --name-only -- package.json pnpm-lock.yaml src tests e2e drizzle migrations seed scripts playwright-report test-results .next
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId test-acceptance-redacted-e2e-evidence-policy-review-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Fast-forward merge to `master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Push `origin/master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Cleanup short branch: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
