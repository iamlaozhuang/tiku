# Layer 2 Business Closure Evidence Rollup Refresh After Local Route Smoke Acceptance

Task id: `layer-2-business-closure-evidence-rollup-refresh-after-local-route-smoke-2026-06-27`

Decision: `LAYER_2_ROUTE_SMOKE_ROLLUP_REFRESHED_REAL_DB_BROWSER_PROVIDER_STILL_BLOCKED`

moduleRunVersion: 2

Cost Calibration Gate remains blocked.

## Scope

This acceptance refresh updates the Layer 2 evidence rollup after
`content-admin-review-adoption-local-route-smoke-execution-2026-06-27` passed one focused `rejected` route-handler
runtime smoke using an injected local test repository.

This task is docs/state-only. It does not run browser, dev-server, e2e, DB, Provider, Cost Calibration, real adoption or
retry mutation, formal publish, student-visible runtime, staging/prod/deploy/payment, external service, OCR/export,
archive/index movement, PR, force push, release readiness, or final Pass.

## Refreshed Three-Layer Status

| Layer                                  | Refreshed status                                                                                                                                            | Evidence basis                                                                                      | Remaining gate                                                                                                                                                                                                |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Layer 1 role/entry/permission          | Complete for the existing local role/entry/permission no-regression boundary                                                                                | Prior Layer 1 acceptance and no source/runtime changes in this task                                 | Future role, route, auth, UI, or browser changes must preserve this boundary                                                                                                                                  |
| Layer 2 business function loop         | Stronger partial: source/test adopt/reject command contract is closed, and one `rejected` route-handler runtime smoke passed with injected repository state | Command contract TDD acceptance plus local route smoke execution acceptance                         | Real local PostgreSQL/default runtime path, `.env*`/credential-safe DB handling, credentialed browser observation, `approved` DB-backed readback, formal publish, and student-visible runtime remain separate |
| Layer 3 real Provider/cost/pre-release | Blocked                                                                                                                                                     | High-risk package consolidation ledger, ADR-006 provider boundary, and Cost Calibration blocked SOP | Fresh approval required for each Provider, Cost Calibration, staging/prod, deploy, payment, OCR, export, and external-service gate                                                                            |

## Layer 2 Delta After Local Route Smoke

| Closure row                            | Previous status                           | Refreshed status                      | What changed                                                                                                                                               | Still blocked                                                                                             |
| -------------------------------------- | ----------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Explicit adopt/reject command contract | Covered for source/test contract          | Covered for source/test contract      | No change after this route smoke                                                                                                                           | Runtime DB/browser evidence remains separate                                                              |
| `rejected` route-handler runtime       | Approval package ready; execution blocked | Passed with injected local repository | One focused route-handler invocation accepted `content_admin`, executed `rejected`, preserved standard API envelope, and asserted no formal draft creation | Default PostgreSQL runtime and browser observation                                                        |
| `approved` route-handler runtime       | Source/test-covered only                  | Source/test-covered only              | No `approved` route smoke was executed in this task series                                                                                                 | Fresh execution approval required before claiming approved DB-backed readback or formal draft creation    |
| Real local PostgreSQL route path       | Blocked                                   | Blocked                               | Previous execution stopped correctly because default runtime loads `.env.local` for `DATABASE_URL`                                                         | Fresh approval required for `.env*`/credential-safe local DB handling and one capped DB mutation/readback |
| Credentialed browser observation       | Historical adjacent evidence only         | Still separate                        | No browser/dev-server/e2e ran in this task                                                                                                                 | Fresh browser/dev-server/e2e plus redaction approval required                                             |
| Formal draft/publish boundary          | Formal publish blocked                    | Formal publish blocked                | `rejected` path asserted formal draft adapter was not called                                                                                               | Any `approved` formal draft creation and any publish/student-visible runtime require separate approval    |
| Provider/cost/staging gates            | Blocked                                   | Blocked                               | No Provider or Cost Calibration evidence added                                                                                                             | Fresh task-specific approval required                                                                     |

## Minimal Layer 2 Closure Path After Refresh

The smallest defensible Layer 2 closure chain is now:

```text
source/test adopt+reject contract closed ->
one route-handler rejected smoke passed with injected repository ->
owner chooses whether minimum closure needs real local PostgreSQL-backed read/write and/or credentialed browser observation ->
formal publish and student-visible runtime stay out of scope unless separately approved
```

Recommended next tasks:

| Order | Proposed task                                                                          | Purpose                                                                            | Can run without fresh high-risk execution approval? | Fresh approval required before execution                                                               |
| ----- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| L2-1  | `content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27` | Docs-only package for true local PostgreSQL-backed route smoke and redaction rules | Yes, docs/state-only only                           | Execution remains blocked after package                                                                |
| L2-2  | `content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27`        | Execute one capped DB-backed route/service smoke and one redacted readback         | No                                                  | `.env*`/credential-safe DB handling, one controlled mutation, rollback/recovery, and no raw row output |
| L2-3  | `content-admin-review-adoption-credentialed-browser-smoke-approval-package-2026-06-27` | Docs-only package for local browser observation after route/runtime evidence       | Yes, docs/state-only only                           | Browser execution remains blocked after package                                                        |
| L2-4  | `content-admin-review-adoption-credentialed-browser-smoke-2026-06-27`                  | Observe the content-admin review loop through localhost UI with redacted evidence  | No                                                  | Browser/dev-server/e2e, credential handling, DB boundary, and artifact redaction                       |
| L2-5  | `formal-publish-student-visible-boundary-decision-2026-06-27`                          | Decide whether Layer 2 minimum closure excludes publish/student-visible runtime    | Yes, docs/state-only only                           | Any publish or student-visible runtime execution remains blocked                                       |

