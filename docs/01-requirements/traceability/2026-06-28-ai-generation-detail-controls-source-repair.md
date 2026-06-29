# AI Generation Detail Controls Source Repair

## Status

- Date: 2026-06-28
- Task id: `ai-generation-detail-controls-source-repair-2026-06-28`
- Scope: source and focused test repair for admin AI question and AI paper generation detail controls.
- Runtime claim: unit/source validation passed; browser role rerun remains required.
- Implementation claim: shared admin AI generation detail controls added.

## Mandatory Checklist Gate

This task is governed by:

- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`

Relevant rows:

- `content_admin.content_ai_question_generation`
- `content_admin.content_ai_paper_generation`
- `org_advanced_admin.organization_ai_question_generation`
- `org_advanced_admin.organization_ai_paper_generation`

The durable goal remains incomplete after this task until browser role reruns prove the controls in the required role
sessions and all remaining owner-facing checklist rows pass.

## Repair Target

Prior evidence recorded:

- Content AI question generation route lacked visible `profession`, `level`, `subject`, question type, quantity,
  difficulty, and draft/review boundary controls.
- Content AI paper generation route lacked visible `profession`, `level`, `subject`, paper type, `paper_section`
  structure, question-type distribution, quantity or total score, difficulty, knowledge coverage, and draft/review
  boundary controls.

This repair adds visible, non-submitting planning controls to the shared admin AI generation entry surface. It does not
execute Provider calls, submit generation requests, write DB records, or adopt formal `question`/`paper` content.

Implemented result:

- AI question generation now exposes local planning controls for profession, level, subject, knowledge node, question
  type, count, difficulty, and learning objective.
- AI paper generation now exposes local planning controls for profession, level, subject, question count,
  question-type distribution, difficulty, knowledge coverage, `paper_section` structure, and objective.
- Focused unit tests verify content AI question and organization AI paper surfaces before any Provider execution.

## Boundaries

Allowed:

- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- task-scoped governance, plan, evidence, audit, and acceptance files.

Blocked:

- Provider call/configuration/credential, prompts, raw AI input/output.
- DB access, schema, migration, seed, `drizzle-kit push`.
- package or lockfile changes.
- staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration.
- credentials, cookies, tokens, sessions, localStorage, Authorization headers, raw DOM, screenshots, traces, raw DB rows,
  PII, plaintext `redeem_code`, or complete generated/content material in evidence.

## Acceptance Criteria

- AI question generation surface exposes `profession`, `level`, `subject`, `knowledge_node`, question type, count,
  difficulty or learning objective, and draft/review boundary controls.
- AI paper generation surface exposes `profession`, `level`, `subject`, question count, question-type distribution,
  difficulty, `knowledge_node` coverage, `paper_section` structure, objective, and draft/review boundary controls.
- Focused unit tests prove the visible control categories for content and organization contexts.
- Full unit baseline remains green.
- Evidence is redacted to role/route/control-category/status/count summaries.
