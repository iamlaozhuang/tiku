# 2026-07-03 Organization Workspace Role Boundary Source Landing Plan

## Task

`organization-workspace-role-boundary-source-landing-2026-07-03`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Source Observations

- `admin-workspace-role-guard-service.ts` already blocks organization admins from ops/content workspaces and gates advanced organization routes.
- `admin-organization-workspace-access.ts` maps session capability summaries for organization pages, but `canUseOrganizationAdvancedWorkspaceCapability` only checks capability fields, not the advanced organization-capable role itself.
- `AdminDashboardLayout.tsx` hides advanced organization menu entries for standard capability summaries, but it relies on the same helper.
- `AdminOrganizationPortalPage.tsx` shows standard summaries and advanced destinations, but the standard employee/status wording can be clearer for non-technical users.

## Implementation Plan

1. Add role-aware advanced organization capability checks in the organization workspace access helper.
2. Keep standard organization admins on employee roster/status and authorization/status surfaces only even when a malformed capability flag is true.
3. Update organization portal and layout copy to explicitly communicate standard read-only/status boundaries and platform-owned mutations.
4. Add focused tests covering malformed standard-role capability summaries, advanced-role access, portal copy, and existing direct-route denial behavior.

## Boundaries

- No schema, migration, seed, dependency, package/lockfile, Provider call, env secret access, browser/dev-server/e2e, direct DB connection, staging/prod deploy, PR, force push, Cost Calibration, release readiness, final Pass, or production-readiness claim.
- Evidence must not record credentials, sessions, cookies, auth headers, env values, raw DB rows, PII, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, raw employee answers, full question/paper/material/resource/chunk content, screenshots, traces, or raw DOM.

## Validation

- `npm.cmd run test:unit -- tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- Module Run v2 pre-commit, closeout, and pre-push readiness gates for this task id.
