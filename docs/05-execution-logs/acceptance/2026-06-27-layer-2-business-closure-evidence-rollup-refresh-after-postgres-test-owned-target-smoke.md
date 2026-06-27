# Layer 2 Business Closure Evidence Rollup Refresh After PostgreSQL Test-Owned Target Smoke Acceptance

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`

Decision: `LAYER_2_POSTGRES_TEST_OWNED_REJECTED_ROLLUP_REFRESHED_LAYER3_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This acceptance refresh updates the Layer 2 evidence rollup after
`content-admin-review-adoption-local-postgres-test-owned-target-setup-execution-2026-06-27` passed one local PostgreSQL
test-owned target setup plus one `rejected` route/runtime smoke.

This task is docs/state-only. It does not run browser, dev-server, e2e, DB, Provider, Cost Calibration, real adoption or
retry mutation, formal publish, student-visible runtime, staging/prod/deploy/payment, external service, OCR/export,
archive/index movement, PR, force push, release readiness, or final Pass.

## Refreshed Three-Layer Status

| Layer                                  | Refreshed status                                                                                                                                                     | Evidence basis                                                                                                                        | Remaining gate                                                                                                                                                                  |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission          | Complete for the existing local role/entry/permission no-regression boundary                                                                                         | Prior Layer 1 acceptance and no role/entry/source/runtime changes in this task                                                        | Future role, route, auth, UI, or browser changes must preserve this boundary                                                                                                    |
| Layer 2 business function loop         | Minimum local PostgreSQL `rejected` review-command slice is now rolled up: test-owned target setup, one rejected route/service command, and redacted readback passed | Source/test command contract, injected route smoke, approval package, and local PostgreSQL test-owned target setup execution evidence | Optional `approved` formal-draft path, credentialed browser observation, formal publish, and student-visible runtime remain separate owner decisions                            |
| Layer 3 real Provider/cost/pre-release | Blocked                                                                                                                                                              | ADR-006 provider boundary, ADR-004/005 environment boundaries, high-risk package ledger, and Cost Calibration blocked gate            | Fresh approval required for Provider smoke, Provider config/credentials, Cost Calibration, staging/prod, deploy, payment, OCR/export, and external-service execution or changes |

## Layer 2 Delta After PostgreSQL Smoke

| Closure row                                   | Previous status after route-smoke rollup                         | Refreshed status after PostgreSQL smoke              | What changed                                                                                                                                  | Still blocked                                                                                          |
| --------------------------------------------- | ---------------------------------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Explicit adopt/reject command contract        | Covered for source/test contract                                 | Covered for source/test contract                     | No change                                                                                                                                     | Runtime variants still require scoped approval                                                         |
| `rejected` route-handler runtime              | Passed with injected local repository                            | Superseded by local PostgreSQL-backed rejected proof | Real application PostgreSQL path was exercised through one synthetic test-owned target setup, one rejected command, and one redacted readback | Second target, second mutation, retry loop, raw scan, and raw row dump                                 |
| Local PostgreSQL target setup/readback        | Approval package ready; earlier attempt blocked on absent target | Passed for one synthetic test-owned target           | One app-level target setup and one rejected formal-adoption command persisted and read back redacted status categories                        | Seed/migration/destructive DB, owner/customer-like data, broad scans                                   |
| `approved` route-handler/formal draft runtime | Source/test-covered only                                         | Source/test-covered only                             | No `approved` route smoke or formal draft creation was executed in this task series                                                           | Fresh approval required before claiming approved DB-backed formal draft creation                       |
| Credentialed browser observation              | Historical adjacent evidence only                                | Still separate                                       | No browser/dev-server/e2e ran in this rollup task or the PostgreSQL smoke task                                                                | Fresh browser/dev-server/e2e plus credential/artifact redaction approval required                      |
| Formal draft/publish boundary                 | Formal publish blocked                                           | Formal publish blocked                               | Rejected path confirmed no formal draft creation                                                                                              | Any `approved` formal draft creation and any publish/student-visible runtime require separate approval |
| Provider/cost/staging gates                   | Blocked                                                          | Blocked                                              | No Provider, Cost Calibration, staging/prod, deploy, payment, OCR/export, or external-service evidence added                                  | Fresh task-specific approval required                                                                  |

## Minimal Layer 2 Closure Path After Refresh

The smallest defensible Layer 2 local closure chain is now:

```text
source/test adopt+reject command contract closed ->
one route-handler rejected smoke passed with injected repository ->
one local PostgreSQL synthetic test-owned rejected setup + command + readback passed ->
owner decides whether optional approved formal-draft or credentialed browser evidence is required ->
formal publish and student-visible runtime stay out of scope unless separately approved
```

## Recommended Next Tasks

