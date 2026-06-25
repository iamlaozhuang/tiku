# Task Plan: organization-admin-workspace-runtime-regression-repair-planning-2026-06-24

## Summary

- Task id: `organization-admin-workspace-runtime-regression-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-runtime-regression-planning-20260625`.
- Task kind: `docs_requirement_alignment`.
- Scope: convert the failed organization-admin runtime rerun into a deeper repair plan before any source repair.
- Product source/test changes in this task: none.
- Browser/runtime execution in this task: none.
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

- `2026-06-24-role-separated-mvp-requirement-alignment.md`: organization admins are a first-class organization-scoped
  backend domain, not system operations admins with a filter bolted on.
- `modules/06-admin-ops.md`: `org_standard_admin` and `org_advanced_admin` must land in the organization backend, get
  visible logout, clear navigation, scoped menus, and denial from unrelated workspaces.
- `advanced-edition/modules/04-organization-training.md`: standard organization admins cannot access enterprise training;
  advanced organization admins can manage training inside organization scope.
- `advanced-edition/modules/08-organization-ai-generation.md`: standard organization admins cannot use organization AI
  generation; advanced organization admins must have discoverable `AI出题` and `AI组卷` entries.
- ADR-007: UI visibility is not an authorization boundary; effective edition and capability checks must be enforced in
  runtime services.

## Requirement Mapping

- Requirement Mapping Result: `pass_regression_repair_plan_prepared_no_source_no_runtime_no_final_pass`.
- The failed rows map to R1, R2, R3, and R4 in the role-separated alignment.
- The next repair must prove the real login/session/account chain, not only mocked `adminRoles`.
- Execution logs are used only as evidence for observed failure and historical repair attempts.

## Role Mapping Result

| Role row             | Required behavior                                                                                  | Current observed failure                                                                                                       | Planning result                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Land in organization backend; manage employees and organization authorization/status only.         | Landed in or could access `/ops/users`; `/organization/*` returned `无权访问此后台工作区`; `/ops/redeem-codes` was accessible. | Next repair must make real session role/scope source return organization-standard semantics.      |
| `org_advanced_admin` | Land in organization backend; see enterprise training, analytics, `AI出题`, and `AI组卷`.          | Landed in or could access `/ops/users`; organization backend routes were denied; `/ops/redeem-codes` was accessible.           | Next repair must make real session role/scope source return organization-advanced semantics.      |
| `ops_admin`          | System operations workspace only; not a proxy for organization-admin acceptance.                   | Historical provisioning evidence says enterprise admin rows use existing `ops_admin` plus organization linkage.                | Next repair must separate platform operations role from organization-admin role or computed role. |
| `content_admin`      | Content workspace only; should not influence organization-admin repair except as regression guard. | Not the failing row in the latest rerun.                                                                                       | Keep as regression guard.                                                                         |

## Acceptance Mapping Result

- Planning acceptance: pass when this task records root-cause hypotheses, allowed repair scope, stop conditions, and
  validation standards.
- Runtime acceptance remains failed and blocked until a later approved rerun proves both organization admin rows.
- Chinese UI acceptance must be included in the later runtime rerun: no visible technical English such as `Admin Ops`,
  `contact_config`, raw role strings, or backend-internal labels on surfaces reachable by the tested roles.
- Final standard/advanced MVP Pass remains blocked.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-role-separated-account-inventory.md`.

## Conflict Check

- No requirement conflict was found: current requirements consistently require first-class organization admin workspaces.
- Evidence conflicts with the prior static/unit repair claim: mocked UI/session tests passed, but real runtime rows failed.
- Static source diagnosis explains the conflict: runtime session role data appears unable to carry organization admin roles
  from current persistence because `adminRoleValues` and the initial `admin_role` enum only include
  `super_admin`, `ops_admin`, and `content_admin`.
- This task does not resolve the persistence model. If the next repair needs schema or migration work, it must stop for a
  schema/migration/seed-approved task instead of proceeding as a source-only repair.

## Read-Only Source Diagnosis

- `src/server/contracts/user-auth/session-boundary.ts` already routes mocked pure `org_standard_admin` and
  `org_advanced_admin` roles to `/organization/portal`.
- `src/app/(auth)/login/page.tsx` uses that post-login boundary and therefore depends on `/api/v1/sessions` returning
  correct `adminRoles`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` denies `/ops/*` unless the current session has
  `ops_admin`, and allows `/organization/*` when the current session has an organization-admin role.
