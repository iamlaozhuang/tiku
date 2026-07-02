# AI generation Provider instruction unification audit review

## Scope Review

- Task id: `ai-generation-provider-instruction-unification-2026-07-02`
- Scope: shared instruction builder and route bridge call sites only.
- Provider, browser, DB, dependency, schema, migration, seed, e2e, deploy, PR, force push, release readiness, final Pass, and Cost Calibration are blocked.

## Adversarial Checks

- Regression target: no route-specific instruction builder may reintroduce hard-coded requested count 10.
- Regression target: AI组卷 instruction must require total question count in addition to sections, distribution, and coverage.
- Reuse target: admin and personal paths must call one shared builder while preserving role-specific scene labels.
- Evidence target: no prompt text, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id is recorded.

## Requirement Mapping Result

- The task maps to advanced AI task lifecycle, personal AI generation, organization AI generation, content admin draft/review, and formal content separation requirements.
- This task does not attempt route outcome alignment, UI regression coverage, runtime RAG repair, or real Provider validation.

## Review Status

Review completed after focused tests and Module Run v2 gates passed.

## Review Result

- Regression target no route-specific hard-coded requested count 10: pass.
- Regression target AI组卷 requires total question count with sections, distribution, and coverage: pass.
- Reuse target admin and personal paths call one shared builder while preserving role-specific scene labels: pass.
- Evidence target no prompt text, Provider payload, raw AI output, full generated content, full material/chunk content, credential, token, session, env value, raw DB row, or internal id recorded: pass.
- Blocked operations remained blocked: pass.

## Residual Risk

- This task is deterministic source/test hardening only. Real Provider behavior remains gated to the later bounded rerun task.
