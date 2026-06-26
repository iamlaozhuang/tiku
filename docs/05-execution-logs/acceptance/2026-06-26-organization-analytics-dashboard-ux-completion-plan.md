# Organization Analytics Dashboard UX Completion Plan

Task id: `organization-analytics-dashboard-ux-completion-plan-2026-06-26`

Decision type: `docs_only_dashboard_ux_completion_plan`

## Decision Summary

The organization analytics dashboard should be completed as a low-risk frontend source task using existing API routes
and tests. No dependency, DB, schema, Provider, export delivery, browser/e2e, staging/prod, payment, or external-service
work is needed for the first completion pass.

## Current State

- Route page exists at `src/app/(admin)/organization/organization-analytics/page.tsx`.
- UI exists in `AdminOrganizationAnalyticsPage.tsx`.
- Dashboard summary API exists at `/api/v1/organization-analytics/dashboard-summary`.
- Employee statistics API exists at `/api/v1/organization-analytics/employee-statistics`.
- Contract contains `submittedTrend`, employee statistics DTOs, and export readiness DTOs.
- UI currently centers on a manual organization public id form plus summary cards.

## UX Completion Target

The next source task should implement:

1. Organization context header:
   - use session `organizationPublicId`;
   - display current organization context as a locked/scoped field or summary chip;
   - avoid making publicId typing the first workflow for organization admins.
2. Summary tab/section:
   - existing metrics remain;
   - add submitted trend rendering from `trainingSummary.submittedTrend`;
   - show empty trend state when no points exist.
3. Employee statistics tab/section:
   - fetch existing employee statistics route using the same organization and date range;
   - render employee rows with display name, visible/submitted/unfinished counts, completion rate, average score, latest
     submitted time, and redaction status;
   - render empty, loading, and error states;
   - do not show subjective answer text or raw hidden scope ids.
4. Export readiness:
   - show disabled/deferred state only;
   - do not call export, object storage, external delivery, or create files because no export route is present.
5. Redaction:
   - do not render internal numeric ids, hidden scope organization ids, tokens, local storage, raw answers, or formal
     report/mistake-book details.

## Seeded Source Tasks

1. `admin-ai-generation-provider-disabled-runtime-bridge-contract-tdd-2026-06-26`
   - Seeded from task 2; queued after task 3 so source work starts after all docs-only planning closes.
2. `organization-analytics-dashboard-ux-summary-employee-tabs-tdd-2026-06-26`
   - Frontend + focused unit test source task for the dashboard UX target above.

## Validation Boundary For Source Task

The organization analytics source task should run:

- focused unit test: `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts`;
- `npm.cmd run lint`;
- `npm.cmd run typecheck`;
- scoped Prettier check/write;
- `git diff --check`;
- Module Run v2 hardening and pre-push readiness.

No browser/dev-server/e2e runtime is approved by this plan.

## Non-Decision Statement

This plan is not source implementation, not export enablement, not DB/schema approval, not Provider/Cost readiness, not
staging/prod readiness, not release readiness, and not final Pass.
