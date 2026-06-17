# Batch 193: Provider-Agnostic AI Task Lifecycle Contract

## Scope

- Task id: `batch-193-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Target closure: provider-agnostic AI task lifecycle contracts

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Allowed Files

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

## Implementation Plan

- Add a focused red test for lifecycle contract serialization in `src/server/models/ai-generation-task.test.ts`.
- Extend the provider-agnostic model with an explicit lifecycle contract summary derived from existing transition rules.
- Expose the lifecycle contract through `src/server/contracts/ai-generation-task-contract.ts` without changing provider/runtime behavior.
- Keep all results local and redacted; do not read environment files or call providers.

## Validation

- Pre-edit auto-seed readiness gate.
- Focused unit test for `src/server/models/ai-generation-task.test.ts`.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- Module closeout readiness.

## Blocked Gates

- Provider/model calls remain blocked.
- Credential and `.env*` access remains blocked.
- Dependency/package/lockfile changes remain blocked.
- Schema/drizzle/migration changes remain blocked.
- Cloud/deploy/payment/external-service work remains blocked.
- PR/force-push and Cost Calibration Gate remain blocked.
