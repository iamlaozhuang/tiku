# Epic 05 Formal Content Separation

## Actor

Personal user, organization admin, platform content teacher, and platform operations admin.

## Goal

Keep advanced edition generated content and organization training data separate from formal content flows unless a later approved adoption path exists.

## Acceptance Scenario

1. AI or organization training produces derived learning content.
2. The system stores the result in its own advanced edition domain.
3. Formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` records remain unchanged.
4. Any later adoption into formal `question` or `paper` draft flow requires explicit review and governance.

## Data Boundary

- AI generated content is not automatically formal content.
- Organization training statistics are not formal `exam_report` or formal `mistake_book`.
- Adoption, if later approved, must record source, reviewer, validation result, timestamp, and `audit_log`.

## Source Links

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-requirements-to-implementation-handoff.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
