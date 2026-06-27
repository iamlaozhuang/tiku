# Learner AI Generation Private Result Use Loop Approval

Task id: `learner-ai-generation-private-result-use-loop-approval-2026-06-26`

Decision status: `APPROVAL_PACKAGE_PREPARED_IMPLEMENTATION_STILL_BLOCKED`

This package is docs/state-only. It does not implement learner AI generation runtime, store generated content, connect
to a database, call a Provider, create formal content, or run browser/e2e validation.

## Boundary Decision

Decision: `LEARNER_AI_GENERATION_PRIVATE_RESULT_HISTORY_AND_USE_LOOP_REQUIRED`.

Personal advanced learners and organization advanced employees need a future private generated-result loop with:

- real generated_result storage after an approved Provider or local generation path exists;
- private list/history/detail for the requesting user;
- clear Provider-disabled, Provider-executed, failed, and unavailable states;
- private action for generated questions to enter a non-formal practice/use surface;
- private action for generated AI `paper` output to enter a non-formal paper attempt surface;
- discoverable `AI训练`, `AI出题`, and `AI组卷` entries for eligible advanced roles.

## Visibility Boundary

Personal private scope:

- visible to the owning personal advanced user;
- not visible to organization admins;
- not platform formal content.

Organization employee private scope:

- visible to the owning employee/user in the active organization context;
- organization admins may see only redacted counts, usage, quota, and audit summaries;
- organization admins must not see raw generated content, prompt text, raw Provider output, generated content detail,
  task payloads, or task-list summaries for individual employees.

## Formal Content Boundary

Private learner output must not directly write:

- formal `question`;
- formal `paper`;
- formal `practice`;
- formal `mock_exam`;
- formal `exam_report`;
- formal `mistake_book`.

Any future formal content adoption remains a separate content-admin review path. Any future publish remains a separate
fresh approval path.

## Required Future Task Split

Recommended successors remain blocked until fresh approval:

1. Learner private generated_result/history contract and persistence source TDD.
2. Private question practice/use-loop contract and local source TDD.
3. Private AI `paper` attempt/use-loop contract and local source TDD.
4. Role visibility/denial UX contract and local validation.

## Package-Wide Blocks

- No source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- No DB connection, DB write, migration, seed, or cleanup.
- No Provider call, Provider credential read, Provider configuration, or Cost Calibration.
- No private generated_result write or runtime use execution.
- No formal content, formal learning-record write, publish, student-visible platform content, browser/e2e/dev server,
  staging/prod/deploy/payment/external-service, PR, force push, release readiness, or final Pass.

## Fresh Approval Required

Any source implementation, DB/schema work, Provider execution, private runtime mutation, browser/e2e, formal adoption,
or publish work requires a new task-scoped approval. This package approves only the product boundary and task split.
