# Advanced Edition Organization Analytics Requirements

## Purpose

Define the summary analytics visible to organization admins for organization training.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-analytics-implementation-plan.md`

## Scope

- Show organization training participation and answer statistics.
- Use summary values such as counts, completion state, score summary, and time summary.
- Keep employee personal AI content and unrelated personal activity outside organization admin views.

## Acceptance Boundaries

- Organization admins can inspect organization-level summaries.
- Employee subjective answer text remains hidden from organization admin summary views.
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
- Weak-point summaries must not expose raw answer text.
- Enterprise AI quota consumption summary is not shown to organization admins in the first release.
- No export is available in the first release.

## Non-Goals

- No employee statistics export.
- No organization aggregate export.
- No raw sensitive content viewer.
- No provider or external-service integration.

Cost Calibration Gate remains blocked pending fresh explicit approval.
