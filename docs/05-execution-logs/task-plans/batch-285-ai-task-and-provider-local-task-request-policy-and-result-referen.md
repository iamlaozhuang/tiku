# Task Plan: batch-285 ai-task-and-provider local request policy

## Scope

- Task id: `batch-285-ai-task-and-provider-local-task-request-policy-and-result-referen`
- Module: `ai-task-and-provider`
- Target closure item: local task request policy and result reference contracts
- Branch: `codex/batch-285-ai-task-request-policy-reconcile-20260622`
- Implementation decision: historical implementation reconcile; no product source edit planned.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-265-ai-task-and-provider-local-task-request-policy-and-result-referen.md`
- `src/server/models/ai-generation-task-request.ts`
- `src/server/services/ai-generation-task-request-service.ts`
- `src/server/services/ai-generation-task-request-service.test.ts`

## Plan

1. Confirm auto-seed readiness for the candidate task.
2. Reconcile existing local request policy and result reference behavior against the seeded batch.
3. Update task evidence, audit review, queue status, and project-state tracking.
4. Run focused unit validation plus lint, typecheck, diff check, closeout, and pre-push readiness gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- Keep work inside allowed docs/state files unless focused validation exposes a true source gap.
- Do not touch package or lock files, schema, migration, env, provider, database, deployment, PR, browser/e2e, or Cost Calibration Gate surfaces.
- Evidence remains redacted and summary-only.
