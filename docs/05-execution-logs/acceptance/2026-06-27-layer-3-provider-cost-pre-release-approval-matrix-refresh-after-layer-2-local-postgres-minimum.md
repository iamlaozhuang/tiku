# Layer 3 Provider Cost Pre-Release Approval Matrix Refresh After Layer 2 Local PostgreSQL Minimum Acceptance

Task id:
`layer-3-provider-cost-pre-release-approval-matrix-refresh-after-layer-2-local-postgres-minimum-2026-06-27`

Decision: `LAYER_3_PROVIDER_COST_PRE_RELEASE_MATRIX_REFRESHED_EXECUTION_GATES_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This acceptance refresh updates the Layer 3 approval matrix after
`layer-2-business-closure-evidence-rollup-refresh-after-postgres-test-owned-target-smoke-2026-06-27`.

This task is docs/state-only. It does not run browser, dev-server, e2e, DB, Provider, Cost Calibration, real adoption or
retry mutation, formal publish, student-visible runtime, staging/prod/deploy/payment, external service, OCR/export,
archive/index movement, PR, force push, release readiness, or final Pass.

## Refreshed Three-Layer Status

| Layer                                  | Refreshed status                                                                                                                                                 | Evidence basis                                                                                                                        | Remaining gate                                                                                                                                                                  |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission          | Complete for the existing local role/entry/permission no-regression boundary                                                                                     | Prior Layer 1 acceptance and no role/entry/source/runtime changes in this task                                                        | Future role, route, auth, UI, or browser changes must preserve this boundary                                                                                                    |
| Layer 2 business function loop         | Minimum local PostgreSQL `rejected` review-command slice is rolled up: test-owned target setup, one rejected route/service command, and redacted readback passed | Source/test command contract, injected route smoke, approval package, and local PostgreSQL test-owned target setup execution evidence | Optional `approved` formal-draft path, credentialed browser observation, formal publish, and student-visible runtime remain separate owner decisions                            |
| Layer 3 real Provider/cost/pre-release | Blocked; matrix refreshed only                                                                                                                                   | ADR-004/005 environment boundaries, ADR-006 Provider boundary, high-risk consolidation ledger, and Cost Calibration blocked gate      | Fresh approval required for Provider smoke, Provider config/credentials, Cost Calibration, staging/prod, deploy, payment, OCR/export, and external-service execution or changes |

## Layer 3 Approval Matrix

| Gate                                       | Current status                                                 | Serial order                                 | Fresh approval must specify                                                                                                                                                    | Still blocked in this task                                                                  |
| ------------------------------------------ | -------------------------------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| Provider smoke execution                   | `blocked_pending_fresh_provider_execution_approval`            | First Layer 3 execution gate                 | Provider/model, credential alias, secret handling without value disclosure, call cap, retry cap, token cap, spend cap, redacted evidence fields, stop conditions               | Provider call, retry, Provider payload, credential read, Provider configuration             |
| Provider configuration and credential read | `blocked_pending_fresh_env_secret_configuration_approval`      | Before or inside a future Provider task      | Which config may be used, whether app-level runtime resolution is allowed, which secrets remain opaque, who owns remediation, and what evidence must prove no value disclosure | `.env*` read/output/copy, secret/token/DB URL logging, config mutation                      |
| Cost Calibration                           | `blocked_pending_fresh_cost_calibration_approval`              | After Provider scope is approved or deferred | Pricing source/date, provider/model, workflow sample set, sample size, max call count, retry/token/spend caps, quota ledger, redacted `ai_call_log`/cost summary policy        | Cost measurement, sample AI task measurement, paid load, production quota or point defaults |
| staging preview                            | `blocked_pending_fresh_staging_approval`                       | After Provider and cost decision             | Isolated staging DB/storage/auth/secret/provider resources, deploy target, rollback target, monitoring owner, allowed accounts/data, no prod data unless separately approved   | staging resource changes, public URL, TLS, deploy, Provider staging execution               |
| prod/deploy                                | `blocked_pending_fresh_prod_deploy_approval`                   | After staging evidence and owner decision    | Production target, rollback owner, release window, monitoring/incident route, data boundary, final included/excluded gates, explicit residual-risk acceptance                  | prod deploy, release readiness, production readiness, final Pass                            |
| payment/external service                   | `blocked_pending_fresh_payment_external_service_approval`      | Separate product-scope gate                  | Payment provider, sandbox/real boundary, callbacks, env/deploy boundary, refund/invoice/settlement/reconciliation policy, evidence redaction                                   | Payment provider calls, callbacks, settlement/reconciliation, external service integration  |
| OCR execution                              | `blocked_pending_fresh_ocr_execution_approval`                 | Separate product-scope gate                  | OCR provider/parser/storage/schema/dependency plan, import cap, rollback/recovery, redaction of full OCR text and full `paper`/`material` content                              | OCR provider call, OCR import, dependency/schema/storage changes                            |
| Export generation/download                 | `blocked_pending_fresh_export_execution_approval`              | Separate product-scope gate                  | Export format, file generation/download path, privacy/permission/audit boundary, retention, redaction, deploy/external-service decision                                        | Export file generation, download, broad data scan, external delivery                        |
| Release readiness and final Pass           | `blocked_pending_separate_owner_decision_after_selected_gates` | Last, after selected gates have evidence     | Included/excluded gates, accountable owner decision, evidence list, known gaps, residual risk, exact wording of any readiness or Pass claim                                    | Any release readiness, production readiness, or final Pass claim                            |

## Recommended Serial Order

1. Close this docs/state Layer 3 matrix refresh.
2. Optional owner decision: strengthen Layer 2 with `approved` formal-draft proof and/or credentialed browser
   observation.
3. Prepare a docs/state-only Provider smoke execution approval package.
4. Stop for fresh Provider execution approval before any Provider call, credential handling, or configuration use.
5. Roll up Provider smoke evidence if executed.
6. Prepare a Cost Calibration approval package only after Provider scope is approved or explicitly deferred.
7. Stop for fresh Cost Calibration execution approval before measurement.
8. Prepare staging/pre-release package after Provider/cost decision.
9. Keep prod/deploy, payment, OCR, export, and external-service gates split unless the owner gives a narrower product
   decision.
10. Keep release readiness and final Pass blocked until a separate final owner decision.

## Queue Quantity Estimate

Latest Layer 2 rollup evidence recorded:

- `activeQueueNonTerminalCountAfterTask`: 28
- `archiveCandidateCountAfterTask`: 32
- `highRiskRepairBlockedCountAfterTask`: 0

Estimated remaining work after this refresh:

| Goal slice                                                                  | Estimated tasks | Notes                                                                                                                                                  |
| --------------------------------------------------------------------------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Minimal three-layer closure with selected Layer 3 gates                     | 6-10 tasks      | Provider smoke package/execution/rollup, Cost Calibration package/execution or explicit defer, pre-release/staging package, blocked-gate rollup        |
| Provider-only Layer 3 smoke path                                            | 2-3 tasks       | Provider execution approval package, capped redacted execution if approved, evidence rollup                                                            |
| Cost Calibration path                                                       | 2-4 tasks       | Cost package, execution if approved, rollup, optional decision to defer production defaults                                                            |
| staging/prod/deploy pre-release path                                        | 2-4 tasks       | staging package, staging execution if approved, prod/deploy decision package, release-boundary rollup                                                  |
| Payment, OCR, export, or external-service expansion                         | 2-4 tasks each  | Each is product-scope and should stay separate unless owner narrows scope                                                                              |
| Clear or retire all related high-risk package noise without executing gates | 2-4 tasks       | Nonterminal closeout/status apply and archive/index apply remain separate and need fresh approval for status movement or archive/index movement        |
| Execute or explicitly close every related high-risk gate conservatively     | 8-14 tasks      | Provider, Cost Calibration, staging/prod, payment, OCR, export, deploy, external service, and final decision rows should remain split by approval gate |

These are estimates, not execution authorization.

## Copyable Next Approval Text

### A. Provider Smoke Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 3 Provider smoke execution approval package：
layer-3-provider-smoke-local-dev-redacted-execution-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 Provider/model 候选、
credential alias/secret handling 边界、call cap、retry cap、token cap、spend cap、prompt/response/payload redaction
规则、stop conditions、owner escalation 和后续执行审批文本。
不批准浏览器/dev-server/e2e、DB 连接或读写、读取/输出/复制任何 .env* 或 credential 值、Provider call/configuration
执行、Cost Calibration、真实 mutation、formal publish、student-visible runtime、staging/prod/deploy/payment external
service、OCR/export、archive/index movement、PR、force push、release readiness 或 final Pass。
```

