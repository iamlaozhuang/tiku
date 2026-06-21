# Audit Review: Discovered Issue Closure Governance Seed

**Date:** 2026-06-21
**Task id:** `discovered-issue-closure-governance-seed`
**Review type:** `docs_state_governance_seed`
**Runtime claim:** none

## Batch Serial Closure Inventory

| itemId                                       | sourceCoverage                                        | closureTrack     | classification                                                               | nextAction                                                                                                            |
| -------------------------------------------- | ----------------------------------------------------- | ---------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| fix-student-mistake-book-session             | audit RF-0621-01; role RX-01; user background         | already_fixed    | `local_implementation`                                                       | Do not re-implement; only cite `04f82c7e` if later evidence needs the fact.                                           |
| clarify-student-subject-and-paper-count-copy | audit RF-0621-07; role RX-02/RX-03; user order 1      | fix              | `local_implementation`; `runtime_verification_later`                         | Low-risk UI copy and focused unit validation; runtime proof remains later because browser/e2e/dev server are blocked. |
| recheck-adr-006-ai-sdk-baseline              | audit RF-0621-06; role super_admin; user order 2      | decision_package | `docs_decision`; `approval_blocked`                                          | Reconcile ADR-006 with installed AI SDK packages; no dependency or Provider work.                                     |
| decide-content-admin-ai-generation-scope     | audit RF-0621-02; role RX-05; user order 3            | decision_package | `docs_decision`; `approval_blocked`; `security_review_required`              | Decide whether content_admin AI 出题/AI 组卷 enters standard scope and define Provider/formal-content gates.          |
| decide-org-auth-scope-product-model          | audit RF-0621-03; role RX-04; user order 4            | decision_package | `docs_decision`; `approval_blocked`; `security_review_required`              | Decide `subject`, multi-`profession`, multi-`level`, and shared enterprise backend rules before code/schema work.     |
| decide-paper-count-and-question-type-policy  | audit RF-0621-04/RF-0621-05; role RX-06; user order 5 | decision_package | `docs_decision`; `runtime_verification_later`                                | Define paper question-count cap, performance acceptance, and legacy alias compatibility/downline policy.              |
| plan-admin-experience-gap-closures           | role content_admin/ops_admin blockers; user order 6   | split_plan       | `local_implementation`; `runtime_verification_later`                         | Split question/material binding, redeem_code detail, and organization management completion into reviewable tasks.    |
| plan-org-auth-implementation-split           | user order 7; depends on org_auth product decision    | split_plan       | `docs_decision`; `approval_blocked`; `security_review_required`              | Split contract/service/UI/schema work and security review checklist; no schema/runtime change in this batch step.     |
| plan-advanced-enterprise-training-path       | role employee gap; user order 8                       | blocked_plan     | `approval_blocked`; `security_review_required`; `runtime_verification_later` | Record enterprise/employee training path closure plan and unblock criteria after authorization model stabilizes.      |

## Findings

| severity | findingId    | finding                                                                                                                            | decision                                                                                                             |
| -------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| medium   | DISC-0621-01 | Queue-ready audit suggestions alone are incomplete; role matrix and user-specified items add admin/enterprise blockers.            | Batch registry must merge all three sources.                                                                         |
| medium   | DISC-0621-02 | Existing mistake_book queue entry still appears `ready_for_closeout`, but Git evidence shows the fix commit is on `origin/master`. | Treat as already fixed in this batch and avoid duplicate code changes.                                               |
| high     | DISC-0621-03 | Several requested tasks touch Provider, dependency, schema, authorization model, or browser/e2e gates.                             | Convert high-risk items into decision packages, split plans, or blocked records under the current approval boundary. |

## Audit Conclusion

The seed is valid only if state updates register the batch scope and the validation evidence confirms formatting and Module Run v2 readiness for the docs/state-only task. It does not close any runtime experience by itself.
