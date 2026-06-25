# Task Plan: organization-admin-workspace-runtime-regression-repair-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-regression-repair-2026-06-24`.
- Branch: `codex/org-admin-runtime-regression-repair-20260625`.
- Task kind: `implementation_diagnostic_red_test`.
- Product closure contribution: `organization`.
- Goal: establish a focused red test for real session/account role mapping before deciding source-only repair versus
  schema/migration/seed approval.
- Initial code scope: one red test in `src/server/models/auth.test.ts`.
- Production source repair, schema, migration, dev seed, database access, and account mutation are blocked until the red
  test decision is recorded.
- Final MVP Pass claim: none.

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
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.

## Requirement Decision Map

- R1/R2 in `2026-06-24-role-separated-mvp-requirement-alignment.md`: organization admins need a first-class
  organization-scoped backend workspace, not global operations with a filter.
- R3: `org_standard_admin` can manage employees and view organization authorization/status only.
- R4: `org_advanced_admin` can manage employees, authorization/status, organization training, analytics, and
  organization `AI出题`/`AI组卷`.
- `modules/06-admin-ops.md`: backend workspaces must use role-aware landing, scoped menus, visible logout, and direct
  route denial for unrelated workspaces.
- ADR-002: runtime rules belong in service/repository/model layers, not UI-only state.
- ADR-007: UI visibility is not an authorization boundary; trusted source authorization and role facts must drive
  runtime access.

## Requirement Mapping

- Requirement Mapping Result: `planned_red_test_real_session_account_mapping_before_repair`.
- The red test maps the observed failure to the persisted `admin_role` model because real login/session output currently
  flows from `admin.admin_role` through `local-session-runtime` into `adminRoles`.
- If `adminRoleValues` cannot represent `org_standard_admin` and `org_advanced_admin`, a source-only UI or mapper repair
  is insufficient.

## Role Mapping Result

| Role row             | Required behavior                                                                               | Red-test target                                                                                       |
| -------------------- | ----------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Real session resolves organization-standard role semantics and denies global ops/content.       | Persisted role source must be able to represent `org_standard_admin`.                                 |
| `org_advanced_admin` | Real session resolves organization-advanced role semantics and allows advanced organization UI. | Persisted role source must be able to represent `org_advanced_admin`.                                 |
| `ops_admin`          | Remains global operations only.                                                                 | Red test prevents treating `ops_admin + organization` as sufficient proof of organization admin role. |

## Acceptance Mapping Result

- Acceptance Mapping Result: `pending_red_test`.
- This task does not run browser/runtime acceptance.
- Chinese UI checks remain mandatory for the later runtime rerun after a green repair.
- No standard/advanced MVP final Pass is claimed.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution.md`.

## Conflict Check

- Requirements consistently demand first-class organization admin roles and workspace separation.
- Prior static/unit repairs passed mocked `adminRoles` but runtime rerun failed real organization admin rows.
- Source diagnosis is consistent with runtime evidence: `src/server/models/auth.ts` re-exports `adminRoleValues` from
  `src/db/schema/auth.ts`; `local-session-runtime` maps `admin.admin_role` directly into `adminRoles`.
- Current `adminRoleValues` include `super_admin`, `ops_admin`, and `content_admin` only.
- Therefore the first edit is a red test against the persisted role value model; production repair stops if this proves
  Track B is required.

## Allowed File Scope

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `src/server/models/auth.test.ts` for the red test only.

## Blocked File Scope

- `.env*`.
- `package.json`, package lockfiles, and dependency metadata.
- `src/db/schema/**`.
- `drizzle/**`.
- `src/db/dev-seed.ts`.
- Production source beyond the red-test decision point.
- `e2e/**`, browser artifacts, Playwright reports, and dev-server artifacts.

## Implementation Approach

1. Update `src/server/models/auth.test.ts` so the domain model expects persisted admin roles to include
   `org_standard_admin` and `org_advanced_admin`.
2. Run `npm.cmd run test:unit -- src/server/models/auth.test.ts` and record the red failure.
3. If failure proves the persisted role source cannot express organization admin roles, stop source-only repair and
   update evidence/audit with the Track B recommendation.
4. Do not edit `src/db/schema/auth.ts`, migrations, `src/db/dev-seed.ts`, or production source without fresh approval.

## Validation Commands

- Red test: `npm.cmd run test:unit -- src/server/models/auth.test.ts` (expected to fail before production/schema fix).
- Evidence formatting: `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- Evidence check: `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- Whitespace: `git diff --check`.

## Stop Conditions

- Stop if the red test points to `admin_role` enum expansion, Drizzle migration, dev seed mutation, account mutation, or
  database reads/writes.
- Stop if evidence would expose credentials, tokens, session/cookie/localStorage values, database URLs, raw DB rows,
  plaintext `redeem_code`, raw prompts, raw generated content, or Provider payloads.
- Stop if changed files exceed the allowed file scope.
- Stop before claiming runtime Pass, staging/prod readiness, Provider readiness, Cost Calibration readiness, or final MVP
  Pass.
