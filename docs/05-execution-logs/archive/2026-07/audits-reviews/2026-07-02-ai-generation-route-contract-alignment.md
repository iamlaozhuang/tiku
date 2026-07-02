# AI generation route contract alignment audit review

## Scope Review

- Task id: `ai-generation-route-contract-alignment-2026-07-02`
- Scope: route contract mapping and focused tests only.
- Provider, browser, DB, dependency, schema, migration, seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration are blocked.

## Adversarial Checks

- Regression target: successful mocked AI出题 must produce an acceptable `question_set` result.
- Regression target: successful mocked AI组卷 must produce an acceptable `paper_draft` result.
- Failure target: malformed JSON must not be treated as a usable draft.
- Failure target: insufficient evidence must stop before Provider execution.
- Transport target: admin and personal route surfaces must return standard `{ code, message, data }` shapes.
- Evidence target: no prompt text, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id is recorded.

## Review Status

Review completed after focused tests and Module Run v2 gates passed.

## Review Result

- Regression target successful mocked AI出题 produces acceptable `question_set`: pass.
- Regression target successful mocked AI组卷 produces acceptable `paper_draft`: pass.
- Failure target malformed JSON is not treated as a usable draft: pass.
- Failure target insufficient evidence stops before Provider execution: pass.
- Transport target admin and personal route surfaces return standard `{ code, message, data }` shapes: pass.
- Evidence target no prompt text, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id recorded: pass.

## Residual Risk

- This task used mocked Provider execution only. Real Provider behavior remains gated to the later bounded rerun task.
