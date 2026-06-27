# Acceptance: content-admin review batch retry diff history enhancement package

Task ID: `content-admin-review-batch-retry-diff-history-enhancement-package-2026-06-27`

## Boundary Decision

Decision: `CONTENT_ADMIN_BATCH_RETRY_DIFF_HISTORY_ENHANCEMENTS_DEFERRED_TO_FRESH_APPROVAL_TASKS`.

Batch review, failed retry, result diff, and adoption history are second-layer content-admin review enhancements. They are not required for the already closed single-result traceability UI/source loop, but they are useful follow-ups for operational efficiency and auditability. This package does not implement them.

## Follow-Up Task Queue

1. `content-admin-review-batch-selection-source-contract-tdd-approval-2026-06-27`
   Boundary: define batch candidate selection, per-result validation state, and batch preview contracts only; no batch adoption mutation.
2. `content-admin-review-failed-retry-source-contract-tdd-approval-2026-06-27`
   Boundary: define failed generation retry request/state contracts only; no Provider call, retry mutation, or credential read.
3. `content-admin-review-result-diff-read-model-source-tdd-approval-2026-06-27`
   Boundary: define redacted generated result versus adopted draft diff read-model contracts only; no raw prompt/output/provider payload exposure.
4. `content-admin-review-adoption-history-read-model-source-tdd-approval-2026-06-27`
   Boundary: define read-only adoption history traceability contracts only; no history mutation or publish.
5. `content-admin-review-batch-retry-diff-history-ui-local-validation-approval-2026-06-27`
   Boundary: render the enhancement surfaces after source contracts exist; no browser/e2e/dev server, mutation, Provider, publish, or student-visible runtime.

## Fresh Approval Required

- Any source/test implementation for the follow-up tasks above.
- Any DB schema, migration, seed, DB connection, or DB mutation.
- Any Provider call, Provider credential read, Cost Calibration, retry execution, or batch adoption mutation.
- Any formal publish, student-visible runtime, browser/e2e/dev-server validation, staging/prod/deploy/payment/external service, PR, force push, release readiness, or final Pass.

## Result

Accepted for docs/state enhancement package scope.

This task seeded the follow-up queue and boundaries only. It did not implement source/test/UI, connect to DB, execute retry or batch adoption, call Provider, publish, create student-visible content, run browser/e2e/dev server, touch staging/prod/payment/external service, create PR, force push, claim release readiness, or claim final Pass.