## Queue Quantity Estimate

Latest route-smoke evidence recorded:

- `activeQueueNonTerminalCountAfterTask`: 28
- `archiveCandidateCountAfterTask`: 24
- `highRiskRepairBlockedCountAfterTask`: 0

Estimated remaining work after this refresh:

| Goal slice                                                                  | Estimated tasks | Notes                                                                                                                                    |
| --------------------------------------------------------------------------- | --------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Minimal Layer 2 closure if injected route smoke is accepted as sufficient   | 1-3 tasks       | Docs decision, optional UI/browser approval package, and a final Layer 2 closure rollup; still no Layer 3                                |
| Minimal Layer 2 closure with real local PostgreSQL and browser proof        | 4-6 tasks       | PostgreSQL approval package, DB-backed execution, browser approval package, browser execution, closure rollup, optional publish decision |
| Minimal three-layer closure with selected Layer 3 gates                     | 8-13 tasks      | Layer 2 closure plus Provider smoke package/execution, cost package, staging/pre-release package, and blocked-gate rollup                |
| Clear or retire all related high-risk package noise without executing gates | 2-4 tasks       | Package ledger refresh and possible archive/index task; archive/index movement still needs fresh approval                                |
| Execute or explicitly close every related high-risk gate conservatively     | 8-14 tasks      | Provider, Cost Calibration, staging/prod, payment, OCR, export, deploy, and external-service rows should stay one gate per task          |

These are estimates, not execution authorization.

## Copyable Next Approval Text

### A. Docs-Only Local PostgreSQL Route Smoke Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 2 local PostgreSQL route smoke 审批包任务：
content-admin-review-adoption-local-postgres-route-smoke-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义一个 content_admin
generated-result review target 的本地 PostgreSQL-backed route/service smoke test data、单次 mutation cap、DB read/write
边界、`.env*`/credential handling 边界、rollback/recovery 策略、redaction 规则和后续执行审批文本。
不批准浏览器/dev-server/e2e、DB 连接或读写、真实 mutation、凭据值输出或记录、Provider、Cost Calibration、
formal publish、student-visible runtime、staging/prod/deploy/payment/external service、OCR/export、archive/index movement、
PR、force push、release readiness 或 final Pass。
```

### B. Layer 2 Local PostgreSQL-Backed Route Smoke Execution

```text
我 fresh approve 一个 Layer 2 local PostgreSQL-backed route/runtime smoke 执行任务：
content-admin-review-adoption-local-postgres-route-smoke-execution-2026-06-27。
允许在本地 dev 中通过既有 runtime 数据库配置读取 `.env.local` 中的 `DATABASE_URL`，但禁止输出、复制或记录任何
secret、token、DB URL 或凭据值。仅允许对一个 test-owned content_admin generated-result review target 执行一次
`rejected` 或 `approved` route/service command，并进行一次脱敏读回；不得 seed/migration/destructive DB/raw row dump/
broad scan。证据只能记录角色标签、决策、pass/fail、脱敏状态和红线确认。
不批准浏览器/dev-server/e2e、Provider、Cost Calibration、schema/migration/seed/destructive DB、formal publish、
student-visible runtime、staging/prod/deploy/payment/external service、OCR/export、PR、force push、release readiness 或
final Pass。
```

### C. Layer 2 Credentialed Browser Smoke Approval Package

```text
我 fresh approve 一个 docs/state-only Layer 2 credentialed browser smoke 审批包任务：
content-admin-review-adoption-credentialed-browser-smoke-approval-package-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许定义 localhost 浏览器观察范围、
test account/credential handling、single mutation/readback cap、browser artifact redaction、DB boundary、rollback/recovery
策略和后续执行审批文本。
不批准实际浏览器/dev-server/e2e、DB 连接或读写、凭据读取或输出、Provider、Cost Calibration、formal publish、
student-visible runtime、staging/prod/deploy/payment/external service、OCR/export、archive/index movement、PR、force push、
release readiness 或 final Pass。
```

### D. Layer 3 Provider/Cost/Staging Blocked-Gate Refresh

```text
我 fresh approve 一个 docs/state-only Layer 3 Provider/cost/staging blocked-gate refresh 任务：
layer-3-provider-cost-staging-blocked-gate-refresh-2026-06-27。
范围仅 project-state.yaml、task-queue.yaml、task plan/evidence/audit/acceptance 文档。允许基于最新 Layer 2 状态刷新
Provider smoke、Cost Calibration、staging/prod、payment、OCR、export 的审批矩阵和复制文本。
不批准读取 .env 或凭据、不批准 Provider call/configuration、不批准 Cost Calibration 执行、不批准 DB、浏览器/e2e、
deploy、payment/external service、OCR/export 执行、PR、force push、release readiness 或 final Pass。
```

## Explicit Non-Claims

- No source/test/product code changed.
- No browser/dev-server/e2e was run.
- No DB connection, DB read/write, migration, seed, rollback, destructive operation, broad scan, raw row dump, or real
  default PostgreSQL mutation was run.
- No credential, token, `.env*`, Authorization header, Provider payload, raw prompt, or raw generated output was read.
- No Provider call/configuration or Cost Calibration was executed.
- No formal publish, student-visible runtime, staging/prod/deploy/payment external service, OCR/export, archive/index
  movement, PR, force push, release readiness, production readiness, final Pass, or full Layer 2 DB/runtime closure is
  claimed.
