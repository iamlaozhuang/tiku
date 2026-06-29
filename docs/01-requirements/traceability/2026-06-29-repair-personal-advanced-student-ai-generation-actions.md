# Repair Personal Advanced Student AI Generation Actions

## Status

- Task id: `repair-personal-advanced-student-ai-generation-actions-2026-06-29`
- Status: `in_progress`
- Branch: `codex/repair-personal-advanced-ai-generation-actions-20260629`
- Source blocker: `full-acceptance-personal-advanced-student-workflow-2026-06-29`
- Runtime claim: scoped localhost browser rerun passed for the repaired action surface.
- Final Pass claim: none.

## Scope

Repair the scoped `personal_advanced_student` learner AI workflow so the visible AI training surface has safe local
actions for AI question generation, AI paper generation, and generated-content practice/feedback affordances without
Provider execution, DB access, dependency change, schema/migration/seed, or sensitive evidence.

## Required Rows

| Checklist row                                                   | Repair expectation                                                                                                             | Status |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------ |
| `personal_advanced_student.learner_ai_question_generation`      | Add safe generate/retry/result affordance around existing question controls without calling Provider.                          | pass   |
| `personal_advanced_student.learner_ai_paper_generation`         | Add safe generate/retry/result affordance, include `paper_section`/structure cue, and keep formal `paper` writes out of scope. | pass   |
| `personal_advanced_student.generated_content_practice_feedback` | Add safe generated-content practice/feedback affordance with redacted summary only.                                            | pass   |

## Requirement Mapping Result

The repair maps the owner-facing personal advanced learner AI rows to the existing shared
`StudentPersonalAiGenerationPage` instead of adding a role-specific duplicate. The visible workflow now exposes:

- AI question generation as an explicit local action with retry.
- AI paper generation as an explicit local action with a Chinese `paper_section` structure cue.
- Local generated-content practice, answer-submit, and learning-feedback affordances after the local contract is
  accepted.

All mapped behavior remains local-contract-only and does not claim formal `question`, formal `paper`, Provider execution,
release readiness, or final Pass.

## Boundaries

- No Provider call, Provider configuration, Prompt payload, raw AI input/output, or complete generated content.
- No direct DB access or mutation.
- No package/lockfile, schema, migration, seed, or dependency changes.
- No staging/prod/deploy, PR, force-push, release readiness, final Pass, or Cost Calibration Gate.
