# Module Run v2 AI Task Lifecycle Local Contract Plan

## Task

- Task id: `module-run-v2-ai-task-lifecycle-local-contract`
- Task kind: `implementation`
- Execution module: `ai-task-and-provider`
- Approval anchor: `autoDriveLocalImplementationApproval`
- localFullLoopGate: L2

## Goal

Extend the existing local `ai-task-domain` contract so downstream AI experiences can depend on a deterministic,
provider-agnostic lifecycle contract without invoking real providers or changing persistence.

## Allowed Files

- `src/server/contracts/ai-task-domain-contract.ts`
- `src/server/models/ai-task-domain.ts`
- `src/server/validators/ai-task-domain.ts`
- `src/server/validators/ai-task-domain.test.ts`
- `src/server/services/ai-task-domain-service.ts`
- `src/server/services/ai-task-domain-service.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`
- `docs/05-execution-logs/evidence/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-09-module-run-v2-ai-task-lifecycle-local-contract.md`

## Implementation Steps

1. Add focused failing tests for lifecycle states and redaction in `src/server/services/ai-task-domain-service.test.ts`.
2. Add focused validator tests for task status, task type, and nullable public references in
   `src/server/validators/ai-task-domain.test.ts`.
3. Extend model and contract types only as needed for provider-agnostic local lifecycle behavior.
4. Implement minimal validator/service changes to satisfy the focused tests.
5. Run focused unit tests, lint, typecheck, diff check, scoped prettier, anchor checks, and module closeout readiness.

## Stop Conditions

Stop if implementation needs provider calls, provider configuration, env/secret files, dependency/package/lockfile
changes, schema/migration work, repository, mapper, REST API, Server Action, UI/browser, e2e, deploy, payment,
external-service, or Cost Calibration Gate execution.

Cost Calibration Gate remains blocked.
