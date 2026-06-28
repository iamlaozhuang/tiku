# Full Acceptance Matrix + Full Unit Baseline Repair

- Requirement id: `full-acceptance-matrix-unit-baseline-repair-2026-06-28`
- Source task: `full-acceptance-matrix-unit-baseline-repair-requirements-2026-06-28`
- Status: requirements materialization

## Objective

Complete full all-role/all-flow/all-function local acceptance only after the repository full unit baseline is repaired to green. Until that happens, this document is a requirements matrix and execution gate, not acceptance evidence.

## Non-Negotiable Gates

| Gate                       | Required result                                                                                                                                      |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Governance materialization | Task plan, queue, project state, boundaries, redaction, and closeoutPolicy exist before runtime/source work                                          |
| Full unit baseline         | `npm run test:unit` passes before final matrix acceptance can be considered complete                                                                 |
| Sensitive evidence         | No credentials, secrets, raw DOM, raw DB rows, Provider payloads, prompts, raw AI output, or complete question/paper/material/resource/chunk content |
| Authorization source       | Edition-aware authorization follows the ADR-defined source of truth; UI visibility is not an auth boundary                                           |
| Provider/Cost Calibration  | Provider calls, Provider config, prompt templates, model_config, Cost Calibration, and pricing/quota decisions require fresh task approval           |
| Final decision             | Release readiness and final Pass require fresh owner decision after all evidence is present                                                          |

## Role Coverage Axis

| Role label                  | Required coverage intent                                                                                      | Current known status                                                    |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `personal_standard_student` | Login/session, home, authorization-limited AI states, practice, mock_exam, mistake_book, negative paths       | Partial local coverage; direct practice/mock empty-state gaps remain    |
| `personal_advanced_student` | Login/session, advanced AI entry points, practice, mock_exam, mistake_book, negative paths                    | Partial local coverage; direct practice empty-state gap remains         |
| `org_standard_employee`     | Login/session, organization training unavailable/limited states, student workflows, standard AI restrictions  | Partial local coverage; prior copy repair completed                     |
| `org_advanced_employee`     | Login/session, organization training, student workflows, advanced AI entry points                             | Partial local coverage; prior copy repair completed                     |
| `org_standard_admin`        | Organization portal, standard authorization boundaries, direct advanced route unavailable states              | Partial local coverage; prior `org_auth` copy repair completed          |
| `org_advanced_admin`        | Organization portal, organization analytics, organization training, organization AI question/paper generation | Partial local coverage; analytics summary load gap remains              |
| `content_admin`             | Paper/question management, content AI question/paper review, ops denial boundaries                            | Partial local coverage; traceability copy gap remains                   |
| `ops_admin`                 | User ops, redeem_code/org authorization ops, AI logs/governance, content denial boundaries                    | Partial local coverage; prompt/provider permission and copy gaps remain |
| `super_admin`               | Administrative oversight routes and denial/permission boundaries where implemented                            | Requires inventory in full matrix execution                             |
| `auditor`                   | Read-only oversight/log review routes and denial/permission boundaries where implemented                      | Requires inventory in full matrix execution                             |

## Workflow Coverage Axis

| Workflow id            | Workflow                                                                                   | Required evidence                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `WF-AUTH-001`          | Login, logout, session retention, unauthenticated route guard                              | Redacted role/session state labels only                            |
| `WF-AUTHZ-001`         | Personal and organization authorization boundaries, edition gating, expired/revoked states | Role label, scope label, pass/fail/blocker                         |
| `WF-STUDENT-001`       | Student home, practice, mock_exam, mistake_book                                            | Route/workflow status and empty/error-state behavior               |
| `WF-STUDENT-AI-001`    | Student AI question/paper entry states                                                     | UI permission state; Provider budget required for actual calls     |
| `WF-ORG-ADMIN-001`     | Organization portal, employee/workplace navigation                                         | Route/workflow status                                              |
| `WF-ORG-TRAINING-001`  | Organization training admin and employee flows                                             | Route/workflow status and permission state                         |
| `WF-ORG-ANALYTICS-001` | Organization analytics summary and filters                                                 | Aggregate UI state only; DB diagnosis requires separate gate       |
| `WF-ORG-AI-001`        | Organization AI question/paper generation entry states                                     | UI permission state; Provider budget required for actual calls     |
| `WF-CONTENT-001`       | Question/paper/material management surfaces                                                | Redacted route/workflow status only                                |
| `WF-CONTENT-AI-001`    | Content AI generation, review, traceability states                                         | Redacted state labels; no prompt/payload/raw AI output             |
| `WF-OPS-001`           | User ops, redeem_code and organization authorization operations                            | Redacted route/workflow status; no plaintext contact/redeem_code   |
| `WF-OPS-AI-001`        | AI call logs/governance, prompt/provider/model affordance permissions                      | Permission state; provider/model_config changes require fresh gate |
| `WF-DENIAL-001`        | Cross-role negative access checks                                                          | Denied route/workflow status only                                  |
| `WF-EMPTY-ERROR-001`   | Empty, unavailable, loading, and error states                                              | Owner-facing copy/status summary                                   |

## Matrix Exit Criteria

| Exit criterion     | Required state                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Full unit baseline | Green with zero known baseline failures                                                                     |
| Matrix row status  | Every role/workflow row is `pass`, `fail`, or `blocked`                                                     |
| Critical gaps      | Zero open critical gaps unless explicitly blocked by a fresh high-risk approval gate                        |
| Evidence           | Redacted command/status/count/gap summaries only                                                            |
| Source changes     | Any repair uses TDD and follows allowedFiles/blockedFiles for its specific task                             |
| Closeout           | No merge, push, branch cleanup, release readiness, or final Pass without task-level closeoutPolicy approval |

## Known Starting Gaps

| Gap id                             | Severity | Area                   | Starting status                                                          |
| ---------------------------------- | -------- | ---------------------- | ------------------------------------------------------------------------ |
| `ORG-ADV-ANALYTICS-001`            | major    | Organization analytics | Advanced admin summary load fails                                        |
| `OPS-PROMPT-PERMISSION-001`        | critical | Ops AI governance      | Provider/model/prompt-template affordances visible to ordinary ops_admin |
| `OPS-LOG-COPY-001`                 | minor    | Ops AI governance      | Internal terminology visible                                             |
| `CONTENT-AI-TRACEABILITY-COPY-002` | minor    | Content AI review      | Raw contract/status copy visible                                         |
| `STUDENT-DIRECT-PRACTICE-001`      | minor    | Student direct entry   | Direct practice without context lacks guided empty state                 |
| `STUDENT-DIRECT-MOCK-001`          | minor    | Student direct entry   | Direct mock_exam without context can show error                          |

## Full Unit Baseline Repair Requirements

The repair task must start from a reproduced `npm run test:unit` failure and must not declare completion until the same command passes. Prior failure classes are:

- Cookie/header baseline assertions.
- Organization authorization service validation.
- Organization analytics mapper baseline.
- Personal AI component mock export.
- Organization portal link expectation.
- Ops/content runtime expectations.

Repair rules:

- Diagnose root cause before editing.
- Prefer product-contract fixes over weakening assertions.
- If a test is stale, document the intended contract and update it narrowly.
- Keep dependency, DB, schema, migration, Provider, browser, and e2e work out of the unit repair task.
