# Organization Admin Standard Advanced Workspace Source Contract Task Plan

## Task

- Task id: `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`
- Branch: `codex/organization-admin-workspace-source-contract-20260628`
- Task kind: `implementation_tdd`
- Scope: organization admin standard/advanced workspace source integration plus permission contract adapter.
- Runtime claim: none.
- Release claim: none.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Requirement Decision Map

- `2026-06-24-role-separated-mvp-requirement-alignment.md`: `org_standard_admin` and `org_advanced_admin` must land in a first-class organization workspace; hidden menus are not permission boundaries.
- `2026-06-27-standard-advanced-backend-ux-design-first-contract.md`: organization advanced routes must consume a service-computed capability summary and return standard-unavailable for standard organization capability.
- ADR-007 and edition-aware authorization requirements: `effectiveEdition` is derived by service-layer authorization logic and must not be computed from UI state.
- Organization training, analytics, and organization AI generation modules: standard organization admins cannot use enterprise training, analytics, `AI出题`, or `AI组卷`; advanced organization admins need discoverable entries inside organization scope.

## Requirement Mapping

- This task closes only the source/permission-contract slice for organization admin pages and layout navigation.
- Organization advanced route/pages will call the prior `backend-workspace-role-guard-contract-tdd-2026-06-27` guard boundary with `AdminWorkspaceCapabilitySummary`.
- UI pages must not hardcode `effectiveEdition: "advanced"` or infer advanced authorization only from `adminRoles`.
- The session DTO will expose a server-side `adminWorkspaceCapability` summary for organization admins. This is a local source contract adapter, not a claim that full `org_auth`/`auth_upgrade` persistence computation is complete.
- Browser/runtime role acceptance remains a later approved task.

## Evidence-Only Sources

- `docs/05-execution-logs/task-plans/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-27-backend-workspace-role-guard-contract-tdd.md`
- `docs/05-execution-logs/acceptance/2026-06-27-backend-workspace-role-guard-contract-tdd.md`

## Conflict Check

- No conflict found between requirements, traceability, ADR-007, and the prior permission contract.
- Known limitation: current session source has role and organization binding, but not full persisted `org_auth` edition and `auth_upgrade` facts. This task may expose a session capability adapter for source integration, but evidence must state that true `org_auth` runtime computation remains future gated work.

## User Approval Boundary

Current user approved `organization-admin-standard-advanced-workspace-source-contract-2026-06-27`.

Allowed changes:

- task-queue-listed organization admin workspace page/state components;
- necessary route guard integration;
- capability contract adapter;
- focused unit tests;
- docs/evidence/audit/acceptance for this task.

Required invariants:

- Reuse the service-layer capability summary boundary from `backend-workspace-role-guard-contract-tdd-2026-06-27`.
- `effectiveEdition` remains service-computed.
- UI must not be an authorization boundary.

Blocked surfaces:

- schema, migration, seed;
- package or lockfile changes;
- `.env*`;
- DB connection or write;
- Provider call or configuration;
- Cost Calibration;
- staging/prod/deploy;
- payment, OCR, export, external service;
- browser/dev-server/e2e;
- PR, force push, release readiness, final Pass.

## Implementation Plan

1. Materialize this task in `project-state.yaml` and `task-queue.yaml`.
2. Write RED focused unit tests that prove:
   - organization advanced pages deny or show standard-unavailable when `adminRoles` say `org_advanced_admin` but service summary is standard or missing advanced capability;
   - organization advanced page writes use the service-provided capability context rather than hardcoded `effectiveEdition`;
   - organization layout menu visibility consumes service summary and remains advisory only;
   - direct page access still uses the route guard decision.
3. Add or update the session capability adapter:
   - add optional `adminWorkspaceCapability` to `AuthenticatedUserDto`;
   - map organization-admin session capability summary on the server side;
   - avoid exposing internal numeric ids or sensitive material.
4. Add a small organization workspace access helper for source pages:
   - consume `AuthContextDto.user.adminWorkspaceCapability`;
   - call `resolveAdminWorkspaceRouteAccess`;
   - fail closed when service summary is missing for organization advanced pages.
5. Wire organization portal, training, analytics, organization AI generation, and layout navigation to the helper.
6. Run focused unit tests to GREEN, then lint, typecheck, scoped Prettier, diff check, project status, and Module Run v2 gates.
7. Write redacted evidence, audit review, and acceptance note.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/contracts/auth-contract.ts`
- `src/server/mappers/auth-mapper.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `tests/unit/organization-portal-admin-entry-surface.test.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-admin-standard-advanced-workspace-source-contract.md`

## Validation Plan

- RED: `npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- GREEN: `npm.cmd run test:unit -- tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-standard-advanced-workspace-source-contract-2026-06-27 -SkipRemoteAheadCheck`

## Risk Controls

- No schema, migration, DB, Provider, browser, e2e, dependency, env, staging, prod, deploy, payment, OCR, export, or external-service work.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write path is introduced.
- Organization analytics remains summary-only and export-disabled.
- AI generation remains Provider-disabled and formal-adoption-blocked.
- Evidence records only file paths, command status, aggregate test counts, and redacted result summaries.
- This task will not claim release readiness or final Pass.
