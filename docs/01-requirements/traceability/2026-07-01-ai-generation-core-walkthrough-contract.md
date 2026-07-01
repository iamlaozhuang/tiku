# 2026-07-01 AI 出题 / AI 组卷核心能力专项走查合同

## Purpose

This contract defines the local owner-preview walkthrough standard for AI 出题 and AI 组卷. It is a verification and issue-triage contract only. It does not approve source repair, schema or migration work, Provider execution, Cost Calibration, staging/prod, deployment, release readiness, or final Pass.

## Scope

The walkthrough covers four verification layers:

1. Role and authorization access.
2. Parameter contract.
3. Generated-result contract.
4. Robustness and failure states.

Every matrix cell must end as one of:

- `pass`
- `fail`
- `blocked`
- `not_applicable`

The walkthrough must not use ambiguous conclusions such as "looks usable".

## Role Matrix

| Role label                  | AI 出题 expectation                                     | AI 组卷 expectation                                     | Notes                                                                              |
| --------------------------- | ------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| `personal_standard_student` | `not_applicable` or upgrade/denial state                | `not_applicable` or upgrade/denial state                | Standard personal learners must not receive usable advanced AI generation.         |
| `personal_advanced_student` | usable learner AI 出题 when authorization is active     | usable learner AI 组卷 when authorization is active     | Scope must follow selected personal authorization.                                 |
| `org_standard_employee`     | `not_applicable` or upgrade/denial state                | `not_applicable` or upgrade/denial state                | Standard organization employees must not receive usable advanced AI generation.    |
| `org_advanced_employee`     | usable learner AI 出题 under organization authorization | usable learner AI 组卷 under organization authorization | Output remains learner-private unless a later task approves organization adoption. |
| `org_standard_admin`        | `not_applicable` or standard-unavailable state          | `not_applicable` or standard-unavailable state          | Direct organization routes must not expose enabled AI actions.                     |
| `org_advanced_admin`        | usable organization-owned AI 出题                       | usable organization-owned AI 组卷                       | Output belongs to the organization draft domain.                                   |
| `content_admin`             | usable content AI 出题 draft/review surface             | usable content AI 组卷 draft/review surface             | Output belongs to platform content review pool.                                    |
| `ops_admin`                 | denied or no authoring entry                            | denied or no authoring entry                            | Ops may monitor/configure only when separately approved.                           |

## Preflight Blockers

Known owner-preview blockers must be mapped before any pass/fail claim:

| Issue   | Affected matrix area                                                                                                           | Required handling                                                                                                             |
| ------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| `OP-03` | learner and employee practice/mock/history authorization flows, and any learner AI flow depending on the same session boundary | Mark affected role/function rows as `blocked_by_existing_issue` if the flow cannot be reached.                                |
| `OP-04` | `org_advanced_admin` organization workspace and organization AI pages                                                          | Mark organization admin AI rows as `blocked_by_existing_issue` until advanced admin session capability is correctly hydrated. |

## Parameter Contract

AI 出题 must expose and carry:

| Parameter        | Expected contract                                                                 |
| ---------------- | --------------------------------------------------------------------------------- |
| `profession`     | one of `monopoly`, `marketing`, `logistics`, displayed with stable Chinese labels |
| `level`          | numeric 1, 2, 3, 4, 5 only                                                        |
| `subject`        | `theory` or `skill`                                                               |
| `knowledge_node` | selectable or explicit empty-state when unavailable                               |
| `question_type`  | first-release supported question types only                                       |
| quantity         | bounded positive integer; quantity 10 must mean 10 requested drafts               |
| difficulty       | visible and included in request context                                           |
| learning goal    | visible and included in request context                                           |

AI 组卷 must expose and carry:

| Parameter                  | Expected contract                                                                 |
| -------------------------- | --------------------------------------------------------------------------------- |
| `profession`               | one of `monopoly`, `marketing`, `logistics`, displayed with stable Chinese labels |
| `level`                    | numeric 1, 2, 3, 4, 5 only                                                        |
| `subject`                  | `theory` or `skill`                                                               |
| question count             | bounded positive integer                                                          |
| question type distribution | visible and included in request context                                           |
| `knowledge_node` coverage  | selectable or explicit empty-state when unavailable                               |
| difficulty                 | visible and included in request context                                           |
| `paper_section` structure  | visible where a paper draft is expected                                           |
| paper goal                 | visible and included in request context                                           |

