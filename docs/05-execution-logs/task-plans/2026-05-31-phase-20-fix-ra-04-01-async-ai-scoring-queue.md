# Phase 20 Fix RA-04-01 Async AI Scoring Queue

## Summary

- Task: `phase-20-fix-ra-04-01-async-ai-scoring-queue`
- Branch: `codex/phase-20-fix-ra-04-01-async-ai-scoring-queue`
- Date: 2026-05-31
- Scope: local deterministic async queue behavior for mock_exam AI subjective scoring.
- Explicitly out of scope: database migration, schema or drizzle changes, package or lockfile changes, env or secret access, real provider calls, external vector/cloud services, destructive data operations.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Finding

Phase 18 finding `F-RA-04-01-001` records that mock_exam AI subjective scoring currently runs inline during submit/retry instead of through an asynchronous FIFO queue workflow.

## Implementation Plan

1. Add targeted RED unit coverage proving that a non-empty subjective mock_exam answer is queued and the submit response enters `scoring` without invoking the AI runtime inline.
2. Add a local deterministic FIFO queue abstraction under `src/server/services` with redaction-safe observable metadata only.
3. Wire `mock-exam-service` so queued scoring is opt-in through service options and preserves existing inline behavior when the queue is not configured.
4. Keep repository updates inside existing mock_exam and answer_record update flows; do not add persistent queue tables or schema.
5. Add evidence with command outputs, security review, forbidden-scope confirmation, and local human verification boundary.

## Risk Controls

- `ai_runtime`: local deterministic/mock behavior only; no real provider.
- `database_migration`: queue metadata remains in memory and uses existing repository methods; no `src/db/schema/**`, `drizzle/**`, or migration files.
- `local_human_verification`: local-only evidence; no staging/prod/cloud/deploy.
- `evidence_integrity`: evidence must not include raw prompts, raw answers, raw model outputs, provider payloads, tokens, secrets, or database URLs.
- API contract: no public URL numeric ids; response envelope remains `{ code, message, data, pagination? }`; JSON fields remain camelCase.

## Validation Plan

- Targeted RED/GREEN unit test for queued scoring behavior.
- Task validation commands from queue.
- Required local gates from `docs/03-standards/local-ci.md`.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `git diff --check`
- `Test-AgentSystemReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `Test-NamingConventions.ps1`
- `Invoke-QualityGate.ps1`
- Build is not required unless the implementation touches frontend rendering, route files, or build configuration.
