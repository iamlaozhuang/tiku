# Advanced Edition AI Task Domain Requirements

## Purpose

Define the requirement boundary for advanced edition AI task records and status tracking.

## Source Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-ai-task-domain-implementation-plan.md`

## Scope

- Track asynchronous AI work for personal AI generation and organization training preparation.
- Record public task id, status, retry count, quota summary, and redacted failure category.
- Relate task evidence to `ai_call_log` without exposing prompt, provider payload, secret, token, or raw AI output.

## Acceptance Boundaries

- A task status can be inspected without revealing sensitive AI input or output.
- Failed tasks expose a safe failure category and retry state.
- `ai_call_log` is available only as redacted governance evidence.
- Task data must not create formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book` records by itself.

## Non-Goals

- No real provider call.
- No provider cost measurement.
- No production quota default value.
- No env/secret or external-service work.

Cost Calibration Gate remains blocked pending fresh explicit approval.
