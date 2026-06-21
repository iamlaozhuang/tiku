# Fix Mistake Book Cookie Session Evidence

moduleRunVersion: 2

## Approval And Scope

autoDriveLocalImplementationApproval: user approved serial repair work after the static audit closeout, including local
commit, fast-forward merge to master, push to origin/master, and cleanup of the merged short branch.

Cost Calibration Gate remains blocked.

## Closeout Anchors

- Batch range: single repair packet for `mistake-book-cookie-session-contract-repair`.
- Commit: `bfbc32a0` is the task seed commit; the final local repair commit follows this evidence record.
- RED: `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts` failed as expected after adding the
  cookie-backed session test and before implementation.
- GREEN: `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts` passed after implementation with 1 test
  file and 11 tests passing.
- localFullLoopGate: not run because browser runtime, dev server, and e2e runtime are outside the approved scope for
  this task; focused unit, lint, typecheck, formatting, and Module Run v2 gates were used instead.
- threadRolloverGate: not required; this task stays in the current thread through closeout.
- nextModuleRunCandidate: review other student pages for duplicated local session handling only after this scoped repair
  closes, or take the next user-approved repair from the audit matrix.

Scope was limited to:

- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `tests/unit/student-mistake-book-ui.test.ts`
- `docs/05-execution-logs/task-plans/2026-06-21-fix-mistake-book-cookie-session.md`
- `docs/05-execution-logs/evidence/2026-06-21-fix-mistake-book-cookie-session.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-fix-mistake-book-cookie-session.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

No browser runtime, dev server, e2e runtime, database connection, schema or migration change, dependency change,
provider call, env secret access, payment, deploy, PR, force-push, destructive database operation, staging/prod/cloud
access, or Cost Calibration Gate work was performed.

## Static Finding

Before the repair, `StudentMistakeBookPage` read the local student session value directly and returned the unauthorized
state when the value was missing. Normal student login intentionally relies on the HttpOnly cookie path and does not
persist a bearer credential in localStorage, so this page could reject a valid cookie-backed student session even though
the route guard accepted it.

## RED/GREEN Trace

| Command                                                                                                                                                                          | Result | Evidence                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts`                                                                                                            | fail   | RED reproduced: new cookie-backed session test failed because the page showed login UI. |
| `npm.cmd run test:unit -- tests/unit/student-mistake-book-ui.test.ts`                                                                                                            | pass   | GREEN after repair: 1 test file passed, 11 tests passed.                                |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/protected-route-guard-ui.test.ts tests/unit/student-mistake-book-ui.test.ts`                            | pass   | Related session coverage passed: 3 test files passed, 24 tests passed.                  |
| `npm.cmd run lint`                                                                                                                                                               | pass   | ESLint completed without errors.                                                        |
| `npm.cmd run typecheck`                                                                                                                                                          | pass   | `tsc --noEmit` completed without errors.                                                |
| `git diff --check`                                                                                                                                                               | pass   | No whitespace errors.                                                                   |
| `node .\node_modules\prettier\bin\prettier.cjs --check <changed repair files>`                                                                                                   | pass   | All matched files use Prettier code style.                                              |
| `rg -n "TODO\|TBD\|占位\|以后补" <changed repair docs>`                                                                                                                          | pass   | No placeholder markers found.                                                           |
| Legacy terminology scan for changed repair docs                                                                                                                                  | pass   | No glossary correction hits found.                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId mistake-book-cookie-session-contract-repair`      | pass   | Scoped pre-commit hardening passed after evidence terminology cleanup.                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId mistake-book-cookie-session-contract-repair` | pass   | Module closeout readiness passed after strict evidence anchors were recorded.           |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId mistake-book-cookie-session-contract-repair`        | pass   | Pre-push readiness passed for the current branch and state checkpoint.                  |

## Implementation Summary

- Replaced page-local session/fetch helpers with shared `fetchStudentApi`, `getStoredStudentSessionToken`, and
  `isStudentUnauthorizedResponse`.
- Removed the preflight unauthorized branch that treated absence of a local session value as unauthenticated.
- Kept local automation bearer support intact when a stored session value exists.
- Added unit coverage for cookie-backed loading without a local session value and for real API unauthorized response
  handling.

## Redaction

Evidence records command summaries only. It does not include session credentials, database URLs, Authorization headers,
raw DB rows, plaintext `redeem_code`, raw prompts, provider payloads, private answer text, or full paper content.
