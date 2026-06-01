# Phase 29 Staging Owner Acceptance Runbook Evidence

## Summary

- Result: pass.
- Scope: docs_only owner acceptance runbook.
- Changed surfaces: evidence only.
- Gates: Phase 28 role scripts converted into future staging execution order and result record template; no acceptance run was executed.
- Forbidden scope (`forbiddenScope`): no browser run, no staging/prod/cloud/deploy, no DB operation, no env/secret access, no provider call, no product-code/test/e2e changes.
- Residual gaps (`residualGaps`): owner acceptance execution waits for approved staging resources, secrets, migration/rollback, data setup, domain/TLS/callback, and monitoring.

## Future Staging Acceptance Order

| Order | Scenario                          | Source Phase 28 script     | Data prerequisite                                                                      | Expected result                                               | Evidence-safe result record                                   |
| ----- | --------------------------------- | -------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------- |
| 1     | Staging environment smoke         | Cross-cutting precondition | Staging URL, TLS, health check, seeded synthetic accounts                              | Owner can open staging over HTTPS and see expected app entry  | URL class, health status, timestamp, no headers/tokens        |
| 2     | Student login/session             | S1                         | Synthetic `student` account and staging-only session config                            | Student signs in, refreshes, and cannot access admin surfaces | pass/fail, role, public-safe route names                      |
| 3     | Student authorization/redeem      | S2                         | Synthetic `personal_auth`/`org_auth` and masked redeem scenario                        | Authorization state unlocks intended scope                    | status labels only; no plaintext `redeem_code`                |
| 4     | Student home                      | S3                         | Synthetic papers, authorization, recent activity                                       | Student sees clear next actions and unavailable states        | route names, visible state labels                             |
| 5     | Practice flow                     | S4                         | Synthetic `paper`, `question`, `question_option`, `paper_section`, active auth         | Student can answer, submit, and review supported feedback     | scenario outcome; no raw student answer                       |
| 6     | Mock exam flow                    | S5                         | Published synthetic paper configured for `mock_exam`                                   | Student completes submit/report entry path                    | scenario outcome; no internal DB IDs                          |
| 7     | Exam report and mistake book      | S6, S7                     | Completed attempt, `exam_report`, `mistake_book` entries                               | Student can review report and wrong-answer context            | report status, counts/classes only                            |
| 8     | AI explanation/hint surface       | S8                         | Mock AI by default, or separately approved real-provider gate                          | AI surfaces are discoverable and evidence-safe                | mock/real-approved label; no raw prompt/answer/model response |
| 9     | Admin user management             | A1                         | Synthetic admin/student/employee/disabled users                                        | Admin can inspect roles/status without secrets                | status labels; no credentials/session tokens                  |
| 10    | Organization and employee         | A2                         | Province/city/district `organization`, linked `employee`                               | Hierarchy and linkage are understandable                      | entity class/count; no private customer data                  |
| 11    | Org authorization and redeem code | A3, A4                     | Synthetic `org_auth`, masked redeem batch                                              | Quota/scope/status and redeem lifecycle are reviewable        | masked state only; no plaintext `redeem_code`                 |
| 12    | Content admin                     | A5, A6, A7, A8             | Synthetic `question`, `material`, `paper`, `knowledge_node`, `tag`                     | Admin can inspect content lifecycle and bindings              | titles/classes/counts; no full paper/textbook/OCR dump        |
| 13    | RAG/resource/model config         | A9, A10                    | Synthetic `resource`, `knowledge_base`, `chunk`, `citation`, local/mock `model_config` | Admin can inspect indexing/model states and known limits      | mock/fixture labels; no provider secrets                      |
| 14    | Audit and AI call logs            | A11, A12                   | Synthetic `audit_log`, redacted `ai_call_log`                                          | Operational logs are useful without sensitive payloads        | redaction status and event classes only                       |
| 15    | Owner closeout decision           | Phase 28 known limitations | Completed scenario records                                                             | Owner classifies pass, conditional pass, blocked, or fail     | signed decision path and residual gaps                        |

## Data Prerequisites

- Accounts: staging-only `admin`, `student`, `employee`, disabled/edge-state users where approved.
- Authorization: synthetic `personal_auth`, `org_auth`, active/expired/disabled examples.
- Redeem: masked redeem batch; plaintext `redeem_code` must never enter evidence.
- Content: synthetic `paper`, `paper_section`, `question`, `question_option`, `scoring_point`, `analysis`, `standard_answer`, `material`, `question_group`, `knowledge_node`, `tag`.
- Student activity: synthetic `practice`, `mock_exam`, `answer_record`, `exam_report`, `mistake_book`.
- AI/RAG: mock by default for `ai_scoring`, `ai_explanation`, `ai_hint`, `ai_call_log`, `knowledge_base`, `resource`, `chunk`, `citation`; real provider only if separately approved.
- Audit: synthetic `audit_log` events for admin and student workflows.

## Result Record Template

| Scenario id | Owner           | Prerequisite status | Expected result                     | Observed result   | Evidence path        | Risk/gap       | Approval decision         |
| ----------- | --------------- | ------------------- | ----------------------------------- | ----------------- | -------------------- | -------------- | ------------------------- |
| `S1`        | Owner name/role | ready/blocked       | Student login/session works         | pass/fail/blocked | future evidence path | none or gap id | approve/conditional/block |
| `A12`       | Owner name/role | ready/blocked       | AI call log redaction is acceptable | pass/fail/blocked | future evidence path | none or gap id | approve/conditional/block |

## Execution Boundary

This runbook is not execution approval. Future staging acceptance requires approved staging deployment, secret/env configuration, migration/rollback, synthetic data setup, monitoring, and owner account handling.
