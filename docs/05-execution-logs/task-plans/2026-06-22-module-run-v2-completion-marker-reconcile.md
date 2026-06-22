# Task Plan: Module Run v2 completion marker reconcile

## Scope

- Task id: `module-run-v2-completion-marker-reconcile-2026-06-22`
- Branch: `codex/module-run-v2-completion-marker-reconcile-20260622`
- Purpose: prevent duplicate auto-seed proposals for Module Run v2 implementation batches that already have terminal historical evidence.
- Implementation decision: docs/state queue hygiene only; no product source edit.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- Historical evidence for `batch-268` through `batch-283`
- Current closeout evidence for `batch-284` through `batch-287`

## Plan

1. Add matrix `currentProgress.completedBatches` markers for terminal personal-learning-ai, organization-training, organization-analytics, ops-governance-and-retention, and ai-task-and-provider implementation batches.
2. Record a closed docs/state queue hygiene task, evidence, audit review, and project-state current task.
3. Run `Get-ModuleRunV2ImplementationSeedProposal.ps1 -MaxBatchCount 4` to verify duplicate personal-learning-ai seeding is suppressed.
4. Run `Get-TikuNextAction.ps1 -VerboseHistory`, formatting, diff, pre-commit hardening, and pre-push readiness gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- Do not add seed tasks.
- Do not change product source, scripts, package/lock files, env/secrets, schema, migration, database, provider, browser/e2e, deploy, PR, or Cost Calibration Gate surfaces.
- Evidence remains summary-only and references existing redacted evidence paths.
