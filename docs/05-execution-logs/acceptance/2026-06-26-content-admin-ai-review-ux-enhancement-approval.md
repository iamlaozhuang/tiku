# Content Admin AI Review UX Enhancement Approval

Task id: `content-admin-ai-review-ux-enhancement-approval-2026-06-26`

Decision status: `REQUIRED_AND_SECOND_LAYER_REVIEW_UX_SCOPED_IMPLEMENTATION_STILL_BLOCKED`

This package is docs/state-only. It does not design UI screens, implement source code, connect to a database, execute
review/adoption, publish content, run browser/e2e validation, or expose raw generated evidence.

## Boundary Decision

Decision: `CONTENT_ADMIN_REVIEW_UX_MIXED_REQUIRED_AND_SECOND_LAYER`.

Necessary for the basic content-admin AI closed loop:

- single-result review detail;
- validation before adopt;
- explicit adopt and reject actions;
- reviewer attribution;
- source generated_result attribution;
- adoption record traceability;
- redacted `audit_log` summary;
- no direct publish.

Second-layer enhancements:

- batch review;
- failed adoption retry;
- generated-result to formal-draft diff view;
- adoption history timeline;
- duplicate/result comparison dashboard;
- multi-item queue bulk operations.

## Formal Draft And Publish Boundary

Content-admin review may only adopt into formal draft surfaces after a future source task is approved. It must not direct
publish. Formal publish and student-visible content remain separate fresh approval gates.

## Evidence Redaction Boundary

Committed evidence may not include:

- raw prompt;
- raw generated output;
- Provider payload;
- raw model response;
- full `question`;
- full `paper`;
- screenshot/trace/DOM content.

Future runtime UI may show generated content to authorized `content_admin` users only after a scoped implementation task
is approved, but that does not allow raw generated content to be committed as evidence.

## Required Future Task Split

Recommended successors remain blocked until fresh approval:

1. Content-admin review UX design-first artifact.
2. Single-result review and traceability source TDD.
3. Adopt/reject action and formal draft traceability source TDD.
4. Optional batch review/retry/diff/history enhancement package.
5. Optional local browser/e2e validation if explicitly approved.

## Package-Wide Blocks

- No source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- No DB connection, DB write, migration, seed, cleanup, review mutation, adoption mutation, batch mutation, or retry.
- No raw prompt, raw generated output, Provider payload, raw model response, screenshot, trace, or DOM evidence.
- No formal publish or student-visible content.
- No browser/e2e/dev server.
- No staging/prod/deploy/payment/external-service, PR, force push, release readiness, or final Pass.

## Fresh Approval Required

Any UX design, source implementation, review/adoption execution, DB/schema work, browser/e2e, batch/retry/diff work,
publish, or runtime validation requires fresh task-scoped approval.
