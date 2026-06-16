# Audit Review: advanced-organization-training-content-subject-scope-readonly-recheck

## Scope Reviewed

- Organization training manual draft service subject scope guard.
- Organization training contract subject metadata boundary.
- Effective authorization context contract boundary.
- Organization training validator subject validation posture.
- Service unit coverage for source-backed authorization context, invalid selected subject, formal target isolation, and
  provider/raw field non-leakage.
- Prior content subject scope guard evidence and audit.
- Prior subject authorization context contract decision evidence and audit.
- ADR-002 layering boundary.

## Findings

- `subject` remains a selected organization training content/request scope and persisted metadata field.
- `EffectiveAuthorizationContextDto` remains source-backed by `profession/level`; no `subject` key was added.
- The service rejects invalid selected `subject` before draft write composition.
- Valid `subject` remains preserved into metadata-only organization training draft output.
- Service, contract, validator, and test posture is consistent with the prior contract decision.
- ADR-002 layering remains intact for the reviewed surface.
- No route, repository, mapper, model, API runtime, UI, schema, DB, provider, package, lockfile, script, e2e, dev-server,
  formal content write, or formal target write behavior was introduced.

## Decision

APPROVE.

The readonly recheck may close if validation, Module Run v2 closeout, and pre-push readiness gates pass.

## Recommended Next Task

No new task is seeded by this readonly recheck. Select the next pending queue item after user review.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation, route/service/repository/mapper/
  API runtime/contract/model/validator/UI changes, formal content writes, formal target writes, adding `subject` to
  `EffectiveAuthorizationContextDto`, public identifier value list exposure, PR, and force push remain blocked.
