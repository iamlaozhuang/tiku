# Task Plan: organization-admin-runtime-session-hydration-repair-planning-2026-06-24

## Summary

- Task id: `organization-admin-runtime-session-hydration-repair-planning-2026-06-24`.
- Task kind: `docs_requirement_alignment`.
- Branch: `codex/org-admin-session-hydration-planning-20260625`.
- Scope: focused docs/state-only root-cause planning for why real browser session hydration still resolves organization admin rows into the global operations workspace.
- Source/test/schema/seed/database/runtime changes: not approved.
- Final standard/advanced MVP Pass claim: blocked and not claimed.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/`.
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
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-provisioning-and-credential-handoff-execution.md`.
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-local-account-runtime-rerun.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-session-role-mapping-runtime-repair.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-rerun-after-session-role-repair.md`.

## Requirement Mapping Result

| Requirement source                     | Planning conclusion                                                                                                                                                        |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| User auth/session boundary             | The repair must prove that logout ends the browser-visible server session, and that subsequent hydration reads the newly logged-in account rather than stale cookie state. |
| Admin ops role separation              | Organization admin rows must not hydrate as `ops_admin` and must not reach `/ops/*` unless the session is truly `super_admin`.                                             |
| Organization admin workspace           | `org_standard_admin` and `org_advanced_admin` must land in `/organization/portal` and hydrate as organization-scoped admins.                                               |
| Advanced edition organization behavior | `org_advanced_admin` may see organization training and organization AI entries; `org_standard_admin` must not. This planning task does not execute that runtime layer.     |
| Chinese UI                             | Future runtime rerun must keep checking visible Chinese copy for login, landing, denial, unavailable, navigation, and logout states.                                       |

## Role Mapping Result

| Role                 | Expected session/hydration result                                                                                | Current diagnostic status                                                                           |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | `adminRoles` includes `org_standard_admin`; lands organization workspace; denies global ops/content.             | Failing in real browser evidence; likely stale server cookie and/or legacy account fixture mapping. |
| `org_advanced_admin` | `adminRoles` includes `org_advanced_admin`; lands organization workspace; advanced organization entries visible. | Failing in real browser evidence; same hydration and fixture risk as standard row.                  |
| `ops_admin`          | Stays global operations only.                                                                                    | Must remain a control row; must not be used as organization admin proof.                            |
| `content_admin`      | Stays content workspace only.                                                                                    | Out of direct scope except as unrelated-workspace denial regression guard.                          |
| `super_admin`        | Can remain global privileged override.                                                                           | Out of direct scope except as explicit override guard.                                              |

## Acceptance Mapping Result

- This planning task passes only if it creates a focused root-cause plan, records source-orientation evidence, updates state/queue, and keeps all product mutation blocked.
- The next implementation task must start with red tests that show:
  - backend logout currently fails to expire the HttpOnly `tiku_session` cookie or service session;
  - the current admin shell logout only clears `localStorage`, so a browser can still hydrate from the old server cookie;
  - role/account fixture mappings are inconsistent across legacy acceptance accounts, dev seed, and unit mocks.
- A later runtime rerun cannot treat visible navigation to `/login` as logout Pass unless a follow-up `/api/v1/sessions` check or protected-route probe proves the old session is no longer valid.
- This task does not approve or perform browser runtime execution and does not declare final Pass.

## Source Orientation

- `src/app/(auth)/login/page.tsx` routes after login using `createPostLoginSessionBoundary(payload.data.user)`, so login landing depends on the `adminRoles` returned in the login response.
- `src/server/contracts/user-auth/session-boundary.ts` already routes pure `org_standard_admin` and `org_advanced_admin` roles to `/organization/portal`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` rehydrates with `GET /api/v1/sessions` and authorizes workspaces from `sessionResponse.data.user.adminRoles`.
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx` logout only removes `tiku.localSessionToken` and routes to `/login`; it does not clear the HttpOnly `tiku_session` cookie and does not invalidate the server session.
- `src/server/auth/session-route.ts` supports `POST` and `GET` only; no logout or cookie-expiry route exists.
- `src/server/auth/session-cookie.ts` creates and reads `tiku_session`, but has no cookie-clear helper.
- `src/server/auth/local-session-runtime.ts` maps admin role from `admin.admin_role`; if the active session is for a legacy account still stored as `ops_admin`, hydration will correctly produce global ops behavior.
- `src/db/dev-seed.ts` now defines dev seed organization admins as `13900000004 -> org_standard_admin` and `13900000005 -> org_advanced_admin`.
- `tests/unit/student-login-ui.test.ts` and `tests/unit/admin-dashboard-layout-navigation.test.ts` still use stale fixture phone/role mappings where `13900000004` is content admin, `13900000005` is organization standard admin, and `13900000006` is organization advanced admin.
- 2026-06-23 account provisioning evidence states the owner-entered organization admin acceptance accounts were created as organization-bound `ops_admin` rows because first-class organization admin enum values did not exist yet.

## Root-Cause Hypothesis Set

1. Confirmed design defect: backend logout is incomplete. The UI returns to `/login` but does not clear the HttpOnly `tiku_session` cookie or invalidate the server session, so stale global ops hydration can survive row switches.
2. Confirmed fixture drift: legacy owner-entered organization admin accounts were originally `ops_admin` rows, while later dev seed rows use new organization admin role values. The evidence trail does not prove the manual browser login used the new seeded accounts.
3. Confirmed test drift: unit/login fixture phone-role mappings diverge from dev seed. Tests can pass with a mocked role payload that does not match the real local seed account sequence.
4. Secondary risk: admin lookup and hydration are split between login response and current-session hydration. The next repair must test both surfaces against the same role matrix, not only pure boundary functions.

## Recommended Repair Design

- Track A: implement real logout.
  - Add a session logout boundary that clears `tiku_session` with an expired HttpOnly cookie.
  - Prefer invalidating/deleting the current server session when the token is present.
  - Update `AdminDashboardLayout` logout to call the logout endpoint before navigating to `/login`.
- Track B: align account-role fixtures to one SSOT.
  - Update unit mocks to match current dev seed role phone sequence or replace literal phone assertions with named fixture constants imported from the seed contract where feasible.
  - Add a regression test that the dev seed organization admin accounts and login/session fixture payloads agree on role, public id, and organization scope expectations.
- Track C: add runtime-safe hydration red tests before broad UI work.
  - Test login response and `GET /api/v1/sessions` using organization admin roles.
  - Test that stale cookie cleanup prevents an old ops session from authorizing `/ops/*` after logout.
  - Test that organization admin sessions cannot access `/ops/users` even after a previous ops session in the same browser.

## Allowed File Range

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.

## Blocked Without Fresh Approval

- Product source, tests, scripts, e2e, schema, migration, seed, local database read/write, account mutation, credential file access, credential entry by Codex, dev server start, browser runtime execution, dependency or lockfile changes, `.env*`, Provider/model/cost, staging/prod/deploy, payment, external services, PR/force push, and final Pass claims.

## Validation Plan

- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/evidence/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-runtime-session-hydration-repair-planning.md`.
- `git diff --check`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-runtime-session-hydration-repair-planning-2026-06-24`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-runtime-session-hydration-repair-planning-2026-06-24 -SkipRemoteAheadCheck`.
