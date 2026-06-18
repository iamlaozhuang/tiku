# standard-core-student-local-full-flow-validation Evidence

## Scope

- Task: `standard-core-student-local-full-flow-validation`
- Branch: `codex/standard-core-student-local-full-flow-validation`
- Profile: `local_full_flow`
- Target experience chain: `standard-core-student`
- Use cases:
  - `UC-STD-ACCOUNT-SESSION`
  - `UC-STD-PERSONAL-AUTH-REDEEM`
  - `UC-STD-PRACTICE`
  - `UC-STD-MOCK-EXAM`
  - `UC-STD-REPORT-MISTAKE-BOOK`
- Result: `blocked_validation_failure`
- Cost Calibration Gate remains blocked.

## Approval Boundary

Current 2026-06-18 user prompt explicitly approved this task's localhost-only Browser/Playwright runtime validation
against these existing local e2e specs:

- `e2e/local-auth-route-guard.spec.ts`
- `e2e/student-practice-mock-entry.spec.ts`
- `e2e/local-business-flow.spec.ts`

The same prompt approved local closeout commit, fast-forward merge to `master`, push to `origin/master`, and short-branch
cleanup for this task. Product source fixes, e2e spec edits, `.env*`, package/lockfile/dependency changes,
schema/drizzle/migration changes, provider/model work, staging/prod/cloud/deploy/payment/external-service work,
destructive database operations, PR, force-push, and Cost Calibration Gate remained blocked.

## Module Run v2 Evidence

- Batch range: single local full-flow validation task for the standard student core chain.
- RED: prior five coverage matrix rows were `local_experience_ready` but blocked at
  `standard_core_student_runtime_full_flow_validation_pending`; targeted runtime validation in this task failed.
- GREEN: blocked; focused unit validation and e2e list passed, but targeted local full-flow runtime validation failed.
- Commit: `75fe94911ec0f812e907ffed15ac528ca4bb36fa` pre-closeout baseline before this validation branch.
- localFullLoopGate: approved_localhost_only for existing local Playwright specs
  `e2e/local-auth-route-guard.spec.ts`, `e2e/student-practice-mock-entry.spec.ts`, and
  `e2e/local-business-flow.spec.ts`.
- threadRolloverGate: no thread rollover required for this validation.
- nextModuleRunCandidate: `standard-core-student-local-full-flow-contract-repair` as a recommended minimal repair task;
  not seeded by this blocked validation closeout.
- Blocked remainder: student-core experience closure readiness audit, standard admin ops/logs full-flow validation unless
  bypassed by user, release/staging/prod/provider/payment/external-service gates, and Cost Calibration Gate remain
  blocked.

## Preconditions

- `git switch master`: pass before branch creation; branch was up to date with `origin/master`.
- `git fetch --prune origin`: pass before branch creation.
- `git status --short --branch`: pass, clean on `master` before branch creation.
- `git rev-parse HEAD master origin/master`: pass; all three were
  `75fe94911ec0f812e907ffed15ac528ca4bb36fa`.
- `git for-each-ref --format='%(refname:short)' refs/heads/codex refs/remotes/origin/codex`: pass, no `codex/*`
  output before branch creation.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                                    | Result         | Notes                                                                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`                                                                                                                                                                                                                                                                 | pass           | selected `standard-core-student-local-full-flow-validation` before claim; after claim reported current task active                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`                                                                                                                                                                                                                                                    | pass           | current task active after `currentTask` pointer repair                                                                                            |
| `npm.cmd run test:unit -- src/server/auth/session-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts` | pass           | 7 files, 68 tests                                                                                                                                 |
| `npm.cmd run test:e2e -- --list`                                                                                                                                                                                                                                                                                                                                           | pass           | 31 tests in 14 files; runtime not executed                                                                                                        |
| `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts`                                                                                                                                                                                                                                       | fail           | 10 passed, 2 failed, 12 total                                                                                                                     |
| `npx.cmd prettier --check --ignore-unknown ...`                                                                                                                                                                                                                                                                                                                            | pass           | initial check found this evidence markdown unformatted; scoped `prettier --write` was run on allowed docs files, then check passed                |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                         | pass           | no whitespace errors                                                                                                                              |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                         | pass           | ESLint passed                                                                                                                                     |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                    | pass           | `tsc --noEmit` passed                                                                                                                             |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-validation`                                                                                                                                                                                                                                                                          | pass           | allowed-files scope and sensitive evidence scan passed                                                                                            |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-validation`                                                                                                                                                                                                                                                                     | expected block | first run rejected blocked result and missing strict evidence anchors; rerun after anchor updates failed only with `HARD_BLOCK_EVIDENCE_NOT_PASS` |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId standard-core-student-local-full-flow-validation`                                                                                                                                                                                                                                                                            | pass           | pre-push readiness passed                                                                                                                         |

## Runtime Failure Summary

- `e2e/local-auth-route-guard.spec.ts`: 10 Chromium tests passed.
- `e2e/local-business-flow.spec.ts`: failed at `localStorage.getItem("tiku.localSessionToken")`, where the spec expected a
  string and received `null`.
- `e2e/student-practice-mock-entry.spec.ts`: failed because `practice-resume-choice` did not become visible within the
  assertion timeout.
- Generated Playwright error-context paths were not copied into evidence because this task's redaction boundary forbids
  DOM dumps, screenshots, traces, and raw browser artifacts.

## Read-Only Root Cause Notes

- Current `tests/unit/student-login-ui.test.ts` explicitly verifies that login keeps the bearer token out of browser
  storage and leaves `localStorage.getItem("tiku.localSessionToken")` as `null`.
- Current `src/app/(auth)/login/page.tsx` redirects after successful session creation without writing the returned token to
  localStorage.
- Current `src/features/student/studentRuntimeApi.ts` still reads `tiku.localSessionToken` for student runtime API calls.
- Current `src/features/student/practice/StudentPracticePage.tsx` shows `practice-resume-choice` only when
  `hasPracticeResumeProgress(...)` is true from `practice.lastAnsweredAt` or `answerRecords.length > 0`.
- Current `tests/unit/student-practice-ui.test.ts` covers the resume panel with mocked `lastAnsweredAt` and answer records;
  the local runtime e2e data did not expose the same resume state during this run.

## Decision

- Do not mark any of the five standard student core rows `experience_closed`.
- Keep the rows at `local_experience_ready` with a blocked full-flow gate, because focused unit and e2e-list evidence
  passed but targeted runtime evidence failed.
- Recommended smallest follow-up repair task: `standard-core-student-local-full-flow-contract-repair`.
- The follow-up should reconcile the browser session contract used by local full-flow specs with the current
  no-bearer-token-in-localStorage login contract, and align the practice runtime fixture or UI contract for the
  `practice-resume-choice` branch. It should use focused RED/GREEN evidence and keep provider/model, schema/migration,
  dependency, `.env*`, staging/prod/cloud/deploy/payment/external-service, destructive DB, PR, force-push, and Cost
  Calibration Gate blocked unless separately approved.
