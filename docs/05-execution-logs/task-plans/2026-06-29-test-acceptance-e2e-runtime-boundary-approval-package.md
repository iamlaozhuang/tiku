# Test Acceptance E2E Runtime Boundary Approval Package Plan

> **For agentic workers:** prepare the approval package only. Do not run browser, Playwright, e2e, dev server, DB,
> Provider, dependency, staging, release readiness, final Pass, or Cost Calibration work.

**Goal:** Materialize the approval boundary that a future local browser/e2e runtime task would need before any execution.
This task does not execute runtime work and does not modify source, tests, e2e specs, package manifests, lockfiles,
schema, migrations, scripts, runtime configuration, or evidence attachments.

**Architecture:** This task follows ADR-002 for runtime boundaries, ADR-004/ADR-005 for environment and release
separation, ADR-006 for dependency and Provider gate separation, and ADR-007 for authorization and credential evidence
sensitivity. It is not release readiness, final Pass, staging smoke, e2e validation, Provider readiness, DB readiness, or
Cost Calibration.

---

- Task id: `test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29`
- Branch: `codex/test-acceptance-e2e-runtime-boundary-approval-package-20260629`
- Status: `closed`
- Planned at: `2026-06-29T16:12:05-07:00`

## Mandatory Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-regression-risk-inventory.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-runtime-gate-split-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/01-requirements/traceability/2026-06-29-test-acceptance-redacted-e2e-evidence-policy-review.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-redacted-e2e-traceability-artifact-cleanup.md`

## Allowed Writable Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md`
- `docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md`

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

## Approval Package Strategy

- Record that current runtime approval is not granted.
- Preserve the cleaned redacted evidence policy as a prerequisite for any later browser/e2e runtime task.
- Split future runtime approval into local browser/dev-server, command execution, account/session, DB-backed,
  Provider/AI, staging, and evidence artifact gates.
- Define the minimum future evidence shape: command labels, exit status classes, timing summary, lane labels, redacted
  counts, and artifact policy status only.
- Keep Provider/AI, DB-backed, and staging e2e lanes blocked unless future tasks receive separate approvals.

## Execution Steps

- [x] **Step 1: Read mandatory governance and predecessor evidence**
- [x] **Step 2: Create short branch**
- [x] **Step 3: Materialize task boundaries in state and queue**
- [x] **Step 4: Create this task plan**
- [x] **Step 5: Write traceability, evidence, audit review, and acceptance**
- [x] **Step 6: Validate and close out**

## Validation Commands

```powershell
rg -n "browserRuntimeApproved: false|e2eRuntimeExecuted: false|devServerStarted: false|artifactCaptureAllowed: false|requiresFreshRuntimeApproval: true" docs/01-requirements/traceability/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md
if (rg -n "\*\*\* Add File|pending_validation|pending_task_scoped_validation" docs/01-requirements/traceability/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md) { exit 1 } else { "no matches" }
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/task-plans/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/evidence/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/audits-reviews/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md docs/05-execution-logs/acceptance/2026-06-29-test-acceptance-e2e-runtime-boundary-approval-package.md
git diff --check
git diff --name-only -- package.json pnpm-lock.yaml src tests e2e drizzle migrations seed scripts playwright-report test-results .next
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId test-acceptance-e2e-runtime-boundary-approval-package-2026-06-29 -SkipRemoteAheadCheck
```

## Closeout Policy

- Local commit: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Fast-forward merge to `master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Push `origin/master`: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
- Cleanup short branch: approved by `localSecurityRepairLoopApproval20260629_after_task_scoped_materialization`.
