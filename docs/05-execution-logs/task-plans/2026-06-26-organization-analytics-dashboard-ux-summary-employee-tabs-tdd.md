# organization-analytics-dashboard-ux-summary-employee-tabs-tdd-2026-06-26

## Task

Improve the organization analytics dashboard UX with TDD using existing routes only.

## Branch

`codex/org-analytics-summary-employee-tabs-20260626`

## Task Kind

`implementation_tdd`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/05-execution-logs/acceptance/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md`
- `src/app/(admin)/organization/organization-analytics/page.tsx`
- `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`
- `src/app/api/v1/organization-analytics/employee-statistics/route.ts`
- `src/server/contracts/organization-analytics-contract.ts`
- `src/server/services/organization-analytics-route.ts`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`

## Implementation Plan

1. Add failing tests for the dashboard UX target:
   - scoped organization context is shown without making organization public id manual entry the first workflow;
   - summary and employee statistics sections load through existing routes;
   - submitted trend, employee rows, loading/empty/error states, and disabled export readiness render without exposing
     hidden scope ids, internal ids, tokens, or raw answer text.
2. Verify RED with `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts`.
3. Implement the minimum frontend changes in `AdminOrganizationAnalyticsPage.tsx`.
4. Verify GREEN, then run lint, typecheck, scoped Prettier, diff check, and Module Run v2 gates.

## Blocked Scope

- New routes or backend service changes.
- DB connection, DB write, schema, migration, seed, account mutation.
- Provider calls, credential/env reads, Cost Calibration.
- Export file generation, object storage, external delivery.
- Browser/dev-server/e2e runtime.
- Package/lockfile/env changes.
- Staging/prod, payment, external service, deployment, release readiness, final Pass.

## Validation Commands

1. `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts`
2. `npm.cmd run lint`
3. `npm.cmd run typecheck`
4. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md docs/05-execution-logs/evidence/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx tests/unit/organization-analytics-admin-entry-surface.test.ts`
5. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md docs/05-execution-logs/evidence/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-organization-analytics-dashboard-ux-summary-employee-tabs-tdd.md src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx tests/unit/organization-analytics-admin-entry-surface.test.ts`
6. `git diff --check`
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-analytics-dashboard-ux-summary-employee-tabs-tdd-2026-06-26`
8. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-analytics-dashboard-ux-summary-employee-tabs-tdd-2026-06-26 -SkipRemoteAheadCheck`
