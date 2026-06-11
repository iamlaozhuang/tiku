# Mechanism Project Status Unified Diagnostic Plan

## Task

- id: `mechanism-project-status-unified-diagnostic`
- branch: `codex/mechanism-project-status-diagnostic`
- task kind: `mechanism_repair`
- productClosureContribution: `none; mechanism budget item`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Test-ModuleRunV2AutomationRegistrationReadiness.ps1`
- `scripts/agent-system/Test-ModuleRunV2StoppedAutomationHygiene.ps1`
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`

## Scope

Add one read-only human-facing status entry point that aggregates the current mechanism diagnostics into a single
`projectStatusDecision`.

Allowed changes:

- `Get-TikuProjectStatus.ps1` and smoke test;
- operating manual and mechanism source index;
- durable state and task queue pointers;
- task plan, evidence, and audit review.

Blocked changes:

- product code, dependencies, lockfiles, schema, migrations, env/secret, provider, staging/prod/cloud/deploy, payment,
  external-service, PR, force push, and Cost Calibration Gate execution.

## Implementation

1. Add `Get-TikuProjectStatus.ps1` as a read-only aggregator.
2. Run and summarize `Get-TikuNextAction`, automation registration readiness, stopped automation hygiene, and seed
   proposal diagnostics.
3. Emit a final `projectStatusDecision`, `projectStatusAction`, and `projectStatusReason`.
4. Keep planned pause as a top-priority stop state.
5. Register the command in the operating manual and mechanism source-of-truth index.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- scoped Prettier check
- `git diff --check`

## Risk Defense

- The aggregator is read-only and does not call cleanup, seed transaction, merge, push, provider, or deployment actions.
- Planned pause remains the final decision while local automation is intentionally paused.
- Cost Calibration Gate remains blocked.
