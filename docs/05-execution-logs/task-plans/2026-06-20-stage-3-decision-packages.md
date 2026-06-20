# Stage 3 Decision Packages Plan

## Task

- Task id: `stage-3-decision-packages-2026-06-20`
- Branch: `codex/stage-3-decision-packages`
- Scope: docs/state-only decision package clarification after stage 2 blocked item triage.

## Readiness Inputs

- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- Read `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- Read `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- Read `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- Read `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read `docs/04-agent-system/state/blocked-item-triage-2026-06-20.yaml`.

## Implementation Steps

1. Register a docs/state stage 3 task in `task-queue.yaml` and sync `project-state.yaml`.
2. Archive only the prior closed stage 2 task exposed by this governance branch entry flow.
3. Create `docs/04-agent-system/state/low-risk-decision-packages-2026-06-20.yaml` for AP-04, AP-05, AP-09, AP-10, and AP-11.
4. Keep the AP tasks blocked; record exact decision surface, approval text, allowed-file expectations, blocked capabilities, validation expectations, rollback/stop conditions, and next action.
5. Write evidence and audit records, then run docs/state validation and hardening gates.
6. Make the first validation commit, write the real commit hash back into evidence, close the stage 3 task, run closeout readiness, and make the closeout commit.

## Boundaries

- No source, test, e2e, script, dependency, package, lockfile, env, secret, database, provider, schema, migration, staging/prod deploy, payment, OCR, export, external-service, PR, force-push, destructive database, or Cost Calibration Gate work.
- No blocked task semantic change and no pending implementation task claim.
- Decision packages are preparation only; they do not authorize execution.

## Validation

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuNextAction.ps1 -VerboseHistory`
- `npx.cmd prettier --write --ignore-unknown <stage-3-docs-state-files>`
- `npx.cmd prettier --check --ignore-unknown <stage-3-docs-state-files>`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-3-decision-packages-2026-06-20`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId stage-3-decision-packages-2026-06-20`
