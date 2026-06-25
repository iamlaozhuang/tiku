# Task Plan: organization-admin-runtime-session-hydration-repair-2026-06-24

## Task

- Task id: `organization-admin-runtime-session-hydration-repair-2026-06-24`.
- Branch: `codex/org-admin-session-hydration-repair-20260625`.
- Task kind: `implementation_tdd`.
- User approval source: current user message on 2026-06-25 naming this task and requiring red tests before repairing real logout/session hydration and fixture SSOT alignment.
- Final standard/advanced MVP Pass claim: false.

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

- Role-separated MVP alignment R1/R2 requires separated backend workspaces with role-aware landing and visible logout.
- `modules/06-admin-ops.md` requires `org_standard_admin` and `org_advanced_admin` to enter a first-class organization backend and be denied unrelated global operations/content surfaces.
- `modules/01-user-auth.md` requires token-backed session behavior; session logout must be a real session boundary, not only local UI navigation.
- ADR-002 requires route handlers to stay thin and delegate business behavior to service/adapter boundaries.
- ADR-007 confirms UI visibility is not an authorization boundary.

## Requirement Mapping

| Requirement area                | Mapping for this task                                                                                            |
| ------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| User auth/session               | Add red tests and repair cookie-backed logout/session invalidation through route/service/adapter surfaces.       |
| Backend workspace separation    | Ensure admin shell logout stops stale cookie-backed sessions before the next role login/hydration attempt.       |
| Organization admin role mapping | Align unit fixtures with the dev seed first-class `org_standard_admin` and `org_advanced_admin` account mapping. |
| Chinese UI                      | Keep visible logout and permission-denied text Chinese; no new English-visible UI labels are allowed.            |
| Final acceptance                | Not in scope; a later owner-entered browser rerun remains required.                                              |

## Role Mapping Result

| Role                 | Expected outcome after this source repair                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Unit fixture and dev seed mapping agree on first-class organization admin identity; browser rerun still required.          |
| `org_advanced_admin` | Unit fixture and dev seed mapping agree on first-class advanced organization admin identity; browser rerun still required. |
| `ops_admin`          | Remains global operations only; not reused as organization admin acceptance evidence.                                      |
| `content_admin`      | Remains content backend only and a denial-regression control.                                                              |
| `super_admin`        | Remains global override and fixture control.                                                                               |

## Acceptance Mapping Result

- Red-test acceptance: focused tests fail before source repair for missing logout/session invalidation and fixture drift.
- Green-test acceptance: focused tests pass after minimal implementation.
- Runtime/browser acceptance: not executed in this task.
- Final standard/advanced MVP Pass: blocked and not claimed.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.

These files explain observed failures and predecessor repairs; they do not replace requirement SSOT.

## Conflict Check

- No requirement conflict found. The latest traceability document explicitly requires first-class organization admin workspaces, visible logout, direct-route denial, and no final Pass claim until fresh runtime evidence passes.
- The implementation conflict is between expected session behavior and current source behavior: logout does not clear the HttpOnly `tiku_session` cookie and no `DELETE /api/v1/sessions` handler exists.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair.md`.
- `src/server/auth/session-boundary.ts`.
- `src/server/auth/session-cookie.ts`.
- `src/server/auth/session-route.ts`.
- `src/server/auth/local-session-logout-route.ts`.
- `src/server/auth/local-session-runtime.ts`.
- `src/server/repositories/session-logout-repository.ts`.
- `src/server/services/session-logout-service.ts`.
- `src/server/services/session-service.ts`.
- `src/app/api/v1/sessions/route.ts`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`.
- `src/server/auth/session-route.test.ts`.
- `src/db/dev-seed.test.ts`.
- `tests/unit/admin-dashboard-layout-navigation.test.ts`.
- `tests/unit/student-login-ui.test.ts`.

## Blocked Files And Work

- Blocked files: `.env*`, package files, lockfiles, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, Playwright artifacts, private credential paths.
- Blocked work: browser runtime, dev server, credential reading/entry, account action, database seed/write/migration, schema migration, dependency change, Provider, Cost Calibration, staging/prod, deploy, payment, external service, PR, force push, and final Pass.

## Implementation Approach

1. Add focused red tests:
   - `DELETE /api/v1/sessions` clears `tiku_session` and delegates logout to service.
   - Admin logout button calls `DELETE /api/v1/sessions` with same-origin credentials before routing to `/login`.
   - Login/layout fixtures use the same organization admin phone-role mapping as `src/db/dev-seed.ts`.
2. Verify the red tests fail for the expected reason before production edits.
3. Implement minimal source repair:
   - add expired session cookie helper;
   - add focused logout service/repository boundary without changing broad login/session runtime files;
   - add route `DELETE` handler and app route export;
   - update admin shell logout to request server logout and still clear local marker.
4. Align unit fixtures to dev seed organization admin mapping without changing schema, migrations, database state, or private credential files.

## Validation Commands

1. RED: `npx.cmd vitest run src/server/auth/session-route.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts --reporter=dot`.
2. GREEN: `npx.cmd vitest run src/server/auth/session-route.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts src/db/dev-seed.test.ts --reporter=dot`.
3. `npm.cmd run lint`.
4. `npm.cmd run typecheck`.
5. Scoped Prettier check for changed docs/source/test files.
6. `git diff --check`.
7. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-session-hydration-repair-2026-06-24`.
8. `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-session-hydration-repair-2026-06-24 -SkipRemoteAheadCheck`.

## Evidence And Audit Requirements

- Evidence must record RED and GREEN command summaries without secrets, cookie values, Authorization headers, browser storage, database rows, credentials, or screenshots.
- Audit must review auth/session boundary, fixture SSOT alignment, blocked gates, and no final Pass claim.

## Stop Conditions

- Stop if schema/migration, database access/write, env/secret access, Provider, browser runtime, or credential handling becomes necessary.
- Stop if changed files leave the allowed scope.
- Stop if the same validation blocker repeats three times.
