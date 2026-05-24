# Evidence: phase-11-mvp-content-to-student-runtime-propagation

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-content-to-student-runtime-propagation`
- Goal: close the local content-to-student propagation gap by proving newly published content ops paper snapshots appear in authorized student papers, practice, mock_exam, and exam_report surfaces where the local runtime supports them.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No real provider call.
- No secret/env change.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code` value, object storage secret, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                                   | Runtime surface                                              | Current state                     | Implementation evidence                                                                                                                                      | Downstream effect                                                                   | Remaining gap | Decision         |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ------------- | ---------------- |
| MVP-GAP-003: newly authored/published content appears in authorized student flows                                      | `/api/v1/student-papers`, `/home`, student paper service     | partial_runtime -> runtime_closed | `student-home-ui.test.ts` uses a content-side newly published `paperPublicId` and verifies home card plus practice/mock links                                | Student home reflects content ops output instead of seed-only paper assumptions     | none          | implemented      |
| US-03-01 AC-1/3/4/5: authorized paper list by profession/level/subject with practice/mock entries and publish ordering | `/api/v1/student-papers`, student home UI                    | partial_runtime -> runtime_closed | `npm.cmd run test:unit -- --run tests/unit/student-home-ui.test.ts` and full unit suite passed                                                               | Authorized papers render with correct runtime entry links                           | none          | implemented      |
| US-03-02/03 and US-03-05/06: selected published paper starts practice/mock_exam with correct snapshot                  | `/api/v1/practices`, `/api/v1/mock-exams`, student UI routes | partial_runtime -> runtime_closed | `student-practice-ui.test.ts`, `student-mock-exam-report-ui.test.ts`, and service/route targeted tests passed                                                | Fresh content can enter practice and mock_exam workflows                            | none          | implemented      |
| US-03-07/08/09: submitted mock downstream records use current snapshot                                                 | `/api/v1/exam-reports`, mock submit UI                       | entry-only -> runtime_closed      | RED test first failed because submitted mock did not create/link a runtime report; GREEN now posts `/api/v1/exam-reports` and links returned report publicId | Submitted mock flows to exam_report instead of falling back to seeded fixture link  | none          | implemented      |
| US-03-07/08/09: downstream mistake_book records use current snapshot                                                   | `/api/v1/mistake-books`, student services                    | partial_runtime                   | Targeted service/route suite including `mistake-book-service.test.ts` passed; no new mistake_book code was required in this task                             | Existing mistake_book runtime remains covered for propagated student answer records | P1            | follow-up scoped |
| Authorization and archive boundary                                                                                     | student services and API routes                              | partial_runtime                   | Existing service/route tests plus e2e required role flows passed; this task did not change permission model                                                  | Prevents unauthorized student access through current local guards                   | P1            | follow-up scoped |

## Problem Grading

| Severity | Affected role        | Reproduction path or command                                                                | Expected result                                                                 | Actual result before task                                                    | Fixed status | Residual risk                                                                                | Follow-up                                           |
| -------- | -------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| P0       | student, content ops | Unit test starting `/mock-exam?paperPublicId=paper-content-published-001`, submit mock_exam | Submit creates runtime exam_report and routes to the returned report publicId   | Submitted page fell back to the fixture-only mock exam report link           | fixed        | none for local mock_exam -> exam_report runtime path                                         | none                                                |
| P0       | student, content ops | Unit test loading `/home` with a content-side newly published paper publicId                | Student home renders the newly published paper and links to practice/mock_exam  | Prior test coverage only proved seeded paper entries                         | fixed        | none for UI/API contract propagation covered by local tests                                  | none                                                |
| P2       | content ops          | `npm.cmd run test:e2e`                                                                      | Content action closure E2E reflects current write-enabled content actions       | E2E still expected prior read-only/disabled content buttons                  | fixed        | none for updated assertions                                                                  | none                                                |
| P2       | student              | `npm.cmd run test:e2e -- --workers=1`                                                       | Navigation abort allowlist covers expected transition-time list/report requests | Exam report list request could be logged as expected route-transition abort  | fixed        | none for this abort classification                                                           | none                                                |
| P2       | all roles            | E2E dev server console during route transitions                                             | No hydration mismatch console noise                                             | `ProtectedRouteGuard` hydration mismatch logs were observed while tests pass | open         | Does not block this propagation task, but should be handled by a dedicated auth/session task | phase-11 auth/session hardening follow-up candidate |
| P1       | student              | End-to-end published paper -> wrong answer -> mistake_book with a newly authored paper      | Same newly published snapshot is visible in mistake_book                        | Service coverage exists, but this task did not add a browser-level loop      | open         | Requires a scoped follow-up to avoid overstating full cross-surface browser coverage         | future student runtime hardening task               |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master after paper task closeout.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-to-student-runtime-propagation
First result on master: blocked by protected-branch guard, as expected.
Retry result on branch codex/phase-11-mvp-content-to-student-runtime-propagation: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/student-mock-exam-report-ui.test.ts
RED result before implementation: failed 1/14 because submitted mock_exam did not render a runtime exam_report link.

