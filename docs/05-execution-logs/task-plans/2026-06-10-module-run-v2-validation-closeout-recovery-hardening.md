# Module Run v2 Validation Closeout Recovery Hardening Plan

## Scope

Mechanism-only repair for Module Run v2 startup and recovery classification. This task does not continue batch-101 business implementation, does not inspect or rewrite full paper/material content, and does not change product runtime code.

## Human Approval

User approved execution in chat on 2026-06-10 after reviewing the serial T0-T8 plan. The approved direction is to keep `safeToAdopt=false` ownership protection while adding robust validation-surface, closeout, and owner-recovery classification until the next Codex automation startup has a deterministic takeover or safety-boundary result.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- Relevant SOPs and scripts under `docs/04-agent-system/sop/` and `scripts/agent-system/`

## Implementation Sequence

1. Add a failing smoke fixture for validation-surface and closeout transaction classification.
2. Add a read-only classifier script that reports validation surface, unrelated baseline failure evidence, closeout transaction state, and next safe action.
3. Wire startup readiness to classify expired dirty active owners as `manual_required_owner_recovery` instead of a generic hard block when `safeToAdopt=false`.
4. Wire runner, dispatcher, serial executor, and recovery self-repair to preserve the explicit owner-recovery boundary.
5. Extend the durable schema, source-of-truth index, and automated advancement SOP with the new states.
6. Add smoke coverage for active-owner, stale dirty owner, validation mismatch, pending closeout, and dispatcher routing.
7. Run focused mechanism smoke tests, `git diff --check`, `npm.cmd run lint`, and `npm.cmd run typecheck`.
8. Prove the next autopilot startup path is deterministic: active owner, owner recovery, cleanup, closeout recovery, task claim, idle, or manual-required safety boundary.

## Risk Controls

- Do not edit `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `package.json`, or lockfiles.
- Do not run e2e, provider calls, DB operations, dependency changes, deploys, PR actions, force push, or Cost Calibration Gate.
- Do not clean or alter dirty batch-101 worktrees.
- Do not expose secrets, raw DB rows, provider payloads, plaintext `redeem_code`, or full paper/material content.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ValidationSurfaceReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutomationStartupReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AutopilotRunner.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2AgentActionDispatcher.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2SerialAutodriveExecutor.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-ModuleRunV2RecoverySelfRepair.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveControlLoopAcceptance.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
