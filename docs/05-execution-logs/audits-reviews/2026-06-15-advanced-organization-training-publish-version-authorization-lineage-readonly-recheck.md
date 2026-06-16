# Audit Review: advanced-organization-training-publish-version-authorization-lineage-readonly-recheck

## Scope Reviewed

- Organization training publish-version authorization lineage after the TDD coverage task.
- Service write boundary and injected store contract.
- Public published-version DTO exposure boundary.
- Publish input model and validator lineage requirements.
- Existing service and validator unit coverage.
- ADR-002 layering boundary.
- Blocked gate preservation before persistence work.

## Findings

- No product implementation was performed by this recheck.
- `OrganizationTrainingPublishedVersionWrite` carries internal authorization lineage with `authorizationSource: "org_auth"` and a normalized `authorizationPublicId`.
- `normalizePublishMetadata` rejects missing authorization lineage with `invalid_publish_input`, preventing a publish-version write without lineage.
- `OrganizationTrainingPublishedVersionDto` remains unchanged and does not expose authorization lineage fields.
- Service tests cover the internal write lineage and public DTO non-exposure decision.
- Validator/model contracts remain consistent: publish input includes `authorizationPublicId`, and capability context stays constrained to advanced `org_auth` training creation.
- ADR-002 layering remains intact because route handlers, repositories, mappers, and database schema are still outside this publish-version persistence path.

## Decision

APPROVE WITH NEEDS_RECHECK.

The service-local authorization lineage decision is consistent and covered. The remaining needs_recheck is persistence-specific and should be handled by a separately approved repository/schema/route task.

## needs_recheck

- Durable persistence of publish-version lineage remains absent by design.
- Next implementation should seed or plan repository/schema/route persistence only after explicit scope and schema/migration approval are recorded.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation changes, route/repository/mapper/API
  runtime/UI changes, takedown, copy-to-new-draft, employee answer, analytics, formal content writes, formal target writes,
  public identifier value list exposure, PR, and force push remain blocked.
