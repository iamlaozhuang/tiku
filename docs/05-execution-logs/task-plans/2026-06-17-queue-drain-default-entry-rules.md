# Queue Drain Default Entry Rules

## Summary

- Task id: `queue-drain-default-entry-rules`
- Task kind: `mechanism_maintenance`
- Date: 2026-06-17
- Branch: `codex/queue-drain-default-entry-rules`
- Product closure contribution: none; mechanism budget item

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/sop/failure-retry-and-human-takeover-governance.md`

## Scope

Make `Invoke-ModuleRunV2QueueDrainSupervisor.ps1` the executable default entry contract for queue draining, without
changing product code, dependencies, schema, provider behavior, deployment, or external services.

Allowed files for this mechanism task:

- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/automated-advancement-governance.md`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-queue-drain-default-entry-rules.md`
- `docs/05-execution-logs/evidence/2026-06-17-queue-drain-default-entry-rules.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-queue-drain-default-entry-rules.md`

Blocked files and actions:

- `.env*`, secrets, tokens, DB URLs, Authorization headers
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, migrations
- provider/model calls, Cost Calibration Gate, staging/prod/cloud/deploy/payment/external-service
- PR, force push, product runtime/UI/schema changes

## TDD Plan

1. RED: extend queue drain supervisor smoke to require machine-readable default-entry fields, module approval window
   fields, hard-stop state-machine fields, and recovery packet requirements.
2. GREEN: update the supervisor result contract and manifest content to emit those fields for ready, budget, idle,
   approval-required, recovery, and hard-block decisions.
3. Refactor only if duplication becomes material.

## Intended Executable Contract

The supervisor result must emit:

- `queueDrainDefaultEntry: true`
- `queueDrainEntryContract: startup_guardian_then_runner_dispatcher_eligibility_closeout`
- `moduleApprovalWindowDecision: approved|approval_required|not_applicable`
- `hardStopState: ready_task|idle|budget_stop|needs_human_approval|hard_block_recovery`
- `recoveryPacketRequired: true|false`
- `recoveryPacketRule: generate_or_reuse_redacted_packet_before_resume` when a hard-block recovery state is reached

The manifest must record the same values outside the repository and continue to redact sensitive surfaces.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2QueueDrainSupervisor.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `git diff --check`
- `npx prettier --check --ignore-unknown <changed files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`

## Risk Defense

- Keep this as mechanism-only work.
- Do not mutate the active task queue unless evidence proves a gate requires it.
- Do not write repo-internal drain manifests or recovery packets.
- Treat seed proposals and missing approvals as `needs_human_approval`, not executable work.
- Treat repeated blockers and runner hard blocks as `hard_block_recovery` requiring a redacted recovery packet before
  resumption.
