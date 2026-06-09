# Module Run v2 Parallel Autopilot Integration Plan

## Task

- Task id: `module-run-v2-parallel-autopilot-integration`
- Branch: `codex/module-run-v2-parallel-autopilot-integration`
- Task kind: `implementation`
- Goal: turn the first-stage parallel readiness gate into an autopilot control point and make durable parallel approval
  schema enforcement executable.

## Documents Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/thread-rollover-and-handoff-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Approach

1. Extend smoke tests first:
   - parallel readiness must downgrade isolated tasks without durable parallel approval to serial execution;
   - approved parallel batches may return `can_assign_workers`;
   - autopilot must call parallel readiness when candidate ids are provided.
2. Enforce durable parallel approval schema in `Test-ModuleRunV2ParallelReadiness.ps1`.
3. Add autopilot parameters for parallel candidate ids and coordinator task id, then route decisions without creating
   workers.
4. Update SOP and evidence to clarify that `prepare_parallel_workers` is a controlled coordination decision, not worker
   creation.

## Risk Controls

- No product runtime changes.
- No dependency/package/lockfile changes.
- No schema, migration, provider, env/secret, deploy, payment, external-service, or Cost Calibration Gate work.
- No automatic thread/worktree creation.
- No merge, push, PR, or cleanup.
- Keep `project-state.yaml` and `task-queue.yaml` coordinator-owned.

## Validation

- `Test-ModuleRunV2ParallelReadiness.Smoke.ps1`
- `Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check
- anchor check for `parallelDecision`, `parallelApproval`, `prepare_parallel_workers`, and `Cost Calibration Gate remains blocked`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-GitCompletionReadiness.ps1`
