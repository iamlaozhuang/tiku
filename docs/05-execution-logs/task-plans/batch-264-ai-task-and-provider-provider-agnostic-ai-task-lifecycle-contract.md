# Task Plan: batch-264 AI Task Lifecycle Contract

## Scope

Close `batch-264-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract` by validating the existing provider-agnostic `ai_generation_task` lifecycle contract.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/models/ai-generation-task.ts`
- `src/server/models/ai-generation-task.test.ts`

## Implementation Decision

Existing source already defines the provider-agnostic lifecycle surface: public task types, lifecycle statuses, terminal statuses, retryable and non-retryable failure categories, transition effects, and provider boundary flags that do not require Provider calls, env/secret access, provider payloads, schema, database, deployment, or dependencies.

No source edit is planned unless focused validation reveals a real coverage gap.

## Validation Plan

1. Run the pre-edit seed readiness gate for batch 264.
2. Run `npm.cmd run test:unit -- src/server/models/ai-generation-task.test.ts`.
3. Run lint, typecheck, Prettier, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness.
4. Record evidence and audit with command/result summaries only.

## Boundaries

- No Provider/model calls.
- No env/secret reads or writes.
- No schema, migration, seed, database connection, or database mutation.
- No package or lockfile changes.
- No browser/e2e/dev-server runtime.
- No deployment, PR, force push, payment, external service, `org_auth` runtime change, or Cost Calibration Gate execution.
