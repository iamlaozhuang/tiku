# Module Run v2 AI Task And Provider Planning Task Plan

## Task

- Task id: `module-run-v2-ai-task-and-provider-planning`
- Task kind: `implementation_planning`
- Execution module candidate: `ai-task-and-provider`
- Dependency: `module-run-v2-autopilot-maturity-hardening`
- Goal: draft the next Module Run v2 plan proposal after automation maturity hardening closes out.

## Scope

Allowed:

- Read durable state, latest evidence, latest audit review, and Module Run v2 matrix.
- Evaluate whether `ai-task-and-provider` is still the best `nextModuleRunCandidate`.
- Draft a proposal-only Module Run v2 plan with Batches, localFullLoopGate targets, allowed files, blocked files, and stop conditions.
- Update project/task state only for planning status.

Blocked:

- Product implementation.
- Provider call or provider configuration.
- Env/secret reading or changes.
- Staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, and `e2e/**`.
- Cost Calibration Gate execution.

## Planning Inputs

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- latest closeout evidence and audit review from `module-run-v2-autopilot-maturity-hardening`

## Validation

- `git diff --check`
- scoped prettier check for changed planning docs/state files
- required anchor check for `ai-task-and-provider`, `nextModuleRunCandidate`, `localFullLoopGate`, and `Cost Calibration Gate remains blocked`

## Stop Conditions

Stop immediately if planning would require provider/env/secret/deploy/payment/external-service, schema/migration, dependency, product implementation, or Cost Calibration Gate execution.
