# Mechanism Profile Catalog And Ready Set Foundation Plan

## Task

- id: `mechanism-profile-catalog-ready-set-foundation`
- date: `2026-06-17`
- branch: `codex/mechanism-profile-catalog-ready-set`
- scope: mechanism profile catalog source-of-truth and backward-compatible script consumption.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/sop/mechanism-tuning-authorization-and-slimming-plan.md`

## Goal

Move the mechanism from ad hoc profile strings toward a durable profile catalog that scripts can read without changing
legacy default behavior. This task prepares the next `ready_set`, `workPacket`, and local full-flow behavior tasks.

## Allowed Files

- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/autodrive-control-schema.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-17-mechanism-profile-catalog-ready-set-foundation.md`
- `docs/05-execution-logs/evidence/2026-06-17-mechanism-profile-catalog-ready-set-foundation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-17-mechanism-profile-catalog-ready-set-foundation.md`
- `scripts/agent-system/Test-ModuleRunV2AutodriveSchemaReadiness.ps1`
- `scripts/agent-system/Get-TikuNextAction.ps1`
- `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`

## Blocked Gates

- No product source code.
- No schema, drizzle, package, lockfile, or dependency changes.
- No `.env*` access, output, summary, or edit.
- No provider/model call, provider configuration, quota, cost, or Cost Calibration Gate work.
- No staging, production, cloud, deploy, payment, or external service.
- No dev server, Browser, Playwright, or e2e execution.
- No PR or force push.

## Implementation Steps

1. Add `execution-profiles.yaml` with standard profiles, defaults, validation policies, evidence modes, queue selection
   modes, work packet limits, and local full-flow local-only constraints.
2. Index the catalog in `mechanism-source-of-truth-index.yaml` and reference it from `autodrive-control-schema.yaml`.
3. Update project-state and task-queue with this task.
4. Teach readiness and next-action scripts to read and report the catalog path while defaulting missing legacy fields to
   `legacy_explicit`.
5. Keep seed transaction output backward-compatible while adding explicit catalog/profile references to newly generated
   tasks.

## Validation Plan

- `git diff --check`
- `node_modules/.bin/prettier.cmd --check <changed docs/state/evidence/audit/task-plan files>`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.ps1 -TaskId mechanism-profile-catalog-ready-set-foundation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2AutodriveSchemaReadiness.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\New-ModuleRunV2ImplementationSeed.Smoke.ps1`

## Closeout

Fresh user goal approval allows local commit, fast-forward merge to `master`, push to `origin/master`, and merged
short-branch cleanup after validation passes.
