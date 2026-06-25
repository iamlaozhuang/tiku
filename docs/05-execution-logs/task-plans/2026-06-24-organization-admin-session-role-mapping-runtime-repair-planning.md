# Task Plan: organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24

## Task

- Task id: `organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24`.
- Branch: `codex/org-admin-session-role-mapping-planning-20260625`.
- Scope: source repair planning plus focused red test only.
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
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.

## Requirement / Role / Acceptance Mapping Result

| Source                                              | Mapping result                                                                                                                             |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-06-24 role-separated MVP requirement alignment | Organization admin roles must be separated from global operations admin. No MVP final Pass can be claimed here.                            |
| `01-user-auth`                                      | Login/session must map the authenticated account to the correct role context without leaking credentials or tokens.                        |
| `06-admin-ops`                                      | Global operations surfaces remain for `ops_admin` or `super_admin`; organization admin must not be promoted into global ops.               |
| Advanced organization training and AI requirements  | `org_standard_admin` and `org_advanced_admin` require organization workspace entry; advanced-only features remain separate.                |
| Prior runtime evidence                              | Local migration and seed completed, but owner-entered `org_standard_admin` still reached global ops and organization workspace was denied. |

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `src/server/contracts/user-auth/session-boundary.test.ts`.

## Blocked Files And Capabilities

- Blocked: `.env*`, package and lockfiles, schema, migrations, seed execution, DB writes, Provider, Cost Calibration, staging/prod, payment, external services, PR, force push, final Pass.
- Blocked for this task: production source implementation changes in `session-boundary.ts`, `local-session-runtime.ts`, `session-service.ts`, `AdminDashboardLayout.tsx`, and login page code.
- Browser runtime and credential document access are blocked.

## Diagnosis

Facts found from source reading:

1. The login page redirects from the login response's `adminRoles` via `createPostLoginSessionBoundary`.
2. A pure `org_standard_admin` or `org_advanced_admin` role already maps to `/organization/portal`.
3. `AdminDashboardLayout` allows the organization workspace for pure organization admin roles and global operations workspace for `ops_admin` or `super_admin`.
4. Previous runtime evidence therefore means the effective login/session role set was not a pure organization admin role.
5. `findLoginAdminAccountByPhone` reads an admin account by phone without an active-status predicate or deterministic ordering, while session restoration by auth user id filters `active`.

Working hypotheses:

- H1: the owner-entered credential/account mapping still resolves to a legacy global ops admin row.
- H2: the role set is contaminated with a global ops role, and the post-login/workspace boundary grants ops precedence instead of failing closed for organization admin context.
- H3: duplicated or stale admin rows for the same login identifier can make login select a different account from the intended organization admin row.

## Red Test Plan

- Add a focused test for pure organization admin routing to lock the known-good behavior.
- Add a Vitest `it.fails` red test that models organization admin role contamination by `ops_admin`; current code still lands on `/ops/users`, which is the unsafe behavior seen in runtime.
- Keep the red test executable without breaking `master`; the later repair task must convert it into a normal passing test when the source fix is implemented.

## Validation Commands

- `npm.cmd run test:unit -- src/server/contracts/user-auth/session-boundary.test.ts`.
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md src/server/contracts/user-auth/session-boundary.test.ts`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-session-role-mapping-runtime-repair-planning-2026-06-24 -SkipRemoteAheadCheck`.
