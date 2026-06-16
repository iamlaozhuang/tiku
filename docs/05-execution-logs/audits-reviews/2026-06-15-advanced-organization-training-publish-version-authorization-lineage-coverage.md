# Audit Review: advanced-organization-training-publish-version-authorization-lineage-coverage

## Scope Reviewed

- Organization training publish-version service write boundary.
- Public published-version DTO exposure boundary.
- Service-local validation for required authorization lineage.
- TDD coverage for success, missing-lineage block, and non-exposure.
- ADR-002 layering boundary after implementation.

## Findings

- The implementation is limited to `src/server/services/organization-training-service.ts` and its unit test.
- `OrganizationTrainingPublishedVersionWrite` now carries internal authorization lineage with `authorizationSource: "org_auth"` and normalized `authorizationPublicId`.
- `normalizePublishMetadata` rejects missing authorization lineage with the existing `invalid_publish_input` blocked result.
- `OrganizationTrainingPublishedVersionDto` remains unchanged and does not expose authorization lineage fields in the public service result.
- Repository, schema, route, UI, provider, dependency, and formal target write surfaces remain untouched.
- ADR-002 layering remains intact because service logic still depends on an injected store boundary and no route/repository/schema work was introduced.

## Decision

APPROVE.

The publish-version service now has RED-first coverage for authorization lineage before any repository/schema/route persistence work.

## needs_recheck

- Durable persistence is still absent by design. Repository/schema/route work must be separately queued and validated before claiming persisted publish-version lineage.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, route/repository/mapper/API runtime/UI changes, takedown,
  copy-to-new-draft, employee answer, analytics, formal content writes, formal target writes, public identifier value
  list exposure, PR, and force push remain blocked.
