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
7. `org_advanced_admin` can discover `AI出题` and `AI组卷` from the organization backend workspace.
8. `org_standard_admin` cannot discover or use organization AI generation by menu visibility or direct URL entry.
9. Organization AI generation routes must not redirect organization admins into system operations or content-authoring workspaces.
10. Organization AI output can be copied into an organization training draft for review and edit.
11. Organization AI output must not directly create platform formal `question` or `paper` records.
12. `evidence_status = none` blocks training draft publish or formal adoption. `evidence_status = weak` requires explicit confirmation.
13. Organization admins do not see enterprise AI quota consumption summaries in the first release.

## Data Boundary

- Generated content must not automatically write to formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or `mistake_book`.
- Prompt, provider payload, secret, token, and raw provider response must not appear in evidence.
- Related `audit_log` and `ai_call_log` information must be redacted.
- Standard organization denial evidence records only route, role, state, and redacted summary.
- Organization AI follow-up actions must stay in organization training draft or organization-owned draft domains unless a later approved formal adoption path exists.

## Source Links

- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