### B. Provider Smoke Execution

```text
我 fresh approve 一个 Layer 3 local dev redacted Provider smoke execution 任务：
layer-3-provider-smoke-local-dev-redacted-execution-2026-06-27。
允许按已批准的 Provider smoke execution approval package 执行最多一次 Provider smoke 调用，并只记录 provider/model
标签、pass/fail/blocked、调用计数、重试计数、token/cost 是否在 cap 内、脱敏状态和红线确认。禁止打开、输出、复制、记录
或提交任何 .env* 内容、secret、token、DB URL、Provider credential、raw prompt、raw response、Provider payload、完整
paper/material 内容或私有数据。禁止 DB 连接/读写、浏览器/dev-server/e2e、Cost Calibration、Provider configuration
变更、正式发布、student-visible runtime、staging/prod/deploy/payment external service、OCR/export、PR、force push、
release readiness 或 final Pass。
```

### C. Cost Calibration Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 3 Cost Calibration approval package：
layer-3-cost-calibration-redacted-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 pricing source/date、
provider/model、workflow sample set、sample size、max call/retry/token/spend caps、quota ledger、redacted ai_call_log/cost
summary policy、stop conditions 和后续执行审批文本。
不批准 Provider call、Cost Calibration 执行、浏览器/dev-server/e2e、DB、凭据读取、Provider configuration、真实
mutation、formal publish、student-visible runtime、staging/prod/deploy/payment external service、OCR/export、
archive/index movement、PR、force push、release readiness 或 final Pass。
```

### D. Staging / Prod / Deploy Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 3 staging/prod/deploy pre-release approval package：
layer-3-staging-prod-deploy-pre-release-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 isolated staging
DB/storage/auth/secret/provider resources、deploy target、rollback owner、monitoring owner、incident route、allowed
accounts/data、no-prod-data boundary、prod/deploy 分离策略、redaction rules 和后续执行审批文本。
不批准实际 staging/prod/deploy、Provider call/configuration、Cost Calibration、DB 连接或读写、凭据读取、payment
external service、OCR/export、PR、force push、release readiness 或 final Pass。
```