- `tests/unit/student-login-ui.test.ts` and `tests/unit/admin-dashboard-layout-navigation.test.ts` validate mocked
  organization roles, but do not prove that the real repository/session runtime can produce them from persisted local
  accounts.
- `src/db/schema/auth.ts` and `drizzle/0000_nebulous_sugar_man.sql` define `admin_role` without
  `org_standard_admin` or `org_advanced_admin`.
- `src/db/dev-seed.ts` seeds one `super_admin` and an `admin_organization` assignment for that admin; it does not seed
  role-separated organization admin accounts.
- Prior 2026-06-23 audit evidence states organization admin rows currently use the existing `ops_admin` role plus
  organization linkage because there is no first-class organization-admin enum.

## Root-Cause Hypotheses

1. Primary hypothesis: real organization-admin accounts are persisted as `ops_admin` plus `admin_organization` linkage,
   so login and `/api/v1/sessions` return `ops_admin`, causing `/ops/*` access and `/organization/*` denial.
2. Secondary hypothesis: even if an account has organization linkage, the current session DTO exposes only
   `admin.admin_role`; it does not compute organization-admin roles from a trusted source.
3. Coverage hypothesis: prior repairs validated mocked frontend/session roles and organization page guards, but did not
   add a repository/runtime test that proves real seeded or persisted accounts produce the required organization roles.
4. UI residual hypothesis: `Admin Ops` and `contact_config` are visible because org-admin rows incorrectly reach ops
   surfaces; copy cleanup alone cannot satisfy permission acceptance.

## Allowed Implementation Scope For Next Task

The next repair task must independently create its own task plan, SSOT Read List, Requirement/Role/Acceptance Mapping
Result, and allowed file scope before source edits.

Recommended Track A, only if diagnosis proves no schema/migration is needed:

- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/server/contracts/auth-contract.ts`.
- `src/server/repositories/auth-repository.ts`.
- `src/server/repositories/session-repository.ts`.
- `src/server/mappers/auth-mapper.ts`.
- `src/server/services/session-service.ts`.
- `src/server/auth/local-session-runtime.ts`.
- `src/app/(auth)/login/page.tsx`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- Existing focused tests under `tests/unit/` and `src/server/auth/*.test.ts`.
- Docs/state/evidence/audit files for the implementation task.

Recommended Track B, likely required if the role model gap is confirmed:

- Everything in Track A.
- `src/db/schema/auth.ts`.
- `src/server/models/auth.ts`.
- `src/server/models/auth.test.ts`.
- `src/db/dev-seed.ts` only for local dev fixture closure after approval.
- A reviewed Drizzle migration and metadata files under `drizzle/**`.
- This track requires fresh explicit schema/migration/seed approval before implementation.

## Blocked Scope

- `.env*`, dependency and lockfile changes, Provider/model/cost, staging/prod/cloud/deploy, payment, external services,
  PR, force push, and Cost Calibration Gate.
- Database reads/writes, migration execution, credential document reads, credential entry by Codex, browser runtime, and
  account mutation unless a later task explicitly approves them.
- Final standard/advanced MVP Pass.

## Acceptance Standards For The Later Repair

- Unit/service tests must reproduce the real session/account mapping failure before or alongside implementation.
- `org_standard_admin` login/session boundary must resolve to `/organization/portal`, allow `/organization/portal`, deny
  `/ops/users`, `/ops/redeem-codes`, and `/content/papers`, and hide advanced organization links.
- `org_advanced_admin` login/session boundary must resolve to `/organization/portal`, allow organization portal,
  enterprise training, analytics, `AI出题`, and `AI组卷`, and deny global ops/content authoring surfaces.
- Route and service guards must not rely on hidden menus alone.
- Runtime rerun after repair must include Chinese UI checks and must not record secrets, storage, raw HTML, screenshots,
  provider payloads, raw generated content, plaintext `redeem_code`, or database rows.

## Validation Commands

1. `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
2. `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/acceptance/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair-planning.md`.
3. `git diff --check`.
4. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-workspace-runtime-regression-repair-planning-2026-06-24`.
5. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-workspace-runtime-regression-repair-planning-2026-06-24 -SkipRemoteAheadCheck`.

## Stop Conditions

- Stop before source repair if the next task requires `admin_role` enum expansion, Drizzle migration, dev seed mutation, or
  account mutation without fresh approval.
- Stop if validation evidence would need to expose credentials, sessions, cookies, `.env*`, database URLs, raw DB rows, or
  plaintext `redeem_code`.
- Stop if changed files exceed the task allowlist.
