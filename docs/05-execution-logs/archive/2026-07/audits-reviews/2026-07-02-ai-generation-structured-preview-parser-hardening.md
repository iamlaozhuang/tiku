# AI generation structured preview parser hardening audit review

## Scope Review

- Task id: `ai-generation-structured-preview-parser-hardening-2026-07-02`
- Scope: shared structured preview parser and focused parser tests only.
- Provider, browser, DB, dependency, schema, migration, seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration are blocked.

## Adversarial Checks

- Regression target: AI出题 must not accept unsupported root fields or count mismatches.
- Regression target: AI组卷 must not show an acceptable parsed preview with `questionCount: null` when a requested count exists.
- Parser target: paper count should be recognized from top-level counts, section counts, nested question arrays, nested draft arrays, and distribution totals.
- Failure target: safe failure categories must stay categorical and redacted.
- Evidence target: no prompt, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id is recorded.

## Requirement Mapping Result

- The task maps to advanced AI task lifecycle, personal AI generation, organization AI generation, content admin draft/review, and formal content separation requirements.
- This task does not attempt Provider instruction unification, route/UI alignment, runtime RAG repair, or real Provider validation.

## Review Status

- Status: pass for this child task after focused test, lint, typecheck, and Module Run v2 gates.
- Findings: none.
- Residual scope outside this task: Provider instruction unification, route contract alignment, UI regression matrix, deterministic rollup, and bounded real Provider rerun remain later child tasks.
- No release readiness, production usability, or final Pass is claimed.
