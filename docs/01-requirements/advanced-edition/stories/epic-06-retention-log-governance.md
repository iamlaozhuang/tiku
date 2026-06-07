# Epic 06 Retention And Log Governance

## Actor

Platform operations admin and audit reviewer.

## Goal

Use redacted `audit_log` and `ai_call_log` evidence to support governance without exposing sensitive raw content.

## Acceptance Scenario

1. A governed operation or AI task occurs.
2. The system records safe metadata for traceability.
3. Evidence and review records use public ids, counts, statuses, timestamps, and redacted summaries.
4. Sensitive raw values remain hidden.
5. Retention behavior follows the advanced edition ops configuration contract.

## Data Boundary

- Evidence must not record prompt, provider payload, secret, token, cleartext `redeem_code`, employee subjective answer text, or raw AI generated content.
- Raw sensitive content viewer remains out of scope.
- Physical hard-delete executor remains out of scope.

## Source Links

- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

Cost Calibration Gate remains blocked pending fresh explicit approval.
