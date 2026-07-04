# Full Chain Acceptance Provider Cost Approval

Task id: `full-chain-acceptance-planning-and-materials-prep-2026-07-04`

Status: approval boundary only.

## Provider Boundary

AI-related portions of the full-chain acceptance remain blocked until a later task receives fresh approval. This package
does not call Provider, read secrets, read `.env*`, print secret values, or record raw prompts, payloads, or AI output.

AI surfaces that require later approval:

| Surface                      | Actor                                                | Provider need               | Output boundary                                                    |
| ---------------------------- | ---------------------------------------------------- | --------------------------- | ------------------------------------------------------------------ |
| Content AI出题               | `content_admin`                                      | Yes                         | Content AI draft/review domain only.                               |
| Content AI组卷               | `content_admin`                                      | Yes                         | Content AI paper draft/review domain only.                         |
| Learner AI训练               | `personal_advanced_student`, `org_advanced_employee` | Yes                         | Personal/employee learner AI domain only.                          |
| Organization AI出题/AI组卷   | `org_advanced_admin`                                 | Yes                         | Organization-owned output, copy to enterprise training draft only. |
| AI explanation or AI scoring | Learners/employees where implemented and approved    | Yes when real model is used | Redacted status/usage only in evidence.                            |

## Cost Calibration Boundary

Cost Calibration remains a separate Stage C-style approval. The full-chain acceptance cannot infer cost safety from local
functional success.

Required later approval inputs:

- Provider label and model label.
- Host label and approved runtime secret source.
- Maximum calls and retry limit.
- Maximum output tokens and timeout.
- Allowed synthetic/reviewed input class.
- Forbidden evidence fields.
- Stop-on-cost, stop-on-instability, stop-on-redaction-failure rules.
- Token count and duration evidence shape.

## Suggested Later Provider Smoke Before Full Chain

Before full-chain AI execution, run a separate Provider smoke or reuse the latest approved Provider smoke only if the
target provider/model/secret/runtime boundary has not changed.

The smoke should remain:

- local-only;
- max one call unless explicitly expanded;
- zero retry unless explicitly approved;
- synthetic or reviewed non-sensitive input only;
- no raw prompt, raw payload, raw AI output, secret, connection string, or full content in evidence.

## AI Stop Rules For Later Acceptance

- Missing secret or secret alias mismatch.
- Provider call exceeds approved count, retry, output, timeout, or cost boundary.
- Any raw Prompt, Provider payload, AI input/output, full material/question/paper content, or credential would enter
  evidence.
- Standard roles receive advanced AI access.
- Organization AI attempts formal platform content adoption instead of organization training draft handoff.
- Content AI bypasses draft/review/adoption controls.
- RAG or knowledge grounding evidence is insufficient and the flow would publish or adopt without allowed confirmation.

## Non-Claims

This document does not approve Provider execution, Cost Calibration, staging, production, release readiness, final Pass,
or production usability.
