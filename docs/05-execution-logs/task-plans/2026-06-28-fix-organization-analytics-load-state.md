# Fix Organization Analytics Load State Plan

- Task id: `fix-organization-analytics-load-state-2026-06-28`
- Branch: `codex/fix-organization-analytics-load-state-20260628`
- Status: closed
- Date: `2026-06-28`

## Goal

Repair the organization analytics load action so it renders an expected redacted summary or an explicit empty/error state
instead of remaining in the pre-load explanatory state.

## SSOT Read List

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-acceptance-matrix-execution.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Requirement Mapping Result

- The acceptance gap maps to `full-matrix-gap-organization-analytics-load-state-2026-06-28`.
- The repair must keep analytics evidence redacted and owner-facing.
- Direct DB access, schema/migration/seed, Provider/AI execution, dependency changes, release readiness, and final Pass remain
  blocked.

## Candidate Files

- Modify: `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- Test: `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- Docs/evidence: this task plan, evidence, audit, acceptance, `project-state.yaml`, and `task-queue.yaml`

## TDD Plan

- [ ] Inspect existing analytics component and test coverage to identify the root cause.
- [ ] Add a failing unit test that reproduces the load action remaining in the pre-load explanatory state or not exposing an
      explicit empty/error state.
- [ ] Run the focused test and record RED evidence.
- [ ] Implement the smallest UI state fix inside the allowed analytics component.
- [ ] Run the focused test and record GREEN evidence.
- [ ] Run full unit, lint, typecheck, scoped formatting, diff, Module Run v2 precommit, closeout, and prepush readiness.

## Boundaries

- DB: no direct connection, read, write, migration, seed, schema, or destructive operation.
- AI/Provider: no Provider call, config read/write, credential read, prompt payload, raw input/output, or Cost Calibration Gate.
- Evidence: command status, test counts, and redacted failure class only; no raw DOM, screenshots, traces, rows, ids, secrets,
  Provider payloads, or complete business content.
- Scope: do not change packages, lockfiles, DB schema, migrations, seed files, scripts, or unrelated UI.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `npm.cmd run test:unit`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/evidence/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/audits-reviews/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/acceptance/2026-06-28-fix-organization-analytics-load-state.md src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/evidence/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/audits-reviews/2026-06-28-fix-organization-analytics-load-state.md docs/05-execution-logs/acceptance/2026-06-28-fix-organization-analytics-load-state.md src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-organization-analytics-load-state-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-organization-analytics-load-state-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-organization-analytics-load-state-2026-06-28 -SkipRemoteAheadCheck`
