# AI Scoring Retry Persistence Implementation Startup Evidence

**Task id:** `phase-21-ai-scoring-retry-persistence-implementation-startup`

**Branch:** `codex/phase-21-ai-scoring-retry-implementation-startup`

## Summary

- Result: pass.
- Scope: docs_only / blocked_gate.
- Changed surfaces: task plan, task queue, project state, and this evidence file.
- Gates: diff/prettier/readiness/git inventory/naming/quality gate pass; build and e2e skipped with reason.
- Forbidden scope (`forbiddenScope`): no env, dependency, schema, migration, source, tests, e2e, scripts, staging, prod, cloud, deploy, real provider, external service, destructive data, force push, unknown worktree deletion, or unmerged branch deletion.
- Residual gaps (`residualGaps`): future implementation still requires explicit `database_migration` approval before any schema, Drizzle, migration, source, test, or e2e edit.

## Startup Recovery

- Current branch before task branch: `master`.
- `git status --short --branch`: `## master...origin/master`.
- `git fetch origin`: pass.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- Local short-lived branches before task branch: none.
- Worktrees before task branch: only `D:/tiku`.
- Queue counts before task registration: `closed=243`, `done=79`, `pushed=5`, `pending=0`, `blocked=0`.
- Current project phase: `phase-21-high-risk-tail-closure`.
- Current project task before this task: `phase-21-historical-queue-closeout-governance`, status `closed`.

## Claim Evidence

| Command                                                                         | Result | Notes                                             |
| ------------------------------------------------------------------------------- | ------ | ------------------------------------------------- |
| `git switch -c codex/phase-21-ai-scoring-retry-implementation-startup`          | pass   | Created a short-lived branch from clean `master`. |
| Register fresh queue task instead of claiming historical `closed/deferred` rows | pass   | This task is a new docs/state-only startup task.  |

## Implementation Approval Checklist

### Selected Storage Recommendation

Recommended final storage scheme: use a dedicated `ai_scoring_attempt` table.

Do not add retry fields to `answer_record` for the first implementation unless the human owner explicitly approves a denormalized current-state shortcut. `answer_record` fields are smaller, but they lose durable per-attempt history and make timeout/retry audit trails harder to inspect. A dedicated `ai_scoring_attempt` structure is a better fit because retry persistence is audit, failure, timing, and concurrency metadata.

### Proposed Table And Field Names

Recommended table:

- `ai_scoring_attempt`

Recommended fields:

- `id`
- `answer_record_id`
- `attempt_number`
- `ai_call_log_id`
- `status`
- `failure_code`
- `failure_message_digest`
- `scheduled_at`
- `started_at`
- `finished_at`
- `retry_after_at`
- `attempt_snapshot`
- `created_at`
- `updated_at`

Recommended indexes:

- `idx_ai_scoring_attempt_answer_record_id`
- `idx_ai_scoring_attempt_status`
- `idx_ai_scoring_attempt_retry_after_at`
- `udx_ai_scoring_attempt_answer_record_id_attempt_number`

Recommended `status` values:

- `pending`
- `running`
- `succeeded`
- `failed`
- `timeout`
- `cancelled`

Naming note: use `attempt_number`, not `attempt_no`, to avoid an unregistered abbreviation while preserving the Phase 21 contract intent.

### Migration Approval Evidence Needed

Before implementation, the human owner must explicitly approve `database_migration`, and the implementation evidence must record:

- selected storage design;
- exact table, field, status value, and index names;
- reviewed migration file name using `{YYYYMMDDHHMMSS}_{description}.sql`;
- migration generation command;
- secret-safe environment handling plan;
- data preservation rule for existing `answer_record` rows;
- backfill rule for existing data;
- rollback plan;
- validation commands;
- security review artifact or evidence section;
- confirmation that `drizzle-kit push`, destructive migration, staging/prod changes, real provider calls, dependency changes, env changes, force push, and deploy remain forbidden unless separately approved.

