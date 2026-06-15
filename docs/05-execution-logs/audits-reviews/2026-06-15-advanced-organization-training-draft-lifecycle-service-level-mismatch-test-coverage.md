# Audit Review: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage

## Scope Reviewed

- `src/server/services/organization-training-service.test.ts`
- Read-only anchors in `src/server/services/organization-training-service.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- Previous readonly recheck evidence and audit
- Seeding task evidence and audit
- ADR-002 layering boundary

## Findings

- The final product diff is test-only and adds explicit `level` mismatch coverage for manual draft creation.
- The test asserts `authorization_scope_mismatch` and verifies no draft write occurs when authorization `level` does not
  match draft `level`.
- The service file remains unchanged and read-only in this task.
- ADR-002 layering remains intact: no route, repository, mapper, contract, model, validator, schema, DB, provider, or UI
  expansion occurred.
- Formal target write remains blocked.
- The existing `subject` authorization context gap remains outside this task.

## Decision

APPROVE.

The declared local validation and closeout readiness gates passed.

## Required Follow-Up

Before broader organization training draft lifecycle expansion, decide whether `subject` should remain outside
`EffectiveAuthorizationContextDto` or requires a later contract task with explicit approval.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, service behavior changes, route/repository/mapper/API runtime/UI
  changes, contract/model/validator changes, formal content writes, formal target writes, public identifier value list
  exposure, PR, and force push remain blocked.
