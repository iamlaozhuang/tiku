# Evidence: Admin AI Generation Task Persistence DB Schema Mapping Approval Package

Task id: `admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`

## Summary

Prepared a docs/state-only schema mapping approval package. Decision: keep `ai_generation_task` as shared lifecycle,
add `admin_ai_generation_task_metadata` as the admin companion metadata table, and require a narrow future schema
approval before any real DB adapter is implemented.

## Requirement Mapping Result

- AI task domain requires trackable task status and redacted failure/evidence linkage.
- Organization admin AI generation requires organization-owned trackable tasks and no platform formal content write.
- Content admin AI generation requires isolated review/suggestion boundaries and no direct formal `question`/`paper`
  write.
- ADR-002 keeps DB access in repositories and Drizzle schema in `src/db/schema/`.
- ADR-006 keeps Provider/env/cost execution separately gated.

## Static Evidence

- `src/db/schema/ai-rag.ts` defines `ai_generation_task` as the shared lifecycle table with task type, owner/quota,
  status, retry, failure category, idempotency, evidence, and `ai_call_log` fields.
- The same schema currently requires `question_public_id` and `ai_func_type`, which are not non-lossy for admin AI paper
  generation or admin generation lifecycle tasks.
- `src/server/contracts/admin-ai-generation-task-persistence-contract.ts` requires admin-specific `workspace`,
  `generationKind`, runtime bridge, Provider-disabled boundary flags, formal content write boundary flags, source
  references, redaction status, and result visibility metadata.
- `src/server/repositories/admin-ai-generation-task-persistence-repository.ts` already rejects unsafe local contracts and
  accepts only Provider-disabled content/organization admin owner boundaries.

## Decision Evidence

Selected: companion metadata table plus narrow shared lifecycle compatibility migration before adapter work.

Rejected:

- all-admin-fields-in-`ai_generation_task`: mixes lifecycle with admin review/formal-boundary metadata;
- separate backend lifecycle table: duplicates status/retry/idempotency/owner/quota/`ai_call_log` semantics.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-task-persistence-db-schema-mapping-approval-package.md`

## Blocked Work Statement

- Source/tests changed: `false`
- DB connection/write/schema/migration/seed/account mutation: `false`
- Provider call/configuration/env/secret/credential read: `false`
- Formal `question`/`paper` write: `false`
- Package/lockfile change: `false`
- Browser/e2e/dev-server: `false`
- Staging/prod/payment/external-service/release/final Pass: `false`

## Validation Log

- Scoped prettier write: `pass`.
- Scoped prettier check: `pass`.
- `git diff --check`: `pass`.
- Module Run v2 pre-commit hardening: `pass`.
- Module Run v2 pre-push readiness: `pass_skip_remote_ahead_check`.

## Next Step

Request fresh approval before running:

`admin-ai-generation-task-persistence-db-schema-and-adapter-tdd-2026-06-26`
