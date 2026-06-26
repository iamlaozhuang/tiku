# organization-analytics-dashboard-ux-completion-plan-2026-06-26

## Task

Create a docs-only UX completion plan for the organization analytics dashboard and seed concrete low-risk source tasks.

## Branch

`codex/org-analytics-ux-plan-20260626`

## Task Kind

`docs_only_dashboard_ux_completion_plan`

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
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`

## Requirement Decision Map

- Organization advanced admins can inspect organization-level summaries.
- Employee subjective answer text remains hidden.
- Organization analytics must stay separate from formal `exam_report` and `mistake_book`.
- Export remains deferred unless separately approved.

## Requirement Mapping

The UX plan maps current backend capabilities to a minimal UI completion source task:

- use existing dashboard summary route;
- use existing employee statistics route;
- keep export readiness disabled because no route currently exists;
- remove manual publicId-first workflow for scoped organization admins by using the session organization context;
- show loading, empty, and error states for summary and employee statistics.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-ai-generation-and-organization-analytics-implementation-inventory.md`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`

## Conflict Check

No requirement conflict found. The current UI already defaults `organizationPublicId` from the session, but still asks the
admin to type or edit a public id. The plan resolves that UX gap without changing authorization or route semantics.

## Allowed Scope

- Update docs/state/evidence/audit files for this task.
- Seed implementation tasks for admin AI provider-disabled bridge contract and organization analytics dashboard UX.

## Blocked Scope

- Source/test changes in this task.
- DB/schema/migration/seed, env, Provider, package/lockfile, browser/e2e, external service, staging/prod, payment,
  deployment, final Pass, release readiness.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/acceptance/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/evidence/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md`
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/acceptance/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/evidence/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md docs/05-execution-logs/audits-reviews/2026-06-26-organization-analytics-dashboard-ux-completion-plan.md`
3. `git diff --check`
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-analytics-dashboard-ux-completion-plan-2026-06-26`
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-analytics-dashboard-ux-completion-plan-2026-06-26 -SkipRemoteAheadCheck`
