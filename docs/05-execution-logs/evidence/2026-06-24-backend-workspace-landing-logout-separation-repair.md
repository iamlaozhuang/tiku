# Evidence: backend-workspace-landing-logout-separation-repair-2026-06-24

## Task Metadata

- Task id: backend-workspace-landing-logout-separation-repair-2026-06-24
- Branch: codex/backend-workspace-landing-logout-20260624
- Recorded at: 2026-06-24T03:32:56-07:00
- Execution profile: local_low_risk_scoped_repair
- Product closure contribution: admin backend workspace landing, visible logout, and content/ops separation repair for
  currently modeled admin roles.
- Non-claim: this evidence does not declare standard/advanced MVP final Pass.

## SSOT Read List

- docs/01-requirements/00-index.md
- docs/01-requirements/modules/06-admin-ops.md
- docs/01-requirements/stories/epic-06-admin-ops.md
- docs/01-requirements/advanced-edition/00-index.md
- docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md
- docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md
- docs/01-requirements/traceability/role-experience-fulfillment-matrix.md

## Requirement Mapping Result

- R1: implemented for modeled backend roles by resolving role-aware post-login workspace landing, rendering a visible
  backend logout control, and denying cross-workspace navigation in `AdminDashboardLayout`.
- R2: not fully implemented in this task because organization-scoped standard/advanced admin roles are not modeled in
  the current schema/session role contract. No schema, enum, migration, database write, or seed change was made.
- R8: implemented for currently modeled roles by denying `ops_admin` from `/content/*` layout surfaces while preserving
  `content_admin` access to content workspace routes.
- US-06-13 AC-8/AC-9: implemented for `super_admin`, `ops_admin`, and `content_admin`; backend workspaces now have
  role-aware landing, visible logout, and clear permission-denied states.
- US-06-14 AC-1/AC-2/AC-5: partially covered for currently modeled admin roles only; enterprise admin-specific
  standard/advanced behavior remains deferred to a schema-approved follow-up.

## Role Mapping Result

- `super_admin`: default landing remains `/ops/users`; layout access is allowed for both `/ops/*` and `/content/*`.
- `ops_admin`: post-login landing is `/ops/users`; layout access is allowed for `/ops/*` and denied for `/content/*`.
- `content_admin`: post-login landing is `/content/papers`; layout access is allowed for `/content/*` and denied for
  `/ops/*`.
- Unknown/future admin role labels: not treated as authority for unrelated workspaces.
- `org_standard_admin` and `org_advanced_admin`: explicitly deferred because this task blocked schema/enum/session
  contract changes.

## Changed Files

- docs/04-agent-system/state/project-state.yaml
- docs/04-agent-system/state/task-queue.yaml
- docs/05-execution-logs/task-plans/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md
- src/components/AdminDashboardLayout/AdminDashboardLayout.tsx
- src/server/contracts/user-auth/session-boundary.ts
- tests/unit/admin-dashboard-layout-navigation.test.ts
- tests/unit/auth/session-personal-auth-boundary.test.ts
- tests/unit/protected-route-guard-ui.test.ts
- tests/unit/student-login-ui.test.ts

## RED Evidence

Command:

```powershell
npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
```

Observed expected RED result before implementation:

- Test Files: 2 failed, 2 passed, 4 total.
- Tests: 5 failed, 17 passed, 22 total.
- Failure intent:
  - `content_admin` still redirected to `/ops/users` instead of `/content/papers`.
  - backend layout lacked visible logout.
  - backend layout allowed cross-workspace access instead of rendering permission denied.

Intermediate implementation feedback:

- A first implementation patch left stale JSX in `AdminDashboardLayout`, producing a parse error. The stale block was
  removed before final validation.
- Lint then reported `react-hooks/set-state-in-effect` for synchronous status reset inside the effect. The state was
  changed to carry the checked workspace and derive the checking state during render.

## GREEN Evidence

Command:

```powershell
npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts
```

Result:

- Exit code: 0
- Test Files: 4 passed, 4 total.
- Tests: 22 passed, 22 total.

Command:

```powershell
npm.cmd run lint
```

Result:

- Exit code: 0
- `eslint` completed without findings.

Command:

```powershell
npm.cmd run typecheck
```

Result:

- Exit code: 0
- `tsc --noEmit` completed without findings.

## Closeout Evidence

Command:

```powershell
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml src/server/contracts/user-auth/session-boundary.ts src/app/(auth)/login/page.tsx src/components/AdminDashboardLayout/AdminDashboardLayout.tsx src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx src/features/admin/content-admin-runtime.tsx tests/unit/student-login-ui.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts docs/05-execution-logs/task-plans/2026-06-24-backend-workspace-landing-logout-separation-repair.md docs/05-execution-logs/evidence/2026-06-24-backend-workspace-landing-logout-separation-repair.md docs/05-execution-logs/audits-reviews/2026-06-24-backend-workspace-landing-logout-separation-repair.md
```

Result:

- Initial unquoted PowerShell invocation failed before Prettier because `(auth)` was parsed as a command expression.
- Quoted rerun exit code: 0
- Output: `All matched files use Prettier code style!`

Command:

```powershell
git diff --check
```

Result:

- Exit code: 0
- No whitespace errors reported.

Command:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId backend-workspace-landing-logout-separation-repair-2026-06-24
```

Result:

- Exit code: 0
- Output included:
  - `OK_SSOT_READ_LIST`
  - `OK_REQUIREMENT_MAPPING_RESULT`
  - `Cost Calibration Gate remains blocked`
  - `pre-commit hardening passed`

## Boundary And Residual Risk

- Fresh closeout approval received at 2026-06-24T03:40:40-07:00 from the current user message: execute commit, merge,
  push, cleanup, then claim candidate direction 2.
- Approved closeout target:
  - merge `codex/backend-workspace-landing-logout-20260624` to `master`
  - push `master` to `origin/master`
  - delete the merged local short branch after master validation evidence is recorded
- Visible logout currently clears the local session marker and returns the user to `/login`. Server-side cookie
  invalidation was not implemented because the allowed scope did not include adding a session delete route or changing
  session runtime behavior.
- Organization standard/advanced admin roles remain a known gap until schema/session-role modeling is approved.
- No `.env*`, Provider, Cost Calibration, staging/prod, payment, external service, schema, migration, package, lockfile,
  browser/e2e runtime, PR, force push, or final acceptance Pass action was performed.
- Evidence omits raw tokens, cookies, passwords, database rows, Provider payloads, and plaintext `redeem_code` values.
