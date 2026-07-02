# Role Workflow Experience Walkthrough From Code Baseline Task Plan

Task id: `role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`

Branch: `codex/role-workflow-experience-walkthrough-from-code-baseline`

## Objective

Run a bounded local role/workflow experience walkthrough from the current requirement-to-code baseline. The walkthrough
must verify selected role entry, denial, organization training, organization analytics, learner AI, and student learning
flows through existing local Playwright/e2e coverage, then record redacted evidence and next gaps.

This task is an acceptance observation package, not a source repair package.

## Scope Guard

- Allowed writes: task plan, evidence, audit review, project state, task queue.
- Read-only: requirement docs, ADRs, governance docs, `src/**`, `tests/**`, `e2e/**`, `package.json`,
  `playwright.config.ts`, existing evidence and audit logs.
- Allowed runtime: localhost/127.0.0.1 dev server started by Playwright if needed, existing Playwright specs, existing
  test-owned local API/UI flows, and redacted e2e summaries.
- Blocked: source/test/script/package/lockfile/schema/migration/seed changes, direct DB connection by Agent, Provider
  calls, Provider configuration reads, env/secret reads, dependency changes, staging/prod deploy, PR, force push, Cost
  Calibration, release readiness, final Pass, and production usability claims.
- If a validation command fails, record the failure as a runtime gap and stop before merge/push unless the task is
  explicitly converted into a blocked-evidence closeout.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-ssot-cross-doc-alignment-audit.md`
- `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-07-02-requirements-code-implementation-alignment-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-requirements-code-implementation-alignment-audit.md`

## Runtime Selection

Run only existing local specs that do not require real Provider calls or Provider configuration:

- `e2e/admin-role-denial-browser.spec.ts`
- `e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`
- `e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`

Do not run `e2e/local-full-loop-ai-generation-paper-provider-smoke.spec.ts` in this task because that belongs to a
separate Provider/runtime gate.

## Acceptance Criteria

- `content_admin` to system-ops denial and `ops_admin` to content-authoring denial are exercised through existing
  browser route fixtures.
- Baseline local roles can obtain valid local sessions through existing test-owned flows without recording credentials
  or session material.
- `org_standard_admin` is denied organization training, analytics, and organization AI generation.
- `org_advanced_admin` can exercise organization training, aggregate analytics, and local-contract organization AI
  question/paper generation without Provider execution.
- `employee` can see and submit organization training through the existing local flow.
- Personal learner AI local-contract request and student practice/mock/report/mistake_book entry flows are observed.
- Evidence records only role labels, route/workflow status, status categories, command status, and redacted summaries.
- No raw credentials, cookies, tokens, sessions, localStorage, Authorization headers, env values, raw DB rows, internal
  ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or full
  question/paper/material/chunk content are written.
- No release readiness, final Pass, production usability, or Cost Calibration claim is made.

## Validation Plan

- `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts e2e/local-full-loop-baseline-accounts-auth-db.spec.ts e2e/personal-ai-generation-local-request.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md docs/05-execution-logs/evidence/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md docs/05-execution-logs/audits-reviews/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md docs/05-execution-logs/evidence/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md docs/05-execution-logs/audits-reviews/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02 -SkipRemoteAheadCheck`

## Risk Defense

- Use existing tests instead of creating new role-specific acceptance logic in this task.
- Keep all source/test changes blocked so failed observations cannot drift into unreviewed repairs.
- Keep Provider and env boundaries closed.
- Treat e2e command failure as evidence of a runtime gap, not as permission to patch source.
- Keep generated Playwright reports and test results out of Git.
