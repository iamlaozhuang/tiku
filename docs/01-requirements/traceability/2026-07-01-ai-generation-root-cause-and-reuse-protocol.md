# 2026-07-01 AI 出题 / AI 组卷根因与复用协议

## Purpose

This protocol prevents AI 出题 / AI 组卷 repairs from becoming ad hoc page fixes. It requires every future repair to identify the root-cause boundary, protect the behavior with tests, and reuse existing shared code before adding new role-specific logic.

## Root-Cause Checklist

For every OP issue or newly found walkthrough issue, the task must record:

| Field            | Required content                                                                |
| ---------------- | ------------------------------------------------------------------------------- |
| issue id         | Existing OP id or new walkthrough issue id.                                     |
| affected roles   | Role labels only.                                                               |
| affected flow    | AI 出题, AI 组卷, history, authorization entry, result preview, or empty state. |
| data mode        | empty baseline, data-backed, or Provider sample.                                |
| observed summary | Redacted behavior summary.                                                      |
| expected summary | Contract-level expected behavior.                                               |
| boundary         | One or more root-cause boundary names from this protocol.                       |
| protective test  | Focused test or static contract check added or reused by the repair.            |
| rerun result     | `pass`, `fail`, `blocked`, or `not_applicable`.                                 |

## Boundary Definitions

Use these boundary names consistently:

- `ui_interaction_state`: loading, empty, error, placement, disabled state, rapid-click behavior, focus/anchor behavior.
- `route_adapter`: route handler or Server Action input mapping, response mapping, status handling.
- `api_contract`: REST path, request field, response envelope, pagination, generation-kind metadata.
- `service_business_logic`: task type selection, capability decision, Provider invocation decision, draft creation rule.
- `repository_persistence`: history query, ordering, filtering, persistence redaction, draft metadata storage.
- `authorization_capability`: personal_auth, org_auth, effectiveEdition, admin workspace capability, employee authorization context.
- `provider_adapter`: fake/real Provider boundary, timeout/failure category, token/duration metadata handling.
- `structured_parser`: converting Provider text into structured question or paper draft safely.
- `history_query_isolation`: AI 出题 and AI 组卷 history separation.
- `data_availability`: profession, level, subject, knowledge_node, question bank, paper source availability.

## Reuse Checklist

Before writing new code, each repair task must inspect and record whether it can reuse:

- shared AI generation contracts under `src/server/contracts`;
- shared AI generation services under `src/server/services`;
- shared AI generation repositories under `src/server/repositories`;
- admin AI generation entry UI under `src/features/admin/ai-generation`;
- student AI generation UI under `src/features/student/ai-generation`;
- existing authorization and capability services;
- glossary-backed enum definitions for `profession`, `level`, `subject`, `knowledge_node`, `question_type`;
- existing pagination and history query patterns;
- existing fake Provider and parser tests.

## Anti-Duplication Rules

- Do not create separate AI 出题 / AI 组卷 task semantics for personal, organization, and content roles.
- Do not redefine `level`, `profession`, `subject`, `knowledge_node`, or `question_type` in page-local constants if shared glossary/domain constants exist or can be reused within task scope.
- Do not bypass the service layer from UI or route handlers.
- Do not persist raw prompts, Provider payloads, raw AI output, full question text, full paper text, full material text, or internal numeric ids.
- Do not fix a symptom only in one role when the root cause belongs to a shared contract or service.

## Regression Protection

Every source repair must include at least one of:

- a RED/GREEN focused unit test for the bug;
- a contract test for request/response or parser behavior;
- a UI unit/static test for visible state and role entry behavior;
- a repository/service test using fake data and no raw sensitive material.

Manual owner-preview evidence is not a substitute for automated regression protection. Real Provider samples are confidence checks only and must not be required for automated tests.

## Repair Review Questions

Before closeout, answer these in the task evidence or audit:

- Which root-cause boundary was fixed?
- Which shared code was reused?
- Which focused test prevents the same failure?
- Which roles and flows were rerun or intentionally blocked?
- Did the repair avoid `.env*`, Provider payloads, raw AI I/O, DB raw rows, internal ids, PII, screenshots, traces, and raw DOM?
- Did the repair avoid release readiness, final Pass, production readiness, and Cost Calibration claims?
