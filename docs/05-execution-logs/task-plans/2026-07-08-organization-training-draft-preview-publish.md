# 2026-07-08 Organization Training Draft Preview Publish

## Task

- Task id: `organization-training-draft-preview-publish-2026-07-08`
- Branch: `codex/org-training-draft-preview-publish`
- Scope: stage 4 of the approved organization training repair plan.
- Goal: replace the admin publish path's raw JSON snapshot input with a structured draft preview, employee-view preview, and explicit publish blockers.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/index.html`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Requirement Mapping

- `CT-REQ-016`: enterprise training draft preview and publish flow must be usable by organization admins without technical payload entry.
- `CT-REQ-024` and `CT-REQ-048`: organization AI outputs may hand off to organization-training drafts and must not create formal platform content directly.
- Advanced-edition module 04: organization training versions stay in the enterprise training domain and are visible to employees only after publish.
- Advanced-edition module 08: organization AI question and paper generation hand off into organization training without changing Provider execution.
- Batch 2 org-admin workspace baseline: publish flow must present a clear review and employee-visible preview before publication.

## Adopted Existing Work

- Stage 1 list management is adopted after current focused tests passed.
- Stage 2 source/content read model and pagination are adopted after current focused tests passed.
- Stage 3 create-entry source and shape split is adopted after current focused tests passed.
- Existing backend publish service already blocks `evidence_status = none`, requires explicit confirmation for `weak`, and writes organization-training versions without formal `practice`, `mock_exam`, `exam_report`, or `mistake_book` writes.
- Existing employee page already loads published enterprise training, saves draft answers, submits, and loads readonly result summaries. This task will not rewrite employee flow.

## Current Gap

The admin publish path still asks the organization admin to paste `题目快照` JSON. That fails the confirmed non-technical four-step wizard and publish-preview requirement even though backend gates already exist.

## Implementation Plan

1. Add a failing UI test that proves the admin publish flow no longer exposes the raw JSON textarea and instead shows structured question preview fields, evidence status, collapsed answer/analysis review, employee-view preview, and publish blockers.
2. Replace `PublishFormValues.questionSnapshotJson` with structured question snapshot state in `AdminOrganizationTrainingPage`.
3. Generate public question/option references from UI state instead of asking admins to type identifiers.
4. Compute question count, total score, and question type summary from structured preview state.
5. Block publish in the UI when any question has `evidenceStatus = none`.
6. Require explicit weak-evidence confirmation only when at least one question has `evidenceStatus = weak`.
7. Keep the existing API route and service contract; do not change DB/schema/migration/seed/fixture or Provider code.

## Boundary Guard

- No package or lockfile changes.
- No dependency changes.
- No DB/schema/migration/seed/fixture changes.
- No direct DB connection or destructive DB operation.
- No Provider call or Provider configuration changes.
- No staging/prod/deploy/Cost Calibration.
- No browser runtime unless separately needed; unit/source validation is sufficient for this branch.
- No raw credentials, session, cookie, token, localStorage, env value, DB URL, raw DB rows, internal ids, Provider payloads, raw prompt, raw AI output, full question, full paper, or material content in evidence.

## Validation Plan

- Red/green targeted UI test: `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Adoption and adjacent regression:
  - `npm.cmd exec -- vitest run tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts --reporter=dot`
  - `npm.cmd exec -- vitest run src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts --reporter=dot`
  - `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts --reporter=dot`
- Gates:
  - `npm.cmd run lint`
  - `npm.cmd run typecheck`
  - scoped `prettier --check`
  - `git diff --check`
  - `npm.cmd run test:unit -- --reporter=dot`
  - Module Run v2 pre-commit and pre-push readiness scripts.

## Adversarial Review Checklist

- Standard organization admin remains unavailable for enterprise training.
- Advanced organization admin publish path stays inside organization-training domain.
- Published versions remain immutable and are only view/copy/takedown from the list.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` write is introduced.
- UI no longer asks users to paste raw JSON or internal identifiers for publish.
- Evidence status gates are present in UI and still enforced by service tests.
- Employee-side existing answer loop remains adopted, not rewritten.
