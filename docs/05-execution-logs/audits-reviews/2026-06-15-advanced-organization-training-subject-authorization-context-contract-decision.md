# Audit Review: advanced-organization-training-subject-authorization-context-contract-decision

## Scope Reviewed

- Advanced authorization context contract and mapper/service behavior.
- Current authorization source model shape.
- Advanced organization training subject/content scope expectations.
- AI generation task content/request metadata precedent.
- ADR-002 layering boundary.
- Previous subject authorization boundary readonly audit.

## Findings

- `EffectiveAuthorizationContextDto` represents source-backed effective authorization. Its current source-backed
  dimensions are `profession` and `level`.
- `subject` is not present on current `redeem_code`, `personal_auth`, or `org_auth` sources.
- Organization training and AI generation still need `subject` as a mandatory selected content/request dimension.
- Adding `subject` to `EffectiveAuthorizationContextDto` now would conflate source-backed authorization state with
  selected content filtering and would overstate what current authorization sources prove.
- The correct next boundary is a narrow content/request scope contract for organization training, not a direct
  `EffectiveAuthorizationContextDto` field addition.

## Decision

APPROVE.

Do not add `subject` to `EffectiveAuthorizationContextDto` under the current authorization model. Preserve
`EffectiveAuthorizationContextDto` as `profession/level` source-backed authorization context. Require future
organization training lifecycle work to carry `subject` through a separate selected content/request scope and to apply it
to validation, content filtering, and persisted organization training metadata.

## Required Follow-Up

Queue `advanced-organization-training-content-subject-scope-contract-seeding`.

That seed should prepare a TDD implementation task to cover:

- selected content/request scope includes `profession`, `level`, and `subject`;
- authorization context still proves `profession/level`;
- `subject` is validated and applied as content scope;
- service/route/repository/UI work remains blocked until explicitly queued;
- no formal content write, schema, DB, provider, package, lockfile, e2e, dev-server, staging/prod/cloud/deploy, payment,
  external-service, PR, or force-push work.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation, route/service/repository/mapper/API
  runtime/contract/model/validator/UI changes, formal content writes, formal target writes, public identifier value list
  exposure, PR, and force push remain blocked.
