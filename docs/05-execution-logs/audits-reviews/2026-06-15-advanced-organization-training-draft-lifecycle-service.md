# Audit Review: advanced-organization-training-draft-lifecycle-service

## Scope Reviewed

- Organization training service-only manual draft creation implementation.
- Organization training service unit tests.
- Existing organization training model, DTO contract, and validator scaffold.
- Effective authorization context contract and advanced organization capability flags.
- ADR-002 layering expectations.
- Task queue allowedFiles/blockedFiles and blocked gates.

## Findings

- The implementation stays in `src/server/services/organization-training-service.ts` and uses an injected
  service-local `OrganizationTrainingDraftStore` port.
- The test covers successful manual draft creation, advanced edition blocking, non-`org_auth` blocking, missing
  `canCreateOrganizationTraining` blocking, organization visibility/ownership blocking, `profession/level` mismatch
  blocking, and metadata-only non-leakage assertions.
- The service composes `OrganizationTrainingDraftDto` without numeric ids, provider fields, raw prompt/raw answer
  fields, or formal target references.
- No repository, DB persistence, route/API runtime, UI, schema, migration, provider, quota/cost, package, lockfile, or
  dependency work was added.
- ADR-002 layering remains intact for this step: service owns business checks, while persistence remains behind an
  injected port and no repository implementation is introduced.

## needs_recheck

- `EffectiveAuthorizationContextDto` does not include `subject`. The service can preserve the selected `subject` in the
  metadata DTO, but cannot verify subject-level authorization matching without a later contract decision.

## Decision

APPROVE WITH NEEDS_RECHECK.

The task is acceptable as a narrow service-only TDD implementation. A follow-up readonly recheck should review the
subject authorization boundary before expanding organization training service work.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, repository/mapper/route/API runtime/UI changes, formal content
  writes, formal adoption target writes, public identifier value list exposure, PR, and force push remained blocked.
