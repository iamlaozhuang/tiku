# AI Scoring Retry Persistence Implementation Startup Task Plan

## Task

- Task id: `phase-21-ai-scoring-retry-persistence-implementation-startup`
- Branch: `codex/phase-21-ai-scoring-retry-implementation-startup`
- Scope: docs/state-only startup preparation and approval checklist for the future `ai_scoring` retry persistence implementation.

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-21-high-risk-tail-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/phase-21-tail-ai-scoring-retry-persistence-design.md`
- `docs/05-execution-logs/evidence/2026-05-31-historical-queue-closeout-governance.md`

## Current Allowed Scope

This task may only change:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-31-ai-scoring-retry-persistence-implementation-startup.md`
- `docs/05-execution-logs/evidence/2026-05-31-ai-scoring-retry-persistence-implementation-startup.md`

Blocked for this task:

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service work
- destructive data operations
- force push
- deleting unknown worktrees or unmerged branches

## Startup Decision

Do not claim historical `closed` or `closureDecision: deferred` tasks. This task registers and executes a fresh startup preparation task only.

The future implementation remains blocked until the human owner explicitly approves `database_migration`. This task does not approve schema, Drizzle, migration, source, test, or e2e edits.

## Recommended Storage Scheme

Prefer a dedicated `ai_scoring_attempt` table rather than adding retry fields to `answer_record`.

Rationale:

- Retry persistence is audit and concurrency state, not only answer display state.
- Attempt-level history supports deterministic timeout, retry, and failure review.
- `answer_record` stays focused on the student answer lifecycle and avoids becoming a compact log sink.
- Current-state fields on `answer_record` are smaller for MVP, but they lose per-attempt history and make stale overwrite risks harder to audit.

Recommended table and field names for the later implementation approval:

- `ai_scoring_attempt`
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

Recommended status values use lower `snake_case` strings:

- `pending`
- `running`
- `succeeded`
- `failed`
- `timeout`
- `cancelled`

`attempt_snapshot` must store only redaction-safe metadata such as public model configuration reference, prompt template key/version, retry policy, timeout, and `evidence_status`. It must not store raw prompts, raw student answers, raw model responses, raw provider payloads, tokens, database URLs, full papers, or customer/customer-like private data.

## Migration Approval Evidence Required

Before implementation starts, evidence must record:

- Explicit human approval for `database_migration`.
- Selected storage design: dedicated `ai_scoring_attempt` table, or a reviewed alternative.
- Exact table, field, enum/string value, and index names.
- Migration file name using `{YYYYMMDDHHMMSS}_{description}.sql`.
- Migration generation command, expected to be reviewed before running.
- Secret-safe environment handling plan; no `.env.local` read or modification is approved in this task.
- Data preservation and backfill rule for existing `answer_record` rows.
- Rollback plan for `dev`, `staging`, and `prod` boundaries.
- Validation commands and security review artifact path.
- Explicit statement that `drizzle-kit push`, destructive migration, staging/prod changes, real provider calls, dependency changes, env changes, force push, and deploy remain forbidden unless separately approved.

## Future Implementation Scope Recommendation

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

If the later implementation changes compare-and-update, lock, retry scheduling, or race-condition behavior, add `transaction_concurrency` and require explicit approval before editing runtime code.

Suggested validation commands for the later implementation:

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

## Current Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-31-ai-scoring-retry-persistence-implementation-startup.md docs\05-execution-logs\evidence\2026-05-31-ai-scoring-retry-persistence-implementation-startup.md`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`

`npm.cmd run build` and `npm.cmd run test:e2e` are skipped in this task because no frontend, route, build-system, runtime, browser, source, schema, migration, or test behavior is changed.
