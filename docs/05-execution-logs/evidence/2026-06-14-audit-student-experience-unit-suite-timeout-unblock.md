# Evidence: audit-student-experience-unit-suite-timeout-unblock

result: pass

## Task

- Task id: `audit-student-experience-unit-suite-timeout-unblock`
- Branch: `codex/fix-student-login-local-session-token`
- Batch range: unblock task for the full-unit gate blocking task 1 closeout.
- Commit: `dc2c14e77d93049cb748c615fa20ee249c3a73f6` pre-closeout base; final local task commit follows readiness gates.
- Date: 2026-06-14 local time.

## Start Checkpoint

| Checkpoint                      | Result                                        |
| ------------------------------- | --------------------------------------------- |
| Current branch                  | `codex/fix-student-login-local-session-token` |
| `HEAD`                          | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`    |
| `master`                        | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`    |
| `origin/master`                 | `dc2c14e77d93049cb748c615fa20ee249c3a73f6`    |
| Worktree                        | dirty with task 1 edits and evidence          |
| Local `codex/*` residue         | current branch only                           |
| Remote `origin/codex/*` residue | none observed                                 |

## Root Cause Investigation

- Full unit previously failed in `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`.
- Failure mode: `routes student APIs through the scoped student-experience layer` timed out after the default 5000ms.
- Targeted rerun of the file passed with 4 tests.
- The file's first test performs source reads and dynamic import of `src/server/services/student-experience/route-handlers.ts`.
- A full-unit rerun before the stability edit passed, so the timeout was intermittent under full-suite CPU/import/setup
  pressure rather than a deterministic assertion or product-code regression.

## Implementation

- Added `STUDENT_EXPERIENCE_LAYERING_TEST_TIMEOUT_MS = 15000`.
- Applied that timeout only to the heavier student-experience layering route test.
- Did not modify product student-experience implementation, schema, dependencies, env/secret files, or scripts.

## Validation Results

| Command                                                                                                                                                                                              | Result                                                                         |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`                                                                                            | pass, 1 file and 4 tests before stability edit                                 |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`                                                                                | pass, 2 files and 10 tests                                                     |
| `npm.cmd run test:unit`                                                                                                                                                                              | pass, 260 files and 954 tests before stability edit                            |
| `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`                                                                                            | pass, 1 file and 4 tests after stability edit                                  |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts`                                                                                | pass, 2 files and 10 tests after stability edit                                |
| `git diff --check`                                                                                                                                                                                   | pass                                                                           |
| `npm.cmd run lint`                                                                                                                                                                                   | pass                                                                           |
| `npm.cmd run typecheck`                                                                                                                                                                              | pass                                                                           |
| `npm.cmd run test:unit`                                                                                                                                                                              | pass, 260 files and 954 tests after stability edit                             |
| `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts tests/unit/auth/session-personal-auth-boundary.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` | pass, 3 files and 14 tests after sensitive-scan-safe fixture adjustment        |
| `git diff --check`                                                                                                                                                                                   | pass after sensitive-scan-safe fixture adjustment                              |
| `npm.cmd run lint`                                                                                                                                                                                   | pass after sensitive-scan-safe fixture adjustment                              |
| `npm.cmd run typecheck`                                                                                                                                                                              | pass after sensitive-scan-safe fixture adjustment                              |
| `npm.cmd run test:unit`                                                                                                                                                                              | pass, 260 files and 954 tests after sensitive-scan-safe fixture adjustment     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId fix-student-login-session-policy-consistency`                         | pass after scope and fixture-shape repair                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`                    | first run failed on evidence anchors; final rerun passed after evidence repair |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId fix-student-login-session-policy-consistency`                           | pass before local commit                                                       |

Batch commit evidence: local closeout commit is created after readiness gates; this evidence records the accepted
pre-closeout base commit above and the final commit will be visible in git history.

## Gates

- localFullLoopGate: pass through targeted tests, lint, typecheck, and full unit.
- threadRolloverGate: not required.
- automationHandoffPolicy: close the current branch only after final Module Run v2 gates, local commit, fast-forward
  merge, master-side validation, push, and merged branch cleanup.
- nextModuleRunCandidate: task 2 remains unclaimed until the current branch is closed.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

Product student-experience implementation edits, task 2 claim, PR, force-push, e2e, provider/model requests, quota use,
env/secret/provider configuration, schema/migration, dependency/package/lockfile changes, staging/prod/cloud/deploy,
payment, external-service, and Cost Calibration Gate remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records command names, pass/fail summaries, file paths, and policy boundaries only. It omits token values,
Authorization headers, passwords, secrets, database URLs, row data, provider payloads, model responses, and private user
data.
