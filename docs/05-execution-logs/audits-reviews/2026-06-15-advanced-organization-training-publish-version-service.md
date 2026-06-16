# Audit Review: advanced-organization-training-publish-version-service

## Scope Reviewed

- Organization training publish-version service behavior.
- Existing organization training publish input model and validator contract.
- Existing published-version DTO contract.
- Existing manual draft service authorization and organization isolation posture.
- ADR-002 layering boundary.
- Task queue allowed and blocked files.

## Findings

- The implementation is limited to `src/server/services/organization-training-service.ts` and
  `src/server/services/organization-training-service.test.ts`, plus durable state and execution log files.
- The service consumes the existing `OrganizationTrainingPublishInput` shape and does not edit model, contract,
  validator, route, repository, mapper, schema, DB, UI, package, lockfile, script, or e2e surfaces.
- The publish method composes an `organization_training_version` write with owner/quota owner organization metadata and
  a public organization scope snapshot captured at publish time.
- The returned DTO is published-version metadata only: `status` is `published`, takedown fields are `null`, and the
  publish scope snapshot is copied instead of sharing the mutable input list.
- Capability blocks cover non-advanced edition, non-`org_auth`, missing organization training capability, and owner
  organization absent from the publish scope snapshot.
- Service tests cover the RED missing API failure, success, blocked capability/scope states, metadata immutability, and
  non-leakage of formal target/provider/raw field names.
- ADR-002 layering remains intact: route/API work is absent, service orchestration stays in service, and persistence is
  represented only as an injected local store boundary for unit testing.

## Decision

APPROVE.

The task may close if PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness pass after evidence is updated
with their final results.

## needs_recheck

- Repository/schema implementation must be separately queued before any actual DB persistence claim.
- Route/UI/employee answer/takedown/copy/analytics behavior remains unimplemented and must not be inferred from this
  service-layer task.
- Future persistence mapping should recheck that public identifiers remain DTO-only and no row/private data or formal
  target identifiers leak into evidence or admin surfaces.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, route/repository/mapper/API runtime/contract/model/validator/UI
  changes, takedown, copy-to-new-draft, employee answer, analytics, formal content writes, formal target writes, public
  identifier value list exposure, PR, and force push remain blocked.
