# AI generation monopoly question structured acceptance diagnosis audit review

## Scope Review

- Task id: `ai-generation-monopoly-question-structured-acceptance-diagnosis-2026-07-02`
- Scope: shared parser/instruction repair and focused tests.
- Provider, browser, DB, private OCR/material, dependency, schema, migration, seed, staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration, and AI组卷 question-count preview repair are blocked.

## Adversarial Checks

- Parser fallback must not accept arbitrary prose: covered by `invalid_json` non-JSON prose test.
- Parser fallback must not loosen exact requested-count enforcement: covered by `question_count_mismatch` test for `2/3`.
- Repair must stay shared and not add monopoly-specific special cases: implementation is in shared route-integrated Provider execution service and has no profession branch.
- AI组卷 parser must remain unchanged: implementation only passes plaintext fallback to `question_set`; `paper_draft` path is unchanged.
- Fallback must not expose raw generated content in summaries: parsed fallback summaries contain only count and redacted metadata fields.
- Evidence must remain redacted and must not include raw Provider or generated content: this audit and evidence record only file paths, statuses, counts, and categories.

## Review Status

Passed for this local source/test repair. Next validation must be a separate bounded monopoly AI出题 Provider rerun task; this task did not execute Provider/browser/DB actions.