### E. Payment / External-Service Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 3 payment/external-service approval package：
layer-3-payment-external-service-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 payment provider、
sandbox/real boundary、callbacks、env/deploy boundary、refund/invoice/settlement/reconciliation policy、external-service
evidence redaction rules 和后续执行审批文本。
不批准实际 payment/external-service 调用、凭据读取、DB、Provider、Cost Calibration、staging/prod/deploy、PR、
force push、release readiness 或 final Pass。
```

### F. OCR / Export Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 3 OCR/export approval package：
layer-3-ocr-export-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 OCR provider/parser/
storage/schema/dependency/import cap、rollback/recovery、export format、file generation/download path、privacy/
permission/audit boundary、retention、redaction rules 和后续执行审批文本。
不批准 OCR/export 执行、OCR provider call、export file generation/download、schema/migration/seed、DB 连接或读写、
凭据读取、Provider、Cost Calibration、staging/prod/deploy/payment external service、PR、force push、release readiness
或 final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, migration, seed, rollback, destructive operation, broad scan, raw row dump, or runtime
  mutation was run by this task.
- No credential, token, `.env*`, Authorization header, Provider payload, raw prompt, or raw generated output was read.
- No Provider call/configuration or Cost Calibration was executed.
- No formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export, archive/index
  movement, PR, force push, release readiness, production readiness, final Pass, or Layer 3 readiness is claimed.
