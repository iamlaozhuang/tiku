# Personal Learning AI Auto Seed Approval Request Plan

## Scope

- Task: `personal-learning-ai-auto-seed-approval-request-2026-06-20`
- Branch: `codex/personal-learning-ai-auto-seed-approval-request`
- Decision file: `docs/04-agent-system/state/personal-learning-ai-auto-seed-approval-decision.yaml`

## Purpose

Prepare a human decision surface for the current seed proposal:

- module: `personal-learning-ai`
- source planning task: `phase-71-advanced-personal-ai-generation-implementation-planning`
- candidate tasks: `batch-216` through `batch-219`
- local full-loop minimum: L5

## Boundary

This plan does not approve or execute the auto-seed transaction. It does not create seeded implementation tasks, claim
implementation work, run provider calls, read or write env/secrets, change schema/migrations/dependencies, deploy, open
PRs, force-push, or execute Cost Calibration Gate.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-ModuleRunV2ImplementationSeedProposal.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `npx.cmd prettier --write --ignore-unknown ...`
- `npx.cmd prettier --check --ignore-unknown ...`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId personal-learning-ai-auto-seed-approval-request-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId personal-learning-ai-auto-seed-approval-request-2026-06-20`
