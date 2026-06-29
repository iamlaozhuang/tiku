# Task Plan: Repair Personal Advanced Student AI Generation Actions

## Status

- Task id: `repair-personal-advanced-student-ai-generation-actions-2026-06-29`
- Status: `in_progress`
- Branch: `codex/repair-personal-advanced-ai-generation-actions-20260629`
- Created at: `2026-06-29T03:56:17-07:00`

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-personal-advanced-student-workflow.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-repair-personal-advanced-student-ai-generation-actions.md`
- `docs/05-execution-logs/task-plans/2026-06-29-repair-personal-advanced-student-ai-generation-actions.md`
- `docs/05-execution-logs/evidence/2026-06-29-repair-personal-advanced-student-ai-generation-actions.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-repair-personal-advanced-student-ai-generation-actions.md`
- `docs/05-execution-logs/acceptance/2026-06-29-repair-personal-advanced-student-ai-generation-actions.md`
- `src/app/(student)/ai-generation/page.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `tests/unit/student-personal-ai-generation-ui.test.ts`

## Blocked Gates

No DB, Provider, package/lockfile, schema/migration/seed, dependency, staging/prod/deploy, PR, force-push, release
readiness, final Pass, Cost Calibration Gate, or sensitive evidence work.

## TDD Steps

1. Read the scoped page and focused unit test.
2. Add failing unit expectations for safe generate/retry/result/practice-feedback controls and `paper_section` cue.
3. Implement the smallest UI-only repair using existing component patterns.
4. Run focused unit test.
5. Run redacted browser rerun for the personal advanced AI page.
6. Run scoped formatting, `git diff --check`, Module Run v2 closeout checks, then commit/merge/push/cleanup.

## Design Constraints

- Reuse the existing personal AI generation component and do not create a role-specific duplicate.
- Use safe local mock/contract affordances only; do not invoke Provider or persist generated content.
- Do not display or record complete generated question/paper content in evidence.
