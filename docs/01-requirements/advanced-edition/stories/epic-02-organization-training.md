# Epic 02 Organization Training

## Actor

Organization admin with valid `org_auth`.

## Goal

Create organization training for employees inside the authorized organization scope.

## Acceptance Scenario

1. Organization admin enters the organization training management surface.
2. The system checks organization scope and effective `authorization`.
3. The admin creates organization training content.
4. Employees in scope can answer the assigned training.
5. Training content remains separate from formal `paper` and formal `mock_exam` flows.

## Data Boundary

- Organization training must not publish formal `paper`.
- Training answers must not become formal `practice` or `mock_exam` `answer_record` without a later approved formal flow.
- Governed admin operations should be traceable through `audit_log` where required.

## Source Links

- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
