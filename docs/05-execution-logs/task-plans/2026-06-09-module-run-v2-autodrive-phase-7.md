# Module Run v2 Autodrive Phase 7 Implementation Plan

## Scope

Implement a recovery self-repair decision gate for Module Run v2 autodrive.

Phase 7 lets recovery classify safe next repair actions, including stale clean automation cleanup, post-closeout state
reconciliation, placeholder commit correction, and active-owner no-op behavior. It does not execute broad cleanup in
this Phase, delete unknown worktrees, modify product code, run DB/resource/env/provider actions, change dependencies,
modify schema/migrations, deploy, create threads/worktrees, or execute Cost Calibration Gate.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`

## Implementation Plan

1. Add `Invoke-ModuleRunV2RecoverySelfRepair.ps1`.
2. Add `Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`.
3. Update automated advancement SOP and mechanism index.
4. Update durable state, queue, evidence, and audit.

## Recovery Model

The gate emits `recoverySelfRepairDecision` and `repairAction`:

- `self_repair_ready`: a bounded, safe repair action is available but not executed by default.
- `continue_without_repair`: startup can proceed without a repair step.
- `exit_active_owner_present`: another healthy owner owns the lane; automation exits quietly.
- `manual_required`: state is recoverable only through a human decision.
- `stop_for_hard_block`: hard block or unsafe recovery state.

## Safety Boundary

- No broad cleanup execution in this Phase.
- No unknown or dirty worktree deletion.
- No product implementation.
- No Docker DB, project resource, env/secret, provider, schema/migration, dependency, e2e, deploy, PR, force push, or
  external-service action.
- No Cost Calibration Gate execution.

## Validation

- `Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`
- `Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
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
