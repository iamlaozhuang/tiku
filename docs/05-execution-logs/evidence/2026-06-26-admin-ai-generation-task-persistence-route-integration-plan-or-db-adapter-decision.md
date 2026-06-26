# Evidence: Admin AI Generation Task Persistence Route Integration Or DB Adapter Decision

Task id: `admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision`

## Summary

Prepared a docs-only decision package. Decision: do not wire fake/local persistence into production admin AI generation
routes next; first prepare DB adapter/schema mapping approval.

## Requirement Mapping Result

- `modules/02-ai-task-domain.md`: trackable AI tasks and redacted operational evidence are required.
- `modules/08-organization-ai-generation.md`: organization admin AI generation must be organization-owned and formally
  separated from platform `question` and `paper`.
- `2026-06-23 advanced AI generation scope clarification`: content admin AI output remains in review domain and direct
  formal writes are blocked.

## Static Evidence

- Admin routes currently call `createAdminAiGenerationLocalContractRouteHandlers(...)` and return local contracts.
- The new repository port is gateway-injected and has no real DB adapter.
- Current `ai_generation_task` schema lacks non-lossy fields for admin `workspace`, `generationKind`, runtime bridge
  boundary, and formal content boundary.
- Current `ai_generation_task.question_public_id` is not nullable, which is not a clean fit for admin AI `paper`
  generation or review tasks without a source question.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision.md`

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

`admin-ai-generation-task-persistence-db-schema-mapping-approval-package-2026-06-26`
