# Module Run v2 Autodrive Phase 3 Implementation Plan

## Scope

Implement the serial autodrive executor governance layer.

Phase 3 turns `agentAction` decisions into bounded serial executor decisions for safe local governance transactions. It
does not implement business code generation, real database operations, provider calls, env/secret writes, schema
migration, deployment, PR creation, or Cost Calibration Gate execution.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`

## Implementation Plan

1. Add `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1`.
2. Add `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`.
3. Update automated advancement SOP and mechanism index.
4. Update durable state, queue, evidence, and audit.

## Executor Model

The executor consumes `agentAction` and emits `serialExecutorDecision`.

Supported safe actions:

- `claim_task`: validates schema and pending task metadata, then can update queue/project state when `-Execute` is used.
- `continue_task`: validates schema and reports that the agent layer may continue scoped implementation.
- `run_validation`: runs only task validation commands that pass the command safety filter.
- `idle_*`: exits cleanly without touching repository state.
- `propose_schema_repair`, `request_manual_decision`, `request_human_handoff`, `stop_for_hard_block`: stop or proposal states.

## Safety Boundary

- No product code.
- No local Docker DB operation.
- No project resource ingestion.
- No env/secret writes.
- No provider calls.
- No dependency/package/lockfile changes.
- No schema, migration, e2e, deploy, external-service, payment, PR, force push, or Cost Calibration Gate execution.

## Validation

RED:

- `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1` fails before the executor script exists.

GREEN:

- `Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`
- `Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
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
