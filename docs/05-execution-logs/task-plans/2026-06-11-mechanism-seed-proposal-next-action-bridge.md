# Mechanism Seed Proposal Next-Action Bridge Plan

## Task

- id: `mechanism-seed-proposal-next-action-bridge`
- branch: `codex/mechanism-seed-proposal-bridge`
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
- `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `scripts/agent-system/Get-TikuProjectStatus.ps1`

## Scope

Expose guarded Module Run v2 seed proposal availability through the read-only next-action diagnostic when no pending
task is executable and the current task is terminal.

Allowed changes:

- `Get-TikuNextAction.ps1` and its smoke test;
- operating manual and mechanism source index wording;
- durable state and task queue pointers;
- task plan, evidence, and audit review.

Blocked changes:

- queue mutation, seed transaction application, product code, dependencies, lockfiles, schema, migrations, env/secret,
  provider, staging/prod/cloud/deploy, payment, external-service, PR, force push, and Cost Calibration Gate execution.

## Implementation

1. Add read-only seed proposal invocation to `Get-TikuNextAction.ps1`.
2. Emit `seedProposalDecision`, `seedModule`, `seedRequiredApproval`, and `recommendedHumanDecision`.
3. Return `nextActionDecision: seed_proposal_available` only when planned pause is not active.
4. Keep planned pause as the top-priority decision.
5. Extend smoke coverage for pending task, planned pause, and empty queue with seed proposal.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- scoped Prettier check
- `git diff --check`

## Risk Defense

- Seed bridge is proposal-only.
- Planned pause remains a stop state.
- Cost Calibration Gate remains blocked.
