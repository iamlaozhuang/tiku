# Layer 2 Business Closure Evidence Rollup Acceptance

Task id: `layer-2-business-closure-evidence-rollup-2026-06-27`

Decision: `LAYER_2_EVIDENCE_ROLLUP_COMPLETE_BUSINESS_CLOSURE_NOT_YET_CLOSED`

moduleRunVersion: 2

threadRolloverGate: continue_current_thread_for_docs_state_rollup

automationHandoffPolicy: no_new_thread_or_subagent_required_for_this_docs_state_task

Cost Calibration Gate remains blocked.

## Scope

This acceptance rollup maps existing evidence to the smallest remaining Layer 2 business-function closure chain. It does
not execute browser/dev-server/e2e, DB connection/read/write, credential reads, Provider calls, Cost Calibration, real
mutation, formal publish, student-visible runtime, staging/prod/deploy/payment/external-service work, OCR execution,
export generation, PR, force push, release readiness, or final Pass.

## Requirement Sources

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-21-content-admin-ai-generation-scope-decision.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Layer Progress

| Layer                                  | Current acceptance status                                                          | Evidence basis                                                                                                                             | Residual gate                                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission          | Complete and retained as no-regression boundary                                    | Existing role-separated local runtime and acceptance ledger                                                                                | Do not claim new runtime evidence in this task                                                        |
| Layer 2 business function loop         | Partial. Evidence rollup complete, but smallest business closure is not yet closed | Content-admin review contracts, local UI validation, credentialed smoke evidence, read models, and adjacent formal draft boundary evidence | Fresh approval for source/test adoption command contract or separately approved local runtime path    |
| Layer 3 real Provider/cost/pre-release | Blocked                                                                            | High-risk approval matrix and package consolidation ledger                                                                                 | Fresh approval for each Provider, cost, staging/prod, payment, OCR, export, and external-service gate |

## Layer 2 Coverage Matrix

| Closure row                                                  | Requirement source                                                                     | Current evidence                                                                                                                                                                                                           | Highest local level                                                        | Coverage status                       | Residual gap                                                                                      | Next approval                                                                        |
| ------------------------------------------------------------ | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Content-admin generated-result review entry and traceability | Advanced AI task domain; formal content separation story; content admin scope decision | `2026-06-27-content-admin-review-single-result-traceability-source-tdd.md`, `2026-06-27-content-admin-review-ui-implementation-local-validation.md`, `2026-06-27-content-admin-review-credentialed-browser-smoke-rerun.md` | Source contract TDD plus UI local validation plus prior credentialed smoke | Partial                               | Review surface is visible and redacted, but adopt/reject command closure is not proven            | Source/test approval for adoption command contract TDD                               |
| Explicit adopt/reject command contract                       | Formal content separation story; role-separated MVP alignment                          | Existing evidence intentionally leaves adoption controls disabled/unexecuted                                                                                                                                               | Not covered                                                                | Gap                                   | Need command contract, failure modes, redacted audit trail, and no student-visible publish        | Fresh approval for `content-admin-review-adoption-command-contract-tdd-2026-06-27`   |
| Batch selection and retry preview                            | Advanced AI task domain; provider boundary decisions                                   | `2026-06-27-content-admin-review-batch-selection-source-contract-tdd.md`, `2026-06-27-content-admin-review-failed-retry-source-contract-tdd.md`                                                                            | Source contract TDD                                                        | Partial                               | Selection and retry remain preview/request state only; no Provider retry or mutation              | Fresh source/test approval for local command contract; Provider retry still separate |
| Diff and adoption history read models                        | Formal content separation story; traceability decisions                                | `2026-06-27-content-admin-review-result-diff-read-model-source-tdd.md`, `2026-06-27-content-admin-review-adoption-history-read-model-source-tdd.md`                                                                        | Source contract TDD                                                        | Covered for read-only local model     | Mutation and formal adoption are not proven                                                       | Pair with adoption command contract                                                  |
| Batch/retry/diff/history UI composition                      | Admin ops requirements; role experience matrix                                         | `2026-06-27-content-admin-review-batch-retry-diff-history-ui-local-validation.md`                                                                                                                                          | Unit/component local validation                                            | Partial                               | Browser rerun and mutation remain blocked                                                         | Fresh browser/dev-server approval if route runtime evidence is required              |
| Formal draft/publish boundary                                | Question-paper requirements; formal content separation story                           | `2026-06-27-formal-publish-local-execution-one-draft-paper.md`                                                                                                                                                             | Separate local formal publish execution evidence                           | Adjacent only                         | Evidence is not generated-result adoption and must not be merged into content-admin closure claim | Fresh formal publish/student-visible approval if needed                              |
| Learner private AI generation                                | Personal AI generation requirements                                                    | `2026-06-27-learner-ai-generation-private-result-practice-paper-attempt-tdd.md`                                                                                                                                            | Source contract TDD                                                        | Covered for private-use boundary only | Student-visible formal content remains blocked                                                    | No Layer 2 content-admin closure claim from this row                                 |
| Organization analytics/export                                | Organization AI generation and admin ops requirements                                  | `2026-06-27-organization-analytics-admin-ui-implementation-local-validation.md`                                                                                                                                            | UI local validation                                                        | Partial                               | Export and browser route smoke remain blocked                                                     | Fresh export/browser approval if required                                            |

## Minimal Layer 2 Closure Path

The smallest next task is `content-admin-review-adoption-command-contract-tdd-2026-06-27`.

Minimum expected coverage for that next task:

- source/test-only contract for content-admin adopt/reject command;
- redacted traceability from generated review result to draft `question`/`paper` candidate;
- explicit failure modes for missing review decision, stale result, duplicate adoption, and role mismatch;
- no DB runtime connection, no real mutation execution, no formal publish, and no student-visible runtime unless separately
  approved.

## Copyable Next Approval Text

```text
我 fresh approve 一个 source/test-only Layer 2 最小业务闭环任务：
content-admin-review-adoption-command-contract-tdd-2026-06-27。
范围仅限相关 source contract、focused unit tests、task plan/evidence/audit/acceptance、project-state.yaml 和
task-queue.yaml。允许定义 content-admin review adopt/reject command contract、redacted traceability、失败场景和本地
focused unit tests。完成后按独立短分支执行 local commit、ff-only merge to master、master 门禁、push origin/master
并删除已合入短分支。
不批准浏览器/dev-server/e2e、DB 连接或真实读写、凭据读取、Provider call、Cost Calibration、真实 adoption/retry
mutation、formal publish、student-visible runtime、staging/prod/deploy/payment/external service、OCR/export 执行、
PR、force push、release readiness 或 final Pass。
```

## Non-Claims

- This task does not claim Layer 2 full business closure.
- This task does not claim real Provider readiness.
- This task does not claim Cost Calibration readiness.
- This task does not claim staging/prod, payment, OCR, export, or external-service readiness.
- This task does not claim release readiness or final Pass.
