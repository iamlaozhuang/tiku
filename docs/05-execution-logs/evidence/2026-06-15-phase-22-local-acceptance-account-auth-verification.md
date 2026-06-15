# Evidence: Phase 22 Account And Authorization Local Acceptance Verification

result: pass

## Task

- Task id: `phase-22-local-acceptance-account-auth-verification`
- Branch: `codex/phase-22-local-acceptance-account-auth-verification`
- Date: 2026-06-15
- Baseline: `33692be4051d8b56f96b0d2751731ee100730603`
- Task kind: `local_acceptance_verification_candidate`
- Verification journey: `account_and_authorization`

## Fresh Approval

The user authorized serial execution of the six seeded Phase 22 local acceptance verification candidates. For this task,
the user authorized local dev server startup, Browser or Playwright observations against `localhost` or `127.0.0.1`,
application-mediated local dev DB use, common local validation commands, local commit after task success,
fast-forward merge to `master`, `push origin master`, and merged local short-branch cleanup.

Scoped approvals v1, v2, and v3 allowed only the current task repairs recorded in the task plan. Scoped approval v4
allowed continuing current task 1 only through the application-layer local authorization data validation path and did
not authorize claiming task 2. No approval was granted for `.env.local` / `.env.*` reading or output, env/secret/provider
configuration, provider/model calls, source/test/e2e/schema/drizzle/script/dependency/package/lockfile changes outside
the approved files, seed/bootstrap, migration, raw SQL, destructive DB work, direct admin-data preparation,
staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration Gate.

Scoped approval v6 allowed a one-time local admin fixture for current task 1 only and explicitly allowed the fixture
script to use the existing project local runtime/env loader to read only the process-required `DATABASE_URL` and connect
to the local dev DB. The value was not output, summarized, recorded, or modified. The v6 run still did not authorize
reading or outputting `.env*`, provider/secret configuration, package/dependency changes, schema/migration/e2e changes,
raw SQL authored by the agent, destructive DB work, staging/prod/cloud/deploy, external services, PR, force-push, task 2,
or Cost Calibration Gate.

Cost Calibration Gate remains blocked.

## Start Checkpoint

| Checkpoint                          | Result                                                                                             |
| ----------------------------------- | -------------------------------------------------------------------------------------------------- |
| Task branch                         | `codex/phase-22-local-acceptance-account-auth-verification`                                        |
| `HEAD` / `master` / `origin/master` | `33692be4051d8b56f96b0d2751731ee100730603`                                                         |
| Worktree at resumed checkpoint      | dirty only with current task state/queue/task-plan/evidence/audit and approved source/test changes |
| Local `codex/*` residue             | current task branch only                                                                           |
| Remote `origin/codex/*` residue     | none observed after `git fetch --prune origin`                                                     |

## TDD Evidence

| Step  | Command                                                                                                                                                | Result | Notes                                                                                                           |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------- |
| RED   | `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`                                                                                       | fail   | Expected failures: missing login cookie persistence and missing cookie-backed current-session lookup.           |
| GREEN | `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`                                                                                       | pass   | 1 file, 4 tests passed after session route repair.                                                              |
| RED   | `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts` | fail   | Expected failures: protected route and student page tests still required the old local browser credential path. |
| GREEN | `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts` | pass   | 3 files, 17 tests passed after cookie-backed client runtime repair.                                             |
| RED   | `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts`                                                                       | fail   | Expected failure: cookie-only request to student scopes returned `401001`.                                      |
| RED   | `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`                                                             | fail   | Expected failure: cookie-only request to authorization routes returned `401001`.                                |
| GREEN | `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts`                                                                       | pass   | 1 file, 3 tests passed after runtime resolver repair and corrected response-shape assertion.                    |
| GREEN | `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`                                                             | pass   | 1 file, 5 tests passed after runtime resolver repair.                                                           |

## Scoped Repair Summary

`src/server/auth/session-cookie.ts` now centralizes:

- `tiku_session` cookie header creation;
- cookie-backed request auth resolution;
- request auth value precedence over cookie fallback.

`src/server/auth/session-route.ts` now uses that shared helper while keeping the standard `{ code, message, data }`
response envelope.

`src/server/services/student-flow-runtime.ts` and
`src/server/services/student-authorization-redeem-runtime.ts` now resolve current session input through the same
cookie-backed helper instead of reading only the request auth value. The approved client files continue to send
same-origin cookie-backed requests.

No token value, auth header value, password, database URL, row data, provider payload, raw prompt, raw answer, or private
user data is recorded in this evidence.

## Browser And Playwright Observation

The flow under test was: synthetic local account creation -> login -> cookie-backed current-session and student runtime
API checks -> protected student pages.

- Browser plugin classification: available but invocation failed.
- Browser failure: the current in-app Browser tab was on a crash page, and navigation was blocked by the Browser URL
  policy for that crash-page data URL.
