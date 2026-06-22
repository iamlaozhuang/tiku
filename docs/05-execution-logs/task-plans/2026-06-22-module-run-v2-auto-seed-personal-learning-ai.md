# Task Plan: Module Run v2 Auto Seed personal-learning-ai

## Scope

- Action: `request_auto_seed_approval:personal-learning-ai`
- Source planning task: `phase-71-advanced-personal-ai-generation-implementation-planning`
- Seeded module: `personal-learning-ai`
- Branch: `codex/auto-seed-personal-learning-ai`
- Seeded task range: `batch-268` through `batch-271`

## Read Context

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`.
- Read `scripts/agent-system/Get-ModuleRunV2ImplementationSeedProposal.ps1`.
- Read `scripts/agent-system/New-ModuleRunV2ImplementationSeed.ps1`.
- Read `scripts/agent-system/Test-ModuleRunV2ImplementationSeedSelfReview.ps1`.

## Implementation Approach

- Materialize the approved guarded seed proposal for `personal-learning-ai`.
- Register four low-risk local implementation tasks as pending queue entries.
- Generate pending evidence and audit placeholders for each seeded task.
- Keep the seed transaction docs/state-only.
- Do not start Provider, env, schema, database, dependency, browser/e2e, deployment, PR, force-push, external-service, or Cost Calibration Gate work.

## Validation Plan

- `New-ModuleRunV2ImplementationSeed.ps1 -TaskId phase-71-advanced-personal-ai-generation-implementation-planning -MaxBatchCount 4 -Apply`.
- `Test-ModuleRunV2ImplementationSeedSelfReview.ps1 -ExpectedModule personal-learning-ai -SeedTaskIds ...`.
- `npx.cmd prettier --write` on changed docs/state files.
- `git diff --check`.
- `npm.cmd run lint`.
- `npm.cmd run typecheck`.

## Risk Controls

- Approval text is recorded in queue and seed evidence.
- Seeded closeout remains limited to low-risk local implementation tasks with task-level gates.
- High-risk capability gates remain blocked without fresh task approval.
- Evidence must remain summary-only and redacted.
