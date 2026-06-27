# content-admin review UX design and traceability package

## Task

- Task id: `content-admin-review-ux-design-traceability-package-2026-06-27`
- Branch: `codex/content-admin-review-ux-traceability-package-20260627`
- Approval source: current user serial batch request on 2026-06-27.

## Scope

- Prepare a content-admin AI review UX design-first package.
- Create the follow-up task boundary for single-result review traceability source TDD.
- Classify batch review, failed retry, diff view, and richer adoption history as second-layer enhancement work.
- Keep this task limited to docs/state/task-plan/evidence/audit/acceptance package work.

## Requirement Inputs

- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/05-execution-logs/acceptance/2026-06-26-content-admin-ai-review-ux-enhancement-approval.md`

## Design Package Approach

- Treat content-admin review as a content backend workflow for `content_admin`, not a learner or organization admin flow.
- Design the minimum review loop around one generated result at a time.
- Keep adopt/reject explicit and human-reviewed; no direct publish and no student-visible content.
- Keep committed evidence redacted. Runtime UI may later show generated content only to authorized `content_admin` users
  after a scoped implementation approval, but that does not permit raw generated content in evidence.

## Minimum UX Boundary

- Content backend navigation entry for AI draft/review near `question` and `paper` management.
- Single-result review detail with:
  - generated result status and type (`question` or `paper`);
  - validation summary and blocking issues;
  - source generated_result attribution;
  - reviewer attribution and timestamp;
  - explicit adopt and reject actions;
  - formal draft target reference after adoption;
  - redacted `audit_log` summary;
  - direct publish blocked state.
- States: loading, empty, permission denied, unavailable, validation failed, adopt success, reject success, and adoption
  blocked.

## Single-Result Traceability Source Task Boundary

Follow-up task: `content-admin-review-single-result-traceability-source-tdd-approval-2026-06-27`.

The future source TDD task should define a redacted local contract for one generated result review record:

- source generated_result reference;
- review status and validation status;
- reviewer admin attribution;
- adopt/reject action attribution;
- formal draft target reference when adoption succeeds;
- redacted audit summary;
- direct publish blocked flag.

The future source task must not execute Provider calls, publish, browser/e2e, staging/prod, payment, external service, or
Cost Calibration. Any DB/schema/adoption mutation needs its own fresh approval and exact allowed files.

## Enhancement Boundary

Follow-up enhancement task: `content-admin-review-batch-retry-diff-history-enhancement-package-2026-06-27`.

Second-layer items:

- batch review;
- failed adoption retry;
- generated-result to formal-draft diff view;
- richer adoption history timeline;
- duplicate/result comparison dashboard;
- multi-item queue bulk operations.

## Explicit Non-Scope

- No source/test/e2e/script/package/lockfile/schema/drizzle/env file edits.
- No DB connection, DB mutation, migration, seed, Provider call, Provider credential read, Cost Calibration, review/adopt
  mutation, publish, student-visible runtime, browser/e2e/dev server, staging/prod/deploy, payment, external service, PR,
  force push, release readiness, or final Pass claim.
- No raw prompt, raw generated output, Provider payload, full question, full paper, screenshot, trace, or DOM evidence.

## Validation Plan

1. Scoped Prettier write/check over changed docs/state files.
2. `git diff --check`.
3. Module Run v2 pre-commit hardening.
4. `Get-TikuProjectStatus.ps1`.
5. Module Run v2 pre-push readiness.
