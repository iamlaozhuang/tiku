# Organization Workspace State Polish Source-Only Task Plan

## Task

- Task id: `organization-workspace-state-polish-source-only-2026-06-28`
- Branch: `codex/org-workspace-ux-polish-serial-20260628`
- Task kind: `implementation_tdd`
- Approval: current user approved the serial batch on 2026-06-28, with this task first and with local commit allowed only.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md`
- `docs/01-requirements/traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Requirement Decision Map

- Organization admin workspace is a separated backend workspace; standard and advanced organization admins must not enter operations/content workspaces by UI alone.
- `effectiveEdition` and advanced capability remain service-side derived values. UI may consume `AdminWorkspaceCapabilitySummary`; UI must not become the authorization boundary.
- Standard organization admin sees useful organization summary and advanced-unavailable explanations, not advanced controls.
- Advanced organization admin sees training, analytics, and AI draft entry states without Provider, DB, formal publish, export, payment, staging/prod, or final Pass claims.

## Requirement Mapping

| Requirement                                        | Planned source-only behavior                                                                                                        |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| Organization portal standard/advanced distinction  | Add clearer edition/status and upgrade guidance without adding standard advanced links.                                             |
| Organization training advanced polish              | Add local-contract status guidance for draft/source/copy forms and disabled source binding reason before a draft exists.            |
| Organization analytics summary-only boundary       | Add explicit summary-only/export-disabled guidance and empty/loading/error clarity around employee statistics.                      |
| Organization AI generation local-contract boundary | Add organization-specific status copy for history/empty/error and local request cards while keeping Provider/formal writes blocked. |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-standard-advanced-backend-role-browser-validation.md`
- Existing focused unit tests for organization portal, training, analytics, AI generation, and source contract.

These are historical evidence, not requirement SSOT.

## Conflict Check

No conflict found. The source-only UX polish can be implemented with copy/state/test updates only. Permission behavior and browser validation remain separate serial tasks.

## TDD Plan

1. Add failing assertions to focused unit tests for the new copy/state expectations.
2. Run the focused unit test command and record RED.
3. Implement the minimal UI copy/state changes in the allowed frontend files.
4. Run the focused unit test command and broader task gates.

## Allowed Scope

- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts` only if needed
- listed focused unit tests
- this task's plan/evidence/audit/acceptance
- `project-state.yaml` and `task-queue.yaml`

## Blocked Scope

- Browser/dev-server/e2e.
- DB/schema/migration/seed.
- Provider calls or configuration.
- Package/lockfile or `.env*`.
- Cost Calibration, staging/prod/deploy, payment, external-service.
- PR, force push, release readiness, final Pass.

## Validation Commands

- `npm.cmd run test:unit -- tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed files>`
- `npx.cmd prettier --check --ignore-unknown <changed files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-workspace-state-polish-source-only-2026-06-28`

Cost Calibration Gate remains blocked.

## Stop Conditions

- A needed change falls outside allowed files.
- A permission/authorization model change becomes necessary.
- Any browser, DB, Provider, env, schema, dependency, staging/prod, payment, or external-service action becomes necessary.
- Focused tests fail for reasons outside the task and cannot be scoped safely.
