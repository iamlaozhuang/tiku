# Module Run v2 Post-Push State Reconciliation Task Plan

## Task

- Task id: `module-run-v2-post-push-state-reconciliation`
- Branch: `codex/module-run-v2-post-push-state-reconciliation`
- Current mode: `local_auto_candidate`
- Goal: harden Module Run v2 automation so final post-push SHA drift from a completed task is accepted only when it is a clean closeout ancestry case, while real divergence remains hard-blocked.

## Scope

Allowed:

- Update unattended readiness and autopilot smoke coverage for post-push closeout ancestry.
- Update mechanism SOP/state/matrix/source index and execution logs.
- Re-run dry-run autopilot on the current master recovery shape.

Blocked:

- Cost Calibration Gate execution.
- Provider, env/secret, staging/prod/cloud/deploy, payment, external-service work.
- Dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`, product implementation, `src/**`, `tests/**`, and `e2e/**`.
- Starting `ai-task-and-provider` implementation.

## RED/GREEN Plan

1. RED: closeout recovery currently hard-blocks when state SHA is a clean ancestor of the pushed HEAD.
2. GREEN: closeout recovery accepts ancestor SHA only for `done` / `closed` tasks, clean worktree, aligned Git, and valid evidence/audit.
3. RED: autopilot dry-run currently stops for hard block in that same post-push state.
4. GREEN: autopilot dry-run reaches `autopilotDecision: launch_new_thread` without writing tracked files.

## localFullLoopGate

- Target: `L1`.
- L8 blocked remainder: provider, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and Cost Calibration Gate remain blocked.
