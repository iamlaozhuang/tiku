# Phase 20 Fix RA-03-08 Mock Exam Record List Evidence

**Task id:** `phase-20-fix-ra-03-08-mock-exam-record-list`

**Branch:** `codex/phase-20-fix-ra-03-08-mock-exam-record-list`

## Summary

- Result: pass; pending git closeout.
- Scope: implementation.
- Changed surfaces: `exam_report` list DTO/mapper/validator/service repository, student `mock_exam` record-list UI, unit tests, task plan/evidence/state.
- Gates: task claim readiness, focused RED/GREEN, typecheck, full unit, full e2e, build, readiness, git inventory, diff check, changed-file Prettier, naming, and quality gate passed.
- Forbidden scope (`forbiddenScope`): no env/dependency/schema/migration/staging/prod/cloud/deploy/real provider/destructive data work.
- Residual gaps (`residualGaps`): none for RA-03-08 local scope; terminated attempts still do not generate report detail by contract.

## Startup Recovery

- Current branch: `codex/phase-20-fix-ra-03-08-mock-exam-record-list`.
- `master` and `origin/master`: `0953333925580a1daa2758b29cc52bec4e436840`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- Current worktree was clean before claim updates.
- Long-lived blocked gates remain in effect: real provider/staging/prod/cloud/deploy, dependency, secret/env, destructive data.

## Claim Result

| Command                                                                                                                                                          | Result | Notes                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-08-mock-exam-record-list` | pass   | Task was `pending`, dependency was complete, branch was not protected, blocked files and risk gates were clear. |

## Implementation Notes

- Extended `ExamReportSummaryDto` with `examReportPublicId` and `startedAt`.
- Kept report detail lookup report-backed; list rows now represent `mock_exam` attempts and expose `examReportPublicId: null` when a terminated attempt has no report.
- Changed list validation and pagination semantics to `sortBy: startedAt`; `terminated` is now an accepted list status.
- Reworked the Postgres list repository to query `mock_exam` attempts, left join `exam_report`, include `scoring`, `scoring_partial_failed`, `completed`, and `terminated`, and sort by `mock_exam.started_at`.
- Updated the student record-list UI to request `sortBy=startedAt`, display the attempt start date, and link to report detail through `examReportPublicId` only when available.
- Did not modify schema, migrations, env files, package/lock files, scripts, cloud, provider, or destructive data surfaces.

## Command Results

| Command                                                                                                                                                                                                                                                                                          | Result | Notes                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts src/server/mappers/exam-report-mapper.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                                                                                                          | fail   | Expected RED: mapper/service/UI tests failed before implementation because `examReportPublicId`, `startedAt`, `terminated`, and `sortBy=startedAt` behavior was missing. |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                          | fail   | Sandbox EPERM opening local `node_modules` `tsc`; rerun outside sandbox.                                                                                                 |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                          | fail   | Typecheck ran outside sandbox and found old repository mocks missing `exam_report_public_id` and `started_at`.                                                           |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                          | pass   | After mock updates, TypeScript passed.                                                                                                                                   |
| `npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts src/server/mappers/exam-report-mapper.test.ts tests/unit/student-mock-exam-report-ui.test.ts`                                                                                                                          | pass   | Focused mapper/service/UI tests: 3 files, 25 tests passed.                                                                                                               |
| `npm.cmd run test:unit -- src/server/services/exam-report-service.test.ts src/server/mappers/exam-report-mapper.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts tests/unit/phase-7-student-flow-runtime-smoke.test.ts` | pass   | Focused plus affected runtime smoke tests: 5 files, 28 tests passed.                                                                                                     |
| `node .\node_modules\prettier\bin\prettier.cjs --check <changed files>`                                                                                                                                                                                                                          | fail   | Sandbox EPERM opening local Prettier; rerun outside sandbox.                                                                                                             |
| `node .\node_modules\prettier\bin\prettier.cjs --check <changed files>`                                                                                                                                                                                                                          | fail   | Formatting warnings in this evidence file and `student-flow-runtime-repository.ts`.                                                                                      |
| `node .\node_modules\prettier\bin\prettier.cjs --write docs\05-execution-logs\evidence\phase-20-fix-ra-03-08-mock-exam-record-list.md src\server\repositories\student-flow-runtime-repository.ts`                                                                                                | pass   | Formatted only current-task files.                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-03-08-mock-exam-record-list`                                                                                                                                 | pass   | Re-run after claim; task was `claimed`, branch not protected, risk gates clear.                                                                                          |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                          | fail   | Full unit exposed old validator assertions still expecting `generatedAt` and rejecting `terminated`.                                                                     |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                                          | pass   | Full unit passed after updating validator tests: 131 files, 535 tests.                                                                                                   |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                                           | pass   | Playwright e2e passed: 25 tests.                                                                                                                                         |
| `npm.cmd run build`                                                                                                                                                                                                                                                                              | pass   | Next build passed. Log noted `.env.local` existence via framework auto-load only; contents were not opened, read, copied, or modified.                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                   | pass   | Required governance files, scripts, npm scripts, and skills present.                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                              | pass   | Inventory completed on task branch with only allowed current-task files dirty/untracked.                                                                                 |
| `git diff --check`                                                                                                                                                                                                                                                                               | pass   | No whitespace errors.                                                                                                                                                    |
| `node .\node_modules\prettier\bin\prettier.cjs --check <changed files>`                                                                                                                                                                                                                          | pass   | All changed Markdown/YAML/TS/TSX files use Prettier style.                                                                                                               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                      | pass   | Banned terms, risky generic terms, API route case, and DTO camelCase checks passed.                                                                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                                          | pass   | `lint`, `typecheck`, `test:unit` (131 files, 535 tests), and `format:check` passed.                                                                                      |

## Closeout Status

- commit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.
