# Module Run v2 Autopilot Runner Control Plan

## Scope

Implement the next governance step toward an unattended local autodrive loop.

This task adds a runner control layer that repeatedly consumes startup readiness and autopilot decisions, performs only
already-safe control actions, and emits a stable `runnerDecision` for the Codex agent layer.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/parallel-work-governance.md`

## Implementation Plan

1. Add `Invoke-ModuleRunV2AutopilotRunner.ps1`.
2. Add `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1` with fixture-based tests.
3. Wire the runner into the automated advancement SOP as the bounded control loop above one-shot autopilot.
4. Record the local capability model for future local Docker DB, project resource reads, and provider key/env use without
   executing those actions in this task.
5. Keep state, queue, plan, evidence, and audit aligned.

## Runner State Model

The runner consumes:

- `startupDecision` from `Test-ModuleRunV2AutomationStartupReadiness.ps1`;
- `stoppedAutomationHygieneDecision` from `Test-ModuleRunV2StoppedAutomationHygiene.ps1`;
- `autopilotDecision` from `Invoke-ModuleRunV2Autopilot.ps1`.

It emits:

- `runnerDecision`;
- `runnerNextAction`;
- `runnerStepCount`;
- blocked gate statement.

## Capability Model

Future unattended local development may use these capabilities only when a task records the matching approval:

- local Docker database: local dev validation only; schema/migration/destructive operations remain separately gated;
- project resources such as `material`, `paper`, and `paper_asset`: read-only local test input with evidence redaction;
- provider key/env writes: require confirmed destination and explicit secret handling; no key is read or written here;
- real provider calls: blocked unless a task-specific provider validation approval exists.

## Risk Controls

- No product code.
- No dependency, package, or lockfile change.
- No env/secret file change.
- No provider call.
- No schema, migration, or database operation.
- No thread, worktree, branch cleanup, merge, push, PR, deploy, or Cost Calibration Gate action.
- Runner cleanup may only call the existing stopped-automation hygiene gate when startup explicitly returns
  `cleanup_stale_artifacts`.

## Validation

- RED: runner smoke fails before the runner script exists.
- GREEN: runner smoke passes after implementation.
- Existing autopilot smoke still passes.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier check/write
- Module Run v2 closeout readiness
- Git completion readiness
