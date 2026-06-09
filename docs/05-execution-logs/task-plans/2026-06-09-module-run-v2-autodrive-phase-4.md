# Module Run v2 Autodrive Phase 4 Implementation Plan

## Scope

Implement a guarded parallel coordinator executor layer.

Phase 4 consumes `parallelDecision` from the existing parallel readiness gate and turns it into a bounded worker
assignment manifest plus serial integration plan. It does not create Codex threads, branches, worktrees, commits,
merges, pushes, PRs, cleanup actions, product code, dependency changes, env/secret writes, provider calls, local Docker
DB actions, schema/migration work, deploys, payment/external-service actions, or Cost Calibration Gate execution.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/parallel-work-governance.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Implementation Plan

1. Add `Invoke-ModuleRunV2ParallelCoordinatorExecutor.ps1`.
2. Add `Invoke-ModuleRunV2ParallelCoordinatorExecutor.Smoke.ps1`.
3. Update parallel/automated advancement SOP and mechanism index.
4. Update durable state, queue, evidence, and audit.

## Executor Model

The executor runs or consumes parallel readiness, then emits `parallelCoordinatorDecision`.

Supported safe decisions:

- `assignment_manifest_ready`: durable parallel approval exists, file locks do not conflict, and a worker assignment
  manifest can be handed to the Codex agent layer.
- `use_serial_execution`: parallel overhead or missing approval means the coordinator should continue serially.
- `stop_for_file_lock_conflict`: overlapping writable paths require repair before worker assignment.
- `stop_for_blocked_gate`: a candidate needs a blocked/high-risk gate.
- `stop_for_hard_block`: metadata, dependency, durable file, or readiness execution failed.

## Safety Boundary

- No worker launch.
- No thread creation.
- No branch/worktree creation.
- No serial merge execution.
- No cleanup.
- No product implementation.
- No local Docker DB operation.
- No project resource ingestion.
- No env/secret writes.
- No provider calls.
- No dependency/package/lockfile changes.
- No schema, migration, e2e, deploy, payment, external-service, PR, force push, or Cost Calibration Gate execution.

## Validation

RED:

- `Invoke-ModuleRunV2ParallelCoordinatorExecutor.Smoke.ps1` fails before the executor script exists.

GREEN:

- `Invoke-ModuleRunV2ParallelCoordinatorExecutor.Smoke.ps1`
- `Test-ModuleRunV2ParallelReadiness.Smoke.ps1`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Closeout Policy

User approved Phase 3-8 serial execution. For this Phase, after validation passes, local commit, fast-forward merge to
`master`, push to `origin/master`, and short branch cleanup are approved. Product implementation and high-risk actions
remain blocked.
