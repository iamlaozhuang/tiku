# 2026-07-05 AI Generation Closed Loop Target Alignment Plan

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`

## Requirement Decision Map

- Current user instruction defines the target closed loop as generated content entering stable review, publish, practice, and statistics paths.
- Existing SSOT forbids automatic formal writes from AI generation.
- This task will reconcile those by defining explicit, governed post-generation actions per role.

## Requirement Mapping

- `content_admin`: content backend AI generation to content review/formal draft adoption.
- `org_advanced_admin`: organization AI generation to organization training draft/review/publish/statistics.
- `personal_advanced_student`: learner AI generation to persisted private AI training attempt/practice and personal statistics.
- `org_advanced_employee`: learner AI generation in organization context to persisted employee AI training attempt/practice and allowed aggregate summaries.

## Evidence-Only Sources

- Full unit recovery evidence from 2026-07-05 task chain.
- Prior AI generation learning session and organization AI training lineage evidence.

## Conflict Check

- No implementation starts in this task.
- If the new closed-loop target would require automatic writes to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`, implementation must stop. The acceptable path is explicit review/adoption/publish or persisted AI training domain writes.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown` for changed docs.
- `git diff --check`.
- Module Run v2 pre-commit hardening.
