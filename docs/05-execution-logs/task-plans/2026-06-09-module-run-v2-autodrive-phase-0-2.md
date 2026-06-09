# Module Run v2 Autodrive Phase 0-2 Implementation Plan

## Scope

Implement the first batch from the global unattended autodrive plan:

1. Phase 0 baseline convergence.
2. Phase 1 durable autodrive schema readiness.
3. Phase 2 agent action dispatcher dry-run.

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

1. Add `docs/04-agent-system/state/autodrive-control-schema.yaml`.
2. Add `Test-ModuleRunV2AutodriveSchemaReadiness.ps1` and smoke tests.
3. Add `Invoke-ModuleRunV2AgentActionDispatcher.ps1` and smoke tests.
4. Update automated advancement SOP and mechanism source-of-truth index.
5. Update project state, task queue, evidence, and audit review.

## Safety Boundary

- No product code.
- No local Docker DB operation.
- No project resource read beyond mechanism docs and scripts.
- No env or secret write.
- No provider call.
- No dependency, package, or lockfile change.
- No schema, migration, e2e, deploy, external-service, payment, merge, push, PR, branch cleanup, worktree cleanup, or Cost Calibration Gate execution.

## Validation

RED:

- `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1` fails before the schema readiness script exists.
- `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1` fails before the dispatcher script exists.

GREEN:

- `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `Invoke-ModuleRunV2Autopilot.Smoke.ps1`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`
- `Test-ModuleRunV2AutomationStartupReadiness.ps1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- scoped Prettier write/check
- required anchor check
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Closeout Policy

Local commit is approved for this batch. Merge, push, branch cleanup, worktree parking, PR creation, deploy, and external actions remain unapproved.
