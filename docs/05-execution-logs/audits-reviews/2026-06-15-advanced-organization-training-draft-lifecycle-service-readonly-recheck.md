# Audit Review: advanced-organization-training-draft-lifecycle-service-readonly-recheck

## Scope Reviewed

- Organization training manual draft service boundary.
- Organization training service tests.
- Effective authorization context contract.
- Organization training DTO contract, model constants, validator, and validator tests.
- Advanced organization training implementation plan and ADR-002 layering.
- Prior implementation and seeding evidence/audits.

## Findings

- Current narrow service boundary is acceptable: it stays in the service layer, uses existing contracts/models/validators,
  and has no direct DB, repository implementation, route/API runtime, UI, schema, migration, provider, quota/cost,
  package, lockfile, or dependency work.
- Metadata-only manual draft semantics are accurately represented for the current path. Counts are zero, evidence status
  is `none`, validation status is `needs_review`, retention status is `active`, and optional description/expires fields
  use `null`.
- Formal target write remains blocked. The service and scoped tests do not write or expose formal content target fields
  for `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record`.
- ADR-002 remains intact for the current step. Future persistence must move behind `src/server/repositories` before any
  real DB-backed route/UI expansion.
- `EffectiveAuthorizationContextDto` still has no `subject`, so the service cannot claim subject-level authorization
  matching. It can only preserve the selected draft `subject`.
- The service checks `profession/level` mismatch, but the current test suite only explicitly exercises profession
  mismatch. Level mismatch deserves a narrow TDD coverage follow-up.

## Decision

APPROVE WITH NEEDS_RECHECK.

The current readonly recheck finds no blocking issue for the already merged narrow service-only manual draft behavior.
Before expanding lifecycle implementation, queue a narrow TDD test coverage task for level mismatch and preserve the
subject authorization contract decision as a follow-up boundary.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation, route/service/repository/mapper/API
  runtime/UI changes, formal content writes, formal target writes, public identifier value list exposure, PR, and force
  push remain blocked.
