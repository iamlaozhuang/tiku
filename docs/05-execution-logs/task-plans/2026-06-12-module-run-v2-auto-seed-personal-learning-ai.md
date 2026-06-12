# Module Run v2 Auto-Seed Plan: personal-learning-ai

## Scope

Close out the recoverable auto-seed transaction that appended guarded pending implementation tasks for
`personal-learning-ai`.

Seeded tasks:

- `batch-119-personal-learning-ai-personal-generation-request-flow`
- `batch-120-personal-learning-ai-paper-and-mock-exam-context-selection`
- `batch-121-personal-learning-ai-local-ui-browser-experience-for-request-and`
- `batch-122-personal-learning-ai-redacted-ai-call-log-reference`

## Read Norms

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Implementation Approach

1. Preserve the dirty seed transaction on a short `codex/` branch.
2. Add a queue-visible seed transaction task so closeout gates can evaluate the transaction by TaskId.
3. Keep product implementation deferred to the newly seeded pending tasks.
4. Run scoped seed self-review for only the four `personal-learning-ai` seeded task ids.
5. Run local validation, pre-commit hardening, pre-push readiness, and repository completion checks before any closeout.

## Guardrails

- No product source edits in this seed closeout.
- No dependency, lockfile, schema, migration, environment, provider, deploy, payment, e2e, PR, or force-push work.
- Cost Calibration Gate remains blocked.
- The broad runner self-review failure is treated as a scope issue because it reviewed historical seeded tasks; the scoped review is required before closeout.
