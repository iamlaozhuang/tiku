# Acceptance L5 Standard Role Flow Run Evidence

taskId: acceptance-l5-standard-role-flow-run-2026-06-23
status: blocked
result: blocked_partial_l5_standard_safe_smoke_passed_credentialed_role_flow_not_executed
recordedAt: "2026-06-22T23:50:17-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
approvalPackageId: L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23
freshApproval: user approved `批准 L5_LOCAL_BROWSER_RUNTIME_SCOPE_2026_06_23`.

## Scope Executed

This task executed only the approved local L5/browser runtime scope:

- local target: `http://127.0.0.1:3000`
- dev server handling: an existing local listener was reused through `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1`.
- in-app browser backend: `iab`
- e2e scope: `--list` plus the three approved safe smoke specs only.

No source, test, script, schema, migration, seed, database, package, lockfile, env, secret, Provider, staging, prod,
cloud, deploy, payment, external-service, PR, force-push, Cost Calibration Gate, or account-creation action was
executed.

## Command Evidence

| Command                                                                                                  | Outcome | Evidence summary                                                                                          |
| -------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:e2e -- --list`                                                                         | pass    | Listed 36 tests in 16 e2e spec files. This was discovery only, not full-suite execution.                  |
| `npm.cmd run test:e2e -- e2e/home.spec.ts`                                                               | blocked | First attempt did not run tests because `127.0.0.1:3000` was already in use.                              |
| local port check                                                                                         | pass    | `127.0.0.1:3000` was listening and returned HTTP 200, so existing local server reuse was within approval. |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/home.spec.ts`                      | pass    | 1 test passed.                                                                                            |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts`    | pass    | 10 tests passed.                                                                                          |
| `TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER=1; npm.cmd run test:e2e -- e2e/admin-role-denial-browser.spec.ts` | pass    | 2 tests passed.                                                                                           |

The initial `home.spec.ts` blocked attempt is classified as local tooling/server reuse recovery, not a product behavior
failure. The approved reuse path passed after confirming the local target.

## In-App Browser Evidence

The in-app browser was used only against `http://127.0.0.1:3000`.

| Route or surface                 | Role label                | Expected behavior                                    | Actual summary                                                                | Result |
| -------------------------------- | ------------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------- | ------ |
| `/`                              | `unauthenticated_visitor` | Root page renders local entry points.                | Root page rendered title and three local entry links for student/content/ops. | pass   |
| `/login`                         | `unauthenticated_visitor` | Login form is visible.                               | Phone input, password input, and login submit button were present.            | pass   |
| `/home`                          | `unauthenticated_visitor` | Protected student route redirects to login.          | Browser ended at `/login`; login submit visible; protected navigation absent. | pass   |
| `/content/questions`             | `unauthenticated_visitor` | Protected content route redirects to login.          | Browser ended at `/login`; login submit visible; protected navigation absent. | pass   |
| `/ops/users`                     | `unauthenticated_visitor` | Protected ops route redirects to login.              | Browser ended at `/login`; login submit visible; protected navigation absent. | pass   |
| browser console error-level logs | `unauthenticated_visitor` | No blocking error-level console logs in checked tab. | Error-level browser log count was 0 during the final checked state.           | pass   |

No screenshots, page text dumps, browser storage dumps, cookies, tokens, Authorization headers, credentials, database
URLs, prompts, provider payloads, raw answers, full paper/material content, or plaintext `redeem_code` values were
recorded.

## Standard MVP L5 Matrix Result

| Acceptance id | Role label                | Surface family                                         | Result  | Evidence summary                                                                                              |
| ------------- | ------------------------- | ------------------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| L5-STD-001    | `unauthenticated_visitor` | `/login` and protected student/admin routes            | pass    | Browser and safe smoke evidence confirm login visibility and protected-route redirects.                       |
| L5-STD-002    | `student`                 | student home/profile and `authorization`               | blocked | Requires a safe local student account or laozhuang-assisted credential entry; none was provided.              |
| L5-STD-003    | `student`                 | `practice`                                             | blocked | Requires authenticated student role flow; not executed under current evidence boundary.                       |
| L5-STD-004    | `student`                 | `mock_exam`                                            | blocked | Requires authenticated student role flow; not executed under current evidence boundary.                       |
| L5-STD-005    | `student`                 | `exam_report` and `mistake_book`                       | blocked | Requires authenticated student role flow; unauthenticated guards passed only.                                 |
| L5-STD-006    | `content_admin`           | `question`, `material`, `paper`, `knowledge_node`      | blocked | Negative permission fixture passed, but positive content_admin walkthrough requires safe local account input. |
| L5-STD-007    | `ops_admin`               | `user`, `organization`, `redeem_code`, `authorization` | blocked | Negative permission fixture passed, but positive ops_admin walkthrough requires safe local account input.     |
| L5-STD-008    | `super_admin`             | governance and negative authorization families         | blocked | No safe local super_admin account input was provided for positive walkthrough.                                |
| L5-STD-009    | `auditor`                 | `audit_log`, `ai_call_log`, evidence hygiene           | blocked | Evidence hygiene was preserved, but audit_log/ai_call_log runtime role walkthrough was not executed.          |

## Decision Impact

Standard MVP L5 is not complete.

This task improves the evidence posture from `not_executed_fresh_approval_required` to
`partial_local_safe_smoke_passed_but_credentialed_role_flow_blocked`. It does not justify a Standard MVP acceptance
Pass and does not unblock Advanced L5, L6 owner preview, Provider, Cost Calibration, staging, release, or production
claims.

## Blocker

The next useful Standard L5 step requires one of these owner decisions:

- laozhuang manually enters or confirms safe local credentials for the needed role labels in the in-app browser; or
- laozhuang approves a separate fixture-only or seeded local-account evidence scope; or
- laozhuang accepts that Standard L5 remains blocked and proceeds only to decision-package work.

Codex must not create accounts, recover passwords, read `.env*`, inspect secrets, run seed/migration/database work, or
use non-allowlisted e2e specs without a separate approval.

## Artifact Hygiene

Playwright generated local ignored artifacts under `playwright-report/` and `test-results/`. They were not added to
Git and are not evidence.

## Residual Gaps

- Authenticated `student` Standard flow was not executed.
- Authenticated `content_admin`, `ops_admin`, and `super_admin` Standard flows were not executed.
- `audit_log` and `ai_call_log` runtime visibility were not executed for an authenticated reviewer.
- No Provider, staging, production, database, account lifecycle, Cost Calibration, or release gate was executed.
