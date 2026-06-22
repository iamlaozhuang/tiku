# Task Plan: batch-286 ai-task-and-provider redacted log evidence

## Scope

- Task id: `batch-286-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence`
- Module: `ai-task-and-provider`
- Target closure item: redacted `audit_log` and `ai_call_log` evidence references
- Branch: `codex/batch-286-ai-task-log-evidence-reconcile-20260622`
- Implementation decision: historical implementation reconcile; no product source edit planned.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/batch-266-ai-task-and-provider-redacted-audit-log-and-ai-call-log-evidence.md`
- `src/server/models/ai-generation-task-log-evidence-reference.ts`
- `src/server/services/ai-generation-task-log-evidence-reference-service.ts`
- `src/server/services/ai-generation-task-log-evidence-reference-service.test.ts`

## Plan

1. Confirm auto-seed readiness for the candidate task.
2. Reconcile existing redacted log evidence reference behavior against the seeded batch.
3. Update task evidence, audit review, queue status, and project-state tracking.
4. Run focused unit validation plus lint, typecheck, diff check, closeout, and pre-push readiness gates.
5. Commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Risk Controls

- Keep work inside allowed docs/state files unless focused validation exposes a true source gap.
- Do not touch package or lock files, schema, migration, env, provider, database, deployment, PR, browser/e2e, or Cost Calibration Gate surfaces.
- Evidence must not contain raw log payloads, provider payloads, prompts, raw generated output, database URLs, tokens, raw employee answers, or full paper content.
