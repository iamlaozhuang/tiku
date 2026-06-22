# Task Plan: batch-265 AI Task Request Policy

## Scope

Close `batch-265-ai-task-and-provider-local-task-request-policy-and-result-referen` by validating the existing local task request policy and result reference contracts.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/services/ai-generation-task-request-service.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`

## Implementation Decision

Existing source already covers local request policy and result reference behavior: create/reuse/reject decisions, idempotent reuse, authorization ownership boundaries, quota owner references, summary-only result references, and rejection without provider execution.

No source edit is planned unless focused validation reveals a real coverage gap.

## Validation Plan

1. Run pre-work and pre-edit readiness.
2. Run the pre-edit seed readiness gate for batch 265.
3. Run `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`.
4. Run lint, typecheck, Prettier, `git diff --check`, pre-commit hardening, module closeout readiness, and pre-push readiness.
5. Record evidence and audit with command/result summaries only.

## Boundaries

- No Provider/model calls.
- No env/secret reads or writes.
- No schema, migration, seed, database connection, or database mutation.
- No package or lockfile changes.
- No browser/e2e/dev-server runtime.
- No deployment, PR, force push, payment, external service, `org_auth` runtime change, or Cost Calibration Gate execution.
