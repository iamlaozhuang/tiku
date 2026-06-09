# Module Run v2 Autodrive Phase 6 Implementation Plan

## Scope

Implement a local capability gate for Module Run v2 autodrive.

Phase 6 turns local Docker DB, project `material`/`paper`/`paper_asset` resource use, DeepSeek key destination, and
provider-call readiness into explicit capability decisions. It does not run Docker, connect to a database, read project
materials for tests, write env files, call providers, modify schema/migrations, change dependencies, deploy, create
threads/worktrees, or execute Cost Calibration Gate.

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

1. Add `Test-ModuleRunV2LocalCapabilityGate.ps1`.
2. Add `Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`.
3. Update local capability governance and source-of-truth index.
4. Update durable state, queue, evidence, and audit.

## Capability Model

The gate emits `localCapabilityDecision` and `adapterAction`:

- `adapter_contract_ready`: capability adapter is declared, but no real local action is approved.
- `capability_ready`: task-specific approval exists for the requested capability.
- `manual_required`: approval, destination confirmation, or redaction rule is missing.
- `stop_for_hard_block`: capability state is unsafe or the requested surface is blocked.

## Safety Boundary

- No Docker or database commands.
- No local resource file reads for tests.
- No env/secret writes or reads.
- No provider calls.
- No schema/migration/destructive DB operation.
- No dependency/package/lockfile changes.
- No staging/prod/cloud/deploy/payment/external-service actions.
- No thread/worktree creation.
- No Cost Calibration Gate execution.

## Validation

- `Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`
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
