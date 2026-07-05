# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Rerun After Duplicate Active Practice State Provisioning Evidence

Status: pass

## Scope

- Task id: `full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Content scope label: `marketing:3`
- Scenario selector label: `fc_scenario_10_standard_employee_learning_rerun_after_duplicate_active_practice_state_provisioning`
- Role label: `org_standard_employee`

## Evidence Lanes

| Lane                              | Status | Redacted summary                                                                                                                                    |
| --------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Task materialization              | pass   | Plan, state, queue, evidence, and audit are aligned before runtime/preflight.                                                                       |
| Selector/DB preflight             | pass   | Exact target, private selector shape, standard org auth, employees, content, and duplicate-state baseline were verified.                            |
| API session lane                  | pass   | Local browser session reached authenticated student surfaces without recording private/session material.                                            |
| Browser login form-state lane     | pass   | Hydrated/interactable readiness was observed before private input fill; submit became enabled and navigation succeeded.                             |
| Standard learning lane            | pass   | Standard employee selected `marketing:3`, resumed existing practice, submitted one product UI answer, and observed feedback.                        |
| Permission/surface boundary lane  | pass   | Standard employee could not submit enterprise training or AI generation actions.                                                                    |
| Selector-scoped aggregate DB lane | pass   | Learning data increased by aggregate count; duplicate active practice groups remained zero; Provider/AI and enterprise-training writes stayed zero. |
| Runtime cleanup                   | pass   | Task-started local runtime was stopped.                                                                                                             |
| Closeout gates                    | pass   | Scoped Prettier, whitespace, blocked path diff, Module Run v2 pre-commit, and Module Run v2 pre-push gates passed.                                  |

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

Command name: redacted selector/db target/private input/content/duplicate-state preflight.

| Check                                                  | Result |
| ------------------------------------------------------ | ------ |
| `db_target_match`                                      | 1      |
| private account plan present                           | 1      |
| private standard employee import selector present      | 1      |
| private standard employee import CSV present           | 1      |
| private standard employee import rows                  | 6      |
| active standard `marketing:3` org auth                 | 4      |
| active standard `marketing:3` employees                | 6      |
| published `marketing:3` paper                          | 1      |
| published `marketing:3` paper questions                | 7      |
| available `marketing:3` material                       | 2      |
| available `marketing:3` questions                      | 7      |
| standard employees `marketing:3` practice before       | 2      |
| standard employees `marketing:3` in-progress practice  | 1      |
| standard employees `marketing:3` expired practice      | 1      |
| duplicate active user-paper practice groups before     | 0      |
| standard employees `marketing:3` answer_record before  | 1      |
| standard employees `marketing:3` scored answers before | 1      |
| standard employee organization_training_answer         | 0      |
| selected-scope ai_call_log                             | 0      |

## Browser Login Form-State Lane

Command name: redacted browser login smoke with hydrated/interactable readiness.

| Check                                                | Result  |
| ---------------------------------------------------- | ------- |
| local runtime startup target                         | pass    |
| login page hydrated/interactable before private fill | pass    |
| form state observed after fill                       | pass    |
| submit enabled after fill                            | pass    |
| login POST status                                    | 200     |
| login navigation observed                            | pass    |
| route label after login                              | `/home` |
| private value output                                 | false   |

Note: initial local dev server startup used an incorrect DB password shape and produced login POST 500. The runtime was restarted with the local container DB environment read in memory only; no connection string, env value, product source, schema, migration, seed, dependency, Provider, staging/prod, or Cost action was introduced.

## Standard Learning Lane

Command name: redacted standard employee practice learning flow.

| Check                                     | Result        |
| ----------------------------------------- | ------------- |
| scope button count                        | 3             |
| selected scope label                      | `marketing:3` |
| practice link count after scope selection | 1             |
| practice start POST status                | 200           |
| route label                               | `/practice`   |
| resume choice observed                    | true          |
| resume continue clicked                   | true          |
| selected option count                     | 1             |
| submitted answer count                    | 1             |
| feedback visible                          | true          |
| disabled submit count                     | 1             |
| next button count                         | 1             |
| AI action button observed                 | 0             |
| AI action clicked                         | false         |
| private value output                      | false         |
| public/internal id output                 | false         |

## Permission/Surface Boundary Lane

Command name: redacted standard employee permission/surface boundary check.

| Surface label         | Result summary                                                                                                    |
| --------------------- | ----------------------------------------------------------------------------------------------------------------- |
| home navigation       | AI training link count 0; organization training link count 0                                                      |
| organization-training | answer area count 0; enabled submit button count 0; enterprise training submit clicked false; submit POST count 0 |
| ai-generation         | enabled AI action button count 0; AI generation submit clicked false; Provider/AI generation submit POST count 0  |

## Selector-Scoped Aggregate DB Lane

Command name: selector-scoped aggregate DB verification.

| Check                                               | Result |
| --------------------------------------------------- | ------ |
| `db_target_match`                                   | 1      |
| active standard `marketing:3` org auth              | 4      |
| active standard `marketing:3` employees             | 6      |
| published `marketing:3` paper                       | 1      |
| published `marketing:3` paper questions             | 7      |
| standard-scope `practice` after                     | 2      |
| standard-scope `practice` in progress after         | 1      |
| standard-scope `practice` expired after             | 1      |
| practice duplicate active user-paper groups after   | 0      |
| standard-scope `answer_record` after                | 2      |
| answer record status `scored` after                 | 2      |
| standard-scope `mock_exam` after                    | 0      |
| standard-scope `exam_report` after                  | 0      |
| standard-scope `mistake_book` after                 | 1      |
| standard-scope `organization_training_answer` after | 0      |
| selected-scope `ai_call_log` after                  | 0      |

## Runtime Cleanup

Command name: local runtime cleanup.

| Check                    | Result |
| ------------------------ | ------ |
| runtime cleanup          | pass   |
| remaining 3106 listeners | 0      |

## Closeout Gates

| Gate                               | Result |
| ---------------------------------- | ------ |
| scoped Prettier write              | pass   |
| scoped Prettier check              | pass   |
| `git diff --check`                 | pass   |
| blocked path diff                  | pass   |
| Module Run v2 pre-commit hardening | pass   |
| Module Run v2 pre-push readiness   | pass   |

## Non-Claims

Scenario 11, Provider, AI generation submit, staging/prod, Cost Calibration, release readiness, final Pass, production usability, and complete full-chain acceptance are not claimed.
