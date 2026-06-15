# Audit Review: advanced-organization-training-subject-authorization-context-boundary-readonly-audit

## Scope Reviewed

- Advanced MVP subject authorization requirement.
- Advanced authorization context implementation plan.
- Advanced organization training implementation plan.
- Current effective authorization context contract.
- Current organization training manual draft service boundary.
- Current organization training DTO and validator surfaces.
- Recent readonly recheck and level mismatch coverage evidence.

## Findings

- The current implementation has no `subject` field in `EffectiveAuthorizationContextDto`.
- Organization training draft and published version DTOs carry `subject`, and the organization training plan treats
  `profession / level / subject` as authorized content scope.
- Current manual draft creation can only enforce authorization scope by `profession` and `level`; it preserves `subject`
  as metadata but does not enforce subject-level authorization matching.
- This is not a blocking issue for the already merged narrow manual draft test coverage, but it is a blocking decision
  for broader organization training lifecycle expansion.
- ADR-002 layering remains intact. Any future change must be a scoped contract/service/route/validator task, not a
  silent service-only edit.

## Decision

APPROVE WITH NEEDS_RECHECK.

The readonly audit is acceptable if declared validation and closeout readiness gates pass. The subject authorization
boundary remains unresolved for future implementation.

## Required Follow-Up

Queue `advanced-organization-training-subject-authorization-context-contract-decision` before broader organization
training lifecycle work. That task should decide whether to add `subject` to `EffectiveAuthorizationContextDto` and the
associated service/route/validator test surfaces, or explicitly document that first-release organization training uses
`profession/level` authorization with metadata-only `subject`.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation, route/service/repository/mapper/API
  runtime/contract/model/validator/UI changes, formal content writes, formal target writes, public identifier value list
  exposure, PR, and force push remain blocked.
