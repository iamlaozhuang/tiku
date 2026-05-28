# Phase 20 Fix RA-04-02 AI Scoring Timeout Retry Persistence Plan

**Task id:** `phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence`

**Branch:** `codex/phase-20-fix-ra-04-02-ai-scoring-timeout-retry-persistence`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`

## Finding

`F-RA-04-02-001`: timeout and retry persistence evidence for `ai_scoring` is incomplete. The audit specifically calls out missing 60-second timeout/FIFO queue evidence, three-retry exhaustion evidence, and incomplete or non-explicit retry count persistence across failed `answer_record` rows.

## Gate Decision

This task cannot be safely implemented as a low-risk task because durable retry persistence requires a storage contract. Current `answer_record` schema does not expose an `ai_scoring_snapshot`, retry count, or scoring attempt storage column, and the current Postgres repository does not persist the service-level `aiScoringSnapshot` payload.

## Required Approval Before Implementation

- Gate: `database_migration`.
- Approval needed: exact persistence design for AI scoring retry state, such as an approved `answer_record` snapshot column or a dedicated scoring attempt table.
- Required evidence: data preservation rule, migration generation/review command, rollback plan, and explicit no `drizzle push` / no destructive data operation confirmation.

## Allowed Work In This Attempt

- Record blocked evidence only.
- Do not change source, schema, migrations, dependency manifests, env files, cloud/deploy configuration, or real provider settings.
