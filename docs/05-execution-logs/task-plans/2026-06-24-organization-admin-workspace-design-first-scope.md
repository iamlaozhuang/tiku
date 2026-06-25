# Task Plan: organization-admin-workspace-design-first-scope-2026-06-24

## Task Metadata

- Task id: `organization-admin-workspace-design-first-scope-2026-06-24`.
- Branch: `codex/org-admin-workspace-design-first-scope-20260624`.
- Task kind: `docs_requirement_alignment`.
- Execution profile: `organization_admin_workspace_design_first_no_source_no_runtime`.
- Approval consumed: `current_user_serial_completion_approval_2026_06_24`.
- Product closure contribution: `organization`.
- Source/test implementation by this task: blocked.
- Browser/runtime execution by this task: blocked.
- Standard/advanced MVP final Pass claim: blocked.

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
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.

## Source Read List

- `src/app/(auth)/login/page.tsx`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/app/(admin)/layout.tsx`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/features/admin/content-admin-runtime.tsx`.
- `src/app/(admin)/organization/portal/page.tsx`.
- `src/app/(admin)/organization/organization-training/page.tsx`.
- `src/app/(admin)/organization/organization-analytics/page.tsx`.
- `src/app/(admin)/organization/ai-question-generation/page.tsx`.
- `src/app/(admin)/organization/ai-paper-generation/page.tsx`.
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`.
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`.
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`.
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`.
- `src/server/services/organization-training-route.ts`.
- `src/server/services/organization-analytics-route.ts`.
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx` read by targeted search only.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/organization-portal-admin-entry-surface.test.ts`.
- `tests/unit/organization-training-admin-entry-surface.test.ts`.
- `tests/unit/admin-ai-generation-entry-surface.test.ts`.
- `tests/unit/auth/session-personal-auth-boundary.test.ts`.
- `tests/unit/student-login-ui.test.ts`.

## Requirement Decision Map

- `US-06-01 AC-8`: this task is the required design-first artifact before broad backend workspace UI implementation.
- `US-06-13 AC-8..AC-9`: organization admin rows must land in their own workspace with visible logout and clear denial
  for unrelated backend routes.
- `US-06-14 AC-3..AC-5`: standard organization admin gets scoped employee/auth status only; advanced organization admin
  additionally gets enterprise training and organization `AI出题`/`AI组卷`.
- Advanced organization training and AI modules: standard organization admin must not access training or AI through menu
  or direct URL; advanced organization admin entries must be discoverable.
- ADR-007 and edition-aware authorization SSOT: UI visibility cannot be the only boundary; service checks must enforce
  role, organization scope, and computed edition/capability state.

## Requirement Mapping

- This task creates the design and implementation scope for the next `GAP-ORG-01` source repair.
- The next implementation should close the immediate runtime-visible workspace gap without claiming final Pass:
  - login/landing behavior for pure `org_standard_admin` and `org_advanced_admin`;
  - organization backend shell, menu, visible logout, and Chinese labels;
  - standard/advanced organization portal content;
  - direct-route denial or standard-unavailable states for training, analytics, and organization AI;
  - service-layer role guard updates for organization training and analytics routes;
  - focused unit coverage.
- If implementation discovers a required schema, seed, database, Provider, env, or runtime owner-account change, it must
  stop and open a separate approved task.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-gap-planning.md`.
- Prior runtime evidence remains historical context only; it does not supersede requirement SSOT.

## Conflict Check

- No SSOT conflict found.
- Source read findings are consistent with SSOT and runtime evidence:
  - `session-boundary.ts` already models org admin login landing, but login UI tests do not yet cover org admin rows.
  - `AdminDashboardLayout` already exposes organization workspace shell and logout, but organization portal content has
    visible English labels and standard admin has no employee/auth status surface.
  - organization training and analytics services currently allow legacy admin roles and do not list
    `org_advanced_admin`; the implementation must update service guards, not just menu visibility.
  - organization AI route already has standard-unavailable state, but portal discoverability and Chinese visible copy
    still need repair.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-design-first-scope.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-design-first-scope.md`.

## Blocked Scope

- Product source, tests, e2e, scripts, schema, migrations, seed data, and database reads or writes.
- Browser/runtime validation, dev-server start, credential entry, account actions, storage inspection, screenshots, and
  raw page dumps.
- `.env*`, Provider/model execution or configuration, prompt/provider payloads, quota/cost calibration.
- Staging/prod/cloud/deploy, payment, external service, PR, force push, and final MVP Pass.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-design-first-scope.md`.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-design-first-scope.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-design-first-scope.md`.
3. `git diff --check`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-design-first-scope-2026-06-24`.

## Closeout Plan

- Commit message: `docs(acceptance): define organization admin workspace design scope`.
- Merge target: `master`.
- Push target: `origin/master`.
- Cleanup: delete `codex/org-admin-workspace-design-first-scope-20260624` after successful merge and push.
- Next recommended task: `organization-admin-workspace-runtime-repair-2026-06-24`.
