# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Marketing 3 Content Provisioning Evidence

Status: blocked

## Scope

- Task id: `full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-learning-rerun-after-marketing-3-content-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_10_standard_employee_learning_rerun_after_marketing_3_content_provisioning`
- Role label: `org_standard_employee`

## Evidence Lanes

| Lane                              | Status  | Redacted summary                                                                                                                                                           |
| --------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task materialization              | pass    | Plan, state, queue, evidence, and audit are aligned before runtime/preflight.                                                                                              |
| Selector/DB preflight             | pass    | Exact target, private selector shape, standard org auth, employees, content, and baselines were verified.                                                                  |
| API session lane                  | pass    | Local browser session reached authenticated student surfaces without recording private/session material.                                                                   |
| Browser login form-state lane     | pass    | Hydrated/interactable readiness was observed before private input fill; submit became enabled and navigation succeeded.                                                    |
| Standard learning lane            | blocked | One standard practice answer was submitted and scored, but follow-up aggregate verification found duplicate active practice rows for the same selected employee and paper. |
| Permission/surface boundary lane  | pass    | Standard employee could not submit enterprise training or AI generation actions.                                                                                           |
| Selector-scoped aggregate DB lane | blocked | Aggregate DB counts show answer data plus duplicate active practice state requiring repair before rerun.                                                                   |

## Redaction Guard

- Employee private values output: false
- Phone/email/password/token/session/cookie/localStorage/Authorization header output: false
- Connection string/env value/raw DB row/internal id output: false
- Screenshot/raw DOM/trace output: false
- Provider payload/raw Prompt/raw AI I/O output: false
- Full private material/question/paper/answer content output: false
- Plaintext card values output: false
- Release readiness/final Pass/production usability claimed: false

## Selector/DB Preflight Aggregates

Command name: redacted selector/db target/private input preflight.

| Check                                                 | Result |
| ----------------------------------------------------- | ------ |
| `db_target_match`                                     | 1      |
| private account plan present                          | 1      |
| private standard employee import selector present     | 1      |
| private standard employee import CSV present          | 1      |
| private standard employee import rows                 | 6      |
| active standard `marketing:3` org auth                | 1      |
| active standard `marketing:3` employees               | 6      |
| published `marketing:3` paper                         | 1      |
| published `marketing:3` paper questions               | 7      |
| available `marketing:3` material                      | 2      |
| available `marketing:3` questions                     | 7      |
| standard employees `marketing:3` practice before      | 0      |
| standard employees `marketing:3` mock_exam before     | 0      |
| standard employees `marketing:3` answer_record before | 0      |
| standard employees `marketing:3` exam_report before   | 0      |
| standard employees `marketing:3` mistake_book before  | 0      |
| standard employee organization_training_answer        | 0      |
| selected-scope ai_call_log                            | 0      |

## Browser Login Form-State Lane

Command name: redacted browser login smoke with hydrated/interactable readiness.

| Check                                                | Result  |
| ---------------------------------------------------- | ------- |
| login page hydrated/interactable before private fill | pass    |
| form state observed after fill                       | pass    |
| submit enabled after fill                            | pass    |
| login navigation observed                            | pass    |
| route label after login                              | `/home` |
| private value output                                 | false   |

## Standard Learning Lane

Command name: redacted standard employee practice learning flow.

| Check                     | Result      |
| ------------------------- | ----------- |
| route label               | `/practice` |
| selected option count     | 1           |
| submitted answer count    | 1           |
| feedback visible          | true        |
| disabled submit count     | 1           |
| next button count         | 1           |
| AI action button observed | 1           |
| AI action clicked         | false       |
| private value output      | false       |
| public/internal id output | false       |

## Permission/Surface Boundary Lane

Command name: redacted standard employee permission/surface boundary check.

| Surface label         | Result summary                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| organization-training | unavailable or empty surface observed; answer area count 0; submit button count 0; enterprise training submit clicked false                            |
| ai-generation         | unavailable or denied surface observed; enabled AI action button count 0; AI generation submit clicked false; Provider call triggered by browser false |

## Selector-Scoped Aggregate DB Lane

Command name: selector-scoped aggregate DB verification.

| Check                                               | Result |
| --------------------------------------------------- | ------ |
| `db_target_match`                                   | 1      |
| selected-scope `ai_call_log` after                  | 0      |
| standard-scope `exam_report` after                  | 0      |
| standard-scope `mistake_book` after                 | 0      |
| standard-scope `mock_exam` after                    | 0      |
| standard-scope `organization_training_answer` after | 0      |
| standard-scope `practice` after                     | 2      |
| standard-scope `answer_record` after                | 1      |
| standard-scope user count                           | 6      |
| answer record status `scored`                       | 1      |
| practice subject/status `theory:in_progress`        | 2      |
| practice distinct user count                        | 1      |
| practice distinct paper count                       | 1      |
| practice duplicate user-paper groups                | 1      |
| practice in-progress count                          | 2      |

## Runtime Cleanup

Command name: local runtime cleanup.

| Check           | Result |
| --------------- | ------ |
| runtime cleanup | pass   |

## Closeout Gates

| Gate                               | Result |
| ---------------------------------- | ------ |
| scoped Prettier write              | pass   |
| scoped Prettier check              | pass   |
| `git diff --check`                 | pass   |
| blocked path diff                  | pass   |
| Module Run v2 pre-commit hardening | pass   |
| Module Run v2 pre-push readiness   | pass   |

## Stop-On-Fail Result

Status: blocked.

Reason: duplicate active `practice` rows for the same selected standard employee and selected `marketing:3` paper after a single browser UI learning flow. This requires a separate practice start/resume idempotency repair before Scenario 10 can pass.

Next task: `full-chain-scenario-10-practice-start-idempotency-repair-2026-07-04`.

## Non-Claims

Scenario 10 completion, Scenario 11, Provider, AI generation submit, staging/prod, Cost Calibration, release readiness, final Pass, production usability, and complete full-chain acceptance are not claimed.
