# Audit Review: advanced-organization-training-content-subject-scope-guard

## Scope Reviewed

- Organization training manual draft service behavior.
- Organization training service unit coverage.
- Effective authorization context boundary.
- Prior subject authorization context contract decision.
- ADR-002 route/service/repository/model layering.

## Findings

- The service now rejects invalid selected content-scope `subject` before draft metadata composition.
- Valid `subject` remains preserved as organization training draft metadata.
- `EffectiveAuthorizationContextDto` remains source-backed by `profession/level`; no `subject` key was added.
- Changes stayed within the queued service/test/docs/state surfaces.
- No route, repository, mapper, validator, model, API, UI, schema, DB, provider, package, lockfile, script, e2e,
  dev-server, formal content write, or formal target write behavior was introduced.

## Decision

APPROVE.

The task may close if Module Run v2 closeout and pre-push readiness gates pass.

## Recommended Next Task

`advanced-organization-training-content-subject-scope-readonly-recheck`

The next task should be readonly only unless separately queued and approved.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, route/repository/mapper/validator/model/API runtime/UI changes,
  formal content writes, formal target writes, adding `subject` to `EffectiveAuthorizationContextDto`, public identifier
  value list exposure, PR, and force push remain blocked.
