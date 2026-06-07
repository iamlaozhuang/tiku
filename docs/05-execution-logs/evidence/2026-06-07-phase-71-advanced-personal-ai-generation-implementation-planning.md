# Phase 71 Advanced Personal AI Generation Implementation Planning Evidence

**Task id:** `phase-71-advanced-personal-ai-generation-implementation-planning`

**Branch:** `codex/phase-71-personal-ai-generation-planning`

**Task kind:** `implementation_planning`

## Summary

- Result: pass pending closeout.
- Scope: planning-only personal AI generation implementation proposal.
- Product code changed: no.
- Formal content write path changed: no.
- Direct implementation approved: no.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. Personal generated content contract/model:
   - Define personal generated question and AI learning `paper` DTOs.
   - Keep generated content outside formal `question`, formal `paper`, `practice`, and `mock_exam`.
2. Validation and constraints:
   - Validate subject, first-release question types, count, difficulty, and `knowledge_node` constraints.
   - Reject unsupported generation requests before task submission.
3. Service orchestration:
   - Use advanced `authorization` context and AI task domain.
   - Return AI task public id and status instead of waiting for model output.
4. Mapper and owner visibility:
   - Map generated learning content to owner-only DTOs with public ids.
   - Use `null` for absent optional fields.
5. Optional route and Web surfaces:
   - Add `/api/v1/` route and student UI only after separate implementation approval.
   - Include Loading, Empty, Error, Permission Blocked, Expired Hidden, and owner-only states.
6. Tests and redaction:
   - Prove generated question is not formal `question`.
   - Prove generated AI learning `paper` is not formal `mock_exam`.
   - Prove raw prompt, provider payload, raw generated content, plaintext `redeem_code`, full `paper` content, secret, token, and numeric ids are absent from ordinary DTOs and evidence.

## Blocked Work

Direct implementation and formal content write-path changes remain unapproved. Real provider calls, provider_cost_measurement, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Redaction Check

This evidence contains no secrets, env values, DB URLs, tokens, Authorization headers, provider payloads, raw prompts, raw student answers, raw model responses, plaintext `redeem_code`, employee subjective answer text, full `paper` content, full textbooks, OCR full text, or customer/customer-like private data.

## Validation Results

| Command                                              | Result          | Notes                                                                                                   |
| ---------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                   | pass            | No whitespace errors.                                                                                   |
| Scoped Prettier check                                | fail, then pass | Evidence formatting needed scoped Prettier `--write`; final check passed.                               |
| Required planning anchor check                       | pass            | Confirmed implementation proposal, formal content isolation, blocked gate language, and required terms. |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass            | Inventory showed only task-scoped docs/state changes before staging.                                    |

## Next Recommended Task

After closeout, continue to Phase 72 advanced organization training implementation planning.
