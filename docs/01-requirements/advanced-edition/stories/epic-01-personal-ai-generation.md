# Epic 01 Learner AI Generation

## Actor

Personal user with valid advanced edition `personal_auth`, or employee with valid advanced edition `org_auth`.

## Goal

Use AI to generate learning questions and AI `paper` content for personal or organization-scoped study.

## Acceptance Scenario

1. The user enters a discoverable learner AI generation entry.
2. The system checks effective `authorization`, including `personal_auth` or organization-scoped `org_auth`.
3. The user requests AI question or AI `paper` generation.
4. The system creates a trackable AI task and shows safe status information.
5. The generated result remains in the learner AI learning content domain.
6. Organization employee output stays scoped to the employee/user and organization authorization context.
7. `personal_advanced_student` sees `AI训练` with `AI出题` and `AI组卷` actions without manual URL entry.
8. `personal_standard_student` cannot use advanced AI generation and receives hidden, upgrade, or denied state.
9. `org_advanced_employee` sees `AI训练` when the active organization context has effective advanced access.
10. `org_standard_employee` cannot use learner AI generation from organization context.

## Data Boundary

- Generated content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Prompt, provider payload, secret, token, and raw provider response must not appear in evidence.
- Related `ai_call_log` information must be redacted.
- Runtime evidence must not record prompts, Provider payloads, raw AI output, plaintext `redeem_code`, tokens, cookies, localStorage, or database rows.

## Source Links

- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
