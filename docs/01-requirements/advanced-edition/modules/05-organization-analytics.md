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

## Non-Goals

- No employee statistics export.
- No organization aggregate export.
- No raw sensitive content viewer.
- No provider or external-service integration.

Cost Calibration Gate remains blocked pending fresh explicit approval.
