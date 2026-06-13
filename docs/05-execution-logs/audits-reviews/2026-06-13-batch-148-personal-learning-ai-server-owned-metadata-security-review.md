# Audit Review: batch-148-personal-learning-ai-server-owned-metadata-security-review

Status: APPROVE

## Scope Reviewed

- Reviewed `batch-148-personal-learning-ai-server-owned-metadata-security-review`.
- Product-code review was read-only and covered the personal AI request route, request flow, local browser experience,
  result/reference read models, persistent history mapper/repository, route wiring, and relevant batch-147 tests.
- State, queue, task plan, evidence, and audit records are limited to the queued batch-148 allowedFiles.
- Env/secret, provider, dependency, schema/migration, e2e, generated-content write paths, formal content adoption,
  deploy, payment, external-service, PR, force-push, and Cost Calibration Gate execution remain outside this task.

## Security Boundary Review

- `createServerOwnedLocalBrowserRequestInput` is applied before `createOrReuseRequest`, so new local pending task
  persistence uses server-owned metadata rather than client-supplied result/evidence/reference fields.
- `createRequestInputWithUserContext` keeps actor, owner, and quota owner public ids bound to the resolved session
  user before the server-owned metadata pass.
- `listRequestHistory` and idempotency reuse are owner-scoped through personal owner predicates and personal task-type
  filters.
- History and local browser DTOs expose public ids only plus redacted status/evidence summaries; `ai_call_log` is
  represented only by public-id reference metadata and redaction status.
- Provider calls, provider payload adoption, raw generated content, and formal content writes are not reachable from
  this local contract path.

## Findings

- No blocking findings.
- Residual risk: repository-level `createOrReuseRequest` still trusts its internal caller for result/evidence metadata.
  Current route ownership is acceptable, but future callers, provider result adoption, or generated-content write paths
  must add or prove their own server-owned metadata boundary before persistence.
- Batch-149 should still run the queued existing local role-flow e2e validation.
- Batch-150 should still record provider/env/dependency/local provider sandbox and Cost Calibration blocked gates.
- Cost Calibration Gate remains blocked.

## Decision

- APPROVE after declared diff check, anchor check, lint, typecheck, full unit, build, pre-commit hardening, module
  closeout, and pre-push readiness gates pass.
