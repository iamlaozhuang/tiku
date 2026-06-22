# Task Plan: batch-284 ai-task-and-provider provider-agnostic lifecycle contract

## Scope

- Task id: `batch-284-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract`
- Module: `ai-task-and-provider`
- Target closure item: provider-agnostic AI task lifecycle contracts
- Branch: `codex/batch-284-ai-task-lifecycle-reconcile-20260622`
- Implementation decision: historical implementation reconcile; no product source edit planned.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-264-ai-task-and-provider-provider-agnostic-ai-task-lifecycle-contract.md`
- `src/server/models/ai-generation-task.ts`
- `src/server/models/ai-generation-task.test.ts`

## Plan

1. Confirm auto-seed readiness for the candidate implementation task.
2. Reconcile the existing lifecycle model and focused unit coverage against the newly seeded batch.
3. Update task evidence, audit review, queue status, and project-state current-task tracking.
4. Run focused unit validation plus lint, typecheck, diff check, closeout, and pre-push readiness gates.
5. Commit this docs/state closeout, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- Do not change `src` unless focused validation exposes a real gap.
- Do not touch package or lock files, schema, migration, env, provider, database, deployment, PR, browser/e2e, or Cost Calibration Gate surfaces.
- Evidence remains summary-only and redacted.
