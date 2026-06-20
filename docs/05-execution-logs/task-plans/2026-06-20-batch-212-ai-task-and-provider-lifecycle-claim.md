# Batch 212 Ai Task And Provider Lifecycle Claim Plan

## Context

- Task id: `batch-212-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- Branch: `codex/batch-212-ai-task-provider-lifecycle`
- User approval: merge/push/cleanup `codex/ai-task-provider-auto-seed`, then claim batch-212 under the submission barrier.
- Scope for this transaction: docs/state claim readiness only.

## Read Standards

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`

## Findings

- `Invoke-ModuleRunV2SerialAutodriveExecutor.ps1 -AgentActionOverride claim_task` initially stopped with `l123_approval_package_required`.
- Missing exact-scope fields: `redaction`, `rollback`, `stopConditions`.
- The real queue id includes `ai-task-and-provider`; the shorter `ai-task-provider` id was ignored for writes and must not be used for the claim.

## Plan

1. Add exact-scope redaction, rollback, and stop conditions to the existing batch-212 queue block.
2. Re-run L123 readiness and serial executor dry-run.
3. Execute `claim_task` only if the executor reports the task is ready.
4. Record evidence and audit notes for the claim transaction.
5. Validate docs/state changes with `git diff --check`, next-action diagnostics, and the task's pre-edit auto-seed readiness command.

## Boundaries

- Do not change source, tests, scripts, dependencies, lockfiles, schema, migrations, `.env*`, deployment, payment, provider configuration, PR state, or Cost Calibration Gate.
- Do not run provider/model calls or read env secrets.
- Do not merge, push, or delete the batch branch without a later explicit approval.
