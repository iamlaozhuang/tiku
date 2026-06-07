# Advanced Edition Organization Training Requirements

## Purpose

Define how organization admins create organization training and how employees answer it.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`

## Scope

- Organization admin creates organization training inside valid `org_auth` and organization scope.
- Employees answer organization training assigned to their organization context.
- Organization training content remains separate from formal `paper` and formal `mock_exam` flows.
- Organization training operations produce governed summaries and may write `audit_log` where required.

## Acceptance Boundaries

- Organization admins can manage training for their organization scope.
- Employees can answer assigned training.
- Employee answers are not copied into formal `answer_record` for formal `practice` or `mock_exam` unless a later approved formal flow exists.
- Organization training does not publish formal `paper`.

## Non-Goals

- No one-click adoption of organization training into formal `question` or `paper`.
- No employee subjective answer text export.
- No staging/prod/cloud/deploy work.

Cost Calibration Gate remains blocked pending fresh explicit approval.
