# Epic 01 Personal AI Generation

## Actor

Personal user with valid advanced edition `authorization`.

## Goal

Use AI to generate learning questions and AI `paper` content for personal study.

## Acceptance Scenario

1. The user enters the personal AI generation entry.
2. The system checks effective `authorization`.
3. The user requests AI question or AI `paper` generation.
4. The system creates a trackable AI task and shows safe status information.
5. The generated result remains in the personal AI learning content domain.

## Data Boundary

- Generated content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Prompt, provider payload, secret, token, and raw provider response must not appear in evidence.
- Related `ai_call_log` information must be redacted.

## Source Links

- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
