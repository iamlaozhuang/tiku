# AI Scoring Retry Persistence Implementation Evidence

**Task id:** `phase-21-ai-scoring-retry-persistence-implementation`

**Branch:** `codex/phase-21-ai-scoring-retry-persistence-implementation`

## Summary

- Result: pass with disclosed validation constraint conflict.
- Scope: additive database migration, schema/model/runtime persistence boundary, tests, task state, security review, and evidence.
- Human approval: user explicitly approved this fresh implementation task and approved `database_migration`, `ai_runtime`, `data_contract`, `evidence_integrity`, `local_human_verification`, and conditional `transaction_concurrency`.
- Changed surfaces:
  - `src/db/schema/ai-rag.ts`
  - `src/server/models/ai-rag.ts`
  - `src/server/services/ai-scoring-service.ts`
  - `src/server/services/student-flow-runtime.ts`
  - `src/server/repositories/ai-scoring-attempt-repository.ts`
  - `drizzle/20260531104500_add_ai_scoring_attempt.sql`
  - `drizzle/meta/_journal.json`
  - `drizzle/meta/0006_snapshot.json`
  - unit tests and task evidence/state files.

## Recovery And Claim Evidence

- Current branch after claim: `codex/phase-21-ai-scoring-retry-persistence-implementation`.
- Base context: stacked on `codex/phase-21-ai-scoring-retry-implementation-startup`, which contains the committed docs-only startup preparation.
- `master` and `origin/master` alignment before implementation: `0 0`.
- Worktrees before implementation: only `D:/tiku`.
- This is a fresh task and does not claim historical `closed` or `closureDecision: deferred` queue rows.

## Security Notes

- `.env.local` remains forbidden. `drizzle-kit generate` is skipped because the current Drizzle config may read `.env.local`.
- `drizzle-kit push` is forbidden and not run.
- No raw prompt, raw student answer, raw model response, raw provider payload, secret, or database URL may be stored in retry metadata or evidence.
- `npm.cmd run build` passed but Next.js reported `Environments: .env.local`. No `.env.local` values were printed or modified, but the command likely loaded the file automatically. This is recorded as a disclosed constraint conflict because the same task also required `build` after touching runtime.

## Implementation Notes

- Storage scheme: dedicated `ai_scoring_attempt` table, not `answer_record`.
- Table fields: `answer_record_id`, `attempt_number`, `ai_call_log_id`, `status`, `failure_code`, `failure_message_digest`, `scheduled_at`, `started_at`, `finished_at`, `retry_after_at`, `attempt_snapshot`, `created_at`, `updated_at`.
- Status values: `pending`, `running`, `succeeded`, `failed`, `timeout`, `cancelled`.
- Runtime attempt append uses `answerRecordPublicId` to resolve the internal `answer_record_id` and computes the next `attempt_number` per answer record.
- `attempt_snapshot` stores only redaction-safe public ids, model/prompt metadata, retry policy fields, evidence status, citation count, and scoring status.
- Drizzle schema avoids importing `answerRecord` into `ai-rag.ts` to prevent a schema circular dependency; the SQL migration and generated snapshot carry the database foreign keys.
- Migration is additive. Existing `answer_record` data is not backfilled; new attempts are recorded after migration/runtime deployment.

## Validation Results

| Command                                                                                                                                                                                                               | Result                                  | Notes                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/db/schema/ai-rag.test.ts src/server/models/ai-rag.test.ts src/server/services/ai-scoring-service.test.ts tests/unit/phase-20-ra-04-07-persisted-model-config-runtime-selection.test.ts` | expected fail, then pass                | TDD first run failed 9 assertions before implementation; final targeted run passed 4 files / 36 tests.                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                               | pass                                    | Initial sandbox run hit `EPERM` reading `node_modules`; escalated run passed.                                                                               |
| `npm.cmd run test:unit`                                                                                                                                                                                               | pass                                    | First full run exposed a schema circular import; after fix, 149 files / 621 tests passed. Quality gate also reran unit with the same pass count.            |
| `npm.cmd run test:e2e`                                                                                                                                                                                                | pass                                    | 26 Playwright tests passed.                                                                                                                                 |
| `npm.cmd run build`                                                                                                                                                                                                   | pass with disclosed constraint conflict | Next build succeeded, but output reported `Environments: .env.local`; no values were printed or modified.                                                   |
| `git diff --check`                                                                                                                                                                                                    | pass                                    | No whitespace errors.                                                                                                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                        | pass                                    | Required files/scripts/npm scripts/skill readiness passed.                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                   | pass                                    | Inventory completed.                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                           | pass                                    | Banned terms absent; naming scans passed.                                                                                                                   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                               | pass                                    | First run failed only `format:check` on `src/db/schema/ai-rag.ts`; scoped Prettier fixed it. Final run passed lint, typecheck, test:unit, and format:check. |

## Rollback Plan

- Application rollback: stop using the new runtime attempt append path first.
- Database rollback: require separate approval before dropping `ai_scoring_attempt`, `ai_scoring_attempt_status`, indexes, and foreign keys, because doing so deletes retry history.
- `staging` and `prod` rollback remain separate approval events with backup/restore evidence.

## Commit Status

- Commit: created on `codex/phase-21-ai-scoring-retry-persistence-implementation`; final SHA is reported in the task handoff.
- Merge: skipped; no merge approval.
- Push: skipped; no push approval.
- Deploy: skipped; no deploy approval.
