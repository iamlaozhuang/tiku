# Task Plan: backend-workspace-landing-logout-separation-repair-2026-06-24

## Required Reading

- AGENTS.md
- docs/03-standards/code-taste-ten-commandments.md
- docs/03-standards/ui-code.md
- docs/02-architecture/adr/
- docs/04-agent-system/operating-manual.md
- docs/04-agent-system/sop/requirement-ssot-reading-governance.md
- docs/04-agent-system/sop/task-lifecycle-governance.md
- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/06-admin-ops.md
- docs/01-requirements/stories/epic-06-admin-ops.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Decision Map

- R1 requires backend workspaces to be separated by role, with role-aware landing, visible logout, and clear denial for
  unrelated backend surfaces.
- R2 recognizes enterprise admin as a first-class organization-scoped domain, but current code has no
  `org_standard_admin` or `org_advanced_admin` enum in `src/db/schema/auth.ts`. This task must not add enum values or
  schema/migration work.
- R8 requires `ops_admin` to be denied from content authoring surfaces.
- US-06-13 AC-8 and AC-9 require backend users to land in their own workspace, have visible logout, and see clear denial
  for unrelated routes.
- US-06-14 AC-1, AC-2, and AC-5 are in scope for currently modeled `ops_admin` and `content_admin`; AC-3 and AC-4 are
  deferred because they need organization admin role modeling and authorization scope follow-up.

## Requirement Mapping

- `super_admin`: may access both operations and content backend workspaces and should default to the operations entry
  because it is the broadest governance landing.
- `ops_admin`: must land on `/ops/users`, see operations navigation and logout, and be denied from `/content/*`.
- `content_admin`: must land on `/content/papers`, see content navigation and logout, and be denied from `/ops/*`.
- Unknown or future admin role labels must not be treated as authority for unrelated workspaces.
- `org_standard_admin` and `org_advanced_admin` remain blocked for this task because the schema enum and session contract
  do not yet model them; evidence must record that residual gap instead of claiming all eight roles pass.

## Evidence-Only Sources

- docs/05-execution-logs/acceptance/2026-06-23-role-separated-mvp-repair-issue-list-and-requirement-decisions.md
- docs/05-execution-logs/evidence/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/05-execution-logs/audits-reviews/2026-06-24-role-separated-mvp-requirement-alignment.md

These files are read as historical evidence and decision provenance. They do not replace the requirement SSOT files
listed above.

## Conflict Check

- There is no conflict between R1/R8 and the current implementation gap: `AdminDashboardLayout` currently chooses menu
  only from the URL pathname, so direct navigation can cross content/ops workspaces.
- There is a scoped conflict between R2/US-06-14 and the current schema. Organization admin roles are required by SSOT,
  but adding them needs schema/migration approval. This task records that gap and implements only the currently modeled
  admin roles.
- `docs/05-execution-logs/` evidence confirms runtime gate failure, but this task must not claim standard/advanced MVP
  final Pass after local unit validation.

## Scope

- Task id: backend-workspace-landing-logout-separation-repair-2026-06-24
- Branch: codex/backend-workspace-landing-logout-20260624
- Task kind: implementation
- Product closure contribution: admin role-separated backend workspace repair, partial for current modeled roles.

Allowed files:

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- src/server/contracts/user-auth/session-boundary.ts
- src/app/(auth)/login/page.tsx
- src/components/AdminDashboardLayout/AdminDashboardLayout.tsx
- src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx
- src/features/admin/content-admin-runtime.tsx
- tests/unit/student-login-ui.test.ts
- tests/unit/admin-dashboard-layout-navigation.test.ts
- tests/unit/protected-route-guard-ui.test.ts
- tests/unit/auth/session-personal-auth-boundary.test.ts
- docs/05-execution-logs/task-plans/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md

Blocked files and actions:

- `.env*`
- package files and lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- `scripts/**`
- database reads/writes, seed, schema migration, Provider call/configuration, Cost Calibration Gate, browser/e2e runtime,
  staging/prod/cloud/deploy, payment, external services, PR, force push, final acceptance Pass.

## Implementation Plan

1. Write failing tests for role-aware post-login redirects:
   - `ops_admin` redirects to `/ops/users`.
   - `content_admin` redirects to `/content/papers`.
   - `super_admin` redirects to `/ops/users`.
2. Write failing tests for `AdminDashboardLayout`:
   - content admin on `/ops/users` sees a permission-denied state, no operations navigation, and no child content.
   - ops admin on `/content/papers` sees a permission-denied state, no content navigation, and no child content.
   - both allowed workspaces show a visible logout control.
3. Write failing tests for `ProtectedRouteGuard` or layout-level session handling as needed so role checks use the
   server session response rather than URL path alone.
4. Implement the smallest contract helper in `session-boundary.ts` for admin landing:
   - `resolveAdminWorkspaceLandingPath` or equivalent pure helper.
   - Keep `exposeBearerTokenToClient: false` and `sessionPersistenceMode: "server_session"`.
5. Implement layout-level role workspace checks:
   - Fetch `/api/v1/sessions` through existing guard flow or layout-owned session state.
   - Render clear permission-denied state for cross-workspace access.
   - Render visible logout control that clears the local cookie-backed marker and sends the user to `/login`.
6. Re-run focused unit tests, then lint, typecheck, Prettier check, `git diff --check`, and pre-commit hardening.
7. Write evidence and audit review with Requirement Mapping Result and Role Mapping Result.

## Risk Defense

- Keep schema and role enum changes out of scope.
- Use unit tests for deterministic role and route behavior; do not run Playwright or a dev server.
- Do not log, store, or render tokens.
- Keep UI copy concise and role-specific.
- Do not hide menus as the only boundary; render a denial state when the session role and current workspace conflict.

## Validation Commands

```powershell
npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
npm.cmd run lint
npm.cmd run typecheck
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/user-auth/session-boundary.ts src/app/(auth)/login/page.tsx src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx src/features/admin/content-admin-runtime.tsx tests/unit/student-login-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts docs/05-execution-logs/task-plans/2026-06-24-backend-workspace-landing-logout-separation-repair.md docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId backend-workspace-landing-logout-separation-repair-2026-06-24
```

## Stop Conditions

- Any required fix needs schema/migration, database write, dependency, env/secret, Provider, e2e/browser runtime, or
  external service work.
- Unit tests require modeling `org_standard_admin` or `org_advanced_admin` as schema-backed roles.
- Evidence would need to include tokens, passwords, localStorage values, cookies, raw generated content, Provider payloads,
  database rows, or plaintext `redeem_code`.
- Validation fails three times for the same blocker.
