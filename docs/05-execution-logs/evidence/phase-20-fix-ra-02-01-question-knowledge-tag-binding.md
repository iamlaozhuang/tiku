# Phase 20 Fix RA-02-01 Question Knowledge Tag Binding Evidence

**Task id:** `phase-20-fix-ra-02-01-question-knowledge-tag-binding`

**Branch:** `codex/phase-20-fix-ra-02-01-question-knowledge-tag-binding`

## Summary

- Result: pass.
- Scope: implementation.
- Changed surfaces: question/tag/knowledge_node binding schema and migration, question validator/mapper/repository, focused unit tests, existing runtime fixture tests, task state/evidence/plan.
- Gates: focused red/green unit tests, `test:unit`, `test:e2e`, readiness, git inventory, naming, diff check, quality gate, and build passed.
- Forbidden scope (`forbiddenScope`): `.env.local` read/edit, `.env.example`, package/lockfile/dependency, staging/prod/cloud/deploy/real provider, destructive data operation, and `drizzle-kit push` remained blocked.
- Residual gaps (`residualGaps`): none for RA-02-01 persistent binding. RA-02-03 runtime filtering remains a separate pending task.

## Human Approval

- 2026-05-28: user approved `phase-20-fix-ra-02-01-question-knowledge-tag-binding` `database_migration` local implementation within the listed boundaries.
- Approval permits local schema, reviewed SQL migration, repository/service/validator/mapper/test work for persistent question knowledge_node/tag binding.
- Approval does not permit env/secret changes, staging/prod/cloud/deploy/real provider access, dependency changes, or destructive data operations.

## Startup Recovery

- `git fetch origin`: pass.
- `git status --short --branch`: `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `git branch --list`: only `master` before task branch creation.
- `git worktree list`: only `D:/tiku`.
- Created branch: `codex/phase-20-fix-ra-02-01-question-knowledge-tag-binding`.

## Command Results

| Command                                                                                                                                                                   | Result | Notes                                                                                                                                       |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                            | pass   | Required files, scripts, package scripts, and skill paths present.                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-02-01-question-knowledge-tag-binding` | pass   | Task was pending, dependency listed, branch used, validation commands visible.                                                              |
| `npm.cmd run test:unit -- src/db/schema/paper.test.ts src/server/validators/question.test.ts src/server/services/question-service.test.ts`                                | fail   | RED: 7 expected failures covered missing association schema, omitted validator fields, and mapper returning empty arrays.                   |
| `npm.cmd run test:unit -- src/db/schema/paper.test.ts src/server/validators/question.test.ts src/server/services/question-service.test.ts`                                | pass   | GREEN: 3 files, 14 tests passed after schema/validator/repository/mapper implementation.                                                    |
| `node .\node_modules\drizzle-kit\bin.cjs generate --config .\.agent\tiku-drizzle-generate.config.ts`                                                                      | pass   | Used ignored local temp config to avoid repository `drizzle.config.ts` and `.env.local`; generated reviewed SQL migration and snapshot.     |
| `docker compose cp drizzle\20260528013600_add_question_knowledge_tag_binding.sql tiku-postgres:/tmp/20260528013600_add_question_knowledge_tag_binding.sql`                | pass   | Copied reviewed additive migration into local dev PostgreSQL container only.                                                                |
| `docker compose exec --no-tty tiku-postgres psql -v ON_ERROR_STOP=1 -U tiku -d tiku -f /tmp/20260528013600_add_question_knowledge_tag_binding.sql`                        | pass   | Applied local dev migration: `CREATE TABLE`, `ALTER TABLE`, and `CREATE INDEX` only.                                                        |
| `npm.cmd run typecheck`                                                                                                                                                   | fail   | Initial sandbox run failed with EPERM reading local TypeScript CLI from `node_modules`; rerun with approved escalation was needed.          |
| `npm.cmd run typecheck`                                                                                                                                                   | pass   | TypeScript passed after adding binding arrays to existing test fixtures.                                                                    |
| `npm.cmd run test:unit`                                                                                                                                                   | pass   | 134 files, 562 tests passed.                                                                                                                |
| `npm.cmd run test:e2e`                                                                                                                                                    | fail   | First run failed because local dev DB had not yet applied the new migration; error was `relation "question_knowledge_node" does not exist`. |
| `npm.cmd run test:e2e`                                                                                                                                                    | pass   | 25 browser tests passed after applying the local dev migration.                                                                             |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                               | pass   | Naming convention scan completed.                                                                                                           |
| `git diff --check`                                                                                                                                                        | pass   | No whitespace errors.                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                       | pass   | Inventory showed task-scoped changes and untracked task files before commit.                                                                |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                   | pass   | `lint`, `typecheck`, `test:unit` 134 files/562 tests, and `format:check` passed.                                                            |
| `npm.cmd run build`                                                                                                                                                       | pass   | Next.js build compiled successfully. Framework output mentioned `.env.local` existence only; no env value was read or recorded.             |

## TDD Log

- RED: added focused tests for `tag`, `question_knowledge_node`, `question_tag`, validator publicId arrays, and DTO mapping. The focused test run failed for the expected missing behavior.
- GREEN: implemented the minimum schema, validator, repository hydration/replacement, mapper, and fixture updates needed for the focused tests to pass.

## Implementation Notes

- Added `tag`, `question_knowledge_node`, and `question_tag` Drizzle schema with project index naming.
- Added reviewed SQL migration `drizzle/20260528013600_add_question_knowledge_tag_binding.sql` and Drizzle snapshot `drizzle/meta/0004_snapshot.json`.
- Stripped a BOM from existing `drizzle/meta/0002_snapshot.json` because Drizzle Kit could not parse the historical snapshot; content was not semantically changed.
- Extended question create/update normalization with `knowledgeNodePublicIds` and `tagPublicIds`, defaulting missing arrays to `[]` for backward compatibility while rejecting malformed arrays.
- Persisted bindings transactionally with existing question options and scoring points.
- Hydrated question list/detail/copy DTOs with bound `knowledge_node` and `tag` public identifiers.
- Did not implement RA-02-03 list filtering; that remains separately queued.

## Validation

- Focused unit: pass.
- Full unit: pass.
- E2E: pass after local dev migration applied.
- Readiness/git/naming/diff/quality gate/build: pass.

## Closeout Status

- Implementation commit: `2d40b5ca34cc7d9130f244c5f6033fe3b2601269` (`fix(question): persist knowledge tag bindings`).
- Local merge form: fast-forward into `master`; `master` and the task branch pointed at the same implementation commit before branch cleanup.
- Post-merge master validation:
  - `git diff --check`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`: pass (`lint`, `typecheck`, `test:unit` 134 files/562 tests, `format:check`).
  - `npm.cmd run test:e2e`: pass (25 tests).
  - `npm.cmd run build`: pass.
- Push: `git push origin master` pushed `5f3de7e..2d40b5c` to `origin/master`.
- Cleanup: deleted merged short-lived branch `codex/phase-20-fix-ra-02-01-question-knowledge-tag-binding`.
- Final repository check after push/cleanup:
  - `git status --short --branch`: `## master...origin/master`.
  - `git rev-list --left-right --count master...origin/master`: `0 0`.
  - `git branch --list`: only `master`.
  - `git worktree list`: only `D:/tiku  2d40b5c [master]`.
- Result: closed.
