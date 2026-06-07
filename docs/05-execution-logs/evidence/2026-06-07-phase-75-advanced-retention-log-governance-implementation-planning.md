# Phase 75 Advanced Retention Log Governance Implementation Planning Evidence

**Task id:** `phase-75-advanced-retention-log-governance-implementation-planning`

**Branch:** `codex/phase-75-retention-log-governance-planning`

**Task kind:** `implementation_planning`

## Summary

- Result: pass pending closeout.
- Scope: planning-only retention and log governance implementation proposal.
- Product code changed: no.
- Hard-delete executor changed: no.
- Sensitive snapshot display approved: no.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. Retention policy contract:
   - Define explicit domains for AI generated practice, organization training draft, organization training published, formal `question`/`paper` draft, `audit_log`, and `ai_call_log`.
   - Avoid a generic retention rule that merges personal AI learning content, organization training, formal content, and logs.
2. `expired_hidden` visibility:
   - Treat `expired_hidden` as a governance visibility state, not deletion.
   - Hide expired content from ordinary user, employee, organization admin, and content management entrances.
3. Recovery:
   - Permit recovery only within 30 days with reason, operator, target public id, target domain, current governance snapshot, and `audit_log`.
   - Re-run `authorization`, owner, organization scope, and redaction checks.
4. Hard-delete approval:
   - Require approval record and redacted impact summary.
   - Keep physical hard-delete executor blocked.
5. Controlled snapshot:
   - Plan a guard for controlled snapshot exception without approving sensitive snapshot display.
   - Evidence may record only public ids, time, reason category, and redacted summary.
6. Log retention and redaction:
   - Apply `audit_log` retention planning at 1095 days and `ai_call_log` retention planning at 180 days.
   - Reject or redact provider payload, prompt, raw AI input/output, secret, token, database URL, plaintext `redeem_code`, employee subjective answer text, disallowed personal AI content, and numeric ids.

## Blocked Work

Direct retention/log implementation, physical hard-delete executor, sensitive snapshot display, raw content viewer, provider payload logging, prompt logging, raw AI input/output logging, provider_cost_measurement, real provider calls, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Redaction Check

This evidence contains no secrets, env values, DB URLs, tokens, Authorization headers, provider payloads, raw prompts, raw student answers, raw model responses, plaintext `redeem_code`, employee subjective answer text, full `paper` content, full textbooks, OCR full text, or customer/customer-like private data.

## Validation Results

| Command                                              | Result | Notes                                                                                                                                                                                       |
| ---------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                   | pass   | No whitespace errors.                                                                                                                                                                       |
| Scoped Prettier check                                | pass   | Task-scoped docs/state files use Prettier code style after scoped `--write`.                                                                                                                |
| Required planning anchor check                       | pass   | Confirmed `expired_hidden`, recovery, hard-delete, controlled snapshot, `audit_log`, `ai_call_log`, `redeem_code`, provider payload, sensitive snapshot, and Cost Calibration Gate anchors. |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass   | Inventory showed only task-scoped docs/state changes before staging.                                                                                                                        |

## Next Recommended Task

After closeout, continue to Phase 76 advanced code-stage schema and dependency blocker review.
