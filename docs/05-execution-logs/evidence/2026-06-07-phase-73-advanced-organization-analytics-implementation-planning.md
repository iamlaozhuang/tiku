# Phase 73 Advanced Organization Analytics Implementation Planning Evidence

**Task id:** `phase-73-advanced-organization-analytics-implementation-planning`

**Branch:** `codex/phase-73-organization-analytics-planning`

**Task kind:** `implementation_planning`

## Summary

- Result: pass pending closeout.
- Scope: planning-only organization analytics implementation proposal.
- Product code changed: no.
- Export flow changed: no.
- Employee sensitive detail visibility approved: no.

## Implementation Task Proposal

Future implementation should be split into separately approved code-stage tasks:

1. Analytics DTOs and formula model:
   - Define dashboard, training summary, employee summary, ranking, formal learning summary, quota summary, filter, and pagination DTOs.
   - Test completion, score, trend, ranking, and zero-count formulas.
2. Read-only repository:
   - Return visible organization snapshots, official training submissions, employee summaries, formal learning summaries, and quota summaries.
   - Return summary rows only.
3. Analytics service:
   - Require advanced `authorization`, `org_auth`, organization admin context, and visible organization scope.
   - Use official submissions only and answer-time organization snapshots.
4. Privacy mapper:
   - Map aggregate rows to admin DTOs without employee sensitive detail.
   - Keep organization training ranking separate from formal `mock_exam` ranking.
5. Optional route/Web:
   - Add API and admin UI only after separate implementation approval.
   - Exclude export route, export command, generated export file, export download, and export governance in first release.

## Blocked Work

Direct analytics implementation, export flows, employee answer detail visibility, single AI task detail, provider_cost_measurement, real provider calls, dependency, schema, migration, env/secret, staging/prod/cloud/deploy, payment, external-service, and Cost Calibration Gate execution remain blocked.

Cost Calibration Gate remains blocked pending fresh explicit approval.

## Redaction Check

This evidence contains no secrets, env values, DB URLs, tokens, Authorization headers, provider payloads, raw prompts, raw student answers, raw model responses, plaintext `redeem_code`, employee subjective answer text, full `paper` content, full textbooks, OCR full text, or customer/customer-like private data.

## Validation Results

| Command                                              | Result          | Notes                                                                                                                                                       |
| ---------------------------------------------------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `git diff --check`                                   | pass            | No whitespace errors.                                                                                                                                       |
| Scoped Prettier check                                | fail, then pass | Evidence formatting needed scoped Prettier `--write`; final check passed.                                                                                   |
| Required planning anchor check                       | pass            | Confirmed `authorization`, `org_auth`, `mock_exam`, `exam_report`, `mistake_book`, `audit_log`, `ai_call_log`, `export`, and Cost Calibration Gate anchors. |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass            | Inventory showed only task-scoped docs/state changes before staging.                                                                                        |

## Next Recommended Task

After closeout, continue to Phase 74 advanced operations authorization and quota implementation planning.
