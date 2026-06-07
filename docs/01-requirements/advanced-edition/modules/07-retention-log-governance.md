# Advanced Edition Retention And Log Governance Requirements

## Purpose

Define retention, redaction, and governance expectations for advanced edition logs.

## Source Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-retention-log-governance-implementation-plan.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`

## Scope

- Govern `audit_log` records for operations and content governance actions.
- Govern `ai_call_log` records for AI usage summaries and redacted failure evidence.
- Preserve retention and redaction boundaries for sensitive content.

## Acceptance Boundaries

- Evidence may record public ids, counts, statuses, timestamps, and redacted summaries.
- Evidence must not record prompt, provider payload, secret, token, cleartext `redeem_code`, employee subjective answer text, or raw AI generated content.
- Physical hard-delete executor remains out of scope.
- Raw sensitive content viewer remains out of scope.

## Non-Goals

- No raw prompt viewer.
- No provider response body viewer.
- No hard-delete executor.
- No staging/prod/cloud/deploy work.

Cost Calibration Gate remains blocked pending fresh explicit approval.
