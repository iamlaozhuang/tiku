# Evidence: fix-student-login-session-policy-consistency

result: pass

## Task

- Task id: `fix-student-login-session-policy-consistency`
- Branch: `codex/fix-student-login-local-session-token`
- Batch range: strict serial task 1 of 6 requested by the user, closed after the approved student-experience unit timeout
  unblock.
- Commit: `dc2c14e77d93049cb748c615fa20ee249c3a73f6` pre-closeout base; final local task commit follows readiness gates.
- Date: 2026-06-14 local time.

## Start Checkpoint

| Checkpoint                      | Result                                                                       |
| ------------------------------- | ---------------------------------------------------------------------------- |
| Current branch                  | `codex/fix-student-login-local-session-token`                                |
| `HEAD`                          | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`                                   |
| `master`                        | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`                                   |
| `origin/master`                 | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`                                   |
| Worktree                        | dirty from the prior blocked `fix-student-login-local-session-token` attempt |
| Local `codex/*` residue         | current branch only                                                          |
| Remote `origin/codex/*` residue | none observed                                                                |

## Human Approval Boundary

The user approved Option A for this task:

- keep `server_session`;
- keep `exposeBearerTokenToClient: false`;
- do not persist the login response bearer token to login-page `localStorage`;
- update `tests/unit/student-login-ui.test.ts` so successful login verifies redirect, API call, and token non-rendering
  without expecting browser token persistence;
- do not modify `src/server/contracts/user-auth/session-boundary.ts` except read-only confirmation.

The user later approved the recommended unblock for the full-suite student-experience timeout on the same short branch,
including minimal test-stability edits if supported by evidence.

## RED / GREEN Evidence

RED: `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
failed as expected before removing login-page browser bearer-token persistence.

GREEN: `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
passed after removing login-page browser bearer-token persistence.

- RED command:
  `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- RED result: failed as expected while the failed-attempt login page still wrote the bearer token to browser storage.
  - `tests/unit/student-login-ui.test.ts`: expected `localStorage.getItem("tiku.localSessionToken")` to be `null`.
  - `tests/unit/auth/session-personal-auth-boundary.test.ts`: detected `localStorage` in
    `src/app/(auth)/login/page.tsx`.
- GREEN implementation: removed the login-page storage key and `window.localStorage.setItem` call only.
- GREEN command:
  `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`
- GREEN result: pass, 2 test files and 10 tests passed.

## Timeout Unblock Evidence

- Initial full `npm.cmd run test:unit` failed in
  `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` with a 5000ms timeout.
- Targeted rerun of the same file passed, 1 file and 4 tests.
- A full-unit rerun before the stability edit also passed, which showed the failure was intermittent suite-pressure
  timing rather than an assertion or product-code regression.
- Minimal stability edit: set a test-specific 15000ms timeout on the heavy student-experience layering route test only.
- Targeted student-experience rerun after the edit passed, 1 file and 4 tests.

## Validation Results

| Command                                                                                                                                                                                              | Result                                                                                                |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`                                                                                            | pass, 1 file and 4 tests                                                                              |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`                                                                                | pass, 2 files and 10 tests                                                                            |
| `git diff --check`                                                                                                                                                                                   | pass                                                                                                  |
| `npm.cmd run lint`                                                                                                                                                                                   | pass                                                                                                  |
| `npm.cmd run typecheck`                                                                                                                                                                              | pass                                                                                                  |
| `npm.cmd run test:unit`                                                                                                                                                                              | pass, 260 files and 954 tests                                                                         |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` | pass, 3 files and 14 tests after sensitive-scan-safe fixture adjustment                               |
| `git diff --check`                                                                                                                                                                                   | pass after sensitive-scan-safe fixture adjustment                                                     |
| `npm.cmd run lint`                                                                                                                                                                                   | pass after sensitive-scan-safe fixture adjustment                                                     |
| `npm.cmd run typecheck`                                                                                                                                                                              | pass after sensitive-scan-safe fixture adjustment                                                     |
| `npm.cmd run test:unit`                                                                                                                                                                              | pass, 260 files and 954 tests after sensitive-scan-safe fixture adjustment                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-consistency`                         | pass after adding the timeout-unblock test file to allowedFiles and avoiding secret-like fixture keys |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`                    | first run failed on evidence anchors; final rerun passed after evidence repair                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`                           | pass before local commit                                                                              |

Batch commit evidence: local closeout commit is created after readiness gates; this evidence records the accepted
pre-closeout base commit above and the final commit will be visible in git history.

## Scope Review

Changed implementation and test files stayed within the approved task and unblock scope:

- `src/app/(auth)/login/page.tsx`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`

Approved governance/log files were also updated or created under:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Read-only confirmation:

- `src/server/contracts/user-auth/session-boundary.ts` still declares `exposeBearerTokenToClient: false` and
  `sessionPersistenceMode: "server_session"`.

## Gates

- localFullLoopGate: pass after targeted tests, lint, typecheck, and full unit.
- threadRolloverGate: not required for this closeout.
- automationHandoffPolicy: complete only after final Module Run v2 gates, local commit, fast-forward merge to `master`,
  master-side validation, push `origin/master`, and merged short-branch cleanup.
- nextModuleRunCandidate: task 2 remains unclaimed until this branch is fully closed.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

Continuing to task 2 before branch closeout, PR, force-push, e2e, provider/model requests, quota use,
env/secret/provider configuration, schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy,
payment, external-service, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records command names, pass/fail summaries, file paths, and policy boundaries only. It omits token values,
Authorization headers, passwords, secrets, database URLs, row data, provider payloads, model responses, and private user
data.