- Fallback: local Playwright was used because the task approval explicitly allowed Browser or Playwright against
  `localhost` / `127.0.0.1`.
- Screenshot evidence path outside repo:
  `C:\Users\jzzhu\AppData\Local\Temp\tiku-phase22-auth-v4-redeem-code.png`

Playwright local observations against `http://127.0.0.1:3201` after v3:

| Step                                                     | Observation                                                                                                                        |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Synthetic registration through app API                   | HTTP 200; response body not recorded.                                                                                              |
| Synthetic login through app API                          | HTTP 200; response body not recorded.                                                                                              |
| Browser cookie state                                     | Cookie name `tiku_session`; `httpOnly=true`; `sameSite=Lax`; `secure=false` on local HTTP; `path=/`; expiry present.               |
| `GET /api/v1/sessions` with cookie                       | HTTP 200; response `code=0`; data keys `session`, `user`.                                                                          |
| `GET /api/v1/student-papers/scopes` with the same cookie | HTTP 200; response `code=0`; data array count `0`.                                                                                 |
| `GET /api/v1/authorizations` with the same cookie        | HTTP 200; response `code=0`; data keys `authorizationContexts`, `authorizations`, `effectiveAuthorizations`.                       |
| `GET /api/v1/personal-auths` with the same cookie        | HTTP 200; response `code=0`; data key `personalAuths`.                                                                             |
| `/home` after login                                      | Final path `/redeem-code`; no framework overlay; no login prompt. Redirect is consistent with zero effective authorization scopes. |
| `/profile` after login                                   | Final path `/profile`; no framework overlay; no login prompt.                                                                      |
| `/redeem-code` after login                               | Final path `/redeem-code`; no framework overlay; page shows card redemption UI and waiting-for-code guidance.                      |
| Console issues                                           | `0` relevant error/warn entries in the local observation script.                                                                   |

## V4 Application-Layer Authorization Data Path Probe

After approval v4, the allowed path was limited to application-layer local authorization data validation. The following
read-only source discovery and local API probe were performed without reading env files, using raw SQL, running seed or
bootstrap, creating migrations, calling providers, changing dependencies, or modifying additional source/test files.

Read-only source discovery found existing local application-layer surfaces for authorization data preparation:

- `/api/v1/redeem-codes` can list/create `redeem_code` batches through `admin-redeem-code-runtime`.
- `/api/v1/organizations`, `/api/v1/org-auths`, `/api/v1/employees`, and `/api/v1/employees/import` can manage
  `organization`, `org_auth`, and `employee` data through `admin-organization-org-auth-runtime`.
- `/api/v1/users` POST registers a personal `user` / `student`; it does not create an admin actor.
- The admin operations surfaces require a current session whose user has `adminPublicId` and admin roles.

Local API probe against `http://127.0.0.1:3201`:

| Step                                                                   | Observation                                                                                                                     |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Initial invalid-shape registration probe                               | Validation rejected the request; no usable session was created.                                                                 |
| Corrected synthetic personal registration through app API              | HTTP 200; response `code=0`; `nextAction=redeem_code`.                                                                          |
| Synthetic personal login through app API                               | HTTP 200; response `code=0`; `userType=personal`; no admin public id; admin role count `0`; token was present but not recorded. |
| Login cookie attributes                                                | `tiku_session` present; `httpOnly=true`; `sameSite=Lax`; `path=/`; `secure=false` on local HTTP; expiry present.                |
| `GET /api/v1/sessions` with the cookie                                 | HTTP 200; response `code=0`; `userType=personal`; no admin public id; admin role count `0`.                                     |
| `GET /api/v1/redeem-codes` using the synthetic personal session token  | HTTP 200; response `code=401001`; `data=null`.                                                                                  |
| `GET /api/v1/organizations` using the synthetic personal session token | HTTP 200; response `code=401001`; `data=null`.                                                                                  |
| `GET /api/v1/org-auths` using the synthetic personal session token     | HTTP 200; response `code=401001`; `data=null`.                                                                                  |
| `GET /api/v1/employees` using the synthetic personal session token     | HTTP 200; response `code=401001`; `data=null`.                                                                                  |

No admin write endpoint was called during the v4 probe. No `redeem_code` was generated, no `org_auth` was created, no
employee import was attempted, and no generated credential or private row data was recorded.

## V6 Local Authorization Data Closure

Under v6 approval, a one-time local admin fixture was created through project TS modules, Drizzle ORM, and the existing
runtime DB loader. The admin fixture credential, generated learner/employee credentials, card code plaintext, tokens,
cookies, public identifiers, database URL, and row data were used only in process memory and were not recorded.

Personal authorization path:

