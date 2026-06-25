# Task Plan: organization-admin-session-role-mapping-runtime-repair-2026-06-24

## Task

- Task id: `organization-admin-session-role-mapping-runtime-repair-2026-06-24`.
- Branch: `codex/org-admin-session-role-mapping-runtime-repair-20260625`.
- Entry master/origin SHA: `e02bf25b935829ebf70de19f44c3ccfbfa344b11`.
- Scope: source-only repair plus focused unit red/green tests.
- Closeout approval: current user approved commit, merge to `master`, push to `origin/master`, and short-branch cleanup on 2026-06-25.
- Final Pass claim: blocked.

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
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.

## Requirement / Role / Acceptance Mapping Result

| Source                                              | Mapping result                                                                                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-06-24 role-separated MVP requirement alignment | R1/R2 require backend workspace separation; enterprise admins must not be represented as ordinary `ops_admin` in acceptance.                 |
| `modules/01-user-auth.md`                           | Login/session must preserve the effective account role boundary without exposing bearer token or credential artifacts.                       |
| `modules/06-admin-ops.md`                           | Global operations workspace remains for true `ops_admin`/`super_admin`; unrelated backend surfaces must deny cross-role access.              |
| Advanced organization requirements                  | `org_standard_admin` and `org_advanced_admin` require organization workspace entry; advanced-only organization entries remain edition-aware. |
| Prior planning red test                             | Pure organization roles already pass; contaminated `org_*_admin + ops_admin` currently routes to `/ops/users` and must be repaired.          |

## Root Cause And Hypothesis

- Observed runtime defect: owner-entered `org_standard_admin` reached `/ops/users`, could reach `/ops/redeem-codes`, and was denied from `/organization/portal`.
- Confirmed from source: `resolveAdminWorkspaceLandingPath` treats organization admins as organization workspace only when no `ops_admin`, `content_admin`, or `super_admin` is present.
- Confirmed from source: `AdminDashboardLayout` allows operations workspace whenever the session role set contains `ops_admin`, even if an organization admin role is also present.
- Working hypothesis: source boundaries give global roles precedence over organization roles for contaminated sessions, so organization admin contexts can be promoted into global operations workspace.
- Repair principle: if an organization admin role is present and `super_admin` is absent, organization workspace must be the effective admin workspace; direct ops/content access must be denied.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `src/server/contracts/user-auth/session-boundary.ts`.
- `src/server/contracts/user-auth/session-boundary.test.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.

## Blocked Files And Capabilities

- Blocked: `.env*`, package and lockfiles, schema, migrations, dev seed, DB query/write/migration/seed execution, Provider, Cost Calibration, staging/prod, payment, external services, PR, force push, final Pass.
- Blocked: credential document reading, credential entry by Codex, browser runtime, Playwright runtime, dev server start.
- Source-only boundary: no changes to `local-session-runtime.ts`, `session-service.ts`, login page, schema, seed, or migration in this task.

## Implementation Plan

1. Convert the existing `it.fails` contaminated organization admin role test into a normal failing test.
2. Add a layout unit test proving contaminated organization admin sessions cannot render `/ops/users` content.
3. Run the focused unit command and record the expected red failure.
4. Implement the smallest source repair:
   - organization admin role precedence in post-login landing when `super_admin` is absent;
   - organization admin role precedence in admin workspace guard when `super_admin` is absent.
5. Rerun focused unit tests, then lint, typecheck, formatting check, diff check, and Module Run v2 gates.
6. Update evidence/audit/state/queue and close out via commit, merge, push, cleanup.

## Validation Commands

- Red: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`.
- Green: `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md src/server/contracts/user-auth/session-boundary.ts src/server/contracts/user-auth/session-boundary.test.ts src/components/AdminDashboardLayout/AdminDashboardLayout.tsx tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-2026-06-24`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-2026-06-24 -SkipRemoteAheadCheck`.
