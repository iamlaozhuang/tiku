# Mechanism Runner Profile WorkPacket LocalFullFlow Consumption Plan

## Task

- id: `mechanism-runner-profile-workpacket-localfullflow-consumption`
- date: `2026-06-17`
- branch: `codex/mechanism-runner-profile-consumption`
- scope: mechanism runner consumption of profile catalog, work packet limits, and local full-flow capability gates.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`

## Goal

Move profile catalog from diagnostics toward runner behavior while preserving hard boundaries. The runner should surface
catalog and work packet decisions, cap its effective task budget by profile limits, and pass catalog path through to
next-action. The local full-flow gate should require the `local_full_flow` profile and localhost-only validation before
reporting capability readiness.

## Allowed Files

- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `docs/05-execution-logs/evidence/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.ps1`
- `scripts/agent-system/Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.ps1`
- `scripts/agent-system/Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`

## Blocked Gates

- No product source code.
- No schema, drizzle, package, lockfile, or dependency changes.
- No `.env*` access, output, summary, or edit.
- No provider/model call, provider configuration, quota, cost, or Cost Calibration Gate work.
- No staging, production, cloud, deploy, payment, or external service.
- No dev server, Browser, Playwright, or e2e execution.
- No PR or force push.

## Implementation Steps

1. Extend next-action diagnostics to output work packet id/scope and catalog max tasks per packet.
2. Extend runner to pass `ExecutionProfileCatalogPath`, report profile/work packet policy, and cap effective loop budget
   by catalog max tasks per packet.
3. Strengthen `localFullFlowGate` use-capability checks so readiness requires `executionProfile: local_full_flow`,
   `validationPolicy: local_full_flow`, `localFullFlowGate: approved_localhost_only`, and localhost-only command targets.
4. Add/update focused smoke coverage for runner profile output and local full-flow gate rejection/approval.
5. Write evidence and audit, then run validation and closeout gates.

## Validation Plan

- `git diff --check`
- `node_modules/.bin/prettier.cmd --check docs/04-agent-system/state/autodrive-control-schema.yaml docs/04-agent-system/state/execution-profiles.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md docs/05-execution-logs/evidence/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-runner-profile-workpacket-localfullflow-consumption.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-TaskEvidence.Smoke.ps1`

## Closeout

Fresh user goal approval allows local commit, fast-forward merge to `master`, push to `origin/master`, and merged
short-branch cleanup after validation passes.
