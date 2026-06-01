# Phase 26 Runtime Capability Matrix Evidence

## Summary

- Result: pass.
- Scope: docs_only.
- Changed surfaces: Phase 26 runtime matrix plan/evidence and readiness baseline audit report.
- Gates: route/source/test inventory completed; final validation recorded in closeout evidence.
- Forbidden scope (`forbiddenScope`): no product-code edit, no script/test/e2e edit, no DB/env/provider/staging/prod/cloud/deploy action.
- Residual gaps (`residualGaps`): real provider, staging/prod, and owner acceptance remain blocked or unverified.

## Inventory Commands

- `rg --files src/app/api/v1`: `91` API route files.
- `rg --files src/server/services`: `93` service files.
- `rg --files src/server/repositories`: `29` repository files.
- `rg --files src/db/schema`: `11` schema/test files.
- `rg --files tests/unit`: `77` unit test files.
- `rg --files e2e`: `10` e2e spec files.

## Capability Matrix

| Area          | Status                | Basis                                                                                                                                         | Residual risk                                                                    |
| ------------- | --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 学员端        | verified              | Student routes exist for home, practice, mock exam, report, profile, redeem code, and mistake book; Phase 22 student smoke passed.            | Local/dev and synthetic data only; owner acceptance not yet run.                 |
| 后台端        | verified              | Admin content/ops routes exist; Phase 22 admin smoke passed.                                                                                  | Role-specific owner review and staging access still pending.                     |
| 用户/会话     | verified              | Auth/register/login/session surfaces and tests exist; Phase 22 auth/session smoke passed.                                                     | Production session policy and staged callback domains remain gated.              |
| 授权          | verified              | `authorizations`, `personal-auths`, `org-auths`, `student-papers`, and redeem routes exist; Phase 20/21 closed key concurrency/overlap tails. | External purchase/contact and staging data still need owner review.              |
| 组织/员工     | implemented           | Organization, employee, org_auth routes/services/UI exist and unit coverage is present.                                                       | Full customer org hierarchy acceptance not performed.                            |
| 题库          | implemented           | Question routes/services/repositories and admin UI exist.                                                                                     | Rich text/media workflow and teacher UX require owner acceptance.                |
| 材料          | implemented           | Material routes/services and content UI exist.                                                                                                | Full file conversion/storage remains local/mock bounded.                         |
| 试卷          | verified              | Paper/paper_asset/composition/publish/archive/copy routes and Phase 20 paper fixes exist.                                                     | Real content authoring acceptance still needed.                                  |
| 练习          | verified              | Practice routes/services/UI and student e2e coverage exist.                                                                                   | Offline/retry behavior remains evidence-limited.                                 |
| 模考          | verified              | Mock exam routes/services/UI/report routes exist; Phase 22/23 full e2e passed.                                                                | Long-running scoring/timeout behavior remains local/mock limited.                |
| 报告          | implemented           | Exam report routes/services/UI and learning suggestion retry route exist.                                                                     | Analytics depth and owner-facing report quality need review.                     |
| 错题本        | verified              | Mistake book routes/UI exist; Phase 23 fixed fresh-data prerequisite and full e2e passed.                                                     | Data-prep dependent; real learner history not validated.                         |
| AI 评分       | mock-only verified    | AI scoring service/tests, retry persistence evidence, `ai_call_log`, and mock provider flows exist.                                           | Real provider, cost, quota, and prompt output quality remain blocked.            |
| AI 讲解/提示  | mock-only implemented | Explanation/hint services/tests exist; routes for mistake-book AI explanation exist.                                                          | Real model quality and RAG citation UX need gated provider/content validation.   |
| RAG/知识库    | mock-only implemented | Resource, chunking, retrieval, knowledge node, and mock embedding pipeline evidence exist.                                                    | Hybrid/rerank and real-content scale remain local/mock or redacted-content only. |
| 审计          | verified              | Audit log API/UI and Phase 22 admin audit navigation evidence exist.                                                                          | Retention/monitoring policies for staging/prod not unlocked.                     |
| Fresh DB 验证 | verified              | Phase 23 first-run fresh DB, Phase 24 repeatability, and Phase 25 hardened runner evidence passed.                                            | This Phase 26 batch intentionally did not rerun full fresh DB validation.        |

## Safety Notes

- Capability status is an evidence classification, not a claim of production readiness.
- No sensitive value or provider payload is recorded.
