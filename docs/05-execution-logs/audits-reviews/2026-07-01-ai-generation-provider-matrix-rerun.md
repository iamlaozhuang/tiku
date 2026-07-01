# AI Generation Provider Matrix Rerun After Repair Audit Review

## Review Scope

- Verify whether the repaired AI 出题 / AI 组卷 behavior holds across the scoped owner-preview role matrix.
- Confirm OP-01 to OP-09 are not contradicted by local owner-preview behavior.

## Redaction Review

- Pass. Evidence records only role labels, route labels, status labels, safe count labels, duration buckets, and follow-up root-cause labels.
- Evidence does not contain credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*`, DB rows, internal ids, PII, raw prompts, Provider payloads, raw AI input/output, screenshots, traces, raw DOM, HTML dumps, or full generated content.

## Matrix Review

- Provider matrix: completed with findings.
- Pass evidence:
  - Eligible AI 出题 routes for personal advanced learner, organization advanced employee, organization advanced admin, and content admin produce safe `草稿 10/10` / `待评审 10` structure labels.
  - Organization advanced admin and content admin AI 组卷 produce safe `paper_section n` plus numeric `题量 n` labels.
  - Result placement is near the action area for captured eligible routes.
- Findings:
  - Personal advanced learner and organization advanced employee AI 组卷 return `题量 未识别`; this is not strict contract pass for paper quantity.
  - `ops_admin` unexpectedly sees a submit-capable organization AI 出题 route and must not be treated as a normal eligible Provider role.
  - `CROSS-001` and `CROSS-002` remain source repair requirements before the product experience can be considered correct.

## Cross-Cutting Review

- `CROSS-001` resource/RAG grounding: fail. The current Provider execution path validates structured JSON shape after the model responds, but it does not retrieve or enforce source-material evidence before the request. This explains the user-observed domain drift without relying on raw generated output.
- `CROSS-002` internal governance copy exposure: fail. Shared learner/admin UI surfaces render local-contract/redaction/content-visibility metadata to ordinary users and operators; this is a product-surface issue across multiple roles, not a single page defect.
- Both cross-cutting issues must be treated as follow-up repair scope after this rerun task closes. This task remains docs/state/evidence only and must not edit source.

## Remaining Risk

- This task does not repair source. Follow-up repair must address resource/RAG grounding, product-language UI, ops route guard, and paper quantity parsing/display without storing raw Provider content or prompt/payload evidence.
