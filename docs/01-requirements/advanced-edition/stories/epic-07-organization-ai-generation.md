# Epic 07 Organization AI Generation

## Actor

Organization admin with valid advanced edition `org_auth`.

## Goal

Use AI to generate organization-owned questions and AI `paper` content for enterprise-managed learning use.

## Acceptance Scenario

1. The organization admin enters a discoverable organization AI generation entry.
2. The system checks effective advanced organization authorization and organization scope.
3. The organization admin requests AI question or AI `paper` generation.
4. The system creates a trackable AI task and shows safe status information.
5. The generated result remains in the organization-owned AI content domain.
6. The generated result does not enter the platform formal question bank or paper library.

## Data Boundary

- Generated content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Prompt, provider payload, secret, token, and raw provider response must not appear in evidence.
- Related `audit_log` and `ai_call_log` information must be redacted.

## Source Links

- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
