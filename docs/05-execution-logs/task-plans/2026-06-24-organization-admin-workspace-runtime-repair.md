# Task Plan: organization-admin-workspace-runtime-repair-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-repair-2026-06-24`.
- Branch: `codex/org-admin-workspace-runtime-repair-20260624`.
- Task kind: implementation.
- Source planning artifact:
  `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- Goal: repair organization admin landing, organization workspace entries, direct-route unavailable/denial states,
  organization service role guards, and focused unit coverage.
- Final MVP Pass: not claimed.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/stories/epic-01-user-auth.md`.
- `docs/01-requirements/stories/epic-06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`.
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-design-first-scope.md`.

## Requirement Decision Map

- `US-06-01 AC-8`: design-first artifact exists and constrains this source task.
- `US-06-13 AC-8..AC-9`: organization admin workspace landing and direct-route denial/unavailable states are in scope.
- `US-06-14 AC-3..AC-5`: standard and advanced organization admin split is in scope.
- Advanced organization training and organization AI requirements: advanced organization admins may see enterprise
  training, analytics, `AI出题`, and `AI组卷` entries; Provider execution remains out of scope.
- ADR-007 and edition-aware authorization SSOT: UI visibility cannot be the only permission boundary; service guards must
  enforce organization role scope where this task touches runtime services.

## Requirement/Role/Acceptance Mapping Result

- Requirement mapping result: planned source changes map to the design-first scope and `GAP-ORG-01`; no extra
  requirements are introduced.
- Role mapping result:
  - `org_standard_admin`: `/organization/portal` landing, Chinese organization portal, employee/auth status summaries,
    no enterprise training/analytics/AI entries, Chinese unavailable states on direct advanced routes.
  - `org_advanced_admin`: `/organization/portal` landing, Chinese organization portal, enterprise training, analytics,
    organization `AI出题`, and organization `AI组卷` entries.
  - `ops_admin`: remains system operations workspace.
  - `content_admin`: remains content backend workspace.
  - `super_admin`: compatibility retained without treating organization-only acceptance as final Pass.
- Acceptance mapping result:
  - Static/unit acceptance required in this task.
  - Chinese UI visible-text check required for changed organization admin surfaces.
  - Browser/runtime acceptance is not executed by this task.
  - Standard/advanced MVP final Pass is not claimed.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`.
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/server/services/organization-training-route.ts`.
- `src/server/services/organization-analytics-route.ts`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/organization-portal-admin-entry-surface.test.ts`.
- `tests/unit/organization-training-admin-entry-surface.test.ts`.
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/auth/session-personal-auth-boundary.test.ts`.
- `tests/unit/student-login-ui.test.ts`.
- `src/server/services/organization-training-route.test.ts`.
- `src/server/services/organization-analytics-route.test.ts`.

## Blocked Scope

- `.env*`, package and lockfile changes, dependency introduction, schema/migration/seed/database mutation.
- Provider/model execution or configuration, cost/quota calibration, raw generated content, prompt payload validation.
- Browser/runtime observation, dev-server start, owner credential entry, account actions, screenshots.
- Staging/prod/cloud deploy, payment, external service, PR, force push, final MVP Pass.
- Any source file outside the allowlist above.

## Implementation Steps

1. Update focused unit/static tests for organization admin login/landing, navigation, portal copy, advanced entries, and
   direct standard unavailable states.
2. Repair organization portal copy and role-aware standard/advanced entry rendering with Chinese visible UI.
3. Repair organization training and analytics page/service role guards for `org_advanced_admin` and standard-unavailable
   states.
4. Preserve organization AI entry Provider boundary while ensuring Chinese standard-unavailable states and advanced
   entries remain covered.
5. Run the declared validation command set and record exact results in evidence.
6. Update evidence/audit/state/queue, commit, fast-forward merge to `master`, push `origin/master`, and delete the short
   branch only after gates pass.

## Risk Controls

- Keep service authorization changes narrow and role explicit.
- Do not infer edition from UI labels alone.
- Do not use runtime/browser observations as evidence for this task.
- Stop and split if a required fix needs data, seed, credential, Provider, dependency, schema, or non-allowlisted files.