| Order         | Proposed task                                                                                               | Purpose                                                                                      | Can run without fresh high-risk execution approval? | Fresh approval required before execution                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| L2-optional-1 | `content-admin-review-adoption-local-postgres-approved-formal-draft-smoke-approval-package-2026-06-27`      | Define a capped `approved` formal-draft route/runtime proof if owner requires it             | Yes, docs/state-only only                           | Execution remains blocked after package                                                                                        |
| L2-optional-2 | `content-admin-review-adoption-credentialed-browser-smoke-approval-package-2026-06-27`                      | Define local browser observation after route/runtime evidence                                | Yes, docs/state-only only                           | Browser/dev-server/e2e, credential handling, DB boundary, and artifact redaction                                               |
| L3-1          | `layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum-2026-06-27` | Refresh Provider, cost, staging/prod, payment, OCR/export, and external-service approval map | Yes, docs/state-only only                           | Provider execution, credential/config reads, Cost Calibration, staging/prod/deploy/payment/OCR/export/external-service actions |
| Queue-1       | `active-queue-nonterminal-closeout-retirement-apply-2026-06-27`                                             | Close or keep already-consolidated nonterminal high-risk packages                            | No                                                  | Fresh docs/state status-change approval                                                                                        |
| Queue-2       | `active-queue-archive-index-apply-after-layer-2-postgres-package-2026-06-27`                                | Move eligible terminal history to archive/index                                              | No                                                  | Fresh archive/index movement approval                                                                                          |

## Queue Quantity Estimate

Latest PostgreSQL smoke evidence recorded:

- `activeQueueNonTerminalCountAfterTask`: 28
- `archiveCandidateCountAfterTask`: 31
- `highRiskRepairBlockedCountAfterTask`: 0

Estimated remaining work after this refresh:

| Goal slice                                                                     | Estimated tasks | Notes                                                                                                                                                     |
| ------------------------------------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal Layer 2 closure if rejected PostgreSQL proof is accepted as sufficient | 0-2 tasks       | Optional owner decision rollup and optional credentialed browser/package evidence; no Provider or release claim                                           |
| Minimal Layer 2 closure with approved formal-draft and browser strengthening   | 4-6 tasks       | Approved smoke package/execution, browser package/execution, closure rollup, optional publish-boundary decision                                           |
| Minimal three-layer closure with selected Layer 3 gates                        | 6-10 tasks      | Layer 3 matrix refresh, Provider smoke package/execution, cost package/execution or decision, pre-release/staging package, and blocked-gate rollup        |
| Clear or retire all related high-risk package noise without executing gates    | 2-4 tasks       | Nonterminal closeout/status package and archive/index package/execution; archive/index movement still needs fresh approval                                |
| Execute or explicitly close every related high-risk gate conservatively        | 8-14 tasks      | Provider, Cost Calibration, staging/prod, payment, OCR, export, deploy, and external-service rows should remain split by gate and fresh approval boundary |

These are estimates, not execution authorization.

## Copyable Next Approval Text

### A. Layer 3 Provider/Cost/Pre-Release Matrix Refresh

```text
我 fresh approve 一个 docs/state-only Layer 3 Provider/cost/pre-release approval matrix refresh 任务：
layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许基于最新 Layer 2 local
PostgreSQL test-owned rejected route/runtime smoke 证据刷新 Provider smoke、Cost Calibration、staging/prod、deploy、
payment、OCR、export、external-service 的审批矩阵、串行顺序、blocked gate 和后续复制审批文本。
不批准浏览器/dev-server/e2e、DB 连接或读写、凭据读取、Provider call/configuration、Cost Calibration 执行、真实
mutation、formal publish、student-visible runtime、staging/prod/deploy/payment external service、OCR/export 执行、
archive/index movement、PR、force push、release readiness 或 final Pass。
```

### B. Optional Layer 2 Approved Formal-Draft Smoke Package

```text
我 fresh approve 一个 docs/state-only Layer 2 approved formal-draft route smoke 审批包任务：
content-admin-review-adoption-local-postgres-approved-formal-draft-smoke-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义一个 test-owned
content_admin generated-result review target 的 `approved` route/service command、单次 mutation cap、DB read/write 边界、
rollback/recovery、formal draft redaction 状态分类和后续执行审批文本。
不批准浏览器/dev-server/e2e、DB 连接或读写、真实 mutation、凭据读取或输出、Provider、Cost Calibration、
formal publish、student-visible runtime、staging/prod/deploy/payment external service、OCR/export、archive/index movement、
PR、force push、release readiness 或 final Pass。
```

### C. Optional Layer 2 Credentialed Browser Smoke Package

```text
我 fresh approve 一个 docs/state-only Layer 2 credentialed browser smoke 审批包任务：
content-admin-review-adoption-credentialed-browser-smoke-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 localhost 浏览器观察范围、
test account/credential handling、single mutation/readback cap、browser artifact redaction、DB boundary、rollback/recovery
策略和后续执行审批文本。
不批准实际浏览器/dev-server/e2e、DB 连接或读写、凭据读取或输出、Provider、Cost Calibration、formal publish、
student-visible runtime、staging/prod/deploy/payment external service、OCR/export、archive/index movement、PR、force push、
release readiness 或 final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, migration, seed, rollback, destructive operation, broad scan, raw row dump, or runtime
  mutation was run by this rollup task.
- No credential, token, `.env*`, Authorization header, Provider payload, raw prompt, or raw generated output was read.
- No Provider call/configuration or Cost Calibration was executed.
- No formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export, archive/index
  movement, PR, force push, release readiness, production readiness, final Pass, or Layer 3 readiness is claimed.
