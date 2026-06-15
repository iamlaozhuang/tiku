# Audit Review: Phase 22 Account And Authorization Local Acceptance Verification

## Review Result

PASS.

## Scope Review

- Task id: `phase-22-local-acceptance-account-auth-verification`
- Scope: local account/auth acceptance verification plus user-approved scoped session-route, client-session, and runtime
  resolver repairs.
- Approved writes:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `src/server/auth/session-route.ts`
  - `src/server/auth/session-route.test.ts`
  - `src/server/auth/session-cookie.ts`
  - `src/server/services/student-flow-runtime.ts`
  - `src/server/services/student-authorization-redeem-runtime.ts`
  - `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
  - `src/features/student/studentRuntimeApi.ts`
  - `src/features/student/home/StudentHomePage.tsx`
  - `src/features/student/profile/StudentProfileRedeemPage.tsx`
  - `tests/unit/phase-7-student-flow-runtime-smoke.test.ts`
  - `tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`
  - `tests/unit/protected-route-guard-ui.test.ts`
  - `tests/unit/student-home-ui.test.ts`
  - `tests/unit/student-profile-redeem-ui.test.ts`
  - `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-account-auth-verification.md`
  - `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-account-auth-verification.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-account-auth-verification.md`

## Findings

### P1 - Full account/auth acceptance was resolved through v6 local fixture approval

The scoped v3 repair closes the runtime cookie-session gap. Local Playwright now shows `/api/v1/sessions`,
`/api/v1/student-papers/scopes`, `/api/v1/authorizations`, and `/api/v1/personal-auths` all return `code=0` with the
same HttpOnly cookie-backed session.

Under v6 approval, a one-time local admin fixture enabled the application-layer data path. The personal path generated a
local `redeem_code`, redeemed it as a synthetic learner, and verified `authorization`, `personal_auth`, scope count, and
student pages. The organization-member path created a local `organization`, `org_auth`, and `employee` account through
admin APIs, then verified employee login, authorization, scope count, and student pages.

Impact: the account/auth local acceptance journey now has redacted local evidence for both personal and employee
authorization paths.

### P1 - V4 app-layer data path is guarded by an unavailable admin session

The v4 boundary allowed only application-layer local authorization data validation. Source discovery found app-layer
routes for `redeem_code`, `organization`, `org_auth`, and `employee` data, but those routes require an admin actor.

A local API probe created and logged in a synthetic personal account through app routes. The session cookie was present,
and `/api/v1/sessions` returned `code=0`; however, the user had no admin public id and no admin roles. With that same
personal session token, `GET /api/v1/redeem-codes`, `GET /api/v1/organizations`, `GET /api/v1/org-auths`, and
`GET /api/v1/employees` each returned `code=401001` with `data=null`.

Impact: v4 was correctly blocked, and v6 provided the approved minimal local admin fixture needed to close the journey.

### P2 - Shared cookie-backed request auth helper avoids duplicate parsing

`src/server/auth/session-cookie.ts` centralizes cookie header creation and request auth fallback. `session-route`,
`student-flow-runtime`, and `student-authorization-redeem-runtime` now share the same request auth resolution behavior.

Impact: the server-session boundary is consistent across the current-session API and the approved student runtime APIs.

### P2 - Approved client surfaces remain cookie-backed

`ProtectedRouteGuard`, the student runtime API helper, the student home page, and the profile/redeem pages still send
same-origin cookie-backed requests and do not require the old local browser credential before loading covered data.

Impact: the client and runtime layers now align on the server-session boundary.

## Boundary Review

- No `.env.local`, `.env.*`, secret, provider configuration, token value, auth header value, database URL, raw prompt,
  raw answer, provider payload, row data, generated credential, payment data, or private user data was recorded.
- Source/test modifications stayed within the v3 approved files for the current task.
- No e2e, schema, drizzle, script, package, lockfile, or dependency file was modified.
- No seed/bootstrap, migration, raw SQL, destructive DB operation, staging/prod/cloud/deploy, payment, external-service,
  PR, force-push, provider call, quota measurement, or Cost Calibration Gate work was performed.
- Browser/Playwright access was limited to `127.0.0.1`.
- The v4 probe used only app API routes. It did not call admin write endpoints, generate a card code, import employees,
  create organization authorization data, or claim task 2.
- The v6 fixture used project TS modules, Drizzle ORM, and the existing local runtime DB loader. It did not output,
  summarize, record, or modify `.env*` values; no token, cookie, card-code plaintext, credential, public identifier,
  database URL, row data, or private user data is recorded.

## Validation Review

- `git diff --check`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`: pass, 1 file / 4 tests.
- `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts`: pass, 1 file / 3 tests.
- `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`: pass, 1 file / 5 tests.
- `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts`: pass, 3 files / 17 tests.
- Local Playwright runtime observation: blocked by data prerequisite after cookie-backed runtime APIs returned `code=0`.
- V4 application-layer authorization data path probe: blocked by admin-session prerequisite; synthetic personal session
  received `code=401001` from admin listing endpoints.
- V6 personal authorization closure: pass; admin API generated one redeem code, learner API redeemed it, learner
  authorization/personal-auth/scope APIs returned `code=0` with count `1`, and learner `/home` and `/profile` stayed on
  the intended routes with no login prompt, framework overlay, or console/page issues.
- V6 organization-member authorization closure: pass; admin API created organization/org_auth/employee account, employee
  login returned `userType=employee` with organization present, employee authorization/scope APIs returned `code=0` with
  count `1`, and employee `/home` and `/profile` stayed on the intended routes with no login prompt, framework overlay,
  or console/page issues.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`: pass for 19 files.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`: fail expected; the only finding was `HARD_BLOCK_EVIDENCE_NOT_PASS`.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`: pass script-level, but no push is allowed while task is blocked.
- Dev server cleanup: `127.0.0.1:3201` was not listening after validation cleanup.

Commit, merge, push, branch cleanup, and next-task claim remain gated by fresh closeout validation and the strict serial
flow.

Cost Calibration Gate remains blocked.

## Closeout Decision

The current task may proceed to closeout validation, local commit, fast-forward merge, push, and branch cleanup under the
existing approval. Do not claim the next seeded Phase 22 candidate until post-push clean alignment checks pass.
