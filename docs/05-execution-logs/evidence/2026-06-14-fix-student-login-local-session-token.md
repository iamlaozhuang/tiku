# Evidence: fix-student-login-local-session-token

result: blocked_validation_failure

## Task

- Task id: `fix-student-login-local-session-token`
- Branch: `codex/fix-student-login-local-session-token`
- Batch range: master health baseline targeted bugfix, stopped at validation failure.
- Commit: `dc2c14e77d93049cb748c615fa20ee249c3a73f6` pre-task master baseline before the local task attempt.
- Date: 2026-06-14 local time.

## Start Checkpoint

| Checkpoint                 | Result                                     |
| -------------------------- | ------------------------------------------ |
| Current branch before task | `master`                                   |
| HEAD/master/origin/master  | `dc2c14e77d93049cb748c615fa20ee249c3a73f6` |
| Worktree                   | clean before task branch creation          |
| Local `codex/*` residue    | none before this branch                    |
| Remote `codex/*` residue   | none observed at task start                |

## RED / GREEN / VALIDATION FAILURE

- RED: `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts` failed in the expected place: the login success
  path did not persist the local session token under `tiku.localSessionToken`. Token values are intentionally omitted
  from this evidence.
- GREEN: A minimal login-page change wrote the returned token to browser storage before redirect. The targeted
  `tests/unit/student-login-ui.test.ts` suite then passed with 7 tests.
- VALIDATION FAILURE: Full `npm.cmd run test:unit` did not pass. It failed 2 tests across 2 files:
  - `tests/unit/auth/session-personal-auth-boundary.test.ts` rejects any `localStorage` usage in
    `src/app/(auth)/login/page.tsx` and asserts `exposeBearerTokenToClient: false` with
    `sessionPersistenceMode: "server_session"`.
  - `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` timed out in the full suite, but
    passed when rerun together with the auth boundary test, so it appears secondary to full-suite execution pressure.

## Root Cause

The master baseline contains a real contradiction between two regression tests and the current session contract:

- `tests/unit/student-login-ui.test.ts` expects login to persist a client-side session token for protected student/admin
  browser flows.
- `tests/unit/auth/session-personal-auth-boundary.test.ts` explicitly forbids login-page browser bearer-token
  persistence and verifies `src/server/contracts/user-auth/session-boundary.ts` as server-session-only.
- `src/server/contracts/user-auth/session-boundary.ts` currently declares `exposeBearerTokenToClient: false` and
  `sessionPersistenceMode: "server_session"`.

This cannot be safely resolved by only touching `src/app/(auth)/login/page.tsx`. Changing the auth boundary test or
contract would alter a security/session architecture decision and needs a fresh human decision.

## Human Approval Boundary

The user approved executing the recommended scoped fix after the master health baseline. The approval did not expand to
changing the auth/session security boundary, altering the existing auth boundary test, adding dependencies, changing
schema/migration, reading or writing env/secrets, running e2e, provider calls, deployment, payment, external-service,
PR, force-push, or Cost Calibration Gate work.

## Validation Results

| Command                                                                                                                                                          | Result                                                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts`                                                                                                   | RED: failed for missing local session token persistence |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts`                                                                                                   | GREEN: pass, 7 tests                                    |
| `git diff --check`                                                                                                                                               | pass                                                    |
| `npm.cmd run lint`                                                                                                                                               | pass                                                    |
| `npm.cmd run typecheck`                                                                                                                                          | pass                                                    |
| `npm.cmd run test:unit`                                                                                                                                          | fail, 2 failed tests across 2 files                     |
| `npm.cmd run test:unit -- tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` | fail, auth boundary test only                           |

Module Run v2 pre-commit hardening, module closeout readiness, pre-push readiness, local commit, fast-forward merge,
master-side validation, push, and short-branch cleanup were not run because the full unit gate failed first.

## Gates

- localFullLoopGate: blocked by full unit validation failure.
- threadRolloverGate: no rollover launched; stop here and require human decision on session persistence strategy.
- automationHandoffPolicy: do not commit, merge, push, or claim another task from this branch.
- nextModuleRunCandidate: a scoped follow-up decision task should choose either server-session-only login semantics or
  client bearer-token persistence semantics before further code changes.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

Changing the auth/session security boundary, changing `tests/unit/auth/session-personal-auth-boundary.test.ts`, changing
`src/server/contracts/user-auth/session-boundary.ts`, schema/migration, dependency/package/lockfile changes, env/secret
access, provider/model requests, quota use, e2e, staging/prod/cloud/deploy, payment/external-service, PR, force-push,
and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records command names, pass/fail summaries, file paths, and the conflicting session contract. It omits
token values, Authorization headers, passwords, secrets, database URLs, row data, provider payloads, model responses, and
private user data.