| Step                                                    | Observation                                                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Local admin fixture                                     | Created through ORM; no credential or row value recorded.                                   |
| Admin login through app API                             | HTTP 200; response `code=0`; admin role count `1`; token present but not recorded.          |
| `POST /api/v1/redeem-codes`                             | HTTP 200; response `code=0`; generated count `1`; plaintext card code used only in memory.  |
| Synthetic learner registration                          | HTTP 200; response `code=0`; `nextAction=redeem_code`.                                      |
| Synthetic learner login                                 | HTTP 200; response `code=0`; `tiku_session` cookie present; token present but not recorded. |
| `POST /api/v1/redeem-codes/redeem` with cookie          | HTTP 200; response `code=0`; `personalAuth` present.                                        |
| `GET /api/v1/sessions` with learner cookie              | HTTP 200; response `code=0`; `userType=personal`.                                           |
| `GET /api/v1/authorizations` with learner cookie        | HTTP 200; response `code=0`; authorizations count `1`; effective authorizations count `1`.  |
| `GET /api/v1/personal-auths` with learner cookie        | HTTP 200; response `code=0`; personal auth count `1`.                                       |
| `GET /api/v1/student-papers/scopes` with learner cookie | HTTP 200; response `code=0`; scope count `1`.                                               |
| Learner `/home` render                                  | Final path `/home`; no login prompt; no framework overlay; console/page issue count `0`.    |
| Learner `/profile` render                               | Final path `/profile`; no login prompt; no framework overlay; console/page issue count `0`. |
| Learner `/redeem-code` render                           | Final path `/redeem-code`; route remained reachable after redemption.                       |

Organization/member authorization path:

| Step                                                     | Observation                                                                                            |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Local admin fixture                                      | Created through ORM; no credential or row value recorded.                                              |
| Admin login through app API                              | HTTP 200; response `code=0`; admin role count `1`; token present but not recorded.                     |
| `POST /api/v1/organizations`                             | HTTP 200; response `code=0`; organization present.                                                     |
| `POST /api/v1/org-auths`                                 | HTTP 200; response `code=0`; org auth present.                                                         |
| `POST /api/v1/employees`                                 | HTTP 200; response `code=0`; employee account present.                                                 |
| Employee login through app API                           | HTTP 200; response `code=0`; `tiku_session` cookie present; `userType=employee`; organization present. |
| `GET /api/v1/authorizations` with employee cookie        | HTTP 200; response `code=0`; authorizations count `1`; effective authorizations count `1`.             |
| `GET /api/v1/student-papers/scopes` with employee cookie | HTTP 200; response `code=0`; scope count `1`.                                                          |
| Employee `/home` render                                  | Final path `/home`; no login prompt; no framework overlay; console/page issue count `0`.               |
| Employee `/profile` render                               | Final path `/profile`; no login prompt; no framework overlay; console/page issue count `0`.            |

## Remaining Blocker

None for the current account/auth local acceptance journey. Provider/model calls, Cost Calibration Gate, staging/prod,
cloud/deploy, payment, external-service, PR, force-push, and task 2 remain out of scope.

## Acceptance Classification

| Scope                                              | Phase 22 status  | Notes                                                                                                                                         |
| -------------------------------------------------- | ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Login and registration page/API surface            | `local_verified` | Synthetic account creation and login returned HTTP 200 through approved local app surface.                                                    |
| Session cookie persistence                         | `local_verified` | Login sets an HttpOnly `tiku_session` cookie locally.                                                                                         |
| Current session through cookie                     | `local_verified` | `/api/v1/sessions` returns `code=0` with the cookie.                                                                                          |
| Student flow runtime cookie-session resolution     | `local_verified` | `/api/v1/student-papers/scopes` returns `code=0` with the same cookie.                                                                        |
| Authorization runtime cookie-session resolution    | `local_verified` | `/api/v1/authorizations` and `/api/v1/personal-auths` return `code=0` with the same cookie.                                                   |
| `/profile` and `/redeem-code` reachability         | `local_verified` | Pages no longer show login-required state after login.                                                                                        |
| `/home` authorized learning surface                | `local_verified` | Personal and employee sessions both remain on `/home` after valid authorization scope exists.                                                 |
| `redeem_code` generation and redemption            | `local_verified` | Admin generated one local code through app API; learner redeemed it through app API using cookie-backed session.                              |
| `authorization` and `personal_auth` effects        | `local_verified` | Learner authorization and personal auth APIs each returned `code=0` and count `1`.                                                            |
| `organization`, `org_auth`, and `employee` effects | `local_verified` | Admin API created a local organization, org auth, and employee account; employee login returned `userType=employee` and organization present. |
| Full account/auth role-to-role acceptance          | `local_verified` | Personal redeem path and organization-member auth path both passed locally with redacted evidence.                                            |

## Validation Results

