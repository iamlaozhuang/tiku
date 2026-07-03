# Epic 03 Employee Answer Statistics

## Actor

Organization admin reviewing employee organization training summaries.

## Goal

See organization training answer statistics without exposing unrelated personal content or sensitive raw answer text.

## Acceptance Scenario

1. The admin opens organization analytics for a training activity.
2. The system checks organization scope and role.
3. The admin sees counts, completion status, score summary, and timing summary.
4. The system hides employee subjective answer text and unrelated personal AI content.
5. The statistics remain separate from formal `exam_report` and formal `mistake_book`.
6. The admin can switch between organization overview, training detail, and employee summary.
7. Date filters support 7 days, 30 days, 90 days, and custom range; default is 30 days.
8. Small samples below 5 people show a warning.
9. Knowledge weak-point summaries can be shown without exposing raw answers.
10. Enterprise AI quota consumption summary is not shown to organization admins.

## Data Boundary

- Organization analytics must use summaries.
- Employee subjective answer text is not exported or shown in ordinary admin summary views.
- Analytics must not write formal `exam_report` or formal `mistake_book`.
- First release has no analytics export.

## Source Links

- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