## Generated Result Contract

AI 出题 result expectations:

- If quantity is 10, show 10 structured question drafts or an explicit structured-parse failure.
- Each visible draft must expose a safe summary of `question_type`, answer/analysis status, knowledge coverage, difficulty, and review state.
- Content-admin outputs must require review before formal `question` creation.
- Learner outputs must not write formal `question`, `paper`, `mock_exam`, or public content.

AI 组卷 result expectations:

- Show paper title/summary, `paper_section`, question type distribution, question count, knowledge coverage, and review state.
- Content-admin outputs must require review before formal `paper` creation.
- Organization-admin outputs remain organization-owned draft/training sources until a later approved publish task.
- Learner outputs must not write formal `paper`, `mock_exam`, or reports.

Shared result expectations:

- Generation action must show loading, success, and error states near the operation area.
- The page must surface the current result near the action area or provide automatic focus/anchor navigation.
- AI 出题 history must not mix AI 组卷 results; AI 组卷 history must not mix AI 出题 results.
- History must default to `requestedAt` descending order and support pagination/filtering in the target contract.

## Target History API Contract

This task does not implement API changes. Future repair tasks should align to:

- `GET /api/v1/content-ai-generation-requests?generationKind=question|paper&page=1&pageSize=10`
- `GET /api/v1/organization-ai-generation-requests?generationKind=question|paper&page=1&pageSize=10`

The response must use `{ code, message, data, pagination }`.

Learner-side history must expose enough task metadata to distinguish:

- `taskType=ai_question_generation`
- `taskType=ai_paper_generation`

## Robustness Matrix

| Scenario                       | Expected result                                                    |
| ------------------------------ | ------------------------------------------------------------------ |
| Empty knowledge base           | Explicit empty-state; no misleading unsupported generated content. |
| No question bank               | AI 组卷 blocks or explains missing source questions.               |
| Missing Provider credential    | Clear failure; no secret or configuration value exposure.          |
| Provider timeout/failure       | Clear failed state, retry boundary, and safe error category.       |
| Non-structured Provider output | Structured-parse failure state; no false success.                  |
| Excessive quantity             | Frontend and service cap with clear message.                       |
| Rapid repeated click           | Duplicate task prevention or disabled submitting state.            |
| Long history                   | Pagination and filtering remain usable.                            |
| Evidence capture               | Redacted status/count/summary only.                                |

## Existing Issue Mapping

| Issue   | Matrix impact                                                | Priority |
| ------- | ------------------------------------------------------------ | -------- |
| `OP-01` | Learner AI 出题 / AI 组卷 task-function mismatch             | P1       |
| `OP-02` | AI generation lacks business context in empty baseline       | P2       |
| `OP-03` | Learner/employee active authorization treated as expired     | P0       |
| `OP-04` | Advanced organization admin downgraded to standard workspace | P0       |
| `OP-05` | Content/admin AI level enum uses legacy worker labels        | P1       |
| `OP-06` | AI 出题 quantity 10 does not yield 10 structured drafts      | P1       |
| `OP-07` | Generated content appears at page bottom with weak feedback  | P2       |
| `OP-08` | AI 出题 and AI 组卷 histories mix result types               | P2       |
| `OP-09` | History lacks explicit pagination/filtering UX               | P2       |

## Evidence Boundary

Allowed evidence:

- role labels
- route labels
- workflow labels
- status labels
- counts
- pass/fail/blocked/not_applicable outcomes
- validation commands and results
- redacted suspected-root-cause summaries

Forbidden evidence:

- passwords, account secrets, cookies, tokens, sessions, localStorage, Authorization headers
- `.env*` contents, connection strings, Provider credentials
- raw database rows, internal numeric ids, PII, phone/email originals, plaintext `redeem_code`
- Provider payloads, prompts, raw AI input/output
- full question, paper, material, resource, or chunk content
- screenshots, traces, raw DOM, HTML dumps
