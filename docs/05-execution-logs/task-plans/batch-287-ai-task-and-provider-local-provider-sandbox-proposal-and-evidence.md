# Task Plan: batch-287 ai-task-and-provider local provider sandbox proposal

## Scope

- Task id: `batch-287-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence`
- Module: `ai-task-and-provider`
- Target closure item: `local_provider_sandbox` proposal and evidence rules
- Branch: `codex/batch-287-ai-task-sandbox-reconcile-20260622`
- Implementation decision: historical implementation reconcile; no product source edit planned.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-267-ai-task-and-provider-local-provider-sandbox-proposal-and-evidence.md`
- `src/server/models/ai-generation-task-provider-sandbox-proposal.ts`
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.ts`
- `src/server/services/ai-generation-task-provider-sandbox-proposal-service.test.ts`

## Plan

1. Confirm auto-seed readiness for the candidate task.
2. Reconcile existing provider sandbox proposal-only behavior against the seeded batch.
3. Update task evidence, audit review, queue status, and project-state tracking.
4. Run focused unit validation plus lint, typecheck, diff check, closeout, and pre-push readiness gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.
6. After batch-287 is fully merged and pushed, run `Get-TikuNextAction.ps1` and the implementation seed proposal before any new seed.

## Risk Controls

- Keep work inside allowed docs/state files unless focused validation exposes a true source gap.
- Do not execute Provider/model calls; do not read or modify env/secrets; do not change provider configuration, dependencies, schema, migration, database, deployment, PR, browser/e2e, or Cost Calibration Gate surfaces.
- Evidence remains proposal-only, redacted, and summary-only.