### Data Retention Rule

- Persist only redaction-safe retry metadata, timestamps, statuses, public references, failure categories, non-reversible digests, retry policy, timeout values, and `evidence_status`.
- Do not store raw prompts, raw student answers, raw model responses, raw provider payloads, Authorization headers, API keys, database URLs, full papers, full textbooks, raw chunks, or customer/customer-like private data.
- Keep retry metadata for the same retention window as the related `answer_record` and `exam_report` unless a later retention task defines a shorter purge policy.
- If `answer_record` deletion or anonymization is introduced later, `ai_scoring_attempt` metadata must follow the same boundary.

### Rollback Plan

- Design-only rollback: revert this task plan, evidence, and queue/project-state updates.
- Pre-runtime `dev` migration rollback: after reviewed backup or disposable local data confirmation, remove only the newly added `ai_scoring_attempt` table and related indexes from the reviewed migration path.
- Post-runtime rollback: disable retry scheduling in application behavior first, preserve existing retry metadata for audit, and remove schema only after separate approval confirms data export, retention impact, and restore path.
- `staging` and `prod` rollback require separate environment-specific approval, backup, restore, and incident-owner evidence.
- Destructive migration, `drizzle-kit push`, force schema push, production data deletion, force push, real provider work, deploy, and staging/prod changes remain forbidden by this task.

### Suggested Future Implementation Metadata

Suggested allowed files after explicit `database_migration` approval:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`
- `src/ai/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/validators/**`
- `src/app/api/v1/**`
- `src/db/schema/**`
- `drizzle/**`
- `tests/**`
- `e2e/**`

Suggested blocked files for the later implementation:

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service work unless separately approved

Suggested risk types for the later implementation:

- `ai_runtime`
- `database_migration`
- `data_contract`
- `evidence_integrity`
- `local_human_verification`

Add `transaction_concurrency` only if the future task changes compare-and-update, locking, retry scheduling, or race-condition behavior, and require explicit approval before editing runtime code.

Suggested validation commands for the later implementation:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Explicit Non-Implementation Statement

This task does not implement retry persistence. It does not modify schema, Drizzle output, migration files, source code, tests, e2e tests, scripts, env files, package files, lockfiles, staging/prod/cloud resources, deployments, real providers, external services, or data.

Implementation must pause until the human owner explicitly approves `database_migration`.

## Validation Results

| Command                                                                                                                                                                                                                                                                                                                                                | Result | Notes                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                     | pass   | No whitespace errors.                                                                                                                                                                               |
| `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-ai-scoring-retry-persistence-implementation-startup.md docs\05-execution-logs\evidence\2026-05-31-ai-scoring-retry-persistence-implementation-startup.md` | pass   | Initial sandbox run failed with `EPERM` reading local `node_modules`; escalated check found this evidence file needed formatting, then scoped escalated `--write` and final escalated check passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                                                                                                                                                                         | pass   | Required files, scripts, npm scripts, and skill/plugin readiness passed.                                                                                                                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                                                                    | pass   | Inventory showed only task-scoped docs/state changes and no staged files at the time of the check.                                                                                                  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                                                                                                                                                                            | pass   | Banned terms absent; route, DTO, and naming scans completed.                                                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                                                                                                                                                                | pass   | Ran `npm.cmd run lint`, `npm.cmd run typecheck`, `npm.cmd run test:unit`, and `npm.cmd run format:check`. Unit result: 149 test files passed, 615 tests passed.                                     |

## Build And E2E Decision

`npm.cmd run build` and `npm.cmd run test:e2e` are skipped for this task because it is docs/state-only and does not touch frontend, routes, build-system, runtime, browser behavior, source, schema, migration, tests, or e2e files.

## Commit Status

- Task branch commit: pending.
- Merge: skipped; no merge approval requested or granted.
- Push: skipped; no push approval requested or granted.
- Cleanup: skipped; task branch is retained for user review.
