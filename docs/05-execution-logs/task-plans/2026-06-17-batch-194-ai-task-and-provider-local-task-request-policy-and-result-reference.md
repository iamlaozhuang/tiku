# Batch 194: Local Task Request Policy And Result Reference

## Scope

- Task id: `batch-194-ai-task-and-provider-local-task-request-policy-and-result-referen`
- Execution profile: `local_unit_tdd`
- Evidence mode: `full`
- Validation policy: `local_unit`
- Target closure: local task request policy and result reference contracts

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Implementation Plan

- Add a focused red test proving new or rejected task requests do not echo a caller-supplied result reference.
- Keep reuse behavior for an existing idempotent task, where an existing result reference may be returned.
- Implement the result-reference policy in local model/service code only.
- Keep evidence redacted and do not touch provider, environment, schema, dependency, or route/UI layers.

## Validation

- Pre-edit auto-seed readiness gate.
- Focused unit test for `src/server/services/ai-generation-task-request-service.test.ts`.
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
