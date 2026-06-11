# AI Task And Provider Auto Seed Approval Decision

## Task

- id: `ai-task-and-provider-auto-seed-approval-decision`
- branch: `codex/ai-task-provider-seed-approval-decision`
- task kind: `docs_only`
- productClosureContribution: `none; mechanism budget item`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/05-execution-logs/evidence/2026-06-11-mechanism-seed-proposal-next-action-bridge.md`
- `docs/05-execution-logs/evidence/2026-06-11-mechanism-project-status-unified-diagnostic.md`

## Current Read-Only Diagnostics

- `Get-ModuleRunV2ImplementationSeedProposal.ps1` reports `seedProposalDecision: proposal_available`.
- Proposed module: `ai-task-and-provider`.
- Required approval: `autoDriveLocalImplementationApproval for module ai-task-and-provider`.
- `Get-TikuNextAction.ps1` and `Get-TikuProjectStatus.ps1` still report final decision `planned_pause_for_tuning`.

## Scope

Create a durable approval decision entry for the current `ai-task-and-provider` seed proposal. The entry records that
the proposal is available but not approved in this task.

Allowed changes:

- approval decision state file;
- operating manual and mechanism index references;
- project-state and task queue pointers;
- task plan, evidence, and audit review.

Blocked changes:

- seed transaction execution or queued implementation task creation;
- automation resume, task claiming, provider calls, env/secret, dependency, lockfile, schema, migration, staging/prod,
  cloud, deploy, payment, external-service, PR, force push, and Cost Calibration Gate execution.

## Implementation

1. Add a pending approval decision record for `ai-task-and-provider`.
2. Register the decision path in durable state and the mechanism index.
3. Update the operating manual with the approval decision rule.
4. Add this task to the active queue as closed mechanism tuning work.
5. Record evidence and audit review after validation.

## Validation

- `Get-ModuleRunV2ImplementationSeedProposal.ps1`;
- `Get-TikuNextAction.ps1`;
- `Get-TikuProjectStatus.ps1`;
- scoped Prettier check;
- required anchor `Select-String`;
- `git diff --check`.

## Risk Defense

- The decision status remains `pending_human_decision`.
- The default action remains `keep_automation_paused_for_tuning`.
- This task does not call `New-ModuleRunV2ImplementationSeed.ps1`.
- No implementation tasks are appended to `task-queue.yaml`.
- Cost Calibration Gate remains blocked.
