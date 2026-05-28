# Phase 20 Fix RA-02-03 Question Knowledge Tag Filters Evidence

**Task id:** `phase-20-fix-ra-02-03-question-knowledge-tag-filters`

**Branch:** `codex/phase-20-fix-ra-02-03-question-knowledge-tag-filters`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: question list route readers, validator, repository filters, focused unit/runtime tests, task plan/evidence/state.
- Gates: RED focused tests failed as expected; GREEN focused tests, `test:unit`, `test:e2e`, readiness, naming, git inventory, diff check, quality gate, and build passed.
- Forbidden scope (`forbiddenScope`): `.env.local`, `.env.example`, package/lockfile/dependency, new schema/migration, staging/prod/cloud/deploy/real provider, destructive data operation, and `drizzle-kit push` remain blocked.
- Residual gaps (`residualGaps`): browser evidence remains covered by existing local e2e gate; no new schema/migration was needed.

## Human Approval

- 2026-05-28: user approved `phase-20-fix-ra-02-03-question-knowledge-tag-filters`.
- Boundary: prefer reusing already landed `question_knowledge_node` and `question_tag` tables for local filters.
- Stop condition: if new schema/migration is required, stop and request separate approval.

## Startup Recovery

- `git fetch origin`: pass.
- `git status --short --branch`: `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `git branch --list`: only `master` before task branch creation.
- `git worktree list`: only `D:/tiku`.
- Created branch: `codex/phase-20-fix-ra-02-03-question-knowledge-tag-filters`.

## Command Results

| Command                                                                                                                                                                                                                                                                    | Result | Notes                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-03-question-knowledge-tag-filters`                                                                                                  | pass   | Task is pending, current branch is short-lived, allowed/blocked files and validation commands are visible.                                                                                                                           |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/question-route.test.ts`                                                                                                                  | fail   | RED: expected failures showed list filters were not normalized or passed from route to service.                                                                                                                                      |
| `npm.cmd run test:unit -- src/server/repositories/question-repository.test.ts`                                                                                                                                                                                             | fail   | RED: expected failures showed repository binding condition helpers did not exist.                                                                                                                                                    |
| `npm.cmd run test:unit -- tests/unit/phase-9-content-question-material-runtime.test.ts`                                                                                                                                                                                    | fail   | RED: expected failure showed the protected `/api/v1/questions` runtime did not pass knowledge_node/tag filters through.                                                                                                              |
| `npm.cmd run test:unit -- src/server/validators/question.test.ts src/server/services/question-service.test.ts src/server/services/question-route.test.ts src/server/repositories/question-repository.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts` | pass   | GREEN: 5 files, 23 tests passed after route/validator/repository/runtime implementation.                                                                                                                                             |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                    | fail   | Sandbox EPERM reading local TypeScript CLI from `node_modules`; no code diagnostics were produced.                                                                                                                                   |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                    | pass   | Rerun with approved escalation passed.                                                                                                                                                                                               |
| `npm.cmd run test:unit`                                                                                                                                                                                                                                                    | pass   | 135 files, 567 tests passed.                                                                                                                                                                                                         |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                     | fail   | First full e2e run had 24 passed and 1 failed. Failure was `local-business-flow` mock answer code `409311`, traced to local residual expired `mock_exam` state being auto-submitted on start; not caused by question filter changes. |
| `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`                                                                                                                                                                                                                  | pass   | Reproduced failing test after the residual expired mock_exam was consumed; 1 test passed.                                                                                                                                            |
| `npm.cmd run test:e2e`                                                                                                                                                                                                                                                     | pass   | Full e2e rerun passed: 25 tests.                                                                                                                                                                                                     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                             | pass   | Required files, scripts, package scripts, and skills present.                                                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                | pass   | Naming convention scan completed.                                                                                                                                                                                                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                        | pass   | Inventory showed only task-scoped tracked/untracked files before commit.                                                                                                                                                             |
| `git diff --check`                                                                                                                                                                                                                                                         | pass   | No whitespace errors.                                                                                                                                                                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                    | fail   | `lint`, `typecheck`, and `test:unit` passed; `format:check` failed only on this evidence file.                                                                                                                                       |
| `node .\node_modules\prettier\bin\prettier.cjs --write docs/05-execution-logs/evidence/phase-20-fix-ra-02-03-question-knowledge-tag-filters.md`                                                                                                                            | pass   | Formatted evidence file.                                                                                                                                                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                    | pass   | `lint`, `typecheck`, `test:unit` 135 files/567 tests, and `format:check` passed.                                                                                                                                                     |
| `npm.cmd run build`                                                                                                                                                                                                                                                        | pass   | Next.js build compiled successfully. Framework output mentioned `.env.local` existence only; no env value was opened or recorded.                                                                                                    |

## TDD Log

- RED: added list-filter tests for `knowledgeNodePublicId` and `tagPublicId` in validator, route, service, repository condition construction, and protected content runtime.
- GREEN: implemented the minimum list-query normalization, route query propagation, and repository database-level binding conditions needed for the focused tests to pass.

## Implementation Notes

- Added `knowledgeNodePublicId` and `tagPublicId` to normalized question list input.
- Added the same query params to the standalone question route reader and the protected content question/material runtime reader.
- Added database-level binding filters using the existing `question_knowledge_node`, `question_tag`, `knowledge_node`, and `tag` tables.
- No `src/db/schema/**` or `drizzle/**` files were modified; no new migration was required.

## Security Review

- Task id: `phase-20-fix-ra-02-03-question-knowledge-tag-filters`.
- Branch: `codex/phase-20-fix-ra-02-03-question-knowledge-tag-filters`.
- Base: `master` at `78ebfac5ed0387fb5e0feca3129a1383ca6ef2be`.
- Reviewer: Codex.
- Review date: 2026-05-28.
- Files reviewed: question route/service/validator/repository, protected content runtime, focused tests, task state/evidence/plan.
- Risk types reviewed: `database_migration`, `local_human_verification`, `evidence_integrity`.
- Abuse cases considered: unsupported query params bypassing list filters, internal numeric ids leaking through DTOs, schema/migration boundary bypass, and cross-route mismatch between standalone route and protected runtime.
- Data exposure review: filters accept public identifiers only and response DTO shape remains unchanged; numeric ids stay internal.
- Authorization boundary review: protected runtime still resolves authenticated admin session before content data; this task does not change permission checks.
- API contract review: path remains `/api/v1/questions`; query params and response JSON use camelCase; response envelope remains `{ code, message, data, pagination? }`.
- Test coverage and accepted gaps: focused unit/runtime tests cover query propagation and database-level condition construction; full e2e will be rerun as a broad local regression gate.
- Verdict: `APPROVE`.

## Validation

- Focused RED/GREEN: pass.
- Typecheck: pass after sandbox escalation.
- Full unit: pass.
- E2E: pass after documenting and rerunning one local residual-state failure.
- Readiness/git/naming/diff/quality gate/build: pass.

## Closeout Status

- Pending.
