# Advanced Edition Organization Analytics Requirements

## Purpose

Define the summary analytics visible to eligible `org_advanced_admin` users for organization training.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`

## Scope

- Show organization training participation and answer statistics.
- Show formal `practice` / `mock_exam` aggregate signals only when derived from the employee's selected organization
  authorization context and only in a separate labeled section.
- Use summary values such as counts, completion state, score summary, and time summary.
- Keep employee personal AI content and unrelated personal activity outside organization admin views.

## Acceptance Boundaries

- Eligible `org_advanced_admin` users can inspect organization-level summaries for approved analytics surfaces.
- Employee subjective answer text remains hidden from organization admin summary views.
- Formal `practice` / `mock_exam` aggregate signals must not be mixed into enterprise-training completion, score, or
  deadline metrics.
- Organization analytics does not write formal `exam_report` or formal `mistake_book`.
- Export remains out of scope unless separately approved.

## Confirmed First-Release Design

- Analytics levels:
  - organization overview;
  - training detail;
  - employee summary.
- Default date range is 30 days.
- Filters support 7 days, 30 days, 90 days, and custom range.
- Small samples below 5 people show a warning.
- Knowledge weak-point summaries may be shown for organizations and employees when derived from training results.
- Formal `practice` / `mock_exam` weak-point signals may also be shown as separate aggregate analysis when the
  organization authorization context permits it.
- Weak-point summaries must not expose raw answer text.
- Enterprise AI quota consumption summary is not shown to organization admins in the first release.
- No export is available in the first release.

## Non-Goals

- No employee statistics export.
- No organization aggregate export.
- No raw sensitive content viewer.
- No provider or external-service integration.

Cost Calibration Gate remains blocked pending fresh explicit approval.
