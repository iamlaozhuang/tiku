# AI Scoring Retry Persistence Implementation Task Plan

## Task

- Task id: `phase-21-ai-scoring-retry-persistence-implementation`
- Branch: `codex/phase-21-ai-scoring-retry-persistence-implementation`
- Scope: implement additive `ai_scoring_attempt` retry persistence for AI scoring runtime metadata.

## Human Approval

The human owner explicitly approved this fresh implementation task and approved these risk types:

- `database_migration`
- `ai_runtime`
- `data_contract`
- `evidence_integrity`
- `local_human_verification`
- `transaction_concurrency` only if retry scheduling, compare-and-update, locking, duplicate prevention, or race semantics are changed.

This task still does not approve `.env.local` access, dependency changes, package or lockfile changes, scripts changes, staging/prod/cloud/deploy work, real provider calls, destructive data operations, `drizzle-kit push`, force push, or deletion of unknown worktrees/unmerged branches.

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
- `docs/05-execution-logs/task-plans/2026-05-31-ai-scoring-retry-persistence-implementation-startup.md`
- `docs/05-execution-logs/evidence/2026-05-31-ai-scoring-retry-persistence-implementation-startup.md`

## Allowed Files

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

## Blocked Files And Actions

- `.env.local`
- `.env.example`
- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `scripts/**`
- staging/prod/cloud/deploy/real provider/external service work
- destructive data operation
- `drizzle-kit push`
- force push
- deletion of unknown worktrees or unmerged branches

## Implementation Plan

1. Add failing unit tests for the independent `ai_scoring_attempt` table, row model, redaction-safe attempt snapshot, and runtime append behavior.
2. Add an additive SQL migration creating `ai_scoring_attempt`, `ai_scoring_attempt_status`, indexes, and foreign keys.
3. Add Drizzle schema and model exports for the attempt table and status values.
4. Add redaction-safe attempt snapshot/digest helpers; never store raw prompt, raw student answer, raw model response, provider payload, secret, or database URL.
5. Add a runtime repository append boundary that resolves `answer_record_id`, optionally links `ai_call_log_id`, and assigns `attempt_number` as the next per-answer attempt.
6. Wire default AI scoring runtime to append one attempt after each actual scoring execution.
7. Write security review and evidence; update state/queue to `closed` only after validation passes.

## Migration Plan

- File: `drizzle/20260531104500_add_ai_scoring_attempt.sql`
- Shape: additive create enum, create table, create indexes, create foreign keys.
- Backfill: no backfill for historical `answer_record` rows; the table starts recording attempts for new scoring executions after migration.
- Rollback: stop runtime writes first, then review and apply a separate rollback migration that drops `ai_scoring_attempt`, its indexes, and `ai_scoring_attempt_status` only after data retention/export approval.
- `drizzle-kit generate` is intentionally not run in this task because the current Drizzle config may read `.env.local`, and `.env.local` access remains forbidden.

## Data Retention And Security

- Retain `ai_scoring_attempt` metadata for the same lifecycle as the related `answer_record` unless a later retention task defines a shorter purge/anonymization policy.
- Store only public ids, timestamps, status, failure code, digest, model/prompt metadata, retry policy, and RAG evidence summary metadata.
- Do not store raw prompts, raw student answers, raw model responses, raw provider payloads, headers, secrets, database URLs, full papers, raw chunks, or customer/customer-like private data.

## Validation Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
