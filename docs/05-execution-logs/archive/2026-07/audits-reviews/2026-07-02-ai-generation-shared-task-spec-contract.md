# AI generation shared task spec contract audit review

## Scope Review

- Task id: `ai-generation-shared-task-spec-contract-2026-07-02`
- Scope: shared task spec contract and focused service tests only.
- Provider, browser, DB, dependency, schema, migration, seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration are blocked.

## Adversarial Checks

- Regression target: AI出题 count must be request-driven, not silently fixed at 10.
- Regression target: AI组卷 must carry requested total count into preview options for later parser validation.
- Reuse target: task labels and preview semantics must live in one shared contract rather than role-specific builders.
- Runtime-path target: admin and personal Provider bridge call sites must not keep using the no-parameter fallback when generation parameters are already available.
- Evidence target: no prompt, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id is recorded.

## Requirement Mapping Result

- The task maps to advanced AI generation task lifecycle, personal AI generation, organization AI generation, content admin draft/review, and formal content separation requirements.
- This task does not attempt UI discoverability, route authorization, parser hardening beyond count option propagation, or real Provider validation.

## Review Status

- Status: pass for this child task.
- Findings: none after focused tests and Module Run v2 gates.
- Residual scope outside this task: structured preview parser variants, Provider instruction unification, route contract alignment, UI regression matrix, runtime RAG/Provider rerun, and issue-prevention governance remain in later child tasks.
- No release readiness, production usability, or final Pass is claimed.
