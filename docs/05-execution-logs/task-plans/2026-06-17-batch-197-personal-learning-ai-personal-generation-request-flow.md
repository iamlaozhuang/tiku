# Task Plan: batch-197 personal-learning-ai personal generation request flow

## Scope

- Task: `batch-197-personal-learning-ai-personal-generation-request-flow`
- Profile: `local_unit_tdd`
- Target closure: personal generation request flow
- Allowed implementation surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `src/server/models/personal-ai-generation-request-flow.ts`
- `src/server/contracts/personal-ai-generation-request-flow-contract.ts`
- `src/server/validators/personal-ai-generation-request-flow.ts`
- `src/server/services/personal-ai-generation-request-flow-service.ts`
- `src/server/services/personal-ai-generation-request-flow-service.test.ts`

## TDD Plan

1. RED: add a focused unit test proving rejected personal generation request flows fail closed and do not carry caller-supplied result evidence/citation metadata.
2. GREEN: sanitize result reference evidence for rejected task requests before building the read model.
3. Verify the focused unit test, lint, typecheck, diff check, and module closeout readiness.

## Guardrails

- No provider/model calls.
- No `.env*` read, output, or edit.
- No schema, Drizzle, migration, dependency, package, or lockfile changes.
- No Browser, Playwright, staging, production, cloud, deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- Evidence must remain redacted and must not include raw prompts, raw answers, provider payloads, row data, private data, credentials, tokens, database URLs, Authorization headers, or public identifier inventories.