npm.cmd run test:unit -- --run tests/unit/student-mock-exam-report-ui.test.ts
GREEN result after implementation: passed 1 file / 14 tests.

npm.cmd run test:unit -- --run tests/unit/student-home-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts
Result: passed 2 files / 19 tests.

npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts
Result: passed 1 file / 9 tests.

npm.cmd run test:unit -- --run tests/unit/student-home-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts
Result: passed 3 files / 28 tests.

npm.cmd run test:unit -- --run src/server/services/student-paper-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts tests/unit/phase-7-student-flow-runtime-smoke.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts
Result: passed 7 files / 49 tests.

npm.cmd run build
Result: passed. Build output mentioned `.env.local` as an environment source; no contents were read or recorded.

npm.cmd run test:unit
Result: passed 107 files / 402 tests.

npm.cmd run test:e2e
Initial result: failed 3 tests due stale content-action assertions and a route-transition exam_report list abort.
Action: stopped a stale local dev server on port 3000, updated assertions to match current content/paper runtime behavior, and added expected transition abort classification for exam_report list.

npm.cmd run test:e2e -- --workers=1
Result after fixes and fresh dev server: passed 9/9 tests.
Residual: route transition console logs still include a ProtectedRouteGuard hydration mismatch; recorded as P2 follow-up, not a blocker for this task.

git diff --check
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: inventory pass; changed files limited to current task code, tests, plan, evidence, and queue state.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                 | Result  |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-content-to-student-runtime-propagation`, not `master` or `main`                             | Pass    |
| Allowed files        | Changed files are student UI, unit tests, E2E tests, task plan, evidence, and queue state; blocked files untouched                | Pass    |
| AC-to-runtime matrix | Matrix records partial runtime, entry-only, runtime_closed, and residual P1 behavior explicitly                                   | Pass    |
| Problem grading      | P0/P1/P2 issues recorded with fixed status and residual risk                                                                      | Pass    |
| Validation record    | Claim readiness, RED/GREEN, targeted unit/service, full unit, e2e, build, readiness, naming, and Git inventory results recorded   | Pass    |
| Evidence hygiene     | No secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, or private data  | Pass    |
| Commit               | Pending task commit                                                                                                               | Pending |
| Merge                | Pending merge to `master`                                                                                                         | Pending |
| Push                 | Pending push to `origin/master`; user approved queue-wide routine push                                                            | Pending |
| Cleanup              | Pending short-lifecycle branch deletion after merge and master validation                                                         | Pending |
| Worktree residue     | Pending final clean status after merge/push/cleanup                                                                               | Pending |
| stagingDecision      | `local_task_closed_remaining_p1` because browser-level mistake_book/newly-published-paper loop and auth hydration residual remain | Pass    |
| Next step            | Commit, merge, push, cleanup; then claim `phase-11-mvp-student-ai-practice-mock-report-loop` only from clean `master`             | Pass    |

## stagingDecision

local_task_closed_remaining_p1

## Next Step

Commit, merge, push, clean the short-lifecycle branch, then claim `phase-11-mvp-student-ai-practice-mock-report-loop` from a clean `master` if queue readiness passes.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, object storage secrets, and private data.
