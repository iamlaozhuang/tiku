# Phase 70 Advanced AI Task Domain Implementation Planning Evidence

**Task id:** `phase-70-advanced-ai-task-domain-implementation-planning`

**Branch:** `codex/phase-70-ai-task-domain-planning`

**Task kind:** `implementation_planning`

## Summary

- Result: pass pending closeout.
- Scope: planning-only provider-agnostic AI task domain implementation proposal.
- Product code changed: no.
- Provider call performed: no.
- Direct implementation approved: no.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. AI task contract and status DTO:
   - Define task types for AI question generation, AI `paper` generation, and organization training generation.
   - Define public statuses and failure categories without exposing internal numeric ids.
2. Internal lifecycle model:
   - Encode transition rules for `pending`, `running`, `succeeded`, `failed`, and `cancelled`.
   - Model retryability, timeout classification, and recovery metadata.
3. Repository boundary:
   - Plan idempotency key hash lookup, task creation, claim, transition, cancellation, retry metadata, and recovery scan contracts.
   - If persistence is missing, stop and seed a separate schema/migration approval task.
4. Service orchestration:
   - Submit, cancel, claim, complete, fail, retry, and recover tasks through service boundaries.
   - Consume Phase 69 advanced `authorization` context snapshots.
5. Mapper and redaction:
   - Map task rows into camelCase DTOs with public ids only.
   - Exclude raw prompt, raw answer, provider payload, model output, secret, token, Authorization header, plaintext `redeem_code`, full `paper` content, and employee sensitive answer text.
6. `audit_log` and `ai_call_log`:
   - Record redacted lifecycle and failure summaries only.
   - Keep provider payload logging blocked.

## Blocked Work

Real provider calls, provider_cost_measurement, provider quota, endpoint, model selection, fallback configuration, env/secret, staging/prod/cloud/deploy, payment, external-service, dependency, schema, migration, and direct implementation remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Redaction Check

This evidence contains no secrets, env values, DB URLs, tokens, Authorization headers, provider payloads, raw prompts, raw student answers, raw model responses, plaintext `redeem_code`, employee subjective answer text, full `paper` content, full textbooks, OCR full text, or customer/customer-like private data.

## Validation Results

| Command                                              | Result          | Notes                                                                                                     |
| ---------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                   | pass            | No whitespace errors.                                                                                     |
| Scoped Prettier check                                | fail, then pass | Evidence formatting needed scoped Prettier `--write`; final check passed.                                 |
| Required planning anchor check                       | pass            | Confirmed implementation proposal, provider-agnostic boundary, blocked gate language, and required terms. |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass            | Inventory showed only task-scoped docs/state changes before staging.                                      |

## Next Recommended Task

After closeout, continue to Phase 71 advanced personal AI generation implementation planning.
