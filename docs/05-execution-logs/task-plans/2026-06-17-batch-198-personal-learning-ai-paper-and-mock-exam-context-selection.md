# Task Plan: batch-198 personal-learning-ai paper and mock_exam context selection

## Scope

- Task: `batch-198-personal-learning-ai-paper-and-mock-exam-context-selection`
- Profile: `local_unit_tdd`
- Target closure: paper and mock_exam context selection
- Allowed implementation surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-11-batch-111-personal-learning-ai-request-context-local-contract.md`
- `docs/05-execution-logs/evidence/batch-111-personal-learning-ai-request-context-local-contract.md`
- `src/server/models/personal-ai-generation-request.ts`
- `src/server/contracts/personal-ai-generation-request-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/personal-ai-generation-request-context-service.ts`
- `src/server/services/personal-ai-generation-request-context-service.test.ts`

## TDD Plan

1. RED: require the context-selection read model to expose null-preserving redacted `paperPublicId` and `mockExamPublicId` references alongside `selectedContext`.
2. GREEN: add the minimal contract/service mapping so callers can inspect both context references without exposing raw paper/mock content.
3. Verify focused context tests, affected request/request-flow tests, lint, typecheck, diff check, and module closeout readiness.

## Guardrails

- No provider/model calls.
- No `.env*` read, output, or edit.
- No schema, Drizzle, migration, dependency, package, or lockfile changes.
- No Browser, Playwright, staging, production, cloud, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Evidence must remain redacted and must not include raw prompts, raw answers, provider payloads, row data, private data, credentials, tokens, database URLs, Authorization headers, public identifier inventories, or full paper/mock_exam content.