| Command                                                                                                                                                                                  | Result                             | Notes                                                                                                                                                                                     |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                       | pass                               | No whitespace errors.                                                                                                                                                                     |
| `npm.cmd run lint`                                                                                                                                                                       | pass                               | ESLint completed after v6 evidence update.                                                                                                                                                |
| `npm.cmd run typecheck`                                                                                                                                                                  | pass                               | TypeScript completed after v6 evidence update.                                                                                                                                            |
| `npm.cmd run test:unit -- src/server/auth/session-route.test.ts`                                                                                                                         | pass                               | 1 file, 4 tests passed.                                                                                                                                                                   |
| `npm.cmd run test:unit -- tests/unit/phase-7-student-flow-runtime-smoke.test.ts`                                                                                                         | pass                               | 1 file, 3 tests passed.                                                                                                                                                                   |
| `npm.cmd run test:unit -- tests/unit/phase-8-student-authorization-redeem-runtime.test.ts`                                                                                               | pass                               | 1 file, 5 tests passed.                                                                                                                                                                   |
| `npm.cmd run test:unit -- tests/unit/protected-route-guard-ui.test.ts tests/unit/student-home-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts`                                   | pass                               | 3 files, 17 tests passed.                                                                                                                                                                 |
| Local Playwright runtime observation                                                                                                                                                     | blocked_data_prerequisite          | Cookie-backed runtime APIs return `code=0`; full authorization/redeem acceptance is blocked by missing valid local authorization data.                                                    |
| V4 application-layer authorization data path probe                                                                                                                                       | blocked_admin_session_prerequisite | Existing app-layer admin data paths require an admin actor; synthetic personal session receives `code=401001` from admin listing endpoints.                                               |
| V6 personal authorization fixture closure                                                                                                                                                | pass                               | Admin fixture, redeem-code generation, learner redemption, authorization APIs, scope API, `/home`, `/profile`, and `/redeem-code` passed with redacted evidence.                          |
| V6 organization/member authorization fixture closure                                                                                                                                     | pass                               | Admin fixture, organization creation, org auth creation, employee account creation, employee login, authorization APIs, scope API, `/home`, and `/profile` passed with redacted evidence. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                      | pass                               | Inventory completed; only current task files are changed.                                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`      | pass                               | Scope scan, sensitive evidence scan, and terminology scan passed for 19 files.                                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification` | pass                               | Evidence pass recorded; closeout readiness passed.                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-account-auth-verification`        | pass                               | Pre-push readiness passed before local commit.                                                                                                                                            |

Dev server cleanup check: `127.0.0.1:3201` was not listening after validation cleanup.

Closeout readiness, merge, push, branch cleanup, and the next Phase 22 candidate are gated by the fresh validation
commands below and the serial closeout flow; task 2 is not claimed in this evidence.

## Thread And Closeout Decision

- Thread Rollover Decision: no new thread requested.
- threadRolloverDecision: no new thread requested.
- automationHandoffPolicy: do not claim the next Phase 22 seeded candidate until this task is committed, merged to
  `master`, pushed, the short branch is deleted, and post-task clean alignment checks pass.
- nextModuleRunCandidate: none claimed in this task. The next queue item remains
  `phase-22-local-acceptance-content-production-verification` for a future serial turn.
- localFullLoopGate: pass for the account/auth journey after v6 personal and organization-member local authorization
  closure.
- Batch range: current account/auth local acceptance verification plus scoped session-route, client-session, and runtime
  resolver repairs.
- Batch evidence: scoped repair evidence plus v6 account/auth local acceptance closure evidence. Commit, merge, push,
  and cleanup evidence are still pending until the closeout flow runs.
- Commit: `33692be4051d8b56f96b0d2751731ee100730603` is the pre-task baseline; the local task commit is created by the
  closeout flow after readiness gates.
- Batch commit evidence: `Commit: 33692be4051d8b56f96b0d2751731ee100730603` pre-task baseline with closeout commit
  creation following readiness gates.
- RED: login success originally did not persist a browser session cookie.
- GREEN: the session route now sets/reads the HttpOnly cookie and scoped unit/local session checks pass.
- RED: protected pages originally depended on the old local browser credential path.
- GREEN: the approved client files now call same-origin cookie-backed requests.
- RED: student flow and authorization runtime APIs originally rejected the cookie-only session.
- GREEN: approved runtime resolvers now accept the cookie-backed session and local runtime API observations return
  `code=0`.
- Remaining blocked gate: none for current account/auth local acceptance. Cost Calibration Gate and out-of-scope surfaces
  remain blocked.

## Evidence Redaction

This evidence records only local route names, status codes, boolean cookie presence/attributes, cookie attribute names,
data-key names, status labels, command names, and redacted summaries. It contains no token value, auth header value,
password, secret, database URL, provider payload, raw prompt, raw answer, row data, payment data, generated credential,
or private user data.

Cost Calibration Gate remains blocked.
