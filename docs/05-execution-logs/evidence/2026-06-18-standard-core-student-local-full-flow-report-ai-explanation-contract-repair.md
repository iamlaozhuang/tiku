# standard-core-student-local-full-flow-report-ai-explanation-contract-repair Evidence

## Module Run V2 Anchors

- Task id: `standard-core-student-local-full-flow-report-ai-explanation-contract-repair`
- Branch: `codex/mechanism-throughput-readiness-tuning`
- Head at evidence creation: `bd24626a`
- Evidence created at: `2026-06-18T10:48:00-07:00`
- Task kind: `implementation`
- Execution profile: `local_unit_tdd_plus_scoped_local_full_flow`
- Target experience chain: `standard-core-student`
- Cost Calibration Gate remains blocked.
- result: blocked

## Scope

- Seeded after `standard-core-student-local-full-flow-validation-rerun` produced fresh blocked localhost evidence.
- Repair was limited to the student-experience facade contract for:
  - exam report creation payload;
  - exam report learning-suggestion retry;
  - mistake-book AI explanation OK response.
- No e2e spec edits, package/lockfile/dependency changes, `.env*`, schema/drizzle/migration, provider/model configuration,
  staging/prod/cloud/deploy/payment/external-service work, destructive DB, PR, force-push, or Cost Calibration Gate work.

## Root Cause

- `src/server/services/student-experience/route-handlers.ts` delegated existing local student runtime routes for list/detail
  paths, but returned provider-blocked responses for `examReports.generation`, `examReports.retryLearningSuggestion`, and
  `mistakeBooks.aiExplanation`.
- The local full-flow specs require these standard student local flows to use the existing deterministic legacy runtime.

## Implementation Summary

- Added focused RED coverage in `tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` proving the
  student-experience facade must delegate those three local handlers to injected legacy runtimes.
- Changed only `src/server/services/student-experience/route-handlers.ts` so the three local handlers call the existing
  legacy runtime handlers.

## Runtime Failure Summary

- Focused unit gates pass.
- `student-practice-mock-entry.spec.ts` now passes, including mistake-book AI explanation POST.
- The targeted local full-flow command still fails with 11 passed and 1 failed test.
- New blocking failure:
  - `e2e/local-business-flow.spec.ts` failed at line 389 while waiting for heading `题库与材料管理` after navigating to the
    content admin route group, starting with `/content/questions`.
- The previous report payload and mistake-book AI explanation blockers moved forward.

## Module Run V2 Evidence Anchors

- Batch range: single repair task `standard-core-student-local-full-flow-report-ai-explanation-contract-repair`; no closure
  audit executed.
- RED: `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts` failed
  because `exam_report.generation` returned provider-blocked `423101` instead of a local `data.examReport.publicId`.
- GREEN: the focused unit test passed after the facade delegated exam report generation, report retry, and mistake-book AI
  explanation to the existing legacy runtimes.
- Commit: `bd24626a` is the branch head at this evidence point; no local commit, merge, push, or branch cleanup was
  performed in this task.
- localFullLoopGate: blocked by a new downstream content-admin heading assertion in `local-business-flow`.
- threadRolloverGate: no rollover required; current context remained sufficient.
- nextModuleRunCandidate: `standard-core-student-local-full-flow-content-admin-heading-contract-repair`

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Result | Notes                                                                                                        |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                    | failed | RED: 4 passed, 1 failed; facade returned provider-blocked `423101` for exam report generation.               |
| `npm.cmd run test:unit -- tests/unit/student-experience/student-experience-layering-mistake-book.test.ts`                                                                                                                                                                                                                                                                                                                                                                                                                    | pass   | GREEN: 1 test file passed; 5 tests passed.                                                                   |
| `npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts src/server/services/exam-report-route.test.ts src/server/services/mistake-book-service.test.ts src/server/services/mistake-book-route.test.ts tests/unit/student-experience/student-experience-layering-mistake-book.test.ts tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts` | pass   | 9 test files passed; 72 tests passed.                                                                        |
| `npm.cmd run test:e2e -- --list`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | pass   | 31 tests discovered in 14 files.                                                                             |
| `npm.cmd run test:e2e -- e2e/local-auth-route-guard.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-business-flow.spec.ts`                                                                                                                                                                                                                                                                                                                                                                                         | failed | 11 passed, 1 failed; new failure is content admin heading not visible in `local-business-flow`.              |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass   | Passed after removing the extra task-queue trailing blank line; Git reported only the existing CRLF warning. |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | pass   | ESLint passed.                                                                                               |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | pass   | TypeScript `tsc --noEmit` passed.                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId standard-core-student-local-full-flow-report-ai-explanation-contract-repair`                                                                                                                                                                                                                                                                                                                  | pass   | Pre-commit hardening passed for the scoped task files.                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-report-ai-explanation-contract-repair`                                                                                                                                                                                                                                                                                                             | failed | First run found the two readiness commands were not yet recorded in evidence.                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId standard-core-student-local-full-flow-report-ai-explanation-contract-repair`                                                                                                                                                                                                                                                                                                             | pass   | Rerun passed after evidence recorded the readiness commands.                                                 |

## Recommended Smallest Follow-Up Repair Task

- Task id: `standard-core-student-local-full-flow-content-admin-heading-contract-repair`
- Goal: repair or re-align the local admin content route entry contract that prevents `local-business-flow` from finding the
  `题库与材料管理` heading on `/content/questions`.
- Minimum read surface: `e2e/local-business-flow.spec.ts`, admin content route/page components for `/content/questions` and
  `/content/materials`, related focused unit tests, and this evidence.
- Still blocked: e2e spec edits, `.env*`, dependencies, lockfiles, schema/drizzle/migration, provider/model, staging/prod,
  cloud/deploy/payment/external-service, destructive DB, PR, force-push, and Cost Calibration Gate.

## Redaction And Safety

- No `.env*` read or write performed.
- No token value, Authorization header, password, secret, database URL, raw prompt, raw answer, provider payload, row data,
  screenshot, trace, or browser artifact is recorded here.
- Cost Calibration Gate remains blocked.

## Blocked Remainder

- `local_full_flow` e2e runtime validation remains blocked.
- Closure readiness audit remains blocked until a fresh rerun passes the targeted local full-flow specs.
- No `experience_closed` claim is made for the five standard student core use cases.
