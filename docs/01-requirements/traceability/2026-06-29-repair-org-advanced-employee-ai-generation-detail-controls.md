# Repair Org Advanced Employee AI Generation Detail Controls Traceability

- Task id: `repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`
- Branch: `codex/org-advanced-employee-ai-detail-controls-20260629`
- Status: implemented
- Date: `2026-06-29`

## Source Finding

- Finding id: `ORG-ADV-EMP-AI-001`
- Source evidence: `docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-workflow.md`
- Observed: `org_advanced_employee` can see `/ai-generation`, but `AI出题` and `AI组卷` do not expose learner detail
  workflow controls before request submission.

## Mandatory Checklist Mapping

Source checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.

Mapped rows:

- `org_advanced_employee.employee_ai_question_generation`
- `org_advanced_employee.employee_ai_paper_generation`

## Required Repair Evidence

- Learner `AI出题` surface exposes status/count evidence for `profession`, `level`, `subject`, `knowledge_node`,
  question type, count, difficulty, and learning goal controls where implemented.
- Learner `AI组卷` surface exposes status/count evidence for `profession`, `level`, `subject`, question count,
  question-type distribution, `knowledge_node` coverage, difficulty, time target, and learning goal controls where
  implemented.
- No Provider execution, prompt/payload/raw AI IO, complete generated content, direct formal content write, DB/schema
  change, dependency change, final Pass, or Cost Calibration action occurs.

## Repair Result

| Row                                                     | Result | Evidence summary                                                                                                                         |
| ------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `org_advanced_employee.employee_ai_question_generation` | pass   | `AI出题参数` group visible with profession, level, subject, knowledge_node, question type, count, difficulty, and learning goal controls |
| `org_advanced_employee.employee_ai_paper_generation`    | pass   | `AI组卷参数` group visible with profession, level, subject, distribution, coverage, difficulty, time target, and learning goal controls  |
