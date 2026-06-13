# Audit Review: batch-142-personal-learning-ai-persistent-history-security-review

Status: APPROVE

## Scope Reviewed

- Reviewed `batch-142-personal-learning-ai-persistent-history-security-review` as a docs-only security review.
- Read-only reviewed persistent personal AI request history schema/migration, mapper, repository, route service, app route
  adapter, UI integration, focused tests, existing local e2e coverage, and batch-137 through batch-141 evidence/audit.
- Edited only project state, task queue, task plan, evidence, and this audit.
- Product source, tests, e2e, schema/drizzle, package/lockfile, env/secret, provider, deploy, payment, external-service,
  authorization model, PR, force-push, and formal generated-content write paths are outside this task.

## Findings

- No blocking findings for the current local-contract-only request history surface.
- session ownership is enforced at route level: GET history is looked up by resolved session `ownerPublicId`, and POST
  persistence normalizes actor, owner, and quota owner public ids from the resolved session before repository calls.
- public ids only are returned by the history DTO. The mapper excludes internal numeric ids, owner ids, idempotency hashes,
  database rows, and provider/runtime internals.
- `ai_call_log` history exposure is limited to nullable `aiCallLogPublicId`; raw prompts, raw generated content,
  provider payloads, redacted snapshot bodies, token counts, model config ids, and internal `ai_call_log.id` are not part
  of the persistent request history DTO.
- GET repository failures and POST persistence failures use redacted fallback/error envelopes and do not expose stack or
  connection detail strings.
- The batch-137 through batch-141 diff does not touch formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`,
  or `mistake_book` write-path files.
- Non-blocking residual risk: before provider execution or generated-content persistence is enabled, public result and
  `ai_call_log` references must be server-owned rather than accepted from local-browser request metadata.
- Cost Calibration Gate remains blocked.

## Decision

- APPROVE for batch-142 docs-only security review closeout after declared validation commands, pre-commit hardening,
  module closeout readiness, and pre-push readiness pass.
