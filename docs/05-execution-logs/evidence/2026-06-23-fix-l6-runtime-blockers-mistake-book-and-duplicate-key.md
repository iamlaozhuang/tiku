# Fix L6 Runtime Blockers Evidence

taskId: fix-l6-runtime-blockers-mistake-book-and-duplicate-key-2026-06-23
status: closed
result: pass_local_runtime_blockers_repaired_with_tests_and_student_browser_recheck
recordedAt: "2026-06-23T02:51:49-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: user_approved_runtime_blocker_repair_2026_06_23

## Summary

Repaired the two local runtime gaps found during the L6 owner preview actual walkthrough:

- student `/mistake-book` now resolves the same cookie-backed session boundary used by other local browser routes;
- admin user list runtime now avoids repeated user rows when multiple `personal_auth` records exist for the same user,
  preventing duplicate React keys such as `user-dev-student`.

This is a local blocker repair. It does not approve or execute Provider, Cost Calibration, staging, payment, production,
database migration, seed, dependency, push, PR, or final acceptance Pass work.

## Root Cause And Fix

| Gap                 | Root cause                                                                                   | Fix                                                                                                                            |
| ------------------- | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `/mistake-book` 401 | `student-mistake-book-runtime` passed only the raw `Authorization` header to session lookup. | Reused shared `getRequestAuthorization(request)` so either a bearer header or HttpOnly `tiku_session` cookie can resolve.      |
| duplicate key       | Admin user list joined `personal_auth` directly, expanding one `user` into multiple rows.    | Aggregated `personal_auth` status by `user_id` before joining and added a publicId merge boundary before mapping API response. |

## Red-Green Evidence

| Test                                                         | Red result                                                                     | Green result                     |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------ | -------------------------------- |
| `tests/unit/phase-8-student-mistake-book-runtime.test.ts`    | New cookie-backed `mistake_book` test returned `401001` before implementation. | 7 tests passed after fix.        |
| `tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`        | New duplicate `personal_auth` row test failed before implementation.           | 3 tests passed after fix.        |
| `tests/unit/student-mistake-book-ui.test.ts`                 | Existing UI behavior retained.                                                 | Included in 14 related UI tests. |
| `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts` | Existing admin ops UI behavior retained.                                       | Included in 14 related UI tests. |

## Browser Recheck

Local browser target:

- `http://127.0.0.1:3000/mistake-book`

Observed after repair in the current student session:

- URL remained `/mistake-book`;
- login link was absent;
- login-required text was absent;
- load-error text was absent;
- home link was present;
- one `mistake_book` item was present;
- no new duplicate-key error was logged after this navigation;
- no new error-level browser log was recorded after this navigation.

The old duplicate-key log entries remain in the browser log history and were not treated as new evidence after the
repair timestamp.

## Validation Commands

| Command                                                                                                                          | Result | Summary                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/phase-8-student-mistake-book-runtime.test.ts`                                               | pass   | 1 file, 7 tests passed.                                                              |
| `npm.cmd run test:unit -- tests/unit/phase-7-admin-flow-runtime-smoke.test.ts`                                                   | pass   | 1 file, 3 tests passed.                                                              |
| `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts` | pass   | 2 files, 14 tests passed.                                                            |
| `npm.cmd run lint`                                                                                                               | pass   | ESLint completed without errors.                                                     |
| `npm.cmd run typecheck`                                                                                                          | pass   | `tsc --noEmit` completed without errors.                                             |
| `git diff --check`                                                                                                               | pass   | No whitespace errors before evidence closeout.                                       |
| `npx.cmd prettier --write --ignore-unknown <changed plan/state/source/test files>`                                               | pass   | All matched files were already formatted.                                            |
| in-app browser local `/mistake-book` route check                                                                                 | pass   | Student route loaded with an authenticated item state and no new browser error logs. |
| `npx.cmd prettier --check --ignore-unknown <changed plan/evidence/audit/state/source/test files>`                                | pass   | All matched files use Prettier code style.                                           |
| final `git diff --check`                                                                                                         | pass   | No whitespace errors after evidence/audit closeout.                                  |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-l6-runtime-blockers-mistake-book-and-duplicate-key-2026-06-23`               | pass   | Scope, Cost Calibration block, sensitive evidence scan, and terminology scan passed. |

## Redaction Statement

This evidence records only task id, route labels, role labels, result status, command summaries, and bounded browser
state summaries.

This evidence does not record passwords, generated passwords, session token values, cookies, Authorization headers,
localStorage values, `.env*` contents, database URLs, API keys, secrets, plaintext `redeem_code`, raw prompt, raw
answer, Provider payload, AI raw output, full `paper`, full `material`, employee answer text, screenshots, traces, HTML
reports, raw DB rows, or internal auto-increment ids.

## Decision Impact

The L6 local blocker repair is complete. The runtime blocker batch can proceed to the next decision task only as a
decision package. Final acceptance Pass remains forbidden until all required gates, role coverage decisions,
Provider/Cost/staging decisions, and release gates have valid evidence or explicit deferrals.
