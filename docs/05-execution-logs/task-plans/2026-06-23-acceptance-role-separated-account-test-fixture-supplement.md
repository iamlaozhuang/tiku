# Acceptance Role Separated Account Test Fixture Supplement Plan

taskId: acceptance-role-separated-account-test-fixture-supplement-2026-06-23
status: closed
createdAt: "2026-06-23T05:55:57-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23
auditorScope: excluded_from_this_fixture_supplement
playwrightRuntimeApproval: not_approved

## Purpose

Implement the approved test-only role-separated fixture supplement without runtime execution. This task adds a narrow
fixture contract spec for the approved role rows, records that auditor is excluded from this supplement, and keeps
Playwright/browser execution blocked until a later explicit approval.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-test-fixture-scope-approval-package.md`

## Approved Scope

- Approval id: `ROLE_SEPARATED_TEST_FIXTURE_SUPPLEMENT_SCOPE_2026_06_23`.
- Auditor decision: do not include auditor in this fixture supplement.
- Runtime decision: do not run Playwright; runtime may be approved later for only this spec.
- Preferred implementation file: `e2e/role-separated-account-fixture-supplement.spec.ts`.

## Allowed Work

- Add one test-only e2e fixture contract spec.
- Update docs/state/task queue/evidence/audit for this task.
- Run static validation only.

## Blocked Work

- Playwright/browser/dev-server runtime.
- Real account creation, disablement, password reset, seed changes, database work, schema/migration, `.env*`, Provider,
  Cost Calibration, staging/prod/cloud, payment/external services, package/lockfile changes, PR, force push, or final
  MVP pass.

## Validation Plan

- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-test-fixture-supplement-2026-06-23`

## Runtime Validation Boundary

Playwright spec execution is intentionally not part of this task. The next runtime decision may approve only:

`npm.cmd run test:e2e -- e2e/role-separated-account-fixture-supplement.spec.ts`

## Validation Result

Static validation passed. Playwright runtime was not executed because laozhuang explicitly deferred it to a later
single-spec approval.
