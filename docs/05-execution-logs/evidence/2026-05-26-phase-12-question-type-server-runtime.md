# Phase 12 Question Type Server Runtime Evidence

## Task Boundary

- TaskId: `phase-12-question-type-server-runtime`
- Branch: `codex/phase-12-question-type-server-runtime`
- Scope: server validator, contracts/mappers as needed, runtime services, service tests, queue/state, task plan, and evidence.
- Human approval: user explicitly authorized local backend runtime, service, validator, contract, mapper, tests, docs, queue, evidence, and task plan work for `case_analysis` and `calculation` MVP implementation in this turn.

## Files Changed

- `src/server/validators/question.ts`
- `src/server/validators/question.test.ts`
- `src/server/services/question-service.test.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/mock-exam-service.test.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-draft-service.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-question-type-server-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-question-type-server-runtime.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## RED/GREEN Record

- RED: focused service/validator suite failed before implementation because:
  - validator accepted option payloads for `case_analysis` and `calculation`;
  - practice runtime did not classify the two new types as subjective text-answer questions, so AI hint status and retry budget stayed empty;
  - paper draft publish validation did not treat non-AI `case_analysis` / `calculation` as subjective for `scoring_point` total checks.
- GREEN: after implementation, the focused service/validator suite passed with 5 test files and 54 tests.
- Additional compatibility coverage:
  - question service preserves the two new `questionType` values, empty `questionOptions`, `scoringMethod`, and `scoringPoints`;
  - mock exam service preserves snapshots and sends text answers for the two new AI-scored subjective types through the existing subjective scoring runtime.

## Validation Records

| Command                                                                                                                                                                                                                                                   | Result    | Notes                                                                                                                               |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-question-type-server-runtime`                                                                                                | PASS      | Task was claimable after schema migration closed.                                                                                   |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts` | RED       | Expected TDD failure before implementation; failures matched validator option rejection and subjective runtime classification gaps. |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts` | PASS      | Focused suite passed after implementation: 5 files, 54 tests.                                                                       |
| `npm.cmd run lint`                                                                                                                                                                                                                                        | FAIL/PASS | Sandbox run failed with `EPERM` reading local `node_modules`; approved escalated rerun passed.                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                   | FAIL/PASS | Sandbox run failed with `EPERM` reading local `node_modules`; approved escalated rerun passed.                                      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                            | PASS      | Required standards, ADRs, SOPs, scripts, npm scripts, and skills were available.                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                               | FAIL/PASS | First run caught generic test wording; wording was changed to glossary-aligned `paper_section` / `question`, then the rerun passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                       | PASS      | Inventory completed before closeout; changes were limited to allowed server runtime/test/docs/state files.                          |
| `git diff --check`                                                                                                                                                                                                                                        | PASS      | No whitespace errors.                                                                                                               |

## Scope Flags

- Schema touched: No.
- Migration touched: No.
- Runtime touched: Yes.
- UI touched: No.
- Test touched: Yes.
- Docs/queue/evidence touched: Yes.
- Forbidden scope touched: No.

## Sensitive Data Check

- `.env.local` / `.env.example` read or changed: No.
- Secret/token/Authorization header recorded: No.
- Raw provider payload/prompt/answer/model response recorded: No.
- Full paper/textbook/OCR/customer-like private content recorded: No.
- Cloud/staging/prod/provider/deployment action: No.

## Taste Compliance Self-Check

- Cheap visual defaults: no UI changes in this task.
- Loading/empty/error states: no UI changes in this task.
- Interaction feedback: no UI changes in this task.
- Tailwind order: no Tailwind changed.
- N+1 queries: no repository query loops were added; runtime changes only adjust type classification.
- Schema-driven data: uses the existing schema enum and server contracts.
- API response contract: no API envelope change planned.
- Comments: no explanatory filler comments planned.
- Naming: uses registered identifiers `case_analysis`, `calculation`, `question`, `scoring_point`, `standard_answer`, and `ai_scoring`.
- Immutability: service updates will avoid mutating shared snapshots in place.

## Handoff To Admin UI Task

- Server validator now rejects non-empty `questionOptions` for `case_analysis` and `calculation`.
- Practice runtime treats both types as subjective text-answer questions with AI hint status and retry budget.
- Paper draft publish validation treats both types as subjective for `scoring_point` total checks even when `scoringMethod` is not `ai_scoring`.
- Mock exam AI scoring compatibility is covered by tests; no UI behavior was implemented in this task.
- `phase-12-question-type-admin-ui` should build the authoring/form/filter/list behavior on top of these server constraints and keep submitted options empty for both new types.

## Closeout Status

- Server runtime implementation complete on task branch; branch commit completed and post-merge master verification passed.

## Post-Close Metadata Verification

| Command                                                                                                                                                                                                                                                   | Result | Notes                                                                                                                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts` | PASS   | Reran after setting the task status to `closed`: 5 files, 54 tests.                                                      |
| `npm.cmd run lint`                                                                                                                                                                                                                                        | PASS   | Reran after task close metadata update with approved escalation for local `node_modules` access.                         |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                   | PASS   | Reran after task close metadata update with approved escalation for local `node_modules` access.                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                            | PASS   | Reran after setting task status to `closed`.                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                               | PASS   | Reran after glossary-aligned wording fix.                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                       | PASS   | Reran after setting task status to `closed`; inventory remained limited to allowed server runtime/test/docs/state files. |
| `git diff --check`                                                                                                                                                                                                                                        | PASS   | Reran after setting task status to `closed`; no whitespace errors.                                                       |

## Post-Merge Master Verification

| Command                                                                                                                                                                                                                                                   | Result | Notes                                                                                                                                          |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| `git merge --no-ff codex/phase-12-question-type-server-runtime -m "merge: add question type server runtime"`                                                                                                                                              | PASS   | Local merge into `master` completed with merge commit.                                                                                         |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts src/server/services/paper-draft-service.test.ts` | PASS   | Reran on `master`: 5 files, 54 tests.                                                                                                          |
| `npm.cmd run lint`                                                                                                                                                                                                                                        | PASS   | Reran on `master` with approved escalation for local `node_modules` access.                                                                    |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                   | PASS   | Reran on `master` with approved escalation for local `node_modules` access.                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                            | PASS   | Reran on `master` after merge.                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                               | PASS   | Reran on `master` after merge.                                                                                                                 |
| `git diff --check`                                                                                                                                                                                                                                        | PASS   | Reran on `master` after merge.                                                                                                                 |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`                                                                                                                | PASS   | `master` was ahead of `origin/master` by the task commit and merge commit; changed files matched allowed server runtime/test/docs/state files. |
