# 2026-07-08 Organization Training Create Source UX

## Scope

Stage 2 of the approved organization training UX repair plan.

Fix only the organization advanced admin enterprise-training creation surface:

- keep the list as the default first surface;
- expand the four-step creation wizard only after `新建企业训练`;
- distinguish `题目训练` and `试卷训练` in the creation flow;
- distinguish organization AI handoff as `AI出题结果` and `AI组卷结果`;
- provide safe links back to organization `AI出题` and `AI组卷` entries;
- keep the first-release source boundary: platform paper snapshot, organization AI result, and manual grouping/manual questions.

Out of scope:

- no API DTO, service, repository, DB, schema, migration, seed, fixture, or Provider changes;
- no package or lockfile changes;
- no formal `question`, formal `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` writes;
- no organization AI generation page rewrite;
- no employee answer flow rewrite;
- no staging/prod/deploy/env/secret/Cost Calibration work.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`

## Source Mapping

- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `tests/unit/organization-training-admin-entry-surface.test.ts`

## Implementation Plan

1. Add failing unit tests for collapsed creation wizard and source/type distinction.
2. Add UI-only training shape state with `题目训练` and `试卷训练`.
3. Add UI-only AI result kind state with `AI出题结果` and `AI组卷结果`.
4. Wire source choices to sensible shape defaults without changing API payloads.
5. Keep existing create, source binding, copy, publish, and takedown API calls unchanged.
6. Run targeted tests, adjacent route tests, lint, typecheck, touched-file prettier check, and `git diff --check`.

## Risk Controls

- UI shape selection is presentational in this stage and does not create a new persistence contract.
- Organization AI handoff links point only to existing organization AI pages.
- Published/formal content boundaries remain unchanged.
- Evidence remains metadata-only and redacted.
