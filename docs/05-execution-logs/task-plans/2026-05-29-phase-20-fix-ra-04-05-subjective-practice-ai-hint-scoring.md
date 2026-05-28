# Phase 20 Fix RA-04-05 Subjective Practice AI Hint Scoring Plan

**Task id:** `phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`

**Branch:** `codex/phase-20-fix-ra-04-05-subjective-practice-ai-hint-scoring`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`

## Finding

`F-RA-04-05-001`: subjective practice had placeholder hint feedback and missing evidence for first-attempt AI hint, final scoring, and retry limit behavior.

## Verification Plan

1. Inspect `practice-service` and `StudentPracticePage` tests for local/mock subjective `ai_hint` and `ai_scoring` behavior.
2. Run focused unit tests for service and UI subjective practice flows.
3. Run task-declared full unit and e2e gates plus local CI/readiness gates.
4. Close the task only if existing local/mock behavior covers first hint, final scoring, and retry limit without schema, dependency, env, real provider, cloud, or migration changes.

## Risk Controls

- Real provider remains blocked; only deterministic local/mock AI behavior may be verified.
- Do not touch `.env.local`, `.env.example`, package manifests, lockfiles, schema, migrations, drizzle files, scripts, cloud/deploy config, auth permission model, or data.
- If durable AI scoring persistence or database changes are required, stop and record a `database_migration` blocked gate instead of implementing.
