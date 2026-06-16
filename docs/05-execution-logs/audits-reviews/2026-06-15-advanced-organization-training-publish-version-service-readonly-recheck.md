# Audit Review: advanced-organization-training-publish-version-service-readonly-recheck

## Scope Reviewed

- Organization training publish-version service boundary.
- Published-version DTO and local store write semantics.
- Publish input validator and model shape.
- Existing service and validator unit coverage.
- ADR-002 layering boundary.
- Blocked gate preservation after the service implementation task.

## Findings

- No implementation was performed by this recheck.
- The current service implementation keeps publish-version work in `src/server/services/organization-training-service.ts` and uses an injected store boundary rather than route, repository, schema, DB, or UI work.
- The published version result is metadata-only from the external DTO perspective: public ids, version number, organization scope snapshot, content metadata, status, and takedown timestamps/reason fields.
- The service store write includes internal owner/quota owner organization metadata and `contentType: "organization_training_version"`.
- The service copies the publish scope snapshot at publish time and existing tests prove later input mutation does not alter the returned snapshot.
- Existing tests assert non-leakage of formal target and provider/raw field names for publish output and store writes.
- ADR-002 layering remains intact because route handlers, repositories, mappers, and database schema are absent from this task.

## Decision

APPROVE WITH NEEDS_RECHECK.

This readonly recheck can close after validation gates pass. The recorded needs_recheck is not a closeout blocker, but it should be handled before any persistence or route work claims publish-version completeness.

## needs_recheck

- `authorizationPublicId` exists in the publish input contract after validation, but published-version write/DTO currently omit an authorization lineage field. Before repository/schema/route work, add a scoped decision or TDD repair to define whether this lineage must be persisted and covered.
- Repository/schema implementation must be separately queued before any actual DB persistence claim.
- Route/UI/employee answer/takedown/copy/analytics behavior remains unimplemented and must not be inferred from this service-layer task.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, source implementation changes, route/repository/mapper/API
  runtime/contract/model/validator/UI changes, takedown, copy-to-new-draft, employee answer, analytics, formal content
  writes, formal target writes, public identifier value list exposure, PR, and force push remain blocked.
