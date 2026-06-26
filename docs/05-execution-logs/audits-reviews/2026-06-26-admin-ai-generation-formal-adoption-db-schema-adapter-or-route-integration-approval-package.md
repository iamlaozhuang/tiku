# Admin AI generation formal adoption DB/schema adapter or route integration approval package audit review

Task id: `admin-ai-generation-formal-adoption-db-schema-adapter-or-route-integration-approval-package-2026-06-26`

## Review Decision

Status: `APPROVE_APPROVAL_PACKAGE_CLOSEOUT_PENDING_VALIDATION`.

This audit reviews a docs/state approval package only. It does not approve current schema edits, migration execution, DB connection, route integration, Provider use, or formal question/paper draft writes.

## Requirement Mapping

- Formal content separation remains preserved: generated-result history is not converted into formal `question` or `paper` data.
- The chosen future landing zone is a companion table so adoption metadata does not pollute redacted generated-result history.
- Route layering remains protected: future routes must call a service/repository/adapter boundary, not formal content repositories directly.
- Future local DB and route smoke execution remains subject to separate approval.

## Findings

- The package correctly chooses `admin_ai_generation_formal_adoption` as a future companion table instead of extending `admin_ai_generation_result`.
- The package rejects creating a new backend AI task table because the existing task plus admin metadata/result model already covers lifecycle and redacted history.
- The package keeps formal draft adapter integration blocked until reviewed structured content and a narrow adapter are separately approved.
- The package states that current redacted snapshot/digest/masked preview data is not enough to create usable formal drafts.
- The package records a serial execution order from schema/adapter TDD to migration approval/execution, route integration, route smoke approval, and later formal draft adapter TDD.

## Residual Risk

- A future schema task must still decide exact public-id reference constraints and Drizzle metadata details.
- A future route task must define the admin formal adoption API path and response contract.
- Actual formal draft creation remains blocked because the reviewed structured content source is not yet approved.
- Organization-scoped adoption remains out of scope and needs its own decision package.

## Blocked Gates

- schema/migration edit or execution in this task
- live DB connection or mutation
- route integration or route smoke
- formal question/paper draft creation
- organization-scoped adoption
- Provider/model call or credential/env access
- staging/prod/deploy/payment/external service
- Cost Calibration, release readiness, and final Pass

## Final Closeout

Approved for local closeout after docs/state formatting, diff check, Module Run v2 pre-commit hardening, and pre-push readiness pass.
