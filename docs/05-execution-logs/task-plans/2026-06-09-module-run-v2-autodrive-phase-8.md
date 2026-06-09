# Module Run v2 Autodrive Phase 8 Implementation Plan

## Scope

Implement a local acceptance gate for the Module Run v2 unattended autodrive mechanism chain.

Phase 8 validates that startup readiness, recovery self-repair, agent action dispatch, serial/parallel controls,
capability boundaries, thread bridge boundaries, evidence/audit minimums, and approved closeout policy are wired as a
coherent guardian-first control loop. It does not start business implementation, execute broad cleanup, create threads
or worktrees, call providers, run DB/resource/env actions, change dependencies, modify schema/migrations, deploy, or
execute Cost Calibration Gate.

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

1. Add `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`.
2. Add `Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`.
3. Update automated advancement SOP and mechanism index.
4. Update durable state, queue, evidence, and audit.

## Acceptance Model

The gate emits `autodriveAcceptanceDecision`:

- `accepted_with_guardrails`: all required control-loop layers exist and local decision probes pass.
- `stop_for_hard_block`: a required control-loop layer, safety boundary, or local probe is missing or unsafe.

## Safety Boundary

- No product implementation.
- No broad cleanup or unknown worktree deletion.
- No Docker DB, project resource, env/secret, provider, schema/migration, dependency, e2e, deploy, PR, force push, or
  external-service action.
- No thread/worktree creation.
- No Cost Calibration Gate execution.

## Validation

- `Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`
- `Test-ModuleRunV2AutodriveControlLoopAcceptance.ps1`
- `Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`
- `Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`
- `Test-ModuleRunV2CodexThreadBridgeReadiness.Smoke.ps1`
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
