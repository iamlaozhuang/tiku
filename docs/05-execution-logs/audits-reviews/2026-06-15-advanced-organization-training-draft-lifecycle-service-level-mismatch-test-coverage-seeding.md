# Audit Review: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding

## Scope Reviewed

- Previous readonly recheck evidence and audit.
- Service and test anchors for authorization content scope mismatch.
- Durable state and task queue posture.
- ADR-002 layering boundary for a docs/state-only queue seed.

## Findings

- The previous readonly recheck closed with `pass_with_needs_recheck`.
- The actionable near-term gap is narrow and test-only: add an explicit `level` mismatch test for manual draft creation
  returning `authorization_scope_mismatch`.
- The appropriate next step is a TDD test coverage task, not a service logic change.
- This seed preserves the broader subject authorization context decision as a separate blocked/recheck boundary.

## Decision

APPROVE PENDING VALIDATION.

This seeding task is acceptable if the declared local validation and closeout readiness gates pass.

## Required Follow-Up

`advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage` should be claimed only after fresh
user approval. It should add the narrow failing test first, then make the smallest necessary change. Expected
implementation is test-only unless the RED result reveals a real behavior gap.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, provider/model calls, provider payloads, raw prompts, raw answers, quota/cost,
  Cost Calibration Gate, dev server, Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service,
  schema/drizzle/scripts/package/lockfile/dependencies, product source implementation in this seeding task,
  route/service/repository/mapper/API runtime/UI changes, formal content writes, formal target writes, public identifier
  value list exposure, PR, and force push remain blocked.
